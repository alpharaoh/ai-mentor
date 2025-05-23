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
import { toast } from "sonner";

export default function MeetingInterface() {
  const [stream, setStream] = useState<MediaStream>();
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isCameraOn, setIsCameraOn] = useState<boolean>(false);
  const [isMentorSpeaking, setIsMentorSpeaking] = useState<boolean>(false);
  const [session, setSession] = useState<UltravoxSession>();
  const [callStarted, setCallStarted] = useState<boolean>(false);

  const isSpeaking = useIsSpeaking(stream);

  useEffect(() => {
    setSession(new UltravoxSession());
  }, []);

  const { mutate: createCall, status: createCallStatus } = useMutation({
    mutationFn: async () => {
      const agentCall = await fetch("/api/create_call", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const agentCallData = await agentCall.json();

      if (agentCallData.message === "Unavailable") {
        toast.error("You have reached the maximum number of calls. Please try again later.");
        return null;
      }

      session?.joinCall(agentCallData.joinUrl);
      setCallStarted(true);

      return null;
    },
    onError: () => {
      toast.error("Error joining call");
    },
    retry: false,
  });

  const { mutate: analyseCall, status: analyseCallStatus } = useMutation({
    mutationFn: async () => {
      const analyseCall = await fetch("/api/analyze_call", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transcripts: session?.transcripts ?? [],
        }),
      });

      if (!analyseCall.ok) {
        toast.error("Something went wrong. Please try again later.");
        return null;
      }

      toast.success("Call ended successfully.");
    },
    onError: () => {
      toast.error("Error analyzing call");
    },
    retry: false,
  });

  useEffect(() => {
    if (createCallStatus === "idle") {
      createCall();
    }
  }, [createCall, createCallStatus]);

  const handleCallEnded = useCallback(() => {
    analyseCall();
  }, [analyseCall]);

  useEffect(() => {
    if (!session) return;

    const handleStatusChange = () => {
      setIsMentorSpeaking(session.status === UltravoxSessionStatus.SPEAKING);

      const isDisconnected =
        session.status === UltravoxSessionStatus.DISCONNECTED || session.status === UltravoxSessionStatus.DISCONNECTING;
      if (isDisconnected && callStarted && analyseCallStatus === "idle") {
        handleCallEnded();
      }
    };

    session.addEventListener("status", handleStatusChange);

    return () => {
      session.removeEventListener("status", handleStatusChange);
    };
  }, [session, callStarted, handleCallEnded, analyseCallStatus]);

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
    <div className="relative w-full h-dvh flex bg-slate-900">
      <div className={`flex-1 transition-all duration-300 ${isChatOpen ? "pr-0 sm:pr-100" : ""}`}>
        <VideoDisplay isMuted={isMuted} participants={participants} isCameraOn={isCameraOn} />
      </div>

      <AnimatePresence>{isChatOpen && <ChatPanel transcripts={session?.transcripts ?? []} />}</AnimatePresence>

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
