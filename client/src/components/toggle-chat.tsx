"use client";

import { Dispatch, SetStateAction, useCallback } from "react";
import { MessageSquare } from "lucide-react";

interface ToggleChatProps {
  isChatOpen: boolean;
  setChatOpenAction: Dispatch<SetStateAction<boolean>>;
}

export default function ToggleChat({ isChatOpen, setChatOpenAction }: ToggleChatProps) {
  const toggleChat = useCallback(() => {
    setChatOpenAction((isChatOpen) => !isChatOpen);
  }, [setChatOpenAction]);

  return (
    <button
      onClick={toggleChat}
      className={`w-12 h-12 rounded-full flex items-center justify-center ${
        isChatOpen ? "bg-blue-500 text-white" : "bg-slate-700 text-white hover:bg-slate-600"
      }`}
      aria-label={isChatOpen ? "Close chat" : "Open chat"}
    >
      <MessageSquare size={20} />
    </button>
  );
}
