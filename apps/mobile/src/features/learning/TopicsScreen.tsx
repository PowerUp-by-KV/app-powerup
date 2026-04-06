import React from "react";
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { COLORS, FONTS, SIZES } from "@/constants/theme";
import { grammarTopics } from "@/constants/grammarData";
import { ChevronRight, ArrowLeft } from "lucide-react-native";

import { useAppContext } from "./hooks/AppContext";
import { ProgressBar } from "@/features/progress/components";

export const TopicsScreen = () => {
  const { moduleId, moduleTitle } = useLocalSearchParams();
  const { grammarProgress } = useAppContext();

  const topicData = grammarTopics.find((t) => t.id === moduleId);
  const chaptersForTopic = topicData?.chapters || [];

  const renderTopic = ({ item }) => {
    const progress = grammarProgress[moduleId as string]?.chapters[item.id]?.progress || 25;
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.topicItem}
        onPress={() =>
          router.push({
            pathname: "/lessons",
            params: { chapterId: item.id, chapterTitle: item.title, topicId: moduleId },
          })
        }
      >
        <View style={styles.topicInfo}>
          <View style={styles.topicHeader}>
            <Text style={styles.topicTitle}>{item.title}</Text>
            <Text style={styles.lessonCount}>{item.subtopics?.length || 0} Lessons</Text>
          </View>
          <ProgressBar progress={progress} color={COLORS.primary} />
        </View>
        <ChevronRight size={20} color={COLORS.lightGray} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)"))}
        >
          <ArrowLeft size={24} color={COLORS.black} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>{moduleTitle} Chapters</Text>
          <Text style={styles.headerSub}>Master each chapter sequentially</Text>
        </View>
      </View>

      <FlatList
        data={chaptersForTopic}
        renderItem={renderTopic}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SIZES.padding,
    paddingTop: 60,
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 24,
    color: COLORS.black,
    ...FONTS.bold,
  },
  headerSub: {
    fontSize: 14,
    color: COLORS.gray,
    ...FONTS.regular,
  },
  listContent: {
    padding: SIZES.padding,
    paddingBottom: 100,
  },
  topicItem: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  topicInfo: {
    flex: 1,
    marginRight: 15,
  },
  topicHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  topicTitle: {
    fontSize: 18,
    color: COLORS.black,
    ...FONTS.semiBold,
  },
  lessonCount: {
    fontSize: 12,
    color: COLORS.gray,
    ...FONTS.medium,
  },
});

// export default TopicsScreen;
