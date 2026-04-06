import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Modal,
  FlatList,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { readingData } from "@/constants/readingData";
import { ArrowLeft, Clock, BookOpen, ChevronRight, X } from "lucide-react-native";
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

  const [passageStates, setPassageStates] = useState(
    readingData.map(() => ({
      currentQuestionIndex: 0,
      selectedOption: null,
      score: 0,
      isFinished: false,
    })),
  );

  const [timer, setTimer] = useState(0);
  const [isRunning] = useState(true);
  const [selectedWord, setSelectedWord] = useState<any>(null);
  const [showVocabModal, setShowVocabModal] = useState(false);

  const timerRef = useRef<any>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const currentPassage = readingData[activeIndex] || readingData[0];

  const handleAnswer = (option: string, passageIndex: number) => {
    const pData = readingData[passageIndex] || readingData[0];
    const pState = passageStates[passageIndex] || passageStates[0];
    const currentQuestion = pData.questions[pState.currentQuestionIndex] || pData.questions[0];

    const newStates = [...passageStates];
    (newStates[passageIndex] as any).selectedOption = option;
    setPassageStates(newStates);

    setTimeout(() => {
      let newScore = pState.score;
      if (option === currentQuestion.answer) {
        newScore += 1;
      }

      const updatedStates = [...passageStates];
      if (pState.currentQuestionIndex < (pData?.questions?.length || 0) - 1) {
        (updatedStates[passageIndex] as any) = {
          ...updatedStates[passageIndex],
          currentQuestionIndex: pState.currentQuestionIndex + 1,
          selectedOption: null,
          score: newScore,
        };
      } else {
        (updatedStates[passageIndex] as any) = {
          ...updatedStates[passageIndex],
          score: newScore,
        };
      }
      setPassageStates(updatedStates);
    }, 1200);
  };

  const handleWordTap = (word: string, passageIndex: number) => {
    const vocab = readingData[passageIndex].vocabulary;
    const vocabItem = vocab.find((v) => v.word.toLowerCase().includes(word.toLowerCase()));
    if (vocabItem) {
      setSelectedWord(vocabItem);
      setShowVocabModal(true);
    }
  };

  const renderParagraph = (text: string, vocab: any[], passageIndex: number) => {
    const words = text.split(" ");
    return words.map((word, index) => {
      const cleanWord = word.replace(/[.,!?;:]/g, "");
      const isVocab = vocab.some((v) => v.word.toLowerCase().includes(cleanWord.toLowerCase()));

      return (
        <Text
          key={index}
          className={`text-[17px] leading-[28px] ${isVocab ? "text-[#EC4899] font-bold underline" : "text-[#475569] font-normal"}`}
          onPress={() => isVocab && handleWordTap(cleanWord, passageIndex)}
        >
          {word}{" "}
        </Text>
      );
    });
  };

  const renderPassagePage = ({
    item: passage,
    index: passageIndex,
  }: {
    item: any;
    index: number;
  }) => {
    const state = passageStates[passageIndex] || passageStates[0];
    const currentQuestion = passage.questions[state.currentQuestionIndex] || passage.questions[0];
    const totalQuestions = passage.questions.length;

    if (state?.isFinished) {
      return (
        <View
          style={{ width: CONTAINER_WIDTH }}
          className="flex-1 justify-center items-center p-[30px] bg-white"
        >
          <BookOpen size={60} color="#6366F1" />
          <Text className="text-2xl text-black font-bold mt-5">Passage Completed!</Text>
          <Text className="text-lg text-[#6366F1] font-bold my-2.5">
            Score: {state?.score || 0}/{totalQuestions}
          </Text>
          <TouchableOpacity
            className="bg-[#6366F1] py-[15px] px-[30px] rounded-[15px] mt-5"
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
            <Text className="text-white font-bold">View Overall Results</Text>
          </TouchableOpacity>
          {passageIndex < readingData.length - 1 && (
            <Text className="mt-10 text-[#64748B] font-medium">Swipe left for next passage →</Text>
          )}
        </View>
      );
    }

    if (!state || !currentQuestion) return null;

    return (
      <View
        style={{ width: CONTAINER_WIDTH }}
        className={`flex-1 ${windowWidth > 1200 ? "px-[100px]" : windowWidth > 800 ? "px-[50px]" : "px-5"}`}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40, paddingTop: 20 }}
        >
          <View className="bg-white p-[25px] rounded-[25px] mb-5 shadow-sm shadow-black/5 elevation-2">
            <Text className="text-[12px] text-[#6366F1] font-bold mb-2.5 uppercase tracking-widest">
              Read the passage
            </Text>
            <View className="flex-row flex-wrap">
              {renderParagraph(passage.paragraph, passage.vocabulary, passageIndex)}
            </View>
          </View>

          <View className="mt-2.5">
            <View className="flex-row justify-between items-center mb-[15px]">
              <Text className="text-sm text-[#64748B] font-medium">
                Question {state.currentQuestionIndex + 1}/{totalQuestions}
              </Text>
            </View>

            <Text className="text-[22px] text-black mb-[25px] font-bold leading-[30px]">
              {currentQuestion.question}
            </Text>

            <View className="w-full">
              {currentQuestion.options.map((option: string, optIdx: number) => {
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

            {state.selectedOption && state.currentQuestionIndex === totalQuestions - 1 && (
              <TouchableOpacity
                className="bg-[#6366F1] flex-row justify-center items-center py-[15px] px-[30px] rounded-[15px] mt-[30px] w-full"
                onPress={() => {
                  const finalStates = [...passageStates];
                  (finalStates[passageIndex] as any).isFinished = true;
                  setPassageStates(finalStates);
                }}
              >
                <Text className="text-white font-bold mr-2">Finish Passage</Text>
                <ChevronRight size={20} color="white" />
              </TouchableOpacity>
            )}
          </View>
          <View className="h-[100px]" />
        </ScrollView>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FA]">
      <View className="bg-white p-5 pt-[60px] flex-row items-center border-b border-[#F1F5F9]">
        <TouchableOpacity
          onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)"))}
          className="w-10 h-10 rounded-full bg-[#F8F9FA] justify-center items-center mr-[15px]"
        >
          <ArrowLeft size={24} color="black" />
        </TouchableOpacity>
        <View className="flex-1 flex-row justify-between items-center">
          <View className="flex-1">
            <Text className="text-[10px] text-[#6366F1] font-bold uppercase tracking-widest mb-0.5">
              Reading • Practice
            </Text>
            <Text className="text-[18px] text-black font-bold" numberOfLines={1}>
              {currentPassage?.title || "Reading Passage"}
            </Text>
          </View>
          <View className="flex-row items-center bg-[#6366F1]/10 px-3 py-1.5 rounded-[20px]">
            <Clock size={16} color="#6366F1" />
            <Text className="text-sm text-[#6366F1] ml-1.5 font-bold">{formatTime(timer)}</Text>
          </View>
        </View>
      </View>

      <View className="flex-1 w-full self-center">
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
          initialScrollIndex={initialIndex !== -1 ? initialIndex : 0}
        />
      </View>

      <Modal
        visible={showVocabModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowVocabModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-[30px] p-[30px] min-h-[350px]">
            <View className="flex-row justify-between items-center mb-[25px]">
              <View className="flex-row items-center bg-[#EC4899] px-[15px] py-2 rounded-full">
                <BookOpen size={16} color="white" />
                <Text className="text-white text-[12px] ml-2 font-bold">Vocabulary</Text>
              </View>
              <TouchableOpacity onPress={() => setShowVocabModal(false)}>
                <X size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            {selectedWord && (
              <View>
                <View className="flex-row items-center mb-1.25">
                  <Text className="text-[28px] text-black font-bold mr-[15px]">
                    {selectedWord.word}
                  </Text>
                  <View className="bg-[#F8F9FA] px-2.5 py-0.5 rounded-[5px]">
                    <Text className="text-[12px] text-[#64748B] italic font-medium">
                      {selectedWord.pos}
                    </Text>
                  </View>
                </View>

                <Text className="text-base text-[#64748B] mb-5 font-normal">
                  {selectedWord.pronunciation}
                </Text>

                <View className="h-[1px] bg-[#F1F5F9] mb-5" />

                <View className="mb-5">
                  <Text className="text-sm text-[#6366F1] font-bold mb-1.25">Meaning:</Text>
                  <Text className="text-base text-[#475569] leading-[22px] font-medium">
                    {selectedWord.meaning}
                  </Text>
                </View>

                <View className="mb-5">
                  <Text className="text-sm text-[#6366F1] font-bold mb-1.25">Example:</Text>
                  <Text className="text-base text-[#64748B] italic leading-[22px] font-normal">
                    "{selectedWord.example}"
                  </Text>
                </View>

                <TouchableOpacity
                  className="bg-[#6366F1] py-[15px] rounded-[15px] items-center mt-2.5"
                  onPress={() => setShowVocabModal(false)}
                >
                  <Text className="text-white text-base font-bold">Got it!</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// export default ReadingPracticeScreen;
