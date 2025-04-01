"use client";

import { Check, X } from "lucide-react";

interface CameraSelectorProps {
  devices: MediaDeviceInfo[];
  selectedDeviceId: string;
  onSelectDevice: (deviceId: string) => void;
  onClose: () => void;
}

export default function CameraSelector({
  devices,
  selectedDeviceId,
  onSelectDevice,
  onClose,
}: CameraSelectorProps) {
  return (
    <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 bg-gray-800 rounded-lg shadow-lg p-2 w-72 z-10">
      <div className="flex justify-between items-center mb-2 px-2">
        <h3 className="text-white text-sm font-medium">Select camera</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white"
          aria-label="Close camera selector"
        >
          <X size={18} />
        </button>
      </div>

      <div className="max-h-60 overflow-y-auto">
        {devices.map((device) => (
          <button
            key={device.deviceId}
            onClick={() => onSelectDevice(device.deviceId)}
            className="flex items-center justify-between w-full px-3 py-2 text-left text-white hover:bg-gray-700 rounded"
          >
            <span className="truncate">
              {device.label || `Camera ${devices.indexOf(device) + 1}`}
            </span>
            {selectedDeviceId === device.deviceId && (
              <Check size={16} className="text-blue-500" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
