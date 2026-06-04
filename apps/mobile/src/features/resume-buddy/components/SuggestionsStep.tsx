import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { SkillChip } from "./SkillChip";
import { AnalysisCard } from "./AnalysisCard";

interface SuggestionsStepProps {
  missingSkills: string[];
  recommendedTech: string[];
  atsFindings: string[];
  suggestions: string[];
  qualitySummary?: string;
  onNext: () => void;
}

export function SuggestionsStep({
  missingSkills,
  recommendedTech,
  atsFindings,
  suggestions,
  qualitySummary,
  onNext,
}: SuggestionsStepProps) {
  // Defensive fallbacks
  const missingSkillsVal = missingSkills ?? [];
  const recommendedTechVal = recommendedTech ?? [];
  const atsFindingsVal = atsFindings ?? [];
  const suggestionsVal = suggestions ?? [];
  const qualitySummaryVal = qualitySummary ?? "";

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-slate-900 text-2xl font-extrabold text-center mb-1">
          Skills & Suggestions
        </Text>
        <Text className="text-slate-500 text-sm text-center mb-8">
          Personalized skill alignments and ATS layout diagnostics
        </Text>

        {/* Resume Quality Summary */}
        {qualitySummaryVal ? (
          <View className="bg-indigo-50 border border-indigo-100 rounded-3xl p-5 mb-5 shadow-sm">
            <View className="flex-row items-center mb-2.5">
              <Feather name="award" size={20} color="#4f46e5" />
              <Text className="text-slate-900 font-extrabold text-base ml-2">
                Resume Quality Summary
              </Text>
            </View>
            <Text className="text-slate-700 text-sm leading-5">{qualitySummaryVal}</Text>
          </View>
        ) : null}

        {/* Missing Skills Section */}
        <View className="bg-white border border-slate-200/60 rounded-3xl p-5 mb-5 shadow-sm">
          <Text className="text-slate-900 font-extrabold text-base mb-3">Missing Skills</Text>
          {missingSkillsVal.length === 0 ? (
            <Text className="text-slate-400 text-sm italic">No critical skills missing.</Text>
          ) : (
            <View className="flex-row flex-wrap">
              {missingSkillsVal.map((s, idx) => {
                if (!s) return null;
                return <SkillChip key={`${s}-${idx}`} label={s} variant="missing" />;
              })}
            </View>
          )}
        </View>

        {/* Recommended Technologies Section */}
        <View className="bg-white border border-slate-200/60 rounded-3xl p-5 mb-5 shadow-sm">
          <Text className="text-slate-900 font-extrabold text-base mb-3">
            Recommended Tech Stack
          </Text>
          {recommendedTechVal.length === 0 ? (
            <Text className="text-slate-400 text-sm italic">No extra tech stack recommended</Text>
          ) : (
            <View className="flex-row flex-wrap">
              {recommendedTechVal.map((t, idx) => {
                if (!t) return null;
                return <SkillChip key={`${t}-${idx}`} label={t} variant="recommended" />;
              })}
            </View>
          )}
        </View>

        {/* ATS Findings and Suggestions list */}
        {atsFindingsVal.length > 0 && (
          <AnalysisCard items={atsFindingsVal} type="finding" title="ATS Layout Findings" />
        )}
        {suggestionsVal.length > 0 && (
          <AnalysisCard items={suggestionsVal} type="suggestion" title="Personalized Suggestions" />
        )}
      </ScrollView>

      {/* Sticky footer */}
      <View className="px-5 pb-10 pt-4 bg-slate-50 border-t border-slate-100">
        <Pressable
          onPress={onNext}
          className="bg-indigo-600 active:bg-indigo-500 rounded-2xl py-4 items-center justify-center shadow-sm"
        >
          <Text className="text-white font-bold text-sm">Done</Text>
        </Pressable>
      </View>
    </View>
  );
}
