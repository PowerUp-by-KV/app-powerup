import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Star, Zap, Play, ChevronRight, Book } from "lucide-react-native";
import { COLORS, FONTS, SIZES, GRADIENTS } from "@/constants/theme";
import { USER_PROFILE } from "@/constants/mockData";
import { useUser } from "@/features/profile/hooks/UserContext";

import { Card } from "@/features/learning/components";
import { ProgressBar } from "@/features/progress/components";
import { AIButton } from "./components/AIButton";
import LearningPath from "./components/LearningPath/LearningPath";
import AIChatbot from "./components/AIChatbot";

import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { selectTotalTime } from "@/store/slices/timeTrackingSlice";

export const HomeScreen = () => {
  const { user } = useUser();
  const [isChatVisible, setIsChatVisible] = useState(false);

  const totalSeconds = useSelector(selectTotalTime);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const timeDisplay = totalSeconds < 60 ? `${totalSeconds} seconds` : `${totalMinutes} minutes`;

  // Progress calculation (e.g., target 30 mins = 1800 seconds)
  const DAILY_GOAL_SECONDS = 1800;
  const progress = Math.min(Math.round((totalSeconds / DAILY_GOAL_SECONDS) * 100), 100);

  const days = ["S", "M", "T", "W", "T", "F", "S"];
  const currentDayIndex = new Date().getDay();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hi, {(user?.name || "User").split(" ")[0]}</Text>
            <Text style={styles.subGreeting}>Ready to learn today?</Text>
          </View>

          <View style={styles.headerRight}>
            <View style={styles.statsRow}>
              <View style={[styles.statBadge, { backgroundColor: COLORS.quaternary + "15" }]}>
                <Zap size={14} color={COLORS.quaternary} fill={COLORS.quaternary} />
                <Text style={[styles.statText, { color: COLORS.quaternary }]}>
                  {user.streak || 0}
                </Text>
              </View>
              <View style={[styles.statBadge, { backgroundColor: COLORS.secondary + "15" }]}>
                <Star size={14} color={COLORS.secondary} fill={COLORS.secondary} />
                <Text style={[styles.statText, { color: COLORS.secondary }]}>
                  {user.points || 0}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.profileCircle}
              onPress={() => router.push("/(tabs)/profile")}
            >
              {user.avatarUri ? (
                <Image source={{ uri: user.avatarUri }} style={styles.avatarMiniImage} />
              ) : (
                <Text style={styles.profileInitial}>{(user?.name || "U")[0]}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Streak Tracker */}
        <Card style={styles.streakCard}>
          <View style={styles.streakHeader}>
            <Text style={styles.streakTitle}>Weekly Streak</Text>
            <View style={styles.streakCountContainer}>
              <Zap size={18} color={COLORS.quaternary} fill={COLORS.quaternary} />
              <Text style={styles.streakCount}>{user.streak} Days</Text>
            </View>
          </View>
          <View style={styles.daysContainer}>
            {days.map((day, index) => (
              <View key={index} style={styles.dayItem}>
                <View
                  style={[
                    styles.dayCircle,
                    index <= currentDayIndex ? styles.dayCircleActive : styles.dayCircleInactive,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayText,
                      index <= currentDayIndex ? styles.dayTextActive : styles.dayTextInactive,
                    ]}
                  >
                    {day}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </Card>

        {/* Quick Actions */}
        <View style={styles.sectionRow}>
          <TouchableOpacity
            style={styles.quickAction}
            activeOpacity={0.9}
            onPress={() => router.push("/subscription")}
          >
            <LinearGradient colors={GRADIENTS.premium} style={styles.quickActionGradient}>
              <Star size={24} color={COLORS.white} fill={COLORS.white} />
              <Text style={styles.quickActionTitle}>Unlock Premium</Text>
              <Text style={styles.quickActionSub}>Get AI Tutor access</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            activeOpacity={0.9}
            onPress={() => router.push("/(tabs)/DailyQuest")}
          >
            <LinearGradient colors={GRADIENTS.quest} style={styles.quickActionGradient}>
              <Zap size={24} color={COLORS.white} fill={COLORS.white} />
              <Text style={styles.quickActionTitle}>Daily Quest</Text>
              <Text style={styles.quickActionSub}>Earn 50 XP today</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Learning Today */}
        <Card style={styles.learningCard}>
          <View style={styles.learningTopRow}>
            <View style={styles.circularProgressContainer}>
              <View style={styles.circularProgressInner}>
                <Text style={styles.progressPercent}>{progress}%</Text>
              </View>
            </View>
            <View style={styles.learningTextContainer}>
              <Text style={styles.learningTitle}>Learning Today</Text>
              <Text style={styles.learningSub}>{timeDisplay} spent today</Text>
            </View>
          </View>

          <ProgressBar
            progress={progress}
            color={COLORS.primary}
            style={styles.learningProgressBar}
          />

          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => router.push("/LearningModules")}
          >
            <Text style={styles.continueText}>Continue Learning</Text>
            <Play size={16} color={COLORS.white} fill={COLORS.white} />
          </TouchableOpacity>
        </Card>

        {/* Learning Path */}
        <LearningPath
          data={[
            { id: 0, title: "Pre-assessment", type: "start", status: "current" },
            { id: 1, title: "Day 1 Grammar", status: "locked" },
            { id: 2, title: "Day 2 Grammar", status: "locked" },
            { id: 3, title: "Day 3 Grammar", status: "locked" },
          ]}
          onNodePress={(node) => {
            if (node.status === "current") {
              router.push({ pathname: "/GrammarContent", params: { dayId: node.id } });
            }
          }}
          onContinuePress={() => router.push({ pathname: "/GrammarContent", params: { dayId: 0 } })}
        />

        {/* Categories Preview */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Modules</Text>
          <TouchableOpacity onPress={() => router.push("/LearningModules")}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.modulePreview} onPress={() => router.push("/grammar")}>
          <Card style={styles.modulePreviewCard}>
            <View style={[styles.moduleIconContainer, { backgroundColor: COLORS.primary + "20" }]}>
              <Book size={24} color={COLORS.primary} />
            </View>
            <View style={styles.modulePreviewText}>
              <Text style={styles.moduleTitle}>Grammar Mastery</Text>
              <Text style={styles.moduleDesc}>Master tenses and structures</Text>
            </View>
            <ChevronRight size={20} color={COLORS.lightGray} />
          </Card>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

      <AIButton onPress={() => setIsChatVisible(true)} />
      <AIChatbot visible={isChatVisible} onClose={() => setIsChatVisible(false)} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SIZES.padding,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    marginTop: 10,
  },
  greeting: {
    fontSize: 28,
    color: COLORS.black,
    ...FONTS.bold,
  },
  subGreeting: {
    fontSize: 14,
    color: COLORS.gray,
    ...FONTS.medium,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  statsRow: {
    flexDirection: "row",
    marginRight: 12,
  },
  statBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginLeft: 8,
  },
  statText: {
    fontSize: 14,
    ...FONTS.bold,
    marginLeft: 4,
  },
  profileCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  profileInitial: {
    color: COLORS.white,
    fontSize: 20,
    ...FONTS.bold,
  },
  avatarMiniImage: {
    width: "100%",
    height: "100%",
    borderRadius: 25,
    resizeMode: "cover",
  },
  streakCard: {
    marginBottom: 20,
  },
  streakHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  streakTitle: {
    fontSize: 18,
    color: COLORS.black,
    ...FONTS.semiBold,
  },
  streakCountContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.quaternary + "20",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  streakCount: {
    fontSize: 14,
    color: COLORS.quaternary,
    marginLeft: 5,
    ...FONTS.bold,
  },
  daysContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dayItem: {
    alignItems: "center",
  },
  dayCircle: {
    width: 35,
    height: 35,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  dayCircleActive: {
    backgroundColor: COLORS.quaternary,
  },
  dayCircleInactive: {
    backgroundColor: COLORS.lightGray,
  },
  dayText: {
    fontSize: 12,
    ...FONTS.bold,
  },
  dayTextActive: {
    color: COLORS.white,
  },
  dayTextInactive: {
    color: COLORS.gray,
  },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  quickAction: {
    width: "48%",
    borderRadius: SIZES.radius,
    overflow: "hidden",
  },
  quickActionGradient: {
    padding: 16,
    height: 120,
    justifyContent: "center",
  },
  quickActionTitle: {
    color: COLORS.white,
    fontSize: 16,
    marginTop: 10,
    ...FONTS.bold,
  },
  quickActionSub: {
    color: COLORS.white,
    fontSize: 12,
    opacity: 0.8,
    ...FONTS.regular,
  },
  learningCard: {
    marginBottom: 20,
    padding: 15,
  },
  learningTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  circularProgressContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary + "15",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  circularProgressInner: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
  },
  progressPercent: {
    fontSize: 12,
    color: COLORS.primary,
    ...FONTS.bold,
  },
  learningTextContainer: {
    flex: 1,
  },
  learningTitle: {
    fontSize: 18,
    color: COLORS.black,
    ...FONTS.bold,
  },
  learningSub: {
    fontSize: 14,
    color: COLORS.gray,
    ...FONTS.regular,
  },
  learningProgressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 20,
  },
  continueButton: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 15,
  },
  continueText: {
    color: COLORS.white,
    fontSize: 16,
    marginRight: 10,
    ...FONTS.bold,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    color: COLORS.black,
    ...FONTS.bold,
  },
  seeAll: {
    fontSize: 14,
    color: COLORS.primary,
    ...FONTS.medium,
  },
  modulePreview: {
    marginBottom: 15,
  },
  modulePreviewCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
  },
  moduleIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  modulePreviewText: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: 16,
    color: COLORS.black,
    ...FONTS.semiBold,
  },
  moduleDesc: {
    fontSize: 14,
    color: COLORS.gray,
    ...FONTS.regular,
  },
});

// export default HomeScreen;
