"use client";

import { useEffect, useRef } from "react";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoDisplayProps {
  isMuted: boolean;
  isCameraOn: boolean;
  participants: {
    id: string;
    name: string;
    isSelf: boolean;
    stream: MediaStream | undefined;
    isSpeaking: boolean;
  }[];
}

export default function VideoDisplay({ isMuted, participants, isCameraOn }: VideoDisplayProps) {
  const videoRefs = useRef<Map<string, HTMLVideoElement | null>>(new Map());

  // Set up video streams
  useEffect(() => {
    participants.forEach((participant) => {
      const videoElement = videoRefs.current.get(participant.id);
      if (videoElement && participant.stream) {
        videoElement.srcObject = participant.stream;
        // Apply mirror effect for self-view only
        if (participant.isSelf) {
          videoElement.style.transform = "scaleX(-1)";
        } else {
          videoElement.style.transform = "scaleX(1)";
        }
      }
    });
  }, [participants]);

  return (
    <div className="relative w-full h-full bg-slate-900 p-4 flex items-center justify-center">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {participants.map((participant) => (
          <div
            key={participant.id}
            className={cn(
              "relative aspect-video bg-slate-800 rounded-lg overflow-hidden z-50",
              participant.isSpeaking && "ring-3 ring-blue-300 ring-offset-4 ring-offset-slate-900",
            )}
          >
            {/* Show avatar when no video */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-slate-700 rounded-full p-8">
                <User size={60} className="text-slate-400" />
              </div>
            </div>

            {/* Video element */}
            {participant.stream && participant.isSelf && isCameraOn && (
              <video
                ref={(el) => {
                  videoRefs.current.set(participant.id, el);
                }}
                className={`relative z-40 w-full h-full object-cover`}
                autoPlay
                playsInline
                muted={participant.isSelf}
              />
            )}

            {/* User name label */}
            <div className="absolute z-50 bottom-4 left-4 bg-slate-950/50 text-white px-3 py-1 rounded-md">
              {participant.name}
            </div>

            {/* Muted indicator - only show for self */}
            {participant.isSelf && isMuted && (
              <div className="absolute z-50 top-4 right-4 bg-red-500 text-white px-2 py-1 rounded-full text-sm font-semibold">
                Muted
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
