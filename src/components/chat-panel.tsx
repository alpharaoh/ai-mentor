"use client";

import type React from "react";

import { useState } from "react";
import { Send } from "lucide-react";

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
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === "") return;

    const message: Message = {
      id: Date.now(),
      text: newMessage,
      sender: "You",
      timestamp: new Date(),
    };

    setMessages([...messages, message]);
    setNewMessage("");
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="w-80 h-full bg-white flex flex-col border-l border-slate-300">
      <div className="p-4 border-b border-slate-200">
        <h2 className="text-lg font-medium">Meeting chat</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
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

      <form
        onSubmit={handleSendMessage}
        className="p-4 border-t border-slate-200 flex"
      >
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Send a message to everyone..."
          className="flex-1 border border-slate-300 rounded-l-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 rounded-r-md hover:bg-blue-600 flex items-center justify-center"
          disabled={newMessage.trim() === ""}
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
