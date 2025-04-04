export const getMediaPermission = async (constraints?: MediaStreamConstraints) => {
  const tempStream = await navigator.mediaDevices.getUserMedia(constraints);
  tempStream.getTracks().forEach((track) => track.stop());
};
