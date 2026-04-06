import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { COLORS, FONTS, SIZES } from "@/constants/theme";
import { behaviouralData } from "@/constants/behaviouralData";
import { ArrowLeft, ChevronRight, Brain, RotateCcw } from "lucide-react-native";
import { MCQOption } from "@/features/learning/components";
import { ProgressBar } from "@/features/progress/components";
import { useTimeTracker } from "@/hooks/useTimeTracker";

const { width } = Dimensions.get("window");

export const BehaviouralScreen = () => {
  useTimeTracker("behavioural");
  const { trait: filterTrait } = useLocalSearchParams();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userResponses, setUserResponses] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isFinished, setIsFinished] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Filter data if a specific trait is requested (Retake mode)
  const filteredData = useMemo(() => {
    if (filterTrait) {
      return behaviouralData.filter((item) => item.trait === filterTrait);
    }
    return behaviouralData;
  }, [filterTrait]);

  const handleSelectOption = (option) => {
    if (selectedOption) return;
    setSelectedOption(option);

    // Small delay to show selection
    setTimeout(() => {
      const newResponses = [
        ...userResponses,
        {
          questionId: filteredData[currentIndex].id,
          selectedOption: option,
          isIdeal: option === filteredData[currentIndex].bestOption,
          trait: filteredData[currentIndex].trait,
          weight: filteredData[currentIndex].traitWeight,
        },
      ];

      setUserResponses(newResponses);

      if (currentIndex < filteredData.length - 1) {
        // Animate transition to next question
        Animated.parallel([
          Animated.timing(fadeAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
          Animated.timing(slideAnim, { toValue: -50, duration: 250, useNativeDriver: true }),
        ]).start(() => {
          setCurrentIndex(currentIndex + 1);
          setSelectedOption(null);
          slideAnim.setValue(50);
          Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
          ]).start();
        });
      } else {
        // Complete - show finish button instead of auto-navigating
        setIsFinished(true);
      }
    }, 400);
  };

  const currentScenario = filteredData[currentIndex];
  const progress = ((currentIndex + 1) / filteredData.length) * 100;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)"))}
        >
          <ArrowLeft size={24} color={COLORS.black} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Brain size={20} color={COLORS.primary} style={{ marginRight: 8 }} />
          <Text style={styles.headerTitle}>
            {filterTrait ? "Focus Training" : "Behavioural Training"}
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.progressSection}>
        {filterTrait && (
          <View className="mb-4 bg-orange-50 p-3 rounded-xl flex-row items-center">
            <RotateCcw size={16} color="#F59E0B" />
            <Text className="ml-2 text-orange-700 font-bold text-xs uppercase">
              Target: {filterTrait}
            </Text>
          </View>
        )}
        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>
            Question {currentIndex + 1} of {filteredData.length}
          </Text>
          <Text style={styles.percentText}>{Math.round(progress)}%</Text>
        </View>
        <ProgressBar progress={progress} color={COLORS.primary} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View
          style={[
            styles.cardContainer,
            { opacity: fadeAnim, transform: [{ translateX: slideAnim }] },
          ]}
        >
          <Text style={styles.scenarioText}>{currentScenario.scenario}</Text>

          <View style={styles.optionsList}>
            {currentScenario.options.map((option, index) => (
              <MCQOption
                key={index}
                label={String.fromCharCode(65 + index)}
                text={option}
                isSelected={selectedOption === option}
                isCorrect={null}
                isWrong={null}
                disabled={!!selectedOption}
                onPress={() => handleSelectOption(option)}
              />
            ))}
          </View>

          {/* Manual Finish button for the last question */}
          {isFinished && (
            <TouchableOpacity
              style={[styles.resultsButton, { marginTop: 30 }]}
              onPress={() =>
                router.push({
                  pathname: "/BehaviouralResult",
                  params: { responses: JSON.stringify(userResponses) },
                })
              }
            >
              <Text style={styles.resultsButtonText}>View Assessment Results</Text>
              <ChevronRight size={20} color={COLORS.white} />
            </TouchableOpacity>
          )}
        </Animated.View>
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerNote}>Choose the response that feels most like you.</Text>
      </View>
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
    justifyContent: "space-between",
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    color: COLORS.black,
    ...FONTS.bold,
  },
  progressSection: {
    padding: SIZES.padding,
    paddingBottom: 0,
  },
  progressInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: COLORS.gray,
    ...FONTS.medium,
  },
  percentText: {
    fontSize: 14,
    color: COLORS.primary,
    ...FONTS.bold,
  },
  scrollContent: {
    padding: SIZES.padding,
    paddingTop: 20,
    flexGrow: 1,
  },
  cardContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 25,
    padding: 25,
    minHeight: 400,
    elevation: 8,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.primary + "15",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginBottom: 20,
  },
  categoryText: {
    fontSize: 10,
    color: COLORS.primary,
    ...FONTS.bold,
    letterSpacing: 1,
  },
  scenarioText: {
    fontSize: 20,
    color: COLORS.black,
    ...FONTS.bold,
    lineHeight: 30,
    marginBottom: 30,
  },
  optionsList: {
    gap: 15,
  },
  optionButton: {
    backgroundColor: COLORS.background,
    padding: 18,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#eee",
  },
  optionText: {
    fontSize: 15,
    color: COLORS.black,
    ...FONTS.medium,
    lineHeight: 22,
  },
  footer: {
    padding: SIZES.padding,
    paddingBottom: 40,
    alignItems: "center",
  },
  footerNote: {
    fontSize: 12,
    color: COLORS.gray,
    fontStyle: "italic",
    ...FONTS.regular,
  },
  resultsButton: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 30,
    width: "100%",
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  resultsButtonText: {
    color: COLORS.white,
    fontSize: 16,
    ...FONTS.bold,
    marginRight: 10,
  },
});

// export default BehaviouralScreen;
