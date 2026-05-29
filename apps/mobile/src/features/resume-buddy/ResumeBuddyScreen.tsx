import React, { useState } from "react";
import { SafeAreaView, View, Text, Pressable, Alert, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";

import { useSafeBack } from "@/hooks/useSafeBack";
import { getApiErrorMessage } from "@/utils/error-message";
import { useAnalyzeResumeMutation } from "./services/resume-buddy-api";
import { ResumeBuddyResponse, ResumeBuddyStep } from "./types";

import { ResumeUploadStep } from "./components/ResumeUploadStep";
import { StrengthWeaknessStep } from "./components/StrengthWeaknessStep";
import { SuggestionsStep } from "./components/SuggestionsStep";
import { ScoreAnalysisStep } from "./components/ScoreAnalysisStep";

export function ResumeBuddyScreen() {
  const safeBack = useSafeBack();

  const [step, setStep] = useState<ResumeBuddyStep>("upload");
  const [analysis, setAnalysis] = useState<ResumeBuddyResponse | null>(null);

  const [analyzeResume, { isLoading }] = useAnalyzeResumeMutation();

  const handleAnalyze = async (file: DocumentPicker.DocumentPickerAsset, role: string) => {
    try {
      const formData = new FormData();
      formData.append("target_role", role);

      if (Platform.OS === "web" && (file as any).file) {
        // Standard Web browser FormData expects native File
        formData.append("file", (file as any).file, file.name);
      } else {
        // Mobile (React Native) expects { uri, name, type } shape
        const rnFile = {
          uri: file.uri,
          name: file.name,
          type: file.mimeType ?? "application/pdf",
        };
        formData.append("file", rnFile as unknown as Blob, file.name);
      }

      const res = await analyzeResume(formData).unwrap();
      setAnalysis(res);
      setStep("strengths");
    } catch (err) {
      console.error("Resume Buddy analysis failed:", err);
      Alert.alert(
        "Analysis Failed",
        getApiErrorMessage(err, "Failed to analyze your resume. Please check your connection."),
      );
    }
  };

  const handleBack = () => {
    if (step === "scores") {
      setStep("suggestions");
    } else if (step === "suggestions") {
      setStep("strengths");
    } else if (step === "strengths") {
      setStep("upload");
    } else {
      safeBack();
    }
  };

  const handleDone = () => {
    safeBack();
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-slate-50">
      {/* Header control */}
      <View className="flex-row items-center px-4 py-3 bg-white border-b border-slate-100">
        <Pressable
          onPress={handleBack}
          className="w-9 h-9 items-center justify-center active:opacity-60"
        >
          <Feather name="chevron-left" size={22} color="#0f172a" />
        </Pressable>
        <Text className="flex-1 text-center font-bold text-slate-900 text-base">Resume Buddy</Text>
        <View className="w-9" />
      </View>

      {/* Main step machine */}
      <View style={{ flex: 1 }}>
        {step === "upload" && <ResumeUploadStep onAnalyze={handleAnalyze} isLoading={isLoading} />}
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
            onNext={() => setStep("scores")}
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
            onDone={handleDone}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
