import React, { useState } from "react";
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeBack } from "@/hooks/useSafeBack";
import { useThemeToggle } from "@/hooks/useThemeToggle";

import { useGetPlansQuery } from "@/services/subscription-api";

function formatINR(paise: number): string {
  return `₹${(paise / 100).toFixed(0)}`;
}

export function SubscriptionPlansScreen() {
  const router = useRouter();
  const safeBack = useSafeBack();
  const insets = useSafeAreaInsets();
  const { isDark } = useThemeToggle();
  const { data: plans = [], isLoading } = useGetPlansQuery();
  const [selected, setSelected] = useState<string | null>(null);

  const visible = plans.filter((p) => p.code !== "trial_10d");
  const trialPlan = plans.find((p) => p.code === "trial_10d");

  const handleSkip = () => {
    safeBack();
  };

  const handleProceed = () => {
    router.push({
      pathname: "/subscription/checkout",
      params: { plan_id: selected },
    } as never);
  };

  return (
    <View
      style={{
        flex: 1,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
      className={isDark ? "bg-slate-900" : "bg-white"}
    >
      {/* Background gradients */}
      <LinearGradient
        colors={
          isDark ? ["rgba(34,197,94,0.15)", "transparent"] : ["rgba(34,197,94,0.1)", "transparent"]
        }
        style={{ position: "absolute", top: 0, left: 0, right: 0, height: 350 }}
      />
      <LinearGradient
        colors={
          isDark
            ? ["rgba(59,130,246,0.15)", "transparent"]
            : ["rgba(59,130,246,0.1)", "transparent"]
        }
        style={{ position: "absolute", top: 0, right: 0, width: 350, height: 350 }}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
      />

      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <View className="flex-row items-center flex-1">
          <Pressable
            onPress={() => safeBack()}
            className="w-9 h-9 items-center justify-center mr-2"
          >
            <Feather name="chevron-left" size={24} color={isDark ? "#fff" : "#0f172a"} />
          </Pressable>
          <View>
            <Text className={`font-extrabold text-xl ${isDark ? "text-white" : "text-slate-900"}`}>
              LearnPro
            </Text>
            <Text className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Become a Pro Member
            </Text>
          </View>
        </View>
        <Pressable onPress={handleSkip} className="h-9 items-center justify-center px-2">
          <Text className={`text-sm font-semibold ${isDark ? "text-slate-300" : "text-slate-500"}`}>
            Skip
          </Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 96 }}>
        <View className="px-5 mt-6 mb-6 items-center">
          <Text
            className={`text-3xl font-extrabold mb-2 text-center tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}
          >
            Choose your plan
          </Text>
          <Text className={`text-sm text-center ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Cancel anytime. No commitment.
          </Text>
        </View>

        {/* Horizontal Plans */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 10,
            flexGrow: 1,
            justifyContent: "center",
          }}
        >
          {isLoading ? (
            <ActivityIndicator color="#3b82f6" />
          ) : (
            visible.map((p) => {
              const isSel = p.id === selected;
              const monthly =
                p.duration_days >= 30
                  ? (p.price_inr / 100 / (p.duration_days / 30)).toFixed(1)
                  : null;

              // Card styling logic
              let cardBg = isDark ? "bg-slate-800" : "bg-white";
              let cardBorder = isDark ? "border-transparent" : "border-slate-200";
              let textColor = isDark ? "text-white" : "text-slate-900";
              let subtextColor = isDark ? "text-slate-400" : "text-slate-500";

              if (isSel) {
                cardBg = isDark ? "bg-white" : "bg-blue-50";
                cardBorder = "border-blue-500";
                textColor = isDark ? "text-slate-900" : "text-slate-900";
                subtextColor = isDark ? "text-slate-500" : "text-slate-500";
              }

              return (
                <Pressable
                  key={p.id}
                  onPress={() => setSelected(p.id)}
                  className={`w-36 rounded-3xl mr-4 border-2 ${cardBg} ${cardBorder} overflow-hidden`}
                >
                  <View className="p-4 flex-1">
                    <View className="flex-row justify-between items-center mb-4">
                      <Text className={`font-bold text-sm ${textColor}`}>{p.name}</Text>
                      {isSel && (
                        <View className="w-5 h-5 rounded-full bg-blue-500 items-center justify-center">
                          <Feather name="check" size={12} color="#fff" />
                        </View>
                      )}
                    </View>

                    <Text className={`text-3xl font-extrabold ${textColor}`}>
                      {formatINR(p.price_inr)}
                      <Text className="text-xl">/-</Text>
                    </Text>

                    {monthly && (
                      <Text className={`text-[11px] mt-1 ${subtextColor}`}>₹{monthly}/month</Text>
                    )}
                  </View>

                  <View
                    className={`py-2 items-center justify-center ${isSel ? "bg-blue-500" : isDark ? "bg-slate-700" : "bg-slate-100"}`}
                  >
                    <Text
                      className={`text-[10px] font-bold uppercase tracking-wider ${isSel ? "text-white" : subtextColor}`}
                    >
                      {p.savings_label ||
                        (p.is_popular
                          ? "Most Popular"
                          : p.is_best_value
                            ? "Best Value"
                            : "Standard")}
                    </Text>
                  </View>
                </Pressable>
              );
            })
          )}
        </ScrollView>

        <View className="px-5 mt-10 mb-6 items-center">
          <Text
            className={`text-xl font-bold mb-1 text-center ${isDark ? "text-white" : "text-slate-900"}`}
          >
            Get Unlimited Access to
          </Text>
          <Text
            className={`text-xl font-bold mb-2 text-center ${isDark ? "text-white" : "text-slate-900"}`}
          >
            Premium Features!
          </Text>
          <Text className="text-blue-500 font-semibold text-sm text-center">
            Become a Pro Member
          </Text>
        </View>

        {/* Benefits Section */}
        <View className="px-5 mb-8">
          <View
            className={`p-5 rounded-3xl ${isDark ? "bg-slate-800 border border-slate-700" : "bg-white border border-slate-200"}`}
            style={
              !isDark
                ? { shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 15, elevation: 3 }
                : {}
            }
          >
            <Text className={`font-bold mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>
              Why join Premium?
            </Text>
            {[
              "Unlimited access to all courses",
              "Download courses for offline learning",
              "Access to exclusive content",
              "Certificate upon completion",
              "Priority customer support",
              "Ad-free experience",
            ].map((b) => (
              <View key={b} className="flex-row items-center mb-3">
                <Feather name="check" size={16} color="#3b82f6" />
                <Text className={`text-sm ml-3 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                  {b}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {selected && (
          <View className="px-5">
            <Pressable
              onPress={handleProceed}
              className="bg-blue-500 rounded-full py-4 items-center mb-4"
            >
              <Text className="text-white font-bold text-lg">proceed to payment</Text>
            </Pressable>
          </View>
        )}

        <Text className="text-slate-400 text-[11px] text-center px-10 leading-4">
          By subscribing, you agree to our Terms of Service and Privacy Policy. Cancel anytime from
          your account settings.
        </Text>
      </ScrollView>
    </View>
  );
}
