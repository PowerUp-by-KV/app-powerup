import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { useGetDayActivitiesQuery } from "@/services/lesson-api";
import {
  useGetReadingActivityQuery,
  useSubmitReadingActivityMutation,
} from "@/services/readingactivity-api";
import { useLocalSearchParams } from "expo-router";
import { Check, X, ArrowRight, BookOpen } from "lucide-react-native";

export const ReadingActivity = ({ progress }: { progress: any }) => {
  const params = useLocalSearchParams<{ moduleId: string; dayNo: string; cefr_level: string }>();

  const { data: activities } = useGetDayActivitiesQuery({
    moduleId: params.moduleId!,
    dayNo: parseInt(params.dayNo!),
    cefr_level: params.cefr_level!,
  });

  const activityId = activities?.find((a) => a.type === "reading")?.id;

  const { data: activity, isLoading } = useGetReadingActivityQuery(activityId!, {
    skip: !activityId,
  });
  const [submit, { isLoading: isSubmitting }] = useSubmitReadingActivityMutation();

  const currentIdx = 0; // Fixed to 1 question
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
    if (selectedOption === null) return;
    const isCorrect = currentQuestion.options[selectedOption] === currentQuestion.answer;

    setResult({
      score: isCorrect ? 100 : 0,
      feedback: isCorrect
        ? "Excellent reading comprehension! You've successfully identified the main details from the text."
        : `Not exactly. The correct answer was "${currentQuestion.answer}". Review the passage to see how this detail was presented.`,
      correct_answer: currentQuestion.answer,
    });
  };

  const handleFinish = () => {
    progress.recordScore("reading", result?.score || 0);
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
        Reading Activity
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

      <View className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 mb-10">
        <Text className="text-slate-800 text-[16px] leading-relaxed font-medium italic">
          "{activity.paragraph}"
        </Text>
      </View>

      <View className="mb-10">
        <Text className="text-[14px] font-bold text-slate-400 uppercase tracking-widest mb-4">
          Vocabulary Focus
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {activity.vocabulary?.map((v: any, i: number) => (
            <View
              key={i}
              className="bg-white border border-slate-100 px-4 py-2 rounded-2xl shadow-sm"
            >
              <Text className="text-slate-700 font-bold text-[14px]">{v.word}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className="border-t border-slate-100 pt-8">
        <Text className="text-[20px] font-bold text-[#1E293B] mb-6 leading-tight">
          {currentQuestion.question}
        </Text>

        {currentQuestion.options?.map((option: any, index: number) => {
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
              className={`p-5 mb-4 rounded-3xl border ${borderClass} ${bgClass} shadow-sm`}
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
          <View className="bg-white rounded-[40px] border border-slate-100 p-8 shadow-2xl items-center mb-8">
            <View className="w-20 h-20 bg-slate-50 rounded-full items-center justify-center mb-6">
              <Check size={40} color="#1E293B" />
            </View>

            <Text className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-2">
              Activity Result
            </Text>
            <Text className="text-[32px] font-black text-[#1E293B] mb-2">
              {result.score}% Accuracy
            </Text>
            <Text className="text-slate-500 font-medium mb-8 text-center px-4">
              {result.feedback}
            </Text>

            <View className="w-full space-y-4 mb-8">
              <View className="flex-row justify-between items-center p-5 bg-slate-50 rounded-3xl">
                <Text className="text-slate-600 font-bold">Points Earned</Text>
                <Text className="text-[#1E293B] font-black">
                  +{result.score >= 60 ? "20" : "0"} XP
                </Text>
              </View>
              <View className="flex-row justify-between items-center p-5 bg-slate-50 rounded-3xl">
                <Text className="text-slate-600 font-bold">Status</Text>
                <Text
                  className={`${result.score >= 60 ? "text-emerald-600" : "text-red-600"} font-black`}
                >
                  {result.score >= 60 ? "Mastered" : "Needs Review"}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              className="w-full bg-[#1E293B] p-6 rounded-full flex-row items-center justify-center shadow-lg"
              onPress={handleFinish}
            >
              <Text className="text-white font-bold text-lg mr-2">Continue</Text>
              <ArrowRight size={22} color="white" />
            </TouchableOpacity>
          </View>
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
