/**
 * src/features/interview/screens/LiveInterviewScreen.tsx
 *
 * Live Interview Screen — supports three modes:
 *
 *   mode = "coach"  (default)
 *     • Per-question flow driven by practiceApiSlice.
 *     • Question TTS plays first; mic is disabled until playback finishes.
 *     • On stop: submit per-question audio → /interview/feedback.
 *
 *   mode = "mock"
 *     • Full-session recording driven by interviewApiSlice.
 *     • All questions JSON is passed via questionsJson param.
 *     • Question TTS plays before first recording AND between questions.
 *     • ONE continuous recording spans all questions.
 *     • On stop: submit full audio to mock endpoint → /interview/summary.
 *
 *   mode = "standalone"  ← INTERVIEW COACH (no API required)
 *     • Uses static INTERVIEW_QUESTIONS bank, index passed via route param.
 *     • On stop: generate mock score → feedback or summary.
 *     • Zero API calls — works fully offline.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, router, Stack } from "expo-router";
import * as Speech from "expo-speech";

import { Waveform } from "@/components/Waveform";
import { useRealtimeWaveform } from "@/hooks/useRealtimeWaveform";
import { logger } from "@/utils/logger";
import type { LiveIndicators } from "../types/interview.types";
import { useLiveIndicators } from "../hooks/useLiveIndicators";
import { type IndicatorStatus } from "../components";
import {
  useLazyStartPracticeQuestionQuery,
  useSubmitPracticeAnswerMutation,
} from "@/services/practiceApiSlice";
import { useSubmitMockInterviewAudioMutation } from "@/services/interviewApiSlice";
import { useAppSelector } from "@/store/hooks";
import { INTERVIEW_QUESTIONS, getQuestionsForSession } from "../hooks/useInterview";

// ── Coaching tips ─────────────────────────────────────────────────────────────

const LIVE_TIPS = [
  "Speak clearly and at a steady pace.",
  "Avoid filler words like 'um' and 'uh'.",
  "Take a moment to think before answering.",
  "Provide specific examples in your response.",
  "Maintain a confident tone throughout.",
  "Structure your answer using the STAR method.",
  "Keep your response concise and relevant.",
  "Make eye contact (imagine the interviewer).",
] as const;

// ── Simulator constants ───────────────────────────────────────────────────────

const INDICATOR_TICK_MS    = 800;
const SPEAKING_PHASE_MIN_MS = 3000;
const SPEAKING_PHASE_MAX_MS = 6000;

function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v));
}
function jitter(amount: number) {
  return (Math.random() - 0.5) * 2 * amount;
}

function simulateIndicatorTick(
  prev: LiveIndicators,
  isSpeaking: boolean,
): LiveIndicators {
  if (isSpeaking) {
    return {
      speakingPace: clamp(prev.speakingPace + jitter(15), 100, 220),
      clarity:      clamp(prev.clarity      + jitter(6),   55,  98),
      fillerCount:  clamp(prev.fillerCount  + (Math.random() < 0.15 ? 1 : 0), 0, 12),
      confidence:   clamp(prev.confidence   + jitter(5),   50,  97),
      timestamp:    Date.now(),
    };
  }
  return {
    speakingPace: clamp(prev.speakingPace * 0.92,                        0,  220),
    clarity:      clamp(prev.clarity      + (75 - prev.clarity)  * 0.1,  55,  98),
    fillerCount:  prev.fillerCount,
    confidence:   clamp(prev.confidence   + (75 - prev.confidence) * 0.08, 50, 97),
    timestamp:    Date.now(),
  };
}

// ── Indicator value + status helpers ─────────────────────────────────────────

/** Map raw WPM to a 0-100 quality score (200 WPM = ceiling). */
function paceToValue(wpm: number): number {
  return Math.round(clamp((wpm / 200) * 100, 0, 100));
}
function paceToStatus(wpm: number): IndicatorStatus {
  if (wpm >= 110 && wpm <= 170) return "Good";
  if (wpm >= 80  && wpm <= 210) return "OK";
  return "Low";
}

/** Invert filler count: 0 fillers → 100, 10+ fillers → 0. */
function fillerToValue(count: number): number {
  return Math.max(0, Math.round((1 - Math.min(count, 10) / 10) * 100));
}
function fillerToStatus(count: number): IndicatorStatus {
  if (count <= 2) return "Good";
  if (count <= 5) return "OK";
  return "Low";
}

function clarityToStatus(score: number): IndicatorStatus {
  if (score >= 75) return "Good";
  if (score >= 55) return "OK";
  return "Low";
}

// ── Indicator colour helpers ──────────────────────────────────────────────────

function statusColor(s: IndicatorStatus): string {
  return s === "Good" ? "#22C55E" : s === "OK" ? "#F59E0B" : "#EF4444";
}
function statusBgColor(s: IndicatorStatus): string {
  return s === "Good" ? "#DCFCE7" : s === "OK" ? "#FEF3C7" : "#FEE2E2";
}

// ── Platform layout constants ─────────────────────────────────────────────────

const IS_WEB     = Platform.OS === "web";
const ORB_OUTER  = IS_WEB ? 310 : 240;
const ORB_INNER  = IS_WEB ? 278 : 212;
const WAVEFORM_W = IS_WEB ? 176 : 140;
const WAVEFORM_H = IS_WEB ?  84 :  66;

// ── Minimal type for mock question queue ──────────────────────────────────────

