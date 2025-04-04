"use client";

import { Camera, CameraOff, Check, ChevronUp, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type Dispatch, type SetStateAction, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useMediaDevices } from "@/hooks/use-media-devices";

interface CameraSelectorProps {
  stream: MediaStream | undefined;
  setStreamAction: Dispatch<SetStateAction<MediaStream | undefined>>;
  isMuted: boolean;
  isCameraOn: boolean;
  setIsCameraOnAction: (isMuted: boolean) => void;
}

export default function CameraSelector({
  stream,
  isMuted,
  isCameraOn,
  setIsCameraOnAction,
  setStreamAction,
}: CameraSelectorProps) {
  const { devices, selectedDeviceId, setSelectedDeviceId, loadingDevices } = useMediaDevices("videoinput", stream);

  const { mutate: changeCamera, isPending: changingCamera } = useMutation({
    mutationFn: async (deviceId: string) => {
      setSelectedDeviceId(deviceId);

      if (!isCameraOn) {
        return;
      }

      // Stop current video tracks
      if (stream) {
        stream.getVideoTracks().forEach((track) => track.stop());
      }

      // Get new stream with selected device
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceId } },
        audio: false,
      });

      // Create a combined stream with existing audio
      const combinedStream = new MediaStream();

      // Add new video tracks
      newStream.getVideoTracks().forEach((track) => {
        combinedStream.addTrack(track);
      });

      // Add existing audio tracks if they exist
      if (stream) {
        stream.getAudioTracks().forEach((track) => {
          combinedStream.addTrack(track);
        });
      }

      setStreamAction(combinedStream);
    },
  });

  const { mutate: toggleCamera, isPending: togglingCamera } = useMutation({
    mutationFn: async () => {
      if (isCameraOn && stream) {
        // Turn off camera
        stream.getVideoTracks().forEach((track) => track.stop());

        setStreamAction((prevStream) => {
          if (prevStream) {
            // Create a new stream with just audio tracks
            const audioTracks = prevStream.getAudioTracks();
            if (audioTracks.length > 0) {
              return new MediaStream(audioTracks);
            }
          }
          return undefined;
        });

        setIsCameraOnAction(false);
      } else {
        const constraints = {
          video: selectedDeviceId ? { deviceId: { exact: selectedDeviceId } } : true,
          audio: !isMuted, // Ensure audio is correctly requested
        };

        const newStream = await navigator.mediaDevices.getUserMedia(constraints);

        setStreamAction((prevStream) => {
          if (prevStream) {
            // Merge new video stream with existing audio tracks
            prevStream.getAudioTracks().forEach((track) => newStream.addTrack(track));
            // Stop old video tracks to avoid conflicts
            prevStream.getVideoTracks().forEach((track) => track.stop());
          }
          return newStream;
        });

        setIsCameraOnAction(true);
      }
    },
  });

  // Clean up function to stop all tracks when component unmounts
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const hasMultipleCameras = devices.length > 1;
  const isLoading = loadingDevices || changingCamera || togglingCamera;
  return (
    <DropdownMenu>
      <div className="relative">
        {/* Camera button */}
        <button
          onClick={() => toggleCamera()}
          className={`w-12 h-12 rounded-full flex items-center justify-center ${
            !isCameraOn && !isLoading ? "bg-red-500 text-white" : "bg-slate-700 text-white hover:bg-slate-600"
          }`}
          aria-label={isCameraOn ? "Turn off camera" : "Turn on camera"}
        >
          {isLoading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : isCameraOn ? (
            <Camera size={20} />
          ) : (
            <CameraOff size={20} />
          )}
        </button>

        {/* Camera selector button - only show if camera is on and multiple cameras available */}
        {isCameraOn && hasMultipleCameras && (
          <DropdownMenuTrigger asChild>
            <button
              className="absolute -right-1 -top-1 bg-slate-800 rounded-full w-6 h-6 flex items-center justify-center text-white hover:bg-slate-700"
              aria-label="Select camera"
            >
              <ChevronUp size={14} />
            </button>
          </DropdownMenuTrigger>
        )}
      </div>
      <DropdownMenuContent className="w-56 dark">
        {devices.map((device) => (
          <DropdownMenuItem
            key={device.deviceId}
            onClick={() => changeCamera(device.deviceId)}
            className="flex items-center justify-between"
          >
            <span className="truncate text-base">{device.label || `Camera ${devices.indexOf(device) + 1}`}</span>
            {selectedDeviceId === device.deviceId && <Check size={16} className="ml-2 text-blue-300" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
