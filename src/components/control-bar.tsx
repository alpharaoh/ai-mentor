import { ReactNode } from "react";

interface ControlBarProps {
  children: ReactNode;
}

export default function ControlBar({ children }: ControlBarProps) {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-20 bg-gray-900 flex items-center justify-center">
      <div className="flex space-x-4">{children}</div>
    </div>
  );
}
