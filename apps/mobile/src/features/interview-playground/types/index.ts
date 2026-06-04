export type InterviewStatus =
  | "idle"
  | "starting"
  | "connecting"
  | "live"
  | "saving"
  | "done"
  | "error";

export type TranscriptRole = "interviewer" | "candidate";

export interface TranscriptTurn {
  role: TranscriptRole;
  text: string;
  timestamp: string;
}

export interface StartInterviewResponse {
  session_id: string;
  derived_role: string;
  candidate_name: string;
  ephemeral_token: string;
  webrtc_sdp_url: string;
  model: string;
  expires_at: string;
}

export interface CommunicationScores {
  clarity_articulation: number;
  listening_responsiveness: number;
  verbal_fluency: number;
  confidence_presence: number;
  structured_responses: number;
  overall: number;
}

export interface BehavioralScores {
  emotional_intelligence: number;
  teamwork: number;
  problem_solving: number;
  adaptability: number;
  motivation: number;
  integrity: number;
  stress_management: number;
  culture_fit: number;
  overall: number;
}

export interface StarAnalysis {
  situation: boolean;
  task: boolean;
  action: boolean;
  result: boolean;
  star_score: number;
  feedback: string;
}

export type Grade = "A" | "B" | "C" | "D" | "E" | "F";

export interface EvaluationResult {
  final_score: number;
  grade: Grade;
  communication: CommunicationScores;
  behavioral: BehavioralScores;
  star_analysis: StarAnalysis;
  summary: string;
  strengths: string[];
  improvements: string[];
}

export interface SaveSessionBody {
  transcript: TranscriptTurn[];
  derived_role?: string;
}

export interface SaveSessionResponse {
  session_id: string;
  evaluation: EvaluationResult;
}

export interface InterviewSessionSummary {
  session_id: string;
  derived_role: string;
  status: string;
  started_at: string;
  ended_at: string | null;
  final_score: number | null;
  grade: Grade | null;
}

export interface InterviewSessionDetail {
  session_id: string;
  derived_role: string;
  status: string;
  started_at: string;
  ended_at: string | null;
  transcript: TranscriptTurn[];
  evaluation: EvaluationResult | null;
}
