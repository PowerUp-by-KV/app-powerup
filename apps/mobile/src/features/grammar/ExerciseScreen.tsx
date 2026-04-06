import React, { useState, useRef } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { grammarTopics } from "@/constants/grammarData";
import { findNextSubtopic } from "./hooks/useGrammarNavigation";
import { EXERCISES as MOCK_EXERCISES } from "@/constants/mockData";
import { ArrowLeft, Check, ChevronRight, ChevronLeft, Zap } from "lucide-react-native";

import { useAppContext } from "@/features/learning/hooks/AppContext";
import { Card, MCQOption } from "@/features/learning/components";
import { ProgressBar } from "@/features/progress/components";

import { useTimeTracker } from "@/hooks/useTimeTracker";

export const ExerciseScreen = () => {
  useTimeTracker("grammar");
  const { width: windowWidth } = useWindowDimensions();
  const CONTAINER_WIDTH = windowWidth;
  const { lessonId } = useLocalSearchParams();
  const { updateLessonCompletion } = useAppContext();

  let lessonExercises: any[] = [];

  const safeTopics = grammarTopics || [];
  safeTopics.forEach((topic) => {
    if (topic && topic.chapters) {
      topic.chapters.forEach((chapter) => {
        if (chapter && chapter.subtopics) {
          const subtopic = chapter.subtopics.find((st) => st.id === lessonId);
          if (subtopic) {
            lessonExercises = subtopic.exercises || [];
          }
        }
      });
    }
  });

  if (lessonExercises.length === 0) {
    const fallbackList =
      MOCK_EXERCISES && MOCK_EXERCISES.length > 0 ? (MOCK_EXERCISES[0]?.questions ?? []) : [];
    const foundExercises = MOCK_EXERCISES?.find((e: any) => e.lessonId === lessonId);
    lessonExercises = foundExercises?.questions ?? fallbackList;
  }

  const totalQuestions = lessonExercises.length;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);

  const [answers, setAnswers] = useState<
    {
      selectedOption: number | null;
      hasChecked: boolean;
      isCorrect: boolean | null;
    }[]
  >(() =>
    (lessonExercises || []).map(() => ({
      selectedOption: null,
      hasChecked: false,
      isCorrect: null,
    })),
  );
  const [prevLessonId, setPrevLessonId] = useState(lessonId);

  if (lessonId !== prevLessonId || (answers && answers.length !== lessonExercises.length)) {
    setPrevLessonId(lessonId);
    setAnswers(
      (lessonExercises || []).map(() => ({
        selectedOption: null,
        hasChecked: false,
        isCorrect: null,
      })),
    );
    if (lessonId !== prevLessonId) {
      setCurrentIndex(0);
      setIsFinished(false);
      setScore(0);
    }
  }

  const flatListRef = useRef<FlatList>(null);
  const progressValue = totalQuestions > 0 ? ((currentIndex + 1) / totalQuestions) * 100 : 0;

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
      setCurrentIndex(currentIndex + 1);
    } else {
      finishLesson();
    }
  };

  const finishLesson = () => {
    let topicId = null;
    let chapterId = null;
    grammarTopics.forEach((t) => {
      t.chapters.forEach((c) => {
        if (c.subtopics.some((st) => st.id === lessonId)) {
          topicId = t.id;
          chapterId = c.id;
        }
      });
    });

    if (topicId && chapterId) {
      updateLessonCompletion(topicId, chapterId, lessonId as string);
    }
    setIsFinished(true);
  };

  const handleContinue = () => {
    // Build a flat ordered list of all subtopics with their parent ids and indexes
    const flat: Array<{
      topicId: string;
      chapterId: string;
      subtopic: any;
    }> = [];

    (grammarTopics || []).forEach((t) => {
      (t.chapters || []).forEach((c) => {
        (c.subtopics || []).forEach((st) => {
          if (st && st.id) {
            flat.push({ topicId: t.id, chapterId: c.id, subtopic: st });
          }
        });
      });
    });

    const currentIndex = flat.findIndex((f) => f.subtopic.id === lessonId);
    if (currentIndex === -1) {
      // Not found - go back if possible or return to home
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace("/(tabs)");
      }
      return;
    }

    // Prefer a direct helper which can be reused elsewhere
    const next = findNextSubtopic(grammarTopics, lessonId as string);
    if (next) {
      router.replace({ pathname: "/GrammarContent", params: { subtopic: JSON.stringify(next) } });
      return;
    }

    // No next lesson - return to main tabs
    router.replace("/(tabs)");
  };

  const renderQuestion = ({ item, index }: { item: any; index: number }) => {
    const currentAnswer = answers && answers[index];

    if (!currentAnswer || !item)
      return <View style={{ width: CONTAINER_WIDTH }} className="flex-1" />;

    return (
      <View
        style={{ width: CONTAINER_WIDTH }}
        className={`flex-1 ${windowWidth > 1200 ? "px-[100px]" : windowWidth > 800 ? "px-[50px]" : "px-5"}`}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 20, justifyContent: "center", flexGrow: 1 }}
        >
          <Card className="min-h-[500px] w-full p-10 rounded-[20px]">
            <Text className="text-xs text-[#6366F1] mb-2.5 font-bold">
              {(item.type || "question").replace(/[-_]/g, " ").toUpperCase()}
            </Text>
            <Text className="text-[22px] text-black mb-[30px] font-bold leading-[30px]">
              {item.question}
            </Text>

            <View className="w-full">
              {item.options.map((option: string, optIdx: number) => {
                const isSelected = currentAnswer.selectedOption === optIdx;
                const isCorrectOption =
                  currentAnswer.hasChecked &&
                  (typeof item.answer === "string"
                    ? option === item.answer
                    : optIdx === item.correctAnswer);
                const isWrongSelection = currentAnswer.hasChecked && isSelected && !isCorrectOption;

                return (
                  <MCQOption
                    key={optIdx}
                    label={String.fromCharCode(65 + optIdx)}
                    text={option}
                    isSelected={isSelected}
                    isCorrect={isCorrectOption}
                    isWrong={isWrongSelection}
                    disabled={currentAnswer.hasChecked}
                    onPress={() => {
                      if (!currentAnswer.hasChecked) {
                        const newAnswers = [...answers];
                        const targetAnswer = newAnswers[index];
                        if (targetAnswer) {
                          targetAnswer.selectedOption = optIdx;

                          const correctValue =
                            typeof item.answer === "string"
                              ? item.answer
                              : item.options?.[item.correctAnswer];
                          const selectedValue = item.options[optIdx];
                          const isCorrect = selectedValue === correctValue;

                          targetAnswer.hasChecked = true;
                          targetAnswer.isCorrect = isCorrect;
                          setAnswers(newAnswers);

                          if (isCorrect) setScore((prev) => prev + 1);

                          setTimeout(() => {
                            if (index < totalQuestions - 1) {
                              handleNext();
                            }
                          }, 1200);
                        }
                      }
                    }}
                  />
                );
              })}
            </View>

            {currentAnswer.hasChecked && (
              <View className="mt-5 p-[15px] rounded-[15px] bg-[#F8F9FA] border-l-4 border-[#6366F1]">
                <View
                  className={`self-start px-2.5 py-1 rounded-lg mb-2 ${
                    currentAnswer.isCorrect ? "bg-[#22C55E]/20" : "bg-[#EF4444]/20"
                  }`}
                >
                  <Text
                    className={`text-xs font-bold ${
                      currentAnswer.isCorrect ? "text-[#22C55E]" : "text-[#EF4444]"
                    }`}
                  >
                    {currentAnswer.isCorrect ? "Correct!" : "Incorrect"}
                  </Text>
                </View>
                <Text className="text-sm text-[#475569] font-normal leading-5">
                  {item.explanation}
                </Text>
              </View>
            )}
          </Card>
        </ScrollView>
      </View>
    );
  };

  if (isFinished) {
    return (
      <SafeAreaView className="flex-1 bg-[#F8F9FA]">
        <View className="flex-1 justify-center items-center p-[30px] bg-white">
          <View className="w-[100px] h-[100px] rounded-full bg-[#22C55E] justify-center items-center mb-[30px]">
            <Check size={50} color="#FFF" />
          </View>
          <Text className="text-[32px] text-black font-bold mb-2.5">Lesson Complete!</Text>
          <Text className="text-lg text-[#64748B] font-medium mb-10">
            You scored {score} out of {totalQuestions}
          </Text>

          <Card className="flex-row items-center py-[15px] px-[25px] mb-[50px]">
            <Zap size={24} color="#FACC15" fill="#FACC15" />
            <Text className="text-lg text-[#FACC15] ml-2.5 font-bold">+50 XP Earned</Text>
          </Card>

          <TouchableOpacity
            className="bg-[#6366F1] w-full py-[18px] rounded-[30px] items-center"
            onPress={handleContinue}
          >
            <Text className="text-white text-lg font-bold">Continue</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FA]">
      <View className="px-10 pt-[50px] bg-white pb-5">
        <View className="flex-row items-center justify-between mb-2.5">
          <TouchableOpacity
            onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)"))}
            className="mr-[15px]"
          >
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>
          <View className="flex-1 ml-[15px]">
            <Text className="text-sm text-[#64748B] font-medium">Grammar Practice</Text>
          </View>
          <Text className="text-sm text-[#6366F1] font-bold">
            {currentIndex + 1}/{totalQuestions}
          </Text>
        </View>
        <ProgressBar progress={progressValue} color="#6366F1" className="my-0 h-3" />
      </View>

      {lessonExercises.length === 0 ? (
        <View className="flex-1 justify-center items-center p-[30px]">
          <Text className="text-lg text-[#64748B] font-medium mb-5 text-center">
            No questions found for this lesson.
          </Text>
          <TouchableOpacity
            className="bg-[#6366F1] py-3 px-[30px] rounded-[25px]"
            onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)"))}
          >
            <Text className="text-white font-bold text-base">Go Back</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="flex-1 w-full self-center">
          <FlatList
            ref={flatListRef}
            data={lessonExercises}
            renderItem={renderQuestion}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / CONTAINER_WIDTH);
              if (index !== currentIndex && index >= 0 && index < totalQuestions) {
                setCurrentIndex(index);
              }
            }}
            scrollEventThrottle={16}
            getItemLayout={(_, index) => ({
              length: CONTAINER_WIDTH,
              offset: CONTAINER_WIDTH * index,
              index,
            })}
            className="flex-1"
          />
        </View>
      )}

      <View className="p-5 flex-row justify-between items-center bg-white pb-10">
        <TouchableOpacity
          className={`flex-row items-center ${currentIndex === 0 ? "opacity-50" : ""}`}
          onPress={() => {
            if (currentIndex > 0) {
              flatListRef.current?.scrollToIndex({ index: currentIndex - 1, animated: true });
              setCurrentIndex(currentIndex - 1);
            }
          }}
          disabled={currentIndex === 0}
        >
          <ChevronLeft size={24} color={currentIndex === 0 ? "#CBD5E1" : "#6366F1"} />
          <Text
            className={`text-base ml-1 font-bold ${currentIndex === 0 ? "text-[#CBD5E1]" : "text-[#6366F1]"}`}
          >
            Previous
          </Text>
        </TouchableOpacity>

        {currentIndex === totalQuestions - 1 && answers[currentIndex]?.hasChecked && (
          <TouchableOpacity
            className="bg-[#6366F1] flex-row items-center py-3 px-5 rounded-[30px]"
            onPress={finishLesson}
          >
            <Text className="text-white text-base mr-2.5 font-bold">Finish</Text>
            <ChevronRight size={24} color="white" />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};
