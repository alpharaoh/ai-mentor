"use client";

import { useState, useEffect } from "react";
import VideoDisplay from "./video-display";
import ControlBar from "./control-bar";
import ChatPanel from "./chat-panel";
import CameraSelector from "./camera-selector";

export default function MeetingInterface() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [showCameraSelector, setShowCameraSelector] = useState(false);

  const participants = [
    { id: "you", name: "You", isSelf: true, stream: stream },
    { id: "mentor", name: "Mentor", isSelf: false, stream: null },
  ];

  // Get available video devices
  useEffect(() => {
    async function getDevices() {
      try {
        // We need to get permission first to see device labels
        if (!stream) {
          const tempStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
          tempStream.getTracks().forEach((track) => track.stop());
        }

        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter(
          (device) => device.kind === "videoinput",
        );
        setVideoDevices(videoInputs);

        // Set default device if we have devices and none is selected
        if (videoInputs.length > 0 && !selectedDeviceId) {
          setSelectedDeviceId(videoInputs[0].deviceId);
        }
      } catch (error) {
        console.error("Error enumerating devices:", error);
      }
    }

    getDevices();
  }, [stream, selectedDeviceId]);

  // Clean up function to stop all tracks when component unmounts
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);

    if (stream) {
      stream.getAudioTracks().forEach((track) => {
        track.enabled = !isMuted;
      });
    }
  };

  const toggleCamera = async () => {
    if (isCameraOn && stream) {
      // Turn off camera
      stream.getVideoTracks().forEach((track) => track.stop());
      setStream((prevStream) => {
        if (prevStream) {
          const audioTracks = prevStream.getAudioTracks();
          const newStream = new MediaStream();
          audioTracks.forEach((track) => newStream.addTrack(track));
          return newStream;
        }
        return null;
      });
      setIsCameraOn(false);
      setShowCameraSelector(false);
    } else {
      // Turn on camera
      try {
        const constraints = {
          video: selectedDeviceId
            ? { deviceId: { exact: selectedDeviceId } }
            : true,
          audio: !isMuted,
        };

        const newStream =
          await navigator.mediaDevices.getUserMedia(constraints);

        if (stream) {
          // If we already have a stream with audio, keep those tracks
          stream.getAudioTracks().forEach((track) => {
            newStream.addTrack(track);
          });
          // Stop old video tracks
          stream.getVideoTracks().forEach((track) => track.stop());
        }

        setStream(newStream);
        setIsCameraOn(true);
      } catch (error) {
        console.error("Error accessing camera:", error);
        alert("Could not access camera. Please check permissions.");
      }
    }
  };

  const changeCamera = async (deviceId: string) => {
    setSelectedDeviceId(deviceId);

    if (isCameraOn) {
      try {
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

        setStream(combinedStream);
      } catch (error) {
        console.error("Error changing camera:", error);
        alert("Could not switch camera. Please try again.");
      }
    }
  };

  const toggleCameraSelector = () => {
    setShowCameraSelector(!showCameraSelector);
  };

  const endCall = () => {
    alert("Call ended");
  };

  return (
    <div className="relative w-full h-screen flex">
      <div
        className={`flex-1 transition-all duration-300 ${isChatOpen ? "pr-80" : ""}`}
      >
        <VideoDisplay
          isMuted={isMuted}
          participants={participants}
          isCameraOn={isCameraOn}
        />
      </div>

      {isChatOpen && <ChatPanel />}

      {showCameraSelector && isCameraOn && (
        <CameraSelector
          devices={videoDevices}
          selectedDeviceId={selectedDeviceId}
          onSelectDevice={changeCamera}
          onClose={() => setShowCameraSelector(false)}
        />
      )}

      <ControlBar
        isMuted={isMuted}
        isChatOpen={isChatOpen}
        isCameraOn={isCameraOn}
        onToggleMute={toggleMute}
        onToggleChat={toggleChat}
        onToggleCamera={toggleCamera}
        onToggleCameraSelector={toggleCameraSelector}
        onEndCall={endCall}
        hasMultipleCameras={videoDevices.length > 1}
      />
    </div>
  );
}
