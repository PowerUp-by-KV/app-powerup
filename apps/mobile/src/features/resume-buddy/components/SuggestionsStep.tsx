import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SkillChip } from "./SkillChip";
import { AnalysisCard } from "./AnalysisCard";

interface SuggestionsStepProps {
  missingSkills: string[];
  recommendedTech: string[];
  atsFindings: string[];
  suggestions: string[];
  onNext: () => void;
}

export function SuggestionsStep({
  missingSkills,
  recommendedTech,
  atsFindings,
  suggestions,
  onNext,
}: SuggestionsStepProps) {
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

        {/* Missing Skills Section */}
        <View className="bg-white border border-slate-200/60 rounded-3xl p-5 mb-5 shadow-sm">
          <Text className="text-slate-900 font-extrabold text-base mb-3">Missing Skills</Text>
          {missingSkills.length === 0 ? (
            <Text className="text-slate-400 text-sm italic">All target skills are matched!</Text>
          ) : (
            <View className="flex-row flex-wrap">
              {missingSkills.map((s, idx) => (
                <SkillChip key={`${s}-${idx}`} label={s} variant="missing" />
              ))}
            </View>
          )}
        </View>

        {/* Recommended Technologies Section */}
        <View className="bg-white border border-slate-200/60 rounded-3xl p-5 mb-5 shadow-sm">
          <Text className="text-slate-900 font-extrabold text-base mb-3">
            Recommended Tech Stack
          </Text>
          {recommendedTech.length === 0 ? (
            <Text className="text-slate-400 text-sm italic">No extra tech stack recommended</Text>
          ) : (
            <View className="flex-row flex-wrap">
              {recommendedTech.map((t, idx) => (
                <SkillChip key={`${t}-${idx}`} label={t} variant="recommended" />
              ))}
            </View>
          )}
        </View>

        {/* ATS Findings and Suggestions list */}
        <AnalysisCard items={atsFindings} type="finding" title="ATS Layout Findings" />
        <AnalysisCard items={suggestions} type="suggestion" title="Personalized Suggestions" />
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
