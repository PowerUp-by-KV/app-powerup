import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
  KeyboardAvoidingView,
  Platform,
  DimensionValue,
} from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeBack } from "@/hooks/useSafeBack";
import { GamifiedMascotLoader } from "@/components/GamifiedMascotLoader";
import { LinearGradient } from "expo-linear-gradient";
import * as SecureStore from "expo-secure-store";

import { useGetProfileQuery } from "@/services/auth-api";
import { useGetStreakCalendarQuery } from "@/services/profile-api";
import { useLogout } from "@/utils/auth";
import { getAvatarUri } from "@/utils/avatar";

export function ProfileScreen() {
  const router = useRouter();
  const safeBack = useSafeBack();
  const { logout } = useLogout();
  const [tab, setTab] = useState<"stats" | "space">("space");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const { data: profile, isLoading } = useGetProfileQuery();

  // Load preferences from SecureStore/localStorage on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        let storedDarkMode: string | null = null;
        let storedNotifications: string | null = null;

        if (Platform.OS === "web") {
          if (typeof window !== "undefined") {
            storedDarkMode = window.localStorage.getItem("settings_dark_mode");
            storedNotifications = window.localStorage.getItem("settings_notifications");
          }
        } else {
          storedDarkMode = await SecureStore.getItemAsync("settings_dark_mode");
          storedNotifications = await SecureStore.getItemAsync("settings_notifications");
        }

        if (storedDarkMode !== null) {
          setIsDarkMode(storedDarkMode === "true");
        }
        if (storedNotifications !== null) {
          setNotificationsEnabled(storedNotifications === "true");
        }
      } catch (error) {
        console.error("Failed to load settings from SecureStore/localStorage", error);
      }
    };
    loadSettings();
  }, []);

  const handleToggleDarkMode = async (value: boolean) => {
    setIsDarkMode(value);
    try {
      if (Platform.OS === "web") {
        if (typeof window !== "undefined") {
          window.localStorage.setItem("settings_dark_mode", String(value));
        }
      } else {
        await SecureStore.setItemAsync("settings_dark_mode", String(value));
      }
    } catch {}
  };

  const handleToggleNotifications = async (value: boolean) => {
    setNotificationsEnabled(value);
    try {
      if (Platform.OS === "web") {
        if (typeof window !== "undefined") {
          window.localStorage.setItem("settings_notifications", String(value));
        }
      } else {
        await SecureStore.setItemAsync("settings_notifications", String(value));
      }
    } catch {}
  };
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

  const todayStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`;
  }, []);

  const getStreakStyle = (index: number, days: Array<{ active: boolean }>) => {
    const current = days[index];
    if (!current || !current.active) return null;

    const isRowStart = index % 7 === 0;
    const isRowEnd = index % 7 === 6;

    const prevActive = !isRowStart && days[index - 1]?.active;
    const nextActive = !isRowEnd && days[index + 1]?.active;

    const baseStyle = {
      height: 32,
      width: "100%" as const,
      justifyContent: "center" as const,
      alignItems: "center" as const,
    };

    if (prevActive && nextActive) {
      return {
        ...baseStyle,
      };
    } else if (prevActive) {
      return {
        ...baseStyle,
        borderTopRightRadius: 16,
        borderBottomRightRadius: 16,
      };
    } else if (nextActive) {
      return {
        ...baseStyle,
        borderTopLeftRadius: 16,
        borderBottomLeftRadius: 16,
      };
    } else {
      return {
        ...baseStyle,
        borderRadius: 16,
      };
    }
  };

  if (isLoading) {
    return <GamifiedMascotLoader title="Loading Profile..." />;
  }

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        {/* Header Layout */}
        <View className="flex-row items-center px-4 py-3 bg-white border-b border-slate-50">
          <Pressable
            onPress={() => safeBack()}
            className="w-10 h-10 items-center justify-center rounded-full border border-slate-200 bg-white"
          >
            <Feather name="arrow-left" size={20} color="#0f172a" />
          </Pressable>
          <Text className="flex-1 text-slate-900 font-extrabold text-lg text-center pr-10">
            Profile
          </Text>
        </View>

        <ScrollView
          className="flex-1 bg-white"
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Profile Header section */}
          <View className="flex-row px-5 py-5 items-center bg-white" style={{ gap: 16 }}>
            {/* Left: Avatar with gradient background */}
            <Pressable
              onPress={() => router.push("/profile/avatar" as never)}
              className="active:opacity-85"
            >
              <LinearGradient
                colors={["#8ef34b", "#dcf434"]}
                className="w-24 h-24 rounded-full items-center justify-center overflow-hidden border border-slate-100 shadow-sm"
              >
                <Image
                  source={{
                    uri: getAvatarUri(profile?.avatar_id, profile?.id),
                  }}
                  className="w-full h-full"
                  style={{ resizeMode: "cover" }}
                />
              </LinearGradient>
            </Pressable>

            {/* Right Details */}
            <View className="flex-1">
              <View className="flex-row items-center flex-wrap gap-2">
                <Text className="text-slate-900 text-2xl font-black">
                  {profile?.nickname ?? profile?.name ?? "Tina"}
                </Text>
                <Pressable
                  onPress={() => router.push("/profile/edit" as never)}
                  className="bg-[#4a72f6] px-3 py-1.5 rounded-full flex-row items-center gap-1 active:opacity-90"
                >
                  <Feather name="edit-2" size={10} color="#fff" />
                  <Text className="text-white text-[10px] font-black">Edit Profile</Text>
                </Pressable>
              </View>

              {/* Level progress container */}
              <View className="bg-[#eff6ff] rounded-2xl p-2.5 mt-2 border border-[#dbeafe]">
                <Text className="text-[#1e3a8a] font-extrabold text-[10px] mb-1">
                  LVL {profile?.current_level ?? 2}
                </Text>
                <View className="h-1.5 bg-[#dbeafe] rounded-full overflow-hidden mb-1">
                  <LinearGradient
                    colors={["#3b82f6", "#a3e635"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="h-full"
                    style={{
                      width: profile?.total_modules
                        ? (`${(profile.modules_completed / profile.total_modules) * 100}%` as DimensionValue)
                        : "0%",
                    }}
                  />
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-slate-500 text-[9px] font-semibold">Modules Completed</Text>
                  <Text className="text-slate-800 text-[9px] font-black">
                    {profile?.modules_completed ?? 0}/{profile?.total_modules ?? 0}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Metrics section */}
          <View className="flex-row px-5 mb-5" style={{ gap: 8 }}>
            {/* Daily Streak */}
            <View
              className="flex-1 bg-white border border-slate-100 rounded-2xl p-2.5 flex-row items-center shadow-sm"
              style={{ gap: 8 }}
            >
              <View className="w-9 h-9 rounded-xl bg-[#4a72f6] items-center justify-center">
                <MaterialCommunityIcons name="fire" size={18} color="#fff" />
              </View>
              <View>
                <Text className="text-slate-800 font-black text-sm leading-tight">
                  {profile?.streak_count ?? 0}
                </Text>
                <Text className="text-slate-400 text-[9px] font-bold">Daily Streak</Text>
              </View>
            </View>

            {/* XP Points */}
            <View
              className="flex-1 bg-white border border-slate-100 rounded-2xl p-2.5 flex-row items-center shadow-sm"
              style={{ gap: 8 }}
            >
              <View className="w-9 h-9 rounded-xl bg-[#4a72f6] items-center justify-center">
                <Feather name="zap" size={16} color="#fff" />
              </View>
              <View>
                <Text className="text-slate-800 font-black text-sm leading-tight">
                  {profile?.total_xp ?? 0}
                </Text>
                <Text className="text-slate-400 text-[9px] font-bold">XP Points</Text>
              </View>
            </View>

            {/* Friends */}
            <View
              className="flex-1 bg-white border border-slate-100 rounded-2xl p-2.5 flex-row items-center shadow-sm"
              style={{ gap: 8 }}
            >
              <View className="w-9 h-9 rounded-xl bg-[#4a72f6] items-center justify-center">
                <Feather name="user" size={16} color="#fff" />
              </View>
              <View>
                <Text className="text-slate-800 font-black text-sm leading-tight">17</Text>
                <Text className="text-slate-400 text-[9px] font-bold">Friends</Text>
              </View>
            </View>
          </View>

          {/* Tab Headers */}
          <View className="bg-white border-b border-slate-100">
            <View className="flex-row px-5" style={{ gap: 24 }}>
              {(["space", "stats"] as const).map((t) => {
                const isActive = tab === t;
                return (
                  <Pressable key={t} onPress={() => setTab(t)} className="py-3 relative">
                    <Text
                      className={`text-sm font-black ${
                        isActive ? "text-[#4a72f6]" : "text-slate-400"
                      }`}
                    >
                      {t === "space" ? "My Space" : "My Stats"}
                    </Text>
                    {isActive && (
                      <View className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#4a72f6] rounded-t-full" />
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Floating/Slate-Gray Tab Content Wrapper */}
          <View className="flex-1 bg-[#f8fafc] px-5 py-6" style={{ minHeight: 450 }}>
            {tab === "space" ? (
              <View className="flex-1">
                <Text className="text-slate-400 font-bold text-xs mb-3 px-1 uppercase tracking-wider">
                  Settings
                </Text>

                <SettingsCard
                  icon="user"
                  label="Personal Details"
                  onPress={() => router.push("/profile/edit" as never)}
                />

                <SettingsCard
                  icon="translate"
                  iconType="mci"
                  label="Language"
                  onPress={() => router.push("/profile/language" as never)}
                />

                <SettingsCard icon="key" label="Passwords" onPress={() => {}} />

                <SettingsCard
                  icon="sun"
                  label="Mode"
                  rightElement={
                    <CustomSwitch value={isDarkMode} onValueChange={handleToggleDarkMode} />
                  }
                />

                <SettingsCard
                  icon="bell"
                  label="Notifications"
                  rightElement={
                    <CustomSwitch
                      value={notificationsEnabled}
                      onValueChange={handleToggleNotifications}
                    />
                  }
                />

                {/* Second section */}
                <View className="mt-4">
                  <SettingsCard label="About Us" onPress={() => {}} />

                  <SettingsCard label="Privacy & Security" onPress={() => {}} />
                </View>

                {/* Logout Card */}
                <View className="mt-4">
                  <SettingsCard
                    icon="log-out"
                    label="Log out"
                    labelColor="text-red-500"
                    onPress={logout}
                    rightElement={<View />}
                  />
                </View>
              </View>
            ) : (
              <View className="flex-1">
                {/* Streak Calendar Header */}
                <View className="flex-row justify-between items-center mb-4 px-1">
                  <Text className="text-slate-900 font-black text-base">Streak Calendar</Text>
                  <Pressable
                    onPress={() => setViewMode(viewMode === "weekly" ? "monthly" : "weekly")}
                    className="bg-slate-900 px-3.5 py-1.5 rounded-full flex-row items-center gap-1 active:opacity-80 shadow-sm"
                  >
                    <Text className="text-white text-xs font-black capitalize">{viewMode}</Text>
                    <Feather name="chevron-down" size={11} color="#fff" />
                  </Pressable>
                </View>

                {/* Calendar Card */}
                <View className="bg-white rounded-[24px] border border-slate-100 p-5 mb-5 shadow-sm">
                  {/* Month/Week Navigation */}
                  <View className="flex-row items-center justify-between mb-4 px-1">
                    <Pressable
                      onPress={handlePrev}
                      className="w-8 h-8 items-center justify-center rounded-full active:bg-slate-100"
                    >
                      <Feather name="chevron-left" size={18} color="#0f172a" />
                    </Pressable>
                    <Text className="text-slate-900 font-black text-base">{headerLabel}</Text>
                    <Pressable
                      onPress={handleNext}
                      className="w-8 h-8 items-center justify-center rounded-full active:bg-slate-100"
                    >
                      <Feather name="chevron-right" size={18} color="#0f172a" />
                    </Pressable>
                  </View>

                  {/* Weekday Headers */}
                  <View className="flex-row mb-3">
                    {["S", "M", "T", "W", "T", "F", "S"].map((day, idx) => (
                      <Text
                        key={idx}
                        style={{ width: "14.28%" }}
                        className="text-slate-400 font-black text-xs text-center"
                      >
                        {day}
                      </Text>
                    ))}
                  </View>

                  {/* Days Grid */}
                  <View className="flex-row flex-wrap">
                    {displayedDays.map((dayObj, index) => {
                      const streakStyle = getStreakStyle(index, displayedDays);
                      const isToday = dayObj.date === todayStr;

                      return (
                        <View
                          key={`${dayObj.date}-${index}`}
                          style={{ width: "14.28%", height: 40, justifyContent: "center" }}
                          className="py-1"
                        >
                          {streakStyle ? (
                            <LinearGradient
                              colors={["#e5edff", "#eff6ff"]}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 0 }}
                              style={streakStyle}
                            >
                              {isToday ? (
                                <View className="w-8 h-8 rounded-full bg-[#3b82f6] items-center justify-center shadow-sm">
                                  <Text className="text-white font-extrabold text-sm">
                                    {dayObj.dayNumber}
                                  </Text>
                                </View>
                              ) : (
                                <Text className="text-[#2563eb] font-extrabold text-sm">
                                  {dayObj.dayNumber}
                                </Text>
                              )}
                            </LinearGradient>
                          ) : (
                            <View className="items-center justify-center h-full">
                              {isToday ? (
                                <View className="w-8 h-8 rounded-full bg-[#3b82f6] items-center justify-center shadow-sm">
                                  <Text className="text-white font-extrabold text-sm">
                                    {dayObj.dayNumber}
                                  </Text>
                                </View>
                              ) : (
                                <Text
                                  className={`text-sm font-extrabold ${
                                    dayObj.isCurrentMonth ? "text-slate-800" : "text-slate-300"
                                  }`}
                                >
                                  {dayObj.dayNumber}
                                </Text>
                              )}
                            </View>
                          )}
                        </View>
                      );
                    })}
                  </View>
                </View>

                {/* Premium Promotion Banner */}
                <Pressable
                  onPress={() => router.push("/subscription" as never)}
                  className="active:opacity-90"
                >
                  <LinearGradient
                    colors={["#3b82f6", "#10b981"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="rounded-[24px] p-5 flex-col justify-between relative overflow-hidden shadow-md"
                  >
                    <View className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-white/10" />
                    <View className="absolute right-10 top-2 w-16 h-16 rounded-full bg-white/10" />

                    <View className="mb-2">
                      <Text className="text-white text-xs font-semibold tracking-wide">
                        Supercharge Your Communication With
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                      <Text className="text-white text-2xl font-black tracking-tight">
                        lumino ✦
                      </Text>
                      <LinearGradient
                        colors={["#facc15", "#8ef34b"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        className="px-2.5 py-0.5 rounded-full"
                      >
                        <Text className="text-slate-900 text-[10px] font-black uppercase">
                          Premium
                        </Text>
                      </LinearGradient>
                    </View>
                  </LinearGradient>
                </Pressable>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Custom Switch component
function CustomSwitch({
  value,
  onValueChange,
}: {
  value: boolean;
  onValueChange: (val: boolean) => void;
}) {
  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      style={[
        {
          width: 44,
          height: 24,
          borderRadius: 12,
          padding: 2,
          justifyContent: "center",
        },
        value ? { backgroundColor: "#3b82f6" } : { backgroundColor: "#cbd5e1" },
      ]}
    >
      <View
        style={[
          {
            width: 18,
            height: 18,
            borderRadius: 9,
            backgroundColor: "#ffffff",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.2,
            shadowRadius: 1.5,
            elevation: 2,
          },
          value ? { alignSelf: "flex-end" } : { alignSelf: "flex-start" },
        ]}
      />
    </Pressable>
  );
}

// Settings List Card Component
interface SettingsCardProps {
  icon?: string;
  iconType?: "feather" | "mci";
  label: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  labelColor?: string;
}

function SettingsCard({
  icon,
  iconType = "feather",
  label,
  onPress,
  rightElement,
  labelColor = "text-slate-800",
}: SettingsCardProps) {
  const content = (
    <View className="flex-row items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm mb-3">
      <View className="flex-row items-center flex-1" style={{ gap: 12 }}>
        {icon && (
          <View className="w-8 h-8 items-center justify-center">
            {iconType === "feather" ? (
              <Feather
                name={icon as React.ComponentProps<typeof Feather>["name"]}
                size={18}
                color={labelColor === "text-red-500" ? "#ef4444" : "#475569"}
              />
            ) : (
              <MaterialCommunityIcons
                name={icon as React.ComponentProps<typeof MaterialCommunityIcons>["name"]}
                size={20}
                color={labelColor === "text-red-500" ? "#ef4444" : "#475569"}
              />
            )}
          </View>
        )}
        <Text className={`font-bold text-sm ${labelColor}`}>{label}</Text>
      </View>
      {rightElement !== undefined ? (
        rightElement
      ) : (
        <Feather name="chevron-right" size={16} color="#94a3b8" />
      )}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} className="active:opacity-85">
        {content}
      </Pressable>
    );
  }

  return content;
}
