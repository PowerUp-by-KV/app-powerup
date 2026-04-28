import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useGetVocabularyActivityQuery } from "@/services/vocabularyactivity-api";
import { useGetDayActivitiesQuery } from "@/services/lesson-api";
import { useLocalSearchParams } from "expo-router";
import { Check, X, ArrowRight, BookOpen, ChevronLeft, ChevronRight } from "lucide-react-native";
import { NativeSyntheticEvent, NativeScrollEvent } from "react-native";
import { useActivityProgress } from "./hooks/useActivityProgress";

const { width: windowWidth } = Dimensions.get("window");

export const VocabularyActivity = ({
  progress,
}: {
  progress: ReturnType<typeof useActivityProgress>;
}) => {
  const params = useLocalSearchParams<{ moduleId: string; dayNo: string; cefr_level: string }>();
  const scrollRef = useRef<ScrollView>(null);
  const [containerWidth, setContainerWidth] = useState(windowWidth);

  const { data: activities } = useGetDayActivitiesQuery({
    moduleId: params.moduleId!,
    dayNo: parseInt(params.dayNo!),
    cefr_level: params.cefr_level!,
  });

  const activityId = activities?.find((a) => a.type === "vocabulary")?.id;
  const { data: activity, isLoading } = useGetVocabularyActivityQuery(activityId!, {
    skip: !activityId,
  });

  const [showResult, setShowResult] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [results, setResults] = useState<
    Record<number, { selected: number; score: number; isCorrect: boolean }>
  >({});

  if (isLoading || !activity) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator color="#475569" />
      </View>
    );
  }

  const questions = activity.questions || [];
  const totalQuestions = questions.length;

  const correctCount = Object.values(results).filter((r) => r.isCorrect).length;
  const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  const handleOptionSelect = (qIdx: number, optionIdx: number) => {
    if (results[qIdx]) return;

    const question = questions[qIdx];
    if (!question) return;
    const isCorrect = question.options?.[optionIdx] === question.answer;

    setResults((prev) => ({
      ...prev,
      [qIdx]: {
        selected: optionIdx,
        score: isCorrect ? 100 : 0,
        isCorrect,
      },
    }));

    setTimeout(() => {
      if (qIdx < totalQuestions - 1) {
        scrollRef.current?.scrollTo({ x: (qIdx + 1) * containerWidth, animated: true });
      } else {
        setShowResult(true);
        scrollRef.current?.scrollTo({ x: totalQuestions * containerWidth, animated: true });
      }
    }, 1500);
  };

  const handleFinish = () => {
    progress.recordScore("vocabulary", accuracy);
    progress.nextActivity();
  };

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const slide = Math.round(offsetX / containerWidth);
    if (slide !== currentIdx && slide >= 0 && slide <= totalQuestions) {
      setCurrentIdx(slide);
    }
  };

  return (
    <View
      className="flex-1 bg-white"
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      {/* Header */}
      {!showResult && (
        <View className="px-6 pb-4">
          <Text className="text-[12px] font-bold text-[#475569] uppercase tracking-widest mb-1">
            Vocabulary Activity
          </Text>
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-[20px] font-bold text-[#1E293B] flex-1">
              {activity.scenario_name}
            </Text>
            <View className="bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              <Text className="text-slate-600 font-bold text-[13px]">
                Q {Math.min(currentIdx + 1, totalQuestions)}/{totalQuestions}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Swipeable Questions using ScrollView */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        scrollEventThrottle={16}
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        className="flex-1"
        contentContainerStyle={{ width: containerWidth * (totalQuestions + (showResult ? 1 : 0)) }}
      >
        {questions.map((question: any, qIdx: number) => {
          const result = results[qIdx];

          return (
            <View key={qIdx} style={{ width: containerWidth }} className="flex-1 px-6">
              <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <View className="border-t border-slate-100 pt-6">
                  <View className="p-8 bg-slate-50 border border-slate-100 rounded-[32px] mb-8 items-center">
                    <View className="w-12 h-12 bg-blue-100 rounded-2xl items-center justify-center mb-4">
                      <BookOpen size={24} color="#2563eb" />
                    </View>
                    <Text className="text-slate-500 text-[13px] font-bold uppercase mb-2 tracking-widest">
                      Define the Term
                    </Text>
                    <Text className="text-[28px] font-black text-[#1E293B] text-center">
                      {question.question
                        .replace("What does '", "")
                        .replace("' mean?", "")
                        .replace("What is '", "")
                        .replace("'?", "")
                        .replace("What is an '", "")
                        .replace("'?", "")}
                    </Text>
                  </View>

                  {question.options?.map((option: any, oIdx: number) => {
                    const isSelected = result?.selected === oIdx;
                    const isCorrect = result ? option === question.answer : false;
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
                        key={oIdx}
                        disabled={!!result}
                        onPress={() => handleOptionSelect(qIdx, oIdx)}
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

                  {result && (
                    <View className="mt-4 p-5 bg-slate-50 rounded-[24px] border border-slate-100 mb-6">
                      <Text className="text-[#1E293B] font-bold mb-1">Feedback</Text>
                      <Text className="text-slate-500 text-[14px] leading-relaxed">
                        {result.isCorrect
                          ? "Excellent! You've correctly identified the precise definition for this term."
                          : `Not quite. The correct definition was "${question.answer}".`}
                      </Text>
                    </View>
                  )}

                  <View className="h-20" />
                </View>
              </ScrollView>
            </View>
          );
        })}

        {/* Result Card Slide */}
        {showResult && (
          <View style={{ width: containerWidth }} className="flex-1 px-8 justify-center">
            <View className="bg-white rounded-[40px] border border-slate-100 p-8 shadow-2xl items-center">
              <View className="w-20 h-20 bg-slate-50 rounded-full items-center justify-center mb-6">
                <Check size={40} color="#1E293B" />
              </View>

              <Text className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                Activity Result
              </Text>
              <Text className="text-[32px] font-black text-[#1E293B] mb-2">
                {accuracy}% Accuracy
              </Text>
              <Text className="text-slate-500 font-medium mb-8 text-center px-4">
                You correctly answered {correctCount} out of {totalQuestions} vocabulary terms.
              </Text>

              <View className="w-full space-y-4 mb-10">
                <View className="flex-row justify-between items-center p-5 bg-slate-50 rounded-3xl">
                  <Text className="text-slate-600 font-bold">Points Earned</Text>
                  <Text className="text-[#1E293B] font-black">
                    +{accuracy >= 60 ? "20" : "0"} XP
                  </Text>
                </View>
                <View className="flex-row justify-between items-center p-5 bg-slate-50 rounded-3xl">
                  <Text className="text-slate-600 font-bold">Status</Text>
                  <Text
                    className={`${accuracy >= 60 ? "text-emerald-600" : "text-red-600"} font-black`}
                  >
                    {accuracy >= 60 ? "Mastered" : "Needs Review"}
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
        )}
      </ScrollView>

      {/* Swipe Indicator Footer */}
      {!showResult && (
        <View className="px-8 py-6 flex-row justify-between items-center border-t border-slate-50">
          <TouchableOpacity
            onPress={() =>
              scrollRef.current?.scrollTo({ x: (currentIdx - 1) * containerWidth, animated: true })
            }
            disabled={currentIdx === 0}
            className={`w-10 h-10 rounded-full items-center justify-center ${currentIdx === 0 ? "opacity-20" : "bg-slate-100"}`}
          >
            <ChevronLeft size={20} color="#1E293B" />
          </TouchableOpacity>

          <View className="flex-row">
            {questions.map((_: any, i: number) => (
              <View
                key={i}
                className={`h-1.5 rounded-full mx-1 ${i === currentIdx ? "w-6 bg-[#1E293B]" : "w-1.5 bg-slate-200"}`}
              />
            ))}
          </View>

          <TouchableOpacity
            onPress={() =>
              scrollRef.current?.scrollTo({ x: (currentIdx + 1) * containerWidth, animated: true })
            }
            disabled={currentIdx === totalQuestions - 1}
            className={`w-10 h-10 rounded-full items-center justify-center ${currentIdx === totalQuestions - 1 ? "opacity-20" : "bg-slate-100"}`}
          >
            <ChevronRight size={20} color="#1E293B" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};
