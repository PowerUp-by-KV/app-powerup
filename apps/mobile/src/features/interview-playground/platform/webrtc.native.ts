/* eslint-disable */
// @ts-nocheck
export { RTCPeerConnection, mediaDevices } from "@stream-io/react-native-webrtc";

// On native, @stream-io/react-native-webrtc routes and plays the remote audio
// track automatically through the device audio session, so these are no-ops.
export function attachRemoteAudio(_stream: unknown): void {}
export function detachRemoteAudio(): void {}