interface MockQuestion {
  id:   string;
  text: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function LiveInterviewScreen() {
  // ── Route params ────────────────────────────────────────────────────────────
  const params = useLocalSearchParams<Record<string, string>>();

  /** "coach" (default), "mock", or "standalone" (Interview Coach, no API). */
  const mode: "coach" | "mock" | "standalone" =
    params?.mode === "mock"       ? "mock"       :
    params?.mode === "standalone" ? "standalone" : "coach";

  const sessionId:      string = params?.sessionId      ?? "";
  const questionId:     string = params?.questionId     ?? "";
  const questionText:   string = params?.questionText   ?? "Loading question...";
  const questionIndex:  number = params?.questionIndex
    ? (parseInt(params.questionIndex, 10)  || 1)
    : 1;
  const totalQuestions: number = params?.totalQuestions
    ? (parseInt(params.totalQuestions, 10) || 1)
    : 1;
  const nextQuestionId:   string = params?.nextQuestionId   ?? "";
  const nextQuestionText: string = params?.nextQuestionText ?? "";

  /** JSON-encoded question array for mock mode. */
  const questionsJson: string = params?.questionsJson ?? "";

  // ── Standalone mode: static question bank, state passed via route params ──────
  /** Session type param — used to pick the right question bank in standalone mode. */
  const sessionType: string = params?.sessionType ?? "";

  /**
   * Active question bank for standalone mode.
   * Resolved once from route params so it stays stable across re-renders.
   */
  const standaloneQuestions = useMemo(
    () => (mode === "standalone" ? getQuestionsForSession(sessionType) : INTERVIEW_QUESTIONS),
    [mode, sessionType],
  );

  /** 0-based index of the current question in the standalone question bank. */
  const standaloneIndex: number = useMemo(
    () => (mode === "standalone" ? (parseInt(params?.questionIndex || "0", 10) || 0) : 0),
    [mode, params?.questionIndex],
  );
  /** Previously captured answers (accumulated across navigations via params). */
  const standalonePrevAnswers = useMemo<string[]>(() => {
    if (mode !== "standalone") return [];
    try { return JSON.parse(params?.answersJson || "[]") as string[]; } catch { return []; }
  }, [mode, params?.answersJson]);
  /** Previously captured mock scores (accumulated across navigations via params). */
  const standalonePrevScores = useMemo<number[]>(() => {
    if (mode !== "standalone") return [];
    try { return JSON.parse(params?.scoresJson || "[]") as number[]; } catch { return []; }
  }, [mode, params?.scoresJson]);

  // ── Mock question queue (parsed once) ────────────────────────────────────────
  const mockQuestions = useMemo<MockQuestion[]>(() => {
    if (mode !== "mock" || !questionsJson) return [];
    try   { return JSON.parse(questionsJson) as MockQuestion[]; }
    catch { return []; }
  }, [mode, questionsJson]);

  // ── Coach-flow identity ──────────────────────────────────────────────────────
  const profileCandidateId = useAppSelector((s) => s.profile.candidateId);
  const candidateId: string = profileCandidateId || params?.candidateId || "";

  const [triggerStartQuestion] = useLazyStartPracticeQuestionQuery();
  const [submitAnswer]         = useSubmitPracticeAnswerMutation();
  /** Mock-mode full-session audio submission. */
  const [submitMockAudio]      = useSubmitMockInterviewAudioMutation();

  // ── Active session values (may be resolved async on mount for coach flow) ────
  const [isInitializing,         setIsInitializing]         = useState<boolean>(
    // Standalone mode never needs an API call — skip init spinner entirely.
    mode === "standalone" ? false : (!sessionId && Boolean(candidateId)),
  );
  const [activeSessionId,        setActiveSessionId]        = useState<string>(sessionId);
  const [activeQuestionId,       setActiveQuestionId]       = useState<string>(questionId);
  const [activeQuestionText,     setActiveQuestionText]     = useState<string>(questionText);
  const [activeNextQuestionId,   setActiveNextQuestionId]   = useState<string>(nextQuestionId);
  const [activeNextQuestionText, setActiveNextQuestionText] = useState<string>(nextQuestionText);
  const [activeTotalQuestions,   setActiveTotalQuestions]   = useState<number>(totalQuestions);

  // ── Audio-gating state ───────────────────────────────────────────────────────
  /** True while TTS is reading the question aloud. Mic is disabled during this. */
  const [isQuestionPlaying,  setIsQuestionPlaying]  = useState<boolean>(false);
  /** True once TTS has finished — allows the user to start recording. */
  const [isRecordingEnabled, setIsRecordingEnabled] = useState<boolean>(false);
  /** Current question index in the mock queue (mock mode only). */
  const [mockQuestionIndex,  setMockQuestionIndex]  = useState<number>(0);
  /** Full-session audio URI captured when the last mock question is stopped. */
  const [fullSessionAudioUri, setFullSessionAudioUri] = useState<string | null>(null);
  /**
   * True after the user taps mic for the first time in mock mode.
   * Prevents restarting the recording if isRecordingEnabled flips back to true
   * between questions while the session is still live.
   */
  const [hasRecordingStarted, setHasRecordingStarted] = useState<boolean>(false);

  useEffect(() => {
    if (!paramSettledRef.current) {
      paramSettledRef.current = true;
      return;
    }
    // Standalone mode has no sessionId/questionId — skip the alert entirely.
    if (mode !== "standalone" && !isInitializing && (!activeSessionId || !activeQuestionId)) {
      Alert.alert(
        "Invalid Session",
        "Session or question ID is missing. Please try again.",
      );
    }
  }, [activeSessionId, activeQuestionId, isInitializing]);

  // ── Waveform ─────────────────────────────────────────────────────────────────
  const { isRecording, bars, start, stop } = useRealtimeWaveform();

  // ── Live indicators ──────────────────────────────────────────────────────────
  const { indicators, isConnected, connectionType, isLoading, error } = useLiveIndicators({
    sessionId:       activeSessionId,
    questionId:      activeQuestionId,
    enableWebSocket: Boolean(activeSessionId && activeQuestionId),
  });

  // ── Local state ───────────────────────────────────────────────────────────────
  const [seconds,      setSeconds]      = useState<number>(0);
  const [isSpeaking,   setIsSpeaking]   = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [simulatedIndicators, setSimulatedIndicators] = useState<LiveIndicators>({
    speakingPace: 130,
    clarity:      75,
    fillerCount:  0,
    confidence:   72,
    timestamp:    Date.now(),
  });

  // ── Refs ──────────────────────────────────────────────────────────────────────
  const mountedRef              = useRef<boolean>(true);
  const paramSettledRef         = useRef<boolean>(false);
  const tipIndexRef             = useRef<number>(0);
  const speakingPhaseTimeoutRef = useRef<ReturnType<typeof setTimeout>  | null>(null);
  const indicatorTickRef        = useRef<ReturnType<typeof setInterval> | null>(null);
  const isSpeakingRef           = useRef<boolean>(false);
  const pulseAnim               = useRef(new Animated.Value(1)).current;
  const glowAnim                = useRef(new Animated.Value(0)).current;
  /** Last text sent to TTS — prevents re-playing the same question. */
  const prevTTSTextRef          = useRef<string>("");
  /**
   * Mirrors `isRecording` so TTS `onDone` callbacks can read the live value
   * without a stale closure (TTS callbacks are created inside the effect and
   * are never re-created between questions).
   */
  const isRecordingRef          = useRef<boolean>(false);

  // ── Mount / unmount ───────────────────────────────────────────────────────────
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      Speech.stop();
      if (speakingPhaseTimeoutRef.current) clearTimeout(speakingPhaseTimeoutRef.current);
      if (indicatorTickRef.current)        clearInterval(indicatorTickRef.current);
    };
  }, []);

  // ── Coach-flow: fetch first question when no sessionId was supplied ───────────
  useEffect(() => {
    if (mode !== "coach") return;
    if (sessionId) return;
    
    let cancelled = false;
    (async () => {
      try {
        if (!candidateId) {
          console.warn("No candidateId provided, using mock data immediately.");
          throw new Error("Missing candidateId");
        }
        const result = await triggerStartQuestion({ userId: candidateId });
        if (cancelled || !mountedRef.current) return;
        let q = result.data;
        if (!q || result.error) {
          console.warn("API failed or returned no question, using mock data.");
          throw new Error("API failure");
        }
        const newSessionId = `coach-${candidateId}-${Date.now()}`;
        setActiveSessionId(newSessionId);
        setActiveQuestionId(q.id);
        setActiveQuestionText(q.text);
      } catch (err) {
        if (!cancelled && mountedRef.current) {
          console.warn("Fetch threw error or no candidateId, switching to standalone mock flow:", err);
          router.replace({ pathname: "/interview/question", params: { mode: "standalone", questionIndex: "0" } });
        }
      } finally {
        if (!cancelled && mountedRef.current) setIsInitializing(false);
      }
    })();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Question TTS — plays question audio then enables mic ─────────────────────
  //
  // • coach mode: fires when activeQuestionText becomes a real question string
  //               (after coach-flow init resolves, or immediately if passed in params).
  // • mock mode:  fires on mount (mockQuestionIndex = 0) and each time the user
  //               advances to the next question.
  const questionTextForTTS =
    mode === "mock"        ? (mockQuestions[mockQuestionIndex]?.text       ?? "") :
    mode === "standalone"  ? (standaloneQuestions[standaloneIndex]?.text  ?? "") :
                             activeQuestionText;

  useEffect(() => {
    // Don't play empty or placeholder text.
    if (!questionTextForTTS || questionTextForTTS === "Loading question...") return;
    // Don't replay the same text twice (handles React StrictMode double-invoke).
    if (questionTextForTTS === prevTTSTextRef.current) return;
    // In coach mode, wait until the question has been fetched from the API.
    if (mode === "coach" && isInitializing) return;

    prevTTSTextRef.current = questionTextForTTS;
    // Capture the current mock index at effect-creation time.
    // Because questionTextForTTS changes whenever mockQuestionIndex changes,
    // this effect always re-runs with a fresh index — no stale-closure issue.
    const capturedMockIdx = mockQuestionIndex;
    let cancelled = false;

    setIsQuestionPlaying(true);
    setIsRecordingEnabled(false);
    Speech.stop();

    /** Called when TTS finishes (done / stopped / error). */
    const handleTTSEnd = (isError = false) => {
      if (cancelled || !mountedRef.current) return;
      setIsQuestionPlaying(false);

      // ── Mock mode — auto-advance while recording is live ─────────────────────
      // After the first question's TTS (recording not yet started), enable the
      // mic normally so the user can tap to begin the session.  Once recording is
      // running, advance questions automatically without any button press.
      if (mode === "mock" && isRecordingRef.current && !isError) {
        const nextIdx = capturedMockIdx + 1;
        if (nextIdx < mockQuestions.length) {
          // Not the last question — advance silently; recording continues.
          setMockQuestionIndex(nextIdx);
          // isRecordingEnabled stays false; orb mic stays locked.
          return;
        }
        // Last question TTS finished — allow user to submit.
      }

      // Default: enable the mic (coach flow, first mock question, or last mock question).
      setIsRecordingEnabled(true);
    };

    Speech.speak(questionTextForTTS, {
      language: "en-US",
      rate:     0.95,
      pitch:    1.0,
      onDone:    () => handleTTSEnd(false),
      onStopped: () => handleTTSEnd(false),
      onError:   () => handleTTSEnd(true),   // on error always enable mic
    });

    return () => {
      cancelled = true;
      Speech.stop();
    };
  }, [questionTextForTTS, mode, isInitializing]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep isSpeakingRef in sync so the simulator interval can read the live value.
  useEffect(() => { isSpeakingRef.current  = isSpeaking;   }, [isSpeaking]);
  // Keep isRecordingRef in sync so TTS onDone callbacks can read the live value.
  useEffect(() => { isRecordingRef.current = isRecording;  }, [isRecording]);

  // ── Timer ─────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isRecording) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [isRecording]);

  // ── Speaking-phase simulator ─────────────────────────────────────────────────
  const scheduleSpeakingPhase = useCallback(() => {
    if (!mountedRef.current) return;
    const duration =
      SPEAKING_PHASE_MIN_MS +
      Math.random() * (SPEAKING_PHASE_MAX_MS - SPEAKING_PHASE_MIN_MS);
    setIsSpeaking((prev) => !prev);
    speakingPhaseTimeoutRef.current = setTimeout(() => {
      if (mountedRef.current) scheduleSpeakingPhase();
    }, duration);
  }, []);

  useEffect(() => {
    if (!isRecording) {
      setIsSpeaking(false);
      if (speakingPhaseTimeoutRef.current) {
        clearTimeout(speakingPhaseTimeoutRef.current);
        speakingPhaseTimeoutRef.current = null;
      }
      return;
    }
    setIsSpeaking(true);
    const first =
      SPEAKING_PHASE_MIN_MS +
      Math.random() * (SPEAKING_PHASE_MAX_MS - SPEAKING_PHASE_MIN_MS);
    speakingPhaseTimeoutRef.current = setTimeout(() => {
      if (mountedRef.current) scheduleSpeakingPhase();
    }, first);
    return () => {
      if (speakingPhaseTimeoutRef.current) {
        clearTimeout(speakingPhaseTimeoutRef.current);
        speakingPhaseTimeoutRef.current = null;
      }
    };
  }, [isRecording, scheduleSpeakingPhase]);

  // ── Indicator simulator ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!isRecording) {
      if (indicatorTickRef.current) {
        clearInterval(indicatorTickRef.current);
        indicatorTickRef.current = null;
      }
      return;
    }
    indicatorTickRef.current = setInterval(() => {
      if (mountedRef.current) {
        setSimulatedIndicators((prev) =>
          simulateIndicatorTick(prev, isSpeakingRef.current),
        );
      }
    }, INDICATOR_TICK_MS);
    return () => {
      if (indicatorTickRef.current) {
        clearInterval(indicatorTickRef.current);
        indicatorTickRef.current = null;
      }
    };
  }, [isRecording]);

  // ── Pulse / glow animation ────────────────────────────────────────────────────
  useEffect(() => {
    if (!isRecording) {
      pulseAnim.setValue(1);
      glowAnim.setValue(0);
      return;
    }
    const peakScale = isSpeaking ? 1.04  : 1.015;
    const peakGlow  = isSpeaking ? 0.45  : 0.22;
    const duration  = isSpeaking ? 550   : 900;

    const loop = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: peakScale, duration, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1,         duration, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: peakGlow,                    duration, useNativeDriver: true }),
          Animated.timing(glowAnim, { toValue: isSpeaking ? 0.18 : 0.08,   duration, useNativeDriver: true }),
        ]),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [isRecording, isSpeaking, pulseAnim, glowAnim]);

  // ── Active indicators ─────────────────────────────────────────────────────────
  const active = useMemo<LiveIndicators>(
    () => indicators ?? simulatedIndicators,
    [indicators, simulatedIndicators],
  );

  // ── Timer label ───────────────────────────────────────────────────────────────
  const formattedTime = useMemo<string>(() => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }, [seconds]);

  // ── Dynamic coaching tip ──────────────────────────────────────────────────────
  const dynamicTip = useMemo<string>(() => {
    if (active.fillerCount  >  5) return "Avoid filler words like 'um' and 'uh'.";
    if (active.clarity      < 60) return "Speak more clearly and enunciate your words.";
    if (active.speakingPace > 180) return "Slow down your speech for clarity.";
    return LIVE_TIPS[tipIndexRef.current % LIVE_TIPS.length] ?? LIVE_TIPS[0];
  }, [active]);

  // ── Derived display values ────────────────────────────────────────────────────
  /** Question text shown in the question card. */
  const displayQuestionText =
    mode === "mock"       ? (mockQuestions[mockQuestionIndex]?.text       ?? "Loading question...") :
    mode === "standalone" ? (standaloneQuestions[standaloneIndex]?.text   ?? "Loading question...") :
                            (activeQuestionText || "Loading question...");

  /** 1-based index shown in the question badge. */
  const displayQuestionIndex =
    mode === "mock"       ? mockQuestionIndex + 1 :
    mode === "standalone" ? standaloneIndex + 1   :
                            questionIndex;

  /** Total count shown in the question badge. */
  const displayTotalQuestions =
    mode === "mock"       ? mockQuestions.length         :
    mode === "standalone" ? standaloneQuestions.length   :
                            totalQuestions;

  // ── Mic button disabled logic ─────────────────────────────────────────────────
  //
  // Disabled when:
  //   • Submitting answer/audio
  //   • Question TTS is playing (before the first recording AND between questions
  //     in mock mode while the session is live)
  //   • Recording hasn't been enabled yet by TTS completion
  //
  // Note: !isRecordingEnabled is NOT wrapped in !isRecording so that the mic
  // stays locked during inter-question TTS even while the session is recording.
  const isMicDisabled = isSubmitting || isQuestionPlaying || !isRecordingEnabled;

  // ── Recording handlers ────────────────────────────────────────────────────────

  const handleStartRecording = useCallback(async (): Promise<void> => {
    // In mock mode the session records exactly once — guard against a second tap.
    if (mode === "mock" && hasRecordingStarted) return;
    try {
      setSeconds(0);
      tipIndexRef.current = (tipIndexRef.current + 1) % LIVE_TIPS.length;
      await start();
      if (mode === "mock") {
        setHasRecordingStarted(true);
        // Eagerly sync the ref so the TTS onDone callback that fires for Q2
        // onwards can see that recording is live (state propagates asynchronously).
        isRecordingRef.current = true;
        // Q1 TTS has already played — advance to Q2 now to trigger its TTS.
        // All subsequent advances are handled automatically in the TTS onDone.
        if (mockQuestions.length > 1) {
          setMockQuestionIndex(1);
        }
        // Keep isRecordingEnabled false; orb mic is locked while Q2+ TTS plays.
        // The orb and submit button re-enable only after the last question's TTS.
        setIsRecordingEnabled(false);
      }
    } catch (err) {
      logger.error("Start recording error:", err);
      Alert.alert("Error", "Failed to start recording. Check microphone permissions.");
    }
  }, [start, mode, hasRecordingStarted, mockQuestions.length]);

  const handleStopRecording = useCallback(async (): Promise<void> => {
    if (isSubmitting) return;

    // ── Stop the recording ───────────────────────────────────────────────────
    // In mock mode the orb mic is disabled on non-last questions (isRecordingEnabled
    // stays false), and the fixed "Submit Session" button only appears on the last
    // question, so this function is only reachable when it's safe to stop.
    try {
      setIsSubmitting(true);
      const audioUri = await stop();
      if (!audioUri) throw new Error("No audio was recorded.");
      logger.log("Recording stopped — audio URI:", audioUri);
      if (!mountedRef.current) return;

      // ── Standalone mode (Interview Coach): static questions, mock scoring ──────
      if (mode === "standalone") {
        console.log("Mock Screen Active");
        console.log("Stop Recording Clicked");

        const currentQ   = standaloneQuestions[standaloneIndex];
        // Deterministic mock score: 6–10, varies by question + answer length
        const mockScore  = Math.min(10, 6 + ((standaloneIndex * 3 + (audioUri?.length ?? 0)) % 5));
        const newAnswers = [...standalonePrevAnswers, "Voice answer recorded"];
        const newScores  = [...standalonePrevScores,  mockScore];
        const isLastQ    = standaloneIndex >= standaloneQuestions.length - 1;

        console.log("Routing to Feedback");
        if (isLastQ) console.log("Last question feedback - button will say Finish Interview");

        router.push({
          pathname: "/interview/feedback",
          params: {
            // Standalone feedback params
            standalone:     "true",
            question:       currentQ.text,
            answer:         "Voice answer recorded",
            score:          String(mockScore),
            questionIndex:  String(standaloneIndex),
            totalQuestions: String(standaloneQuestions.length),
            sessionType,                              // ← carry forward so next Q uses same bank
            // Accumulate state for the next question or summary
            nextIndex:      String(standaloneIndex + 1),
            answersJson:    JSON.stringify(newAnswers),
            scoresJson:     JSON.stringify(newScores),
          },
        });
        return;
      }

      // ── Mock mode: last question — submit full session audio ─────────────────
      if (mode === "mock") {
        setFullSessionAudioUri(audioUri);
        const result = await submitMockAudio({ audioUri, sessionId: activeSessionId });
        if (!mountedRef.current) return;
        if (result.error) {
          Alert.alert("Error", "Failed to submit mock interview audio.");
          return;
        }
        router.push({
          pathname: "/interview/summary",
          params:   { sessionId: activeSessionId },
        });
        return;
      }

      // ── Coach mode: submit per-question audio ────────────────────────────────
      let resolvedNextId    = activeNextQuestionId;
      let resolvedNextText  = activeNextQuestionText;
      let resolvedTotal     = activeTotalQuestions;

      if (candidateId && activeQuestionId) {
        const result = await submitAnswer({
          audioUri,
          userId:     candidateId,
          questionId: activeQuestionId,
        });
        if (!mountedRef.current) return;
        if (!result.error && result.data) {
          const { nextQuestion, practiceComplete } = result.data;
          if (practiceComplete || !nextQuestion) {
            resolvedTotal    = questionIndex;
            resolvedNextId   = "";
            resolvedNextText = "";
          } else {
            resolvedNextId   = nextQuestion.id;
            resolvedNextText = nextQuestion.text;
            if (resolvedTotal <= questionIndex) resolvedTotal = questionIndex + 1;
          }
          setActiveNextQuestionId(resolvedNextId);
          setActiveNextQuestionText(resolvedNextText);
          setActiveTotalQuestions(resolvedTotal);
        }
      }

      router.push({
        pathname: "/interview/feedback",
        params: {
          sessionId:        activeSessionId,
          questionId:       activeQuestionId,
          questionIndex:    String(questionIndex),
          totalQuestions:   String(resolvedTotal),
          nextQuestionId:   resolvedNextId,
          nextQuestionText: resolvedNextText,
        },
      });
    } catch (err) {
      logger.error("Stop recording error:", err);
      if (mountedRef.current) {
        Alert.alert("Error", err instanceof Error ? err.message : "Failed to stop recording.");
      }
    } finally {
      if (mountedRef.current) setIsSubmitting(false);
    }
  }, [
    isSubmitting, stop, mode,
    submitMockAudio,
    candidateId, activeSessionId, activeQuestionId,
    activeNextQuestionId, activeNextQuestionText, activeTotalQuestions,
    questionIndex, submitAnswer,
  ]);

  // ── Render ────────────────────────────────────────────────────────────────────

  if (isInitializing) {
    return (
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.initText}>Loading interview question...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Indicator rows data ────────────────────────────────────────────────────
  const indicatorRows: { label: string; value: number; status: IndicatorStatus }[] = [
    { label: "Speaking Pace", value: paceToValue(active.speakingPace),  status: paceToStatus(active.speakingPace)  },
    { label: "Clarity",       value: active.clarity,                    status: clarityToStatus(active.clarity)    },
    { label: "Filler Words",  value: fillerToValue(active.fillerCount), status: fillerToStatus(active.fillerCount) },
  ];

  // ── Mock derived values ───────────────────────────────────────────────────────
  const isLastMockQuestion =
    mode === "mock" && mockQuestionIndex === mockQuestions.length - 1;

  /**
   * "Stop / Submit" button:
   *   coach → always visible while recording
   *   mock  → only visible on the last question; earlier questions auto-advance
   *           via TTS so there is nothing for the user to tap until the end.
   */
  const showStopBtn = isRecording && (mode === "coach" || mode === "standalone" || isLastMockQuestion);

  // ── Header back button handler ────────────────────────────────────────────────
  const handleHeaderBack = useCallback(() => {
    if (isRecording) {
      Alert.alert(
        "Exit Interview?",
        "You are currently recording. Exiting now will discard this answer.",
        [
          { text: "Keep Recording", style: "cancel" },
          {
            text: "Exit",
            style: "destructive",
            onPress: () => {
              stop().catch(() => {});
              router.push("/interview/coach" as never);
            },
          },
        ]
      );
    } else {
      router.push("/interview/coach" as never);
    }
  }, [isRecording, stop]);

  return (
    <>
      {/* Inject dynamic header back button so it works on both Android and iOS */}
      <Stack.Screen
        options={{
          headerLeft: () => (
            <TouchableOpacity
              onPress={handleHeaderBack}
              style={{ paddingHorizontal: 8, paddingVertical: 4 }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialCommunityIcons name="arrow-left" size={24} color="#1D4ED8" />
            </TouchableOpacity>
          ),
        }}
      />
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      {/* ── Header with Exit Button ─────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.exitButton}
          onPress={() => router.replace("/interview-sessions")}
          disabled={isSubmitting || isQuestionPlaying}
        >
          <MaterialCommunityIcons name="arrow-left" size={20} color="#475569" />
          <Text style={styles.exitButtonText}>Exit</Text>
        </TouchableOpacity>
      </View>

      {/* ── Scrollable body ─────────────────────────────────────────────────── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Connection warning banner ──────────────────────────────────────── */}
        {!isConnected && (
          <View style={styles.banner}>
            <MaterialCommunityIcons
              name="wifi-strength-alert-outline"
              size={15}
              color="#92400E"
              style={styles.bannerIcon}
            />
            <Text style={styles.bannerText}>
              Live indicators updating every few seconds
            </Text>
          </View>
        )}

        {/* ── Question TTS playing banner ──────────────────────────────────────── */}
        {isQuestionPlaying && (
          <View style={styles.audioPlayingBanner}>
            <MaterialCommunityIcons name="volume-high" size={14} color="#1D4ED8" />
            <Text style={styles.audioPlayingText}>Listen to the question…</Text>
          </View>
        )}

        {/* ── Question card ────────────────────────────────────────────────────── */}
        <View style={styles.card}>
          <View style={styles.questionBadge}>
            <MaterialCommunityIcons name="help-circle-outline" size={14} color="#2563EB" />
            <Text style={styles.questionBadgeText}>
              Question {displayQuestionIndex} of {displayTotalQuestions}
            </Text>
          </View>
          <Text style={styles.questionText}>{displayQuestionText}</Text>
        </View>

        {/* ── Live indicators — only while recording ────────────────────────────── */}
        {isRecording && (
          <View style={styles.card}>
            <View style={styles.indicatorsHeader}>
              <Text style={styles.indicatorsTitle}>Live Indicators</Text>
              {isLoading ? (
                <View style={styles.connectingBadge}>
                  <ActivityIndicator size={10} color="#2563EB" style={styles.connectingSpinner} />
                  <Text style={styles.connectingLabel}>Connecting</Text>
                </View>
              ) : isSpeaking ? (
                <View style={styles.speakingBadge}>
                  <View style={styles.speakingDot} />
                  <Text style={styles.speakingLabel}>Speaking</Text>
                </View>
              ) : null}
            </View>

            {indicatorRows.map(({ label, value, status }) => (
              <View key={label} style={styles.indicatorRow}>
                <Text style={styles.indicatorLabel}>{label}</Text>
                <View style={styles.indicatorTrack}>
                  <View
                    style={[
                      styles.indicatorFill,
                      {
                        width:           `${value}%` as `${number}%`,
                        backgroundColor: statusColor(status),
                      },
                    ]}
                  />
                </View>
                <View style={[styles.indicatorBadge, { backgroundColor: statusBgColor(status) }]}>
                  <Text style={[styles.indicatorBadgeText, { color: statusColor(status) }]}>
                    {status}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ── Coaching tip ─────────────────────────────────────────────────────── */}
        <View style={styles.tipCard}>
          <MaterialCommunityIcons name="lightbulb-on" size={16} color="#D97706" />
          <Text style={styles.tipText}>{dynamicTip}</Text>
        </View>

        {/* ── Waveform orb ──────────────────────────────────────────────────────── */}
        <View style={styles.orbSection}>

          <Animated.View
            pointerEvents="none"
            style={[
              styles.glow,
              {
                width:        ORB_OUTER + 30,
                height:       ORB_OUTER + 30,
                borderRadius: (ORB_OUTER + 30) / 2,
                opacity:      glowAnim,
                transform:    [{ scale: pulseAnim }],
              },
            ]}
          />

          <View
            style={[
              styles.orbOuter,
              { width: ORB_OUTER, height: ORB_OUTER, borderRadius: ORB_OUTER / 2 },
            ]}
          >
            {/* Decorative accent ring — visually frames the inner orb */}
            <View
              pointerEvents="none"
              style={{
                position:    "absolute",
                width:       ORB_OUTER - 16,
                height:      ORB_OUTER - 16,
                borderRadius: (ORB_OUTER - 16) / 2,
                borderWidth:  1,
                borderColor: "rgba(148,163,184,0.35)",
              }}
            />

            <View
              style={[
                styles.orbInner,
                {
                  width:        ORB_INNER,
                  height:       ORB_INNER,
                  borderRadius: ORB_INNER / 2,
                },
              ]}
            >
              {/* Waveform — dead-centre of the orb */}
              <View style={styles.waveformWrapper}>
                <View
                  style={[
                    styles.waveformClipper,
                    { width: WAVEFORM_W, height: WAVEFORM_H },
                  ]}
                >
                  <Waveform bars={bars} />
                </View>
              </View>

              {/* Title + subtitle pinned to the top, not affecting waveform centre */}
              <View style={styles.orbTextBlock} pointerEvents="none">
                <Text style={styles.orbTitle}>Voice Response</Text>
                <Text style={styles.orbSubtitle}>
                  {isQuestionPlaying
                    ? "Listening..."
                    : isSubmitting
                    ? "Processing..."
                    : !isRecording
                    ? (isRecordingEnabled ? "Tap mic to speak" : "Please wait…")
                    : isSpeaking
                    ? "Speaking..."
                    : "Recording..."}
                </Text>
              </View>
            </View>

            {/* Floating mic / stop button */}
            <TouchableOpacity
              testID="mic-button"
              style={[
                styles.micButton,
                isRecording   && styles.micButtonActive,
                isMicDisabled && styles.micButtonDisabled,
              ]}
              onPress={isRecording ? handleStopRecording : handleStartRecording}
              disabled={isMicDisabled}
              activeOpacity={0.85}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : isQuestionPlaying ? (
                <MaterialCommunityIcons name="volume-high" size={26} color="#fff" />
              ) : (
                <MaterialCommunityIcons
                  name={isRecording ? "stop" : "microphone"}
                  size={28}
                  color="#fff"
                />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Error text */}
        {!!error && <Text style={styles.errorText}>{error}</Text>}

      </ScrollView>

      {/* ── Fixed bottom — timer + action buttons ─────────────────────────────── */}
      <View style={styles.fixedBottom}>

        {/* Timer */}
        <View style={styles.timerRow}>
          <MaterialCommunityIcons
            name={isRecording ? "record-circle" : "clock-outline"}
            size={15}
            color={isRecording ? "#EF4444" : "#94A3B8"}
          />
          <Text style={[styles.timerText, isRecording && styles.timerActive]}>
            {formattedTime}
          </Text>
        </View>

        {/* Stop / Submit — coach: always while recording; mock: last question only */}
        {showStopBtn && (
          <TouchableOpacity
            style={[styles.stopButton, isSubmitting && styles.stopButtonDisabled]}
            onPress={handleStopRecording}
            disabled={isSubmitting}
            activeOpacity={0.85}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <MaterialCommunityIcons name="stop-circle-outline" size={18} color="#fff" />
                <Text style={styles.stopButtonText}>
                  {mode === "mock" ? "Submit Session" : "Stop Recording"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}

      </View>

    </SafeAreaView>
    </>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const SHADOW = {
  shadowColor:   "#0F172A",
  shadowOpacity: 0.06,
  shadowRadius:  12,
  shadowOffset:  { width: 0, height: 2 },
  elevation:     2,
};

const styles = StyleSheet.create({

  // ── Shell ────────────────────────────────────────────────────────────────────
  safe: {
    flex:            1,
    backgroundColor: "#EEF4FF",
  },
  centered: {
    flex:            1,
    alignItems:      "center",
    justifyContent:  "center",
  },
  initText: {
    marginTop:  12,
    fontSize:   14,
    color:      "#64748B",
    fontWeight: "500",
  },
  // ── Header ───────────────────────────────────────────────────────────────────
  header: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  exitButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E2E8F0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  exitButtonText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
  },

  scroll:        { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop:        12,
    paddingBottom:     Platform.OS === "web" ? 32 : 140,
  },

  // ── Connection warning banner ─────────────────────────────────────────────────
  banner: {
    flexDirection:   "row",
    alignItems:      "center",
    backgroundColor: "#FEF3C7",
    borderRadius:    10,
    padding:         10,
    marginBottom:    12,
  },
  bannerIcon: { marginRight: 7 },
  bannerText: {
    flex:       1,
    fontSize:   12,
    color:      "#92400E",
    fontWeight: "600",
  },

  // ── Audio playing banner ──────────────────────────────────────────────────────
  audioPlayingBanner: {
    flexDirection:   "row",
    alignItems:      "center",
    backgroundColor: "#DBEAFE",
    borderRadius:    10,
    paddingHorizontal: 12,
    paddingVertical:    8,
    marginBottom:    12,
    gap:             8,
  },
  audioPlayingText: {
    flex:       1,
    fontSize:   13,
    fontWeight: "600",
    color:      "#1D4ED8",
  },

  // ── Shared white card ────────────────────────────────────────────────────────
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius:    16,
    padding:         16,
    marginBottom:    16,
    ...SHADOW,
  },

  // ── Question card ────────────────────────────────────────────────────────────
  questionBadge: {
    flexDirection:     "row",
    alignItems:        "center",
    backgroundColor:   "#DBEAFE",
    alignSelf:         "flex-start",
    paddingHorizontal: 10,
    paddingVertical:    5,
    borderRadius:      10,
    marginBottom:      12,
  },
  questionBadgeText: {
    marginLeft: 5,
    fontSize:   12,
    fontWeight: "600",
    color:      "#2563EB",
  },
  questionText: {
    fontSize:   17,
    lineHeight: 26,
    fontWeight: "500",
    color:      "#0F172A",
  },

  // ── Indicators card ──────────────────────────────────────────────────────────
  indicatorsHeader: {
    flexDirection:  "row",
    alignItems:     "center",
    justifyContent: "space-between",
    marginBottom:   12,
  },
  indicatorsTitle: {
    fontSize:   13,
    fontWeight: "700",
    color:      "#334155",
  },
  connectingBadge: {
    flexDirection:     "row",
    alignItems:        "center",
    backgroundColor:   "#DBEAFE",
    paddingHorizontal: 8,
    paddingVertical:   3,
    borderRadius:      10,
  },
  connectingSpinner: { marginRight: 4 },
  connectingLabel: {
    fontSize:   11,
    fontWeight: "700",
    color:      "#2563EB",
  },
  speakingBadge: {
    flexDirection:     "row",
    alignItems:        "center",
    backgroundColor:   "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical:   3,
    borderRadius:      10,
  },
  speakingDot: {
    width:           6,
    height:          6,
    borderRadius:    3,
    backgroundColor: "#16A34A",
    marginRight:     5,
  },
  speakingLabel: {
    fontSize:   11,
    fontWeight: "700",
    color:      "#16A34A",
  },

  // ── Indicator rows ────────────────────────────────────────────────────────────
  indicatorRow: {
    flexDirection: "row",
    alignItems:    "center",
    marginBottom:  12,
  },
  indicatorLabel: {
    width:      92,
    fontSize:   12,
    fontWeight: "600",
    color:      "#475569",
  },
  indicatorTrack: {
    flex:             1,
    height:           6,
    backgroundColor:  "#E5E7EB",
    borderRadius:     4,
    overflow:         "hidden",
    marginHorizontal: 10,
  },
  indicatorFill: {
    height:       6,
    borderRadius: 4,
  },
  indicatorBadge: {
    paddingHorizontal: 8,
    paddingVertical:   2,
    borderRadius:      8,
    minWidth:          42,
    alignItems:        "center",
  },
  indicatorBadgeText: {
    fontSize:   10,
    fontWeight: "700",
  },

  // ── Tip card ─────────────────────────────────────────────────────────────────
  tipCard: {
    flexDirection:   "row",
    alignItems:      "flex-start",
    backgroundColor: "#FEF9C3",
    borderRadius:    12,
    padding:         12,
    marginBottom:    16,
  },
  tipText: {
    flex:       1,
    marginLeft: 8,
    fontSize:   12,
    fontWeight: "500",
    color:      "#78350F",
    lineHeight: 18,
  },

  // ── Orb section ──────────────────────────────────────────────────────────────
  orbSection: {
    alignItems:     "center",
    justifyContent: "center",
    minHeight:      Platform.OS === "web" ? 280 : 220,
    marginVertical: 20,
  },
  glow: {
    position:        "absolute",
    backgroundColor: "#2563EB",
  },
  orbOuter: {
    alignItems:      "center",
    justifyContent:  "center",
    backgroundColor: "rgba(15,23,42,0.06)",
    overflow:        "visible",
  },
  orbInner: {
    backgroundColor: "#071433",
    alignItems:      "center",
    // "center" so the waveform sits exactly in the middle of the circle
    justifyContent:  "center",
    shadowColor:     "#0F172A",
    shadowOpacity:   0.22,
    shadowRadius:    28,
    shadowOffset:    { width: 0, height: 12 },
    elevation:       10,
    overflow:        "hidden",
  },
  // Title + subtitle float at the top of the orb without consuming layout space
  orbTextBlock: {
    position:   "absolute",
    top:        IS_WEB ? 28 : 22,
    left:       0,
    right:      0,
    alignItems: "center",
  },
  orbTitle: {
    color:         "#FFFFFF",
    fontSize:      14,
    fontWeight:    "600",
    letterSpacing: 0.3,
  },
  orbSubtitle: {
    marginTop:  3,
    color:      "rgba(203,213,225,0.80)",
    fontSize:   11,
    fontWeight: "500",
    letterSpacing: 0.1,
  },
  // Waveform wrapper is now simply centred inside the flex-center orb
  waveformWrapper: {
    alignItems:     "center",
    justifyContent: "center",
  },
  waveformClipper: {
    alignItems:   "center",
    overflow:     "hidden",
    borderRadius: 999,
  },
  micButton: {
    position:        "absolute",
    bottom:          -10,
    alignSelf:       "center",
    width:           68,
    height:          68,
    borderRadius:    34,
    backgroundColor: "#2563EB",
    alignItems:      "center",
    justifyContent:  "center",
    shadowColor:     "#2563EB",
    shadowOpacity:   0.4,
    shadowRadius:    14,
    shadowOffset:    { width: 0, height: 6 },
    elevation:       10,
    zIndex:          20,
  },
  micButtonActive: {
    backgroundColor: "#DC2626",
    shadowColor:     "#DC2626",
  },
  micButtonDisabled: {
    opacity: 0.45,
  },

  // ── Error ─────────────────────────────────────────────────────────────────────
  errorText: {
    fontSize:   12,
    color:      "#EF4444",
    fontWeight: "500",
    textAlign:  "center",
    marginTop:  4,
  },

  // ── Fixed bottom bar ─────────────────────────────────────────────────────────
  fixedBottom: {
    position: "absolute",
    bottom:   20,
    left:     16,
    right:    16,
    gap:      8,
  },
  timerRow: {
    flexDirection:  "row",
    alignItems:     "center",
    justifyContent: "center",
    gap:            6,
  },
  timerText: {
    fontSize:   15,
    fontWeight: "700",
    color:      "#94A3B8",
  },
  timerActive: {
    color: "#EF4444",
  },

  stopButton: {
    flexDirection:   "row",
    alignItems:      "center",
    justifyContent:  "center",
    height:          52,
    borderRadius:    16,
    backgroundColor: "#EF4444",
    gap:             8,
    shadowColor:     "#EF4444",
    shadowOpacity:   0.35,
    shadowRadius:    12,
    shadowOffset:    { width: 0, height: 4 },
    elevation:       5,
  },
  stopButtonDisabled: {
    opacity: 0.65,
  },
  stopButtonText: {
    fontSize:   15,
    fontWeight: "700",
    color:      "#FFFFFF",
  },
});
