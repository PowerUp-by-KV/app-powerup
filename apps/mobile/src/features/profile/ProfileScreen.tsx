import React, { useState, useMemo } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, Platform } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSafeBack } from "@/hooks/useSafeBack";
import { useColorScheme } from "nativewind";
import * as SecureStore from "expo-secure-store";
import { GamifiedMascotLoader } from "@/components/GamifiedMascotLoader";
import { useGetProfileQuery } from "@/services/auth-api";
import { useGetStreakCalendarQuery } from "@/services/profile-api";
import { useLogout } from "@/utils/auth";
import { getAvatarUri } from "@/utils/avatar";
import { Image } from "react-native";

const BLUE = "#5B6BF5";

const MONTH_NAMES = [
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

function buildColors(dark: boolean) {
  return {
    bg: dark ? "#13132A" : "#FFFFFF",
    bodyBg: dark ? "#0A0A1A" : "#F5F6FA",
    cardBg: dark ? "#1A1A32" : "#FFFFFF",
    text: dark ? "#FFFFFF" : "#1A1A2A",
    textSub: dark ? "rgba(255,255,255,0.45)" : "#8896A7",
    border: dark ? "rgba(255,255,255,0.07)" : "#EAECF4",
    divider: dark ? "rgba(255,255,255,0.05)" : "#F0F2FA",
    iconBg: dark ? "#1E2030" : "#F3F4F8",
    iconColor: dark ? "rgba(255,255,255,0.75)" : "#2C2C3A",
    streakBg: dark ? "rgba(91,107,245,0.18)" : "#EEF2FF",
    progressBg: dark ? "rgba(255,255,255,0.1)" : "#C8CEED",
    levelBoxBg: dark ? "rgba(255,255,255,0.06)" : "#EEF0FF",
    backBtnBg: dark ? "rgba(255,255,255,0.06)" : "#F0F2FA",
    calNavBg: dark ? "rgba(255,255,255,0.07)" : "#EEF2FF",
  };
}

// ── StatChip: blue rounded square icon + text OUTSIDE ──────────────────────
function StatChip({
  value,
  iconName,
  iconType = "mci",
  label,
  colors,
}: {
  value: number;
  iconName: string;
  iconType?: "feather" | "mci";
  label: string;
  colors: ReturnType<typeof buildColors>;
}) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <View
        style={{
          width: 42,
          height: 42,
          borderRadius: 12,
          backgroundColor: BLUE,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {iconType === "mci" ? (
          <MaterialCommunityIcons name={iconName as any} size={20} color="#FFFFFF" />
        ) : (
          <Feather name={iconName as any} size={18} color="#FFFFFF" />
        )}
      </View>
      <View style={{ gap: 1 }}>
        <Text style={{ fontSize: 15, fontWeight: "800", color: colors.text, lineHeight: 18 }}>
          {value}
        </Text>
        <Text style={{ fontSize: 11, fontWeight: "500", color: colors.textSub, lineHeight: 14 }}>
          {label}
        </Text>
      </View>
    </View>
  );
}

// ── Toggle ──────────────────────────────────────────────────────────────────
function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <Pressable
      onPress={() => onChange(!value)}
      style={{
        width: 44,
        height: 26,
        borderRadius: 13,
        padding: 3,
        justifyContent: "center",
        backgroundColor: value ? BLUE : "rgba(148,163,184,0.4)",
      }}
    >
      <View
        style={{
          width: 20,
          height: 20,
          borderRadius: 10,
          backgroundColor: "#FFFFFF",
          alignSelf: value ? "flex-end" : "flex-start",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.15,
          shadowRadius: 2,
          elevation: 2,
        }}
      />
    </Pressable>
  );
}

