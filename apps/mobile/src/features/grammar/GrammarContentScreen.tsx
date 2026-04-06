import React, { useState, useRef, useMemo } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  useWindowDimensions,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Play, BookOpen, ChevronRight } from "lucide-react-native";
import { grammarTopics } from "@/constants/grammarData";
import { useTimeTracker } from "@/hooks/useTimeTracker";

export const GrammarContentScreen = () => {
  useTimeTracker("grammar");
  const { width } = useWindowDimensions();
  const { subtopic: subtopicRaw } = useLocalSearchParams();
  const initialSubtopic = typeof subtopicRaw === "string" ? JSON.parse(subtopicRaw) : subtopicRaw;

  const { chapterSubtopics, initialIndex, topicTitle, chapterTitle } = useMemo(() => {
    let subtopics: any[] = [];
    let index = 0;
    let tTitle = "";
    let cTitle = "";

    grammarTopics.forEach((topic) => {
      topic.chapters.forEach((chapter) => {
        const foundIndex = chapter.subtopics.findIndex((st) => st.id === initialSubtopic?.id);
        if (foundIndex !== -1) {
          subtopics = chapter.subtopics;
          index = foundIndex;
          tTitle = topic.title;
          cTitle = chapter.title;
        }
      });
    });

    return {
      chapterSubtopics: subtopics,
      initialIndex: index,
      topicTitle: tTitle,
      chapterTitle: cTitle,
    };
  }, [initialSubtopic?.id]);

  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const flatListRef = useRef<FlatList>(null);

  if (chapterSubtopics.length === 0) return null;

  const currentSubtopic = chapterSubtopics[activeIndex];

  const handleNextLesson = () => {
    if (activeIndex < chapterSubtopics.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
      setActiveIndex(activeIndex + 1);
    } else {
      moveToNextChapter();
    }
  };

  const moveToNextChapter = () => {
    let topicIdx = -1,
      chapIdx = -1;
    grammarTopics.forEach((t, ti) => {
      t.chapters.forEach((c, ci) => {
        if (c.subtopics.some((st) => st.id === currentSubtopic.id)) {
          topicIdx = ti;
          chapIdx = ci;
        }
      });
    });

    if (topicIdx === -1) return;

    const currentTopic = grammarTopics[topicIdx];

    if (currentTopic && chapIdx < currentTopic.chapters.length - 1) {
      const nextChapter = currentTopic.chapters[chapIdx + 1];
      if (nextChapter && nextChapter.subtopics?.length > 0) {
        router.replace({
          pathname: "/GrammarContent",
          params: { subtopic: JSON.stringify(nextChapter.subtopics[0]) },
        });
        return;
      }
    }

    if (topicIdx < grammarTopics.length - 1) {
      const nextTopic = grammarTopics[topicIdx + 1];
      const nextLesson = nextTopic?.chapters?.[0]?.subtopics?.[0];
      if (nextLesson) {
        router.replace({
          pathname: "/GrammarContent",
          params: { subtopic: JSON.stringify(nextLesson) },
        });
        return;
      }
    }

    router.replace("/(tabs)");
  };

  const renderSubtopic = ({ item }: { item: any }) => (
    <View style={{ width }} className="flex-1 overflow-hidden">
      <FlatList
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20 }}
        ListHeaderComponent={() => (
          <>
            <View className="mb-[30px]">
              <View className="flex-row items-center mb-2.5">
                <BookOpen size={20} color="#6366F1" />
                <Text className="text-lg text-black font-bold ml-2.5">Definition</Text>
              </View>
              <Text className="text-base text-[#475569] leading-6">{item.definition}</Text>
            </View>

            <View className="mb-[30px] bg-[#F8F9FA] p-5 rounded-[20px]">
              <Text className="text-base text-[#475569] font-semibold mb-3">Grammar Rule</Text>
              <View className="bg-white p-[15px] rounded-xl border-l-4 border-[#6366F1]">
                <Text className="text-base text-[#6366F1] font-bold">{item.rule}</Text>
              </View>
            </View>

            <View className="mb-[30px]">
              <Text className="text-base text-[#475569] font-semibold mb-3">Examples</Text>
              {item.examples.map((example: string, index: number) => (
                <View key={index} className="flex-row items-center mb-2.5 pl-1.25">
                  <View className="w-1.5 h-1.5 rounded-full bg-[#6366F1] mr-3" />
                  <Text className="text-[15px] text-[#475569] font-medium">{example}</Text>
                </View>
              ))}
            </View>
          </>
        )}
        data={[]}
        renderItem={null}
        ListFooterComponent={() => <View className="h-25" />}
      />
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="p-5 pt-[60px] flex-row items-center border-b border-[#F1F5F9]">
        <TouchableOpacity onPress={() => router.back()} className="mr-[15px]">
          <ArrowLeft size={24} color="black" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-xs text-[#6366F1] font-bold uppercase tracking-widest mb-0.5">
            {topicTitle} • {chapterTitle}
          </Text>
          <Text className="text-xl text-black font-bold">{currentSubtopic?.title}</Text>
          <Text className="text-sm text-[#94A3B8] font-medium">
            Lesson {activeIndex + 1} of {chapterSubtopics.length}
          </Text>
        </View>
        <View className="flex-row items-center">
          {chapterSubtopics.map((_, i) => (
            <View
              key={i}
              className={`h-1.5 rounded-full ml-1 ${i === activeIndex ? "w-5 bg-[#6366F1]" : "w-1.5 bg-[#F1F5F9]"}`}
            />
          ))}
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={chapterSubtopics}
        renderItem={renderSubtopic}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          if (index !== activeIndex && index >= 0 && index < chapterSubtopics.length) {
            setActiveIndex(index);
          }
        }}
        scrollEventThrottle={16}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        initialScrollIndex={initialIndex}
      />

      <View className="p-5 pb-10 border-t border-[#F1F5F9]">
        <View className="flex-row justify-between items-center">
          <TouchableOpacity
            className="flex-[1.2] bg-[#6366F1] flex-row justify-center items-center py-[18px] rounded-[20px] mr-2.5"
            onPress={() =>
              router.push({
                pathname: "/exercise",
                params: { lessonId: currentSubtopic?.id, lessonTitle: currentSubtopic?.title },
              })
            }
          >
            <Text className="text-white text-base font-bold mr-2.5">Practice This</Text>
            <Play size={20} color="white" fill="white" />
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 bg-white flex-row justify-center items-center py-[18px] rounded-[20px] border border-[#6366F1]"
            onPress={handleNextLesson}
          >
            <Text className="text-[#6366F1] text-base font-bold mr-1.25">
              {activeIndex < chapterSubtopics.length - 1 ? "Next Lesson" : "Next Chapter"}
            </Text>
            <ChevronRight size={20} color="#6366F1" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};
