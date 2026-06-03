import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { AnalysisCard } from "./AnalysisCard";

interface StrengthWeaknessStepProps {
  strengths: string[];
  weaknesses: string[];
  onNext: () => void;
}

export function StrengthWeaknessStep({ strengths, weaknesses, onNext }: StrengthWeaknessStepProps) {
  const strengthsVal = strengths ?? [];
  const weaknessesVal = weaknesses ?? [];

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-slate-900 text-2xl font-extrabold text-center mb-1">
          Strengths & Weaknesses
        </Text>
        <Text className="text-slate-500 text-sm text-center mb-8">
          Detailed diagnostic breakdown of your parsed resume structure
        </Text>

        <AnalysisCard items={strengthsVal} type="strength" title="Key Strengths" />
        <AnalysisCard items={weaknessesVal} type="weakness" title="Areas to Improve" />
      </ScrollView>

      {/* Sticky footer */}
      <View className="px-5 pb-10 pt-4 bg-slate-50 border-t border-slate-100">
        <Pressable
          onPress={onNext}
          className="bg-indigo-600 active:bg-indigo-500 rounded-2xl py-4 items-center justify-center shadow-sm"
        >
          <Text className="text-white font-bold text-sm">Next</Text>
        </Pressable>
      </View>
    </View>
  );
}
