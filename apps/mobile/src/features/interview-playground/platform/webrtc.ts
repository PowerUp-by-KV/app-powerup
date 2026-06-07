// TypeScript resolution target — Metro resolves webrtc.native.ts / webrtc.web.ts at bundle time.
export {
  RTCPeerConnection,
  mediaDevices,
  attachRemoteAudio,
  detachRemoteAudio,
} from "./webrtc.web";
