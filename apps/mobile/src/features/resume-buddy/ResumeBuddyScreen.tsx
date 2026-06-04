import React, { useRef, useState, useEffect } from "react";
import { SafeAreaView, View, Text, Pressable, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { useSafeBack } from "@/hooks/useSafeBack";
import { getApiErrorMessage } from "@/utils/error-message";
import { useAppDispatch } from "@/store/hooks";
import { getAuthSession } from "@/services/auth-storage";
import { normalizeBaseUrlForRuntime } from "@/services/api";
import { resumeBuddyApi, useAnalyzeResumeMutation } from "./services/resume-buddy-api";
import type { ResumeBuddyResponse, ResumeBuddyStep, StageStatus } from "./types";

import { DomainInputStep } from "./components/DomainInputStep";
import { AnalysisLoadingStep } from "./components/AnalysisLoadingStep";
import { StrengthWeaknessStep } from "./components/StrengthWeaknessStep";
import { SuggestionsStep } from "./components/SuggestionsStep";
import { ScoreAnalysisStep } from "./components/ScoreAnalysisStep";

// Helper to map SSE stage + status to 6 UI loading stages
function getStageStatuses(stage: string, status: string): StageStatus[] {
  const statuses: StageStatus[] = [
    "pending",
    "pending",
    "pending",
    "pending",
    "pending",
    "pending",
  ];

  if (stage === "extraction") {
    if (status === "started") {
      statuses[0] = "active";
    } else {
      statuses[0] = "done";
      statuses[1] = "active";
    }
  } else if (stage === "ats") {
    if (status === "started") {
      statuses[0] = "done";
      statuses[1] = "done";
      statuses[2] = "active";
    } else {
      statuses[0] = "done";
      statuses[1] = "done";
      statuses[2] = "done";
      statuses[3] = "active";
    }
  } else if (stage === "ai") {
    if (status === "started") {
      statuses[0] = "done";
      statuses[1] = "done";
      statuses[2] = "done";
      statuses[3] = "done";
      statuses[4] = "active";
    } else {
      statuses[0] = "done";
      statuses[1] = "done";
      statuses[2] = "done";
      statuses[3] = "done";
      statuses[4] = "done";
      statuses[5] = "active";
    }
  } else if (stage === "done") {
    statuses[0] = "done";
    statuses[1] = "done";
    statuses[2] = "done";
    statuses[3] = "done";
    statuses[4] = "done";
    statuses[5] = "done";
  }

  return statuses;
}

// Sanitization to ensure UI has safe defaults
function sanitizeResumeBuddyResponse(parsed: any): ResumeBuddyResponse {
  const atsScore = parsed.ats_score ?? 0;
  const targetRole = parsed.target_role ?? "";
  const skillsMatchPercentage = parsed.skills_match_percentage ?? 0;
  const missingSkills = parsed.missing_skills ?? [];

  return {
    overall_resume_score: parsed.overall_resume_score ?? 0,
    rule_based_score: parsed.rule_based_score ?? 0,
    ai_semantic_score: parsed.ai_semantic_score ?? 0,
    final_score_formula: parsed.final_score_formula ?? "",
    ats_score: atsScore,
    skills_match_percentage: skillsMatchPercentage,
    target_role: targetRole,
    detected_sections: parsed.detected_sections ?? [],
    sections: parsed.sections ?? {},
    criteria_scores: parsed.criteria_scores ?? [],
    ats_analysis: parsed.ats_analysis ?? {
      score: atsScore,
      max_score: 20,
      is_ats_friendly: parsed.ats_analysis?.is_ats_friendly ?? false,
      single_column_layout: parsed.ats_analysis?.single_column_layout ?? false,
      proper_section_headings: parsed.ats_analysis?.proper_section_headings ?? false,
      no_tables_images_icons: parsed.ats_analysis?.no_tables_images_icons ?? false,
      standard_formatting: parsed.ats_analysis?.standard_formatting ?? false,
      keyword_optimization: parsed.ats_analysis?.keyword_optimization ?? false,
      findings: parsed.ats_analysis?.findings ?? [],
    },
    skills_analysis: parsed.skills_analysis ?? {
      target_role: targetRole,
      match_percentage: skillsMatchPercentage,
      matched_skills: parsed.skills_analysis?.matched_skills ?? [],
      missing_skills: missingSkills,
      recommended_technologies: parsed.skills_analysis?.recommended_technologies ?? [],
    },
    strengths: parsed.strengths ?? [],
    weaknesses: parsed.weaknesses ?? [],
    missing_skills: missingSkills,
    personalized_suggestions: parsed.personalized_suggestions ?? [],
    resume_quality_summary: parsed.resume_quality_summary ?? "",
  };
}

// Custom SSE Stream Client using XMLHttpRequest
function subscribeToResumeBuddyStatus(
  jobId: string,
  onMessage: (event: any) => void,
  onError: (error: Error) => void,
  onClose: () => void,
) {
  let isCancelled = false;
  let xhr: XMLHttpRequest | null = null;

  const start = async () => {
    try {
      const session = await getAuthSession();
      if (isCancelled) return;

      const apiUrl = process.env.EXPO_PUBLIC_API_URL;
      if (!apiUrl) {
        throw new Error("EXPO_PUBLIC_API_URL is not set");
      }
      const rawBase = apiUrl.replace(/\/$/, "");
      const baseUrl = normalizeBaseUrlForRuntime(rawBase);
      const url = `${baseUrl}/v1/resume/buddy/status/${jobId}`;

      const activeXhr = new XMLHttpRequest();
      xhr = activeXhr;

      activeXhr.open("GET", url);
      activeXhr.setRequestHeader("X-Tunnel-Skip-AntiPhishing-Page", "true");
      activeXhr.setRequestHeader("Accept", "text/event-stream");

      if (session?.access_token) {
        activeXhr.setRequestHeader("Authorization", `Bearer ${session.access_token}`);
      }

      let seenBytes = 0;
      let buffer = "";

      const processChunk = (chunk: string) => {
        buffer += chunk;
        let lineEndIdx;
        while ((lineEndIdx = buffer.indexOf("\n")) !== -1) {
          const line = buffer.slice(0, lineEndIdx).trim();
          buffer = buffer.slice(lineEndIdx + 1);

          if (line.startsWith("data:")) {
            const dataStr = line.slice(5).trim();
            if (dataStr) {
              try {
                const parsed = JSON.parse(dataStr);
                if (!isCancelled) {
                  onMessage(parsed);
                }
              } catch (err) {
                console.warn("Failed to parse SSE data JSON:", dataStr, err);
              }
            }
          }
        }
      };

      activeXhr.onreadystatechange = () => {
        if (isCancelled) return;

        if (activeXhr.readyState === 3 || activeXhr.readyState === 4) {
          const text = activeXhr.responseText || "";
          if (text.length > seenBytes) {
            const chunk = text.slice(seenBytes);
            seenBytes = text.length;
            processChunk(chunk);
          }
        }

        if (activeXhr.readyState === 4) {
          if (activeXhr.status >= 200 && activeXhr.status < 300) {
            if (!isCancelled) {
              onClose();
            }
          } else {
            if (!isCancelled) {
              onError(new Error(`SSE connection closed with status ${activeXhr.status}`));
            }
          }
        }
      };

      activeXhr.onerror = () => {
        if (!isCancelled) {
          onError(new Error("SSE network error"));
        }
      };

      activeXhr.send();
    } catch (err: any) {
      if (!isCancelled) {
        onError(err);
      }
    }
  };

  start();

  return () => {
    isCancelled = true;
    if (xhr) {
      xhr.abort();
    }
  };
}

export function ResumeBuddyScreen() {
  const router = useRouter();
  const safeBack = useSafeBack();
  const dispatch = useAppDispatch();

  const [step, setStep] = useState<ResumeBuddyStep>("input");
  const [analysis, setAnalysis] = useState<ResumeBuddyResponse | null>(null);
  const [stageStatuses, setStageStatuses] = useState<StageStatus[]>([
    "active",
    "pending",
    "pending",
    "pending",
    "pending",
    "pending",
  ]);
  const [currentStage, setCurrentStage] = useState("extraction");
  const [currentStatus, setCurrentStatus] = useState("started");
  const [currentScore, setCurrentScore] = useState<number | undefined>();

  const [analyzeResume, { isLoading }] = useAnalyzeResumeMutation();

  // Guard against duplicate submissions
  const submittingRef = useRef(false);
  const sseCleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      if (sseCleanupRef.current) {
        sseCleanupRef.current();
      }
    };
  }, []);

  const handleAnalyze = async (domain: string) => {
    if (submittingRef.current) return;
    submittingRef.current = true;

    setStageStatuses(["active", "pending", "pending", "pending", "pending", "pending"]);
    setCurrentStage("extraction");
    setCurrentStatus("started");
    setCurrentScore(undefined);
    setStep("loading");

    try {
      const res = await analyzeResume({ domain }).unwrap();
      const jobId = res.job_id;

      if (!jobId) {
        throw new Error("No job_id returned from API");
      }

      if (sseCleanupRef.current) {
        sseCleanupRef.current();
      }

      sseCleanupRef.current = subscribeToResumeBuddyStatus(
        jobId,
        (event) => {
          if (event.stage && event.status) {
            const nextStatuses = getStageStatuses(event.stage, event.status);
            setStageStatuses(nextStatuses);
            setCurrentStage(event.stage);
            setCurrentStatus(event.status);
            if (typeof event.score === "number") {
              setCurrentScore(event.score);
            }

            if (event.stage === "done" && event.status === "completed") {
              const sanitized = sanitizeResumeBuddyResponse(event);
              setAnalysis(sanitized);

              dispatch(resumeBuddyApi.util.invalidateTags(["Resume"]));

              setStep("scores");
              submittingRef.current = false;
              if (sseCleanupRef.current) {
                sseCleanupRef.current();
                sseCleanupRef.current = null;
              }
            }
          }
        },
        (err) => {
          console.error("Resume Buddy analysis failed:", err);
          setStep("input");
          submittingRef.current = false;
          if (sseCleanupRef.current) {
            sseCleanupRef.current();
            sseCleanupRef.current = null;
          }
          Alert.alert(
            "Analysis Failed",
            "An error occurred during resume analysis. Please try again.",
          );
        },
        () => {
          if (submittingRef.current) {
            console.warn("SSE connection closed prematurely");
            setStep("input");
            submittingRef.current = false;
            Alert.alert(
              "Analysis Failed",
              "The connection was closed before analysis completed. Please try again.",
            );
          }
          if (sseCleanupRef.current) {
            sseCleanupRef.current();
            sseCleanupRef.current = null;
          }
        },
      );
    } catch (err) {
      console.error("Resume Buddy analysis failed:", err);
      setStep("input");
      submittingRef.current = false;
      Alert.alert(
        "Analysis Failed",
        getApiErrorMessage(
          err,
          "Failed to analyze your resume. Please check your connection and try again.",
        ),
      );
    }
  };

  const handleHistory = () => {
    router.push("/resume-buddy-history" as never);
  };

  const handleBack = () => {
    if (step === "loading") {
      // Prevent navigation during analysis
      return;
    }
    if (step === "suggestions") {
      setStep("strengths");
    } else if (step === "strengths") {
      setStep("scores");
    } else if (step === "scores") {
      setStep("input");
    } else {
      safeBack();
    }
  };

  const handleDone = () => {
    safeBack();
  };

  const isOnResultsStep = step === "strengths" || step === "suggestions" || step === "scores";

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-slate-50">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 bg-white border-b border-slate-100">
        <Pressable
          onPress={handleBack}
          disabled={step === "loading"}
          className={`w-9 h-9 items-center justify-center active:opacity-60 ${
            step === "loading" ? "opacity-30" : ""
          }`}
        >
          <Feather name="chevron-left" size={22} color="#0f172a" />
        </Pressable>
        <Text className="flex-1 text-center font-bold text-slate-900 text-base">Resume Buddy</Text>
        {/* Step indicator on result steps */}
        {isOnResultsStep ? (
          <Text className="text-xs text-slate-400 font-semibold w-9 text-right">
            {step === "scores" ? "1/3" : step === "strengths" ? "2/3" : "3/3"}
          </Text>
        ) : (
          <View className="w-9" />
        )}
      </View>

      {/* Main step machine */}
      <View style={{ flex: 1 }}>
        {step === "input" && (
          <DomainInputStep
            onAnalyze={handleAnalyze}
            onHistory={handleHistory}
            isLoading={isLoading}
          />
        )}

        {step === "loading" && (
          <AnalysisLoadingStep
            stageStatuses={stageStatuses}
            stage={currentStage}
            status={currentStatus}
            score={currentScore}
          />
        )}

        {step === "strengths" && analysis && (
          <StrengthWeaknessStep
            strengths={analysis.strengths}
            weaknesses={analysis.weaknesses}
            onNext={() => setStep("suggestions")}
          />
        )}

        {step === "suggestions" && analysis && (
          <SuggestionsStep
            missingSkills={analysis.missing_skills}
            recommendedTech={analysis.skills_analysis.recommended_technologies}
            atsFindings={analysis.ats_analysis.findings}
            suggestions={analysis.personalized_suggestions}
            qualitySummary={analysis.resume_quality_summary}
            onNext={handleDone}
          />
        )}

        {step === "scores" && analysis && (
          <ScoreAnalysisStep
            overallScore={analysis.overall_resume_score}
            atsScore={analysis.ats_score}
            semanticScore={analysis.ai_semantic_score}
            ruleBasedScore={analysis.rule_based_score}
            criteriaScores={analysis.criteria_scores}
            qualitySummary={analysis.resume_quality_summary}
            onDone={() => setStep("strengths")}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
