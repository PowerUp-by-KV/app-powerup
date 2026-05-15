import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { useGetProfileQuery } from "@/services/auth-api";
import { useGetStreakCalendarQuery } from "@/services/profile-api";
import { useLogout } from "@/utils/auth";

function currentMonthIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}`;
}

export function ProfileScreen() {
  const router = useRouter();
  const { logout } = useLogout();
  const [tab, setTab] = useState<"stats" | "space">("stats");
  const { data: profile, isLoading } = useGetProfileQuery();
  const { data: calendar } = useGetStreakCalendarQuery(currentMonthIso());

  const monthLabel = useMemo(() => {
    const d = new Date();
    return d.toLocaleString("en-US", { month: "long", year: "numeric" });
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#6366f1" />
      </SafeAreaView>
    );
  }

  const settingsRows = [
    {
      icon: "user" as const,
      label: "Personal Details",
      onPress: () => router.push("/profile/edit" as never),
    },
    {
      icon: "globe" as const,
      label: "Language",
      onPress: () => router.push("/profile/language" as never),
    },
    { icon: "lock" as const, label: "Passwords", onPress: () => {} },
    { icon: "moon" as const, label: "Mode", onPress: () => {} },
    { icon: "bell" as const, label: "Notifications", onPress: () => {} },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center px-4 py-3">
        <Pressable onPress={() => router.back()} className="w-9 h-9 items-center justify-center">
          <Feather name="chevron-left" size={22} color="#0f172a" />
        </Pressable>
        <Text className="flex-1 text-center font-bold text-slate-900">Profile</Text>
        <Pressable onPress={logout} className="w-9 h-9 items-center justify-center">
          <Feather name="settings" size={20} color="#0f172a" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 96 }}>
        <View className="items-center mb-6">
          <Pressable onPress={() => router.push("/profile/avatar" as never)} className="relative">
            <View className="w-24 h-24 rounded-full bg-slate-200 items-center justify-center overflow-hidden">
              {profile?.avatar_id ? (
                <Image
                  source={{
                    uri: `https://stpowerup.blob.core.windows.net/avatars/${profile.avatar_id}.png`,
                  }}
                  className="w-full h-full"
                />
              ) : (
                <Feather name="user" size={36} color="#94a3b8" />
              )}
            </View>
            <View className="absolute right-0 bottom-0 w-7 h-7 rounded-full bg-slate-900 items-center justify-center">
              <Feather name="edit-2" size={12} color="#fff" />
            </View>
          </Pressable>
          <Text className="text-slate-900 text-xl font-extrabold mt-3">
            {profile?.nickname ?? profile?.name ?? "—"}
          </Text>
          <Text className="text-slate-500 text-xs">LVL {profile?.current_level ?? 1}</Text>
        </View>

        <View className="flex-row mb-6" style={{ gap: 8 }}>
          <View className="flex-1 bg-slate-100 rounded-2xl p-3 items-center">
            <Text className="text-slate-900 font-extrabold text-lg">
              {profile?.streak_count ?? 0}
            </Text>
            <Text className="text-slate-500 text-xs">Daily Streak</Text>
          </View>
          <View className="flex-1 bg-slate-100 rounded-2xl p-3 items-center">
            <Text className="text-slate-900 font-extrabold text-lg">{profile?.total_xp ?? 0}</Text>
            <Text className="text-slate-500 text-xs">XP Points</Text>
          </View>
          <View className="flex-1 bg-slate-100 rounded-2xl p-3 items-center">
            <Text className="text-slate-900 font-extrabold text-lg">0</Text>
            <Text className="text-slate-500 text-xs">Friends</Text>
          </View>
        </View>

        <View className="flex-row mb-4" style={{ gap: 8 }}>
          {(["stats", "space"] as const).map((t) => (
            <Pressable
              key={t}
              onPress={() => setTab(t)}
              className={`px-4 py-1.5 rounded-full ${tab === t ? "bg-slate-900" : "bg-slate-100"}`}
            >
              <Text className={`text-xs font-bold ${tab === t ? "text-white" : "text-slate-600"}`}>
                {t === "stats" ? "My Stats" : "My Space"}
              </Text>
            </Pressable>
          ))}
        </View>

        {tab === "stats" ? (
          <>
            <Pressable
              onPress={() => router.push("/subscription" as never)}
              className="bg-slate-50 rounded-3xl p-4 flex-row items-center mb-5 border border-slate-100"
            >
              <View className="w-10 h-10 rounded-2xl bg-slate-900 items-center justify-center mr-3">
                <Feather name="zap" size={18} color="#fff" />
              </View>
              <View className="flex-1">
                <Text className="text-slate-900 font-bold">Pro Subscription</Text>
                <Text className="text-slate-500 text-xs">See plans + upgrade</Text>
              </View>
              <Feather name="chevron-right" size={18} color="#94a3b8" />
            </Pressable>

            <View className="bg-slate-50 rounded-3xl p-4 border border-slate-100">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-slate-900 font-bold">Streak Calendar</Text>
                <Text className="text-slate-500 text-xs">{monthLabel}</Text>
              </View>
              <View className="flex-row flex-wrap" style={{ gap: 6 }}>
                {(calendar?.days ?? []).map((d) => {
                  const day = parseInt(d.date.slice(-2), 10);
                  return (
                    <View
                      key={d.date}
                      className={`w-8 h-8 rounded-lg items-center justify-center ${d.active ? "bg-slate-900" : "bg-white border border-slate-200"}`}
                    >
                      <Text
                        className={`text-xs font-semibold ${d.active ? "text-white" : "text-slate-400"}`}
                      >
                        {day}
                      </Text>
                    </View>
                  );
                })}
              </View>
              <Text className="text-slate-500 text-xs mt-3 text-center">
                {calendar?.total_active_days ?? 0} active days this month
              </Text>
            </View>
          </>
        ) : (
          <View className="bg-slate-50 rounded-3xl border border-slate-100 overflow-hidden">
            {settingsRows.map((row, i) => (
              <Pressable
                key={row.label}
                onPress={row.onPress}
                className="flex-row items-center px-4 py-3"
                style={{ borderTopWidth: i === 0 ? 0 : 1, borderColor: "#e2e8f0" }}
              >
                <View className="w-9 h-9 rounded-xl bg-white items-center justify-center mr-3">
                  <Feather name={row.icon} size={16} color="#475569" />
                </View>
                <Text className="flex-1 text-slate-900 font-semibold">{row.label}</Text>
                <Feather name="chevron-right" size={16} color="#94a3b8" />
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
