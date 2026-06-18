/* eslint-disable */
// @ts-nocheck
export { RTCPeerConnection, mediaDevices } from "@stream-io/react-native-webrtc";

// On native, @stream-io/react-native-webrtc routes and plays the remote audio
// track automatically through the device audio session, so these are no-ops.
export function attachRemoteAudio(_stream: unknown): void {}
export function detachRemoteAudio(): void {}

// ---------------------------------------------------------------------------
// Audio routing (native) — loudspeaker by default
//
// A WebRTC voice session defaults to the phone's earpiece (the "phone call"
// route), so the AI interviewer was barely audible. We force the loudspeaker
// via expo-av's audio mode (`playThroughEarpieceAndroid: false`).
//
// Why expo-av and not react-native-incall-manager: incall-manager (4.2.1) is
// an old-architecture native module and crashes at process init on Expo SDK 55
// (New Architecture is on by default, required by react-native-reanimated v4) —
// the app never reached the splash screen. expo-av is an Expo module that is
// New-Arch compatible. It's lazy-required and fully guarded so audio routing
// can never crash the app.
// ---------------------------------------------------------------------------
function getAudio(): typeof import("expo-av").Audio | null {
  try {
    return require("expo-av").Audio ?? null;
  } catch {
    return null;
  }
}

// setAudioModeAsync mutates global native audio-session state, so concurrent
// calls can resolve out of order (e.g. quickly entering then leaving the
// interview could leave the mic active or the route wrong). Serialize every
// call through a single promise chain so the last requested mode wins.
let audioModeQueue: Promise<void> = Promise.resolve();

function setAudioModeSafe(
  options: Parameters<typeof import("expo-av").Audio.setAudioModeAsync>[0],
): void {
  const Audio = getAudio();
  if (!Audio?.setAudioModeAsync) return;
  audioModeQueue = audioModeQueue.then(() => Audio.setAudioModeAsync(options)).catch(() => {});
}

export function startAudioRouting(): void {
  // playThroughEarpieceAndroid:false → loudspeaker on Android.
  // playsInSilentModeIOS keeps the AI audible if the ring switch is silent.
  setAudioModeSafe({
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true,
    staysActiveInBackground: false,
    playThroughEarpieceAndroid: false,
    shouldDuckAndroid: true,
  });
}

export function stopAudioRouting(): void {
  // Release the recording session; keep output off the earpiece.
  setAudioModeSafe({
    allowsRecordingIOS: false,
    playThroughEarpieceAndroid: false,
  });
}
