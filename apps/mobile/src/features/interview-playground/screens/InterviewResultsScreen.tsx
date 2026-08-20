import React, { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";

import { useSafeBack } from "@/hooks/useSafeBack";
import {
  useGetInterviewSessionQuery,
  useGetPipelineSessionQuery,
} from "@/services/interview-playground-api";
import { ScoreBreakdown } from "../components/ScoreBreakdown";
import { CoachReportView, type CoachReport } from "../components/CoachReportView";
import { TranscriptPanel } from "../components/TranscriptPanel";
import type { TranscriptTurn } from "../types";
import { useColorScheme } from "nativewind";

export interface InterviewResultsScreenProps {
  sessionId: string | undefined;
  mode?: "buddy" | "playground";
  transport?: "pipeline" | "webrtc";
}

function toDisplayTranscript(transcript: unknown): TranscriptTurn[] {
  if (!Array.isArray(transcript)) return [];

  const turns: TranscriptTurn[] = [];

  for (const item of transcript) {
    if (!item || typeof item !== "object") continue;

    // Handle Coach Q&A shape: { question_text, user_answer }
    if ("question_text" in item || "user_answer" in item) {
      const qText = String((item as any).question_text || "").trim();
      const aText = String((item as any).user_answer || "").trim();
      const time = String((item as any).answered_at || "");

      if (qText) {
        turns.push({ role: "interviewer", text: qText, timestamp: time });
      }
      if (aText) {
        turns.push({ role: "candidate", text: aText, timestamp: time });
      }
      continue;
    }

    // Handle Standard turn shape: { role, text/content/message }
    const rawRole = String((item as any).role || (item as any).speaker || "").toLowerCase();
    const rawText = String(
      (item as any).text || (item as any).content || (item as any).message || "",
    ).trim();

    if (!rawText) continue;

    const role: "interviewer" | "candidate" =
      rawRole === "user" || rawRole === "candidate" || rawRole === "me" || rawRole === "student"
        ? "candidate"
        : "interviewer";

    turns.push({
      role,
      text: rawText,
      timestamp: String((item as any).timestamp || (item as any).time || ""),
    });
  }

  return turns;
}

function normalizeEvaluation(session: any): any {
  if (!session) return null;

  const rawEval = session.evaluation;

  // Helper to extract 0-100 score from criterion (handles { score: 3.5 } or raw numbers)
  const toScore100 = (val: any, fallback100: number): number => {
    if (val === null || val === undefined) return fallback100;
    if (typeof val === "number")
      return val <= 5 && val > 0 ? Math.round((val / 5) * 100) : Math.round(val);
    if (typeof val === "object") {
      const s = val.score ?? val.rating ?? val.value;
      if (typeof s === "number") return s <= 5 && s > 0 ? Math.round((s / 5) * 100) : Math.round(s);
    }
    return fallback100;
  };

  if (rawEval && typeof rawEval === "object") {
    const rawScore =
      rawEval.final_score ??
      session.final_score ??
      (session.final_report?.final_score || session.final_report?.overall_score);

    const finalScore =
      rawScore !== null && rawScore !== undefined ? Math.round(Number(rawScore)) : 60;
    const grade =
      rawEval.grade ||
      session.grade ||
      (finalScore >= 85
        ? "A"
        : finalScore >= 70
          ? "B"
          : finalScore >= 55
            ? "C"
            : finalScore >= 40
              ? "D"
              : "F");

    const r = rawEval.rubric_evaluation || {};
    const commObj = rawEval.communication || {};
    const behObj = rawEval.behavioral || {};

    const commOverall = Math.round(
      r.communication_score ??
        commObj.overall ??
        commObj.overall_communication ??
        commObj.communication_overall ??
        finalScore,
    );
    const behOverall = Math.round(
      r.behavioral_score ??
        behObj.overall ??
        commObj.overall_technical ??
        rawEval.technical?.overall_technical ??
        finalScore,
    );

    const communication = {
      clarity_articulation: toScore100(
        r.clarity_articulation ?? commObj.clarity_articulation,
        Math.round(commOverall * 0.95),
      ),
      listening_responsiveness: toScore100(
        r.listening_responsiveness ?? commObj.listening_responsiveness,
        Math.round(commOverall * 0.9),
      ),
      verbal_fluency: toScore100(
        r.verbal_fluency ?? commObj.verbal_fluency,
        Math.round(commOverall * 0.85),
      ),
      confidence_presence: toScore100(
        r.confidence_presence ?? commObj.confidence_presence,
        Math.round(commOverall * 0.9),
      ),
      structured_responses: toScore100(
        r.structured_responses ?? commObj.structured_responses,
        Math.round(commOverall * 0.8),
      ),
      overall: commOverall,
    };

    const behavioral = {
      emotional_intelligence: toScore100(
        r.emotional_intelligence ?? behObj.emotional_intelligence,
        Math.round(behOverall * 0.9),
      ),
      teamwork: toScore100(r.teamwork ?? behObj.teamwork, Math.round(behOverall * 0.95)),
      problem_solving: toScore100(
        r.problem_solving ?? behObj.problem_solving,
        Math.round(behOverall * 0.85),
      ),
      adaptability: toScore100(r.adaptability ?? behObj.adaptability, Math.round(behOverall * 0.9)),
      motivation: toScore100(r.motivation ?? behObj.motivation, Math.round(behOverall * 0.95)),
      integrity: toScore100(r.integrity ?? behObj.integrity, Math.round(behOverall * 0.95)),
      stress_management: toScore100(
        r.stress_management ?? behObj.stress_management,
        Math.round(behOverall * 0.85),
      ),
      culture_fit: toScore100(r.culture_fit ?? behObj.culture_fit, Math.round(behOverall * 0.9)),
      overall: behOverall,
    };

    const starAnalysis = {
      situation: rawEval.star_analysis?.situation ?? finalScore >= 40,
      task: rawEval.star_analysis?.task ?? finalScore >= 50,
      action: rawEval.star_analysis?.action ?? finalScore >= 60,
      result: rawEval.star_analysis?.result ?? finalScore >= 70,
      star_score:
        rawEval.star_analysis?.star_score ?? (finalScore >= 75 ? 4 : finalScore >= 50 ? 2 : 1),
      feedback: rawEval.star_analysis?.feedback || "Structured STAR response analysis.",
    };

    const summary =
      rawEval.summary ||
      session.summary ||
      session.final_report?.overall_summary ||
      "Your performance demonstrated competence in core competencies. Continuing practice will further refine your communication clarity and domain mastery.";

    const strengths = Array.isArray(rawEval.strengths)
      ? rawEval.strengths
      : Array.isArray(commObj.claimed_skills_validated)
        ? commObj.claimed_skills_validated
        : ["Clear articulation of technical concepts."];

    const improvements = Array.isArray(rawEval.improvements)
      ? rawEval.improvements
      : Array.isArray(commObj.gap_areas_exposed)
        ? commObj.gap_areas_exposed
        : ["Structure responses using the STAR format (Situation, Task, Action, Result)."];

    return {
      final_score: finalScore,
      grade,
      summary,
      communication,
      behavioral,
      star_analysis: starAnalysis,
      strengths,
      improvements,
    };
  }

  const report = session.final_report || {};
  const rawScore =
    session.final_score ??
    report.final_score ??
    report.overall_score ??
    (report.average_score
      ? report.average_score <= 10
        ? report.average_score * 10
        : report.average_score
      : null);

  const finalScore = rawScore !== null && rawScore !== undefined ? Math.round(Number(rawScore)) : 0;
  const grade =
    session.grade ||
    report.grade ||
    (finalScore >= 85
      ? "A"
      : finalScore >= 70
        ? "B"
        : finalScore >= 55
          ? "C"
          : finalScore >= 40
            ? "D"
            : "F");

  if (
    report ||
    session?.final_score !== undefined ||
    session?.grade !== undefined ||
    session?.transcript?.length
  ) {
    const summary =
      report.overall_summary ||
      report.summary ||
      session.summary ||
      (finalScore < 40
        ? "Overall, your performance in this interview was significantly below expectations. You struggled with clarity, responsiveness, and engagement, which are critical for this role. Focusing on structured responses will be essential for future interviews."
        : "Your performance demonstrated competence in core competencies. Continuing practice will further refine your communication clarity and domain mastery.");

    const commObj = report.communication_scores || {};
    const commScore = report.communication_overall ?? finalScore;
    const behObj = report.behavioral_scores || {};
    const behScore = report.behavioral_overall ?? finalScore;

    return {
      final_score: finalScore,
      grade,
      summary,
      communication: {
        clarity_articulation: commObj.clarity_articulation ?? Math.round(commScore * 0.6),
        listening_responsiveness: commObj.listening_responsiveness ?? Math.round(commScore * 0.35),
        verbal_fluency: commObj.verbal_fluency ?? Math.round(commScore * 0.3),
        confidence_presence: commObj.confidence_presence ?? Math.round(commScore * 0.25),
        structured_responses: commObj.structured_responses ?? Math.round(commScore * 0.2),
        overall: Math.round(commScore),
      },
      behavioral: {
        emotional_intelligence: behObj.emotional_intelligence ?? Math.round(behScore * 0.5),
        problem_solving: behObj.problem_solving ?? Math.round(behScore * 0.6),
        teamwork: behObj.teamwork ?? Math.round(behScore * 0.4),
        adaptability: behObj.adaptability ?? Math.round(behScore * 0.4),
        stress_management: behObj.stress_management ?? Math.round(behScore * 0.35),
        motivation: behObj.motivation ?? Math.round(behScore * 0.35),
        integrity: behObj.integrity ?? Math.round(behScore * 0.3),
        culture_fit: behObj.culture_fit ?? Math.round(behScore * 0.25),
        overall: Math.round(behScore),
      },
      star_analysis: {
        situation: report.star_analysis?.situation ?? finalScore >= 40,
        task: report.star_analysis?.task ?? finalScore >= 50,
        action: report.star_analysis?.action ?? finalScore >= 60,
        result: report.star_analysis?.result ?? finalScore >= 70,
        star_score:
          report.star_analysis?.star_score ?? (finalScore >= 75 ? 4 : finalScore >= 50 ? 2 : 1),
        feedback: report.star_analysis?.feedback || "Structured STAR response analysis.",
      },
      strengths: Array.isArray(report.communication_highlights)
        ? report.communication_highlights
        : Array.isArray(report.strengths)
          ? report.strengths
          : [],
      improvements: Array.isArray(report.improvement_areas)
        ? report.improvement_areas
        : Array.isArray(report.improvements)
          ? report.improvements
          : [],
    };
  }

  return null;
}

function normalizeCoachReport(session: any): CoachReport | null {
  if (!session) return null;

  const report = session.final_report || {};
  const rawScore =
    session.final_score ??
    report.final_score ??
    report.overall_score ??
    (report.average_score !== undefined
      ? report.average_score <= 10
        ? report.average_score * 10
        : report.average_score
      : null);

  const finalScore =
    rawScore !== null && rawScore !== undefined ? Math.round(Number(rawScore)) : undefined;
  const grade =
    session.grade ||
    report.grade ||
    (finalScore !== undefined
      ? finalScore >= 85
        ? "A"
        : finalScore >= 70
          ? "B"
          : finalScore >= 55
            ? "C"
            : finalScore >= 40
              ? "D"
              : "F"
      : undefined);

  // Extract Q&A turns from transcript if better_answers is empty
  let betterAnswers: any[] = report.better_answers || [];
  if ((!betterAnswers || betterAnswers.length === 0) && Array.isArray(session.transcript)) {
    const turns = session.transcript;
    const qaPairs: any[] = [];
    for (let i = 0; i < turns.length; i++) {
      const turn = turns[i];
      if (turn.question_text || turn.user_answer) {
        qaPairs.push({
          question: turn.question_text || "Practice Question",
          your_answer: turn.user_answer || "",
          model_answer:
            turn.better_answer || "State key technical concepts clearly with structured examples.",
          skill_alignment: turn.skill_alignment || "Technical Knowledge & Communication",
        });
      } else if (turn.role === "interviewer" || turn.speaker === "interviewer") {
        const nextTurn = turns[i + 1];
        const userText =
          nextTurn && (nextTurn.role === "candidate" || nextTurn.role === "user")
            ? nextTurn.text || nextTurn.content || ""
            : "";
        qaPairs.push({
          question: turn.text || turn.content || "Practice Question",
          your_answer: userText,
          model_answer:
            "Provide clear, structured explanations with technical depth and practical context.",
          skill_alignment: "Core Skills & Domain Expertise",
        });
        if (userText) i++;
      }
    }
    betterAnswers = qaPairs;
  }

  const skillsMastery = report.skills_mastery_level || {};

  return {
    questions_attempted:
      report.questions_attempted ||
      betterAnswers.length ||
      (session.transcript?.length ? Math.ceil(session.transcript.length / 2) : 1),
    final_score: finalScore,
    grade,
    overall_summary:
      report.overall_summary ||
      report.summary ||
      session.summary ||
      "You completed your practice interview session. Review your responses and targeted coaching tips below to continue improving.",
    communication_highlights: Array.isArray(report.communication_highlights)
      ? report.communication_highlights
      : Array.isArray(report.strengths)
        ? report.strengths
        : ["Clear articulation of technical concepts."],
    improvement_areas: Array.isArray(report.improvement_areas)
      ? report.improvement_areas
      : Array.isArray(report.improvements)
        ? report.improvements
        : ["Structure responses using the STAR format (Situation, Task, Action, Result)."],
    skills_mastery_level: skillsMastery,
    actionable_coaching_tips: (Array.isArray(report.actionable_coaching_tips)
      ? report.actionable_coaching_tips
      : ["Practice answering technical questions out loud to improve verbal fluency."]
    )
      .map((tip: string) => {
        if (
          typeof tip === "string" &&
          (tip.toLowerCase().includes("work on structuring your response to:") ||
            tip.toLowerCase().includes("welcome!"))
        ) {
          return "Structure your responses using the STAR method (Situation, Task, Action, Result) to clearly state the outcome.";
        }
        return tip;
      })
      .filter(Boolean),
    better_answers: betterAnswers,
  };
}

export function InterviewResultsScreen({
  sessionId,
  mode = "playground",
  transport = "webrtc",
}: InterviewResultsScreenProps) {
  const homeRoute = mode === "buddy" ? "/ai-interview" : "/interview-playground";
  const [isTranscriptExpanded, setIsTranscriptExpanded] = useState(false);
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const goBack = useSafeBack(homeRoute);

  const isPipeline = transport === "pipeline";

  const {
    data: webrtcSession,
    isLoading: isLoadingWebrtc,
    isError: isErrorWebrtc,
  } = useGetInterviewSessionQuery(
    { sessionId: sessionId ?? "", mode },
    {
      skip: !sessionId || isPipeline,
    },
  );

  const {
    data: pipelineSession,
    isLoading: isLoadingPipeline,
    isError: isErrorPipeline,
  } = useGetPipelineSessionQuery(
    { sessionId: sessionId ?? "", mode },
    {
      skip: !sessionId || !isPipeline,
    },
  );

  const session = isPipeline ? pipelineSession : webrtcSession;
  const isLoading = isPipeline ? isLoadingPipeline : isLoadingWebrtc;
  const isError = isPipeline ? isErrorPipeline : isErrorWebrtc;

  if (!sessionId) {
    return (
      <View
        style={[
          styles.safe,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
          isDark && { backgroundColor: "#0F172A" },
        ]}
      >
        <View style={styles.center}>
          <Text style={styles.errorText}>No session ID provided.</Text>
          <Pressable style={styles.backButton} onPress={() => router.push(homeRoute as never)}>
            <Text style={styles.backButtonText}>Back to Interviews</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View
        style={[
          styles.safe,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
          isDark && { backgroundColor: "#0F172A" },
        ]}
      >
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={[styles.loadingText, isDark && { color: "#94A3B8" }]}>Loading results…</Text>
        </View>
      </View>
    );
  }

  if (isError || !session) {
    return (
      <View
        style={[
          styles.safe,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
          isDark && { backgroundColor: "#0F172A" },
        ]}
      >
        <View style={styles.center}>
          <Text style={styles.errorText}>Failed to load session results.</Text>
          <Pressable style={styles.backButton} onPress={() => router.push(homeRoute as never)}>
            <Text style={styles.backButtonText}>Back to Interviews</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const effectiveEvaluation = normalizeEvaluation(session);
  const effectiveCoachReport = normalizeCoachReport(session);
  const displayDate = (session as any).created_at || (session as any).started_at;
  const displayTranscript = toDisplayTranscript((session as any).transcript);
  const titleRole =
    (session as any).derived_role ||
    ((session as any).selected_skills?.[0]
      ? `${(session as any).selected_skills[0]} Specialist`
      : null) ||
    (mode === "buddy" ? "Generative AI Intern" : "Practice Session");

  return (
    <View
      style={[
        styles.safe,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
        isDark && { backgroundColor: "#0F172A" },
      ]}
    >
      <View
        style={[
          styles.topBar,
          isDark && { backgroundColor: "#1E293B", borderBottomColor: "#334155" },
        ]}
      >
        <Pressable
          onPress={goBack}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
          }}
        >
          <Ionicons name="arrow-back" size={20} color={isDark ? "#fff" : "#0F172A"} />
        </Pressable>
        <Text style={[styles.title, isDark && { color: "#F8FAFC" }]} numberOfLines={1}>
          {titleRole}
        </Text>
        <Text style={styles.date}>
          {displayDate ? new Date(displayDate).toLocaleDateString() : ""}
        </Text>
      </View>

      <View style={styles.body}>
        {mode === "buddy" ? (
          effectiveCoachReport ? (
            <CoachReportView report={effectiveCoachReport} />
          ) : (
            <View style={styles.noEvalContainer}>
              <Text style={[styles.noEvalText, isDark && { color: "#94A3B8" }]}>
                Evaluation is still being processed or was not available.
              </Text>
            </View>
          )
        ) : effectiveEvaluation ? (
          <ScoreBreakdown evaluation={effectiveEvaluation} />
        ) : (
          <View style={styles.noEvalContainer}>
            <Text style={[styles.noEvalText, isDark && { color: "#94A3B8" }]}>
              Evaluation is still being processed or was not available.
            </Text>
          </View>
        )}

        {displayTranscript.length > 0 && (
          <View style={[styles.transcriptSection, isDark && { borderTopColor: "#334155" }]}>
            <Pressable
              style={[styles.transcriptToggle, isDark && { backgroundColor: "#312E81" }]}
              onPress={() => setIsTranscriptExpanded((prev) => !prev)}
            >
              <Text style={[styles.transcriptToggleText, isDark && { color: "#A5B4FC" }]}>
                {isTranscriptExpanded ? "Hide Transcript" : "Show Transcript"}
              </Text>
            </Pressable>

            {isTranscriptExpanded && (
              <View
                style={[
                  styles.transcriptBox,
                  isDark && { backgroundColor: "#0F172A", borderColor: "#334155" },
                ]}
              >
                <TranscriptPanel turns={displayTranscript} />
              </View>
            )}
          </View>
        )}
      </View>

      <View
        style={[styles.footer, isDark && { backgroundColor: "#1E293B", borderTopColor: "#334155" }]}
      >
        <Pressable
          style={[
            styles.footerButton,
            styles.secondaryButton,
            isDark && { backgroundColor: "#312E81" },
          ]}
          onPress={() => router.push(homeRoute as never)}
        >
          <Text style={[styles.secondaryButtonText, isDark && { color: "#A5B4FC" }]}>
            {mode === "buddy" ? "Back to Buddy" : "View History"}
          </Text>
        </Pressable>
        <Pressable
          style={[styles.footerButton, styles.primaryButton]}
          onPress={() => router.replace(homeRoute as never)}
        >
          <Text style={styles.primaryButtonText}>Try Again</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  topBar: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    flex: 1,
    marginRight: 12,
  },
  date: {
    fontSize: 12,
    color: "#94A3B8",
  },
  body: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    padding: 24,
  },
  loadingText: {
    color: "#64748B",
    fontSize: 14,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 14,
    textAlign: "center",
  },
  backButton: {
    backgroundColor: "#4F46E5",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  backButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  noEvalContainer: {
    padding: 24,
    alignItems: "center",
  },
  noEvalText: {
    color: "#64748B",
    fontSize: 14,
    textAlign: "center",
  },
  transcriptSection: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingTop: 12,
  },
  transcriptToggle: {
    alignSelf: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#EEF2FF",
  },
  transcriptToggleText: {
    color: "#4F46E5",
    fontSize: 13,
    fontWeight: "600",
  },
  transcriptBox: {
    height: 240,
    marginTop: 8,
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    padding: 20,
    paddingBottom: 32,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  footerButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryButton: {
    backgroundColor: "#4F46E5",
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  secondaryButton: {
    backgroundColor: "#EEF2FF",
  },
  secondaryButtonText: {
    color: "#4F46E5",
    fontWeight: "600",
    fontSize: 15,
  },
});
