import React from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { COLORS, FONTS, SIZES } from "@/constants/theme";
import { ArrowLeft } from "lucide-react-native";

export const ReadingScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reading Practice</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.text}>Welcome to Reading Practice. Select a story to begin.</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  header: { padding: SIZES.padding, paddingTop: 60, flexDirection: "row", alignItems: "center" },
  backButton: { marginRight: 15 },
  headerTitle: { fontSize: 24, ...FONTS.bold },
  content: { flex: 1, justifyContent: "center", alignItems: "center", padding: SIZES.padding },
  text: { fontSize: 16, color: COLORS.gray, textAlign: "center" },
});
