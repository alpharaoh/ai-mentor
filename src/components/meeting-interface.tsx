"use client";

import { AnimatePresence } from "framer-motion";
import { Loader2, PhoneCall, PhoneOff } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import AudioSelector from "@/components/audio-selector";
import ToggleChat from "@/components/toggle-chat";

import { useIsSpeaking } from "@/hooks/use-is-speaking";

import CameraSelector from "./camera-selector";
import ChatPanel from "./chat-panel";
import ControlBar from "./control-bar";
import VideoDisplay from "./video-display";
import { UltravoxSession, UltravoxSessionStatus } from "ultravox-client";
import { useMutation } from "@tanstack/react-query";

export default function MeetingInterface() {
  const [stream, setStream] = useState<MediaStream>();
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isCameraOn, setIsCameraOn] = useState<boolean>(false);
  const [isMentorSpeaking, setIsMentorSpeaking] = useState<boolean>(false);
  const [session, setSession] = useState<UltravoxSession>();

  const isSpeaking = useIsSpeaking(stream);

  useEffect(() => {
    setSession(new UltravoxSession());
  }, []);

  const { mutate: createCall, status } = useMutation({
    mutationFn: async () => {
      const agentCall = await fetch("/api/call", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const agentCallData = await agentCall.json();

      session?.joinCall(agentCallData.joinUrl);

      return null;
    },
    retry: false,
  });

  useEffect(() => {
    if (status === "idle") {
      createCall();
    }
  }, [createCall, status]);

  useEffect(() => {
    if (!session) return;

    const handleStatusChange = () => {
      setIsMentorSpeaking(session.status === UltravoxSessionStatus.SPEAKING);
    };

    session.addEventListener("status", handleStatusChange);

    return () => {
      session.removeEventListener("status", handleStatusChange);
    };
  }, [session]);

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
        isSpeaking: isMentorSpeaking,
        stream: undefined,
      },
    ],
    [stream, isSpeaking, isMentorSpeaking],
  );

  const endCall = useCallback(() => {
    session?.leaveCall();
  }, [session]);

  return (
    <div className="relative w-full h-screen flex bg-slate-900">
      <div className={`flex-1 transition-all duration-300 ${isChatOpen ? "pr-0 sm:pr-96" : ""}`}>
        <VideoDisplay isMuted={isMuted} participants={participants} isCameraOn={isCameraOn} />
      </div>

      <AnimatePresence>{isChatOpen && <ChatPanel />}</AnimatePresence>

      <ControlBar>
        <AudioSelector stream={stream} setStreamAction={setStream} isMuted={isMuted} setIsMutedAction={setIsMuted} />

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
          {session?.status === UltravoxSessionStatus.DISCONNECTED ? (
            <PhoneCall size={20} />
          ) : session?.status === UltravoxSessionStatus.DISCONNECTING ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <PhoneOff size={20} />
          )}
        </button>

        <ToggleChat isChatOpen={isChatOpen} setChatOpenAction={setIsChatOpen} />
      </ControlBar>
    </div>
  );
}
