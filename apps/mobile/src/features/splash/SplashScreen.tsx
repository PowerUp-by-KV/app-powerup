import React, { useRef, useState } from "react";
import { View, Text, Animated, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { getAuthSession, getProfileCompletedInSession } from "@/services/auth-storage";

const slides = [
  {
    title: "Read",
    subtitle: "Improve vocabulary and comprehension",
    image: {
      uri: "https://cdn-icons-png.flaticon.com/512/3135/3135755.png",
    },
  },
  {
    title: "Listen",
    subtitle: "Understand real conversations",
    image: {
      uri: "https://cdn-icons-png.flaticon.com/512/4712/4712027.png",
    },
  },
  {
    title: "Speak",
    subtitle: "Practice fluency with confidence",
    image: {
      uri: "https://cdn-icons-png.flaticon.com/512/1995/1995574.png",
    },
  },
];

export function SplashScreen() {
  const router = useRouter();

  const [step, setStep] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const handleNext = () => {
    if (step < slides.length - 1) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setStep((prev) => prev + 1);
        fadeAnim.setValue(0);

        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    } else {
      handleStart();
    }
  };

  const handleStart = async () => {
    try {
      const session = await getAuthSession();
      if (!session?.access_token) {
        router.replace("/login");
        return;
      }
      const profileDone = await getProfileCompletedInSession();
      router.replace(profileDone ? "/(tabs)" : "/dynamic-onboarding");
    } catch {
      router.replace("/login");
    }
  };

  const currentSlide = slides[step];

  if (!currentSlide) {
    return null; // Safety check
  }

  return (
    <View className="flex-1 justify-center items-center bg-indigo-600 px-6">
      {/* Slide Content */}
      <Animated.View className="items-center" style={{ opacity: fadeAnim }}>
        {/* Image */}
        <Image
          source={currentSlide.image}
          className="w-[220px] h-[220px] mb-8"
          resizeMode="contain"
        />

        {/* Title */}
        <Text className="text-white text-4xl font-bold text-center">{currentSlide.title}</Text>

        {/* Subtitle */}
        <Text className="text-white/80 text-lg mt-3 text-center">{currentSlide.subtitle}</Text>
      </Animated.View>

      {/* Dots Indicator */}
      <View className="flex-row mt-10">
        {slides.map((_, index) => (
          <View
            key={index}
            className={`h-2 w-2 mx-1 rounded-full ${step === index ? "bg-white" : "bg-white/40"}`}
          />
        ))}
      </View>

      {/* Button */}
      <TouchableOpacity
        onPress={handleNext}
        className="absolute bottom-5 right-5 bg-white px-4 py-2 rounded-full items-center shadow-lg"
      >
        <Text className="text-indigo-600 font-bold text-sm">
          {step === slides.length - 1 ? "Get Started" : "Next"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
