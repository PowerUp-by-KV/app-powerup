import React, { useMemo, useState } from "react";
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeBack } from "@/hooks/useSafeBack";
import { GamifiedMascotLoader } from "@/components/GamifiedMascotLoader";

import { useGetProfileQuery } from "@/services/auth-api";
import { useGetStreakCalendarQuery } from "@/services/profile-api";
import { useLogout } from "@/utils/auth";
import { getAvatarUri } from "@/utils/avatar";

export function ProfileScreen() {
  const router = useRouter();
  const safeBack = useSafeBack();
  const { logout } = useLogout();
  const [tab, setTab] = useState<"stats" | "space">("stats");
  const { data: profile, isLoading } = useGetProfileQuery();

  // Track the currently displayed date and view mode (weekly vs monthly)
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"weekly" | "monthly">("monthly");

  const monthIso = useMemo(() => {
    return `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, "0")}`;
  }, [currentDate]);

  const { data: calendar } = useGetStreakCalendarQuery(monthIso);

  const allGridDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const startDayOfWeek = firstDayOfMonth.getDay();

    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    const totalDaysInPrevMonth = new Date(year, month, 0).getDate();

    const days: Array<{
      date: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      active: boolean;
    }> = [];

    // 1. Previous month padding days
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const dayNum = totalDaysInPrevMonth - i;
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const dateStr = `${prevYear}-${(prevMonth + 1).toString().padStart(2, "0")}-${dayNum.toString().padStart(2, "0")}`;
      days.push({
        date: dateStr,
        dayNumber: dayNum,
        isCurrentMonth: false,
        active: false,
      });
    }

    // 2. Current month days
    const activeDates = new Set((calendar?.days ?? []).filter((d) => d.active).map((d) => d.date));

    for (let i = 1; i <= totalDaysInMonth; i++) {
      const dateStr = `${year}-${(month + 1).toString().padStart(2, "0")}-${i.toString().padStart(2, "0")}`;
      days.push({
        date: dateStr,
        dayNumber: i,
        isCurrentMonth: true,
        active: activeDates.has(dateStr),
      });
    }

    // 3. Next month padding days to fill 6 rows (42 days)
    const remainingCells = 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      const dateStr = `${nextYear}-${(nextMonth + 1).toString().padStart(2, "0")}-${i.toString().padStart(2, "0")}`;
      days.push({
        date: dateStr,
        dayNumber: i,
        isCurrentMonth: false,
        active: false,
      });
    }

    return days;
  }, [currentDate, calendar]);

  const displayedDays = useMemo(() => {
    if (viewMode === "monthly") {
      return allGridDays;
    }

    // Weekly mode: find the 7-day row in allGridDays that contains currentDate
    const currentDayStr = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, "0")}-${currentDate.getDate().toString().padStart(2, "0")}`;
    let rowIndex = 0;
    for (let i = 0; i < allGridDays.length; i++) {
      if (allGridDays[i]?.date === currentDayStr) {
        rowIndex = Math.floor(i / 7);
        break;
      }
    }

    return allGridDays.slice(rowIndex * 7, rowIndex * 7 + 7);
  }, [viewMode, currentDate, allGridDays]);

  const headerLabel = useMemo(() => {
    if (viewMode === "monthly") {
      return currentDate.toLocaleString("en-US", { month: "long" });
    }

    // Weekly mode: e.g. "Feb 1 – Feb 7" or "Feb 23 – Mar 1"
    const weekStart = displayedDays[0];
    const weekEnd = displayedDays[6];
    if (!weekStart || !weekEnd) return "";

    const parseLocalDate = (dateStr: string) => {
      return new Date(dateStr.replace(/-/g, "/"));
    };

    const startDate = parseLocalDate(weekStart.date);
    const endDate = parseLocalDate(weekEnd.date);

    const startMonth = startDate.toLocaleString("en-US", { month: "short" });
    const endMonth = endDate.toLocaleString("en-US", { month: "short" });
    const startDay = startDate.getDate();
    const endDay = endDate.getDate();

    if (startMonth === endMonth) {
      return `${startMonth} ${startDay} – ${endDay}`;
    } else {
      return `${startMonth} ${startDay} – ${endMonth} ${endDay}`;
    }
  }, [viewMode, currentDate, displayedDays]);

  const handlePrev = () => {
    if (viewMode === "weekly") {
      setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() - 7));
    } else {
      setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    }
  };

  const handleNext = () => {
    if (viewMode === "weekly") {
      setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() + 7));
    } else {
      setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    }
  };

  const getStreakStyle = (index: number, days: Array<{ active: boolean }>) => {
    const current = days[index];
    if (!current || !current.active) return null;

    const isRowStart = index % 7 === 0;
    const isRowEnd = index % 7 === 6;

    const prevActive = !isRowStart && days[index - 1]?.active;
    const nextActive = !isRowEnd && days[index + 1]?.active;

    if (prevActive && nextActive) {
      return {
        backgroundColor: "#cbd5e1", // bg-slate-300
        height: 36,
        justifyContent: "center" as const,
        alignItems: "center" as const,
      };
    } else if (prevActive) {
      return {
        backgroundColor: "#cbd5e1",
        borderTopRightRadius: 18,
        borderBottomRightRadius: 18,
        height: 36,
        justifyContent: "center" as const,
        alignItems: "center" as const,
      };
    } else if (nextActive) {
      return {
        backgroundColor: "#cbd5e1",
        borderTopLeftRadius: 18,
        borderBottomLeftRadius: 18,
        height: 36,
        justifyContent: "center" as const,
        alignItems: "center" as const,
      };
    } else {
      return {
        backgroundColor: "#cbd5e1",
        borderRadius: 18,
        height: 36,
        justifyContent: "center" as const,
        alignItems: "center" as const,
      };
    }
  };

  if (isLoading) {
    return <GamifiedMascotLoader title="Loading Profile..." />;
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
              <View className="w-24 h-24 rounded-full bg-slate-200 items-center justify-center overflow-hidden border-2 border-slate-100 shadow-sm">
                <Image
                  source={{
                    uri: getAvatarUri(profile?.avatar_id, profile?.id),
                  }}
                  className="w-full h-full"
                />
              </View>
              <View className="absolute right-0 bottom-0 w-7 h-7 rounded-full bg-slate-900 items-center justify-center border-2 border-white shadow-sm">
                <Feather name="edit-2" size={12} color="#fff" />
              </View>
            </Pressable>
            <Text className="text-slate-900 text-xl font-extrabold mt-3">
              {profile?.nickname ?? profile?.name ?? "—"}
            </Text>
            <Text className="text-slate-500 text-xs text-center">
              LVL {profile?.current_level ?? 1}
            </Text>

            <Pressable
              onPress={() => router.push("/profile/ready-player-me" as never)}
              className="mt-3 px-4 py-2 rounded-full bg-indigo-600 active:bg-indigo-700 flex-row items-center shadow-sm"
              style={{ gap: 6 }}
            >
              <Feather name="user" size={14} color="#fff" />
              <Text className="text-white text-xs font-bold">Create 3D Avatar</Text>
            </Pressable>
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

              {/* Streak Calendar Header */}
              <View className="flex-row justify-between items-center mb-4 px-1">
                <Text className="text-slate-900 font-extrabold text-base">Streak Calendar</Text>
                <Pressable
                  onPress={() => setViewMode(viewMode === "weekly" ? "monthly" : "weekly")}
                  className="bg-slate-950 px-3.5 py-2 rounded-full flex-row items-center gap-1.5 active:opacity-80"
                >
                  <Text className="text-white text-xs font-black capitalize">{viewMode}</Text>
                  <Feather name="chevron-down" size={11} color="#fff" />
                </Pressable>
              </View>

              {/* Main Calendar Card */}
              <View className="bg-slate-100/80 rounded-[32px] p-5 mb-6">
                {/* Month/Week Navigation Row */}
                <View className="flex-row items-center justify-between mb-6 px-1">
                  <Pressable
                    onPress={handlePrev}
                    className="w-8 h-8 items-center justify-center rounded-full active:bg-slate-200"
                  >
                    <Feather name="chevron-left" size={18} color="#0f172a" />
                  </Pressable>
                  <Text className="text-slate-900 font-black text-base">{headerLabel}</Text>
                  <Pressable
                    onPress={handleNext}
                    className="w-8 h-8 items-center justify-center rounded-full active:bg-slate-200"
                  >
                    <Feather name="chevron-right" size={18} color="#0f172a" />
                  </Pressable>
                </View>

                {/* Weekday Headers */}
                <View className="flex-row mb-4">
                  {["S", "M", "T", "W", "T", "F", "S"].map((day, idx) => (
                    <Text
                      key={idx}
                      style={{ width: "14.28%" }}
                      className="text-slate-500 font-extrabold text-xs text-center"
                    >
                      {day}
                    </Text>
                  ))}
                </View>

                {/* Days Grid */}
                <View className="flex-row flex-wrap">
                  {displayedDays.map((dayObj, index) => {
                    const streakStyle = getStreakStyle(index, displayedDays);
                    return (
                      <View
                        key={`${dayObj.date}-${index}`}
                        style={{ width: "14.28%", height: 42, justifyContent: "center" }}
                        className="py-1"
                      >
                        {streakStyle ? (
                          <View style={streakStyle}>
                            <View className="w-7 h-7 rounded-full bg-white items-center justify-center shadow-sm">
                              <MaterialCommunityIcons name="fire" size={16} color="#ef4444" />
                            </View>
                          </View>
                        ) : (
                          <View className="items-center justify-center h-full">
                            <Text
                              className={`text-sm font-bold ${
                                dayObj.isCurrentMonth ? "text-slate-800" : "text-slate-400/40"
                              }`}
                            >
                              {dayObj.dayNumber}
                            </Text>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
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
