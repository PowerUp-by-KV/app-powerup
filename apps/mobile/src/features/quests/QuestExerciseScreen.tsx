import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  FlatList,
  Dimensions,
  Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { COLORS, FONTS, SIZES } from "@/constants/theme";
import { DAILY_QUESTS } from "@/constants/questData";
import { ArrowLeft, Check, X, ChevronRight, ChevronLeft, Zap, Timer } from "lucide-react-native";
import { MCQOption, Card } from "@/features/learning/components";
import { ProgressBar } from "@/features/progress/components";
import { useWindowDimensions } from "react-native";

export const QuestExerciseScreen = () => {
  const { width: windowWidth } = useWindowDimensions();
  const CONTAINER_WIDTH = windowWidth;

  const { questId } = useLocalSearchParams();
  const quest = DAILY_QUESTS.find((q) => q.id === questId) || DAILY_QUESTS[0];
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
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
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

  const handleCheck = () => {
    const currentEx = questions[currentIndex];
    const currentAnswerState = answers[currentIndex];

    if (currentAnswerState.selectedOption === null) return;

    const isCorrect = currentAnswerState.selectedOption === currentEx.correctAnswer;

    const newAnswers = [...answers];
    newAnswers[currentIndex] = {
      ...currentAnswerState,
      hasChecked: true,
      isCorrect: isCorrect,
    };
    setAnswers(newAnswers);

    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
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
        style={[
          styles.pageContainer,
          {
            width: CONTAINER_WIDTH,
            paddingHorizontal: windowWidth > 1200 ? 100 : windowWidth > 800 ? 50 : 20,
          },
        ]}
      >
        <Card style={styles.card}>
          <Text style={styles.questionType}>{item.type.toUpperCase()}</Text>
          <Text style={styles.questionText}>{item.question}</Text>

          <View style={styles.optionsContainer}>
            {item.options.map((option: string, optIdx: number) => {
              const isSelected = currentAnswer.selectedOption === optIdx;
              const isCorrectOption = currentAnswer.hasChecked && optIdx === item.correctAnswer;
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
                      newAnswers[index].selectedOption = optIdx;

                      // Auto Check
                      const isCorrect = optIdx === item.correctAnswer;
                      newAnswers[index].hasChecked = true;
                      newAnswers[index].isCorrect = isCorrect;
                      setAnswers(newAnswers);

                      if (isCorrect) setScore((prev) => prev + 1);

                      // Auto Next after delay
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

          {currentAnswer.hasChecked && (
            <View style={styles.feedbackContainer}>
              <Text style={styles.explanationText}>{item.explanation}</Text>
            </View>
          )}
        </Card>
      </View>
    );
  };

  if (isFinished) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.finishedContainer}>
          <View style={styles.successIcon}>
            <Check size={50} color={COLORS.white} />
          </View>
          <Text style={styles.finishedTitle}>Quest Complete!</Text>
          <Text style={styles.finishedSub}>
            You scored {score} out of {totalQuestions}
          </Text>

          <Card style={styles.xpCard}>
            <Zap size={24} color={COLORS.quaternary} fill={COLORS.quaternary} />
            <Text style={styles.xpText}>+{score * 10} XP Earned</Text>
          </Card>

          <TouchableOpacity style={styles.continueBtn} onPress={() => router.replace("/(tabs)")}>
            <Text style={styles.continueBtnText}>Return Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)"))}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color={COLORS.black} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.topicLabel}>Daily Quest • {quest.title}</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.timerRow}>
              <Timer size={16} color={timeLeft < 30 ? COLORS.error : COLORS.primary} />
              <Text style={[styles.timerText, timeLeft < 30 && { color: COLORS.error }]}>
                {formatTime(timeLeft)}
              </Text>
            </View>
            <Text style={styles.countText}>
              {currentIndex + 1}/{totalQuestions}
            </Text>
          </View>
        </View>
        <ProgressBar
          progress={(currentIndex / totalQuestions) * 100}
          color={COLORS.primary}
          style={styles.headerProgressBar}
        />
      </View>

      <View style={styles.centeredContainer}>
        <FlatList
          ref={flatListRef}
          data={questions}
          renderItem={renderQuestion}
          horizontal
          pagingEnabled
          scrollEnabled={true}
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
          snapToInterval={CONTAINER_WIDTH}
          snapToAlignment="center"
          decelerationRate="fast"
          onScrollToIndexFailed={(info) => {
            const wait = new Promise((resolve) => setTimeout(resolve, 500));
            wait.then(() => {
              flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
            });
          }}
          style={{ flex: 1 }}
        />
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.navButton, currentIndex === 0 && styles.disabledButton]}
          onPress={() => {
            if (currentIndex > 0) {
              flatListRef.current?.scrollToIndex({ index: currentIndex - 1, animated: true });
              setCurrentIndex(currentIndex - 1);
            }
          }}
          disabled={currentIndex === 0}
        >
          <ChevronLeft size={24} color={currentIndex === 0 ? COLORS.lightGray : COLORS.primary} />
          <Text style={[styles.navText, currentIndex === 0 && { color: COLORS.lightGray }]}>
            Previous
          </Text>
        </TouchableOpacity>

        {/* Show Finish button on last question after answering */}
        {currentIndex === totalQuestions - 1 && answers[currentIndex].hasChecked && (
          <TouchableOpacity style={styles.checkButton} onPress={() => finishQuest()}>
            <Text style={styles.checkButtonText}>Finish Quest</Text>
            <ChevronRight size={24} color={COLORS.white} />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    paddingHorizontal: SIZES.padding * 2,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: COLORS.white,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 15,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  timerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
  },
  headerProgressBar: {
    marginVertical: 0,
    height: 12,
  },
  backButton: {
    padding: 5,
  },
  topicLabel: {
    fontSize: 14,
    color: COLORS.gray,
    ...FONTS.medium,
  },
  timerText: {
    marginLeft: 5,
    fontSize: 14,
    ...FONTS.bold,
    color: COLORS.primary,
  },
  countText: {
    fontSize: 14,
    color: COLORS.gray,
    ...FONTS.bold,
  },
  centeredContainer: {
    flex: 1,
    width: "100%",
    alignSelf: "center",
    backgroundColor: "#F8F9FA",
  },
  pageContainer: {
    padding: SIZES.padding,
    justifyContent: "center",
  },
  card: {
    padding: 40,
    minHeight: 500,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  questionType: {
    fontSize: 12,
    color: COLORS.primary,
    marginBottom: 10,
    ...FONTS.bold,
    letterSpacing: 1,
  },
  questionText: {
    fontSize: 22,
    color: COLORS.black,
    marginBottom: 30,
    ...FONTS.bold,
    lineHeight: 30,
  },
  optionsContainer: {
    width: "100%",
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    marginBottom: 12,
    backgroundColor: COLORS.white,
  },
  selectedOption: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + "10",
  },
  correctOption: {
    borderColor: COLORS.success,
    backgroundColor: COLORS.success + "10",
  },
  wrongOption: {
    borderColor: COLORS.error,
    backgroundColor: COLORS.error + "10",
  },
  optionIndex: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.lightGray,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  selectedOptionIndex: {
    backgroundColor: COLORS.primary,
  },
  correctOptionIndex: {
    backgroundColor: COLORS.success,
  },
  wrongOptionIndex: {
    backgroundColor: COLORS.error,
  },
  optionIndexText: {
    fontSize: 14,
    color: COLORS.darkGray,
    ...FONTS.bold,
  },
  selectedOptionIndexText: {
    color: COLORS.white,
  },
  optionText: {
    fontSize: 16,
    color: COLORS.darkGray,
    flex: 1,
    ...FONTS.medium,
  },
  selectedOptionText: {
    color: COLORS.primary,
  },
  correctOptionText: {
    color: COLORS.success,
  },
  wrongOptionText: {
    color: COLORS.error,
  },
  feedbackContainer: {
    marginTop: 20,
    padding: 15,
    borderRadius: 12,
    backgroundColor: COLORS.lightGray + "20",
  },
  explanationText: {
    fontSize: 14,
    color: COLORS.gray,
    ...FONTS.regular,
    lineHeight: 20,
  },
  footer: {
    padding: SIZES.padding,
    backgroundColor: COLORS.white,
    paddingBottom: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  navButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.5,
  },
  navText: {
    fontSize: 16,
    color: COLORS.primary,
    marginLeft: 5,
    ...FONTS.bold,
  },
  checkButton: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    justifyContent: "center",
  },
  checkButtonText: {
    color: COLORS.white,
    fontSize: 18,
    marginRight: 10,
    ...FONTS.bold,
  },
  disabledCheckButton: {
    backgroundColor: COLORS.lightGray,
  },
  finishedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  successIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.success,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  finishedTitle: {
    fontSize: 32,
    ...FONTS.bold,
    color: COLORS.black,
    marginBottom: 10,
  },
  finishedSub: {
    fontSize: 18,
    color: COLORS.gray,
    ...FONTS.medium,
    marginBottom: 40,
  },
  xpCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 25,
    marginBottom: 50,
  },
  xpText: {
    fontSize: 18,
    color: COLORS.quaternary,
    marginLeft: 10,
    ...FONTS.bold,
  },
  continueBtn: {
    backgroundColor: COLORS.primary,
    width: "100%",
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: "center",
  },
  continueBtnText: {
    color: COLORS.white,
    fontSize: 18,
    ...FONTS.bold,
  },
});
