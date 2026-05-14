// Maps each grammar-quiz screen to its seeded activity_id in the backend.
//
// Empty string → screen falls back to local PLACEHOLDER_QUESTIONS in QuizShell.
//
// BACKEND GAP (2026-05-14): the 14 seeded modules are conversation-themed, not
// grammar drills. None of the seeded activities return MCQ-shaped questions
// (options[] + correct_answer). Quiz screens render in fallback mode until the
// backend seeds grammar-topic activities with MCQ payloads.
//
// To populate: curl /v1/modules/ → pick module → /v1/modules/{id}/days →
// /v1/modules/days/{id}/activities → confirm a question has options + correct_answer.
export const QUIZ_ACTIVITY_IDS = {
  presentSimple: "",
  presentContinuous: "",
  presentTense: "",
  presentPerfect: "",
  pastSimple: "",
  pastContinuous: "",
  pastPerfect: "",
  pastTense: "",
  futureSimple: "",
  futureContinuous: "",
  futurePerfect: "",
  futureTense: "",
  conditionals: "",
  modalVerbs: "",
  phrasalVerbs: "",
  voiceReported: "",
  partsOfSpeech: "",
  punctuation: "",
} as const;

export type QuizTopic = keyof typeof QUIZ_ACTIVITY_IDS;
