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
function getAudio(): any | null {
  try {
    return require("expo-av").Audio ?? null;
  } catch {
    return null;
  }
}

export function startAudioRouting(): void {
  const Audio = getAudio();
  if (!Audio?.setAudioModeAsync) return;
  try {
    // playThroughEarpieceAndroid:false → loudspeaker on Android.
    // playsInSilentModeIOS keeps the AI audible if the ring switch is silent.
    Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      playThroughEarpieceAndroid: false,
      shouldDuckAndroid: true,
    }).catch(() => {});
  } catch {
    // best-effort
  }
}

export function stopAudioRouting(): void {
  const Audio = getAudio();
  if (!Audio?.setAudioModeAsync) return;
  try {
    // Release the recording session; keep output off the earpiece.
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playThroughEarpieceAndroid: false,
    }).catch(() => {});
  } catch {
    // best-effort
  }
}
