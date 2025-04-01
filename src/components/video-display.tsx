"use client";

import { useEffect, useRef } from "react";
import { User } from "lucide-react";

interface VideoDisplayProps {
  isMuted: boolean;
  isCameraOn?: boolean;
  participants: {
    id: string;
    name: string;
    isSelf: boolean;
    stream: MediaStream | null;
  }[];
}

export default function VideoDisplay({
  isMuted,
  participants,
  isCameraOn = false,
}: VideoDisplayProps) {
  const videoRefs = useRef<Map<string, HTMLVideoElement | null>>(new Map());

  // Set up video streams
  useEffect(() => {
    participants.forEach((participant) => {
      const videoElement = videoRefs.current.get(participant.id);
      if (videoElement && participant.stream) {
        videoElement.srcObject = participant.stream;
      }
    });
  }, [participants]);

  return (
    <div className="relative w-full h-full bg-gray-900 p-4 flex items-center justify-center">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-5xl">
        {participants.map((participant) => (
          <div
            key={participant.id}
            className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden"
          >
            {/* Show avatar when no video */}
            {(!participant.stream || (participant.isSelf && !isCameraOn)) && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-gray-700 rounded-full p-8">
                  <User size={60} className="text-gray-400" />
                </div>
              </div>
            )}

            {/* Video element */}
            <video
              ref={(el) => videoRefs.current.set(participant.id, el)}
              className={`w-full h-full object-cover ${!participant.stream || (participant.isSelf && !isCameraOn) ? "hidden" : ""}`}
              autoPlay
              playsInline
              muted={participant.isSelf}
            />

            {/* User name label */}
            <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-md">
              {participant.name}
            </div>

            {/* Muted indicator - only show for self */}
            {participant.isSelf && isMuted && (
              <div className="absolute top-4 right-4 bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                Muted
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
