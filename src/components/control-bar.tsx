"use client";

import {
  Mic,
  MicOff,
  MessageSquare,
  PhoneOff,
  Camera,
  CameraOff,
  ChevronUp,
} from "lucide-react";

interface ControlBarProps {
  isMuted: boolean;
  isChatOpen: boolean;
  isCameraOn: boolean;
  hasMultipleCameras: boolean;
  onToggleMute: () => void;
  onToggleChat: () => void;
  onToggleCamera: () => void;
  onToggleCameraSelector: () => void;
  onEndCall: () => void;
}

export default function ControlBar({
  isMuted,
  isChatOpen,
  isCameraOn,
  hasMultipleCameras,
  onToggleMute,
  onToggleChat,
  onToggleCamera,
  onToggleCameraSelector,
  onEndCall,
}: ControlBarProps) {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-20 bg-gray-900 flex items-center justify-center">
      <div className="flex space-x-4">
        {/* Mute button */}
        <button
          onClick={onToggleMute}
          className={`w-12 h-12 rounded-full flex items-center justify-center ${
            isMuted
              ? "bg-red-500 text-white"
              : "bg-gray-700 text-white hover:bg-gray-600"
          }`}
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
        </button>

        {/* Camera button with selector */}
        <div className="relative">
          <button
            onClick={onToggleCamera}
            className={`w-12 h-12 rounded-full flex items-center justify-center ${
              !isCameraOn
                ? "bg-red-500 text-white"
                : "bg-gray-700 text-white hover:bg-gray-600"
            }`}
            aria-label={isCameraOn ? "Turn off camera" : "Turn on camera"}
          >
            {isCameraOn ? <Camera size={20} /> : <CameraOff size={20} />}
          </button>

          {/* Camera selector button - only show if camera is on and multiple cameras available */}
          {isCameraOn && hasMultipleCameras && (
            <button
              onClick={onToggleCameraSelector}
              className="absolute -right-1 -top-1 bg-gray-800 rounded-full w-6 h-6 flex items-center justify-center text-white hover:bg-gray-700"
              aria-label="Select camera"
            >
              <ChevronUp size={14} />
            </button>
          )}
        </div>

        {/* End call button */}
        <button
          onClick={onEndCall}
          className="w-16 h-12 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700"
          aria-label="End call"
        >
          <PhoneOff size={20} />
        </button>

        {/* Chat button */}
        <button
          onClick={onToggleChat}
          className={`w-12 h-12 rounded-full flex items-center justify-center ${
            isChatOpen
              ? "bg-blue-500 text-white"
              : "bg-gray-700 text-white hover:bg-gray-600"
          }`}
          aria-label={isChatOpen ? "Close chat" : "Open chat"}
        >
          <MessageSquare size={20} />
        </button>
      </div>
    </div>
  );
}
