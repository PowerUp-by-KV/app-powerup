import React from "react";
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useGetProgressSummaryQuery } from "@/services/progress-api";

const CategoryProgress = ({
  label,
  percentage,
  status,
  quests,
}: {
  label: string;
  percentage: number;
  status: string;
  quests: number;
}) => (
  <View className="bg-slate-200 rounded-3xl p-5 mb-4 border border-slate-300">
    <View className="flex-row justify-between mb-4">
      <View className="flex-row items-center flex-1">
        <View className="w-12 h-12 bg-slate-400 rounded-2xl mr-4" style={{ flexShrink: 0 }} />
        <View className="flex-1">
          <Text className="text-[#334155] font-bold text-base" numberOfLines={1}>
            {label}
          </Text>
          <Text className="text-slate-500 font-medium text-xs">{quests} Quest</Text>
        </View>
      </View>
      <View className="items-end ml-4" style={{ flexShrink: 0 }}>
        <Text className="text-[#334155] font-bold text-xl">{percentage}%</Text>
        <Text className="text-slate-500 font-medium text-xs">{status}</Text>
      </View>
    </View>

    {/* Bottom Aligned Progress Bar - Now using stable flex flow */}
    <View className="h-1.5 bg-white rounded-full overflow-hidden w-full">
      <View className="h-full bg-[#334155] rounded-full" style={{ width: `${percentage}%` }} />
    </View>
  </View>
);

export default function AccuracyDetailScreen() {
  const router = useRouter();
  const { data: progress } = useGetProgressSummaryQuery("user-1");

  const accuracy = progress?.overallPercentage || 89;

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/rewards");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      <View style={{ flex: 1, position: "relative" }}>
        <View className="px-6 py-4 flex-row items-center">
          <TouchableOpacity
            onPress={handleBack}
            className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm"
          >
            <ChevronLeft size={24} color="#1E3A8A" />
          </TouchableOpacity>
          <Text className="flex-1 text-center mr-10 text-[#1E3A8A] font-bold text-lg">
            Accuracy
          </Text>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 120 }}
          className="px-6"
          showsVerticalScrollIndicator={false}
        >
          {/* Overall Accuracy Card - High Fidelity Refinement */}
          <View className="bg-slate-200 rounded-[32px] p-6 mb-8 border border-slate-300 items-center">
            <Text className="text-slate-600 font-bold mb-6 self-start text-sm">
              Overall Accuracy
            </Text>

            {/* Circular Progress Refinement */}
            <View className="items-center justify-center mb-8">
              <View className="w-40 h-40 rounded-full border-[10px] border-slate-300 items-center justify-center">
                <View
                  className="absolute w-40 h-40 rounded-full border-[10px] border-[#334155]"
                  style={{
                    borderTopColor: "transparent",
                    borderLeftColor: "transparent",
                    transform: [{ rotate: "45deg" }],
                  }}
                />
                <View className="items-center">
                  <Text className="text-[#334155] font-bold text-5xl">{accuracy}%</Text>
                  <Text className="text-slate-500 text-sm font-medium">Accuracy</Text>
                </View>
              </View>
            </View>

            {/* Stats Row - Inverted Dark Theme */}
            <View className="flex-row justify-between w-full">
              <View className="bg-[#475569] rounded-2xl p-4 flex-1 items-center mr-2 shadow-sm">
                <Text className="text-slate-300 text-[10px] font-bold mb-1 uppercase tracking-tighter">
                  Correct
                </Text>
                <Text className="text-white font-bold text-base">1,046</Text>
              </View>
              <View className="bg-[#475569] rounded-2xl p-4 flex-1 items-center mx-1 shadow-sm">
                <Text className="text-slate-300 text-[10px] font-bold mb-1 uppercase tracking-tighter">
                  Wrong
                </Text>
                <Text className="text-white font-bold text-base">129</Text>
              </View>
              <View className="bg-[#475569] rounded-2xl p-4 flex-1 items-center ml-2 shadow-sm">
                <Text className="text-slate-300 text-[10px] font-bold mb-1 uppercase tracking-tighter">
                  Total
                </Text>
                <Text className="text-white font-bold text-base">1,175</Text>
              </View>
            </View>
          </View>

          {/* Performance List */}
          <View>
            <Text className="text-slate-600 font-bold text-lg mb-6">Performance</Text>
            <CategoryProgress
              label="Communication"
              percentage={94}
              status="Excellent"
              quests={32}
            />
            <CategoryProgress label="Grammar" percentage={73} status="Good" quests={43} />
            <CategoryProgress label="Public Speaking" percentage={84} status="Good" quests={12} />
          </View>
        </ScrollView>

        {/* Share Button Overlay - Robust Positioning */}
        <View style={{ position: "absolute", bottom: 30, left: 24, right: 24, zIndex: 10 }}>
          <TouchableOpacity className="shadow-lg shadow-blue-400">
            <LinearGradient
              colors={["#1E3A8A", "#34D399"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                borderRadius: 16,
                height: 56,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>Share</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
