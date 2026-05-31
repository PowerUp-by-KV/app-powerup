import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { ScoreRing } from "./ScoreRing";
import { ResumeBuddyCriterionScore } from "../types";

interface ScoreAnalysisStepProps {
  overallScore: number;
  atsScore: number;
  semanticScore: number;
  ruleBasedScore: number;
  criteriaScores: ResumeBuddyCriterionScore[];
  qualitySummary: string;
  onDone: () => void;
}

export function ScoreAnalysisStep({
  overallScore,
  atsScore,
  semanticScore,
  ruleBasedScore,
  criteriaScores,
  qualitySummary,
  onDone,
}: ScoreAnalysisStepProps) {
  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-slate-900 text-2xl font-extrabold text-center mb-1">
          Resume Analysis Score
        </Text>
        <Text className="text-slate-500 text-sm text-center mb-8">
          Detailed metrics and mathematical criteria weightings
        </Text>

        {/* Large Score Ring */}
        <View className="items-center mb-8 bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm">
          <ScoreRing score={overallScore} maxScore={100} label="Overall Score" />
          <Text className="text-slate-500 text-xs mt-3 text-center px-4 leading-5 italic">
            {qualitySummary}
          </Text>
        </View>

        {/* Sub Score Rings */}
        <View className="flex-row justify-between mb-8 px-2 bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm">
          <ScoreRing score={atsScore} maxScore={20} label="ATS Score" />
          <ScoreRing score={semanticScore} maxScore={10} label="Semantic Score" />
          <ScoreRing score={ruleBasedScore} maxScore={10} label="Rule-Based" />
        </View>

        {/* Criteria Breakdown list */}
        <Text className="text-slate-900 font-extrabold text-base mb-4">
          Detailed Criteria Metrics
        </Text>
        {criteriaScores.map((c, idx) => {
          const pct = Math.min((c.score / c.max_score) * 100, 100);
          return (
            <View
              key={`${c.key}-${idx}`}
              className="bg-white border border-slate-100 rounded-2xl p-5 mb-4 shadow-sm"
            >
              <View className="flex-row justify-between items-center mb-2.5">
                <Text className="text-slate-900 font-bold text-sm">{c.label}</Text>
                <Text className="text-slate-500 font-bold text-xs">
                  {c.score}/{c.max_score}
                </Text>
              </View>
              {/* Progress Bar */}
              <View className="h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
                <View className="h-full bg-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
              </View>
              <Text className="text-slate-500 text-xs leading-5">{c.feedback}</Text>
            </View>
          );
        })}
      </ScrollView>

      {/* Sticky footer */}
      <View className="px-5 pb-10 pt-4 bg-slate-50 border-t border-slate-100">
        <Pressable
          onPress={onDone}
          className="bg-slate-900 active:bg-slate-800 rounded-2xl py-4 items-center justify-center shadow-sm"
        >
          <Text className="text-white font-bold text-sm">Next</Text>
        </Pressable>
      </View>
    </View>
  );
}
