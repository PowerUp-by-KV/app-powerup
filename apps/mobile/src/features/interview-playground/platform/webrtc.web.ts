export const RTCPeerConnection = (
  typeof window !== "undefined" ? window.RTCPeerConnection : undefined
) as typeof globalThis.RTCPeerConnection;

export const mediaDevices = typeof navigator !== "undefined" ? navigator.mediaDevices : undefined;
