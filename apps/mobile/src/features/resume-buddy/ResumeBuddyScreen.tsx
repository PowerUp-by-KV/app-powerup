import React, { useEffect, useRef, useState } from "react";
import { SafeAreaView, View, Text, Pressable, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useSafeBack } from "@/hooks/useSafeBack";
import { useThemeToggle } from "@/hooks/useThemeToggle";
import { useResumeBuddyAnalysis } from "./hooks/useResumeBuddyAnalysis";
import type { ResumeBuddyStep } from "./types";

import { DomainInputStep } from "./components/DomainInputStep";
import { AnalysisLoadingStep } from "./components/AnalysisLoadingStep";
import { StrengthWeaknessStep } from "./components/StrengthWeaknessStep";
import { SuggestionsStep } from "./components/SuggestionsStep";
import { ScoreAnalysisStep } from "./components/ScoreAnalysisStep";
import { DocumentPickerAsset } from "expo-document-picker";

export function ResumeBuddyScreen() {
  const router = useRouter();
  const safeBack = useSafeBack();
  const { isDark } = useThemeToggle();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState<ResumeBuddyStep>("input");
  const { phase, activeStage, result: analysis, error, analyze, reset } = useResumeBuddyAnalysis();

  const submittingRef = useRef(false);

  const handleAnalyze = async (domain: string, file?: DocumentPickerAsset) => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setStep("loading");
    await analyze(domain, file);
    submittingRef.current = false;
  };

  useEffect(() => {
    if (phase === "done" && analysis) {
      setStep("scores");
    } else if (phase === "error") {
      setStep("input");
      Alert.alert(
        "Analysis Failed",
        error ?? "Failed to analyze your resume. Please check your connection and try again.",
      );
      reset();
    }
  }, [phase, analysis, error, reset]);

  const handleHistory = () => {
    router.push("/resume-buddy-history" as never);
  };

  const handleBack = () => {
    if (step === "loading") {
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
    <View
      style={{ flex: 1, backgroundColor: isDark ? "#0F1020" : "#F4F5FA", paddingTop: insets.top }}
      className={isDark ? "bg-[#0F1020]" : "bg-[#F4F5FA]"}
    >
      {/* Header */}
      <View
        className={`flex-row items-center px-4 py-3 ${isDark ? "bg-[#0F1020]" : "bg-[#F4F5FA]"}`}
      >
        <Pressable
          onPress={handleBack}
          disabled={step === "loading"}
          className={`w-10 h-10 items-center justify-center rounded-full active:opacity-60 ${
            isDark ? "bg-[#1A1C29]" : "bg-white shadow-sm"
          } ${step === "loading" ? "opacity-30" : ""}`}
        >
          <Feather name="chevron-left" size={20} color={isDark ? "#8B93A8" : "#0f172a"} />
        </Pressable>
        <Text
          className={`flex-1 text-center font-bold text-lg ${isDark ? "text-white" : "text-slate-900"}`}
        >
          {step === "scores"
            ? "Resume Score"
            : step === "strengths"
              ? "Strengths & Weaknesses"
              : "AI Resume Coach"}
        </Text>
        {isOnResultsStep ? (
          <Text
            className={`text-xs font-semibold w-10 text-right ${isDark ? "text-slate-400" : "text-slate-500"}`}
          >
            {step === "scores" ? "1/3" : step === "strengths" ? "2/3" : "3/3"}
          </Text>
        ) : (
          <View className="w-10" />
        )}
      </View>

      {/* Main step machine */}
      <View style={{ flex: 1 }} className={isDark ? "bg-[#0F1020]" : "bg-[#F4F5FA]"}>
        {step === "input" && (
          <DomainInputStep
            onAnalyze={handleAnalyze}
            onHistory={handleHistory}
            isLoading={phase === "running"}
          />
        )}

        {step === "loading" && <AnalysisLoadingStep activeStage={activeStage} />}

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
            onHistory={handleHistory}
            qualitySummary={analysis.resume_quality_summary}
            targetRole={analysis.target_role}
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
    </View>
  );
}
