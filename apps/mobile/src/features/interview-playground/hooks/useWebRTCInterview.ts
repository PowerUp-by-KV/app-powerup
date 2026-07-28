import { useCallback, useEffect, useRef, useState } from "react";

import {
  useStartWebRTCInterviewMutation,
  useSaveInterviewSessionMutation,
} from "@/services/interview-playground-api";
import type {
  EvaluationResult,
  InterviewMode,
  InterviewStatus,
  StartInterviewResponse,
  TranscriptTurn,
} from "../types";
import {
  activeSession,
  appendTranscriptTurn,
  onSpeakingChange,
  onStatusChange,
  onTranscriptChange,
  resetSession,
  setStatus,
  setSpeaking,
} from "../store/interviewSession";
import {
  RTCPeerConnection,
  mediaDevices,
  attachRemoteAudio,
  detachRemoteAudio,
  startAudioRouting,
  stopAudioRouting,
} from "../platform/webrtc";
import { showAlert } from "@/utils/alert";

interface UseWebRTCInterviewReturn {
  status: InterviewStatus;
  transcript: TranscriptTurn[];
  isSpeaking: { user: boolean; ai: boolean };
  errorMessage: string | null;
  evaluation: EvaluationResult | null;
  sessionId: string | null;
  derivedRole: string | null;
  startInterview: () => Promise<string | null>;
  endInterview: () => Promise<void>;
}

// The agent is instructed (system prompt) to end with this exact sentence,
// both when the interview completes naturally and when the candidate says
// "end the interview". Detecting it lets us auto-finalize on web AND phone.
const CLOSING_PHRASE_MARKER = "this concludes our interview";

// Translates a failed /interview/start into a human-readable message + a
// machine-readable code. The backend returns { detail: { code, message } }
// for known cases (e.g. NO_RESUME); everything else is mapped to a friendly
// fallback instead of a bare "Failed to start interview".
function describeStartError(err: unknown): { code: string; message: string } {
  const e = err as { status?: number | string; data?: { detail?: unknown } };
  const detail = e?.data?.detail;

  if (detail && typeof detail === "object") {
    const d = detail as { code?: string; message?: string };
    if (d.code === "NO_RESUME") {
      return {
        code: "NO_RESUME",
        message:
          d.message ??
          "We couldn't find your résumé. Add or finish building your résumé so we can tailor your interview questions.",
      };
    }
    if (d.message) return { code: d.code ?? "SERVER", message: d.message };
  }

  if (e?.status === "FETCH_ERROR" || e?.status === "TIMEOUT_ERROR") {
    return {
      code: "NETWORK",
      message: "We couldn't reach the interview service. Check your connection and try again.",
    };
  }

  return {
    code: "SERVER",
    message: "We couldn't start your interview right now. Please try again in a moment.",
  };
}

