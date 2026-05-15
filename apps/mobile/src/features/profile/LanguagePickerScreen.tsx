import React, { useState } from "react";
import { Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

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
  const router = useRouter();
  const { data: profile } = useGetProfileQuery();
  const [patch] = usePatchProfileMutation();
  const [selected, setSelected] = useState(profile?.language ?? "en-GB");

  const handlePick = async (code: string) => {
    setSelected(code);
    await patch({ language: code });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center px-4 py-3">
        <Pressable onPress={() => router.back()} className="w-9 h-9 items-center justify-center">
          <Feather name="chevron-left" size={22} color="#0f172a" />
        </Pressable>
        <Text className="flex-1 text-center font-bold text-slate-900">Language</Text>
        <View className="w-9" />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {LANGS.map((l) => {
          const isSel = l.code === selected;
          return (
            <Pressable
              key={l.code}
              onPress={() => handlePick(l.code)}
              className="flex-row items-center bg-slate-50 rounded-2xl px-4 py-3 mb-2 border border-slate-100"
            >
              <View className="flex-1">
                <Text className="text-slate-900 font-semibold">{l.name}</Text>
                <Text className="text-slate-500 text-xs">{l.native}</Text>
              </View>
              <View
                className="w-5 h-5 rounded-full border-2"
                style={{
                  borderColor: isSel ? "#0f172a" : "#cbd5e1",
                  backgroundColor: isSel ? "#0f172a" : "transparent",
                }}
              />
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
