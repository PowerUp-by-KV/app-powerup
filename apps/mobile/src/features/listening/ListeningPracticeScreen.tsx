import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  ScrollView,
  Dimensions,
  FlatList,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { COLORS, FONTS, SIZES } from "@/constants/theme";
import { listeningData } from "@/constants/listeningData";
import {
  Headphones,
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Lightbulb,
} from "lucide-react-native";
import { MCQOption } from "@/features/learning/components";
import { LinearGradient } from "expo-linear-gradient";
import { Audio } from "expo-av";

const { width } = Dimensions.get("window");

const ListeningPage = ({ item, isActive, timer, activeIndex, setActiveIndex, flatListRef }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [sound, setSound] = useState(null);

  const bars = Array(20)
    .fill(0)
    .map(() => useRef(new Animated.Value(10)).current);
  const transitionAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isActive && isPlaying && sound) {
      sound.pauseAsync();
      setIsPlaying(false);
    }
  }, [isActive]);

  useEffect(() => {
    return sound ? () => sound.unloadAsync() : undefined;
  }, [sound]);

  useEffect(() => {
    if (isPlaying) {
      bars.forEach((bar) => {
        const animate = () => {
          Animated.sequence([
            Animated.timing(bar, {
              toValue: 15 + Math.random() * 35,
              duration: 150 + Math.random() * 100,
              useNativeDriver: false,
            }),
            Animated.timing(bar, {
              toValue: 10,
              duration: 150 + Math.random() * 100,
              useNativeDriver: false,
            }),
          ]).start(() => {
            if (isPlaying) animate();
          });
        };
        animate();
      });
    } else {
      bars.forEach((bar) => {
        bar.stopAnimation();
        bar.setValue(10);
      });
    }
  }, [isPlaying]);

  const playSound = async () => {
    if (sound === null) {
      const { sound: newSound } = await Audio.Sound.createAsync(item.audio);
      setSound(newSound);
      await newSound.playAsync();
      setIsPlaying(true);
      newSound.setOnPlaybackStatusUpdate((status: any) => {
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

  const handleOptionSelect = (option) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);
    if (option === item.questions[currentQuestionIndex].answer) setScore((prev) => prev + 1);

    // Auto-advance after delay
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
      <View style={styles.pageContainer}>
        <View style={styles.finishedContent}>
          <LinearGradient colors={["#6366F1", "#8B5CF6"]} style={styles.resultIcon}>
            <CheckCircle2 size={60} color={COLORS.white} />
          </LinearGradient>
          <Text style={styles.resultTitle}>Task Complete!</Text>
          <Text style={styles.resultScore}>
            You scored {score} out of {item.questions.length}
          </Text>
          <View style={styles.suggestionBox}>
            <Text style={styles.suggestionText}>{getSuggestion()}</Text>
          </View>
          <TouchableOpacity
            style={styles.finishButton}
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
            <Text style={styles.finishButtonText}>
              {activeIndex < listeningData.length - 1 ? "Next Topic" : "Return to Dashboard"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const currentQuestion = item.questions[currentQuestionIndex];

  return (
    <View style={styles.pageContainer}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.playerCard}>
          <LinearGradient colors={["#F472B6", "#EC4899"]} style={styles.playerIcon}>
            <Headphones size={40} color={COLORS.white} />
          </LinearGradient>
          <View style={styles.waveformContainer}>
            {bars.map((bar, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.waveBar,
                  { height: bar, backgroundColor: isPlaying ? "#EC4899" : COLORS.gray },
                ]}
              />
            ))}
          </View>
          <View style={[styles.controls, { justifyContent: "center" }]}>
            <TouchableOpacity style={styles.secondaryControl} onPress={handleResetAudio}>
              <RotateCcw size={24} color={COLORS.gray} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.playButton, { marginHorizontal: 30 }]}
              onPress={playSound}
            >
              {isPlaying ? (
                <Pause size={32} color={COLORS.white} />
              ) : (
                <Play size={32} color={COLORS.white} style={{ marginLeft: 4 }} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <Animated.View
          style={[
            styles.questionCard,
            { opacity: transitionAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) },
          ]}
        >
          <Text style={styles.questionText}>{currentQuestion.question}</Text>
          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((option, idx) => {
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

          {/* Manual Finish button for the last question */}
          {isAnswered && currentQuestionIndex === item.questions.length - 1 && (
            <TouchableOpacity
              style={[styles.continueButton, { marginTop: 20 }]}
              onPress={handleNextQuestion}
            >
              <Text style={styles.continueButtonText}>Finish</Text>
              <ChevronRight size={20} color={COLORS.white} />
            </TouchableOpacity>
          )}
        </Animated.View>
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

import { useTimeTracker } from "@/hooks/useTimeTracker";

export const ListeningPracticeScreen = () => {
  useTimeTracker("listening");
  const { lessonId = "l1" } = useLocalSearchParams();
  const initialIndex = listeningData.findIndex((l) => l.id === lessonId);
  const [activeIndex, setActiveIndex] = useState(initialIndex !== -1 ? initialIndex : 0);
  const flatListRef = useRef(null);

  const currentLesson = listeningData[activeIndex];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)"))}
        >
          <ArrowLeft size={24} color={COLORS.black} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.topicLabel}>Listening • Practice</Text>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {currentLesson.title}
          </Text>
          <Text style={styles.headerSubtitle}>
            Task {activeIndex + 1} of {listeningData.length}
          </Text>
        </View>
        <View style={styles.progressDots}>
          {listeningData.map((_, i) => (
            <View key={i} style={[styles.dot, i === activeIndex && styles.activeDot]} />
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
            timer={null}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  pageContainer: {
    width: width,
    flex: 1,
  },
  header: {
    padding: SIZES.padding,
    paddingTop: 45, // Reduced from 60
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  headerTitleContainer: {
    flex: 1,
  },
  topicLabel: {
    fontSize: 10,
    color: COLORS.primary,
    ...FONTS.bold,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.gray,
    ...FONTS.medium,
  },
  progressDots: {
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.background,
    marginLeft: 4,
  },
  activeDot: {
    width: 20,
    backgroundColor: COLORS.primary,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 18,
    color: COLORS.black,
    ...FONTS.bold,
    flex: 1,
  },
  questionCounter: {
    backgroundColor: COLORS.primary + "15",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  counterText: {
    fontSize: 12,
    color: COLORS.primary,
    ...FONTS.bold,
  },
  scrollContent: {
    padding: SIZES.padding,
    paddingBottom: 40,
  },
  playerCard: {
    backgroundColor: COLORS.white,
    borderRadius: 25,
    padding: 15, // Reduced from 25
    alignItems: "center",
    marginBottom: 20, // Reduced from 25
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  playerIcon: {
    width: 60, // Reduced from 80
    height: 60, // Reduced from 80
    borderRadius: 30, // Reduced from 40
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10, // Reduced from 20
  },
  waveformContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 60,
    marginBottom: 10,
  },
  waveBar: {
    width: 6,
    borderRadius: 3,
    marginHorizontal: 2,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 10,
  },
  playButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#EC4899",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#EC4899",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  secondaryControl: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
  },
  transcriptBox: {
    width: "100%",
    marginTop: 20,
    padding: 15,
    backgroundColor: COLORS.background,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#eee",
  },
  transcriptLabel: {
    fontSize: 10,
    color: COLORS.primary,
    ...FONTS.bold,
    letterSpacing: 1,
    marginBottom: 8,
  },
  transcriptText: {
    fontSize: 14,
    color: COLORS.darkGray,
    ...FONTS.medium,
    lineHeight: 20,
  },
  questionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 25,
    padding: 25,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  questionText: {
    fontSize: 18,
    color: COLORS.black,
    ...FONTS.bold,
    marginBottom: 10,
    lineHeight: 26,
  },
  optionsContainer: {
    marginBottom: 10,
  },
  optionButton: {
    padding: 18,
    borderRadius: 15,
    backgroundColor: COLORS.background,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eee",
  },
  optionText: {
    fontSize: 16,
    color: COLORS.black,
    ...FONTS.medium,
    flex: 1,
  },
  selectedOption: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + "10",
  },
  selectedOptionText: {
    color: COLORS.primary,
    ...FONTS.bold,
  },
  correctOption: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  correctOptionText: {
    color: COLORS.white,
    ...FONTS.bold,
  },
  wrongOption: {
    backgroundColor: COLORS.error,
    borderColor: COLORS.error,
  },
  wrongOptionText: {
    color: COLORS.white,
    ...FONTS.bold,
  },
  continueButton: {
    marginTop: 10,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 15,
  },
  continueButtonText: {
    color: COLORS.white,
    fontSize: 16,
    ...FONTS.bold,
    marginRight: 10,
  },
  finishedContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SIZES.padding,
  },
  resultIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  resultTitle: {
    fontSize: 28,
    color: COLORS.black,
    ...FONTS.bold,
    marginBottom: 10,
  },
  resultScore: {
    fontSize: 18,
    color: COLORS.gray,
    ...FONTS.medium,
    marginBottom: 30,
  },
  suggestionBox: {
    width: "100%",
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 40,
    borderLeftWidth: 5,
    borderLeftColor: COLORS.primary,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  suggestionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  suggestionTitle: {
    fontSize: 16,
    color: COLORS.primary,
    ...FONTS.bold,
    marginLeft: 10,
  },
  suggestionText: {
    fontSize: 15,
    color: COLORS.darkGray,
    ...FONTS.medium,
    lineHeight: 22,
  },
  finishButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 40,
    paddingVertical: 18,
    borderRadius: 30,
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  finishButtonText: {
    color: COLORS.white,
    fontSize: 18,
    ...FONTS.bold,
  },
});

// export default ListeningPracticeScreen;
