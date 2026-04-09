import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Animated,
  useWindowDimensions,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, CheckCircle2, AlertCircle, TrendingUp, Share2, Zap } from "lucide-react-native";
import { speakingPrompts } from "@/constants/verbalData";

interface MetricCircleProps {
  label: string;
  score: number;
  color: string;
  delay: number;
}

const MetricCircle = ({ label, score, color, delay }: MetricCircleProps) => {
  // Persist animated value across renders
  const animatedValue = useRef(new Animated.Value(0)).current;
  // displayScore is updated by the animatedValue listener for a smooth count
  const [displayScore, setDisplayScore] = useState<number>(0);

  useEffect(() => {
    // listener updates local state as the animated value changes
    const listenerId = animatedValue.addListener(({ value }) => {
      setDisplayScore(Math.round(value));
    });

    // animate to the target score
    Animated.timing(animatedValue, {
      toValue: score,
      duration: 1000,
      delay: delay,
      useNativeDriver: false,
    }).start();

    return () => {
      // clean up listener to avoid memory leaks
      animatedValue.removeListener(listenerId);
    };
  }, [score]);

  return (
    <View className="items-center mb-6 w-1/3">
      <View
        style={{ borderColor: `${color}33` }}
        className="w-20 h-20 rounded-full border-[6px] justify-center items-center bg-white shadow-sm shadow-black/10 elevation-2"
      >
        {/*
          Note: Animated.Text is used here but the child is a plain number. The
          React Native Animated API does not animate text content automatically.
          To create a counting animation you can either:
            - attach a listener to `animatedValue` (animatedValue.addListener) and
              update a local state variable with the interpolated value, or
            - use a library like `react-native-reanimated` which supports
              declarative animated values in text components.
          This comment explains the current behavior (the score will jump to its
          final value) and suggests approaches if you want a smooth numeric
          animation.
        */}
        <Animated.Text style={[{ color: color }]} className="text-xl font-bold">
          {displayScore}%
        </Animated.Text>
      </View>
      <Text className="text-[12px] text-[#475569] mt-2.5 font-bold">{label}</Text>
    </View>
  );
};

