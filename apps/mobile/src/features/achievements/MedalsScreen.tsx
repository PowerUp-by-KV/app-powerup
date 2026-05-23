import React from "react";
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeBack } from "@/hooks/useSafeBack";

import { useGetMedalsQuery } from "@/services/gamification-api";

export function MedalsScreen() {
  const safeBack = useSafeBack();
  const { data, isLoading } = useGetMedalsQuery();

  const all = [
    ...(data?.unlocked ?? []).map((m) => ({ ...m, unlocked: true })),
    ...(data?.locked ?? []).map((m) => ({ ...m, unlocked: false })),
  ];

  return (
    <SafeAreaView style={{ flex: 1 }} className="flex-1 bg-white">
      <View className="flex-row items-center px-4 py-3">
        <Pressable onPress={() => safeBack()} className="w-9 h-9 items-center justify-center">
          <Feather name="chevron-left" size={22} color="#0f172a" />
        </Pressable>
        <Text className="flex-1 text-center font-bold text-slate-900">Medals</Text>
        <View className="w-9" />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 96 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {isLoading ? (
          <ActivityIndicator color="#6366f1" />
        ) : (
          <>
            {data?.trophy_hero && (
              <View className="bg-slate-200 rounded-3xl p-8 items-center mb-6">
                <Text className="text-5xl mb-3">🏆</Text>
                <Text className="text-slate-900 font-bold text-center">
                  {data.trophy_hero.title}
                </Text>
              </View>
            )}

            <View className="flex-row flex-wrap justify-center" style={{ gap: 14 }}>
              {all.slice(0, 9).map((m) => (
                <View
                  key={m.id}
                  className="w-20 h-20 rounded-full items-center justify-center"
                  style={{ backgroundColor: m.unlocked ? "#0f172a" : "#e2e8f0" }}
                >
                  {m.unlocked ? (
                    <Feather name="award" size={28} color="#fff" />
                  ) : (
                    <Feather name="lock" size={20} color="#64748b" />
                  )}
                </View>
              ))}
            </View>

            {data && data.level_up_progress.length > 0 && (
              <View className="mt-8">
                <Text className="text-slate-900 font-bold mb-3">Level up your badge</Text>
                {data.level_up_progress.map((p) => {
                  const w = Math.min(100, Math.round(p.progress * 100));
                  return (
                    <View key={p.medal_id} className="bg-slate-50 rounded-2xl p-3 mb-2">
                      <View className="flex-row justify-between mb-2">
                        <Text className="text-slate-900 text-sm flex-1 pr-3">{p.title}</Text>
                        <Text className="text-slate-500 text-xs">{p.label}</Text>
                      </View>
                      <View className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <View className="h-full bg-slate-900" style={{ width: `${w}%` }} />
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
