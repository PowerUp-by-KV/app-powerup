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
  // Defensive fallback values
  const overallScoreVal = overallScore ?? 0;
  const atsScoreVal = atsScore ?? 0;
  const semanticScoreVal = semanticScore ?? 0;
  const ruleBasedScoreVal = ruleBasedScore ?? 0;
  const criteriaScoresVal = criteriaScores ?? [];
  const qualitySummaryVal = qualitySummary ?? "";

  // Scoring mapping
  const basicInfo = Math.round(Math.max(0, Math.min(100, ruleBasedScoreVal * 0.2)));
  const atsPercentage = Math.round(Math.max(0, Math.min(100, (atsScoreVal / 20) * 100)));
  const sectionCompleteness = Math.round(Math.max(0, Math.min(100, ruleBasedScoreVal)));
  const resumeQuality = Math.round(Math.max(0, Math.min(100, semanticScoreVal)));
  const professionalSummary = Math.round(
    Math.max(0, Math.min(100, (semanticScoreVal + ruleBasedScoreVal) / 2)),
  );

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
          <ScoreRing score={overallScoreVal} maxScore={100} label="Overall Score" />
          {qualitySummaryVal ? (
            <Text className="text-slate-500 text-xs mt-3 text-center px-4 leading-5 italic">
              {qualitySummaryVal}
            </Text>
          ) : null}
        </View>

        {/* Sub Score Rings (5 Circular Metrics in Wrap layout) */}
        <Text className="text-slate-950 font-extrabold text-base mb-4">Score Breakdown</Text>
        <View
          className="flex-row flex-wrap justify-center mb-8 px-2 bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm"
          style={{ gap: 16 }}
        >
          <ScoreRing score={basicInfo} maxScore={100} label="Basic Information" />
          <ScoreRing score={atsPercentage} maxScore={100} label="ATS" />
          <ScoreRing score={sectionCompleteness} maxScore={100} label="Section Completeness" />
          <ScoreRing score={resumeQuality} maxScore={100} label="Resume Quality" />
          <ScoreRing score={professionalSummary} maxScore={100} label="Professional Summary" />
        </View>

        {/* Criteria Breakdown list */}
        {criteriaScoresVal.length > 0 && (
          <>
            <Text className="text-slate-900 font-extrabold text-base mb-4">
              Detailed Criteria Metrics
            </Text>
            {criteriaScoresVal.map((c, idx) => {
              if (!c) return null;
              const maxScoreVal = c.max_score || 100;
              const scoreVal = c.score || 0;
              const pct = Math.min((scoreVal / maxScoreVal) * 100, 100);
              return (
                <View
                  key={`${c.key ?? idx}-${idx}`}
                  className="bg-white border border-slate-100 rounded-2xl p-5 mb-4 shadow-sm"
                >
                  <View className="flex-row justify-between items-center mb-2.5">
                    <Text className="text-slate-900 font-bold text-sm">{c.label ?? "Metric"}</Text>
                    <Text className="text-slate-500 font-bold text-xs">
                      {scoreVal}/{maxScoreVal}
                    </Text>
                  </View>
                  {/* Progress Bar */}
                  <View className="h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
                    <View
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </View>
                  {c.feedback ? (
                    <Text className="text-slate-500 text-xs leading-5">{c.feedback}</Text>
                  ) : null}
                </View>
              );
            })}
          </>
        )}
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
