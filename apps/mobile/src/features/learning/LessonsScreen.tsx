import React from "react";
import { View, Text, SafeAreaView, FlatList, TouchableOpacity } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { grammarTopics } from "@/constants/grammarData";
import { ArrowLeft, Clock, BarChart2, ChevronRight, CheckCircle } from "lucide-react-native";

export const LessonsScreen = () => {
  const { chapterId, chapterTitle, topicId } = useLocalSearchParams();

  const topicData = grammarTopics.find((t) => t.id === topicId);
  const chapterData = topicData?.chapters.find((ch) => ch.id === chapterId);
  const subtopics = chapterData?.subtopics || [];

  const renderLesson = ({ item }: { item: any }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      className="bg-white rounded-[20px] p-5 mb-[15px] flex-row items-center shadow-sm shadow-black/5 elevation-2"
      onPress={() =>
        router.push({ pathname: "/GrammarContent", params: { subtopic: JSON.stringify(item) } })
      }
    >
      <View className="flex-1 mr-[15px]">
        <View className="flex-row justify-between items-center mb-2.5">
          <Text className="text-lg text-black font-semibold">{item.title}</Text>
          {item.progress === 100 && <CheckCircle size={20} color="#10B981" />}
        </View>

        <View className="flex-row items-center">
          <View className="flex-row items-center mr-[15px]">
            <BarChart2 size={14} color="#6366F1" />
            <Text className="text-xs text-[#64748B] ml-[5px] font-medium">
              {item.difficulty || "General"}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Clock size={14} color="#94A3B8" />
            <Text className="text-xs text-[#64748B] ml-[5px] font-medium">
              {item.time || "10m"}
            </Text>
          </View>
        </View>

        {item.progress > 0 && item.progress < 100 && (
          <View className="flex-row items-center mt-[15px]">
            <View className="flex-1 h-1.5 bg-[#E2E8F0] rounded-full mr-2.5">
              <View
                className="h-full bg-[#6366F1] rounded-full"
                style={{ width: `${item.progress}%` }}
              />
            </View>
            <Text className="text-[10px] text-[#6366F1] font-bold">{item.progress}%</Text>
          </View>
        )}
      </View>
      <ChevronRight size={20} color="#CBD5E1" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FA]">
      <View className="p-5 pt-[60px] bg-white rounded-b-[30px] flex-row items-center mb-2.5">
        <TouchableOpacity
          className="w-10 h-10 rounded-full bg-[#F8F9FA] justify-center items-center mr-[15px]"
          onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)"))}
        >
          <ArrowLeft size={24} color="black" />
        </TouchableOpacity>
        <View>
          <Text className="text-2xl text-black font-bold">{chapterTitle} Lessons</Text>
          <Text className="text-sm text-[#64748B]">Complete these to master the chapter</Text>
        </View>
      </View>

      <FlatList
        data={subtopics}
        renderItem={renderLesson}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};
