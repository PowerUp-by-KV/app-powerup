import React from "react";
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { COLORS, FONTS, SIZES } from "@/constants/theme";
import { grammarTopics } from "@/constants/grammarData";
import { ArrowLeft, ChevronRight, Book } from "lucide-react-native";

import { useAppContext } from "@/features/learning/hooks/AppContext";
import { ProgressBar } from "@/features/progress/components";

export const GrammarScreen = () => {
  const topics = grammarTopics || [];
  const { grammarProgress } = useAppContext();

  const renderChapter = ({ item }) => {
    const progress = grammarProgress[item.id]?.progress || 25;
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.chapterCard}
        onPress={() =>
          router.push({
            pathname: "/topics",
            params: { moduleId: item.id, moduleTitle: item.title },
          })
        }
      >
        <View style={styles.chapterIconContainer}>
          <Book size={24} color={COLORS.primary} />
        </View>
        <View style={styles.chapterInfo}>
          <View style={styles.chapterHeader}>
            <Text style={styles.chapterTitle}>{item.title}</Text>
            <Text style={styles.lessonCount}>{item.chapters?.length || 0} Chapters</Text>
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
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={COLORS.black} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Grammar Topics</Text>
          <Text style={styles.headerSub}>Master English structure step-by-step</Text>
        </View>
      </View>

      <FlatList
        data={topics}
        renderItem={renderChapter}
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
  chapterCard: {
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
  chapterIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: COLORS.primary + "15",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  chapterInfo: {
    flex: 1,
    marginRight: 15,
  },
  chapterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  chapterTitle: {
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

// export default GrammarScreen;