export const SpeechAnalysisResultScreen = () => {
  const { promptId } = useLocalSearchParams();
  const { width } = useWindowDimensions();

  const currentIndex = speakingPrompts.findIndex((p) => p.id === promptId);
  const nextPrompt =
    currentIndex !== -1 && currentIndex < speakingPrompts.length - 1
      ? speakingPrompts[currentIndex + 1]
      : null;

  const handleNext = () => {
    if (nextPrompt) {
      router.replace({
        pathname: "/SpeakingPractice",
        params: { promptData: JSON.stringify(nextPrompt) },
      });
    } else {
      router.replace("/(tabs)");
    }
  };

  const metrics = [
    { label: "Pronunciation", score: 85, color: "#6366F1" },
    { label: "Fluency", score: 72, color: "#EC4899" },
    { label: "Confidence", score: 90, color: "#F59E0B" },
    { label: "Clarity", score: 78, color: "#10B981" },
    { label: "Vocabulary", score: 65, color: "#3B82F6" },
  ];

  const fillerWords = [
    { word: "um", count: 3 },
    { word: "uh", count: 2 },
    { word: "like", count: 5 },
  ];

  return (
    <View style={{ flex: 1, height: "100%" }} className="flex-1 bg-[#F8F9FA]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 24, paddingTop: 60, paddingBottom: 20, flexGrow: 1 }}
        className="flex-1"
      >
        <View className="items-center mb-9">
          <View className="flex-row items-center bg-[#22C55E] px-4 py-2 rounded-full mb-5">
            <CheckCircle2 size={18} color="white" />
            <Text className="text-white text-[12px] ml-2 font-bold uppercase tracking-wider">
              Analysis Complete
            </Text>
          </View>
          <Text className="text-[32px] text-black font-bold text-center">Speech Performance</Text>
          <Text className="text-base text-[#64748B] font-medium mt-1.25 text-center">
            Great job! Your speaking is improving.
          </Text>
        </View>

        <View className="flex-row flex-wrap justify-center mb-5">
          {metrics.map((m, i) => (
            <MetricCircle key={i} label={m.label} score={m.score} color={m.color} delay={i * 200} />
          ))}
        </View>

        <View className="bg-white p-6 rounded-[25px] mb-5 shadow-sm shadow-black/10 elevation-3">
          <View className="flex-row items-center mb-5">
            <AlertCircle size={20} color="#EF4444" />
            <Text className="text-base text-black font-bold ml-2.5">Filler Word Detection</Text>
          </View>
          <View className="flex-row flex-wrap mb-4">
            {fillerWords.map((fw, i) => (
              <View
                key={i}
                className="flex-row items-center bg-[#F8F9FA] px-3 py-1.5 rounded-full mr-2.5 mb-2.5 border border-[#E2E8F0]"
              >
                <Text className="text-sm text-[#475569] font-bold mr-2">"{fw.word}"</Text>
                <View className="bg-[#EF4444]/10 px-1.5 py-0.25 rounded">
                  <Text className="text-[12px] text-[#EF4444] font-bold">{fw.count}</Text>
                </View>
              </View>
            ))}
          </View>
          <Text className="text-sm text-[#64748B] leading-5 italic font-medium">
            Try to pause for a second instead of using "{fillerWords[2]?.word || "filler words"}" to
            make your speech sound more professional.
          </Text>
        </View>

        <View className="bg-white p-6 rounded-[25px] mb-5 shadow-sm shadow-black/10 elevation-3">
          <View className="flex-row items-center mb-5">
            <TrendingUp size={20} color="#6366F1" />
            <Text className="text-base text-black font-bold ml-2.5">AI Feedback & Suggestions</Text>
          </View>

          {[
            "Your **Pronunciation** is very clear, especially with technical terms.",
            "To improve **Fluency**, try to connect your sentences with transition words like 'Furthermore' or 'In addition'.",
            "Your **Vocabulary** usage was appropriate, but using more descriptive adjectives could boost your score.",
          ].map((text, i) => (
            <View key={i} className="flex-row items-start mb-4">
              <View className="w-2 h-2 rounded-full bg-[#6366F1] mt-2 mr-3" />
              <Text className="flex-1 text-[15px] text-[#475569] leading-[22px] font-medium">
                {text}
              </Text>
            </View>
          ))}
        </View>

        <View className="mt-5 pb-10">
          <TouchableOpacity
            className="bg-[#6366F1] flex-row justify-center items-center py-[18px] rounded-[20px] mb-4 shadow-md shadow-[#6366F1]/30 elevation-5"
            onPress={handleNext}
          >
            <Zap size={20} color="white" />
            <Text className="text-white text-lg font-bold ml-2.5">
              {nextPrompt ? "Next Speaking Prompt" : "Return to Dashboard"}
            </Text>
          </TouchableOpacity>

          <View className="flex-row justify-between">
            <TouchableOpacity
              className="flex-row items-center justify-center bg-white border border-[#6366F1] py-3 rounded-[15px] w-[48%]"
              onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)"))}
            >
              <ArrowLeft size={18} color="#6366F1" />
              <Text className="text-[#6366F1] text-sm font-bold ml-2">Try Again</Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center justify-center bg-white border border-[#6366F1] py-3 rounded-[15px] w-[48%]">
              <Share2 size={18} color="#6366F1" />
              <Text className="text-[#6366F1] text-sm font-bold ml-2">Share Result</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View
        style={{ top: -100, right: -100, width: 300, height: 300, borderRadius: 150 }}
        className="absolute bg-[#6366F1]/5 z-10"
      />
    </View>
  );
};

// export default SpeechAnalysisResultScreen;
