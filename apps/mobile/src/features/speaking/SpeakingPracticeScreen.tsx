import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Easing,
  FlatList,
  useWindowDimensions,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { COLORS, FONTS, SIZES } from "@/constants/theme";
import { speakingPrompts, speakingCategories } from "@/constants/verbalData";
import { ArrowLeft, Mic, StopCircle, RotateCcw, Play, CheckCircle } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Audio } from "expo-av";
// import { apiService } from '@/services/api';
const apiService = {
  uploadVerbalAudio: async (uri: string, id: string) => {
    console.log("Uploading audio...", uri, id);
    return { success: true };
  },
};

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const SpeakingPage = ({
  item,
  isActive,
  category,
  isSwipingDisabled,
  setIsSwipingDisabled,
  width,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(item.timeLimit);
  const [isFinished, setIsFinished] = useState(false);
  const [recording, setRecording] = useState(null);
  const [audioUri, setAudioUri] = useState(null);

  const bars = Array(15)
    .fill(0)
    .map(() => useRef(new Animated.Value(10)).current);
  const micScale = useRef(new Animated.Value(1)).current;
  const timerRef = useRef(null);

  useEffect(() => {
    if (isRecording) {
      setIsSwipingDisabled(true);
      // Pulse mic
      Animated.loop(
        Animated.sequence([
          Animated.timing(micScale, {
            toValue: 1.2,
            duration: 600,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(micScale, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
        ]),
      ).start();

      // Animate bars
      bars.forEach((bar) => {
        const animateBar = () => {
          Animated.sequence([
            Animated.timing(bar, {
              toValue: Math.random() * 50 + 10,
              duration: 150 + Math.random() * 100,
              useNativeDriver: false,
            }),
            Animated.timing(bar, {
              toValue: 10,
              duration: 150 + Math.random() * 100,
              useNativeDriver: false,
            }),
          ]).start(() => {
            if (isRecording) animateBar();
          });
        };
        animateBar();
      });

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleStopRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setIsSwipingDisabled(false);
      micScale.stopAnimation();
      micScale.setValue(1);
      bars.forEach((bar) => {
        bar.stopAnimation();
        bar.setValue(10);
      });
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const handleStartRecording = async () => {
    try {
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );
      setRecording(recording);
      setIsRecording(true);
      setIsFinished(false);
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  };

  const handleStopRecording = async () => {
    setIsRecording(false);
    setIsFinished(true);
    try {
      if (recording) {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        setAudioUri(uri);
        try {
          await apiService.uploadVerbalAudio(uri, item.id);
        } catch (uploadError) {
          console.log("Backend offline - continuing");
        }
        router.replace({
          pathname: "/SpeechAnalysis",
          params: { promptId: item.id, duration: item.timeLimit - timeLeft, audioUri: uri },
        });
      }
    } catch (error) {
      console.error("Failed to stop recording", error);
      setIsFinished(false);
    }
  };

  const { width: windowWidth } = useWindowDimensions();

  return (
    <View
      style={[
        styles.pageContainer,
        {
          width: width,
          paddingHorizontal: windowWidth > 1200 ? 100 : windowWidth > 800 ? 50 : 20,
        },
      ]}
    >
      <View style={styles.pageContent}>
        <View style={styles.promptCard}>
          <Text style={styles.promptLabel}>SPEAKING PROMPT</Text>
          <Text style={styles.promptText}>{item.prompt}</Text>
        </View>

        <View style={styles.visualSection}>
          <View style={styles.timerCircle}>
            <Text style={[styles.timerValue, timeLeft < 10 && { color: COLORS.error }]}>
              {timeLeft < 10 ? `0${timeLeft}` : timeLeft}
            </Text>
            <Text style={styles.timerLabel}>Seconds Remaining</Text>
          </View>
          <View style={styles.waveformContainer}>
            {bars.map((bar, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.waveBar,
                  { height: bar, backgroundColor: isRecording ? COLORS.primary : COLORS.gray },
                ]}
              />
            ))}
          </View>
        </View>

        <View style={styles.controlSection}>
          {!isFinished ? (
            <View style={styles.micContainer}>
              <Animated.View
                style={[
                  styles.micPulse,
                  { transform: [{ scale: micScale }], opacity: isRecording ? 0.3 : 0 },
                ]}
              />
              <TouchableOpacity
                style={[styles.micButton, isRecording && { backgroundColor: COLORS.error }]}
                onPress={isRecording ? handleStopRecording : handleStartRecording}
                activeOpacity={0.8}
              >
                {isRecording ? (
                  <StopCircle size={40} color={COLORS.white} />
                ) : (
                  <Mic size={40} color={COLORS.white} />
                )}
              </TouchableOpacity>
              <Text style={styles.instructionText}>
                {isRecording ? "Tap to stop" : "Tap to start"}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
};

import { useTimeTracker } from "@/hooks/useTimeTracker";

export const SpeakingPracticeScreen = () => {
  useTimeTracker("verbal");
  const { categoryId, promptData: passedPromptRaw } = useLocalSearchParams();
  const passedPrompt =
    typeof passedPromptRaw === "string" ? JSON.parse(passedPromptRaw) : passedPromptRaw;

  const filteredPrompts = categoryId
    ? speakingPrompts.filter((p) => p.categoryId === categoryId)
    : speakingPrompts;

  let initialIndex = 0;
  if (passedPrompt) {
    initialIndex = filteredPrompts.findIndex((p) => p.id === passedPrompt.id);
  } else if (!categoryId && passedPrompt) {
    // handle edge case
  }

  const { width: windowWidth } = useWindowDimensions();
  const CONTAINER_WIDTH = windowWidth;
  const [activeIndex, setActiveIndex] = useState(initialIndex !== -1 ? initialIndex : 0);
  const [isSwipingDisabled, setIsSwipingDisabled] = useState(false);
  const flatListRef = useRef(null);

  const currentPrompt = filteredPrompts[activeIndex];
  const category =
    speakingCategories.find((c) => c.id === currentPrompt.categoryId) || speakingCategories[0];

  useEffect(() => {
    const requestPermissions = async () => {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") {
        alert("Permission to access microphone is required for this feature.");
      }
    };
    requestPermissions();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)"))}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={COLORS.black} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.topicLabel}>Speaking • {category.title}</Text>
          <Text style={styles.headerTitle}>Practice Mode</Text>
          <Text style={styles.headerSubtitle}>
            Prompt {activeIndex + 1} of {filteredPrompts.length}
          </Text>
        </View>
      </View>

      <View style={styles.centeredContainer}>
        <FlatList
          ref={flatListRef}
          data={filteredPrompts}
          renderItem={({ item, index }) => (
            <SpeakingPage
              item={item}
              isActive={index === activeIndex}
              category={category}
              isSwipingDisabled={isSwipingDisabled}
              setIsSwipingDisabled={setIsSwipingDisabled}
              width={CONTAINER_WIDTH}
            />
          )}
          horizontal
          pagingEnabled
          scrollEnabled={!isSwipingDisabled}
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
  pageContent: {
    flex: 1,
    padding: SIZES.padding,
    justifyContent: "space-between",
  },
  header: {
    padding: SIZES.padding,
    paddingTop: 60,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
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
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 15,
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
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.gray,
    ...FONTS.medium,
  },
  difficultyBadge: {
    backgroundColor: COLORS.primary + "15",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  difficultyText: {
    fontSize: 12,
    color: COLORS.primary,
    ...FONTS.bold,
  },
  content: {
    flex: 1,
    padding: SIZES.padding,
    justifyContent: "space-between",
  },
  promptCard: {
    backgroundColor: COLORS.white,
    padding: 25,
    borderRadius: 25,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  promptLabel: {
    fontSize: 12,
    color: COLORS.primary,
    ...FONTS.bold,
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  promptText: {
    fontSize: 20,
    color: COLORS.black,
    ...FONTS.bold,
    lineHeight: 28,
  },
  visualSection: {
    alignItems: "center",
    justifyContent: "center",
  },
  timerCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 8,
    borderColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.white,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    marginBottom: 40,
  },
  timerValue: {
    fontSize: 48,
    color: COLORS.primary,
    ...FONTS.bold,
  },
  timerLabel: {
    fontSize: 12,
    color: COLORS.gray,
    ...FONTS.medium,
  },
  waveformContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 60,
  },
  waveBar: {
    width: 6,
    borderRadius: 3,
    marginHorizontal: 3,
  },
  controlSection: {
    alignItems: "center",
    paddingBottom: 40,
  },
  micContainer: {
    alignItems: "center",
  },
  micPulse: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
  },
  micButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    marginBottom: 20,
  },
  instructionText: {
    fontSize: 16,
    color: COLORS.gray,
    ...FONTS.medium,
  },
  processingSection: {
    alignItems: "center",
  },
  processingText: {
    fontSize: 18,
    color: COLORS.black,
    ...FONTS.bold,
    marginBottom: 5,
  },
  processingSub: {
    fontSize: 14,
    color: COLORS.gray,
    ...FONTS.medium,
  },
  centeredContainer: {
    flex: 1,
    width: "100%",
    alignSelf: "center",
  },
});

// export default SpeakingPracticeScreen;
