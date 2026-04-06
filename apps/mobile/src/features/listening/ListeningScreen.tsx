import React from "react";
import { View, Text, SafeAreaView, FlatList, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { listeningData } from "@/constants/listeningData";
import { Headphones, ArrowLeft, PlayCircle } from "lucide-react-native";
import { useTimeTracker } from "@/hooks/useTimeTracker";

export const ListeningScreen = () => {
  useTimeTracker("listening");

  const renderItem = ({ item }: { item: any }) => {
    return (
      <TouchableOpacity
        className="bg-white rounded-[20px] p-5 flex-row items-center mb-[15px] shadow-sm shadow-black/5 elevation-2"
        activeOpacity={0.8}
        onPress={() =>
          router.push({ pathname: "/ListeningPractice", params: { lessonId: item.id } })
        }
      >
        <View className="w-[50px] h-[50px] rounded-[15px] bg-[#6366F1]/10 justify-center items-center mr-[15px]">
          <Headphones size={24} color="#6366F1" />
        </View>
        <View className="flex-1">
          <Text className="text-[18px] text-black font-bold">{item.title}</Text>
          <Text className="text-[13px] text-[#64748B] font-medium mt-0.5">
            {item.questions.length} Questions
          </Text>
        </View>
        <PlayCircle size={28} color="#6366F1" />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FA]">
      <View className="p-5 pt-[60px] flex-row items-center bg-white rounded-b-[30px] shadow-sm shadow-black/10 elevation-4">
        <TouchableOpacity
          className="w-[45px] h-[45px] rounded-full bg-[#F8F9FA] justify-center items-center mr-[15px]"
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <View>
          <Text className="text-[24px] text-black font-bold">Listening Exercises</Text>
          <Text className="text-[14px] text-[#64748B] font-normal">
            Improve your English listening skills
          </Text>
        </View>
      </View>

      <FlatList
        data={listeningData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingTop: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};