// ── SettingsRow: each is its own card, icon plain outline on gray bg ────────
function SettingsRow({
  iconName,
  iconType = "feather",
  label,
  labelColor,
  onPress,
  rightElement,
  colors,
}: {
  iconName: string;
  iconType?: "feather" | "mci";
  label: string;
  labelColor?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  colors: ReturnType<typeof buildColors>;
}) {
  const inner = (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 15,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", flex: 1, gap: 14 }}>
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: colors.iconBg,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {iconType === "feather" ? (
            <Feather name={iconName as any} size={16} color={colors.iconColor} />
          ) : (
            <MaterialCommunityIcons name={iconName as any} size={18} color={colors.iconColor} />
          )}
        </View>
        <Text style={{ fontSize: 15, fontWeight: "600", color: labelColor ?? colors.text }}>
          {label}
        </Text>
      </View>
      {rightElement !== undefined ? (
        rightElement
      ) : (
        <Feather name="chevron-right" size={16} color={colors.textSub} />
      )}
    </View>
  );

  return (
    <View
      style={{
        backgroundColor: colors.cardBg,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 10,
        overflow: "hidden",
      }}
    >
      {onPress ? (
        <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
          {inner}
        </Pressable>
      ) : (
        inner
      )}
    </View>
  );
}

// ── SimpleRow: About Us / Privacy — no icon, own card ──────────────────────
function SimpleRow({
  label,
  onPress,
  colors,
}: {
  label: string;
  onPress?: () => void;
  colors: ReturnType<typeof buildColors>;
}) {
  const inner = (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 16,
      }}
    >
      <Text style={{ fontSize: 15, fontWeight: "600", color: colors.text }}>{label}</Text>
      <Feather name="chevron-right" size={16} color={colors.textSub} />
    </View>
  );

  return (
    <View
      style={{
        backgroundColor: colors.cardBg,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 10,
        overflow: "hidden",
      }}
    >
      {onPress ? (
        <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
          {inner}
        </Pressable>
      ) : (
        inner
      )}
    </View>
  );
}

// ── PremiumBanner ───────────────────────────────────────────────────────────
function PremiumBanner({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1, marginTop: 8 })}
    >
      <LinearGradient
        colors={["#1A1060", "#2D1F8C", "#3B2FD6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius: 22, padding: 22, overflow: "hidden", position: "relative" }}
      >
        <View
          style={{
            position: "absolute",
            right: -24,
            bottom: -24,
            width: 110,
            height: 110,
            borderRadius: 55,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.07)",
          }}
        />
        <View
          style={{
            position: "absolute",
            right: 20,
            top: -16,
            width: 65,
            height: 65,
            borderRadius: 32.5,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.05)",
          }}
        />
        <Text style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, marginBottom: 6 }}>
          Supercharge Your Communication With
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 18 }}>
          <Text style={{ color: "#fff", fontSize: 22, fontWeight: "700", letterSpacing: -0.4 }}>
            lumino ✦
          </Text>
          <View
            style={{
              paddingHorizontal: 9,
              paddingVertical: 3,
              borderRadius: 6,
              backgroundColor: "#C4B97A",
            }}
          >
            <Text
              style={{
                color: "#1A0F3C",
                fontSize: 9,
                fontWeight: "700",
                letterSpacing: 1,
                textTransform: "uppercase",
              }}
            >
              Premium
            </Text>
          </View>
        </View>
        <View
          style={{
            alignSelf: "flex-start",
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.2)",
            backgroundColor: "rgba(255,255,255,0.08)",
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 20,
          }}
        >
          <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 12, fontWeight: "500" }}>
            Explore plans
          </Text>
          <Feather name="arrow-right" size={12} color="rgba(255,255,255,0.6)" />
        </View>
      </LinearGradient>
    </Pressable>
  );
}

