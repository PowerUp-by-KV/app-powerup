import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Check, Star, Zap, Shield, Headphones, Brain, ArrowLeft } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { GradientButton } from "./components/GradientButton";

export const SubscriptionScreen = () => {
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "annual">("annual");
  const features = [
    { text: "Unlimited lessons and practices", icon: <Zap size={20} color="#F59E0B" /> },
    { text: "Personalized AI coaching", icon: <Star size={20} color="#6366F1" /> },
    { text: "Advanced behaviour insights", icon: <Brain size={20} color="#10B981" /> },
    { text: "Full listening library", icon: <Headphones size={20} color="#3B82F6" /> },
    { text: "Ad-free experience", icon: <Shield size={20} color="#22C55E" /> },
  ];

  return (
    <View style={{ flex: 1, height: "100%" }} className="flex-1 bg-[#F8F9FA]">
      <ScrollView
        style={{ flex: 1 }}
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 0, paddingBottom: 20, flexGrow: 1 }}
      >
        <LinearGradient
          colors={["#FFAD60", "#FF8C42", "#F59E0B"]}
          className="h-[300px] justify-center items-center rounded-b-[30px] pt-10"
        >
          <TouchableOpacity
            className="absolute top-[50px] left-5 w-10 h-10 rounded-full bg-white/20 justify-center items-center"
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#FFF" />
          </TouchableOpacity>
          <Star size={60} color="#FFF" fill="#FFF" />
          <Text className="text-[28px] text-white font-bold mt-[15px]">Unlock Linguist Pro</Text>
          <Text className="text-base text-white opacity-90 font-medium">
            Master English with AI-powered tools
          </Text>
        </LinearGradient>

        <View className="p-5">
          <Text className="text-xl text-black mb-5 font-bold">What&apos;s included</Text>
          {features.map((feature, index) => (
            <View key={index} className="flex-row items-center mb-[15px]">
              <View className="w-10 h-10 rounded-lg bg-white justify-center items-center mr-[15px] shadow-sm shadow-black/5 elevation-2">
                {feature.icon}
              </View>
              <Text className="text-base text-[#475569] font-medium">{feature.text}</Text>
            </View>
          ))}
        </View>

        <View className="px-5 mb-5">
          <TouchableOpacity
            onPress={() => setSelectedPlan("monthly")}
            className={`flex-row justify-between items-center bg-white p-5 rounded-[20px] mb-[15px] border-2 ${selectedPlan === "monthly" ? "border-[#FF8C42] bg-[#FF8C42]/5" : "border-[#E2E8F0]"}`}
          >
            <View>
              <Text className="text-lg text-black font-bold">Monthly Plan</Text>
              <Text className="text-sm text-[#64748B] font-semibold">$9.99/month</Text>
            </View>
            {selectedPlan === "monthly" && (
              <View className="w-6 h-6 rounded-full bg-[#FF8C42] justify-center items-center">
                <Check size={16} color="#FFF" />
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSelectedPlan("annual")}
            className={`flex-row justify-between items-center p-5 rounded-[20px] mb-[15px] border-2 ${selectedPlan === "annual" ? "border-[#F59E0B] bg-[#F59E0B]/5" : "border-[#E2E8F0] bg-white"}`}
          >
            <View>
              <View className="bg-[#F59E0B] px-2.5 py-1 rounded-lg self-start mb-1.25">
                <Text className="text-white text-[10px] font-bold">BEST VALUE</Text>
              </View>
              <Text className="text-lg text-black font-bold">Annual Plan</Text>
              <Text className="text-sm text-[#64748B] font-semibold">$79.99/year</Text>
            </View>
            {selectedPlan === "annual" && (
              <View className="w-6 h-6 rounded-full bg-[#F59E0B] justify-center items-center">
                <Check size={16} color="#FFF" />
              </View>
            )}
          </TouchableOpacity>
        </View>

        <GradientButton
          title="Subscribe Now"
          colors={["#FFAD60", "#FF8C42"]}
          className="mx-5 mt-2.5"
          onPress={() => console.log("Subscribe")}
        />

        <Text className="text-center text-[#64748B] text-[12px] mt-[15px] font-normal">
          Cancel anytime. Terms & Privacy apply.
        </Text>
      </ScrollView>
    </View>
  );
};

// export default SubscriptionScreen;
