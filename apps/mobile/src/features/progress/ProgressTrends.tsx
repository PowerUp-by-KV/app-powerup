import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  FlatList,
} from "react-native";
import { router } from "expo-router";
import { ChevronLeft, ChevronDown, Check } from "lucide-react-native";
import { useProgress } from "./hooks/ProgressContext";
import { COLORS, FONTS, SIZES } from "@/constants/theme";
import { ProgressChart } from "./components";

const DropdownSelector = ({
  label,
  options,
  onSelect,
}: {
  label: string;
  options: string[];
  onSelect: (val: string) => void;
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => setVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.dropdownText}>{label}</Text>
        <ChevronDown size={18} color={COLORS.quaternary} />
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setVisible(false)}
        >
          <View style={styles.modalContent}>
            <FlatList
              data={options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.optionItem}
                  onPress={() => {
                    onSelect(item);
                    setVisible(false);
                  }}
                >
                  <Text
                    style={[styles.optionText, item === label ? styles.optionTextActive : null]}
                  >
                    {item}
                  </Text>
                  {item === label && <Check size={18} color={COLORS.quaternary} />}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

export const ProgressTrends = () => {
  const { trends } = useProgress();
  const [module, setModule] = useState("grammar");
  const [period, setPeriod] = useState("30 Days");

  const modules = ["grammar", "listening", "reading", "Pronunciation", "Vocabulary"];
  const periods = ["7 Days", "30 Days", "90 Days", "All Time"];

  // Module specific mock data to show interactivity
  const getMockData = (mod: string) => {
    switch (mod) {
      case "listening":
        return [20, 40, 45, 10, 75];
      case "reading":
        return [10, 30, 10, 20, 90];
      default:
        return [35, 45, 20, 90, 100];
    }
  };

  const chartData = {
    labels: ["Mar 1", "Mar 15", "Mar 29"],
    datasets: [{ data: getMockData(module) }],
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push("/(tabs)/progress");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ChevronLeft size={28} color={COLORS.black} />
          <Text style={styles.headerTitle}>
            Progress Over <Text style={styles.timeHighlight}>Time</Text>
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.selectorsRow}>
          <DropdownSelector label={module} options={modules} onSelect={setModule} />
          <DropdownSelector label={period} options={periods} onSelect={setPeriod} />
        </View>

        <ProgressChart data={chartData} />

        <View style={styles.statsContainer}>
          <View style={styles.statRow}>
            <Text style={styles.statIcon}>📈</Text>
            <Text style={styles.statText}>+15% improvement this month</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statIcon}>🎯</Text>
            <Text style={styles.statText}>
              Next goal: Reach <Text style={styles.goalHighlight}>80%</Text> in {module}
            </Text>
          </View>
        </View>

        <View style={{ height: 50 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 22,
    ...FONTS.bold,
    color: COLORS.black,
    marginLeft: 10,
  },
  timeHighlight: {
    color: "#FF5A5F",
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  selectorsRow: {
    flexDirection: "row",
    marginBottom: 30,
    marginTop: 10,
    zIndex: 10,
  },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: COLORS.quaternary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 10,
  },
  dropdownText: {
    fontSize: 16,
    ...FONTS.bold,
    color: COLORS.quaternary,
    marginRight: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.1)",
    justifyContent: "flex-start",
    paddingTop: 120, // Approximate position below selectors
    paddingHorizontal: 20,
  },
  modalContent: {
    width: "60%", // Smaller width
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 5,
    maxHeight: "50%",
    elevation: 5,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray + "30",
  },
  optionText: {
    fontSize: 16,
    ...FONTS.medium,
    color: COLORS.black,
  },
  optionTextActive: {
    color: COLORS.quaternary,
    ...FONTS.bold,
  },
  statsContainer: {
    marginTop: 40,
    paddingHorizontal: 10,
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  statIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  statText: {
    fontSize: 18,
    ...FONTS.medium,
    color: COLORS.darkGray,
  },
  goalHighlight: {
    color: COLORS.quaternary,
    ...FONTS.bold,
  },
});
