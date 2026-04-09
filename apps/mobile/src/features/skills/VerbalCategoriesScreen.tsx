import React from "react";
import { View, Text, SafeAreaView, FlatList, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { speakingCategories } from "@/constants/verbalData";
import { LinearGradient } from "expo-linear-gradient";
import {
  MessageCircle,
  Image,
  Mic,
  BookOpen,
  Briefcase,
  ArrowLeft,
  ChevronRight,
} from "lucide-react-native";

import { useTimeTracker } from "@/hooks/useTimeTracker";

export const VerbalCategoriesScreen = () => {
  useTimeTracker("verbal");

  const getIcon = (iconName: string) => {
    const props = { size: 32, color: "white" };
    switch (iconName) {
      case "message-circle":
        return <MessageCircle {...props} />;
      case "image":
        return <Image {...props} />;
      case "mic":
        return <Mic {...props} />;
      case "book-open":
        return <BookOpen {...props} />;
      case "briefcase":
        return <Briefcase {...props} />;
      default:
        return <Mic {...props} />;
    }
  };

  const renderCategory = ({ item }: { item: any }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      className="mb-5 h-[180px] rounded-[25px] overflow-hidden shadow-lg shadow-black/15 elevation-8"
      onPress={() =>
        router.push({ pathname: "/SpeakingPractice", params: { categoryId: item.id } })
      }
    >
      <LinearGradient colors={item.gradient} className="flex-1 p-5 justify-between">
        <View className="flex-row justify-between items-start">
          <View className="w-[60px] h-[60px] rounded-[20px] bg-white/20 justify-center items-center">
            {getIcon(item.icon)}
          </View>
          <ChevronRight size={20} color="white" />
        </View>
        <View className="mt-2.5">
          <Text className="text-[22px] text-white font-bold">{item.title}</Text>
          <Text className="text-sm text-white opacity-90 mt-1.25 font-medium">
            {item.description}
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, height: "100%" }} className="flex-1 bg-[#F8F9FA]">
      <View className="px-6 py-12 bg-white rounded-b-3xl shadow-sm shadow-black/5 elevation-4">
        <TouchableOpacity
          className="w-10 h-10 rounded-xl bg-slate-50 justify-center items-center mb-4 border border-slate-100"
          onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)"))}
        >
          <ArrowLeft size={20} color="#1E293B" />
        </TouchableOpacity>
        <Text className="text-[28px] text-slate-900 font-bold">Verbal Mastery</Text>
        <Text className="text-base text-slate-500 font-medium mt-1">
          Choose a category to practice speaking
        </Text>
      </View>

      <FlatList
        data={speakingCategories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 24, paddingBottom: 20, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        className="flex-1"
      />
    </View>
  );
};

// export default VerbalCategoriesScreen;
