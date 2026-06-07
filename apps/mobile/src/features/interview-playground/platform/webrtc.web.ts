export const RTCPeerConnection = (
  typeof window !== "undefined" ? window.RTCPeerConnection : undefined
) as typeof globalThis.RTCPeerConnection;

export const mediaDevices = typeof navigator !== "undefined" ? navigator.mediaDevices : undefined;

// ---------------------------------------------------------------------------
// Remote audio playback (web)
// The OpenAI Realtime model streams its voice back as a remote audio track.
// On web we must attach that MediaStream to an <audio> element and play it,
// otherwise the AI is silent.
// ---------------------------------------------------------------------------
let remoteAudioEl: HTMLAudioElement | null = null;

export function attachRemoteAudio(stream: MediaStream): void {
  if (typeof document === "undefined") return;
  if (!remoteAudioEl) {
    remoteAudioEl = document.createElement("audio");
    remoteAudioEl.autoplay = true;
    // Keep it in the DOM but invisible — required for playback in some browsers.
    remoteAudioEl.style.display = "none";
    document.body.appendChild(remoteAudioEl);
  }
  remoteAudioEl.srcObject = stream as unknown as MediaProvider;
  void remoteAudioEl.play?.().catch(() => {
    // Autoplay can be blocked until a user gesture; the Start button click
    // generally satisfies this, so failures here are non-fatal.
  });
}

export function detachRemoteAudio(): void {
  if (remoteAudioEl) {
    remoteAudioEl.srcObject = null;
  }
}
