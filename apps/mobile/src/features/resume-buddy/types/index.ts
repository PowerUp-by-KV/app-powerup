// ─── Analyze Request ──────────────────────────────────────────────────────────

export type ResumeBuddyAnalyzeRequest = FormData;

// ─── Analysis Response ────────────────────────────────────────────────────────

export interface ResumeBuddyCriterionScore {
  key: string;
  label: string;
  score: number;
  max_score: number;
  weight: number;
  feedback: string;
}

export interface ResumeBuddyAtsAnalysis {
  score: number;
  max_score: number;
  is_ats_friendly: boolean;
  single_column_layout: boolean;
  proper_section_headings: boolean;
  no_tables_images_icons: boolean;
  standard_formatting: boolean;
  keyword_optimization: boolean;
  findings: string[];
}

export interface ResumeBuddySkillsMatch {
  target_role: string;
  match_percentage: number;
  matched_skills: string[];
  missing_skills: string[];
  recommended_technologies: string[];
}

export interface ResumeBuddyResponse {
  overall_resume_score: number;
  rule_based_score: number;
  ai_semantic_score: number;
  final_score_formula: string;
  ats_score: number;
  skills_match_percentage: number;
  target_role: string;
  detected_sections: string[];
  sections: Record<string, string>;
  criteria_scores: ResumeBuddyCriterionScore[];
  ats_analysis: ResumeBuddyAtsAnalysis;
  skills_analysis: ResumeBuddySkillsMatch;
  strengths: string[];
  weaknesses: string[];
  missing_skills: string[];
  personalized_suggestions: string[];
  resume_quality_summary: string;
  // Present on the async-analyze response; used to subscribe to the SSE status stream.
  job_id?: string;
}

// ─── Async status (SSE) ───────────────────────────────────────────────────────

// Stages the backend worker publishes over Redis pub/sub → SSE.
export type ResumeBuddyBackendStage = "extraction" | "ats" | "ai" | "done";
export type ResumeBuddyBackendStatus = "started" | "completed" | "failed";

export interface ResumeBuddyStatusEvent {
  stage: ResumeBuddyBackendStage;
  status: ResumeBuddyBackendStatus;
  error?: string;
  // The "done"/"completed" event also carries headline scores, but the full
  // structured record (criteria_scores, ats findings, …) is read back from
  // /history once done fires.
  [key: string]: unknown;
}

// ─── History ──────────────────────────────────────────────────────────────────

export interface ResumeBuddyHistoryItem {
  id: string;
  job_id?: string;
  overall_resume_score: number;
  ats_score: number;
  skills_match_percentage: number;
  target_role: string;
  created_at: string;
  resume_quality_summary: string;
  // Full analysis data for detail view
  rule_based_score: number;
  ai_semantic_score: number;
  final_score_formula: string;
  detected_sections: string[];
  sections: Record<string, string>;
  criteria_scores: ResumeBuddyCriterionScore[];
  ats_analysis: ResumeBuddyAtsAnalysis;
  skills_analysis: ResumeBuddySkillsMatch;
  strengths: string[];
  weaknesses: string[];
  missing_skills: string[];
  personalized_suggestions: string[];
}

export type ResumeBuddyHistoryResponse = ResumeBuddyHistoryItem[];

// ─── Screen Step Machine ──────────────────────────────────────────────────────

export type ResumeBuddyStep = "input" | "loading" | "strengths" | "suggestions" | "scores";
