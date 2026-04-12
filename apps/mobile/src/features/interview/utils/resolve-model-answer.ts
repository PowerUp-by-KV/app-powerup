/**
 * src/features/interview/utils/resolve-model-answer.ts
 *
 * Pure utility — extracts a displayable answer string from any shape the
 * backend may return.  Never returns an empty string; falls back to a
 * complete mock answer so the ModelAnswerModal is always populated.
 */

import type { ModelAnswer } from "../types/interview.types";

// ── Mock fallback ─────────────────────────────────────────────────────────────

const MOCK_MODEL_ANSWER: ModelAnswer = {
  structure: "STAR",
  situation: "In my previous role, I worked in a collaborative cross-functional team environment.",
  task:      "I was asked to resolve a conflict between two team members that was affecting overall productivity.",
  action:    "I facilitated a private 1-on-1 with each person, identified root causes, and introduced structured weekly syncs with clear ownership.",
  result:    "The tension resolved within two weeks and the team's delivery efficiency improved by 30%.",
};

// ── Type guards ───────────────────────────────────────────────────────────────

function isNonEmptyString(val: unknown): val is string {
  return typeof val === "string" && val.trim().length > 0;
}

function isObject(val: unknown): val is Record<string, unknown> {
  return typeof val === "object" && val !== null && !Array.isArray(val);
}

// ── STAR combiner ─────────────────────────────────────────────────────────────

function combineStarFields(obj: Record<string, unknown>): string | null {
  const parts = (["situation", "task", "action", "result"] as const)
    .map((k) => (isNonEmptyString(obj[k]) ? (obj[k] as string).trim() : ""))
    .filter(Boolean);

  return parts.length > 0 ? parts.join("\n\n") : null;
}

// ── Answer node resolver ──────────────────────────────────────────────────────

function resolveNode(node: unknown): string | null {
  // Plain string
  if (isNonEmptyString(node)) return node.trim();

  if (!isObject(node)) return null;

  // Prefer explicit flat-text sub-fields
  const flat =
    (isNonEmptyString(node.richText)   ? node.richText   : null) ||
    (isNonEmptyString(node.text)       ? node.text       : null) ||
    (isNonEmptyString(node.content)    ? node.content    : null) ||
    (isNonEmptyString(node.answerText) ? node.answerText : null);

  if (flat) return (flat as string).trim();

  // STAR combination
  return combineStarFields(node);
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Accepts the full question-feedback API response (typed `unknown` so callers
 * don't need to cast) and returns a non-empty answer string.
 *
 * Resolution order:
 *   1. feedback.modelAnswer
 *   2. feedback.model_answer
 *   3. feedback.answerText
 *   4. feedback.text
 *   5. feedback.content
 *   6. MOCK_MODEL_ANSWER (guaranteed non-empty fallback)
 */
export function resolveModelAnswer(feedback: unknown): string {
  if (!isObject(feedback)) {
    return combineStarFields(MOCK_MODEL_ANSWER as unknown as Record<string, unknown>) ?? "";
  }

  // Walk each possible key in priority order
  const candidates: Array<keyof typeof feedback> = [
    "modelAnswer",
    "model_answer",
    "answerText",
    "text",
    "content",
  ];

  for (const key of candidates) {
    const resolved = resolveNode(feedback[key as string]);
    if (resolved) return resolved;
  }

  // Nothing found — guaranteed mock fallback
  return (
    combineStarFields(MOCK_MODEL_ANSWER as unknown as Record<string, unknown>) ??
    MOCK_MODEL_ANSWER.result
  );
}
