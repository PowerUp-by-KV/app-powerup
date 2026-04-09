import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, Animated, ScrollView, Dimensions } from "react-native";
import { router } from "expo-router";
import { listeningData } from "@/constants/listeningData";
import {
  Headphones,
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  CheckCircle2,
} from "lucide-react-native";
import { MCQOption } from "@/features/learning/components";
import { LinearGradient } from "expo-linear-gradient";
import { Audio } from "expo-av";

const { width } = Dimensions.get("window");

interface ListeningPageProps {
  item: any;
  isActive: boolean;
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  flatListRef: any;
}

const ListeningPage = ({
  item,
  isActive,
  activeIndex,
  setActiveIndex,
  flatListRef,
}: ListeningPageProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const bars = Array(24)
    .fill(0)
    .map(() => useRef(new Animated.Value(15)).current);
  const transitionAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isActive && isPlaying && sound) {
      sound.pauseAsync();
      setIsPlaying(false);
    }
  }, [isActive]);

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  useEffect(() => {
    if (isPlaying) {
      bars.forEach((bar, i) => {
        const animate = () => {
          Animated.sequence([
            Animated.timing(bar, {
              toValue: 20 + Math.random() * 40,
              duration: 200 + Math.random() * 300,
              useNativeDriver: false,
            }),
            Animated.timing(bar, {
              toValue: 15,
              duration: 200 + Math.random() * 300,
              useNativeDriver: false,
            }),
          ]).start(() => {
            if (isPlaying) animate();
          });
        };
        // Stagger the start of each bar
        setTimeout(animate, i * 20);
      });
    } else {
      bars.forEach((bar) => {
        bar.stopAnimation();
        Animated.timing(bar, {
          toValue: 15,
          duration: 300,
          useNativeDriver: false,
        }).start();
      });
    }
  }, [isPlaying]);

  const playSound = async () => {
    if (sound === null) {
      const { sound: newSound } = await Audio.Sound.createAsync(item.audio);
      setSound(newSound);
      await newSound.playAsync();
      setIsPlaying(true);
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
          newSound.setPositionAsync(0);
        }
      });
    } else {
      if (isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        await sound.playAsync();
        setIsPlaying(true);
      }
    }
  };

  const handleResetAudio = async () => {
    if (sound) {
      await sound.stopAsync();
      await sound.setPositionAsync(0);
      setIsPlaying(false);
    }
  };

  const handleOptionSelect = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);
    if (option === item.questions[currentQuestionIndex].answer) setScore((prev) => prev + 1);

    setTimeout(() => {
      if (currentQuestionIndex < item.questions.length - 1) {
        handleNextQuestion();
      }
    }, 1200);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < item.questions.length - 1) {
      Animated.timing(transitionAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start(
        () => {
          setCurrentQuestionIndex((prev) => prev + 1);
          setSelectedOption(null);
          setIsAnswered(false);
          transitionAnim.setValue(0);
        },
      );
    } else {
      setIsFinished(true);
    }
  };

  const getSuggestion = () => {
    const percentage = (score / item.questions.length) * 100;
    if (percentage === 100) return "Excellent! Your listening skills are top-notch.";
    if (percentage >= 70) return "Great job! You have a good ear.";
    return "Keep practicing! Consistent practice is key.";
  };

  if (isFinished) {
    return (
      <View style={{ width }} className="flex-1">
        <View className="flex-1 justify-center items-center p-5">
          <LinearGradient
            colors={["#6366F1", "#8B5CF6"]}
            className="w-[120px] h-[120px] rounded-full justify-center items-center mb-[30px]"
          >
            <CheckCircle2 size={60} color="white" />
          </LinearGradient>
          <Text className="text-[28px] text-black font-bold mb-2.5">Task Complete!</Text>
          <Text className="text-lg text-[#64748B] font-medium mb-[30px]">
            You scored {score} out of {item.questions.length}
          </Text>
          <View className="w-full bg-white rounded-[20px] p-5 mb-10 border-l-4 border-[#6366F1] shadow-sm shadow-black/10">
            <Text className="text-[15px] text-[#475569] font-medium leading-[22px]">
              {getSuggestion()}
            </Text>
          </View>
          <TouchableOpacity
            className="bg-[#6366F1] px-10 py-[18px] rounded-[30px] shadow-sm shadow-[#6366F1]/30"
            onPress={() => {
              if (activeIndex < listeningData.length - 1) {
                flatListRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
                setActiveIndex(activeIndex + 1);
                setIsFinished(false);
                setCurrentQuestionIndex(0);
                setIsAnswered(false);
                setSelectedOption(null);
              } else {
                router.replace("/(tabs)");
              }
            }}
          >
            <Text className="text-white text-lg font-bold">
              {activeIndex < listeningData.length - 1 ? "Next Topic" : "Return to Dashboard"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const currentQuestion = item.questions[currentQuestionIndex];

  return (
    <View style={{ width }} className="flex-1">
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="bg-white rounded-3xl p-10 items-center mb-6 shadow-sm shadow-black/5 elevation-4">
          {/* Headphones Icon */}
          <View className="w-20 h-20 rounded-full bg-pink-500 justify-center items-center mb-10 shadow-lg shadow-pink-500/20">
            <Headphones size={40} color="white" />
          </View>

          {/* Moving Wave Visualizer */}
          <View className="flex-row items-center justify-center h-24 mb-10 w-full overflow-hidden">
            {bars.map((bar, i) => (
              <Animated.View
                key={i}
                style={[
                  {
                    height: bar,
                    backgroundColor: isPlaying ? "#8B5CF6" : "#E2E8F0",
                    width: 3.5,
                    borderRadius: 2,
                    marginHorizontal: 1.5,
                    opacity: isPlaying ? 1 : 0.4,
                  },
                ]}
              />
            ))}
          </View>

          {/* Centered Play Button */}
          <TouchableOpacity
            className="w-24 h-24 rounded-full bg-pink-500 justify-center items-center shadow-xl shadow-pink-500/40"
            onPress={playSound}
            activeOpacity={0.9}
          >
            {isPlaying ? (
              <Pause size={44} color="white" />
            ) : (
              <Play size={44} color="white" className="ml-1.5" />
            )}
          </TouchableOpacity>
        </View>

        <Animated.View
          style={[
            { opacity: transitionAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) },
          ]}
          className="bg-white rounded-3xl p-6 shadow-sm shadow-black/5 elevation-4"
        >
          <Text className="text-lg text-black font-bold mb-2.5 leading-[26px]">
            {currentQuestion.question}
          </Text>
          <View className="mb-2.5">
            {currentQuestion.options.map((option: string, idx: number) => {
              const isSelected = selectedOption === option;
              const isCorrect = option === currentQuestion.answer;
              const showResult = isAnswered && (isSelected || isCorrect);
              return (
                <MCQOption
                  key={idx}
                  label={String.fromCharCode(65 + idx)}
                  text={option}
                  isSelected={isSelected}
                  isCorrect={showResult && isCorrect}
                  isWrong={showResult && isSelected && !isCorrect}
                  disabled={isAnswered}
                  onPress={() => handleOptionSelect(option)}
                />
              );
            })}
          </View>

          {isAnswered && currentQuestionIndex === item.questions.length - 1 && (
            <TouchableOpacity
              className="mt-6 bg-[#EC4899] flex-row items-center justify-center py-4 rounded-2xl shadow-md shadow-pink-500/20"
              onPress={handleNextQuestion}
            >
              <Text className="text-white text-base font-bold mr-2.5">Finish Practice</Text>
              <ChevronRight size={20} color="white" />
            </TouchableOpacity>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
};

export default ListeningPage;
