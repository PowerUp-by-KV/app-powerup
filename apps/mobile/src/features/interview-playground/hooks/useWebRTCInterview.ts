import { useCallback, useEffect, useRef, useState } from "react";

import {
  useStartInterviewMutation,
  useSaveInterviewSessionMutation,
} from "@/services/interview-playground-api";
import type {
  EvaluationResult,
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
import { RTCPeerConnection, mediaDevices } from "../platform/webrtc";

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

export function useWebRTCInterview(): UseWebRTCInterviewReturn {
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

  const [startInterviewMutation] = useStartInterviewMutation();
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

  const attachDataChannelListeners = useCallback(
    (dc: RTCDataChannel, sid: string, role: string) => {
      dc.onopen = () => {
        setStatus("live");
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

          case "conversation.item.input_audio_transcription.completed": {
            const transcriptObj = parsed["transcript"] as { text?: string } | undefined;
            const text = transcriptObj?.text?.trim();
            if (text) {
              appendTranscriptTurn({
                role: "candidate",
                text,
                timestamp: new Date().toISOString(),
              });
            }
            break;
          }

          case "response.audio_transcript.done": {
            const text = (parsed["transcript"] as string | undefined)?.trim();
            if (text) {
              appendTranscriptTurn({
                role: "interviewer",
                text,
                timestamp: new Date().toISOString(),
              });
            }
            break;
          }

          default:
            break;
        }
      };
    },
    [saveSession, handleError],
  );

  const startInterview = useCallback(async (): Promise<string | null> => {
    if (activeSession.status !== "idle" && activeSession.status !== "error") {
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
      const result = await startInterviewMutation().unwrap();
      backendData = result;
    } catch {
      handleError("Failed to start interview. Please try again.");
      return null;
    }

    activeSession.sessionId = backendData.session_id;
    activeSession.derivedRole = backendData.derived_role;
    if (isMountedRef.current) {
      setSessionId(backendData.session_id);
      setDerivedRole(backendData.derived_role);
    }

    setStatus("connecting");

    try {
      const stream = await mediaDevices?.getUserMedia({ audio: true });
      if (!stream) throw new Error("No media stream returned from getUserMedia");
      activeSession.stream = stream;

      const pc = new RTCPeerConnection();
      activeSession.pc = pc;

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

      const sdpResponse = await fetch(backendData.webrtc_sdp_url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${backendData.ephemeral_token}`,
          "Content-Type": "application/sdp",
        },
        body: offer.sdp,
      });

      if (!sdpResponse.ok) {
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
    if (activeSession.status !== "live") return;

    const sid = activeSession.sessionId;
    const role = activeSession.derivedRole;
    const snapshot = [...activeSession.transcript];

    if (activeSession.dataChannel) {
      try {
        activeSession.dataChannel.close();
      } catch {
        // ignore
      }
    }
    if (activeSession.pc) {
      try {
        activeSession.pc.close();
      } catch {
        // ignore
      }
    }

    setStatus("saving");

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
