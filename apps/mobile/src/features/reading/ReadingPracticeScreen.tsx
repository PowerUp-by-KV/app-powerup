import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  Modal,
  FlatList,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { COLORS, FONTS, SIZES } from "@/constants/theme";
import { readingData } from "@/constants/readingData";
import { ArrowLeft, Clock, BookOpen, Volume2, ChevronRight, X, Info } from "lucide-react-native";
import { useWindowDimensions } from "react-native";
import { MCQOption } from "@/features/learning/components";

import { useTimeTracker } from "@/hooks/useTimeTracker";

export const ReadingPracticeScreen = () => {
  useTimeTracker("reading");
  const { width: windowWidth } = useWindowDimensions();
  const CONTAINER_WIDTH = windowWidth;
  const { readingId: initialId = "r1" } = useLocalSearchParams();

  const initialIndex = readingData.findIndex((r) => r.id === initialId);
  const [activeIndex, setActiveIndex] = useState(initialIndex !== -1 ? initialIndex : 0);

  // Track state for each passage
  const [passageStates, setPassageStates] = useState(
    readingData.map((r) => ({
      currentQuestionIndex: 0,
      selectedOption: null,
      score: 0,
      isFinished: false,
    })),
  );

  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [selectedWord, setSelectedWord] = useState(null);
  const [showVocabModal, setShowVocabModal] = useState(false);

  const timerRef = useRef(null);
  const flatListRef = useRef(null);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const currentPassage = readingData[activeIndex];
  const currentState = passageStates[activeIndex];

  const handleAnswer = (option, passageIndex) => {
    const pData = readingData[passageIndex];
    const pState = passageStates[passageIndex];
    const currentQuestion = pData.questions[pState.currentQuestionIndex];

    const newStates = [...passageStates];
    newStates[passageIndex].selectedOption = option;
    setPassageStates(newStates);

    setTimeout(() => {
      let newScore = pState.score;
      if (option === currentQuestion.answer) {
        newScore += 1;
      }

      const updatedStates = [...passageStates];
      if (pState.currentQuestionIndex < pData.questions.length - 1) {
        updatedStates[passageIndex] = {
          ...updatedStates[passageIndex],
          currentQuestionIndex: pState.currentQuestionIndex + 1,
          selectedOption: null,
          score: newScore,
        };
      } else {
        // Last question: update score but don't finish yet
        updatedStates[passageIndex] = {
          ...updatedStates[passageIndex],
          score: newScore,
        };
      }
      setPassageStates(updatedStates);
    }, 1200);
  };

  const handleWordTap = (word, passageIndex) => {
    const vocab = readingData[passageIndex].vocabulary;
    const vocabItem = vocab.find((v) => v.word.toLowerCase().includes(word.toLowerCase()));
    if (vocabItem) {
      setSelectedWord(vocabItem);
      setShowVocabModal(true);
    }
  };

  const renderParagraph = (text, vocab, passageIndex) => {
    const words = text.split(" ");
    return words.map((word, index) => {
      const cleanWord = word.replace(/[.,!?;:]/g, "");
      const isVocab = vocab.some((v) => v.word.toLowerCase().includes(cleanWord.toLowerCase()));

      return (
        <Text
          key={index}
          style={[styles.paragraphText, isVocab && styles.highlightedWord]}
          onPress={() => isVocab && handleWordTap(cleanWord, passageIndex)}
        >
          {word}{" "}
        </Text>
      );
    });
  };

  const renderPassagePage = ({ item: passage, index: passageIndex }) => {
    const state = passageStates[passageIndex];
    const currentQuestion = passage.questions[state.currentQuestionIndex];
    const totalQuestions = passage.questions.length;

    if (state.isFinished) {
      return (
        <View style={[styles.pageContainer, { width: CONTAINER_WIDTH }]}>
          <View style={styles.finishedCard}>
            <BookOpen size={60} color={COLORS.primary} />
            <Text style={styles.finishedTitle}>Passage Completed!</Text>
            <Text style={styles.finishedScore}>
              Score: {state.score}/{totalQuestions}
            </Text>
            <TouchableOpacity
              style={styles.resultsButton}
              onPress={() =>
                router.replace({
                  pathname: "/ReadingResult",
                  params: {
                    readingId: passage.id,
                    title: passage.title,
                    score: state.score,
                    totalQuestions: totalQuestions,
                    time: timer,
                  },
                })
              }
            >
              <Text style={styles.resultsButtonText}>View Overall Results</Text>
            </TouchableOpacity>
            {passageIndex < readingData.length - 1 && (
              <Text style={styles.swipeHint}>Swipe left for next passage →</Text>
            )}
          </View>
        </View>
      );
    }

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
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.passageCard}>
            <Text style={styles.passageHeader}>Read the passage</Text>
            <Text style={styles.paragraphContainer}>
              {renderParagraph(passage.paragraph, passage.vocabulary, passageIndex)}
            </Text>
          </View>

          <View style={styles.questionSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressText}>
                Question {state.currentQuestionIndex + 1}/{totalQuestions}
              </Text>
            </View>

            <Text style={styles.questionText}>{currentQuestion.question}</Text>

            <View style={styles.optionsContainer}>
              {currentQuestion.options.map((option, optIdx) => {
                const isSelected = state.selectedOption === option;
                const isCorrect = option === currentQuestion.answer;
                const showFeedback = !!state.selectedOption;

                return (
                  <MCQOption
                    key={optIdx}
                    label={String.fromCharCode(65 + optIdx)}
                    text={option}
                    isSelected={isSelected}
                    isCorrect={showFeedback && isCorrect}
                    isWrong={showFeedback && isSelected && !isCorrect}
                    disabled={showFeedback}
                    onPress={() => !state.selectedOption && handleAnswer(option, passageIndex)}
                  />
                );
              })}
            </View>

            {/* Manual Finish button for the last question */}
            {state.selectedOption && state.currentQuestionIndex === totalQuestions - 1 && (
              <TouchableOpacity
                style={[
                  styles.resultsButton,
                  { marginTop: 30, alignSelf: "center", width: "100%" },
                ]}
                onPress={() => {
                  const finalStates = [...passageStates];
                  finalStates[passageIndex].isFinished = true;
                  setPassageStates(finalStates);
                }}
              >
                <Text style={styles.resultsButtonText}>Finish Passage</Text>
                <ChevronRight size={20} color={COLORS.white} />
              </TouchableOpacity>
            )}
          </View>
          <View style={{ height: 100 }} />
        </ScrollView>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)"))}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={COLORS.black} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <View style={{ flex: 1 }}>
            <Text style={styles.topicLabel}>Reading • Practice</Text>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {currentPassage.title}
            </Text>
          </View>
          <View style={styles.timerContainer}>
            <Clock size={16} color={COLORS.primary} />
            <Text style={styles.timerText}>{formatTime(timer)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.centeredContainer}>
        <FlatList
          ref={flatListRef}
          data={readingData}
          renderItem={renderPassagePage}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / CONTAINER_WIDTH);
            if (index !== activeIndex) {
              setActiveIndex(index);
            }
          }}
          getItemLayout={(_, index) => ({
            length: CONTAINER_WIDTH,
            offset: CONTAINER_WIDTH * index,
            index,
          })}
          initialScrollIndex={initialIndex}
        />
      </View>

      {/* Vocabulary Modal */}
      <Modal
        visible={showVocabModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowVocabModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.vocabModalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.vocabBadge}>
                <BookOpen size={16} color={COLORS.white} />
                <Text style={styles.vocabBadgeText}>Vocabulary</Text>
              </View>
              <TouchableOpacity onPress={() => setShowVocabModal(false)}>
                <X size={24} color={COLORS.gray} />
              </TouchableOpacity>
            </View>

            {selectedWord && (
              <View>
                <View style={styles.wordRow}>
                  <Text style={styles.wordTitle}>{selectedWord.word}</Text>
                  <View style={styles.posTag}>
                    <Text style={styles.posText}>{selectedWord.pos}</Text>
                  </View>
                </View>

                <Text style={styles.pronunciationText}>{selectedWord.pronunciation}</Text>

                <View style={styles.divider} />

                <View style={styles.vocabDetail}>
                  <Text style={styles.vocabLabel}>Meaning:</Text>
                  <Text style={styles.vocabMeaning}>{selectedWord.meaning}</Text>
                </View>

                <View style={styles.vocabDetail}>
                  <Text style={styles.vocabLabel}>Example:</Text>
                  <Text style={styles.vocabExample}>"{selectedWord.example}"</Text>
                </View>

                <TouchableOpacity
                  style={styles.gotItButton}
                  onPress={() => setShowVocabModal(false)}
                >
                  <Text style={styles.gotItText}>Got it!</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  pageContainer: {
    flex: 1,
  },
  finishedCard: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
    backgroundColor: COLORS.white,
  },
  finishedTitle: {
    fontSize: 24,
    color: COLORS.black,
    ...FONTS.bold,
    marginTop: 20,
  },
  finishedScore: {
    fontSize: 18,
    color: COLORS.primary,
    ...FONTS.bold,
    marginVertical: 10,
  },
  resultsButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 15,
    marginTop: 20,
  },
  resultsButtonText: {
    color: COLORS.white,
    ...FONTS.bold,
  },
  swipeHint: {
    marginTop: 40,
    color: COLORS.gray,
    ...FONTS.medium,
  },
  header: {
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
    paddingTop: 60,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
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
  headerInfo: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  topicLabel: {
    fontSize: 10,
    color: COLORS.primary,
    ...FONTS.bold,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 18,
    color: COLORS.black,
    ...FONTS.bold,
  },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary + "15",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  timerText: {
    fontSize: 14,
    color: COLORS.primary,
    marginLeft: 6,
    ...FONTS.bold,
  },
  scrollContent: {
    padding: SIZES.padding,
    paddingBottom: 40,
  },
  passageCard: {
    backgroundColor: COLORS.white,
    padding: 25,
    borderRadius: 25,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  passageHeader: {
    fontSize: 12,
    color: COLORS.primary,
    ...FONTS.bold,
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  paragraphContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  paragraphText: {
    fontSize: 17,
    color: COLORS.darkGray,
    lineHeight: 28,
    ...FONTS.regular,
  },
  highlightedWord: {
    color: COLORS.secondary,
    ...FONTS.bold,
    textDecorationLine: "underline",
  },
  questionSection: {
    marginTop: 10,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: COLORS.white,
  },
  difficultyText: {
    fontSize: 10,
    ...FONTS.bold,
  },
  progressText: {
    fontSize: 14,
    color: COLORS.gray,
    ...FONTS.medium,
  },
  questionText: {
    fontSize: 22,
    color: COLORS.black,
    marginBottom: 25,
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
    backgroundColor: COLORS.white,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  selectedOption: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + "05",
  },
  optionIndex: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  selectedOptionIndex: {
    backgroundColor: COLORS.primary,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  vocabModalCard: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 30,
    minHeight: 350,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },
  vocabBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  vocabBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    marginLeft: 8,
    ...FONTS.bold,
  },
  wordRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  wordTitle: {
    fontSize: 28,
    color: COLORS.black,
    ...FONTS.bold,
    marginRight: 15,
  },
  posTag: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 5,
  },
  posText: {
    fontSize: 12,
    color: COLORS.gray,
    fontStyle: "italic",
    ...FONTS.medium,
  },
  pronunciationText: {
    fontSize: 16,
    color: COLORS.gray,
    marginBottom: 20,
    ...FONTS.regular,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.lightGray,
    marginBottom: 20,
  },
  vocabDetail: {
    marginBottom: 20,
  },
  vocabLabel: {
    fontSize: 14,
    color: COLORS.primary,
    ...FONTS.bold,
    marginBottom: 5,
  },
  vocabMeaning: {
    fontSize: 16,
    color: COLORS.darkGray,
    lineHeight: 22,
    ...FONTS.medium,
  },
  vocabExample: {
    fontSize: 16,
    color: COLORS.gray,
    fontStyle: "italic",
    lineHeight: 22,
    ...FONTS.regular,
  },
  gotItButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 10,
  },
  gotItText: {
    color: COLORS.white,
    fontSize: 16,
    ...FONTS.bold,
  },
  correctOption: {
    borderColor: COLORS.success,
    backgroundColor: COLORS.success + "10",
  },
  wrongOption: {
    borderColor: COLORS.error,
    backgroundColor: COLORS.error + "10",
  },
  correctOptionIndex: {
    backgroundColor: COLORS.success,
  },
  wrongOptionIndex: {
    backgroundColor: COLORS.error,
  },
  correctOptionText: {
    color: COLORS.success,
    ...FONTS.bold,
  },
  wrongOptionText: {
    color: COLORS.error,
    ...FONTS.bold,
  },
  centeredContainer: {
    flex: 1,
    width: "100%",
    alignSelf: "center",
  },
});

// export default ReadingPracticeScreen;
