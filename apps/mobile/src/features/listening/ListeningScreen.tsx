import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Animated,
} from "react-native";
import { router } from "expo-router";
import { COLORS, FONTS, SIZES } from "@/constants/theme";
import { listeningData } from "@/constants/listeningData";
import { Headphones, ChevronRight, ArrowLeft, PlayCircle } from "lucide-react-native";

import { useTimeTracker } from "@/hooks/useTimeTracker";

export const ListeningScreen = () => {
  useTimeTracker("listening");
  const renderItem = ({ item, index }) => {
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() =>
          router.push({ pathname: "/ListeningPractice", params: { lessonId: item.id } })
        }
      >
        <View style={styles.iconContainer}>
          <Headphones size={24} color={COLORS.primary} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.lessonTitle}>{item.title}</Text>
          <Text style={styles.lessonSubtitle}>{item.questions.length} Questions</Text>
        </View>
        <PlayCircle size={28} color={COLORS.primary} />
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
          <Text style={styles.headerTitle}>Listening Exercises</Text>
          <Text style={styles.headerSub}>Improve your English listening skills</Text>
        </View>
      </View>

      <FlatList
        data={listeningData}
        renderItem={renderItem}
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
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  backButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
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
    paddingTop: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: COLORS.primary + "15",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 18,
    color: COLORS.black,
    ...FONTS.bold,
  },
  lessonSubtitle: {
    fontSize: 13,
    color: COLORS.gray,
    ...FONTS.medium,
    marginTop: 2,
  },
});

// export default ListeningScreen;
