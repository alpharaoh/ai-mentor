"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Role, Transcript } from "ultravox-client";
import { MessagesSquare } from "lucide-react";

interface ChatPanelProps {
  transcripts: Transcript[];
}

export default function ChatPanel({ transcripts }: ChatPanelProps) {
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [transcripts]);

  return (
    <motion.div
      className="z-50 absolute right-4 top-4 bottom-24 w-80 sm:w-96 bg-white rounded-lg shadow-lg flex flex-col border border-slate-200 overflow-hidden"
      initial={{ x: 640 }}
      animate={{ x: 0 }}
      exit={{ x: 640 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="p-5 border-b border-slate-200">
        <h2 className="text-lg font-medium flex items-center gap-3">
          <MessagesSquare size={20} />
          Meeting transcript
        </h2>
      </div>

      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-5 space-y-4">
        {transcripts.length === 0 ? (
          <div className="flex flex-col items-center justify-center">
            <p className="text-center text-gray-500">Talk to the mentor to get started</p>
          </div>
        ) : (
          transcripts.map((message, idx) => (
            <div key={idx} className="flex flex-col">
              <div className="flex items-baseline">
                <span className="font-medium mr-2">{message.speaker === Role.USER ? "You" : "Mentor"}</span>
              </div>
              <p className="mt-1">{message.text}</p>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}
