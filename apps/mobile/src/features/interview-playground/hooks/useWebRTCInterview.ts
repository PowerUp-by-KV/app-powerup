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
  updateLastTranscriptTurn,
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
  isMicActive: boolean;
  errorMessage: string | null;
  evaluation: EvaluationResult | null;
  sessionId: string | null;
  derivedRole: string | null;
  // True once the final question's closing statement has been sent to the
  // model. Screens should use this to hide/disable the mic button and show
  // a "review your results" prompt instead — further mic taps are also
  // guarded out internally, but disabling the button avoids a dead tap.
  isInterviewComplete: boolean;
  startInterview: () => Promise<string | null>;
  endInterview: () => Promise<void>;
  toggleMic: () => void;
}

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
  // Tap-to-talk: mic starts muted. User taps the mic icon (toggleMic) to
  // unmute and speak, taps again to mute, commit the buffer, and request
  // the AI's response. No server-side VAD — turn-taking is fully manual.
  const [isMicActive, setIsMicActive] = useState(false);
  const [isInterviewComplete, setIsInterviewComplete] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(activeSession.errorMessage);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(activeSession.evaluation);
  const [sessionId, setSessionId] = useState<string | null>(activeSession.sessionId);
  const [derivedRole, setDerivedRole] = useState<string | null>(activeSession.derivedRole);

  const isMountedRef = useRef(true);
  const isMicActiveRef = useRef(false);

  // ── Question-sequencing state (mode: "buddy" / Coach only) ─────────────
  // The realtime model is unreliable at self-chaining "give coaching
  // feedback -> move to next question" inside one response over a long
  // session, and can re-read the same line from its static question list.
  // These refs make the CLIENT the source of truth for what's already been
  // asked, instead of trusting the model's memory of a long system prompt.

  // Whether a response.create is currently in flight — guards against
  // firing a second one (and getting a duplicate/garbled turn) while one is
  // still active.
  const isResponseActiveRef = useRef(false);
  // What kind of AI turn is currently in flight / was just requested:
  // "question" = asking (or re-asking) an interview question,
  // "coaching"  = giving feedback on the candidate's last answer.
  const turnKindRef = useRef<"question" | "coaching">("question");
  // Set after we send a coaching-feedback response.create — tells the
  // response.done handler to nudge the model to continue to the next
  // question, instead of waiting for the candidate to tap again.
  const awaitingContinuationRef = useRef(false);
  // Set when an interviewer "question" turn's transcript matches one we've
  // already asked — tells response.done to send a corrective nudge instead
  // of the normal continuation nudge.
  const duplicateDetectedRef = useRef(false);
  // Normalized text of every question actually asked so far this session.
  const askedQuestionsRef = useRef<Set<string>>(new Set());
  // Raw text of the most recently (successfully, non-duplicate) asked question.
  // Kept for logging/debugging the dedup check — no longer used to build
  // nudge text (see questionListRef below, which is the actual source of
  // truth for what to ask next).
  const lastAskedQuestionRef = useRef<string | null>(null);
  // Ground-truth ordered question list returned by the backend at session
  // start. The client hands the model the literal text of the next question
  // instead of asking it to recall one from its own system prompt — this is
  // what actually prevents repeats, rather than just detecting them after
  // the fact.
  const questionListRef = useRef<{ question_id: string; question_text: string }[]>([]);
  // Index into questionListRef of the next question to hand the model.
  // Starts at 1 because index 0 is asked by the model itself in its opening
  // turn (greeting + Question 1), per the system prompt.
  const nextQuestionIndexRef = useRef(0);
  // The real DB question_id of whichever question is currently being asked —
  // set right before each question nudge, tagged onto the transcript turn
  // once it's transcribed. This is what lets the backend do cross-session
  // dedup correctly instead of fabricating a random id.
  const currentQuestionIdRef = useRef<string | null>(null);
  // Set the FIRST time the "final question" closing branch fires (i.e. the
  // moment currentCount reaches maxQuestions). Once true, toggleMic ignores
  // all further taps instead of sending anything to the model. Without
  // this, every subsequent tap (e.g. the candidate saying "thank you"
  // after the interview wraps up) re-enters the same closing branch,
  // which the model has no real answer to react to — it was re-running
  // STAR coaching feedback on whatever was just said, and sometimes
  // inventing an extra question on top of the real 6.
  const interviewCompleteRef = useRef(false);

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

  // Sends a data-channel message; swallows errors since the caller already
  // treats these as best-effort / non-fatal (the candidate or a later retry
  // can still recover).
  const safeSend = useCallback((dc: RTCDataChannel, payload: unknown) => {
    try {
      dc.send(JSON.stringify(payload));
      return true;
    } catch {
      return false;
    }
  }, []);

  // Tears down the WebRTC connection and saves the transcript for evaluation.
  // This only ever runs when the user explicitly taps "End Interview" — there
  // is no automatic end-of-interview trigger (e.g. the AI saying a closing
  // phrase does NOT end the session on its own).
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
    isMicActiveRef.current = false;
    if (isMountedRef.current) setIsMicActive(false);

    if (!sid) {
      handleError("No session ID to save");
      return;
    }

    try {
      const result = await saveSession({
        sessionId: sid,
        mode,
        body: { transcript: snapshot, derived_role: role ?? undefined },
      }).unwrap();

      activeSession.evaluation = result.evaluation;
      if (isMountedRef.current) setEvaluation(result.evaluation);
      setStatus("done");
    } catch {
      handleError("Failed to save interview. Your transcript may be lost.");
    }
  }, [saveSession, handleError]);

  // Tap-to-talk: tap once to start (unmute mic), tap again to stop (mute
  // mic, commit the buffered audio, and manually request the AI's
  // response). Guarded on "live" so it's a no-op before the connection is
  // actually up.
  //
  // IMPORTANT: the nudge text sent after each answer is mode-aware.
  // Playground's system prompt explicitly instructs the model to "never
  // evaluate, score, or give feedback during the interview" — it's meant
  // to be a pure interviewer. Buddy/Coach's system prompt is the opposite:
  // it's meant to give STAR coaching feedback after every answer. Sending
  // the same "give STAR feedback" nudge in both modes made Playground
  // ignore its own persona and start coaching, since the latest per-turn
  // instruction was fighting the system prompt. The branch below keeps
  // Buddy's nudge exactly as it was, and gives Playground a nudge that
  // matches what its persona actually promises.
  const toggleMic = useCallback(() => {
    const stream = activeSession.stream;
    const dc = activeSession.dataChannel;
    if (!stream || !dc || activeSession.status !== "live") return;

    if (!isMicActiveRef.current) {
      // Only block unmuting if the AI is actively speaking audio RIGHT NOW.
      if (activeSession.isSpeaking.ai) {
        return;
      }

      // Reset any stuck response state when the user taps to speak
      isResponseActiveRef.current = false;
      awaitingContinuationRef.current = false;
      duplicateDetectedRef.current = false;

      // Start talking
      stream.getAudioTracks().forEach((t) => (t.enabled = true));
      isMicActiveRef.current = true;
      setIsMicActive(true);
      setSpeaking({ user: true, ai: false });
    } else {
      // Stop talking — mute locally regardless of AI response state.
      stream.getAudioTracks().forEach((t) => (t.enabled = false));
      isMicActiveRef.current = false;
      setIsMicActive(false);
      setSpeaking({ user: false, ai: false });

      // The interview has already delivered its closing statement — do not
      // send anything further to the model. Without this guard, tapping
      // the mic again (e.g. the candidate saying "thank you") would
      // re-enter the closing branch below on every subsequent tap, causing
      // the AI to re-run coaching feedback / STAR analysis (and
      // occasionally invent an extra question) instead of staying silent.
      if (interviewCompleteRef.current) {
        return;
      }

      const committed = safeSend(dc, { type: "input_audio_buffer.commit" });
      if (committed) {
        isResponseActiveRef.current = true;

        const isBuddyMode = mode === "buddy";

        const currentCount = nextQuestionIndexRef.current;
        const nextQ = questionListRef.current[currentCount];
        const maxQuestions =
          questionListRef.current.length > 0 ? questionListRef.current.length : isBuddyMode ? 6 : 5;

        let promptText = "";
        if (currentCount < maxQuestions) {
          nextQuestionIndexRef.current += 1;
          if (isBuddyMode) {
            // Buddy/Coach — unchanged. Gives STAR coaching feedback after
            // every answer, then transitions to the next question.
            if (nextQ) {
              currentQuestionIdRef.current = nextQ.question_id;
              promptText = `The candidate has finished speaking their answer. First, provide your 3-step STAR method coaching feedback and model answer reframe for their response (acknowledge their attempt, identify the communication gap, and teach the STAR method reframe). THEN immediately transition and ask the candidate this exact question, verbatim, as your next question: "${nextQ.question_text}"`;
            } else {
              promptText = `The candidate has finished speaking their answer. First, provide your 3-step STAR method coaching feedback and model answer reframe for their response (acknowledge their attempt, identify the communication gap, and teach the STAR method reframe). THEN immediately transition and ask the candidate your next interview question for this role.`;
            }
          } else {
            // Playground — pure interviewer, no coaching/evaluation, per
            // its system prompt. Briefly acknowledge and move straight to
            // the next question.
            if (nextQ) {
              currentQuestionIdRef.current = nextQ.question_id;
              promptText = `The candidate has finished speaking their answer. Do NOT evaluate, score, or give feedback on their answer — this is a practice interview, not a coaching session. In 1 short sentence, briefly and neutrally acknowledge their answer (e.g. "Thank you," or "I see, thanks for sharing that."). THEN immediately ask the candidate this exact question, verbatim, as your next question: "${nextQ.question_text}"`;
            } else {
              promptText = `The candidate has finished speaking their answer. Do NOT evaluate, score, or give feedback on their answer — this is a practice interview, not a coaching session. In 1 short sentence, briefly and neutrally acknowledge their answer. THEN immediately ask the candidate your next interview question, following the interleaved question mix described in your instructions.`;
            }
          }
        } else {
          // Final question just answered — mark the interview complete
          // BEFORE sending, so this is the one and only time this branch
          // runs. Any tap after this point is caught by the guard above.
          interviewCompleteRef.current = true;
          setIsInterviewComplete(true);

          if (isBuddyMode) {
            // Buddy/Coach — unchanged. This prompt is deliberately blunt
            // and repetitive: by this point the model has followed "give
            // feedback THEN ask next question" five times in a row in the
            // same conversation, and a soft "don't ask more questions"
            // aside was not enough to break that habitual pattern.
            promptText = `The candidate has just answered the FINAL question — there are NO more questions left in this session. Do exactly these three things and nothing else: (1) In 1-2 sentences, acknowledge their answer and name one specific communication gap. (2) In 2-3 sentences, give a brief model answer reframed using STAR. (3) Say this closing statement: "That wraps up our session today — great job engaging with every question! Your detailed coaching report is being prepared, so take a look at your evaluation results for the full feedback." CRITICAL RULE, OVERRIDES ALL EARLIER INSTRUCTIONS IN THIS SESSION: Do not ask a next question. Do not say "let's move on" or "next question" or introduce any new topic. Do not end your response with a question of any kind, including a rhetorical one. Your response must not contain a question mark. This is the last thing you say in this interview.`;
          } else {
            // Playground — close out as a plain interviewer, no coaching
            // feedback, matching its "never evaluate, score, or give
            // feedback" system prompt rule.
            promptText = `The candidate has just answered the FINAL question — there are NO more questions left in this session. Do exactly these two things and nothing else: (1) In 1 short sentence, neutrally acknowledge their answer without evaluating or scoring it. (2) Say your closing statement exactly as instructed in your system prompt. CRITICAL RULE, OVERRIDES ALL EARLIER INSTRUCTIONS IN THIS SESSION: Do not ask a next question. Do not give feedback, coaching, or a model answer. Do not say "let's move on" or "next question" or introduce any new topic. Do not end your response with a question of any kind, including a rhetorical one. Your response must not contain a question mark. This is the last thing you say in this interview.`;
          }
        }

        safeSend(dc, {
          type: "conversation.item.create",
          item: {
            type: "message",
            role: "user",
            content: [
              {
                type: "input_text",
                text: promptText,
              },
            ],
          },
        });
        safeSend(dc, { type: "response.create" });
      }
    }
  }, [safeSend, mode]);

  const attachDataChannelListeners = useCallback(
    (dc: RTCDataChannel, sid: string, role: string) => {
      dc.onopen = () => {
        setStatus("live");
        // Kick off the interviewer's opening turn (greeting + Question 1)
        // so the AI greets the candidate first instead of waiting for them
        // to tap the mic.
        turnKindRef.current = "question";
        currentQuestionIdRef.current = questionListRef.current[0]?.question_id ?? null;
        nextQuestionIndexRef.current = 1;
        if (safeSend(dc, { type: "response.create" })) {
          isResponseActiveRef.current = true;
        }
      };

      dc.onclose = () => {
        // Auto-save on unexpected disconnect if we have transcript content
        if (activeSession.status === "live" && activeSession.transcript.length > 0) {
          const snapshot = [...activeSession.transcript];
          setStatus("saving");
          saveSession({ sessionId: sid, mode, body: { transcript: snapshot, derived_role: role } })
            .unwrap()
            .then((res: { evaluation: EvaluationResult }) => {
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

        // NOTE: no server-side VAD handling here (no
        // input_audio_buffer.speech_started/stopped) — turn-taking is fully
        // manual via toggleMic, which sets `isSpeaking.user` itself.
        const appendInterviewerTurn = (text: string) => {
          const trimmed = text.trim();
          if (!trimmed) return;

          const lastTurn = activeSession.transcript[activeSession.transcript.length - 1];
          if (lastTurn && lastTurn.role === "interviewer") {
            if (lastTurn.text === trimmed) {
              return; // Already recorded exact same turn text
            }
            if (trimmed.startsWith(lastTurn.text)) {
              // Streaming extension: update last turn with the fuller
              // transcript text. Goes through the store's dedicated
              // update function so subscribers (React state) are actually
              // notified — calling onTranscriptChange directly here was a
              // bug: it's a subscribe function, not a notify/emit function.
              updateLastTranscriptTurn(trimmed);
              return;
            }
          }

          appendTranscriptTurn({
            role: "interviewer",
            text: trimmed,
            timestamp: new Date().toISOString(),
            question_id: currentQuestionIdRef.current ?? undefined,
          });
        };

        switch (type) {
          case "response.created":
            isResponseActiveRef.current = true;
            setSpeaking({ user: false, ai: true });
            break;

          case "response.cancel":
          case "response.failed":
            isResponseActiveRef.current = false;
            setSpeaking({ user: false, ai: false });
            break;

          case "response.done": {
            isResponseActiveRef.current = false;
            setSpeaking({ user: activeSession.isSpeaking.user, ai: false });

            // Robust fallback: extract audio transcript directly from response output if missed
            const respObj = parsed["response"] as { output?: any[] } | undefined;
            if (respObj && Array.isArray(respObj.output)) {
              for (const item of respObj.output) {
                if (item?.role === "assistant" && Array.isArray(item.content)) {
                  for (const part of item.content) {
                    const tText = (part?.transcript || part?.text || "").trim();
                    if (tText) {
                      appendInterviewerTurn(tText);
                    }
                  }
                }
              }
            }
            break;
          }

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
              appendInterviewerTurn(text);
            }
            break;
          }

          case "error": {
            const err = parsed["error"] as { message?: string; code?: string } | undefined;
            const errCode = err?.code || "";
            // These codes/messages are routine Realtime API notices, not
            // real failures — e.g. the candidate tapped the mic off with
            // little/no audio buffered (input_audio_buffer_commit_empty),
            // or a response.create raced with one already in flight. Log
            // and reset in-flight state, but do NOT surface them as a
            // fatal connection error.
            const isNonFatal =
              errCode === "input_audio_buffer_commit_empty" ||
              errCode === "response_cancel_failed" ||
              errCode === "no_active_response" ||
              errCode === "active_response_in_progress" ||
              errCode === "conversation_already_has_active_response" ||
              (err?.message && err.message.includes("buffer too small"));

            if (isNonFatal) {
              console.warn("Non-fatal Realtime API notice:", err?.message || errCode);
              isResponseActiveRef.current = false;
              awaitingContinuationRef.current = false;
              duplicateDetectedRef.current = false;
              setSpeaking({ user: false, ai: false });
              break;
            }

            console.error("Fatal Realtime API error:", err);
            isResponseActiveRef.current = false;
            awaitingContinuationRef.current = false;
            duplicateDetectedRef.current = false;
            setSpeaking({ user: false, ai: false });
            handleError(err?.message ?? "The interview connection reported an error.");
            break;
          }

          default:
            break;
        }
      };
    },
    [saveSession, handleError, safeSend],
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
    isMicActiveRef.current = false;
    setIsMicActive(false);
    setIsInterviewComplete(false);
    setStatus("starting");

    // Reset question-sequencing state for the new session.
    isResponseActiveRef.current = false;
    turnKindRef.current = "question";
    awaitingContinuationRef.current = false;
    duplicateDetectedRef.current = false;
    askedQuestionsRef.current = new Set();
    lastAskedQuestionRef.current = null;
    questionListRef.current = [];
    nextQuestionIndexRef.current = 0;
    interviewCompleteRef.current = false;

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
    // Ground-truth ordered question list from the backend. Index 0 is asked
    // by the model itself in its opening turn (greeting + Question 1), so
    // the pointer for app-driven nudges starts at 1.
    questionListRef.current = backendData.questions ?? [];
    nextQuestionIndexRef.current = 1;
    if (isMountedRef.current) {
      setSessionId(backendData.session_id);
      setDerivedRole(backendData.derived_role);
    }

    setStatus("connecting");

    try {
      const stream = await mediaDevices?.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      if (!stream) throw new Error("No media stream returned from getUserMedia");
      activeSession.stream = stream;

      // Mic starts muted — the user must tap to talk. Prevents any audio
      // (including AI playback bleeding into the mic) from being sent before
      // the user explicitly starts their turn.
      stream.getAudioTracks().forEach((t) => {
        t.enabled = false;
      });

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
        backendData.ephemeral_token ||
        (backendData as unknown as { realtime_token?: string }).realtime_token;
      if (!token) {
        throw new Error("No authentication token returned by server.");
      }

      const sdpResponse = await fetch(backendData.webrtc_sdp_url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/sdp",
        },
        body: offer.sdp,
      });

      if (!sdpResponse.ok) {
        const errorDetail = await sdpResponse.text().catch(() => "");
        console.error("OpenAI SDP Exchange Error:", sdpResponse.status, errorDetail);
        if (sdpResponse.status === 401) {
          throw new Error(
            "OpenAI Realtime authentication failed (401). Please check that a valid OPENAI_API_KEY is configured in the backend server.",
          );
        }
        throw new Error(`OpenAI SDP exchange failed: ${sdpResponse.status} ${errorDetail}`);
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
    // The ONLY way an interview ends — explicit user action via the
    // "End Interview" button. Nothing else in this hook calls finalizeSession.
    await finalizeSession();
  }, [finalizeSession]);

  return {
    status,
    transcript,
    isSpeaking,
    isMicActive,
    errorMessage,
    evaluation,
    sessionId,
    derivedRole,
    isInterviewComplete,
    startInterview,
    endInterview,
    toggleMic,
  };
}
