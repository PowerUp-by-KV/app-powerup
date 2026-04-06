import React from "react";
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { COLORS, FONTS, SIZES } from "@/constants/theme";
import { grammarTopics } from "@/constants/grammarData";
import { ArrowLeft, Clock, BarChart2, ChevronRight, CheckCircle } from "lucide-react-native";

export const LessonsScreen = () => {
  const { chapterId, chapterTitle, topicId } = useLocalSearchParams();

  const topicData = grammarTopics.find((t) => t.id === topicId);
  const chapterData = topicData?.chapters.find((ch) => ch.id === chapterId);
  const subtopics = chapterData?.subtopics || [];

  const renderLesson = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      style={styles.lessonItem}
      onPress={() =>
        router.push({ pathname: "/GrammarContent", params: { subtopic: JSON.stringify(item) } })
      }
    >
      <View style={styles.lessonContent}>
        <View style={styles.lessonHeader}>
          <Text style={styles.lessonTitle}>{item.title}</Text>
          {item.progress === 100 && <CheckCircle size={20} color={COLORS.success} />}
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <BarChart2 size={14} color={COLORS.primary} />
            <Text style={styles.metaText}>{item.difficulty || "General"}</Text>
          </View>
          <View style={styles.metaItem}>
            <Clock size={14} color={COLORS.gray} />
            <Text style={styles.metaText}>{item.time || "10m"}</Text>
          </View>
        </View>

        {item.progress > 0 && item.progress < 100 && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBackground}>
              <View style={[styles.progressForeground, { width: `${item.progress}%` }]} />
            </View>
            <Text style={styles.progressText}>{item.progress}%</Text>
          </View>
        )}
      </View>
      <ChevronRight size={20} color={COLORS.lightGray} />
    </TouchableOpacity>
  );

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
          <Text style={styles.headerTitle}>{chapterTitle} Lessons</Text>
          <Text style={styles.headerSub}>Complete these to master the chapter</Text>
        </View>
      </View>

      <FlatList
        data={subtopics}
        renderItem={renderLesson}
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
    flexDirection: "row",
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
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
  lessonItem: {
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
  lessonContent: {
    flex: 1,
    marginRight: 15,
  },
  lessonHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  lessonTitle: {
    fontSize: 18,
    color: COLORS.black,
    ...FONTS.semiBold,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.gray,
    marginLeft: 5,
    ...FONTS.medium,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
  },
  progressBackground: {
    flex: 1,
    height: 6,
    backgroundColor: COLORS.lightGray,
    borderRadius: 3,
    marginRight: 10,
  },
  progressForeground: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 10,
    color: COLORS.primary,
    ...FONTS.bold,
  },
});

// export default LessonsScreen;
