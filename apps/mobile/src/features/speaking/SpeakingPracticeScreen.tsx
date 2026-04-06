import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  Easing,
  FlatList,
  useWindowDimensions,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { speakingPrompts, speakingCategories } from "@/constants/verbalData";
import { ArrowLeft, Mic, StopCircle } from "lucide-react-native";
import { Audio } from "expo-av";
import { useTimeTracker } from "@/hooks/useTimeTracker";

const apiService = {
  uploadVerbalAudio: async (uri: string, id: string) => {
    console.log("Uploading audio...", uri, id);
    return { success: true };
  },
};

interface SpeakingPageProps {
  item: any;
  isActive: boolean;
  category: any;
  setIsSwipingDisabled: (disabled: boolean) => void;
  width: number;
}

const SpeakingPage = ({ item, isActive, setIsSwipingDisabled, width }: SpeakingPageProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(item.timeLimit);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);

  const bars = Array(15)
    .fill(0)
    .map(() => useRef(new Animated.Value(10)).current);
  const micScale = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (isRecording) {
      setIsSwipingDisabled(true);
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
        setTimeLeft((prev: number) => {
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
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  };

  const handleStopRecording = async () => {
    setIsRecording(false);
    try {
      if (recording) {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        if (uri) {
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
      }
    } catch (error) {
      console.error("Failed to stop recording", error);
    }
  };

  const { width: windowWidth } = useWindowDimensions();

  return (
    <View
      style={{ width }}
      className={`flex-1 ${windowWidth > 1200 ? "px-[100px]" : windowWidth > 800 ? "px-[50px]" : "px-5"}`}
    >
      <View className="flex-1 p-[20px] justify-between">
        <View className="bg-white p-[25px] rounded-[25px] shadow-sm shadow-black/10 elevation-4">
          <Text className="text-[12px] text-[#6366F1] font-bold tracking-widest mb-2.5 uppercase">
            SPEAKING PROMPT
          </Text>
          <Text className="text-[20px] text-black font-bold leading-[28px]">{item.prompt}</Text>
        </View>

        <View className="items-center justify-center">
          <View className="w-[150px] h-[150px] rounded-full border-8 border-white justify-center items-center bg-white shadow-lg shadow-black/10 elevation-10 mb-10">
            <Text
              className={`text-[48px] font-bold ${timeLeft < 10 ? "text-[#EF4444]" : "text-[#6366F1]"}`}
            >
              {timeLeft < 10 ? `0${timeLeft}` : timeLeft}
            </Text>
            <Text className="text-[12px] text-[#64748B] font-medium">Seconds Remaining</Text>
          </View>
          <View className="flex-row items-center justify-center h-[60px]">
            {bars.map((bar, i) => (
              <Animated.View
                key={i}
                style={[{ height: bar, backgroundColor: isRecording ? "#6366F1" : "#94A3B8" }]}
                className="w-1.5 rounded-full mx-0.75"
              />
            ))}
          </View>
        </View>

        <View className="items-center pb-10">
          <View className="items-center">
            <Animated.View
              style={[{ transform: [{ scale: micScale }], opacity: isRecording ? 0.3 : 0 }]}
              className="absolute w-[80px] h-[80px] rounded-full bg-[#6366F1]"
            />
            <TouchableOpacity
              className={`w-[80px] h-[80px] rounded-full justify-center items-center shadow-lg shadow-[#6366F1]/30 elevation-12 mb-5 ${isRecording ? "bg-[#EF4444]" : "bg-[#6366F1]"}`}
              onPress={isRecording ? handleStopRecording : handleStartRecording}
              activeOpacity={0.8}
            >
              {isRecording ? (
                <StopCircle size={40} color="white" />
              ) : (
                <Mic size={40} color="white" />
              )}
            </TouchableOpacity>
            <Text className="text-base text-[#64748B] font-medium ">
              {isRecording ? "Tap to stop" : "Tap to start"}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

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
  }

  const { width: windowWidth } = useWindowDimensions();
  const CONTAINER_WIDTH = windowWidth;
  const [activeIndex, setActiveIndex] = useState(initialIndex !== -1 ? initialIndex : 0);
  const [isSwipingDisabled, setIsSwipingDisabled] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const currentPrompt = filteredPrompts[activeIndex] || filteredPrompts[0];
  const category = currentPrompt
    ? speakingCategories.find((c) => c.id === currentPrompt.categoryId) || speakingCategories[0]
    : speakingCategories[0];

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
    <SafeAreaView className="flex-1 bg-[#F8F9FA]">
      <View className="p-5 pt-[60px] flex-row items-center bg-white border-b border-[#F1F5F9]">
        <TouchableOpacity
          onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)"))}
          className="w-10 h-10 rounded-full bg-[#F8F9FA] justify-center items-center"
        >
          <ArrowLeft size={24} color="black" />
        </TouchableOpacity>
        <View className="flex-1 ml-[15px]">
          <Text className="text-[10px] text-[#6366F1] font-bold uppercase tracking-widest mb-0.5">
            Speaking • {category?.title || "Practice"}
          </Text>
          <Text className="text-[18px] text-black font-bold">Practice Mode</Text>
          <Text className="text-[12px] text-[#64748B] font-medium">
            Prompt {activeIndex + 1} of {filteredPrompts.length}
          </Text>
        </View>
      </View>

      <View className="flex-1 w-full self-center">
        <FlatList
          ref={flatListRef}
          data={filteredPrompts}
          renderItem={({ item, index }) => (
            <SpeakingPage
              item={item}
              isActive={index === activeIndex}
              category={category}
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

// export default SpeakingPracticeScreen;
