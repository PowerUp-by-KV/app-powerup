import React, { useEffect, useState } from "react";
import { ActivityIndicator, SafeAreaView, Text, View } from "react-native";
import { RiveMascot } from "./RiveMascot";

const TIPS = [
  "Consistency is key! Just 10 minutes a day builds strong neural paths.",
  "Did you know? Speaking out loud improves pronunciation muscle memory.",
  "Vocabulary is best retained when practiced in personalized sentences.",
  "Your AI English coach scores you on fluency, grammar, and relevance.",
  "Power up your streak to earn daily multipliers and exclusive badges!",
  "Listening to diverse accents builds real-world comprehension skills.",
];

interface GamifiedMascotLoaderProps {
  title?: string;
}

export function GamifiedMascotLoader({
  title = "Preparing your session...",
}: GamifiedMascotLoaderProps) {
  const [tipIdx, setTipIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIdx((prev) => (prev + 1) % TIPS.length);
    }, 4500);
    return () => clearInterval(interval);
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
        {/* Animated Funny Mascot */}
        <RiveMascot width={220} height={220} />

        {/* Loading Indicator & Title */}
        <View className="flex-row items-center justify-center mt-8 mb-2">
          <ActivityIndicator size="small" color="#4f46e5" style={{ marginRight: 10 }} />
          <Text className="text-slate-900 font-extrabold text-xl text-center">{title}</Text>
        </View>

        {/* Floating pulse status text */}
        <Text className="text-indigo-600 font-extrabold text-xs uppercase tracking-widest mb-8">
          Connecting to AI Coach...
        </Text>

        {/* Beautiful Floating glassmorphic Pro Tip Box */}
        <View className="w-full bg-white/70 border border-slate-200/50 rounded-2xl p-5 shadow-sm">
          <Text className="text-indigo-600 font-extrabold text-[10px] uppercase tracking-widest mb-1.5">
            Pro Tip
          </Text>
          <Text className="text-slate-700 text-xs font-semibold leading-5">{TIPS[tipIdx]}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
