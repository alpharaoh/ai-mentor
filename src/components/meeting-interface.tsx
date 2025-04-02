"use client";

import { useCallback, useMemo, useState } from "react";
import VideoDisplay from "./video-display";
import ControlBar from "./control-bar";
import ChatPanel from "./chat-panel";
import CameraSelector from "./camera-selector";
import { MessageSquare, PhoneOff } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import AudioSelector from "@/components/audio-selector";
import { useIsSpeaking } from "@/hooks/use-is-speaking";

export default function MeetingInterface() {
  const [stream, setStream] = useState<MediaStream>();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const isSpeaking = useIsSpeaking(stream);

  const participants = useMemo(
    () => [
      {
        id: "you",
        name: "You",
        isSelf: true,
        isSpeaking: isSpeaking,
        stream: stream,
      },
      {
        id: "mentor",
        name: "Mentor",
        isSelf: false,
        isSpeaking: false,
        stream: undefined,
      },
    ],
    [stream, isSpeaking],
  );

  const toggleChat = useCallback(() => {
    setIsChatOpen((isChatOpen) => !isChatOpen);
  }, []);

  const endCall = useCallback(() => {
    alert("Call ended");
  }, []);

  return (
    <div className="relative w-full h-screen flex bg-slate-900">
      <div
        className={`flex-1 transition-all duration-300 ${isChatOpen ? "pr-0 sm:pr-96" : ""}`}
      >
        <VideoDisplay
          isMuted={isMuted}
          participants={participants}
          isCameraOn={isCameraOn}
        />
      </div>

      <AnimatePresence>{isChatOpen && <ChatPanel />}</AnimatePresence>

      <ControlBar>
        <AudioSelector
          stream={stream}
          setStreamAction={setStream}
          isMuted={isMuted}
          setIsMutedAction={setIsMuted}
        />

        <CameraSelector
          isMuted={isMuted}
          isCameraOn={isCameraOn}
          stream={stream}
          setStreamAction={setStream}
          setIsCameraOnAction={setIsCameraOn}
        />

        <button
          onClick={endCall}
          className="w-16 h-12 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700"
          aria-label="End call"
        >
          <PhoneOff size={20} />
        </button>

        <button
          onClick={toggleChat}
          className={`w-12 h-12 rounded-full flex items-center justify-center ${
            isChatOpen
              ? "bg-blue-500 text-white"
              : "bg-slate-700 text-white hover:bg-slate-600"
          }`}
          aria-label={isChatOpen ? "Close chat" : "Open chat"}
        >
          <MessageSquare size={20} />
        </button>
      </ControlBar>
    </div>
  );
}
