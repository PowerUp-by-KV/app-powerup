import React from "react";
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft, Trophy, Award, Lock } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

const MedalItem = ({ locked = false }) => (
  <View className="flex-1 items-center mb-6">
    <View
      className={`w-20 h-20 rounded-full items-center justify-center ${locked ? "bg-slate-400" : "bg-[#475569] shadow-lg shadow-black/20"}`}
    >
      {locked ? <Lock size={32} color="black" /> : <Award size={44} color="#FACC15" />}
    </View>
  </View>
);

const ProgressCard = () => (
  <View className="bg-slate-200 rounded-2xl p-5 border border-slate-300 mb-3">
    <View className="flex-row items-center justify-between">
      <View className="flex-1 mr-4">
        <Text className="text-[#1E3A8A] font-bold text-[11px] mb-2">
          Complete 2 weeks of streaks
        </Text>
        <View className="h-2 bg-white rounded-full overflow-hidden">
          <View className="h-full bg-[#334155] rounded-full w-[15%]" />
        </View>
      </View>
      <View className="w-12 h-12 bg-white rounded-xl items-center justify-center shadow-sm">
        <Lock size={24} color="black" />
      </View>
    </View>
  </View>
);

export default function MedalsDetailScreen() {
  const router = useRouter();

  const medals = [
    { id: "1", locked: false },
    { id: "2", locked: false },
    { id: "3", locked: false },
    { id: "4", locked: true },
    { id: "5", locked: true },
    { id: "6", locked: true },
    { id: "7", locked: true },
    { id: "8", locked: true },
    { id: "9", locked: true },
  ];

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/rewards");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <View style={{ flex: 1, position: "relative" }}>
        <View className="px-6 py-4 flex-row items-center">
          <TouchableOpacity
            onPress={handleBack}
            className="w-10 h-10 bg-slate-50 rounded-full items-center justify-center border border-slate-100"
          >
            <ChevronLeft size={24} color="#1E3A8A" />
          </TouchableOpacity>
          <Text className="flex-1 text-left ml-4 text-[#1E3A8A] font-bold text-lg">Medals</Text>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 120 }}
          className="px-6"
          showsVerticalScrollIndicator={false}
        >
          {/* Spotlight Trophy Card */}
          <View className="bg-slate-200 rounded-[20px] p-8 mb-8 items-center border border-slate-300 shadow-sm">
            <Trophy size={80} color="black" strokeWidth={1} />
            <Text className="text-black font-bold text-center mt-6 px-10 text-[11px] leading-tight">
              Congratulations for your 1st trophy!
            </Text>
          </View>

          {/* Medals Grid */}
          <View className="flex-row flex-wrap justify-between items-center mb-8">
            {medals.map((item) => (
              <MedalItem key={item.id} locked={item.locked} />
            ))}
          </View>

          {/* Level Up Progress */}
          <View className="mt-4">
            <Text className="text-black font-bold text-sm mb-5">Level up your Medal</Text>
            <ProgressCard />
            <ProgressCard />
          </View>
        </ScrollView>

        {/* Share Button Overlay - Robust Positioning */}
        <View style={{ position: "absolute", bottom: 30, left: 24, right: 24, zIndex: 10 }}>
          <TouchableOpacity className="shadow-lg shadow-black/20">
            <LinearGradient
              colors={["#475569", "#334155"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                borderRadius: 12,
                height: 52,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ color: "white", fontWeight: "bold", fontSize: 13 }}>Share</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
