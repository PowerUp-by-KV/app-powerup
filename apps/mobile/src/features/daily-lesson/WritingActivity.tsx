import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { useGetDayActivitiesQuery } from "@/services/lesson-api";
import {
  useGetWritingActivityQuery,
  useSubmitWritingActivityMutation,
} from "@/services/writingactivity-api";
import { useLocalSearchParams } from "expo-router";
import { Check, X, ArrowRight, PenTool } from "lucide-react-native";

import { useActivityProgress } from "./hooks/useActivityProgress";

export const WritingActivity = ({
  progress,
}: {
  progress: ReturnType<typeof useActivityProgress>;
}) => {
  const params = useLocalSearchParams<{ moduleId: string; dayNo: string; cefr_level: string }>();

  const { data: activities } = useGetDayActivitiesQuery({
    moduleId: params.moduleId!,
    dayNo: parseInt(params.dayNo!),
    cefr_level: params.cefr_level!,
  });

  const activityId = activities?.find((a) => a.type === "writing")?.id;

  const { data: activity, isLoading } = useGetWritingActivityQuery(activityId!, {
    skip: !activityId,
  });
  const [, { isLoading: isSubmitting }] = useSubmitWritingActivityMutation();

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [result, setResult] = useState<{
    score: number;
    feedback: string;
    correct_answer?: string;
  } | null>(null);

  if (isLoading || !activity) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator color="#475569" />
      </View>
    );
  }

  const currentQuestion = activity.questions[0];

  const handleSubmit = async () => {
    if (!currentQuestion || selectedOption === null) return;
    const isCorrect = currentQuestion.options[selectedOption] === currentQuestion.answer;

    setResult({
      score: isCorrect ? 100 : 0,
      feedback: isCorrect
        ? "Excellent! You've selected the most professionally appropriate writing choice for this scenario."
        : `Not quite. The most effective professional writing choice would be "${currentQuestion.answer}".`,
      correct_answer: currentQuestion.answer,
    });
  };

  const handleFinish = () => {
    progress.recordScore("writing", result?.score || 0);
    progress.nextActivity();
  };

  if (!currentQuestion) {
    return (
      <View className="flex-1 justify-center items-center p-10">
        <Text className="text-slate-500 font-bold">No questions found.</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 px-6 pb-10" showsVerticalScrollIndicator={false}>
      <Text className="text-[12px] font-bold text-[#475569] uppercase tracking-widest mb-1">
        Writing Activity
      </Text>
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-[24px] font-bold text-[#1E293B] flex-1">
          {activity.scenario_name}
        </Text>
        {result?.score === 100 && (
          <View className="bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
            <Text className="text-emerald-700 font-bold text-[13px]">+20 Points</Text>
          </View>
        )}
      </View>

      <View className="p-8 bg-slate-50 border border-slate-100 rounded-[32px] mb-10 items-center">
        <View className="w-16 h-16 bg-blue-100 rounded-2xl items-center justify-center mb-4">
          <PenTool size={32} color="#2563eb" />
        </View>
        <Text className="text-slate-500 text-[13px] font-bold uppercase mb-2 tracking-widest">
          Writing Prompt
        </Text>
        <Text className="text-[20px] font-bold text-[#1E293B] text-center leading-relaxed">
          {currentQuestion.question}
        </Text>
      </View>

      <View className="space-y-4">
        {currentQuestion.options?.map((option, index) => {
          const isSelected = selectedOption === index;
          const isCorrect = result?.correct_answer === option;
          const isWrong = result && isSelected && !isCorrect;

          let borderClass = "border-slate-100";
          let bgClass = "bg-white";
          if (isSelected) {
            borderClass = "border-[#475569]";
            bgClass = "bg-slate-50";
          }
          if (result) {
            if (isCorrect) {
              borderClass = "border-emerald-500";
              bgClass = "bg-emerald-50";
            } else if (isWrong) {
              borderClass = "border-red-500";
              bgClass = "bg-red-50";
            }
          }

          return (
            <TouchableOpacity
              key={index}
              disabled={!!result}
              onPress={() => setSelectedOption(index)}
              className={`p-5 mb-4 rounded-2xl border ${borderClass} ${bgClass} shadow-sm`}
            >
              <View className="flex-row justify-between items-center">
                <Text
                  className={`flex-1 text-[16px] font-medium ${isSelected || isCorrect ? "text-slate-900" : "text-slate-600"}`}
                >
                  {option}
                </Text>
                {result && isCorrect && <Check size={20} color="#10b981" />}
                {result && isWrong && <X size={20} color="#ef4444" />}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {result ? (
        <View className="mt-4">
          <View className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 mb-6">
            <View className="flex-row items-center mb-3">
              <View
                className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${result.score > 0 ? "bg-emerald-100" : "bg-red-100"}`}
              >
                {result.score > 0 ? (
                  <Check size={20} color="#10b981" />
                ) : (
                  <X size={20} color="#ef4444" />
                )}
              </View>
              <Text className="text-[18px] font-extrabold text-[#1E293B]">Result Analysis</Text>
            </View>
            <Text className="text-slate-500 text-[15px] leading-relaxed font-medium mb-4">
              {result.feedback}
            </Text>

            <View className="flex-row items-center justify-between pt-4 border-t border-slate-200">
              <View>
                <Text className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Performance
                </Text>
                <Text className="text-[20px] font-black text-[#1E293B]">
                  {result.score}% Accuracy
                </Text>
              </View>
              {result.score === 100 && (
                <View className="items-end">
                  <Text className="text-[11px] font-bold text-emerald-500 uppercase tracking-widest mb-1">
                    Reward
                  </Text>
                  <Text className="text-[20px] font-black text-emerald-600">+20 Points</Text>
                </View>
              )}
            </View>
          </View>

          <TouchableOpacity
            className="bg-[#1E293B] p-5 rounded-full flex-row items-center justify-center shadow-lg"
            onPress={handleFinish}
          >
            <Text className="text-white font-bold text-lg mr-2">Continue to Dashboard</Text>
            <ArrowRight size={20} color="white" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          disabled={selectedOption === null || isSubmitting}
          onPress={handleSubmit}
          className={`mt-6 p-5 rounded-full items-center justify-center shadow-md ${
            selectedOption === null ? "bg-slate-200" : "bg-[#1E293B]"
          }`}
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">Check Answer</Text>
          )}
        </TouchableOpacity>
      )}

      <View className="h-20" />
    </ScrollView>
  );
};
