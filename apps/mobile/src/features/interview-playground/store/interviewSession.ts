import type { TranscriptTurn, InterviewStatus, EvaluationResult } from "../types";

type StatusListener = (status: InterviewStatus) => void;
type TranscriptListener = (turns: TranscriptTurn[]) => void;
type SpeakingListener = (speaking: { user: boolean; ai: boolean }) => void;

interface ActiveSession {
  pc: InstanceType<typeof globalThis.RTCPeerConnection> | null;
  stream: MediaStream | null;
  dataChannel: RTCDataChannel | null;
  transcript: TranscriptTurn[];
  sessionId: string | null;
  derivedRole: string | null;
  status: InterviewStatus;
  isSpeaking: { user: boolean; ai: boolean };
  evaluation: EvaluationResult | null;
  errorMessage: string | null;
}

const listeners = {
  status: new Set<StatusListener>(),
  transcript: new Set<TranscriptListener>(),
  speaking: new Set<SpeakingListener>(),
};

export const activeSession: ActiveSession = {
  pc: null,
  stream: null,
  dataChannel: null,
  transcript: [],
  sessionId: null,
  derivedRole: null,
  status: "idle",
  isSpeaking: { user: false, ai: false },
  evaluation: null,
  errorMessage: null,
};

export function setStatus(status: InterviewStatus): void {
  activeSession.status = status;
  listeners.status.forEach((fn) => fn(status));
}

export function appendTranscriptTurn(turn: TranscriptTurn): void {
  activeSession.transcript = [...activeSession.transcript, turn];
  listeners.transcript.forEach((fn) => fn(activeSession.transcript));
}

export function setSpeaking(speaking: { user: boolean; ai: boolean }): void {
  activeSession.isSpeaking = speaking;
  listeners.speaking.forEach((fn) => fn(speaking));
}

export function resetSession(): void {
  if (activeSession.dataChannel) {
    try {
      activeSession.dataChannel.close();
    } catch {
      // already closed
    }
    activeSession.dataChannel = null;
  }
  if (activeSession.stream) {
    activeSession.stream.getTracks().forEach((t) => t.stop());
    activeSession.stream = null;
  }
  if (activeSession.pc) {
    try {
      activeSession.pc.close();
    } catch {
      // already closed
    }
    activeSession.pc = null;
  }
  activeSession.transcript = [];
  activeSession.sessionId = null;
  activeSession.derivedRole = null;
  activeSession.status = "idle";
  activeSession.isSpeaking = { user: false, ai: false };
  activeSession.evaluation = null;
  activeSession.errorMessage = null;
}

export function onStatusChange(fn: StatusListener): () => void {
  listeners.status.add(fn);
  return () => listeners.status.delete(fn);
}

export function onTranscriptChange(fn: TranscriptListener): () => void {
  listeners.transcript.add(fn);
  return () => listeners.transcript.delete(fn);
}

export function onSpeakingChange(fn: SpeakingListener): () => void {
  listeners.speaking.add(fn);
  return () => listeners.speaking.delete(fn);
}
