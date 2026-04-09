import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Alert,
  ScrollView,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { DAILY_QUESTS } from "@/constants/questData";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  ChevronLeft,
  Zap,
  Timer as TimerIcon,
} from "lucide-react-native";
import { MCQOption, Card } from "@/features/learning/components";
import { ProgressBar } from "@/features/progress/components";
import { useWindowDimensions } from "react-native";

export const QuestExerciseScreen = () => {
  const { width: windowWidth } = useWindowDimensions();
  const CONTAINER_WIDTH = windowWidth;

  const { questId } = useLocalSearchParams();
  const quest = DAILY_QUESTS.find((q) => q.id === questId) || DAILY_QUESTS[0];
  if (!quest) {
    return (
      <SafeAreaView className="flex-1 bg-[#F8F9FA] justify-center items-center">
        <Text className="text-lg text-black">Quest not found</Text>
        <TouchableOpacity
          className="mt-5 bg-[#6366F1] px-5 py-2.5 rounded-xl"
          onPress={() => router.back()}
        >
          <Text className="text-white font-bold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
  const questions = quest.questions;
  const totalQuestions = questions.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(quest.timeLimit);
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState(
    questions.map(() => ({ selectedOption: null, hasChecked: false, isCorrect: null })),
  );

  const flatListRef = useRef<FlatList>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          finishQuest(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const finishQuest = (isTimeout = false) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsFinished(true);
    if (isTimeout) {
      Alert.alert("Time's Up!", "You've run out of time for this quest.");
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
      setCurrentIndex(currentIndex + 1);
    } else {
      finishQuest();
    }
  };

  const renderQuestion = ({ item, index }: { item: any; index: number }) => {
    const currentAnswer = answers[index];

    return (
      <View
        style={{ width: CONTAINER_WIDTH }}
        className={`justify-center py-5 ${windowWidth > 1200 ? "px-[100px]" : windowWidth > 800 ? "px-[50px]" : "px-5"}`}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 20 }}
        >
          <Card className="p-10 min-h-[500px] rounded-[20px] shadow-sm shadow-black/5 elevation-3">
            <Text className="text-xs text-[#6366F1] mb-2.5 font-bold tracking-widest uppercase">
              {item.type.toUpperCase()}
            </Text>
            <Text className="text-[22px] text-black mb-[30px] font-bold leading-[30px]">
              {item.question}
            </Text>

            <View className="w-full">
              {item.options.map((option: string, optIdx: number) => {
                const isSelected = (currentAnswer as any).selectedOption === optIdx;
                const isCorrectOption =
                  (currentAnswer as any).hasChecked && optIdx === item.correctAnswer;
                const isWrongSelection =
                  (currentAnswer as any).hasChecked && isSelected && !isCorrectOption;

                return (
                  <MCQOption
                    key={optIdx}
                    label={String.fromCharCode(65 + optIdx)}
                    text={option}
                    isSelected={isSelected}
                    isCorrect={isCorrectOption}
                    isWrong={isWrongSelection}
                    disabled={(currentAnswer as any).hasChecked}
                    onPress={() => {
                      if (!(currentAnswer as any).hasChecked) {
                        const newAnswers = [...answers];
                        (newAnswers[index] as any).selectedOption = optIdx;

                        const isCorrect = optIdx === item.correctAnswer;
                        (newAnswers[index] as any).hasChecked = true;
                        (newAnswers[index] as any).isCorrect = isCorrect;
                        setAnswers(newAnswers);

                        if (isCorrect) setScore((prev) => prev + 1);

                        setTimeout(() => {
                          if (index < totalQuestions - 1) {
                            handleNext();
                          }
                        }, 1200);
                      }
                    }}
                  />
                );
              })}
            </View>

            {(currentAnswer as any).hasChecked && (
              <View className="mt-5 p-[15px] rounded-xl bg-[#F8F9FA]">
                <Text className="text-sm text-[#64748B] font-normal leading-5">
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
        <View className="flex-1 justify-center items-center p-[30px]">
          <View className="w-[100px] h-[100px] rounded-full bg-[#22C55E] justify-center items-center mb-[30px]">
            <Check size={50} color="white" />
          </View>
          <Text className="text-[32px] text-black font-bold mb-2.5">Quest Complete!</Text>
          <Text className="text-lg text-[#64748B] font-medium mb-10">
            You scored {score} out of {totalQuestions}
          </Text>

          <Card className="flex-row items-center py-[15px] px-[25px] mb-[50px] rounded-[20px] shadow-sm shadow-black/5 elevation-3">
            <Zap size={24} color="#FACC15" fill="#FACC15" />
            <Text className="text-lg text-[#FACC15] ml-2.5 font-bold">+{score * 10} XP Earned</Text>
          </Card>

          <TouchableOpacity
            className="bg-[#6366F1] w-full py-[18px] rounded-[30px] items-center"
            onPress={() => router.replace("/(tabs)")}
          >
            <Text className="text-white text-lg font-bold">Return Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FA]">
      <View className="px-10 pt-[50px] pb-5 bg-white shadow-sm shadow-black/5 elevation-2">
        <View className="flex-row justify-between items-center mb-2.5">
          <TouchableOpacity
            onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)"))}
            className="p-1.25"
          >
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>
          <View className="flex-1 mx-[15px]">
            <Text className="text-sm text-[#64748B] font-medium" numberOfLines={1}>
              Daily Quest • {quest.title}
            </Text>
          </View>
          <View className="flex-row items-center">
            <View className="flex-row items-center mr-[15px]">
              <TimerIcon size={16} color={timeLeft < 30 ? "#EF4444" : "#6366F1"} />
              <Text
                className={`ml-1.25 text-sm font-bold ${timeLeft < 30 ? "text-[#EF4444]" : "text-[#6366F1]"}`}
              >
                {formatTime(timeLeft)}
              </Text>
            </View>
            <Text className="text-sm text-[#64748B] font-bold">
              {currentIndex + 1}/{totalQuestions}
            </Text>
          </View>
        </View>
        <ProgressBar
          progress={(currentIndex / totalQuestions) * 100}
          color="#6366F1"
          className="my-0 h-3"
        />
      </View>

      <View className="flex-1 w-full self-center bg-[#F8F9FA]">
        <FlatList
          ref={flatListRef}
          data={questions}
          renderItem={renderQuestion}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / CONTAINER_WIDTH);
            if (index !== currentIndex && index >= 0 && index < totalQuestions) {
              setCurrentIndex(index);
            }
          }}
          keyExtractor={(_, index) => index.toString()}
          getItemLayout={(_, index) => ({
            length: CONTAINER_WIDTH,
            offset: CONTAINER_WIDTH * index,
            index,
          })}
          className="flex-1"
        />
      </View>

      <View className="p-5 pb-10 flex-row justify-between items-center bg-white border-t border-[#F1F5F9]">
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
            className={`text-base ml-1.25 font-bold ${currentIndex === 0 ? "text-[#CBD5E1]" : "text-[#6366F1]"}`}
          >
            Previous
          </Text>
        </TouchableOpacity>

        {currentIndex === totalQuestions - 1 && (answers[currentIndex] as any).hasChecked && (
          <TouchableOpacity
            className="bg-[#6366F1] flex-row items-center py-[15px] px-5 rounded-[30px]"
            onPress={() => finishQuest()}
          >
            <Text className="text-white text-lg mr-2.5 font-bold">Finish Quest</Text>
            <ChevronRight size={24} color="white" />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};
