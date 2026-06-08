/* eslint-disable */
// @ts-nocheck
import { DeviceEventEmitter } from "react-native";

export { RTCPeerConnection, mediaDevices } from "@stream-io/react-native-webrtc";

// On native, @stream-io/react-native-webrtc routes and plays the remote audio
// track automatically through the device audio session, so these are no-ops.
export function attachRemoteAudio(_stream: unknown): void {}
export function detachRemoteAudio(): void {}

// ---------------------------------------------------------------------------
// Audio routing (native)
// By default a WebRTC voice session plays through the phone's earpiece (the
// "phone call" speaker). For an interview we want the loudspeaker so the user
// can hear the AI hands-free — unless a wired headset is connected, in which
// case the audio should follow the headset.
//
// react-native-incall-manager is a native module, so it only exists in EAS
// dev/preview/production builds (not Expo Go / web). We lazy-require it and
// wrap every call so a missing module degrades gracefully instead of crashing.
// ---------------------------------------------------------------------------
let headsetSub: { remove: () => void } | null = null;

function getInCallManager(): any | null {
  try {
    const mod = require("react-native-incall-manager");
    return mod?.default ?? mod ?? null;
  } catch {
    return null;
  }
}

export function startAudioRouting(): void {
  const InCallManager = getInCallManager();
  if (!InCallManager) return;
  try {
    InCallManager.start({ media: "audio" });
    // Loudspeaker by default.
    InCallManager.setForceSpeakerphoneOn(true);
    // Follow the wired headset if it is plugged/unplugged mid-session:
    // headset present → earpiece/headset route, absent → loudspeaker.
    headsetSub = DeviceEventEmitter.addListener("WiredHeadset", (data: { isPlugged?: boolean }) => {
      try {
        InCallManager.setForceSpeakerphoneOn(!data?.isPlugged);
      } catch {}
    });
  } catch {
    // Best-effort; never let audio routing crash the interview.
  }
}

export function stopAudioRouting(): void {
  const InCallManager = getInCallManager();
  try {
    headsetSub?.remove();
  } catch {}
  headsetSub = null;
  if (!InCallManager) return;
  try {
    InCallManager.setForceSpeakerphoneOn(false);
    InCallManager.stop();
  } catch {}
}
