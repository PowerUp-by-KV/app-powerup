import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Platform,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { COLORS, FONTS, SIZES } from "@/constants/theme";
import { BADGES, USER_PROFILE, LEARNING_MODULES } from "@/constants/mockData";
import {
  Award,
  ArrowLeft,
  Star,
  Lock,
  Trophy,
  Zap,
  Medal,
  Target,
  Flame,
  ChevronRight,
  BookOpen,
  Check,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { selectTimeForModule } from "@/store/slices/timeTrackingSlice";

const { width } = Dimensions.get("window");

/**
 * High-Fidelity Learning Dashboard & Rewards Screen
 */
export const RewardsScreen = () => {
  const [activeTab, setActiveTab] = useState<"Badges" | "Challenges">("Badges");

  const earnedBadgesCount = BADGES.filter((b) => b.earned).length;
  const totalBadgesCount = BADGES.length;

  const mockChallenges = [
    {
      id: "q1",
      title: "Grammar",
      desc: "Complete 2 grammar exercises",
      progress: 1,
      total: 2,
      xp: 50,
      icon: "book",
    },
    {
      id: "q2",
      title: "Speaking ",
      desc: "Practice speaking for 10 mins",
      progress: 10,
      total: 10,
      xp: 100,
      completed: true,
      icon: "mic",
    },
    {
      id: "q3",
      title: "Reading ",
      desc: "Read 3 articles",
      progress: 0,
      total: 3,
      xp: 75,
      icon: "book-open",
    },
  ];

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <LinearGradient colors={["#6366F1", "#4F46E5"]} style={styles.headerGradient}>
        <SafeAreaView>
          <View style={styles.topNav}>
            <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
              <ArrowLeft size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.navTitle}>Learning Dashboard</Text>
            <TouchableOpacity style={styles.iconButton}>
              <Flame size={24} color="#FF8C42" fill="#FF8C42" />
            </TouchableOpacity>
          </View>

          <View style={styles.headerHero}>
            <View style={styles.heroStatsRow}>
              <View style={styles.heroStatCard}>
                <Flame size={32} color="#FF8C42" fill="#FF8C42" />
                <Text style={styles.heroStatValue}>{USER_PROFILE.streak}</Text>
                <Text style={styles.heroStatLabel}>Day Streak</Text>
              </View>
              <View style={styles.heroStatCard}>
                <Zap size={32} color="#FFD700" fill="#FFD700" />
                <Text style={styles.heroStatValue}>{USER_PROFILE.points}</Text>
                <Text style={styles.heroStatLabel}>Total XP</Text>
              </View>
              <View style={styles.heroStatCard}>
                <Trophy size={32} color="#FFFFFF" fill="#FFFFFF30" />
                <Text style={styles.heroStatValue}>{earnedBadgesCount}</Text>
                <Text style={styles.heroStatLabel}>Badges</Text>
              </View>
            </View>
          </View>

          <View style={styles.tabSwitcher}>
            <TouchableOpacity
              style={[styles.tabItem, activeTab === "Badges" && styles.activeTabItem]}
              onPress={() => setActiveTab("Badges")}
            >
              <Text style={[styles.tabText, activeTab === "Badges" && styles.activeTabText]}>
                Badges
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabItem, activeTab === "Challenges" && styles.activeTabItem]}
              onPress={() => setActiveTab("Challenges")}
            >
              <Text style={[styles.tabText, activeTab === "Challenges" && styles.activeTabText]}>
                Daily Challenges
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );

  const renderMasterySection = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Skill Mastery</Text>
        <TouchableOpacity>
          <Text style={styles.viewAllText}>View Details</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.masteryScroll}
      >
        {LEARNING_MODULES.map((module) => {
          const seconds = useSelector((state: RootState) => selectTimeForModule(state, module.id));
          const masteryPercent = Math.min(Math.round((seconds / 600) * 100), 100); // 10 mins = 100% for demo

          return (
            <View key={module.id} style={styles.masteryCard}>
              <LinearGradient colors={module.gradient as any} style={styles.masteryIconBg}>
                <BookOpen size={24} color="#FFF" />
              </LinearGradient>
              <Text style={styles.masteryTitle}>{module.title}</Text>
              <View style={styles.miniProgressTrack}>
                <View
                  style={[
                    styles.miniProgressFill,
                    { width: `${masteryPercent}%`, backgroundColor: module.gradient[0] },
                  ]}
                />
              </View>
              <Text style={styles.masteryPerc}>
                {seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}m`} spent
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );

  const renderBadgeItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.badgeCard, !item.earned && styles.lockedCard]}
      activeOpacity={0.9}
    >
      <View style={styles.cardInternal}>
        <View style={[styles.badgeIconBox, item.earned ? styles.earnedBg : styles.lockedBg]}>
          <Award
            size={40}
            color={item.earned ? "#6366F1" : "#94A3B8"}
            fill={item.earned ? "#6366F120" : "transparent"}
          />
          {!item.earned && (
            <View style={styles.lockIcon}>
              <Lock size={12} color="#FFF" />
            </View>
          )}
        </View>
        <Text style={[styles.badgeName, !item.earned && styles.lockedText]} numberOfLines={1}>
          {item.name}
        </Text>
        <View style={styles.xpPill}>
          <Text style={styles.xpPillText}>+{item.points} XP</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderChallengeItem = (challenge: any) => (
    <TouchableOpacity key={challenge.id} style={styles.challengeRow} activeOpacity={0.8}>
      <View style={styles.challengeIconBox}>
        <Target size={24} color={challenge.completed ? "#10B981" : "#6366F1"} />
      </View>
      <View style={styles.challengeInfo}>
        <Text style={styles.challengeTitle}>{challenge.title}</Text>
        <Text style={styles.challengeDesc}>{challenge.desc}</Text>
        <View style={styles.challengeProgressContainer}>
          <View style={styles.challengeProgressTrack}>
            <View
              style={[
                styles.challengeProgressFill,
                {
                  width: `${(challenge.progress / challenge.total) * 100}%`,
                  backgroundColor: challenge.completed ? "#10B981" : "#6366F1",
                },
              ]}
            />
          </View>
          <Text style={styles.challengeProgressText}>
            {challenge.progress}/{challenge.total}
          </Text>
        </View>
      </View>
      <View style={styles.challengeAction}>
        {challenge.completed ? (
          <View style={styles.completedCheck}>
            <Check size={16} color="#FFF" />
          </View>
        ) : (
          <View style={styles.xpLabel}>
            <Text style={styles.xpLabelText}>+{challenge.xp} XP</Text>
          </View>
        )}
        <ChevronRight size={20} color="#CBD5E1" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      {activeTab === "Badges" ? (
        <FlatList
          data={BADGES}
          renderItem={renderBadgeItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          ListHeaderComponent={renderMasterySection}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.rowSpacing}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}> Active Challenges</Text>
            <Text style={styles.resetText}>Resets in 12h</Text>
          </View>
          {mockChallenges.map(renderChallengeItem)}

          <View style={[styles.sectionHeader, { marginTop: 30 }]}>
            <Text style={styles.sectionTitle}>Streak Milestones</Text>
          </View>
          <LinearGradient colors={["#FFAD60", "#FF8C42"]} style={styles.streakMilestoneCard}>
            <Flame size={40} color="#FFF" fill="#FFF" />
            <View style={styles.streakInfo}>
              <Text style={styles.streakMilestoneTitle}>7-Day Warrior</Text>
              <Text style={styles.streakMilestoneSub}>Complete 2 more days to unlock!</Text>
            </View>
            <View style={styles.streakReward}>
              <Text style={styles.streakRewardValue}>+500</Text>
              <Text style={styles.streakRewardLabel}>XP</Text>
            </View>
          </LinearGradient>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  headerContainer: { marginBottom: 10 },
  headerGradient: { paddingBottom: 25, borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
  topNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 0 : 40,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF20",
    justifyContent: "center",
    alignItems: "center",
  },
  navTitle: { color: "#FFF", fontSize: 18, ...FONTS.bold },
  headerHero: { marginTop: 25, paddingHorizontal: 20 },
  heroStatsRow: { flexDirection: "row", justifyContent: "space-between" },
  heroStatCard: {
    flex: 1,
    backgroundColor: "#FFFFFF15",
    marginHorizontal: 5,
    paddingVertical: 15,
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFFFFF20",
  },
  heroStatValue: { color: "#FFF", fontSize: 20, ...FONTS.bold, marginTop: 8 },
  heroStatLabel: { color: "#E0E7FF", fontSize: 10, ...FONTS.medium },
  tabSwitcher: {
    flexDirection: "row",
    backgroundColor: "#00000020",
    marginHorizontal: 20,
    marginTop: 25,
    borderRadius: 25,
    padding: 4,
  },
  tabItem: { flex: 1, paddingVertical: 12, alignItems: "center", borderRadius: 22 },
  activeTabItem: { backgroundColor: "#FFF" },
  tabText: { color: "#E0E7FF", fontSize: 14, ...FONTS.bold },
  activeTabText: { color: "#6366F1" },
  sectionContainer: { marginTop: 20, marginBottom: 10 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: { fontSize: 18, color: "#1E293B", ...FONTS.bold },
  viewAllText: { color: "#6366F1", fontSize: 14, ...FONTS.bold },
  masteryScroll: { paddingLeft: 20, paddingRight: 10 },
  masteryCard: {
    backgroundColor: "#FFF",
    width: 120,
    padding: 15,
    borderRadius: 24,
    marginRight: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  masteryIconBg: {
    width: 44,
    height: 44,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  masteryTitle: {
    fontSize: 13,
    color: "#1E293B",
    ...FONTS.bold,
    marginBottom: 8,
    textTransform: "capitalize",
  },
  miniProgressTrack: {
    height: 4,
    width: "100%",
    backgroundColor: "#F1F5F9",
    borderRadius: 2,
    overflow: "hidden",
  },
  miniProgressFill: { height: "100%", borderRadius: 2 },
  masteryPerc: { fontSize: 10, color: "#64748B", marginTop: 4, ...FONTS.medium },
  listContent: { paddingHorizontal: 20, paddingBottom: 40 },
  rowSpacing: { justifyContent: "space-between" },
  badgeCard: {
    width: (width - 60) / 2,
    marginBottom: 20,
    borderRadius: 30,
    backgroundColor: "#FFF",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 4,
  },
  cardInternal: { padding: 20, alignItems: "center" },
  lockedCard: { opacity: 0.7, backgroundColor: "#F1F5F9" },
  badgeIconBox: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  earnedBg: { backgroundColor: "#F0F9FF" },
  lockedBg: { backgroundColor: "#F8FAFC" },
  lockIcon: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#475569",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  badgeName: { fontSize: 15, color: "#1E293B", ...FONTS.bold, textAlign: "center" },
  lockedText: { color: "#94A3B8" },
  xpPill: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginTop: 10,
  },
  xpPillText: { fontSize: 11, color: "#6366F1", ...FONTS.bold },
  challengeRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 18,
    borderRadius: 24,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  challengeIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  challengeInfo: { flex: 1 },
  challengeTitle: { fontSize: 16, color: "#1E293B", ...FONTS.bold },
  challengeDesc: { fontSize: 13, color: "#64748B", ...FONTS.medium, marginTop: 2 },
  challengeProgressContainer: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  challengeProgressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: "#F1F5F9",
    borderRadius: 3,
    overflow: "hidden",
    marginRight: 10,
  },
  challengeProgressFill: { height: "100%", borderRadius: 3 },
  challengeProgressText: { fontSize: 11, color: "#64748B", ...FONTS.bold },
  challengeAction: { flexDirection: "row", alignItems: "center" },
  xpLabel: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  xpLabelText: { fontSize: 12, color: "#6366F1", ...FONTS.bold },
  completedCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  resetText: { fontSize: 12, color: "#94A3B8", ...FONTS.medium },
  streakMilestoneCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 25,
    borderRadius: 30,
    marginTop: 10,
  },
  streakInfo: { flex: 1, marginLeft: 20 },
  streakMilestoneTitle: { color: "#FFF", fontSize: 18, ...FONTS.bold },
  streakMilestoneSub: { color: "#FFF", fontSize: 13, opacity: 0.9, marginTop: 2, ...FONTS.medium },
  streakReward: { alignItems: "center" },
  streakRewardValue: { color: "#FFF", fontSize: 20, ...FONTS.bold },
  streakRewardLabel: { color: "#FFF", fontSize: 10, ...FONTS.bold, opacity: 0.8 },
});

export default RewardsScreen;
