import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeBack } from "@/hooks/useSafeBack";

import { useGetProfileQuery } from "@/services/auth-api";
import { useGetStreakCalendarQuery } from "@/services/profile-api";
import { useLogout } from "@/utils/auth";

export function ProfileScreen() {
  const router = useRouter();
  const safeBack = useSafeBack();
  const { logout } = useLogout();
  const [tab, setTab] = useState<"stats" | "space">("stats");
  
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [viewMode, setViewMode] = useState<"weekly" | "monthly">("monthly");

  const monthIso = useMemo(() => {
    return `${selectedDate.getFullYear()}-${(selectedDate.getMonth() + 1).toString().padStart(2, "0")}`;
  }, [selectedDate]);

  const { data: profile, isLoading } = useGetProfileQuery();
  const { data: calendar } = useGetStreakCalendarQuery(monthIso);

  const monthLabel = useMemo(() => {
    return selectedDate.toLocaleString("en-US", { month: "long", year: "numeric" });
  }, [selectedDate]);

  const WEEK_DAYS = ["S", "M", "T", "W", "T", "F", "S"];

  const gridRows = useMemo(() => {
    const calendarDays = calendar?.days ?? [];
    
    if (viewMode === "weekly") {
      const today = new Date();
      const dayOfWeek = today.getDay();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - dayOfWeek);

      const grid = [];
      const activeMap = new Map<string, boolean>();
      calendarDays.forEach(d => activeMap.set(d.date, d.active));

      for (let i = 0; i < 7; i++) {
        const currentDay = new Date(startOfWeek);
        currentDay.setDate(startOfWeek.getDate() + i);
        const isoStr = `${currentDay.getFullYear()}-${(currentDay.getMonth() + 1).toString().padStart(2, "0")}-${currentDay.getDate().toString().padStart(2, "0")}`;
        grid.push({
          dayNum: currentDay.getDate(),
          isCurrentMonth: currentDay.getMonth() === today.getMonth(),
          isoDate: isoStr,
          active: activeMap.get(isoStr) || false,
        });
      }
      return [grid];
    } else {
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth();

      const firstDay = new Date(year, month, 1);
      const firstDayOfWeek = firstDay.getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const prevDaysInMonth = new Date(year, month, 0).getDate();

      const grid = [];
      const activeMap = new Map<string, boolean>();
      calendarDays.forEach(d => activeMap.set(d.date, d.active));

      // Previous month padding
      for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        const dNum = prevDaysInMonth - i;
        const prevMonthDate = new Date(year, month - 1, dNum);
        const isoStr = `${prevMonthDate.getFullYear()}-${(prevMonthDate.getMonth() + 1).toString().padStart(2, "0")}-${prevMonthDate.getDate().toString().padStart(2, "0")}`;
        grid.push({
          dayNum: dNum,
          isCurrentMonth: false,
          isoDate: isoStr,
          active: false,
        });
      }

      // Current month days
      for (let i = 1; i <= daysInMonth; i++) {
        const isoStr = `${year}-${(month + 1).toString().padStart(2, "0")}-${i.toString().padStart(2, "0")}`;
        grid.push({
          dayNum: i,
          isCurrentMonth: true,
          isoDate: isoStr,
          active: activeMap.get(isoStr) || false,
        });
      }

      // Next month padding to fill slots
      const totalSlots = Math.ceil(grid.length / 7) * 7;
      const nextMonthPadding = totalSlots - grid.length;
      for (let i = 1; i <= nextMonthPadding; i++) {
        const nextMonthDate = new Date(year, month + 1, i);
        const isoStr = `${nextMonthDate.getFullYear()}-${(nextMonthDate.getMonth() + 1).toString().padStart(2, "0")}-${i.toString().padStart(2, "0")}`;
        grid.push({
          dayNum: i,
          isCurrentMonth: false,
          isoDate: isoStr,
          active: false,
        });
      }

      const rows = [];
      for (let i = 0; i < grid.length; i += 7) {
        rows.push(grid.slice(i, i + 7));
      }
      return rows;
    }
  }, [selectedDate, viewMode, calendar]);

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
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View className="flex-row items-center px-4 py-3 border-b border-slate-50">
          <Pressable onPress={() => safeBack()} className="w-9 h-9 items-center justify-center">
            <Feather name="chevron-left" size={22} color="#0f172a" />
          </Pressable>
          <Text className="flex-1 text-center font-bold text-slate-900">Profile</Text>
          <Pressable onPress={logout} className="w-9 h-9 items-center justify-center">
            <Feather name="settings" size={20} color="#0f172a" />
          </Pressable>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 20, paddingBottom: 120, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
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
              <Text className="text-slate-900 font-extrabold text-lg">
                {profile?.total_xp ?? 0}
              </Text>
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
                <Text
                  className={`text-xs font-bold ${tab === t ? "text-white" : "text-slate-600"}`}
                >
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

              {/* Premium Interactive Connected Grid Streak Calendar */}
              <View className="bg-slate-50 rounded-3xl p-4 border border-slate-100">
                <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-slate-900 font-extrabold text-base">Streak Calendar</Text>
                  <Pressable
                    onPress={() => setViewMode(prev => prev === "weekly" ? "monthly" : "weekly")}
                    className="flex-row items-center bg-slate-950 px-3 py-1.5 rounded-xl active:bg-slate-800"
                  >
                    <Text className="text-white text-xs font-extrabold mr-1">
                      {viewMode === "weekly" ? "Weekly" : "Monthly"}
                    </Text>
                    <Feather name="chevron-down" size={12} color="#fff" />
                  </Pressable>
                </View>

                {viewMode === "monthly" ? (
                  /* Month Navigation */
                  <View className="flex-row justify-between items-center mb-4 px-2">
                    <Pressable
                      onPress={() => setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                      className="w-8 h-8 items-center justify-center rounded-full bg-white border border-slate-200 active:bg-slate-100"
                    >
                      <Feather name="chevron-left" size={16} color="#475569" />
                    </Pressable>
                    <Text className="text-slate-800 font-extrabold text-sm">{monthLabel}</Text>
                    <Pressable
                      onPress={() => setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                      className="w-8 h-8 items-center justify-center rounded-full bg-white border border-slate-200 active:bg-slate-100"
                    >
                      <Feather name="chevron-right" size={16} color="#475569" />
                    </Pressable>
                  </View>
                ) : (
                  <View className="items-center mb-4">
                    <Text className="text-slate-500 text-xs font-extrabold bg-white px-4 py-1.5 rounded-full border border-slate-200">
                      This Week
                    </Text>
                  </View>
                )}

                {/* Week Days Headers */}
                <View className="flex-row mb-1">
                  {WEEK_DAYS.map((day, idx) => (
                    <Text key={idx} className="flex-1 text-center text-xs font-bold text-slate-400">
                      {day}
                    </Text>
                  ))}
                </View>

                {/* Grid Rows */}
                <View>
                  {gridRows.map((row, rIdx) => (
                    <View key={rIdx} className="flex-row my-0.5">
                      {row.map((day, idx) => {
                        const prevActive = idx > 0 && row[idx - 1]?.active;
                        const nextActive = idx < 6 && row[idx + 1]?.active;

                        return (
                          <View key={day.isoDate} className="flex-1 items-center justify-center py-1">
                            {day.active ? (
                              <View
                                className={`h-9 items-center justify-center w-full relative ${
                                  prevActive && nextActive
                                    ? "bg-slate-300/60 rounded-none"
                                    : prevActive
                                    ? "bg-slate-300/60 rounded-r-full"
                                    : nextActive
                                    ? "bg-slate-300/60 rounded-l-full"
                                    : ""
                                }`}
                              >
                                {!prevActive && !nextActive && (
                                  <View className="absolute inset-0 bg-slate-300/60 rounded-full mx-auto w-9 h-9" />
                                )}
                                <View className="w-7 h-7 rounded-full bg-white items-center justify-center shadow-sm z-10">
                                  <Ionicons name="flame" size={15} color="#f97316" />
                                </View>
                              </View>
                            ) : (
                              <View className="h-9 w-9 items-center justify-center">
                                <Text
                                  className={`text-xs font-bold ${
                                    day.isCurrentMonth ? "text-slate-800" : "text-slate-300"
                                  }`}
                                >
                                  {day.dayNum}
                                </Text>
                              </View>
                            )}
                          </View>
                        );
                      })}
                    </View>
                  ))}
                </View>

                <Text className="text-slate-500 text-xs mt-4 text-center font-bold">
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
