import { useCallback, useEffect, useRef, useState } from "react";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system/legacy";

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

  const playAiAudio = useCallback(async (chunks: Uint8Array[]) => {
    if (chunks.length === 0) return;

    const totalLength = chunks.reduce((acc, c) => acc + c.length, 0);
    const merged = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      merged.set(chunk, offset);
      offset += chunk.length;
    }

    let binary = "";
    for (let i = 0; i < merged.length; i++) {
      binary += String.fromCharCode(merged[i]!);
    }
    const base64 = btoa(binary);
    const tmpPath = `${FileSystem.cacheDirectory}ai_audio_${Date.now()}.mp3`;

    try {
      await FileSystem.writeAsStringAsync(tmpPath, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (soundRef.current) {
        await soundRef.current.unloadAsync().catch(() => undefined);
      }
      const { sound } = await Audio.Sound.createAsync({ uri: tmpPath });
      soundRef.current = sound;
      await sound.playAsync();
    } catch {
      // non-fatal — transcript still shows
    }
  }, []);

  const autoRecordTimerRef = useRef<NodeJS.Timeout | null>(null);

  const flushAutoRecording = useCallback(async () => {
    if (autoRecordTimerRef.current) {
      clearTimeout(autoRecordTimerRef.current);
      autoRecordTimerRef.current = null;
    }
    if (!recordingRef.current) return;

    try {
      const rec = recordingRef.current;
      recordingRef.current = null;
      await rec.stopAndUnloadAsync();
      const uri = rec.getURI();

      if (isMountedRef.current) {
        setIsRecording(false);
        setIsSpeaking({ user: false, ai: false });
      }

      if (uri && wsRef.current && statusRef.current === "live") {
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        if (base64.length > 50) {
          const binaryStr = atob(base64);
          const bytes = new Uint8Array(binaryStr.length);
          for (let i = 0; i < binaryStr.length; i++) {
            bytes[i] = binaryStr.charCodeAt(i);
          }
          wsRef.current.send(bytes.buffer);
          wsRef.current.send(JSON.stringify({ event: "audio_end" }));
        }
      }
    } catch {
      setIsRecording(false);
    }
  }, []);

  const startAutoRecording = useCallback(async () => {
    if (!wsRef.current || statusRef.current !== "live") return;
    if (recordingRef.current) return;

    try {
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();
      recordingRef.current = recording;

      if (isMountedRef.current) {
        setIsRecording(true);
        setIsSpeaking({ user: true, ai: false });
      }

      if (autoRecordTimerRef.current) clearTimeout(autoRecordTimerRef.current);
      autoRecordTimerRef.current = setTimeout(() => {
        void flushAutoRecording().then(() => {
          if (statusRef.current === "live" && isMountedRef.current) {
            setTimeout(() => {
              void startAutoRecording();
            }, 300);
          }
        });
      }, 4000);
    } catch {
      // non-fatal
    }
  }, [flushAutoRecording]);

  const attachWebSocketListeners = useCallback(
    (ws: WebSocket) => {
      ws.onopen = () => {
        if (isMountedRef.current) {
          safeSetStatus("live");
          setTimeout(() => {
            void startAutoRecording();
          }, 400);
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
                void flushAutoRecording();
              }
              break;

            case "speech_done":
              if (isMountedRef.current) setIsSpeaking({ user: false, ai: false });
              await playAiAudio(aiAudioBufferRef.current);
              aiAudioBufferRef.current = [];
              if (statusRef.current === "live" && isMountedRef.current) {
                setTimeout(() => {
                  void startAutoRecording();
                }, 500);
              }
              break;

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
    [handleError, playAiAudio, safeSetStatus, startAutoRecording, flushAutoRecording],
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
    } catch {
      handleError("Could not start the interview. Please try again.");
      return null;
    }

    const sid =
      backendData.session_id || (backendData as { coach_session_id?: string }).coach_session_id;
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
    } catch {
      handleError("Could not start recording. Check microphone permissions.");
    }
  }, [isRecording, handleError]);

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

      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const binaryStr = atob(base64);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }

      wsRef.current.send(bytes.buffer);
      wsRef.current.send(JSON.stringify({ event: "audio_end" }));
    } catch {
      handleError("Recording failed. Please try again.");
      setIsRecording(false);
    }
  }, [isRecording, handleError]);

  const endInterview = useCallback(async () => {
    const s = statusRef.current;
    if (!wsRef.current || s === "done" || s === "saving") return;

    if (recordingRef.current) {
      try {
        await recordingRef.current.stopAndUnloadAsync();
        recordingRef.current = null;
      } catch {
        // ignore
      }
    }

    safeSetStatus("saving");

    try {
      wsRef.current.send(JSON.stringify({ event: "complete" }));
    } catch {
      // WS already closed — fall back to HTTP save
      const sid = sessionIdRef.current;
      if (sid) {
        try {
          const result = await savePipelineMutation({
            sessionId: sid,
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
  }, [savePipelineMutation, handleError, safeSetStatus]);

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