// ── StreakCalendar ──────────────────────────────────────────────────────────
function StreakCalendar({
  colors,
  activeDates,
}: {
  colors: ReturnType<typeof buildColors>;
  activeDates: Set<string>;
}) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const gridDays = useMemo(() => {
    const yr = currentDate.getFullYear();
    const mo = currentDate.getMonth();
    const startDow = new Date(yr, mo, 1).getDay();
    const daysInMonth = new Date(yr, mo + 1, 0).getDate();
    const daysInPrevMonth = new Date(yr, mo, 0).getDate();
    const days: { date: string; dayNumber: number; isCurrentMonth: boolean; active: boolean }[] =
      [];

    for (let i = startDow - 1; i >= 0; i--) {
      const n = daysInPrevMonth - i;
      const pm = mo === 0 ? 11 : mo - 1;
      const py = mo === 0 ? yr - 1 : yr;
      const ds = `${py}-${(pm + 1).toString().padStart(2, "0")}-${n.toString().padStart(2, "0")}`;
      days.push({ date: ds, dayNumber: n, isCurrentMonth: false, active: activeDates.has(ds) });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const ds = `${yr}-${(mo + 1).toString().padStart(2, "0")}-${i.toString().padStart(2, "0")}`;
      days.push({ date: ds, dayNumber: i, isCurrentMonth: true, active: activeDates.has(ds) });
    }
    for (let i = 1; days.length < 42; i++) {
      const nm = mo === 11 ? 0 : mo + 1;
      const ny = mo === 11 ? yr + 1 : yr;
      const ds = `${ny}-${(nm + 1).toString().padStart(2, "0")}-${i.toString().padStart(2, "0")}`;
      days.push({ date: ds, dayNumber: i, isCurrentMonth: false, active: activeDates.has(ds) });
    }
    return days;
  }, [currentDate, activeDates]);

  const todayStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`;
  }, []);

  const rows: (typeof gridDays)[] = [];
  for (let i = 0; i < gridDays.length; i += 7) rows.push(gridDays.slice(i, i + 7));

  return (
    <View
      style={{
        backgroundColor: colors.cardBg,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 18,
        marginBottom: 20,
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
          onPress={() => setCurrentDate((p) => new Date(p.getFullYear(), p.getMonth() - 1, 1))}
          style={({ pressed }) => ({
            width: 32,
            height: 32,
            borderRadius: 16,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: pressed ? colors.streakBg : colors.calNavBg,
          })}
        >
          <Feather name="chevron-left" size={16} color={colors.textSub} />
        </Pressable>
        <Text style={{ fontSize: 15, fontWeight: "700", color: colors.text }}>
          {MONTH_NAMES[currentDate.getMonth()]}
        </Text>
        <Pressable
          onPress={() => setCurrentDate((p) => new Date(p.getFullYear(), p.getMonth() + 1, 1))}
          style={({ pressed }) => ({
            width: 32,
            height: 32,
            borderRadius: 16,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: pressed ? colors.streakBg : colors.calNavBg,
          })}
        >
          <Feather name="chevron-right" size={16} color={colors.textSub} />
        </Pressable>
      </View>

      {/* Day headers */}
      <View style={{ flexDirection: "row", marginBottom: 10 }}>
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <Text
            key={i}
            style={{
              width: "14.28%",
              textAlign: "center",
              fontSize: 11,
              fontWeight: "600",
              color: colors.textSub,
            }}
          >
            {d}
          </Text>
        ))}
      </View>

      {/* Grid */}
      {rows.map((rowDays, ri) => {
        const segs: { start: number; end: number }[] = [];
        let cur: number | null = null;
        for (let i = 0; i < 7; i++) {
          if (rowDays[i]?.active) {
            if (cur === null) cur = i;
          } else if (cur !== null) {
            segs.push({ start: cur, end: i - 1 });
            cur = null;
          }
        }
        if (cur !== null) segs.push({ start: cur, end: 6 });

        return (
          <View key={ri} style={{ height: 38, position: "relative", marginBottom: 2 }}>
            {segs.map((seg, si) => (
              <View
                key={si}
                style={{
                  position: "absolute",
                  left: `${seg.start * 14.2857}%` as any,
                  width: `${(seg.end - seg.start + 1) * 14.2857}%` as any,
                  top: 4,
                  height: 30,
                  borderRadius: 15,
                  backgroundColor: colors.streakBg,
                }}
              />
            ))}
            <View
              style={{
                flexDirection: "row",
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
            >
              {rowDays.map((day, di) => {
                const isToday = day.date === todayStr;
                return (
                  <View
                    key={di}
                    style={{
                      width: "14.2857%",
                      height: 38,
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 10,
                    }}
                  >
                    {isToday ? (
                      <View
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 15,
                          backgroundColor: BLUE,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text style={{ color: "#fff", fontSize: 13, fontWeight: "700" }}>
                          {day.dayNumber}
                        </Text>
                      </View>
                    ) : (
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: day.active ? "700" : "400",
                          color: day.active
                            ? BLUE
                            : day.isCurrentMonth
                              ? colors.text
                              : colors.textSub,
                          opacity: day.isCurrentMonth ? 1 : 0.5,
                        }}
                      >
                        {day.dayNumber}
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        );
      })}
    </View>
  );
}

// ── Main ProfileScreen ──────────────────────────────────────────────────────
export function ProfileScreen() {
  const router = useRouter();
  const safeBack = useSafeBack();
  const insets = useSafeAreaInsets();
  const { logout } = useLogout();

  const [tab, setTab] = useState<"space" | "stats">("space");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notificationsOn, setNotificationsOn] = useState(true);

  const { data: profile, isLoading } = useGetProfileQuery();
  const { setColorScheme, colorScheme } = useColorScheme();

  const dark = isDarkMode || colorScheme === "dark";
  const colors = buildColors(dark);

  const monthIso = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}`;
  }, []);

  const { data: calendar } = useGetStreakCalendarQuery(monthIso);

  const activeDates = useMemo(() => {
    const s = new Set<string>();
    calendar?.days?.filter((d) => d.active).forEach((d) => s.add(d.date));
    return s;
  }, [calendar]);

  const handleToggleDark = async (val: boolean) => {
    setIsDarkMode(val);
    setColorScheme(val ? "dark" : "light");
    try {
      if (Platform.OS === "web") {
        window.localStorage?.setItem("settings_dark_mode", String(val));
        val
          ? document.documentElement.classList.add("dark")
          : document.documentElement.classList.remove("dark");
      } else {
        await SecureStore.setItemAsync("settings_dark_mode", String(val));
      }
    } catch {}
  };

  const handleToggleNotif = async (val: boolean) => {
    setNotificationsOn(val);
    try {
      if (Platform.OS === "web")
        window.localStorage?.setItem("settings_notifications", String(val));
      else await SecureStore.setItemAsync("settings_notifications", String(val));
    } catch {}
  };

  const xpProgress = profile?.total_modules
    ? Math.min((profile.modules_completed / profile.total_modules) * 100, 100)
    : 0;

  if (isLoading) return <GamifiedMascotLoader title="Loading Profile..." />;

  const displayName = profile?.nickname ?? profile?.name ?? "User";

  return (
    <View style={{ flex: 1, backgroundColor: colors.bodyBg, paddingTop: insets.top }}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* ── HEADER CARD ── */}
        <View
          style={{
            backgroundColor: colors.bg,
            paddingHorizontal: 20,
            paddingTop: 14,
            paddingBottom: 20,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          {/* Nav row — Profile LEFT-aligned */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <Pressable
              onPress={() => safeBack()}
              style={({ pressed }) => ({
                width: 34,
                height: 34,
                borderRadius: 17,
                backgroundColor: pressed
                  ? dark
                    ? "rgba(255,255,255,0.12)"
                    : "#E8EAFF"
                  : colors.backBtnBg,
                alignItems: "center",
                justifyContent: "center",
              })}
            >
              <Feather name="arrow-left" size={18} color={colors.text} />
            </Pressable>
            <Text style={{ fontSize: 20, fontWeight: "800", color: colors.text }}>Profile</Text>
          </View>

          {/* Avatar + Info */}
          <View
            style={{ flexDirection: "row", alignItems: "flex-start", gap: 14, marginBottom: 20 }}
          >
            <Pressable onPress={() => router.push("/profile/avatar" as never)}>
              <View
                style={{
                  width: 76,
                  height: 76,
                  borderRadius: 38,
                  borderWidth: 2.5,
                  borderColor: "#5AD083",
                  overflow: "hidden",
                  backgroundColor: dark ? "#1A1A32" : "#F0F2FF",
                }}
              >
                <Image
                  source={{ uri: getAvatarUri(profile?.avatar_id, profile?.id) }}
                  style={{ width: "100%", height: "100%", borderRadius: 38 }}
                  resizeMode="cover"
                />
              </View>
            </Pressable>

            <View style={{ flex: 1, paddingTop: 2 }}>
              {/* Name + edit */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 8,
                  marginBottom: 6,
                }}
              >
                <Text style={{ fontSize: 20, fontWeight: "800", color: colors.text }}>
                  {displayName}
                </Text>
                <Pressable
                  onPress={() => router.push("/profile/edit" as never)}
                  style={({ pressed }) => ({
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 5,
                    backgroundColor: pressed ? "#4457E0" : BLUE,
                    paddingHorizontal: 11,
                    paddingVertical: 5,
                    borderRadius: 12,
                  })}
                >
                  <Feather name="edit-2" size={10} color="#FFFFFF" />
                  <Text style={{ color: "#FFFFFF", fontSize: 11, fontWeight: "700" }}>
                    Edit Profile
                  </Text>
                </Pressable>
              </View>

              {/* Level */}
              <Text
                style={{ fontSize: 14, fontWeight: "700", color: colors.text, marginBottom: 10 }}
              >
                LVL {profile?.current_level ?? 1}
              </Text>

              {/* Progress box */}
              <View
                style={{
                  backgroundColor: colors.levelBoxBg,
                  borderRadius: 10,
                  padding: 10,
                }}
              >
                <View
                  style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 7 }}
                >
                  <Text style={{ fontSize: 12, fontWeight: "500", color: colors.textSub }}>
                    {profile?.current_lesson_name ?? "Lesson Name"}
                  </Text>
                  <Text style={{ fontSize: 12, fontWeight: "700", color: colors.text }}>
                    {profile?.modules_completed ?? 0}/{profile?.total_modules ?? 0}
                  </Text>
                </View>
                <View
                  style={{
                    height: 7,
                    backgroundColor: colors.progressBg,
                    borderRadius: 4,
                    overflow: "hidden",
                  }}
                >
                  <LinearGradient
                    colors={["#5B6BF5", "#818CF8"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ height: "100%", width: `${xpProgress}%` as any, borderRadius: 4 }}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* ── Stat chips: icon box only, text outside, single row ── */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 20 }}>
            <StatChip
              value={profile?.streak_count ?? 0}
              iconName="fire"
              iconType="mci"
              label="Daily Streak"
              colors={colors}
            />
            <StatChip
              value={profile?.total_xp ?? 0}
              iconName="lightning-bolt"
              iconType="mci"
              label="XP Points"
              colors={colors}
            />
            <StatChip
              value={profile?.friends_count ?? 0}
              iconName="account-group"
              iconType="mci"
              label="Friends"
              colors={colors}
            />
          </View>
        </View>

        {/* ── TABS ── */}
        <View
          style={{
            flexDirection: "row",
            backgroundColor: colors.bg,
            paddingHorizontal: 20,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          {(["space", "stats"] as const).map((t) => {
            const active = tab === t;
            return (
              <Pressable
                key={t}
                onPress={() => setTab(t)}
                style={{ paddingVertical: 13, marginRight: 28, position: "relative" }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: active ? "700" : "500",
                    color: active ? BLUE : colors.textSub,
                  }}
                >
                  {t === "space" ? "My Space" : "My Stats"}
                </Text>
                {active && (
                  <View
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: 2.5,
                      backgroundColor: BLUE,
                      borderRadius: 2,
                    }}
                  />
                )}
              </Pressable>
            );
          })}
        </View>

        {/* ── BODY ── */}
        <View style={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 40 }}>
          {tab === "space" ? (
            <>
              {/* Settings section */}
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "700",
                  color: colors.text,
                  marginBottom: 12,
                  marginLeft: 4,
                }}
              >
                Settings
              </Text>

              <SettingsRow
                iconName="user"
                label="Personal Details"
                onPress={() => router.push("/profile/edit" as never)}
                colors={colors}
              />
              <SettingsRow
                iconName="globe"
                label="Language"
                onPress={() => router.push("/profile/language" as never)}
                colors={colors}
              />
              <SettingsRow iconName="key" label="Passwords" onPress={() => {}} colors={colors} />
              <SettingsRow
                iconName="sun"
                label="Mode"
                rightElement={<Toggle value={isDarkMode} onChange={handleToggleDark} />}
                colors={colors}
              />
              <SettingsRow
                iconName="bell"
                label="Notifications"
                rightElement={<Toggle value={notificationsOn} onChange={handleToggleNotif} />}
                colors={colors}
              />

              {/* About / Privacy — no icon */}
              <View style={{ marginTop: 8 }}>
                <SimpleRow label="About Us" onPress={() => {}} colors={colors} />
                <SimpleRow label="Privacy & Security" onPress={() => {}} colors={colors} />
              </View>

              <PremiumBanner onPress={() => router.push("/subscription" as never)} />
            </>
          ) : (
            <>
              <Text
                style={{ fontSize: 15, fontWeight: "700", color: colors.text, marginBottom: 14 }}
              >
                Streak Calendar
              </Text>
              <StreakCalendar colors={colors} activeDates={activeDates} />
              <PremiumBanner onPress={() => router.push("/subscription" as never)} />
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
