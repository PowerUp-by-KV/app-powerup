import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import { COLORS, FONTS, SIZES } from "@/constants/theme";
import { speakingCategories } from "@/constants/verbalData";
import { LinearGradient } from "expo-linear-gradient";
import {
  MessageCircle,
  Image,
  Mic,
  BookOpen,
  Briefcase,
  ArrowLeft,
  ChevronRight,
} from "lucide-react-native";

import { useTimeTracker } from "@/hooks/useTimeTracker";

const { width } = Dimensions.get("window");

export const VerbalCategoriesScreen = () => {
  useTimeTracker("verbal");
  const getIcon = (iconName) => {
    const props = { size: 32, color: COLORS.white };
    switch (iconName) {
      case "message-circle":
        return <MessageCircle {...props} />;
      case "image":
        return <Image {...props} />;
      case "mic":
        return <Mic {...props} />;
      case "book-open":
        return <BookOpen {...props} />;
      case "briefcase":
        return <Briefcase {...props} />;
      default:
        return <Mic {...props} />;
    }
  };

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.categoryCard}
      onPress={() =>
        router.push({ pathname: "/SpeakingPractice", params: { categoryId: item.id } })
      }
    >
      <LinearGradient colors={item.gradient} style={styles.gradient}>
        <View style={styles.cardHeader}>
          <View style={styles.iconBadge}>{getIcon(item.icon)}</View>
          <ChevronRight size={20} color={COLORS.white} />
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.categoryTitle}>{item.title}</Text>
          <Text style={styles.categoryDesc}>{item.description}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verbal Mastery</Text>
        <Text style={styles.headerSub}>Choose a category to practice speaking</Text>
      </View>

      <FlatList
        data={speakingCategories}
        renderItem={renderCategory}
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
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 28,
    color: COLORS.black,
    ...FONTS.bold,
  },
  headerSub: {
    fontSize: 16,
    color: COLORS.gray,
    ...FONTS.medium,
    marginTop: 4,
  },
  listContent: {
    padding: SIZES.padding,
    paddingTop: 20,
    paddingBottom: 40,
  },
  categoryCard: {
    marginBottom: 20,
    height: 180,
    borderRadius: 25,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  gradient: {
    flex: 1,
    padding: 20,
    justifyContent: "space-between",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  iconBadge: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  cardBody: {
    marginTop: 10,
  },
  categoryTitle: {
    fontSize: 22,
    color: COLORS.white,
    ...FONTS.bold,
  },
  categoryDesc: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.9,
    marginTop: 5,
    ...FONTS.medium,
  },
});

// export default VerbalCategoriesScreen;