export function useWebRTCInterview(mode: InterviewMode = "playground"): UseWebRTCInterviewReturn {
  const [status, setLocalStatus] = useState<InterviewStatus>(activeSession.status);
  const [transcript, setLocalTranscript] = useState<TranscriptTurn[]>(activeSession.transcript);
  const [isSpeaking, setLocalSpeaking] = useState<{ user: boolean; ai: boolean }>(
    activeSession.isSpeaking,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(activeSession.errorMessage);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(activeSession.evaluation);
  const [sessionId, setSessionId] = useState<string | null>(activeSession.sessionId);
  const [derivedRole, setDerivedRole] = useState<string | null>(activeSession.derivedRole);

  const isMountedRef = useRef(true);

  const [startInterviewMutation] = useStartWebRTCInterviewMutation();
  const [saveSession] = useSaveInterviewSessionMutation();

  useEffect(() => {
    isMountedRef.current = true;

    const unsubStatus = onStatusChange((s) => {
      if (isMountedRef.current) {
        setLocalStatus(s);
        if (s === "error") setErrorMessage(activeSession.errorMessage);
        if (s === "done") setEvaluation(activeSession.evaluation);
      }
    });
    const unsubTranscript = onTranscriptChange((turns) => {
      if (isMountedRef.current) setLocalTranscript([...turns]);
    });
    const unsubSpeaking = onSpeakingChange((speaking) => {
      if (isMountedRef.current) setLocalSpeaking({ ...speaking });
    });

    return () => {
      isMountedRef.current = false;
      unsubStatus();
      unsubTranscript();
      unsubSpeaking();
    };
  }, []);

  const handleError = useCallback((message: string) => {
    activeSession.errorMessage = message;
    setStatus("error");
  }, []);

  // Tears down the WebRTC connection and saves the transcript for evaluation.
  // Used by both the manual "End Interview" button and the auto-end that fires
  // when the agent speaks the closing phrase (e.g. after "end the interview").
  const finalizeSession = useCallback(async (): Promise<void> => {
    if (activeSession.status !== "live") return;

    const sid = activeSession.sessionId;
    const role = activeSession.derivedRole;
    const snapshot = [...activeSession.transcript];

    setStatus("saving");

    try {
      activeSession.dataChannel?.close();
    } catch {
      // ignore
    }
    try {
      activeSession.pc?.close();
    } catch {
      // ignore
    }
    if (activeSession.stream) {
      activeSession.stream.getTracks().forEach((t) => t.stop());
    }
    detachRemoteAudio();
    stopAudioRouting();

    if (!sid) {
      handleError("No session ID to save");
      return;
    }

    try {
      const result = await saveSession({
        sessionId: sid,
        body: { transcript: snapshot, derived_role: role ?? undefined },
      }).unwrap();

      activeSession.evaluation = result.evaluation;
      if (isMountedRef.current) setEvaluation(result.evaluation);
      setStatus("done");
    } catch {
      handleError("Failed to save interview. Your transcript may be lost.");
    }
  }, [saveSession, handleError]);

  const attachDataChannelListeners = useCallback(
    (dc: RTCDataChannel, sid: string, role: string) => {
      dc.onopen = () => {
        setStatus("live");
        // Kick off the interviewer's opening turn so the AI greets the
        // candidate first instead of waiting for them to speak.
        try {
          dc.send(JSON.stringify({ type: "response.create" }));
        } catch {
          // non-fatal — model will still respond to the first user turn
        }
      };

      dc.onclose = () => {
        // Auto-save on unexpected disconnect if we have transcript content
        if (activeSession.status === "live" && activeSession.transcript.length > 0) {
          const snapshot = [...activeSession.transcript];
          setStatus("saving");
          saveSession({ sessionId: sid, body: { transcript: snapshot, derived_role: role } })
            .unwrap()
            .then((res) => {
              activeSession.evaluation = res.evaluation;
              setStatus("done");
            })
            .catch(() => {
              activeSession.errorMessage = "Failed to save after disconnect";
              setStatus("error");
            });
        } else if (activeSession.status !== "saving" && activeSession.status !== "done") {
          handleError("Connection closed unexpectedly");
        }
      };

      dc.onerror = () => {
        handleError("Data channel error");
      };

      dc.onmessage = (event: MessageEvent) => {
        let parsed: Record<string, unknown>;
        try {
          parsed = JSON.parse(event.data as string) as Record<string, unknown>;
        } catch {
          return;
        }

        const type = parsed["type"] as string | undefined;
        if (!type) return;

        switch (type) {
          case "input_audio_buffer.speech_started":
            setSpeaking({ user: true, ai: activeSession.isSpeaking.ai });
            break;

          case "input_audio_buffer.speech_stopped":
            setSpeaking({ user: false, ai: activeSession.isSpeaking.ai });
            break;

          case "response.created":
            setSpeaking({ user: activeSession.isSpeaking.user, ai: true });
            break;

          case "response.done":
            setSpeaking({ user: activeSession.isSpeaking.user, ai: false });
            break;

          // User's spoken answer transcribed. The `transcript` field is a
          // plain string on this event (not an object with `.text`).
          case "conversation.item.input_audio_transcription.completed": {
            const raw = parsed["transcript"];
            const text =
              typeof raw === "string"
                ? raw.trim()
                : ((raw as { text?: string } | undefined)?.text ?? "").trim();
            if (text) {
              appendTranscriptTurn({
                role: "candidate",
                text,
                timestamp: new Date().toISOString(),
              });
            }
            break;
          }

          // AI interviewer's spoken turn transcribed. Event name differs across
          // Realtime API versions — handle both the GA and newer variants.
          case "response.audio_transcript.done":
          case "response.output_audio_transcript.done": {
            const text = (parsed["transcript"] as string | undefined)?.trim();
            if (text) {
              appendTranscriptTurn({
                role: "interviewer",
                text,
                timestamp: new Date().toISOString(),
              });
              // The agent says the closing phrase when the interview ends —
              // either naturally or because the candidate asked to stop. Once
              // we hear it, automatically finalize and save the session.
              if (text.toLowerCase().includes(CLOSING_PHRASE_MARKER)) {
                void finalizeSession();
              }
            }
            break;
          }

          default:
            break;
        }
      };
    },
    [saveSession, handleError, finalizeSession],
  );

  const startInterview = useCallback(async (): Promise<string | null> => {
    if (
      activeSession.status === "live" ||
      activeSession.status === "connecting" ||
      activeSession.status === "starting"
    ) {
      return activeSession.sessionId;
    }

    resetSession();
    setLocalStatus("starting");
    setLocalTranscript([]);
    setErrorMessage(null);
    setEvaluation(null);
    setSessionId(null);
    setDerivedRole(null);
    setStatus("starting");

    let backendData: StartInterviewResponse;

    try {
      const result = await startInterviewMutation({ mode }).unwrap();
      backendData = result;
    } catch (err) {
      const { code, message } = describeStartError(err);
      handleError(message);
      // Surface a popup for the most actionable case; the screens also render
      // `errorMessage` inline.
      if (code === "NO_RESUME") {
        showAlert("Résumé needed", message, [{ text: "OK" }]);
      }
      return null;
    }

    activeSession.sessionId = backendData.session_id;
    activeSession.derivedRole = backendData.derived_role;
    activeSession.mode = backendData.mode ?? mode;
    if (isMountedRef.current) {
      setSessionId(backendData.session_id);
      setDerivedRole(backendData.derived_role);
    }

    setStatus("connecting");

    try {
      const stream = await mediaDevices?.getUserMedia({ audio: true });
      if (!stream) throw new Error("No media stream returned from getUserMedia");
      activeSession.stream = stream;

      // Route the AI's voice to the loudspeaker (or a connected headset) so the
      // user can hear it hands-free instead of through the quiet earpiece.
      startAudioRouting();

      const pc = new RTCPeerConnection();
      activeSession.pc = pc;

      // Play the AI interviewer's voice: attach the remote audio track to an
      // audio sink. Without this, the connection works but the user hears
      // nothing.
      (
        pc as unknown as {
          ontrack: ((e: { streams: MediaStream[] }) => void) | null;
        }
      ).ontrack = (e) => {
        const remoteStream = e.streams && e.streams[0];
        if (remoteStream) {
          activeSession.remoteStream = remoteStream;
          attachRemoteAudio(remoteStream);
        }
      };

      stream.getTracks().forEach((track) => {
        (
          pc as unknown as {
            addTrack: (t: MediaStreamTrack, s: MediaStream) => void;
          }
        ).addTrack(track, stream);
      });

      const dc = pc.createDataChannel("oai-events");
      activeSession.dataChannel = dc;
      attachDataChannelListeners(dc, backendData.session_id, backendData.derived_role);

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const token =
        backendData.ephemeral_token || (backendData as { realtime_token?: string }).realtime_token;
      const sdpResponse = await fetch(backendData.webrtc_sdp_url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/sdp",
        },
        body: offer.sdp,
      });

      if (!sdpResponse.ok) {
        if (sdpResponse.status === 401) {
          throw new Error(
            "OpenAI Realtime authentication failed (401). Please check that a valid OPENAI_API_KEY is configured in the backend server.",
          );
        }
        throw new Error(`OpenAI SDP exchange failed: ${sdpResponse.status}`);
      }

      const answerSdp = await sdpResponse.text();
      await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });

      return backendData.session_id;
    } catch (err) {
      const message = err instanceof Error ? err.message : "WebRTC setup failed";
      handleError(message);
      return null;
    }
  }, [startInterviewMutation, attachDataChannelListeners, handleError]);

  const endInterview = useCallback(async (): Promise<void> => {
    // Manual "End Interview" button — tear down and save immediately.
    // (Saying "end the interview" to the agent auto-ends via the closing
    // phrase, which routes through this same finalize path.)
    await finalizeSession();
  }, [finalizeSession]);

  return {
    status,
    transcript,
    isSpeaking,
    errorMessage,
    evaluation,
    sessionId,
    derivedRole,
    startInterview,
    endInterview,
  };
}
