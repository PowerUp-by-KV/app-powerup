import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  useWindowDimensions,
  Dimensions,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { COLORS, FONTS, SIZES } from "@/constants/theme";
import { ArrowLeft, Play, BookOpen, ChevronRight, ChevronLeft } from "lucide-react-native";
import { grammarTopics } from "@/constants/grammarData";

import { useTimeTracker } from "@/hooks/useTimeTracker";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export const GrammarContentScreen = () => {
  useTimeTracker("grammar");
  const { width } = useWindowDimensions();
  const { subtopic: subtopicRaw } = useLocalSearchParams();
  const initialSubtopic = typeof subtopicRaw === "string" ? JSON.parse(subtopicRaw) : subtopicRaw;

  // 1. Find the current topic, chapter and all its subtopics
  let chapterSubtopics = [];
  let initialIndex = 0;
  let topicTitle = "";
  let chapterTitle = "";

  grammarTopics.forEach((topic) => {
    topic.chapters.forEach((chapter) => {
      const foundIndex = chapter.subtopics.findIndex((st) => st.id === initialSubtopic.id);
      if (foundIndex !== -1) {
        chapterSubtopics = chapter.subtopics;
        initialIndex = foundIndex;
        topicTitle = topic.title;
        chapterTitle = chapter.title;
      }
    });
  });

  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const flatListRef = useRef(null);

  if (chapterSubtopics.length === 0) return null;

  const currentSubtopic = chapterSubtopics[activeIndex];

  const handleNextLesson = () => {
    if (activeIndex < chapterSubtopics.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
      setActiveIndex(activeIndex + 1);
    } else {
      // Logic for moving to next chapter or topic
      moveToNextChapter();
    }
  };

  const moveToNextChapter = () => {
    let currentTopicIndex = -1;
    let currentChapterIndex = -1;

    for (let t = 0; t < grammarTopics.length; t++) {
      for (let c = 0; c < grammarTopics[t].chapters.length; c++) {
        if (
          grammarTopics[t].chapters[c].id ===
          grammarTopics
            .find((tp) => tp.chapters.some((ch) => ch.id === grammarTopics[t].chapters[c].id))
            ?.chapters.find((ch) => ch.subtopics.some((st) => st.id === currentSubtopic.id))?.id
        ) {
          // This is complex, let's simplify.
        }
      }
    }

    // Simpler lookup for next navigation
    let topicIdx = -1,
      chapIdx = -1;
    grammarTopics.forEach((t, ti) => {
      t.chapters.forEach((c, ci) => {
        if (c.subtopics.some((st) => st.id === currentSubtopic.id)) {
          topicIdx = ti;
          chapIdx = ci;
        }
      });
    });

    if (topicIdx === -1) return;

    const currentTopic = grammarTopics[topicIdx];

    // Try next chapter in same topic
    if (chapIdx < currentTopic.chapters.length - 1) {
      const nextChapter = currentTopic.chapters[chapIdx + 1];
      if (nextChapter.subtopics.length > 0) {
        router.replace({
          pathname: "/GrammarContent",
          params: { subtopic: JSON.stringify(nextChapter.subtopics[0]) },
        });
        return;
      }
    }

    // Try next topic
    if (topicIdx < grammarTopics.length - 1) {
      const nextTopic = grammarTopics[topicIdx + 1];
      if (nextTopic.chapters.length > 0 && nextTopic.chapters[0].subtopics.length > 0) {
        router.replace({
          pathname: "/GrammarContent",
          params: { subtopic: JSON.stringify(nextTopic.chapters[0].subtopics[0]) },
        });
        return;
      }
    }

    // Back to home
    router.replace("/(tabs)");
  };

  const renderSubtopic = ({ item }) => (
    <View style={[styles.pageContainer, { width }]}>
      <FlatList
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        ListHeaderComponent={() => (
          <>
            {/* Definition Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <BookOpen size={20} color={COLORS.primary} />
                <Text style={styles.sectionTitle}>Definition</Text>
              </View>
              <Text style={styles.definitionText}>{item.definition}</Text>
            </View>

            {/* Rule Section */}
            <View style={[styles.section, styles.ruleSection]}>
              <Text style={styles.sectionTitleSmall}>Grammar Rule</Text>
              <View style={styles.ruleCard}>
                <Text style={styles.ruleText}>{item.rule}</Text>
              </View>
            </View>

            {/* Examples Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitleSmall}>Examples</Text>
              {item.examples.map((example, index) => (
                <View key={index} style={styles.exampleItem}>
                  <View style={styles.bullet} />
                  <Text style={styles.exampleText}>{example}</Text>
                </View>
              ))}
            </View>
          </>
        )}
        data={[]}
        renderItem={null}
        ListFooterComponent={() => <View style={{ height: 100 }} />}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={COLORS.black} />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.topicLabel}>
            {topicTitle} • {chapterTitle}
          </Text>
          <Text style={styles.headerTitle}>{currentSubtopic.title}</Text>
          <Text style={styles.headerSub}>
            Lesson {activeIndex + 1} of {chapterSubtopics.length}
          </Text>
        </View>
        <View style={styles.progressDots}>
          {chapterSubtopics.map((_, i) => (
            <View key={i} style={[styles.dot, i === activeIndex && styles.activeDot]} />
          ))}
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={chapterSubtopics}
        renderItem={renderSubtopic}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          if (index !== activeIndex && index >= 0 && index < chapterSubtopics.length) {
            setActiveIndex(index);
          }
        }}
        scrollEventThrottle={16}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        initialScrollIndex={initialIndex}
      />

      {/* Action Footer */}
      <View style={styles.footer}>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.practiceButton}
            onPress={() =>
              router.push({
                pathname: "/exercise",
                params: { lessonId: currentSubtopic.id, lessonTitle: currentSubtopic.title },
              })
            }
          >
            <Text style={styles.practiceButtonText}>Practice This</Text>
            <Play size={20} color={COLORS.white} fill={COLORS.white} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.nextTopicButton} onPress={handleNextLesson}>
            <Text style={styles.nextTopicButtonText}>
              {activeIndex < chapterSubtopics.length - 1 ? "Next Lesson" : "Next Chapter"}
            </Text>
            <ChevronRight size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  pageContainer: {
    width: SCREEN_WIDTH,
    flex: 1,
    overflow: "hidden",
  },
  header: {
    padding: SIZES.padding,
    paddingTop: 60,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  backButton: {
    marginRight: 15,
  },
  headerTextContainer: {
    flex: 1,
  },
  topicLabel: {
    fontSize: 12,
    color: COLORS.primary,
    ...FONTS.bold,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 20,
    color: COLORS.black,
    ...FONTS.bold,
  },
  headerSub: {
    fontSize: 14,
    color: COLORS.gray,
    ...FONTS.medium,
  },
  progressDots: {
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.background,
    marginLeft: 4,
  },
  activeDot: {
    width: 20,
    backgroundColor: COLORS.primary,
  },
  content: {
    padding: SIZES.padding,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    color: COLORS.black,
    marginLeft: 10,
    ...FONTS.bold,
  },
  sectionTitleSmall: {
    fontSize: 16,
    color: COLORS.darkGray,
    marginBottom: 12,
    ...FONTS.semiBold,
  },
  definitionText: {
    fontSize: 16,
    color: COLORS.darkGray,
    lineHeight: 24,
    ...FONTS.regular,
  },
  ruleSection: {
    backgroundColor: COLORS.background,
    padding: 20,
    borderRadius: 20,
  },
  ruleCard: {
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  ruleText: {
    fontSize: 16,
    color: COLORS.primary,
    ...FONTS.bold,
  },
  exampleItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    paddingLeft: 5,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginRight: 12,
  },
  exampleText: {
    fontSize: 15,
    color: COLORS.darkGray,
    ...FONTS.medium,
  },
  footer: {
    padding: SIZES.padding,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: COLORS.background,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  practiceButton: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 18,
    borderRadius: 20,
    flex: 1.2,
    marginRight: 10,
  },
  practiceButtonText: {
    color: COLORS.white,
    fontSize: 16,
    marginRight: 10,
    ...FONTS.bold,
  },
  nextTopicButton: {
    backgroundColor: COLORS.white,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
    flex: 1,
  },
  nextTopicButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    marginRight: 5,
    ...FONTS.bold,
  },
});

// export default GrammarContentScreen;
