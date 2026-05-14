import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, ScrollView, Dimensions } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  Star,
  Zap,
  Play,
  ChevronRight,
  Book,
  Flame,
  Medal,
  MessageCircle,
  Sparkles,
  BookOpen,
  Clock,
  ArrowRight,
  PenTool,
} from "lucide-react-native";
import { useGetUserProfileQuery } from "@/services/user-api";
import { useUser } from "@/features/profile/hooks/UserContext";
import { useProgress } from "@/features/progress/hooks/ProgressContext";
import { useAppSelector } from "@/store/hooks";
import { selectTotalTime } from "@/store/slices/timeTrackingSlice";
import { selectCefrLevel } from "@/store/slices/authSlice";

import { Card } from "@/components/ui";
import { AIChatbot } from "./components/AIChatbot";

const { width } = Dimensions.get("window");

export const HomeScreen = () => {
  const { data: userProfile } = useGetUserProfileQuery("user-1");
  const { user: contextUser } = useUser();
  const { summary } = useProgress();

  const userName = userProfile?.name || contextUser?.name || "User";
  const userAvatar = userProfile?.avatarUri || contextUser?.avatarUri;
  const userStreak = userProfile?.streak ?? contextUser?.streak ?? 0;

  const totalModules = summary?.modules?.length || 6;
  const completedModules =
    summary?.modules?.filter((m) => m.status === "Done" || m.status === "Mastery").length || 2;

  const [isChatVisible, setIsChatVisible] = useState(false);

  const totalSeconds = useAppSelector(selectTotalTime);
  const progress = Math.min(Math.round((totalSeconds / 1800) * 100), 100);
  const lastActivity = useAppSelector((state) => state.progress.lastActivity);
  const completedDays = useAppSelector((state) => state.progress.completedDays);
  const cefrLevel = useAppSelector(selectCefrLevel);

  const getNextResumableActivity = () => {
    if (lastActivity) return lastActivity;

    // Find the first incomplete stage
    const stages = ["m1", "m2", "m3", "m4"];
    for (const stageId of stages) {
      // Check if stage is completed in global-journey
      const completedStages = completedDays["global-journey"] || [];
      const stageNo = parseInt(stageId.replace("m", ""));
      if (completedStages.includes(stageNo)) continue;

      // Check sub-modules in this stage
      const completedSubModules = completedDays[stageId] || [];
      for (let subNo = 1; subNo <= 12; subNo++) {
        const subModuleId = `placeholder-${subNo}`;

        // If sub-module is not completed, find the first incomplete day in it
        if (!completedSubModules.includes(subNo)) {
          const completedInSub = completedDays[subModuleId] || [];
          for (let dayNo = 1; dayNo <= 12; dayNo++) {
            if (!completedInSub.includes(dayNo)) {
              return {
                moduleId: subModuleId,
                dayNo,
                stageId,
                cefrLevel,
                activityTitle: `Day ${dayNo} Practice`,
                isNewDay: true,
              };
            }
          }
        }
      }
    }
    return null;
  };

  const nextActivity = getNextResumableActivity();

  const daysRow = ["M", "T", "W", "T", "F", "S", "S"];

  const getWeeklyActivity = () => {
    const activity = new Array(7).fill(false);
    const today = new Date();
    const dayOfWeek = today.getDay();
    const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    for (let i = 0; i < (userStreak || 3); i++) {
      const dayIndex = adjustedDay - i;
      if (dayIndex >= 0) activity[dayIndex] = true;
    }
    return activity;
  };

  const activityStatus = getWeeklyActivity();

  return (
    <View style={{ flex: 1, backgroundColor: "#F8F9FA" }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 32, paddingTop: 24, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <View>
            <Text style={{ fontSize: 28, color: "#1E293B", fontWeight: "bold" }}>
              Hi, {userName.split(" ")[0]}!
            </Text>
            <Text style={{ fontSize: 14, color: "#94A3B8", fontWeight: "500" }}>
              Ready to learn something new?
            </Text>
          </View>
          <TouchableOpacity
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: "white",
              borderColor: "#E2E8F0",
              borderWidth: 1,
              alignItems: "center",
              justifyContent: "center",
            }}
            onPress={() => router.push("/profile")}
          >
            {userAvatar ? (
              <Image
                source={{ uri: userAvatar }}
                style={{ width: "100%", height: "100%", borderRadius: 24 }}
              />
            ) : (
              <View
                style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: "#F1F5F9" }}
              />
            )}
          </TouchableOpacity>
        </View>

        {/* Weekly Streak */}
        <View
          style={{
            backgroundColor: "white",
            padding: 16,
            borderRadius: 24,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: "#F1F5F9",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <Text
            style={{
              textAlign: "center",
              fontSize: 15,
              color: "#1E293B",
              fontWeight: "bold",
              marginBottom: 12,
            }}
          >
            Weekly Streak
          </Text>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 8 }}
          >
            {daysRow.map((day, index) => (
              <View key={index} style={{ alignItems: "center" }}>
                <View
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 21,
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 6,
                    backgroundColor: activityStatus[index] ? "#475569" : "#F1F5F9",
                  }}
                >
                  {activityStatus[index] && <Flame size={20} color="white" />}
                </View>
                <Text style={{ fontSize: 12, fontWeight: "bold", color: "#94A3B8" }}>{day}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* My Learning */}
        <View
          style={{
            backgroundColor: "white",
            padding: 20,
            borderRadius: 28,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: "#F1F5F9",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <Text
            style={{
              textAlign: "center",
              fontSize: 16,
              color: "#1E293B",
              fontWeight: "bold",
              marginBottom: 16,
            }}
          >
            My Learning
          </Text>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
            {[
              { label: "2 Streaks", icon: <Flame size={14} color="white" /> },
              { label: "12 Badges", icon: <Medal size={14} color="white" /> },
              { label: "30 XP", icon: <Zap size={14} color="white" /> },
            ].map((stat, i) => (
              <View
                key={i}
                style={{
                  backgroundColor: "#64748B",
                  width: "31%",
                  height: 56,
                  borderRadius: 16,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <View style={{ marginBottom: 3 }}>{stat.icon}</View>
                <Text style={{ fontSize: 10, color: "white", fontWeight: "bold" }}>
                  {stat.label}
                </Text>
              </View>
            ))}
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 6,
            }}
          >
            <Text style={{ color: "#94A3B8", fontSize: 12, fontWeight: "bold" }}>
              {completedModules}/{totalModules} modules
            </Text>
            <Text style={{ color: "#94A3B8", fontSize: 12, fontWeight: "bold" }}>{progress}%</Text>
          </View>
          <View
            style={{
              height: 8,
              width: "100%",
              backgroundColor: "#F1F5F9",
              borderRadius: 4,
              overflow: "hidden",
              marginBottom: 16,
            }}
          >
            <View style={{ width: `${progress}%`, height: "100%", backgroundColor: "#475569" }} />
          </View>
          <TouchableOpacity
            style={{
              backgroundColor: "#475569",
              borderRadius: 20,
              alignItems: "center",
              paddingVertical: 14,
            }}
            onPress={() => router.push("/(tabs)/my-learning")}
          >
            <Text style={{ color: "white", fontSize: 15, fontWeight: "bold" }}>
              Track My Learning
            </Text>
          </TouchableOpacity>
        </View>

        {/* Continue Learning */}
        <View style={{ marginBottom: 16 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
              paddingHorizontal: 4,
            }}
          >
            <Text style={{ fontSize: 18, color: "#1E293B", fontWeight: "bold" }}>
              Continue Learning
            </Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/my-learning")}>
              <Text style={{ fontSize: 13, color: "#94A3B8", fontWeight: "bold" }}>View All</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              if (nextActivity) {
                router.push({
                  pathname: "/(tabs)/my-learning/lesson/[moduleId]/[dayNo]",
                  params: {
                    moduleId: nextActivity.moduleId,
                    dayNo: nextActivity.dayNo.toString(),
                    cefr_level: nextActivity.cefrLevel || cefrLevel,
                    stageId: nextActivity.stageId,
                  },
                });
              } else {
                router.push("/(tabs)/my-learning");
              }
            }}
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 18,
              borderRadius: 24,
              backgroundColor: "white",
              borderWidth: 1,
              borderColor: "#F1F5F9",
            }}
          >
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 16,
                backgroundColor: "#64748B",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 20,
              }}
            >
              <BookOpen size={24} color="white" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 18, color: "#1E293B", fontWeight: "bold" }}>
                {nextActivity?.activityTitle || "Resume Learning"}
              </Text>
              <Text style={{ fontSize: 13, color: "#94A3B8", fontWeight: "500" }}>
                {nextActivity
                  ? (nextActivity as any).isNewDay
                    ? "Next Lesson"
                    : "Resume Lesson"
                  : "Start Learning"}
              </Text>
            </View>
            <ChevronRight size={22} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Convo Coach Card */}
        <View
          style={{
            backgroundColor: "white",
            padding: 20,
            borderRadius: 32,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: "#F1F5F9",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.03,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: "#64748B",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 16,
              }}
            >
              <Sparkles size={20} color="white" />
            </View>
            <View>
              <Text style={{ fontSize: 16, color: "#1E293B", fontWeight: "bold" }}>
                Convo Coach
              </Text>
              <Text style={{ fontSize: 11, color: "#94A3B8", fontWeight: "500" }}>
                Say it better, every time
              </Text>
            </View>
          </View>
          <View>
            {[
              { title: "Interview Playground", sub: "Try, learn and improve - No pressure" },
              { title: "Interview Buddy", sub: "Practice with a buddy before it counts" },
            ].map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={{
                  backgroundColor: "#F1F5F9",
                  borderRadius: 20,
                  padding: 12,
                  paddingHorizontal: 16,
                  marginBottom: 8,
                }}
              >
                <Text style={{ color: "#1E293B", fontSize: 14, fontWeight: "bold" }}>
                  {item.title}
                </Text>
                <Text style={{ fontSize: 10, color: "#94A3B8", fontWeight: "500" }}>
                  {item.sub}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Resume Studio Card */}
        <View
          style={{
            backgroundColor: "white",
            padding: 20,
            borderRadius: 32,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: "#F1F5F9",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.03,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: "#64748B",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 16,
              }}
            >
              <PenTool size={20} color="white" />
            </View>
            <View>
              <Text style={{ fontSize: 16, color: "#1E293B", fontWeight: "bold" }}>
                Resume Studio
              </Text>
              <Text style={{ fontSize: 11, color: "#94A3B8", fontWeight: "500" }}>
                Build a resume you're proud to share
              </Text>
            </View>
          </View>
          <View>
            {[
              { title: "Resume Buddy", sub: "Know what recruiters notice" },
              { title: "Craft your Resume", sub: "Design your story, your way" },
            ].map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={{
                  backgroundColor: "#F1F5F9",
                  borderRadius: 20,
                  padding: 12,
                  paddingHorizontal: 16,
                  marginBottom: 8,
                }}
              >
                <Text style={{ color: "#1E293B", fontSize: 14, fontWeight: "bold" }}>
                  {item.title}
                </Text>
                <Text style={{ fontSize: 10, color: "#94A3B8", fontWeight: "500" }}>
                  {item.sub}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Floating Chat Button */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => setIsChatVisible(true)}
        style={{
          position: "absolute",
          bottom: 24,
          right: 32,
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: "#475569",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 50,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 10,
        }}
      >
        <MessageCircle size={28} color="white" />
      </TouchableOpacity>

      <AIChatbot visible={isChatVisible} onClose={() => setIsChatVisible(false)} />
    </View>
  );
};
