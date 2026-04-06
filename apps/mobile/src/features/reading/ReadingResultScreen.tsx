import React from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  Trophy,
  Clock,
  Target,
  ChevronRight,
  Share2,
  RefreshCw,
} from "lucide-react-native";
import { readingData } from "@/constants/readingData";

export const ReadingResultScreen = () => {
  const { readingId, title, score, totalQuestions, time } = useLocalSearchParams();
  const { width } = useWindowDimensions();

  const currentIndex = readingData.findIndex((r) => r.id === readingId);
  const nextReading =
    currentIndex !== -1 && currentIndex < readingData.length - 1
      ? readingData[currentIndex + 1]
      : null;

  const handleNext = () => {
    if (nextReading) {
      router.replace({ pathname: "/ReadingPractice", params: { readingId: nextReading.id } });
    } else {
      router.replace("/(tabs)");
    }
  };

  const percentage = Math.round((Number(score || 0) / Number(totalQuestions || 1)) * 100);

  const getFeedback = () => {
    if (percentage === 100)
      return {
        title: "Reading Master!",
        text: "Exceptional work! You understood every detail of the passage. Your comprehension and vocabulary are excellent.",
        suggestion: "Try a harder lesson to continue challenging yourself.",
      };
    if (percentage >= 80)
      return {
        title: "Great Job!",
        text: "You have a solid understanding of the main ideas and most details. Just a few minor slips!",
        suggestion: "Focus on inference-based questions to reach perfection.",
      };
    if (percentage >= 60)
      return {
        title: "Good Effort",
        text: "You understood the basic meaning but missed some key details or inferred meanings.",
        suggestion:
          "Try reading the passage more slowly and using the vocabulary popups for difficult words.",
      };
    return {
      title: "Keep Practicing",
      text: "This was a challenging passage. Don't worry, reading skills take time to develop.",
      suggestion: "Focus on building your vocabulary and identifying direct facts first.",
    };
  };

  const feedback = getFeedback();

  const formatTime = (seconds: any) => {
    const s = Number(seconds || 0);
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FA]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingTop: 100 }}
      >
        <TouchableOpacity
          className="w-10 h-10 rounded-full bg-white justify-center items-center absolute top-[60px] left-5 z-10 shadow-sm shadow-black/10 elevation-4"
          onPress={() =>
            router.replace({ pathname: "/ReadingPractice", params: { readingId: readingId } })
          }
        >
          <ArrowLeft size={24} color="black" />
        </TouchableOpacity>

        <View className="items-center mb-10">
          <View className="w-[120px] h-[120px] rounded-full bg-[#6366F1] justify-center items-center mb-[25px] shadow-lg shadow-[#6366F1]/30 elevation-8">
            <Trophy size={60} color="white" />
          </View>
          <Text className="text-[32px] text-black font-bold mb-1.25 text-center">
            {feedback.title}
          </Text>
          <Text className="text-base text-[#64748B] font-medium text-center">
            {title} Complete!
          </Text>
        </View>

        <View className="flex-row justify-between mb-[30px]">
          <View
            style={{ width: (width - 40 - 30) / 3 }}
            className="bg-white p-[15px] rounded-[20px] items-center shadow-sm shadow-black/5 elevation-2"
          >
            <View className="w-10 h-10 rounded-full justify-center items-center mb-2.5 bg-[#6366F1]/20">
              <Target size={20} color="#6366F1" />
            </View>
            <Text className="text-[18px] text-black font-bold">
              {score}/{totalQuestions}
            </Text>
            <Text className="text-[12px] text-[#64748B] font-medium mt-0.5">Score</Text>
          </View>

          <View
            style={{ width: (width - 40 - 30) / 3 }}
            className="bg-white p-[15px] rounded-[20px] items-center shadow-sm shadow-black/5 elevation-2"
          >
            <View className="w-10 h-10 rounded-full justify-center items-center mb-2.5 bg-[#EC4899]/20">
              <Clock size={20} color="#EC4899" />
            </View>
            <Text className="text-[18px] text-black font-bold">{formatTime(time)}</Text>
            <Text className="text-[12px] text-[#64748B] font-medium mt-0.5">Time</Text>
          </View>

          <View
            style={{ width: (width - 40 - 30) / 3 }}
            className="bg-white p-[15px] rounded-[20px] items-center shadow-sm shadow-black/5 elevation-2"
          >
            <View className="w-10 h-10 rounded-full justify-center items-center mb-2.5 bg-[#22C55E]/20">
              <Target size={20} color="#22C55E" />
            </View>
            <Text className="text-[18px] text-black font-bold">{percentage}%</Text>
            <Text className="text-[12px] text-[#64748B] font-medium mt-0.5">Accuracy</Text>
          </View>
        </View>

        <View className="bg-white p-[25px] rounded-[25px] mb-10 shadow-sm shadow-black/5 elevation-2">
          <Text className="text-[12px] text-[#6366F1] font-bold tracking-[1.5px] mb-[15px] uppercase">
            PERFORMANCE ANALYSIS
          </Text>
          <Text className="text-base text-[#475569] leading-6 font-medium mb-5">
            {feedback.text}
          </Text>
          <View className="bg-[#F8F9FA] p-[15px] rounded-[15px] border-l-4 border-l-[#6366F1]">
            <View className="flex-row items-center mb-1.25">
              <RefreshCw size={16} color="#6366F1" />
              <Text className="text-sm text-[#6366F1] font-bold ml-2">Suggestion</Text>
            </View>
            <Text className="text-sm text-[#475569] font-normal leading-5">
              {feedback.suggestion}
            </Text>
          </View>
        </View>

        <View className="w-full">
          <TouchableOpacity
            className="bg-[#6366F1] flex-row justify-center items-center py-[18px] rounded-[30px] mb-[15px]"
            onPress={handleNext}
          >
            <Text className="text-white text-lg font-bold mr-2.5">
              {nextReading ? `Next: ${nextReading.title}` : "Return to Dashboard"}
            </Text>
            <ChevronRight size={20} color="white" />
          </TouchableOpacity>

          <View className="flex-row justify-between">
            <TouchableOpacity
              className="flex-row items-center justify-center bg-white border border-[#6366F1] py-3 rounded-[15px] w-[48%]"
              onPress={() =>
                router.replace({ pathname: "/ReadingPractice", params: { readingId: readingId } })
              }
            >
              <RefreshCw size={18} color="#6366F1" />
              <Text className="text-[#6366F1] text-sm font-bold ml-2">Try Again</Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center justify-center bg-white border border-[#6366F1] py-3 rounded-[15px] w-[48%]">
              <Share2 size={18} color="#6366F1" />
              <Text className="text-[#6366F1] text-sm font-bold ml-2">Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// export default ReadingResultScreen;
