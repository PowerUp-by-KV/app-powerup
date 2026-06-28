import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSafeBack } from "@/hooks/useSafeBack";
import { useColorScheme } from "nativewind";

import { useGetProfileQuery, usePatchProfileMutation } from "@/services/auth-api";

const LANGS = [
  { code: "en-GB", name: "English (UK)", native: "System Default" },
  { code: "ta", name: "Tamil", native: "தமிழ்" },
  { code: "te", name: "Telugu", native: "తెలుగు" },
  { code: "ml", name: "Malayalam", native: "മലയാളം" },
  { code: "kn", name: "Kannada", native: "ಕನ್ನಡ" },
  { code: "hi", name: "Hindi", native: "हिन्दी" },
];

export function LanguagePickerScreen() {
  const safeBack = useSafeBack();
  const insets = useSafeAreaInsets();
  const { data: profile } = useGetProfileQuery();
  const [patch] = usePatchProfileMutation();
  const [selected, setSelected] = useState(profile?.language ?? "en-GB");
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const handlePick = async (code: string) => {
    setSelected(code);
    await patch({ language: code });
  };

  return (
    <View
      style={{
        flex: 1,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
      className={`flex-1 ${isDark ? "bg-[#0F1020]" : "bg-white"}`}
    >
      <View className="flex-row items-center px-4 py-3">
        <Pressable onPress={() => safeBack()} className="w-9 h-9 items-center justify-center">
          <Feather name="chevron-left" size={22} color={isDark ? "#ffffff" : "#0f172a"} />
        </Pressable>
        <Text
          className={`flex-1 text-center font-bold ${isDark ? "text-white" : "text-slate-900"}`}
        >
          Language
        </Text>
        <View className="w-9" />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 96 }}>
        {LANGS.map((l) => {
          const isSel = l.code === selected;
          return (
            <Pressable
              key={l.code}
              onPress={() => handlePick(l.code)}
              className={`flex-row items-center rounded-2xl px-4 py-3 mb-2 border ${
                isDark ? "bg-[#1E1F2A] border-[#2D3142]" : "bg-slate-50 border-slate-100"
              }`}
            >
              <View className="flex-1">
                <Text className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                  {l.name}
                </Text>
                <Text className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  {l.native}
                </Text>
              </View>
              <View
                className="w-5 h-5 rounded-full border-2"
                style={{
                  borderColor: isSel
                    ? isDark
                      ? "#60a5fa"
                      : "#0f172a"
                    : isDark
                      ? "#4b5563"
                      : "#cbd5e1",
                  backgroundColor: isSel ? (isDark ? "#60a5fa" : "#0f172a") : "transparent",
                }}
              />
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
