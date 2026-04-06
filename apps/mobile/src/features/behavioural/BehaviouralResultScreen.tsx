import React, { useMemo } from "react";
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { COLORS } from "@/constants/theme";
import {
  ArrowLeft,
  Brain,
  Shield,
  Users,
  Zap,
  Heart,
  BookOpen,
  Star,
  Info,
  RotateCcw,
  ChevronDown,
  ChevronUp,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { RadarChart } from "./components/RadarChart";

/**
 * HEXACO Behavioral Analysis Result Screen.
 * Displays a Radar Chart (Hexagon) and detailed trait breakdown.
 */
export const BehaviouralResultScreen = () => {
  const { responses: responsesRaw = "[]" } = useLocalSearchParams();
  const responses =
    typeof responsesRaw === "string" ? JSON.parse(responsesRaw) : responsesRaw || [];

  const analysis = useMemo(() => {
    const traits = {
      "Honesty-Humility": { score: 0, weight: 0 },
      Emotionality: { score: 0, weight: 0 },
      Extraversion: { score: 0, weight: 0 },
      Agreeableness: { score: 0, weight: 0 },
      Conscientiousness: { score: 0, weight: 0 },
      "Openness to Experience": { score: 0, weight: 0 },
    };

    responses.forEach((res: any) => {
      if (traits[res.trait as keyof typeof traits]) {
        traits[res.trait as keyof typeof traits].weight += res.weight;
        if (res.isIdeal) {
          traits[res.trait as keyof typeof traits].score += res.weight;
        }
      }
    });

    const results: Record<string, number> = {};
    Object.keys(traits).forEach((trait) => {
      const { score, weight } = traits[trait as keyof typeof traits];
      results[trait] = weight > 0 ? (score / weight) * 100 : 75;
    });

    return results;
  }, [responses]);

  const getAISummary = () => {
    const highTraits = Object.entries(analysis)
      .filter(([_, s]) => (s as number) >= 85)
      .map(([t]) => t);
    if (highTraits.length > 2) {
      return "Your HEXACO profile indicates high professional maturity and strong ethical alignment. You likely excel in complex collaborative environments.";
    }
    if (analysis["Extraversion"] > 80 && analysis["Conscientiousness"] < 70) {
      return "You are highly communicative and social, but may benefit from focusing more on disciplined planning and deadline management.";
    }
    return "Your profile suggests a balanced approach to challenges with unique strengths in situational awareness and empathy.";
  };

  const weakTraits = useMemo(() => {
    return Object.entries(analysis)
      .filter(([_, score]) => (score as number) < 85)
      .map(([trait]) => trait);
  }, [analysis]);

  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <View style={{ flex: 1 }} className="bg-[#F8F9FA]">
      <View className="p-6 pt-16 bg-white rounded-b-[40px] flex-row items-center justify-between shadow-sm">
        <TouchableOpacity
          className="w-10 h-10 rounded-full bg-[#F8F9FA] items-center justify-center"
          onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)"))}
        >
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-black">HEXACO Analysis</Text>
        <View className="w-10" />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 24,
          paddingTop: 24,
          paddingBottom: 60,
        }}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={["#6366F1", "#8B5CF6"]}
          className="p-8 rounded-[32px] items-center shadow-lg"
        >
          <Brain size={48} color="white" />
          <Text className="text-white text-2xl font-bold mt-4">Trait Distribution</Text>
          <Text className="text-white/70 text-sm font-medium">
            Visualizing your behavioral profile
          </Text>
        </LinearGradient>

        <RadarChart data={analysis} />

        {weakTraits.length > 0 && (
          <View className="mt-6 mb-8">
            <TouchableOpacity
              className="flex-row items-center justify-between bg-white p-5 rounded-2xl shadow-sm border border-orange-50"
              onPress={() => setIsExpanded(!isExpanded)}
              activeOpacity={0.7}
            >
              <View className="flex-row items-center">
                <RotateCcw size={20} color="#F59E0B" />
                <Text className="text-xl font-bold text-black ml-2">Focus Areas</Text>
                <View className="ml-2 bg-orange-100 px-2 py-0.5 rounded-full">
                  <Text className="text-orange-700 text-[10px] font-bold">{weakTraits.length}</Text>
                </View>
              </View>
              {isExpanded ? (
                <ChevronUp size={20} color="#6B7280" />
              ) : (
                <ChevronDown size={20} color="#6B7280" />
              )}
            </TouchableOpacity>

            {isExpanded && (
              <View className="mt-4">
                <Text className="text-gray-500 mb-4 font-medium px-1">
                  Recommended training to strengthen these traits:
                </Text>
                {weakTraits.map((trait) => (
                  <View
                    key={trait}
                    className="bg-white p-5 rounded-2xl mb-3 shadow-sm border border-orange-100 flex-row items-center justify-between"
                  >
                    <View className="flex-1">
                      <Text className="text-black font-bold text-base">{trait}</Text>
                      <Text className="text-gray-500 text-xs mt-1">
                        Current Score: {Math.round(analysis[trait])}%
                      </Text>
                    </View>
                    <TouchableOpacity
                      className="bg-orange-500 px-5 py-2.5 rounded-xl shadow-sm"
                      onPress={() => router.push({ pathname: "/behavioural", params: { trait } })}
                    >
                      <Text className="text-white font-extrabold text-sm">Strengthen</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        <View className="bg-blue-50 p-6 rounded-3xl mt-2 border border-blue-100">
          <View className="flex-row items-center mb-3">
            <Info size={20} color="#3B82F6" />
            <Text className="text-blue-600 font-bold ml-2">AI Insights</Text>
          </View>
          <Text className="text-gray-700 font-medium leading-5">{getAISummary()}</Text>
        </View>

        <TouchableOpacity
          className="bg-indigo-600 py-5 rounded-[24px] items-center mt-10 shadow-lg"
          onPress={() => router.replace("/(tabs)")}
        >
          <Text className="text-white text-lg font-extrabold">Complete Session</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

// export default BehaviouralResultScreen;
