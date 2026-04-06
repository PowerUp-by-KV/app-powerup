import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  useWindowDimensions,
  ScrollView,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { behaviouralData } from "@/constants/behaviouralData";
import { ArrowLeft, ChevronRight, Brain, RotateCcw } from "lucide-react-native";
import { MCQOption } from "@/features/learning/components";
import { ProgressBar } from "@/features/progress/components";
import { useTimeTracker } from "@/hooks/useTimeTracker";

export const BehaviouralScreen = () => {
  useTimeTracker("behavioural");
  const { width } = useWindowDimensions();
  const { trait: filterTrait } = useLocalSearchParams();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userResponses, setUserResponses] = useState<any[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Filter data if a specific trait is requested (Retake mode)
  const filteredData = useMemo(() => {
    if (filterTrait) {
      return behaviouralData.filter((item) => item.trait === filterTrait);
    }
    return behaviouralData;
  }, [filterTrait]);

  const handleSelectOption = (option: string) => {
    if (selectedOption) return;
    setSelectedOption(option);

    // Small delay to show selection
    setTimeout(() => {
      const scenario = filteredData[currentIndex];
      if (!scenario) return;

      const newResponses = [
        ...userResponses,
        {
          questionId: scenario.id,
          selectedOption: option,
          isIdeal: option === scenario.bestOption,
          trait: scenario.trait,
          weight: scenario.traitWeight,
        },
      ];

      setUserResponses(newResponses);

      if (currentIndex < filteredData.length - 1) {
        // Animate transition to next question
        Animated.parallel([
          Animated.timing(fadeAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
          Animated.timing(slideAnim, { toValue: -50, duration: 250, useNativeDriver: true }),
        ]).start(() => {
          setCurrentIndex(currentIndex + 1);
          setSelectedOption(null);
          slideAnim.setValue(50);
          Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
          ]).start();
        });
      } else {
        // Complete - show finish button instead of auto-navigating
        setIsFinished(true);
      }
    }, 400);
  };

  const currentScenario = filteredData[currentIndex];
  const progress = ((currentIndex + 1) / filteredData.length) * 100;

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FA]">
      <View className="px-5 pt-[60px] pb-5 bg-white rounded-b-[30px] flex-row items-center justify-between shadow-sm shadow-black/10 elevation-4">
        <TouchableOpacity
          className="w-10 h-10 rounded-full bg-[#F8F9FA] items-center justify-center"
          onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)"))}
        >
          <ArrowLeft size={24} color="black" />
        </TouchableOpacity>
        <View className="flex-row items-center">
          <Brain size={20} color="#6366F1" className="mr-2" />
          <Text className="text-lg text-black font-bold">
            {filterTrait ? "Focus Training" : "Behavioural Training"}
          </Text>
        </View>
        <View className="w-10" />
      </View>

      <View className="px-5 pt-5">
        {filterTrait && (
          <View className="mb-4 bg-[#FFF7ED] p-3 rounded-xl flex-row items-center">
            <RotateCcw size={16} color="#F59E0B" />
            <Text className="ml-2 text-[#C2410C] font-bold text-xs uppercase">
              Target: {filterTrait}
            </Text>
          </View>
        )}
        <View className="flex-row justify-between mb-2">
          <Text className="text-sm text-[#64748B] font-medium">
            Question {currentIndex + 1} of {filteredData.length || 0}
          </Text>
          <Text className="text-sm text-[#6366F1] font-bold">{Math.round(progress || 0)}%</Text>
        </View>
        <ProgressBar progress={progress || 0} color="#6366F1" />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingTop: 20, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[{ opacity: fadeAnim, transform: [{ translateX: slideAnim }] }]}
          className="bg-white rounded-[25px] p-[25px] min-h-[400px] shadow-sm shadow-black/10 elevation-8"
        >
          <Text className="text-xl text-black font-bold leading-[30px] mb-[30px]">
            {currentScenario?.scenario || "Loading scenario..."}
          </Text>

          <View className="gap-y-[15px]">
            {currentScenario?.options?.map((option: string, index: number) => (
              <MCQOption
                key={index}
                label={String.fromCharCode(65 + index)}
                text={option}
                isSelected={selectedOption === option}
                isCorrect={null}
                isWrong={null}
                disabled={!!selectedOption}
                onPress={() => handleSelectOption(option)}
              />
            ))}
          </View>

          {isFinished && (
            <TouchableOpacity
              className="bg-[#6366F1] flex-row items-center justify-center py-4 px-5 rounded-[30px] w-full mt-[30px] shadow-lg shadow-[#6366F1]/30 elevation-4"
              onPress={() =>
                router.push({
                  pathname: "/BehaviouralResult",
                  params: { responses: JSON.stringify(userResponses) },
                })
              }
            >
              <Text className="text-white text-base font-bold mr-2.5">View Assessment Results</Text>
              <ChevronRight size={20} color="white" />
            </TouchableOpacity>
          )}
        </Animated.View>
      </ScrollView>

      <View className="p-5 pb-10 items-center">
        <Text className="text-[12px] text-[#64748B] italic font-normal">
          Choose the response that feels most like you.
        </Text>
      </View>
    </SafeAreaView>
  );
};
