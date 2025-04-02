"use client";

import { Mic, MicOff, Check, ChevronUp, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type Dispatch, type SetStateAction, useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getMediaPermission } from "@/lib/get-media-permission";

interface AudioSelectorProps {
  stream: MediaStream | undefined;
  setStreamAction: Dispatch<SetStateAction<MediaStream | undefined>>;
  isMuted: boolean;
  setIsMutedAction: (isMuted: boolean) => void;
}

export default function AudioSelector({
  stream,
  isMuted,
  setIsMutedAction,
  setStreamAction,
}: AudioSelectorProps) {
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");

  // Get available audio devices
  const { data: devices = [], isLoading: loadingDevices } = useQuery({
    queryKey: ["audioDevices", !!stream],
    queryFn: async () => {
      if (!stream) {
        await getMediaPermission({ audio: true });
      }

      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter(
        (device) => device.kind === "audioinput",
      );

      if (audioInputs.length === 0) {
        return undefined;
      }

      // Set default device if we have devices and none is selected
      if (!selectedDeviceId) {
        setSelectedDeviceId(audioInputs[0].deviceId);
      }

      return audioInputs;
    },
  });

  const { mutate: changeAudioDevice, isPending: changingAudio } = useMutation({
    mutationFn: async (deviceId: string) => {
      setSelectedDeviceId(deviceId);

      if (isMuted) {
        return;
      }

      // Stop current audio tracks
      if (stream) {
        stream.getAudioTracks().forEach((track) => track.stop());
      }

      // Get new stream with selected device
      const newStream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: { exact: deviceId } },
        video: false,
      });

      // Create a combined stream with existing video
      const combinedStream = new MediaStream();

      // Add new audio tracks
      newStream.getAudioTracks().forEach((track) => {
        combinedStream.addTrack(track);
      });

      // Add existing video tracks if they exist
      if (stream) {
        stream.getVideoTracks().forEach((track) => {
          combinedStream.addTrack(track);
        });
      }

      setStreamAction(combinedStream);
    },
  });

  const { mutate: toggleMicrophone, isPending: togglingMicrophone } =
    useMutation({
      mutationFn: async () => {
        if (!isMuted) {
          // Mute audio
          if (stream) {
            stream.getAudioTracks().forEach((track) => {
              track.enabled = false;
            });
          }
          setIsMutedAction(true);
        } else {
          if (stream && stream.getAudioTracks().length > 0) {
            // If we already have audio tracks, just enable them
            stream.getAudioTracks().forEach((track) => {
              track.enabled = true;
            });
            setIsMutedAction(false);
          } else {
            // Otherwise get a new audio stream
            const constraints = {
              audio: selectedDeviceId
                ? { deviceId: { exact: selectedDeviceId } }
                : true,
              video: false,
            };

            const newStream =
              await navigator.mediaDevices.getUserMedia(constraints);

            if (stream) {
              // If we already have a stream with video, keep those tracks
              stream.getVideoTracks().forEach((track) => {
                newStream.addTrack(track);
              });
              // Stop old audio tracks
              stream.getAudioTracks().forEach((track) => track.stop());
            }

            setStreamAction(newStream);
            setIsMutedAction(false);
          }
        }
      },
    });

  // Initialize audio on component mount
  useEffect(() => {
    const initializeAudio = async () => {
      if (!stream || stream.getAudioTracks().length === 0) {
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({
            audio: selectedDeviceId
              ? { deviceId: { exact: selectedDeviceId } }
              : true,
            video: false,
          });

          const newStream = new MediaStream();

          // Add audio tracks from new stream
          audioStream.getAudioTracks().forEach((track) => {
            newStream.addTrack(track);
          });

          // Add existing video tracks if they exist
          if (stream) {
            stream.getVideoTracks().forEach((track) => {
              newStream.addTrack(track);
            });
          }

          setStreamAction(newStream);
          setIsMutedAction(false);
        } catch (error) {
          console.error("Error initializing audio:", error);
        }
      }
    };

    initializeAudio();
  }, [selectedDeviceId, setIsMutedAction, setStreamAction, stream]);

  // Clean up function to stop audio tracks when component unmounts
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getAudioTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const hasMultipleMicrophones = devices.length > 1;
  const isLoading = loadingDevices || changingAudio || togglingMicrophone;

  return (
    <DropdownMenu>
      <div className="relative">
        {/* Microphone button */}
        <button
          onClick={() => toggleMicrophone()}
          className={`w-12 h-12 rounded-full flex items-center justify-center ${
            isMuted && !isLoading
              ? "bg-red-500 text-white"
              : "bg-slate-700 text-white hover:bg-slate-600"
          }`}
          aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
        >
          {isLoading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : isMuted ? (
            <MicOff size={20} />
          ) : (
            <Mic size={20} />
          )}
        </button>

        {/* Microphone selector button - only show if multiple microphones available */}
        {hasMultipleMicrophones && (
          <DropdownMenuTrigger asChild>
            <button
              className="absolute -right-1 -top-1 bg-slate-800 rounded-full w-6 h-6 flex items-center justify-center text-white hover:bg-slate-700"
              aria-label="Select microphone"
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
            onClick={() => changeAudioDevice(device.deviceId)}
            className="flex items-center justify-between"
          >
            <span className="truncate text-base">
              {device.label || `Microphone ${devices.indexOf(device) + 1}`}
            </span>
            {selectedDeviceId === device.deviceId && (
              <Check size={16} className="ml-2 text-blue-300" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
