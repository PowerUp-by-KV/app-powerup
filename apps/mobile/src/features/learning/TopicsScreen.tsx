import React from "react";
import { View, Text, SafeAreaView, FlatList, TouchableOpacity } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { grammarTopics } from "@/constants/grammarData";
import { ChevronRight, ArrowLeft } from "lucide-react-native";

import { useAppContext } from "@/features/learning/hooks/AppContext";
import { ProgressBar } from "@/features/progress/components";

export const TopicsScreen = () => {
  const { moduleId, moduleTitle } = useLocalSearchParams();
  const { grammarProgress } = useAppContext();

  const topicData = grammarTopics.find((t) => t.id === moduleId);
  const chaptersForTopic = topicData?.chapters || [];

  const renderTopic = ({ item }: { item: any }) => {
    const progress = grammarProgress[moduleId as string]?.chapters[item.id]?.progress ?? 25;
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        className="bg-white rounded-[20px] p-5 mb-[15px] flex-row items-center shadow-sm shadow-black/5 elevation-2"
        onPress={() =>
          router.push({
            pathname: "/lessons",
            params: { chapterId: item.id, chapterTitle: item.title, topicId: moduleId },
          })
        }
      >
        <View className="flex-1 mr-[15px]">
          <View className="flex-row justify-between items-center mb-2.5">
            <Text className="text-lg text-black font-semibold">{item.title}</Text>
            <Text className="text-xs text-[#64748B] font-medium">
              {item.subtopics?.length ?? 0} Lessons
            </Text>
          </View>
          <ProgressBar progress={progress} color="#6366F1" />
        </View>
        <ChevronRight size={20} color="#CBD5E1" />
      </TouchableOpacity>
    );
  };

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
          <Text className="text-2xl text-black font-bold">{moduleTitle} Chapters</Text>
          <Text className="text-sm text-[#64748B]">Master each chapter sequentially</Text>
        </View>
      </View>

      <FlatList
        data={chaptersForTopic}
        renderItem={renderTopic}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};
