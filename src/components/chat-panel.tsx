"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface Message {
  id: number;
  text: string;
  sender: "You" | "System" | "Mentor";
  timestamp: Date;
}

export default function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Welcome to the meeting!",
      sender: "System",
      timestamp: new Date(),
    },
    {
      id: 2,
      text: "Hi there! I'm your mentor for today. How can I help you?",
      sender: "Mentor",
      timestamp: new Date(Date.now() - 60000), // 1 minute ago
    },
  ]);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <motion.div
      className="absolute right-4 top-4 bottom-24 w-80 sm:w-96 bg-white rounded-lg shadow-lg flex flex-col border border-slate-200 overflow-hidden"
      initial={{ x: 640 }}
      animate={{ x: 0 }}
      exit={{ x: 640 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="p-4 border-b border-slate-200">
        <h2 className="text-lg font-medium">Meeting chat</h2>
      </div>

      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.map((message) => (
          <div key={message.id} className="flex flex-col">
            <div className="flex items-baseline">
              <span className="font-medium mr-2">{message.sender}</span>
              <span className="text-xs text-slate-500">
                {formatTime(message.timestamp)}
              </span>
            </div>
            <p className="mt-1">{message.text}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
