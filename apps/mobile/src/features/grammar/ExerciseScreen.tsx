import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  FlatList,
  ActivityIndicator,
  ScrollView,
  useWindowDimensions,
  Dimensions,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { COLORS, FONTS, SIZES } from "@/constants/theme";
import { grammarTopics } from "@/constants/grammarData";
import { EXERCISES as MOCK_EXERCISES } from "@/constants/mockData";
import { ArrowLeft, Check, X, ChevronRight, ChevronLeft, Zap } from "lucide-react-native";

import { useAppContext } from "@/features/learning/hooks/AppContext";
import { Card, MCQOption } from "@/features/learning/components";
import { ProgressBar } from "@/features/progress/components";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

import { useTimeTracker } from "@/hooks/useTimeTracker";
// MCQOption moved to learning components above

export const ExerciseScreen = () => {
  useTimeTracker("grammar");
  const { width: windowWidth } = useWindowDimensions();
  const CONTAINER_WIDTH = windowWidth; // Fill the screen
  const { lessonId, lessonTitle } = useLocalSearchParams();
  const { updateLessonCompletion } = useAppContext();

  // Find exercises in hierarchical grammarData
  let lessonExercises = [];
  let topicTitle = "";
  let chapterTitle = "";

  const safeTopics = grammarTopics || [];
  safeTopics.forEach((topic) => {
    if (topic && topic.chapters) {
      topic.chapters.forEach((chapter) => {
        if (chapter && chapter.subtopics) {
          const subtopic = chapter.subtopics.find((st) => st.id === lessonId);
          if (subtopic) {
            lessonExercises = subtopic.exercises || [];
            topicTitle = topic.title || "";
            chapterTitle = chapter.title || "";
          }
        }
      });
    }
  });

  // Fallback to old exercises if not found in new grammarData (for non-grammar lessons)
  if (lessonExercises.length === 0) {
    const fallbackList =
      MOCK_EXERCISES && MOCK_EXERCISES.length > 0 ? MOCK_EXERCISES[0].questions : [];
    lessonExercises =
      MOCK_EXERCISES && MOCK_EXERCISES.find
        ? MOCK_EXERCISES.find((e) => e.lessonId === lessonId)?.questions || fallbackList
        : fallbackList;
  }

  const totalQuestions = lessonExercises.length;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);

  // Track state for EACH question
  const [answers, setAnswers] = useState(() =>
    (lessonExercises || []).map(() => ({
      selectedOption: null,
      hasChecked: false,
      isCorrect: null,
    })),
  );
  const [prevLessonId, setPrevLessonId] = useState(lessonId);

  // Synchronously update state if the lesson route param changes OR if the arrays got out of sync
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

  const flatListRef = useRef(null);
  const progress = totalQuestions > 0 ? ((currentIndex + 1) / totalQuestions) * 100 : 0;

  const handleCheck = () => {
    const currentEx = lessonExercises[currentIndex];
    const currentAnswerState = answers[currentIndex];

    if (currentAnswerState.selectedOption === null) return;

    const correctValue =
      typeof currentEx.answer === "string"
        ? currentEx.answer
        : currentEx.options[currentEx.correctAnswer];

    const selectedValue = currentEx.options[currentAnswerState.selectedOption];
    const correct = selectedValue === correctValue;

    const newAnswers = [...answers];
    newAnswers[currentIndex] = {
      ...currentAnswerState,
      hasChecked: true,
      isCorrect: correct,
    };
    setAnswers(newAnswers);

    if (correct) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
      setCurrentIndex(currentIndex + 1);
    } else {
      finishLesson();
    }
  };

  const finishLesson = () => {
    // Find topicId for this lesson
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
    let topicIdx = -1,
      chapIdx = -1,
      subIdx = -1;
    grammarTopics.forEach((t, ti) => {
      t.chapters.forEach((c, ci) => {
        const found = c.subtopics.findIndex((st) => st.id === lessonId);
        if (found !== -1) {
          topicIdx = ti;
          chapIdx = ci;
          subIdx = found;
        }
      });
    });

    if (topicIdx === -1) {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace("/(tabs)");
      }
      return;
    }

    const currentTopic = grammarTopics[topicIdx];
    const currentChapter = currentTopic.chapters[chapIdx];

    if (subIdx < currentChapter.subtopics.length - 1) {
      router.replace({
        pathname: "/GrammarContent",
        params: { subtopic: JSON.stringify(currentChapter.subtopics[subIdx + 1]) },
      });
      return;
    }

    if (chapIdx < currentTopic.chapters.length - 1) {
      const nextChapter = currentTopic.chapters[chapIdx + 1];
      if (nextChapter.subtopics.length > 0) {
        router.replace({
          pathname: "/GrammarContent",
          params: { subtopic: JSON.stringify(nextChapter.subtopics[0]) },
        });
        return;
      }
    }

    if (topicIdx < grammarTopics.length - 1) {
      const nextTopic = grammarTopics[topicIdx + 1];
      if (nextTopic.chapters.length > 0 && nextTopic.chapters[0].subtopics.length > 0) {
        router.replace({
          pathname: "/GrammarContent",
          params: { subtopic: JSON.stringify(nextTopic.chapters[0].subtopics[0]) },
        });
        return;
      }
    }

    router.replace("/(tabs)");
  };

  const renderQuestion = ({ item, index }) => {
    const currentAnswer = answers && answers[index];

    if (!currentAnswer || !item)
      return <View style={[styles.pageContainer, { width: CONTAINER_WIDTH }]} />;

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
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.cardScroll}>
          <Card style={styles.card}>
            <Text style={styles.questionType}>
              {(item.type || "question").replace(/[-_]/g, " ").toUpperCase()}
            </Text>
            <Text style={styles.questionText}>{item.question}</Text>

            <View style={styles.optionsContainer}>
              {item.options.map((option, optIdx) => {
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
                        newAnswers[index].selectedOption = optIdx;

                        // Calculate correctness immediately
                        const correctValue =
                          typeof item.answer === "string"
                            ? item.answer
                            : item.options[item.correctAnswer];
                        const selectedValue = item.options[optIdx];
                        const isCorrect = selectedValue === correctValue;

                        newAnswers[index].hasChecked = true;
                        newAnswers[index].isCorrect = isCorrect;
                        setAnswers(newAnswers);

                        if (isCorrect) setScore((prev) => prev + 1);

                        // Auto-advance after delay
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
                <View
                  style={[
                    styles.feedbackLabel,
                    {
                      backgroundColor: currentAnswer.isCorrect
                        ? COLORS.success + "20"
                        : COLORS.error + "20",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.feedbackLabelText,
                      { color: currentAnswer.isCorrect ? COLORS.success : COLORS.error },
                    ]}
                  >
                    {currentAnswer.isCorrect ? "Correct!" : "Incorrect"}
                  </Text>
                </View>
                <Text style={styles.explanationText}>{item.explanation}</Text>
              </View>
            )}
          </Card>
        </ScrollView>
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
          <Text style={styles.finishedTitle}>Lesson Complete!</Text>
          <Text style={styles.finishedSub}>
            You scored {score} out of {totalQuestions}
          </Text>

          <Card style={styles.xpCard}>
            <Zap size={24} color={COLORS.quaternary} fill={COLORS.quaternary} />
            <Text style={styles.xpText}>+50 XP Earned</Text>
          </Card>

          <TouchableOpacity style={styles.continueBtn} onPress={handleContinue}>
            <Text style={styles.continueBtnText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)"))}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color={COLORS.black} />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.topicLabel}>Grammar Practice</Text>
          </View>
          <Text style={styles.countText}>
            {currentIndex + 1}/{totalQuestions}
          </Text>
        </View>
        <ProgressBar progress={progress} color={COLORS.primary} style={styles.headerProgressBar} />
      </View>

      {lessonExercises.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No questions found for this lesson.</Text>
          <TouchableOpacity
            style={styles.backButtonLarge}
            onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)"))}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.centeredContainer}>
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
            style={{ flex: 1 }}
          />
        </View>
      )}

      {/* Footer Navigation */}
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

        {/* Manual Finish button for the last question if needed, but we'll stick to auto for now */}
        {currentIndex === totalQuestions - 1 && answers[currentIndex]?.hasChecked && (
          <TouchableOpacity style={styles.checkButton} onPress={finishLesson}>
            <Text style={styles.checkButtonText}>Finish</Text>
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
    backgroundColor: "#F8F9FA", // Matching the reference image background
  },
  header: {
    paddingHorizontal: SIZES.padding * 2,
    paddingTop: 50,
    backgroundColor: COLORS.white,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  titleContainer: {
    flex: 1,
    marginLeft: 15,
  },
  headerProgressBar: {
    marginVertical: 0,
    height: 12,
  },
  backButton: {
    marginRight: 15,
  },
  progressHeader: {
    flex: 1,
    marginRight: 15,
  },
  lessonTitle: {
    fontSize: 18,
    color: COLORS.black,
    ...FONTS.bold,
    marginBottom: 5,
  },
  topicLabel: {
    fontSize: 14,
    color: COLORS.gray,
    ...FONTS.medium,
  },
  countText: {
    fontSize: 14,
    color: COLORS.primary,
    ...FONTS.bold,
  },
  finishedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
    backgroundColor: COLORS.white,
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
    color: COLORS.black,
    ...FONTS.bold,
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
  disabledCheckButton: {
    backgroundColor: COLORS.lightGray,
  },
  pageContainer: {
    flex: 1,
    overflow: "hidden",
  },
  cardScroll: {
    padding: SIZES.padding,
    justifyContent: "center",
    flexGrow: 1,
  },
  cardContainer: {
    flex: 1,
  },
  card: {
    minHeight: 500,
    width: "100%",
    padding: 40, // More spacious padding
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
    borderRadius: 15,
    backgroundColor: COLORS.background,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  feedbackLabel: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  feedbackLabelText: {
    fontSize: 12,
    ...FONTS.bold,
  },
  explanationText: {
    fontSize: 14,
    color: COLORS.darkGray,
    ...FONTS.regular,
    lineHeight: 20,
  },
  footer: {
    padding: SIZES.padding,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.white,
    paddingBottom: 40,
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
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
  },
  checkButtonText: {
    color: COLORS.white,
    fontSize: 16,
    marginRight: 10,
    ...FONTS.bold,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  emptyText: {
    fontSize: 18,
    color: COLORS.gray,
    ...FONTS.medium,
    marginBottom: 20,
    textAlign: "center",
  },
  backButtonLarge: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  backButtonText: {
    color: COLORS.white,
    ...FONTS.bold,
    fontSize: 16,
  },
  centeredContainer: {
    flex: 1,
    width: "100%",
    alignSelf: "center",
  },
});

// export default ExerciseScreen;
