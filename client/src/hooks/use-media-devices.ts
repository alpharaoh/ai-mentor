import { useStoredState } from "@/hooks/use-local-storage";
import { getMediaPermission } from "@/lib/get-media-permission";
import { useQuery } from "@tanstack/react-query";

export const useMediaDevices = (kind: MediaDeviceKind, stream: MediaStream | undefined) => {
  const [selectedDeviceId, setSelectedDeviceId] = useStoredState<string>(`selected-${kind}-device`);

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
