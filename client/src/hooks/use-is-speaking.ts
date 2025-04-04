import { useEffect, useState } from "react";

const VOLUME_THRESHOLD = 23;

export const useIsSpeaking = (stream: MediaStream | undefined) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (!stream) {
      return;
    }

    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const microphone = audioContext.createMediaStreamSource(stream);
    microphone.connect(analyser);
    analyser.fftSize = 256;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const detectSpeech = () => {
      analyser.getByteFrequencyData(dataArray);
      const volume = dataArray.reduce((a, b) => a + b) / dataArray.length;
      setIsSpeaking(volume > VOLUME_THRESHOLD);
      requestAnimationFrame(detectSpeech);
    };
    detectSpeech();

    return () => {
      audioContext.close();
    };
  }, [stream]);

  return isSpeaking;
};
