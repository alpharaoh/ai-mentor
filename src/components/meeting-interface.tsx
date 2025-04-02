"use client";

import { useState } from "react";
import VideoDisplay from "./video-display";
import ControlBar from "./control-bar";
import ChatPanel from "./chat-panel";
import CameraSelector from "./camera-selector";
import { MessageSquare, Mic, MicOff, PhoneOff } from "lucide-react";

export default function MeetingInterface() {
  const [stream, setStream] = useState<MediaStream>();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);

  const participants = [
    { id: "you", name: "You", isSelf: true, stream: null },
    { id: "mentor", name: "Mentor", isSelf: false, stream: null },
  ];

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

      <ControlBar>
        <button
          onClick={toggleMute}
          className={`w-12 h-12 rounded-full flex items-center justify-center ${
            isMuted
              ? "bg-red-500 text-white"
              : "bg-gray-700 text-white hover:bg-gray-600"
          }`}
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
        </button>

        <CameraSelector
          isMuted={isMuted}
          isCameraOn={isCameraOn}
          stream={stream}
          setStreamAction={setStream}
          setIsCameraOnAction={setIsCameraOn}
        />

        {/* End call button */}
        <button
          onClick={endCall}
          className="w-16 h-12 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700"
          aria-label="End call"
        >
          <PhoneOff size={20} />
        </button>

        {/* Chat button */}
        <button
          onClick={toggleChat}
          className={`w-12 h-12 rounded-full flex items-center justify-center ${
            isChatOpen
              ? "bg-blue-500 text-white"
              : "bg-gray-700 text-white hover:bg-gray-600"
          }`}
          aria-label={isChatOpen ? "Close chat" : "Open chat"}
        >
          <MessageSquare size={20} />
        </button>
      </ControlBar>
    </div>
  );
}
