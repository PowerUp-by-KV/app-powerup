import React, { useEffect, useState, useRef } from "react";
import { ActivityIndicator, SafeAreaView, Text, View, Animated } from "react-native";
import { RiveMascot } from "@/components/RiveMascot";

const ONBOARDING_TIPS = [
  "A complete profile helps your AI coach personalize your journey.",
  "Your background helps us tailor the vocabulary to your industry.",
  "Set your daily goals to stay consistent and build habits.",
  "Learning just 10 minutes a day yields better results than cramming.",
  "Your personalized curriculum is being generated dynamically.",
];

interface LoaderScreenProps {
  title?: string;
}

const LoaderScreen = ({ title = "Adding Profile..." }: LoaderScreenProps) => {
  const [tipIdx, setTipIdx] = useState(0);
  const pulseAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const tipInterval = setInterval(() => {
      setTipIdx((prev) => (prev + 1) % ONBOARDING_TIPS.length);
    }, 4500);

    return () => clearInterval(tipInterval);
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.5,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "transparent",
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
      }}
      className="items-center justify-center p-6"
    >
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          alignSelf: "center",
          width: "100%",
          maxWidth: 360,
        }}
        className="items-center justify-center p-4"
      >
        {/* Animated Funny Mascot (Exactly like GamifiedMascotLoader) */}
        {/* Note: The internal color of this Rive animation cannot be natively changed without a new .riv file */}
        <RiveMascot width={220} height={220} />

        {/* Loading Indicator & Title */}
        <View className="flex-row items-center justify-center mt-8 mb-2">
          {/* Changed color to green (#22c55e) */}
          <ActivityIndicator size="small" color="#22c55e" style={{ marginRight: 10 }} />
          <Text className="text-slate-900 font-extrabold text-xl text-center">{title}</Text>
        </View>

        {/* Floating pulse status text */}
        {/* Changed color to green-600 */}
        <Animated.Text
          style={{ opacity: pulseAnim }}
          className="text-green-600 font-extrabold text-xs uppercase tracking-widest mb-8"
        >
          Setting things up...
        </Animated.Text>

        {/* Beautiful Floating glassmorphic Pro Tip Box */}
        <View className="w-full bg-white/70 border border-slate-200/50 rounded-2xl p-5 shadow-sm">
          <Text className="text-green-600 font-extrabold text-[10px] uppercase tracking-widest mb-1.5">
            Pro Tip
          </Text>
          <Text className="text-slate-700 text-xs font-semibold leading-5">
            {ONBOARDING_TIPS[tipIdx]}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default LoaderScreen;
