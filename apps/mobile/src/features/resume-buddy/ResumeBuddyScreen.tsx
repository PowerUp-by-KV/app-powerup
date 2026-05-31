import React, { useRef, useState } from "react";
import { SafeAreaView, View, Text, Pressable, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { useSafeBack } from "@/hooks/useSafeBack";
import { getApiErrorMessage } from "@/utils/error-message";
import { useAnalyzeResumeMutation } from "./services/resume-buddy-api";
import type { ResumeBuddyResponse, ResumeBuddyStep } from "./types";

import { DomainInputStep } from "./components/DomainInputStep";
import { AnalysisLoadingStep } from "./components/AnalysisLoadingStep";
import { StrengthWeaknessStep } from "./components/StrengthWeaknessStep";
import { SuggestionsStep } from "./components/SuggestionsStep";
import { ScoreAnalysisStep } from "./components/ScoreAnalysisStep";

export function ResumeBuddyScreen() {
  const router = useRouter();
  const safeBack = useSafeBack();

  const [step, setStep] = useState<ResumeBuddyStep>("input");
  const [analysis, setAnalysis] = useState<ResumeBuddyResponse | null>(null);

  const [analyzeResume, { isLoading }] = useAnalyzeResumeMutation();

  // Guard against duplicate submissions
  const submittingRef = useRef(false);

  const handleAnalyze = async (domain: string) => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setStep("loading");

    try {
      const res = await analyzeResume({ domain }).unwrap();
      setAnalysis(res);
      setStep("scores");
    } catch (err) {
      console.error("Resume Buddy analysis failed:", err);
      setStep("input");
      Alert.alert(
        "Analysis Failed",
        getApiErrorMessage(
          err,
          "Failed to analyze your resume. Please check your connection and try again.",
        ),
      );
    } finally {
      submittingRef.current = false;
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

        {step === "loading" && <AnalysisLoadingStep />}

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
