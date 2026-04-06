import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Image,
} from "react-native";
import { router } from "expo-router";
import { COLORS, FONTS, SIZES } from "@/constants/theme";
import { LEADERBOARD } from "@/constants/mockData";
import { ArrowLeft, Zap, Trophy, Crown, Timer } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

/**
 * High-Fidelity Professional Leaderboard Screen.
 * Features a podium for top 3 and a sleek list for remaining ranks.
 */
export const LeaderboardScreen = () => {
  const [tab, setTab] = useState<"Weekly" | "All Time">("Weekly");

  const topThree = LEADERBOARD.slice(0, 3);
  const remaining = LEADERBOARD.slice(3);

  const renderPodiumItem = (player: any, rank: number) => {
    const isFirst = rank === 1;
    const height = isFirst ? 100 : rank === 2 ? 75 : 60;
    const order = rank === 2 ? 0 : rank === 1 ? 1 : 2; // To ensure 2nd is left, 1st center, 3rd right

    return (
      <View key={player.id} style={styles.podiumColumn}>
        <View style={styles.podiumUserContainer}>
          {isFirst && <Crown size={24} color="#FFD700" fill="#FFD700" style={styles.crownIcon} />}
          <View style={[styles.podiumAvatarContainer, isFirst && styles.firstAvatar]}>
            <View style={styles.podiumAvatar}>
              <Text style={styles.avatarText}>{player.name[0]}</Text>
            </View>
            <View style={styles.flagContainer}>
              <Text style={{ fontSize: 10 }}>🇮🇳</Text>
            </View>
          </View>
          <Text style={styles.podiumName} numberOfLines={1}>
            {player.name.split(" ")[0]}
          </Text>
          <View style={styles.podiumPointsBadge}>
            <Text style={styles.podiumPointsText}>{player.points.toLocaleString()} XP</Text>
          </View>
        </View>

        <LinearGradient
          colors={isFirst ? ["#FFFFFF30", "#FFFFFF10"] : ["#FFFFFF20", "#FFFFFF05"]}
          style={[styles.podiumBlock, { height }]}
        >
          <Text style={styles.podiumRankText}>{rank}</Text>
        </LinearGradient>
      </View>
    );
  };

  const renderListItem = ({ item, index }: { item: any; index: number }) => {
    const rank = index + 4;
    return (
      <View style={styles.listItem}>
        <View style={styles.listRankContainer}>
          <Text style={styles.listRankText}>{rank}</Text>
        </View>
        <View style={styles.listAvatarContainer}>
          <View style={styles.listAvatar}>
            <Text style={styles.listAvatarChar}>{item.name[0]}</Text>
          </View>
          <View style={styles.listFlag}>
            <Text style={{ fontSize: 8 }}>🇮🇳</Text>
          </View>
        </View>
        <View style={styles.listInfo}>
          <Text style={styles.listName}>{item.name}</Text>
          <Text style={styles.listSubText}>{item.points.toLocaleString()} points</Text>
        </View>
        {index === 0 && (
          <View style={styles.listBadge}>
            <Crown size={12} color="#9EA0A4" fill="#9EA0A4" />
          </View>
        )}
      </View>
    );
  };

  return (
    <LinearGradient colors={["#6A5AE0", "#5346B0"]} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)"))}
          >
            <ArrowLeft size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Leaderboard</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, tab === "Weekly" && styles.activeTab]}
            onPress={() => setTab("Weekly")}
          >
            <Text style={[styles.tabText, tab === "Weekly" && styles.activeTabText]}>Weekly</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, tab === "All Time" && styles.activeTab]}
            onPress={() => setTab("All Time")}
          >
            <Text style={[styles.tabText, tab === "All Time" && styles.activeTabText]}>
              All Time
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.listHeader}>
          <View style={styles.podiumSection}>
            <View style={styles.podiumWrapper}>
              {renderPodiumItem(topThree[1], 2)}
              {renderPodiumItem(topThree[0], 1)}
              {renderPodiumItem(topThree[2], 3)}
            </View>
            <View style={styles.timerContainer}>
              <Timer size={14} color="#FFFFFF80" />
              <Text style={styles.timerText}>06d 23h 00m</Text>
            </View>
          </View>

          <LinearGradient colors={["#FFAD60", "#FF8C42"]} style={styles.statsBanner}>
            <View style={styles.statsRankCircle}>
              <Text style={styles.statsRankText}>#4</Text>
            </View>
            <Text style={styles.statsText}>
              You are doing better than{"\n"}
              <Text style={{ fontWeight: "900" }}>60% of other players!</Text>
            </Text>
          </LinearGradient>
        </View>

        <FlatList
          data={remaining}
          renderItem={renderListItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          style={styles.listSheet}
        />
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    color: "#FFF",
    ...FONTS.bold,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#00000020",
    marginHorizontal: 20,
    borderRadius: 25,
    padding: 4,
    marginBottom: 15, // Reduced from 30
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 22,
  },
  activeTab: {
    backgroundColor: "#FFFFFF30",
  },
  tabText: {
    color: "#FFFFFF80",
    fontSize: 14,
    ...FONTS.bold,
  },
  activeTabText: {
    color: "#FFF",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  listSheet: {
    flex: 1,
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
  },
  listHeader: {
    paddingTop: 10,
  },
  podiumSection: {
    alignItems: "center",
    paddingBottom: 20,
  },
  podiumWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    width: "100%",
    paddingHorizontal: 10,
  },
  podiumColumn: {
    alignItems: "center",
    flex: 1,
  },
  podiumUserContainer: {
    alignItems: "center",
    marginBottom: 10,
    width: "100%",
  },
  podiumAvatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FFF",
    padding: 3,
    marginBottom: 4,
  },
  firstAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginTop: -10,
  },
  podiumAvatar: {
    flex: 1,
    borderRadius: 40,
    backgroundColor: "#6366F1",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "bold",
  },
  flagContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#FFF",
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eee",
  },
  crownIcon: {
    marginBottom: 4,
  },
  podiumName: {
    color: "#FFF",
    fontSize: 14,
    ...FONTS.bold,
    marginBottom: 4,
  },
  podiumPointsBadge: {
    backgroundColor: "#00000030",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  podiumPointsText: {
    color: "#FFF",
    fontSize: 10,
    ...FONTS.bold,
  },
  podiumBlock: {
    width: "90%",
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  podiumRankText: {
    color: "#FFF",
    fontSize: 32,
    fontWeight: "900",
    opacity: 0.8,
  },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    alignSelf: "flex-end",
    marginRight: 24,
  },
  timerText: {
    color: "#FFFFFF80",
    fontSize: 12,
    marginLeft: 4,
    ...FONTS.bold,
  },
  statsBanner: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    padding: 18,
    borderRadius: 24,
    marginTop: 15,
    marginBottom: 20,
  },
  statsRankCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#00000010",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  statsRankText: {
    color: "#FFF",
    fontSize: 18,
    ...FONTS.bold,
  },
  statsText: {
    color: "#FFF",
    fontSize: 14,
    lineHeight: 20,
    ...FONTS.medium,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 15,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  listRankContainer: {
    width: 25,
  },
  listRankText: {
    fontSize: 14,
    color: "#9EA0A4",
    ...FONTS.bold,
  },
  listAvatarContainer: {
    marginHorizontal: 12,
  },
  listAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
  },
  listAvatarChar: {
    fontSize: 18,
    ...FONTS.bold,
    color: "#6366F1",
  },
  listFlag: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: "#FFF",
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eee",
  },
  listInfo: {
    flex: 1,
  },
  listName: {
    fontSize: 15,
    color: "#000",
    ...FONTS.bold,
  },
  listSubText: {
    fontSize: 12,
    color: "#9EA0A4",
    marginTop: 2,
  },
  listBadge: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
});

// export default LeaderboardScreen;
