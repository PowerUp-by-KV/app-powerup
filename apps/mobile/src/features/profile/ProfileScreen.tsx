import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
  KeyboardAvoidingView,
  Platform,
  DimensionValue,
} from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSafeBack } from "@/hooks/useSafeBack";
import { useColorScheme } from "nativewind";

import { GamifiedMascotLoader } from "@/components/GamifiedMascotLoader";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path, Circle, Mask } from "react-native-svg";
import * as SecureStore from "expo-secure-store";

import { useGetProfileQuery } from "@/services/auth-api";
import { useGetStreakCalendarQuery } from "@/services/profile-api";
import { useGetModulesQuery, useLazyGetModuleDaysQuery } from "@/services/module-api";
import { useLogout } from "@/utils/auth";
import { getAvatarUri } from "@/utils/avatar";

export function ProfileScreen() {
  const router = useRouter();
  const safeBack = useSafeBack();

  const insets = useSafeAreaInsets();
  const { logout } = useLogout();
  const [tab, setTab] = useState<"stats" | "space">("space");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const { data: profile, isLoading } = useGetProfileQuery();

  const { data: modulesData } = useGetModulesQuery();
  const [triggerGetModuleDays] = useLazyGetModuleDaysQuery();
  const [moduleDaysData, setModuleDaysData] = useState<Record<string, any[]>>({});

  const personalizedPath = useMemo(() => {
    if (!modulesData) return null;
    return {
      modules: modulesData.map((m) => ({
        id: m.id,
        module_no: m.order_index,
        title: m.title,
        variant_id: null,
        is_unlocked: true,
      })),
    };
  }, [modulesData]);

  useEffect(() => {
    if (!personalizedPath?.modules?.length) return;
    const fetchAllDays = async () => {
      try {
        const promises = personalizedPath.modules.map(async (m) => {
          try {
            const data = await triggerGetModuleDays(m.id).unwrap();
            return { moduleId: m.id, days: data };
          } catch {
            return { moduleId: m.id, days: [] };
          }
        });
        const results = await Promise.all(promises);
        const newData: Record<string, any[]> = {};
        for (const res of results) {
          newData[res.moduleId] = res.days;
        }
        setModuleDaysData(newData);
      } catch {}
    };
    fetchAllDays();
  }, [personalizedPath, triggerGetModuleDays]);

  const daysCompletedCount = useMemo(() => {
    let count = 0;
    for (const key in moduleDaysData) {
      count += (moduleDaysData[key] || []).filter((d) => d.is_completed).length;
    }
    return count;
  }, [moduleDaysData]);

  const { colorScheme, setColorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

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
          const darkVal = storedDarkMode === "true";
          setColorScheme(darkVal ? "dark" : "light");
        }
        if (storedNotifications !== null) setNotificationsEnabled(storedNotifications === "true");
      } catch (error) {
        console.error("Failed to load settings", error);
      }
    };
    loadSettings();
  }, [setColorScheme]);

  const handleToggleDarkMode = async (value: boolean) => {
    setColorScheme(value ? "dark" : "light");
    try {
      if (Platform.OS === "web") {
        window.localStorage?.setItem("settings_dark_mode", String(value));
        if (typeof document !== "undefined") {
          if (value) {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
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
          window.localStorage?.setItem("settings_notifications", String(value));
        }
      } else {
        await SecureStore.setItemAsync("settings_notifications", String(value));
      }
    } catch {}
  };

  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"weekly" | "monthly">("monthly");

  const monthIso = useMemo(
    () =>
      `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, "0")}`,
    [currentDate],
  );
  const prevMonthIso = useMemo(() => {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}`;
  }, [currentDate]);
  const nextMonthIso = useMemo(() => {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}`;
  }, [currentDate]);

  const { data: calendar } = useGetStreakCalendarQuery(monthIso);
  const { data: prevCalendar } = useGetStreakCalendarQuery(prevMonthIso);
  const { data: nextCalendar } = useGetStreakCalendarQuery(nextMonthIso);

  const activeDates = useMemo(() => {
    const dates = new Set<string>();
    [calendar, prevCalendar, nextCalendar].forEach((cal) =>
      cal?.days?.filter((d) => d.active).forEach((d) => dates.add(d.date)),
    );
    return dates;
  }, [calendar, prevCalendar, nextCalendar]);

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

    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const dayNum = totalDaysInPrevMonth - i;
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const dateStr = `${prevYear}-${(prevMonth + 1).toString().padStart(2, "0")}-${dayNum.toString().padStart(2, "0")}`;
      days.push({
        date: dateStr,
        dayNumber: dayNum,
        isCurrentMonth: false,
        active: activeDates.has(dateStr),
      });
    }
    for (let i = 1; i <= totalDaysInMonth; i++) {
      const dateStr = `${year}-${(month + 1).toString().padStart(2, "0")}-${i.toString().padStart(2, "0")}`;
      days.push({
        date: dateStr,
        dayNumber: i,
        isCurrentMonth: true,
        active: activeDates.has(dateStr),
      });
    }
    const remainingCells = 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      const dateStr = `${nextYear}-${(nextMonth + 1).toString().padStart(2, "0")}-${i.toString().padStart(2, "0")}`;
      days.push({
        date: dateStr,
        dayNumber: i,
        isCurrentMonth: false,
        active: activeDates.has(dateStr),
      });
    }
    return days;
  }, [currentDate, activeDates]);

  const displayedDays = useMemo(() => {
    if (viewMode === "monthly") return allGridDays;
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
    const fullMonthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const shortMonthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    if (viewMode === "monthly") return fullMonthNames[currentDate.getMonth()];
    const weekStart = displayedDays[0];
    const weekEnd = displayedDays[6];
    if (!weekStart || !weekEnd) return "";
    const parseDateStr = (dateStr: string) => {
      const [, m, d] = dateStr.split("-").map(Number);
      return { month: shortMonthNames[(m ?? 1) - 1], day: d ?? 1 };
    };
    const start = parseDateStr(weekStart.date);
    const end = parseDateStr(weekEnd.date);
    return start.month === end.month
      ? `${start.month} ${start.day} – ${end.day}`
      : `${start.month} ${start.day} – ${end.month} ${end.day}`;
  }, [viewMode, currentDate, displayedDays]);

  const handlePrev = () => {
    if (viewMode === "weekly")
      setCurrentDate((p) => new Date(p.getFullYear(), p.getMonth(), p.getDate() - 7));
    else setCurrentDate((p) => new Date(p.getFullYear(), p.getMonth() - 1, 1));
  };
  const handleNext = () => {
    if (viewMode === "weekly")
      setCurrentDate((p) => new Date(p.getFullYear(), p.getMonth(), p.getDate() + 7));
    else setCurrentDate((p) => new Date(p.getFullYear(), p.getMonth() + 1, 1));
  };

  const todayStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`;
  }, []);

  const xpProgress = profile?.total_modules
    ? (profile.modules_completed / profile.total_modules) * 100
    : 0;

  if (isLoading) return <GamifiedMascotLoader title="Loading Profile..." />;

  const firstName = (profile?.nickname ?? profile?.name ?? "there")?.split(" ")[0];

  return (
    <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: "#0f0c29" }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── HERO ── */}
          <LinearGradient
            colors={["#1a1060", "#2d1f8c", "#3b2fd6", "#4c3bde"]}
            start={{ x: 0.1, y: 0 }}
            end={{ x: 0.9, y: 1 }}
            style={{
              paddingHorizontal: 20,
              paddingTop: 14,
              paddingBottom: 0,
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Subtle decorative orbs */}
            <View
              style={{
                position: "absolute",
                top: -40,
                right: -40,
                width: 160,
                height: 160,
                borderRadius: 80,
                backgroundColor: "rgba(120,100,255,0.12)",
              }}
            />
            <View
              style={{
                position: "absolute",
                bottom: 30,
                left: -30,
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: "rgba(100,80,220,0.1)",
              }}
            />

            {/* Top bar */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 24,
              }}
            >
              <Pressable
                onPress={() => safeBack()}
                style={({ pressed }) => ({
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: pressed ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.07)",
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.25)",
                })}
              >
                <Feather name="arrow-left" size={18} color="rgba(255,255,255,0.85)" />
              </Pressable>
            </View>
            {/* Profile row */}
            <View
              style={{ flexDirection: "row", alignItems: "flex-end", gap: 16, marginBottom: 24 }}
            >
              {/* Avatar */}
              <Pressable onPress={() => router.push("/profile/avatar" as never)}>
                <View
                  style={{
                    width: 84,
                    height: 84,
                    borderRadius: 42,
                    borderWidth: 2.5,
                    borderColor: "#a78bfa",
                    padding: 3,
                    backgroundColor: "rgba(255,255,255,0.08)",
                  }}
                >
                  <Image
                    source={{ uri: getAvatarUri(profile?.avatar_id, profile?.id) }}
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: 100,
                      resizeMode: "cover",
                    }}
                  />
                  <View
                    style={{
                      position: "absolute",
                      bottom: 1,
                      right: 1,
                      width: 22,
                      height: 22,
                      borderRadius: 11,
                      backgroundColor: "#6d28d9",
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: 2,
                      borderColor: "#2d1f8c",
                    }}
                  >
                    <Feather name="edit-2" size={9} color="#fff" />
                  </View>
                </View>
              </Pressable>

              {/* Name block */}
              <View style={{ flex: 1, paddingBottom: 4 }}>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.5)",
                    fontSize: 12,
                    fontWeight: "400",
                    marginBottom: 3,
                    letterSpacing: 0.2,
                  }}
                >
                  Hey, {firstName}
                </Text>
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 23,
                    fontWeight: "700",
                    lineHeight: 27,
                    letterSpacing: -0.4,
                    marginBottom: 8,
                  }}
                >
                  {profile?.nickname ?? profile?.name ?? "User"}
                </Text>
                {/* Level pill */}
                <View
                  style={{
                    alignSelf: "flex-start",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 5,
                    backgroundColor: "rgba(167,139,250,0.18)",
                    borderWidth: 1,
                    borderColor: "rgba(167,139,250,0.35)",
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 10,
                  }}
                >
                  <Text style={{ fontSize: 10 }}>⚡</Text>
                  <Text style={{ color: "#c4b5fd", fontSize: 11, fontWeight: "500" }}>
                    Level {profile?.current_level ?? 1} Learner
                  </Text>
                </View>
              </View>
            </View>

            {/* Streak chip — single line, right-anchored */}
            <View style={{ flexDirection: "row", justifyContent: "flex-end", marginBottom: 28 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  backgroundColor: "rgba(255,255,255,0.08)",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.14)",
                  paddingHorizontal: 12,
                  paddingVertical: 7,
                  borderRadius: 14,
                }}
              >
                <Text style={{ fontSize: 14 }}>🔥</Text>
                <Text style={{ color: "#fff", fontSize: 14, fontWeight: "600" }}>
                  {profile?.streak_count ?? 0}
                </Text>
                <Text style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, fontWeight: "400" }}>
                  day streak
                </Text>
              </View>
            </View>

            {/* SVG arc — the curve that transitions hero → body */}
            <Svg
              width="100%"
              height={28}
              viewBox="0 0 390 28"
              preserveAspectRatio="none"
              style={{ marginBottom: -1 }}
            >
              <Path d="M0 28 Q195 0 390 28 L390 28 L0 28Z" fill={isDark ? "#0F1020" : "#f0f2ff"} />
            </Svg>
          </LinearGradient>

          {/* ── BODY ── */}
          <View style={{ flex: 1, backgroundColor: isDark ? "#0F1020" : "#f0f2ff" }}>
            {/* ── STAT CARDS — 2×2 grid matching reference design ── */}
            <View className="flex-1 flex-row items-center gap-2 py-2.5 px-1">
              <StatCard
                icon={<Feather name="zap" size={22} color="#fff" />}
                value={`${profile?.total_xp ?? 0}`}
                label="XP Points"
              />
              <StatCard
                icon={<Feather name="book-open" size={20} color="#fff" />}
                value={`${daysCompletedCount}`}
                label="Completed"
              />
              <StatCard
                icon={<MaterialCommunityIcons name="star-four-points" size={22} color="#fff" />}
                value={`${profile?.current_level ?? 0}`}
                label="Level"
              />
            </View>

            {/* Tab bar */}
            <View
              style={{
                flexDirection: "row",
                paddingHorizontal: 20,
                marginTop: 10,
                gap: 28,
                borderBottomWidth: 1,
                borderBottomColor: isDark ? "#2D3142" : "#e0e4f0",
              }}
            >
              {(["space", "stats"] as const).map((t) => {
                const isActive = tab === t;
                return (
                  <Pressable
                    key={t}
                    onPress={() => setTab(t)}
                    style={{ paddingVertical: 12, position: "relative" }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: isActive ? "600" : "400",
                        color: isActive
                          ? isDark
                            ? "#3b82f6"
                            : "#3b82f6"
                          : isDark
                            ? "#64748b"
                            : "#94a3b8",
                        letterSpacing: 0.1,
                      }}
                    >
                      {t === "space" ? "My Space" : "My Stats"}
                    </Text>
                    {isActive && (
                      <View
                        style={{
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: 2,
                          backgroundColor: "#3b82f6",
                          borderRadius: 1,
                        }}
                      />
                    )}
                  </Pressable>
                );
              })}
            </View>

            {/* ── MY SPACE TAB ── */}
            {tab === "space" ? (
              <View
                style={{
                  paddingHorizontal: 16,
                  paddingTop: 20,
                  paddingBottom: insets.bottom + 80,
                }}
              >
                <SectionLabel text="Settings" />

                {/* Settings grouped as one card */}
                <View
                  style={{
                    backgroundColor: isDark ? "#1E1F2A" : "#fff",
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: isDark ? "#2D3142" : "#e8ecf5",
                    overflow: "hidden",
                    marginBottom: 20,
                  }}
                >
                  <SettingsRow
                    icon="user"
                    label="Personal details"
                    onPress={() => router.push("/profile/edit" as never)}
                  />
                  <SettingsRow
                    icon="translate"
                    iconType="mci"
                    label="Language"
                    onPress={() => router.push("/profile/language" as never)}
                  />
                  <SettingsRow icon="key" label="Passwords" onPress={() => {}} />
                  <SettingsRow
                    icon="sun"
                    label="Dark mode"
                    rightElement={
                      <CustomSwitch value={isDark} onValueChange={handleToggleDarkMode} />
                    }
                  />
                  <SettingsRow
                    icon="bell"
                    label="Notifications"
                    rightElement={
                      <CustomSwitch
                        value={notificationsEnabled}
                        onValueChange={handleToggleNotifications}
                      />
                    }
                    isLast
                  />
                </View>

                <SectionLabel text="Support" />

                <View
                  style={{
                    backgroundColor: isDark ? "#1E1F2A" : "#fff",
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: isDark ? "#2D3142" : "#e8ecf5",
                    overflow: "hidden",
                    marginBottom: 20,
                  }}
                >
                  <SettingsRow icon="info" label="About us" onPress={() => {}} />
                  <SettingsRow icon="shield" label="Privacy & security" onPress={() => {}} />
                  <SettingsRow
                    icon="log-out"
                    label="Log out"
                    labelColor="#ef4444"
                    onPress={logout}
                    rightElement={<View />}
                    isLast
                  />
                </View>

                {/* Premium banner */}
                <PremiumBanner onPress={() => router.push("/subscription" as never)} />
              </View>
            ) : (
              /* ── MY STATS TAB ── */
              <View
                style={{
                  paddingHorizontal: 16,
                  paddingTop: 20,
                  paddingBottom: insets.bottom + 80,
                }}
              >
                {/* Calendar header */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 14,
                  }}
                >
                  <Text
                    style={{
                      color: isDark ? "#ffffff" : "#1e293b",
                      fontWeight: "600",
                      fontSize: 15,
                      letterSpacing: -0.2,
                    }}
                  >
                    Streak calendar
                  </Text>
                  <Pressable
                    onPress={() => setViewMode(viewMode === "weekly" ? "monthly" : "weekly")}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                      backgroundColor: "#1e293b",
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 20,
                    }}
                  >
                    <Text
                      style={{
                        color: "#fff",
                        fontSize: 12,
                        fontWeight: "500",
                        textTransform: "capitalize",
                      }}
                    >
                      {viewMode}
                    </Text>
                    <Feather name="chevron-down" size={11} color="rgba(255,255,255,0.7)" />
                  </Pressable>
                </View>

                {/* Calendar card */}
                <View
                  style={{
                    backgroundColor: isDark ? "#1E1F2A" : "#fff",
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: isDark ? "#2D3142" : "#e8ecf5",
                    padding: 18,
                    marginBottom: 16,
                  }}
                >
                  {/* Month nav */}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 16,
                    }}
                  >
                    <Pressable
                      onPress={handlePrev}
                      style={{
                        width: 32,
                        height: 32,
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 16,
                        backgroundColor: isDark ? "#2A2C3E" : "#f0f2ff",
                      }}
                    >
                      <Feather name="chevron-left" size={16} color="#3b82f6" />
                    </Pressable>
                    <Text
                      style={{
                        color: isDark ? "#ffffff" : "#1e293b",
                        fontWeight: "600",
                        fontSize: 15,
                      }}
                    >
                      {headerLabel}
                    </Text>
                    <Pressable
                      onPress={handleNext}
                      style={{
                        width: 32,
                        height: 32,
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 16,
                        backgroundColor: isDark ? "#2A2C3E" : "#f0f2ff",
                      }}
                    >
                      <Feather name="chevron-right" size={16} color="#3b82f6" />
                    </Pressable>
                  </View>

                  {/* Weekday labels */}
                  <View style={{ flexDirection: "row", marginBottom: 8 }}>
                    {["S", "M", "T", "W", "T", "F", "S"].map((day, idx) => (
                      <Text
                        key={idx}
                        style={{
                          width: "14.28%",
                          textAlign: "center",
                          color: "#94a3b8",
                          fontWeight: "500",
                          fontSize: 11,
                        }}
                      >
                        {day}
                      </Text>
                    ))}
                  </View>

                  {/* Days grid */}
                  <View>
                    {(() => {
                      const rows: (typeof displayedDays)[] = [];
                      for (let i = 0; i < displayedDays.length; i += 7)
                        rows.push(displayedDays.slice(i, i + 7));
                      return rows.map((rowDays, rowIndex) => {
                        const segments: Array<{ start: number; end: number }> = [];
                        let currentStart: number | null = null;
                        for (let i = 0; i < 7; i++) {
                          if (rowDays[i]?.active) {
                            if (currentStart === null) currentStart = i;
                          } else if (currentStart !== null) {
                            segments.push({ start: currentStart, end: i - 1 });
                            currentStart = null;
                          }
                        }
                        if (currentStart !== null) segments.push({ start: currentStart, end: 6 });

                        return (
                          <View
                            key={rowIndex}
                            style={{
                              flexDirection: "row",
                              width: "100%",
                              position: "relative",
                              marginBottom: 2,
                              height: 38,
                            }}
                          >
                            {/* Gradient Background Layer */}
                            <View
                              style={{
                                position: "absolute",
                                top: 4,
                                bottom: 4,
                                left: 0,
                                right: 0,
                                flexDirection: "row",
                                zIndex: 1,
                              }}
                            >
                              {(() => {
                                let lastEnd = -1;
                                const items = [];
                                segments.forEach((seg, i) => {
                                  const spaceBefore = seg.start - lastEnd - 1;
                                  if (spaceBefore > 0)
                                    items.push(
                                      <View key={`s-${i}`} style={{ flex: spaceBefore }} />,
                                    );

                                  items.push(
                                    <View
                                      key={`g-${i}`}
                                      style={{
                                        flex: seg.end - seg.start + 1,
                                        paddingHorizontal: 2,
                                      }}
                                    >
                                      <LinearGradient
                                        colors={
                                          isDark
                                            ? [
                                                "rgba(113, 116, 246, 0.15)",
                                                "rgba(113, 116, 246, 0.15)",
                                              ]
                                            : [
                                                "rgba(59, 130, 246, 0.08)",
                                                "rgba(59, 130, 246, 0.08)",
                                              ]
                                        } // dark or light indigo/blue soft transparent highlights
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={{ flex: 1, borderRadius: 15 }}
                                      />
                                    </View>,
                                  );
                                  lastEnd = seg.end;
                                });
                                const spaceAfter = 6 - lastEnd;
                                if (spaceAfter > 0)
                                  items.push(<View key={`end`} style={{ flex: spaceAfter }} />);
                                return items;
                              })()}
                            </View>
                            {rowDays.map((dayObj, dayIdx) => {
                              const isToday = dayObj.date === todayStr;

                              return (
                                <View
                                  key={`${dayObj.date}-${dayIdx}`}
                                  style={{
                                    width: "14.2857%",
                                    height: 38,
                                    justifyContent: "center",
                                    alignItems: "center",
                                    zIndex: 10,
                                  }}
                                >
                                  {isToday ? (
                                    <View
                                      style={{
                                        width: 30,
                                        height: 30,
                                        borderRadius: 15,
                                        backgroundColor: "#3b82f6",
                                        alignItems: "center",
                                        justifyContent: "center",
                                      }}
                                    >
                                      <Text
                                        style={{ color: "#fff", fontWeight: "600", fontSize: 13 }}
                                      >
                                        {dayObj.dayNumber}
                                      </Text>
                                    </View>
                                  ) : dayObj.active ? (
                                    <Text
                                      style={{
                                        color: "#3b82f6",
                                        fontWeight: "600",
                                        fontSize: 13,
                                      }}
                                    >
                                      {dayObj.dayNumber}
                                    </Text>
                                  ) : (
                                    <Text
                                      style={{
                                        color: dayObj.isCurrentMonth
                                          ? isDark
                                            ? "#cbd5e1"
                                            : "#334155"
                                          : isDark
                                            ? "#4b5563"
                                            : "#cbd5e1",
                                        fontWeight: "400",
                                        fontSize: 13,
                                      }}
                                    >
                                      {dayObj.dayNumber}
                                    </Text>
                                  )}
                                </View>
                              );
                            })}
                          </View>
                        );
                      });
                    })()}
                  </View>
                </View>

                {/* Progress summary */}
                <View
                  style={{
                    backgroundColor: isDark ? "#1E1F2A" : "#fff",
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: isDark ? "#2D3142" : "#e8ecf5",
                    padding: 18,
                    marginBottom: 16,
                  }}
                >
                  <Text
                    style={{
                      color: isDark ? "#ffffff" : "#1e293b",
                      fontWeight: "600",
                      fontSize: 15,
                      marginBottom: 18,
                    }}
                  >
                    Progress overview
                  </Text>

                  <ProgressRow
                    label="Total XP"
                    valueLabel={`${profile?.total_xp ?? 0} XP`}
                    fillColor="#3b82f6"
                    percent={75}
                  />
                  <ProgressRow
                    label="Modules"
                    valueLabel={`${profile?.modules_completed ?? 0} / ${profile?.total_modules ?? 0}`}
                    fillColor="#059669"
                    percent={xpProgress}
                  />
                  <ProgressRow
                    label="Daily streak"
                    valueLabel={`${profile?.streak_count ?? 0} days 🔥`}
                    fillColor="#f97316"
                    percent={60}
                    isLast
                  />
                </View>

                <PremiumBanner onPress={() => router.push("/subscription" as never)} />
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ── Section label ──
function SectionLabel({ text }: { text: string }) {
  return (
    <Text
      style={{
        color: "#94a3b8",
        fontWeight: "500",
        fontSize: 11,
        marginBottom: 10,
        paddingHorizontal: 2,
        letterSpacing: 0.8,
        textTransform: "uppercase",
      }}
    >
      {text}
    </Text>
  );
}

// ── Settings row (inside a grouped card) ──
interface SettingsRowProps {
  icon?: string;
  iconType?: "feather" | "mci";
  label: string;
  labelColor?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  isLast?: boolean;
}

function SettingsRow({
  icon,
  iconType = "feather",
  label,
  labelColor,
  onPress,
  rightElement,
  isLast = false,
}: SettingsRowProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const finalLabelColor = labelColor ?? (isDark ? "#ffffff" : "#1e293b");
  const iconColor = labelColor ?? (isDark ? "#94a3b8" : "#64748b");

  const inner = (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 13,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: isDark ? "#2D3142" : "#f1f3f8",
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", flex: 1, gap: 12 }}>
        {icon && (
          <View
            style={{
              width: 34,
              height: 34,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {iconType === "feather" ? (
              <Feather
                name={icon as React.ComponentProps<typeof Feather>["name"]}
                size={18}
                color={iconColor}
              />
            ) : (
              <MaterialCommunityIcons
                name={icon as React.ComponentProps<typeof MaterialCommunityIcons>["name"]}
                size={20}
                color={iconColor}
              />
            )}
          </View>
        )}
        <Text style={{ fontWeight: "400", fontSize: 14, color: finalLabelColor }}>{label}</Text>
      </View>
      {rightElement !== undefined ? (
        rightElement
      ) : (
        <Feather name="chevron-right" size={15} color={isDark ? "#4b5563" : "#d1d5db"} />
      )}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}>
        {inner}
      </Pressable>
    );
  }
  return inner;
}

// ── Stat card — blue square icon + bold number + label (2×2 grid) ──
function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  return (
    <View
      style={{
        width: "33.33%",
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 10,
        paddingHorizontal: 4,
      }}
    >
      {/* Blue rounded square icon */}
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          backgroundColor: "#3b82f6",
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#3b82f6",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.25,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        {icon}
      </View>
      {/* Number + label */}
      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: isDark ? "#ffffff" : "#1e293b",
            fontWeight: "700",
            fontSize: 20,
            lineHeight: 24,
            letterSpacing: -0.3,
          }}
        >
          {value}
        </Text>
        <Text
          style={{
            color: isDark ? "#a1a1aa" : "#94a3b8",
            fontWeight: "400",
            fontSize: 12,
            marginTop: 2,
            letterSpacing: 0.1,
          }}
        >
          {label}
        </Text>
      </View>
    </View>
  );
}

// ── Progress row ──
function ProgressRow({
  label,
  valueLabel,
  fillColor,
  percent,
  isLast = false,
}: {
  label: string;
  valueLabel: string;
  fillColor: string;
  percent: number;
  isLast?: boolean;
}) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  return (
    <View style={{ marginBottom: isLast ? 0 : 18 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 7 }}>
        <Text style={{ color: isDark ? "#a1a1aa" : "#64748b", fontWeight: "400", fontSize: 13 }}>
          {label}
        </Text>
        <Text style={{ color: fillColor, fontWeight: "600", fontSize: 13 }}>{valueLabel}</Text>
      </View>
      <View
        style={{
          height: 5,
          backgroundColor: isDark ? "#2A2C3E" : "#eef0f7",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            height: "100%",
            width: `${Math.min(percent, 100)}%` as DimensionValue,
            backgroundColor: fillColor,
            borderRadius: 3,
          }}
        />
      </View>
    </View>
  );
}

// ── Custom toggle switch ──
function CustomSwitch({
  value,
  onValueChange,
}: {
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      style={[
        { width: 42, height: 24, borderRadius: 12, padding: 3, justifyContent: "center" },
        { backgroundColor: value ? "#3b82f6" : isDark ? "#3F3F46" : "#cbd5e1" },
      ]}
    >
      <View
        style={[
          {
            width: 18,
            height: 18,
            borderRadius: 9,
            backgroundColor: "#fff",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.15,
            shadowRadius: 1.5,
            elevation: 2,
          },
          value ? { alignSelf: "flex-end" } : { alignSelf: "flex-start" },
        ]}
      />
    </Pressable>
  );
}

// ── Premium banner ──
function PremiumBanner({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}>
      <LinearGradient
        colors={["#5ba6f5", "#8ae0b7"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.5 }}
        style={{ borderRadius: 22, padding: 22, overflow: "hidden", position: "relative" }}
      >
        {/* Subtle ring decorations */}
        <View
          style={{
            position: "absolute",
            right: -24,
            bottom: -24,
            width: 120,
            height: 120,
            borderRadius: 60,
            borderWidth: 20,
            borderColor: "rgba(255, 255, 255, 0.12)",
          }}
        />
        <View
          style={{
            position: "absolute",
            right: 15,
            top: -30,
            width: 100,
            height: 100,
            borderRadius: 50,
            borderWidth: 15,
            borderColor: "rgba(255, 255, 255, 0.08)",
          }}
        />

        <Text
          style={{
            color: "#ffffff",
            fontSize: 12,
            fontWeight: "500",
            marginBottom: 8,
            letterSpacing: 0.2,
          }}
        >
          Supercharge Your Communication With
        </Text>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Text style={{ color: "#ffffff", fontSize: 32, fontWeight: "800", letterSpacing: -0.5 }}>
            lumino
          </Text>

          <Svg
            width={26}
            height={26}
            viewBox="0 0 100 100"
            style={{ transform: [{ translateY: 1 }] }}
          >
            <Mask id="star-mask">
              <Circle cx="50" cy="50" r="50" fill="#ffffff" />
              <Path
                d="M 50 15 Q 50 50 15 50 Q 50 50 50 85 Q 50 50 85 50 Q 50 50 50 15 Z"
                fill="#000000"
              />
            </Mask>
            <Circle cx="50" cy="50" r="50" fill="#ffffff" mask="url(#star-mask)" />
          </Svg>

          <LinearGradient
            colors={["#5881F5", "#E5E770"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 5,
              borderRadius: 12,
              marginLeft: 8,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                color: "#ffffff",
                fontSize: 10,
                fontWeight: "800",
                textTransform: "capitalize",
              }}
            >
              Premium
            </Text>
          </LinearGradient>
        </View>
      </LinearGradient>
    </Pressable>
  );
}
