import { useCallback, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system/legacy";

const IS_WEB = Platform.OS === "web";

/**
 * expo-file-system (readAsStringAsync / writeAsStringAsync) is NOT
 * available on web — confirmed via UnavailabilityError in production logs.
 * On web, expo-av's Audio.Recording wraps the browser's native
 * MediaRecorder, and recording.getURI() returns a `blob:` URL rather than
 * a filesystem path, so FileSystem was never going to work there anyway.
 * These helpers branch on platform and use fetch()/Blob directly on web,
 * which also skips an unnecessary base64 round-trip.
 */

import {
  useStartPipelineInterviewMutation,
  useSavePipelineSessionMutation,
} from "@/services/interview-playground-api";
import { getAuthSession } from "@/services/auth-storage";
import type { EvaluationResult, InterviewMode, InterviewStatus, TranscriptTurn } from "../types";

interface UsePipelineInterviewReturn {
  status: InterviewStatus;
  transcript: TranscriptTurn[];
  isSpeaking: { user: boolean; ai: boolean };
  errorMessage: string | null;
  evaluation: EvaluationResult | null;
  sessionId: string | null;
  derivedRole: string | null;
  isRecording: boolean;
  startInterview: () => Promise<string | null>;
  endInterview: () => Promise<void>;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  const lookup = new Uint8Array(256);
  for (let i = 0; i < chars.length; i++) {
    lookup[chars.charCodeAt(i)] = i;
  }

  let bufferLength = base64.length * 0.75;
  if (base64.endsWith("==")) {
    bufferLength -= 2;
  } else if (base64.endsWith("=")) {
    bufferLength -= 1;
  }

  const arrayBuffer = new ArrayBuffer(bufferLength);
  const bytes = new Uint8Array(arrayBuffer);

  let p = 0;
  for (let i = 0; i < base64.length; i += 4) {
    const encoded1 = lookup[base64.charCodeAt(i)]!;
    const encoded2 = lookup[base64.charCodeAt(i + 1)]!;
    const encoded3 = lookup[base64.charCodeAt(i + 2)]!;
    const encoded4 = lookup[base64.charCodeAt(i + 3)]!;

    bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
    if (p < bufferLength) {
      bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
    }
    if (p < bufferLength) {
      bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
    }
  }

  return arrayBuffer;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  const bytes = new Uint8Array(buffer);
  let base64 = "";
  const len = bytes.length;

  for (let i = 0; i < len; i += 3) {
    const b1 = bytes[i]!;
    const b2 = i + 1 < len ? bytes[i + 1]! : 0;
    const b3 = i + 2 < len ? bytes[i + 2]! : 0;

    const enc1 = b1 >> 2;
    const enc2 = ((b1 & 3) << 4) | (b2 >> 4);
    const enc3 = ((b2 & 15) << 2) | (b3 >> 6);
    const enc4 = b3 & 63;

    base64 += chars.charAt(enc1) + chars.charAt(enc2);
    if (i + 1 < len) {
      base64 += chars.charAt(enc3);
    } else {
      base64 += "=";
    }
    if (i + 2 < len) {
      base64 += chars.charAt(enc4);
    } else {
      base64 += "=";
    }
  }

  return base64;
}

// Newer lib.dom typings type Uint8Array.buffer as ArrayBufferLike
// (ArrayBuffer | SharedArrayBuffer), but Blob's BlobPart and this file's
// arrayBufferToBase64() both require a concrete ArrayBuffer. At runtime
// these bytes always come from fetch()/WebSocket binary frames — never a
// SharedArrayBuffer — so slicing out a fresh ArrayBuffer view is a safe,
// correctly-typed conversion rather than an unsafe cast.
function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

export function usePipelineInterview(
  mode: InterviewMode = "playground",
): UsePipelineInterviewReturn {
  const [status, setStatus] = useState<InterviewStatus>("idle");
  const [transcript, setTranscript] = useState<TranscriptTurn[]>([]);
  const [isSpeaking, setIsSpeaking] = useState({ user: false, ai: false });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [derivedRole, setDerivedRole] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const aiAudioBufferRef = useRef<Uint8Array[]>([]);
  // Tracks the in-flight playAiAudio() promise for the most recent
  // speech_done event. "completed" arrives as its own, independent
  // WebSocket message — each ws.onmessage invocation awaits
  // independently, so without this ref the "completed" handler can run
  // (and flip status to "done", triggering navigation away from this
  // screen) while the closing line's audio is still playing in the
  // background. Awaiting this ref before completing keeps them in order.
  const audioPlaybackRef = useRef<Promise<void> | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const isMountedRef = useRef(true);
  // Refs track current values without stale closure risk in WS callbacks
  const statusRef = useRef<InterviewStatus>("idle");
  const sessionIdRef = useRef<string | null>(null);
  const transcriptRef = useRef<TranscriptTurn[]>([]);
  const derivedRoleRef = useRef<string | null>(null);

  const [startPipelineMutation] = useStartPipelineInterviewMutation();
  const [savePipelineMutation] = useSavePipelineSessionMutation();

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      wsRef.current?.close();
      recordingRef.current?.stopAndUnloadAsync().catch(() => undefined);
      soundRef.current?.unloadAsync().catch(() => undefined);
    };
  }, []);

  const safeSetStatus = useCallback((s: InterviewStatus) => {
    statusRef.current = s;
    setStatus(s);
  }, []);

  const handleError = useCallback(
    (msg: string) => {
      if (!isMountedRef.current) return;
      setErrorMessage(msg);
      safeSetStatus("error");
    },
    [safeSetStatus],
  );

  // Non-fatal warning surface: logs loudly but does NOT flip status to
  // "error" (which would end the session). Use this for recording hiccups
  // that should be visible/debuggable without killing the interview.
  const logNonFatal = useCallback((context: string, err: unknown) => {
    // eslint-disable-next-line no-console
    console.warn(`[usePipelineInterview] ${context}:`, err);
  }, []);

  // Plays ONE complete audio clip (one sentence's worth, as sent by the
  // backend) and resolves once playback actually finishes.
  const playSingleAudioClip = useCallback(
    async (bytes: Uint8Array) => {
      let audioUri: string;
      let objectUrlToRevoke: string | null = null;

      try {
        if (IS_WEB) {
          // expo-file-system is unavailable on web (UnavailabilityError) —
          // build a Blob and object URL directly instead of writing a temp
          // file. expo-av's web implementation accepts blob: URIs fine.
          const blob = new Blob([toArrayBuffer(bytes)], { type: "audio/mpeg" });
          audioUri = URL.createObjectURL(blob);
          objectUrlToRevoke = audioUri;
        } else {
          const base64 = arrayBufferToBase64(toArrayBuffer(bytes));
          const tmpPath = `${FileSystem.cacheDirectory}ai_audio_${Date.now()}_${Math.random()
            .toString(36)
            .slice(2)}.mp3`;
          await FileSystem.writeAsStringAsync(tmpPath, base64, {
            encoding: FileSystem.EncodingType.Base64,
          });
          audioUri = tmpPath;
        }

        if (soundRef.current) {
          await soundRef.current.unloadAsync().catch(() => undefined);
        }

        // IMPORTANT: sound.playAsync() resolves as soon as playback STARTS,
        // not when it finishes. Wait for the actual playback-finished
        // status update instead, so callers can chain clips sequentially.
        await new Promise<void>((resolve) => {
          let settled = false;
          const finish = () => {
            if (settled) return;
            settled = true;
            resolve();
          };

          Audio.Sound.createAsync({ uri: audioUri }, { shouldPlay: true }, (status) => {
            if (!status.isLoaded) {
              if (status.error) {
                logNonFatal("Playback status error", status.error);
                finish();
              }
              return;
            }
            if (status.didJustFinish) {
              finish();
            }
          })
            .then(({ sound }) => {
              soundRef.current = sound;
            })
            .catch((err) => {
              logNonFatal("Failed to create/play AI audio clip", err);
              finish();
            });

          // Safety net: never block forever if the status callback never
          // fires (e.g. platform quirk) — cap the wait per clip.
          setTimeout(finish, 15000);
        });
      } catch (err) {
        logNonFatal("playSingleAudioClip failed", err);
        // non-fatal — transcript still shows, move on to the next clip
      } finally {
        if (objectUrlToRevoke) {
          // Free the blob once playback has finished/failed. A short delay
          // avoids revoking while expo-av's web <audio> element is still
          // attached to it.
          setTimeout(() => URL.revokeObjectURL(objectUrlToRevoke!), 1000);
        }
      }
    },
    [logNonFatal],
  );

  const playAiAudio = useCallback(
    async (chunks: Uint8Array[]) => {
      if (chunks.length === 0) return;

      // IMPORTANT: each entry in `chunks` is a complete, independent audio
      // file — the backend sends one full TTS clip per sentence, as its
      // own WebSocket binary frame (see generate_tts_audio / sentence
      // streaming server-side). Previously these were concatenated into a
      // single Blob and played as one file — but raw-byte concatenation
      // of multiple standalone MP3s isn't a valid multi-segment MP3, so
      // the decoder (browser's native one, via expo-av on web) played
      // through the first file's header and stopped at the second file's
      // header, producing "only the first sentence plays, then silence."
      // Playing each clip as its own Sound, sequentially, fixes that.
      for (const chunk of chunks) {
        await playSingleAudioClip(chunk);
      }
    },
    [playSingleAudioClip],
  );

  // Safety stop: if the AI starts speaking while the user still has an
  // open recording (e.g. they were mid push-to-talk and the AI barges in,
  // or a stray state), stop and discard it rather than sending a
  // recording that overlaps AI speech.
  const discardInFlightRecording = useCallback(async () => {
    if (!recordingRef.current) return;
    try {
      const rec = recordingRef.current;
      recordingRef.current = null;
      await rec.stopAndUnloadAsync();
    } catch (err) {
      logNonFatal("discardInFlightRecording failed", err);
    } finally {
      if (isMountedRef.current) {
        setIsRecording(false);
      }
    }
  }, [logNonFatal]);

  const attachWebSocketListeners = useCallback(
    (ws: WebSocket) => {
      ws.onopen = () => {
        if (isMountedRef.current) {
          safeSetStatus("live");
        }
      };

      ws.onclose = () => {
        const s = statusRef.current;
        if (isMountedRef.current && s !== "done" && s !== "saving") {
          handleError("Connection closed unexpectedly.");
        }
      };

      ws.onerror = () => handleError("WebSocket connection error.");

      ws.onmessage = async (event) => {
        if (typeof event.data === "string") {
          let payload: Record<string, unknown>;
          try {
            payload = JSON.parse(event.data) as Record<string, unknown>;
          } catch {
            return;
          }

          const evt = payload["event"] as string | undefined;

          switch (evt) {
            case "speech_start":
              if (isMountedRef.current) setIsSpeaking({ user: false, ai: true });
              aiAudioBufferRef.current = [];
              if (recordingRef.current) {
                void discardInFlightRecording();
              }
              break;

            case "speech_done": {
              if (isMountedRef.current) setIsSpeaking({ user: false, ai: false });
              const playbackPromise = playAiAudio(aiAudioBufferRef.current);
              audioPlaybackRef.current = playbackPromise;
              await playbackPromise;
              aiAudioBufferRef.current = [];
              // Recording is now entirely user-initiated via
              // startRecording()/stopRecording() (push-to-talk) — the AI
              // finishing its turn no longer auto-starts the mic. This
              // avoids the previous 4-second forced-chunking loop, which
              // fragmented continuous speech into context-free clips and
              // caused Whisper to hallucinate short filler phrases (e.g.
              // "Thank you for watching.") on near-silent segments,
              // including when the user hadn't spoken at all.
              break;
            }

            case "text_delta": {
              const text = (payload["text"] as string | undefined)?.trim();
              if (text && isMountedRef.current) {
                setTranscript((prev) => {
                  const last = prev[prev.length - 1];
                  const updated =
                    last?.role === "interviewer"
                      ? [...prev.slice(0, -1), { ...last, text: last.text + " " + text }]
                      : [
                          ...prev,
                          {
                            role: "interviewer" as const,
                            text,
                            timestamp: new Date().toISOString(),
                          },
                        ];
                  transcriptRef.current = updated;
                  return updated;
                });
              }
              break;
            }

            case "transcription": {
              const text = (payload["text"] as string | undefined)?.trim();
              if (text && isMountedRef.current) {
                setTranscript((prev) => {
                  const updated = [
                    ...prev,
                    { role: "candidate" as const, text, timestamp: new Date().toISOString() },
                  ];
                  transcriptRef.current = updated;
                  return updated;
                });
                setIsSpeaking({ user: false, ai: false });
              }
              break;
            }

            case "transcription_error":
              if (isMountedRef.current)
                setErrorMessage(
                  (payload["message"] as string | undefined) ?? "Transcription failed.",
                );
              break;

            case "completed": {
              if (!isMountedRef.current) break;
              // The closing line's audio (from speech_done) may still be
              // playing when "completed" arrives — they're sent as
              // separate WS messages and each onmessage invocation awaits
              // independently, so "completed" is not guaranteed to run
              // after audio playback actually finishes. Wait for it here
              // before navigating away, or the results screen replaces
              // this one mid-sentence.
              if (audioPlaybackRef.current) {
                await audioPlaybackRef.current;
              }
              if (!isMountedRef.current) break;
              const ev = payload["evaluation"] as EvaluationResult | null | undefined;
              setEvaluation(ev ?? null);
              safeSetStatus("done");
              ws.close();
              break;
            }

            case "error":
              handleError((payload["message"] as string | undefined) ?? "An error occurred.");
              break;

            default:
              break;
          }
        } else if (event.data instanceof ArrayBuffer) {
          aiAudioBufferRef.current.push(new Uint8Array(event.data));
        } else if (event.data instanceof Blob) {
          const ab = await (event.data as Blob).arrayBuffer();
          aiAudioBufferRef.current.push(new Uint8Array(ab));
        }
      };
    },
    [handleError, playAiAudio, safeSetStatus, discardInFlightRecording],
  );

  const startInterview = useCallback(async (): Promise<string | null> => {
    const currentStatus = statusRef.current;
    if (
      currentStatus === "live" ||
      currentStatus === "connecting" ||
      currentStatus === "starting"
    ) {
      return sessionIdRef.current;
    }

    safeSetStatus("starting");
    setTranscript([]);
    transcriptRef.current = [];
    setErrorMessage(null);
    setEvaluation(null);
    setSessionId(null);
    sessionIdRef.current = null;
    setDerivedRole(null);
    derivedRoleRef.current = null;

    let backendData;
    try {
      backendData = await startPipelineMutation({ mode }).unwrap();
      if (!isMountedRef.current) return null;
    } catch {
      handleError("Could not start the interview. Please try again.");
      return null;
    }

    const sid = backendData.session_id || (backendData as any).coach_session_id;
    const role = backendData.derived_role || "Interview Coach";
    setSessionId(sid);
    sessionIdRef.current = sid;
    setDerivedRole(role);
    derivedRoleRef.current = role;
    safeSetStatus("connecting");

    const { status: permStatus } = await Audio.requestPermissionsAsync();
    if (permStatus !== "granted") {
      handleError("Microphone permission is required for the interview.");
      return null;
    }
    await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });

    const session = await getAuthSession();
    const token = session?.access_token ?? "";
    const wsUrl = backendData.websocket_url.includes("?")
      ? `${backendData.websocket_url}&token=${encodeURIComponent(token)}`
      : `${backendData.websocket_url}?token=${encodeURIComponent(token)}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    attachWebSocketListeners(ws);

    return backendData.session_id;
  }, [startPipelineMutation, handleError, attachWebSocketListeners, safeSetStatus]);

  const startRecording = useCallback(async () => {
    if (isRecording || !wsRef.current) return;

    try {
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();
      recordingRef.current = recording;
      if (isMountedRef.current) {
        setIsRecording(true);
        setIsSpeaking({ user: true, ai: false });
      }
    } catch (err) {
      logNonFatal("startRecording failed", err);
      handleError("Could not start recording. Check microphone permissions.");
    }
  }, [isRecording, handleError, logNonFatal]);

  const stopRecording = useCallback(async () => {
    if (!isRecording || !recordingRef.current) return;

    try {
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;

      if (isMountedRef.current) {
        setIsRecording(false);
        setIsSpeaking({ user: false, ai: false });
      }

      if (!uri || !wsRef.current) return;

      let arrayBuffer: ArrayBuffer;
      if (IS_WEB) {
        const res = await fetch(uri);
        arrayBuffer = await res.arrayBuffer();
      } else {
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        arrayBuffer = base64ToArrayBuffer(base64);
      }

      wsRef.current.send(arrayBuffer);
      wsRef.current.send(JSON.stringify({ event: "audio_end" }));
    } catch (err) {
      logNonFatal("stopRecording failed", err);
      handleError("Recording failed. Please try again.");
      setIsRecording(false);
    }
  }, [isRecording, handleError, logNonFatal]);

  const endInterview = useCallback(async () => {
    const s = statusRef.current;
    if (!wsRef.current || s === "done" || s === "saving") return;

    if (recordingRef.current) {
      try {
        await recordingRef.current.stopAndUnloadAsync();
        recordingRef.current = null;
      } catch (err) {
        logNonFatal("endInterview: failed to stop in-flight recording", err);
      }
    }

    safeSetStatus("saving");

    try {
      wsRef.current.send(JSON.stringify({ event: "complete" }));
    } catch (err) {
      logNonFatal("endInterview: WS send failed, falling back to HTTP save", err);
      // WS already closed — fall back to HTTP save
      const sid = sessionIdRef.current;
      if (sid) {
        try {
          const result = await savePipelineMutation({
            sessionId: sid,
            mode,
            body: {
              transcript: transcriptRef.current,
              derived_role: derivedRoleRef.current ?? undefined,
            },
          }).unwrap();
          if (isMountedRef.current) {
            setEvaluation(result.evaluation);
            safeSetStatus("done");
          }
        } catch {
          handleError("Failed to save interview.");
        }
      }
    }
  }, [savePipelineMutation, handleError, safeSetStatus, logNonFatal, mode]);

  return {
    status,
    transcript,
    isSpeaking,
    errorMessage,
    evaluation,
    sessionId,
    derivedRole,
    isRecording,
    startInterview,
    endInterview,
    startRecording,
    stopRecording,
  };
}
