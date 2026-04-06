import React, { useState, useRef } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  ScrollView,
  Dimensions,
  FlatList,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { listeningData } from "@/constants/listeningData";
import { ArrowLeft } from "lucide-react-native";
import { useTimeTracker } from "@/hooks/useTimeTracker";
import ListeningPage from "./ListeningPage";

const { width } = Dimensions.get("window");

// ListeningPage extracted to its own file: ./ListeningPage

export const ListeningPracticeScreen = () => {
  useTimeTracker("listening");
  const { lessonId = "l1" } = useLocalSearchParams();
  const initialIndex = listeningData.findIndex((l) => l.id === lessonId);
  const [activeIndex, setActiveIndex] = useState(initialIndex !== -1 ? initialIndex : 0);
  const flatListRef = useRef<FlatList>(null);

  const currentLesson = listeningData[activeIndex];

  return (
    <View style={{ flex: 1, height: "100%" }} className="flex-1 bg-[#F8F9FA]">
      <View className="px-6 py-4 flex-row items-center bg-white border-b border-slate-100 shadow-sm shadow-black/5">
        <TouchableOpacity
          className="w-10 h-10 rounded-xl bg-slate-50 justify-center items-center mr-4 border border-slate-100"
          onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)"))}
        >
          <ArrowLeft size={20} color="#1E293B" />
        </TouchableOpacity>

        <View className="flex-1">
          <Text className="text-[10px] text-pink-500 font-bold uppercase tracking-[2px] mb-0.5">
            LISTENING PRACTICE
          </Text>
          <Text className="text-lg text-slate-900 font-bold" numberOfLines={1}>
            {currentLesson?.title || "Listening Lesson"}
          </Text>
        </View>

        <View className="flex-row items-center gap-x-1.5 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
          {listeningData.map((_, i) => (
            <View
              key={i}
              className={`h-1.5 rounded-full ${i === activeIndex ? "w-4 bg-pink-500" : "w-1.5 bg-slate-200"}`}
            />
          ))}
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={listeningData}
        renderItem={({ item, index }) => (
          <ListeningPage
            item={item}
            isActive={index === activeIndex}
            activeIndex={activeIndex}
            setActiveIndex={setActiveIndex}
            flatListRef={flatListRef}
          />
        )}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          if (index !== activeIndex) {
            setActiveIndex(index);
          }
        }}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        initialScrollIndex={initialIndex !== -1 ? initialIndex : 0}
      />
    </View>
  );
};
