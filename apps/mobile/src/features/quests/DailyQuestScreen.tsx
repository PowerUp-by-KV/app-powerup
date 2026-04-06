import React from "react";
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Zap, Play, ArrowLeft, Check, ChevronRight } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, FONTS, SIZES } from "@/constants/theme";
import { Card } from "@/features/learning/components";

import { useGetQuestsQuery } from "@/services/QuestApi";

export const DailyQuestScreen = () => {
  const { data: quests, isLoading } = useGetQuestsQuery();

  // Handlers for dynamic data
  const mainQuest =
    quests && quests.length > 0
      ? quests[0]
      : {
          title: "Loading Quest...",
          description: "Fetching your challenge...",
          id: "quest-1",
        };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Daily Quest</Text>
        <Text style={styles.headerSub}>Complete today's challenge to earn XP</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.questCard}>
          <View style={styles.iconContainer}>
            <Zap size={60} color={COLORS.quaternary} fill={COLORS.quaternary} />
          </View>
          <Text style={styles.questTitle}>{mainQuest.title}</Text>
          <Text style={styles.questDesc}>{mainQuest.description}</Text>

          <View style={styles.rewardContainer}>
            <Text style={styles.rewardLabel}>Reward:</Text>
            <View style={styles.xpBadge}>
              <Text style={styles.xpText}>+50 XP</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.startButton}
            onPress={() =>
              router.push({ pathname: "/QuestExercise", params: { questId: mainQuest.id } })
            }
          >
            <Text style={styles.startButtonText}>Start Quest</Text>
            <Play size={18} color={COLORS.white} fill={COLORS.white} />
          </TouchableOpacity>
        </Card>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>How it works</Text>
          <Text style={styles.infoText}>
            Daily quests are special timed exercises designed to boost your skills and reward you
            with extra XP. Complete them every day to maintain your streak and climb the
            leaderboard!
          </Text>
        </View>
      </ScrollView>
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
    paddingBottom: 100,
  },
  header: {
    padding: SIZES.padding,
    paddingTop: 60,
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    color: COLORS.black,
    ...FONTS.bold,
  },
  headerSub: {
    fontSize: 16,
    color: COLORS.gray,
    ...FONTS.regular,
  },
  questCard: {
    alignItems: "center",
    padding: 30,
    marginBottom: 30,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.quaternary + "15",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  questTitle: {
    fontSize: 24,
    color: COLORS.black,
    ...FONTS.bold,
  },
  questDesc: {
    fontSize: 16,
    color: COLORS.gray,
    marginTop: 8,
    textAlign: "center",
    ...FONTS.medium,
  },
  rewardContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  rewardLabel: {
    fontSize: 16,
    color: COLORS.darkGray,
    marginRight: 10,
    ...FONTS.medium,
  },
  xpBadge: {
    backgroundColor: COLORS.quaternary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  xpText: {
    color: COLORS.white,
    fontSize: 14,
    ...FONTS.bold,
  },
  startButton: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    width: "100%",
    justifyContent: "center",
  },
  startButtonText: {
    color: COLORS.white,
    fontSize: 18,
    marginRight: 10,
    ...FONTS.bold,
  },
  infoSection: {
    paddingHorizontal: 10,
  },
  infoTitle: {
    fontSize: 18,
    color: COLORS.black,
    marginBottom: 10,
    ...FONTS.semiBold,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.gray,
    lineHeight: 22,
    ...FONTS.regular,
  },
});

// export default DailyQuestScreen;
