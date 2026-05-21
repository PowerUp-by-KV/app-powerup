import React, { useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, SafeAreaView, Animated } from "react-native";
import { useRouter } from "expo-router";
import { SplashMascot } from "./components/SplashMascot";

export function SplashScreen() {
  const router = useRouter();
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -15,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2500,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const handleStart = () => {
    router.replace("/login");
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#f8fafc",
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
      }}
      className="p-6"
    >
      <View style={{ width: "100%", maxWidth: 360, alignItems: "center" }}>
        {/* Animated Mascot wrapped in a floating container for extra polish */}
        <Animated.View style={{ transform: [{ translateY: floatAnim }], marginBottom: 16 }}>
          <SplashMascot width={220} height={220} />
        </Animated.View>

        {/* Title */}
        <Text className="text-slate-900 font-extrabold text-3xl text-center mb-2">Power Up</Text>

        {/* Subtitle pulse text style matching the loading screen's uppercase accents */}
        <Text className="text-indigo-600 font-extrabold text-xs uppercase tracking-widest mb-6 text-center">
          Your AI Language Coach
        </Text>

        {/* Glassmorphic-style Box container matching the Pro Tip layout */}
        <View className="w-full bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm mb-4">
          <Text className="text-slate-700 text-sm font-semibold leading-6 text-center mb-5">
            Master English with daily tailored assessments.
          </Text>

          <TouchableOpacity
            onPress={handleStart}
            className="bg-indigo-600 w-full py-4 rounded-xl items-center shadow-lg shadow-indigo-200 active:opacity-80"
          >
            <Text className="text-white font-extrabold text-base tracking-wide">GET STARTED</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
