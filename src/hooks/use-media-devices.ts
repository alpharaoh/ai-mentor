import { getMediaPermission } from "@/lib/get-media-permission";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export const useMediaDevices = (
  kind: MediaDeviceKind,
  stream: MediaStream | undefined,
) => {
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>();

  const { data: devices = [], isLoading: loadingDevices } = useQuery({
    queryKey: [`${kind}Devices`, !!stream],
    queryFn: async () => {
      if (!stream) {
        await getMediaPermission({
          [kind.includes("video") ? "video" : "audio"]: true,
        });
      }
      const devices = await navigator.mediaDevices.enumerateDevices();
      const filteredDevices = devices.filter((device) => device.kind === kind);

      if (filteredDevices.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(filteredDevices[0].deviceId);
      }

      return filteredDevices;
    },
  });

  return { devices, selectedDeviceId, setSelectedDeviceId, loadingDevices };
};
