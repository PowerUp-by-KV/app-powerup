import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import * as WebBrowser from "expo-web-browser";
import { useSafeBack } from "@/hooks/useSafeBack";
import { useThemeToggle } from "@/hooks/useThemeToggle";
import { usePlanTier } from "@/hooks/usePlanTier";
import { useGetSubscriptionPlansQuery } from "@/services/profile-api";
import { useGetCurrentSubscriptionQuery } from "@/services/subscription-api";
import { PRIVACY_POLICY_URL } from "@/constants";

interface PlanItem {
  id: string;
  code: string;
  name: string;
  tier?: string;
  duration_days: number;
  price_inr: number;
  savings_label?: string | null;
  is_popular?: boolean;
  is_best_value?: boolean;
  benefits_json?: string[];
}

function formatINR(paise: number): string {
  return `₹${(paise / 100).toFixed(0)}`;
}

export function SubscriptionPlansScreen() {
  const router = useRouter();
  const safeBack = useSafeBack();
  const insets = useSafeAreaInsets();
  const { isDark } = useThemeToggle();
  const tier = usePlanTier();
  const { data: currentSub } = useGetCurrentSubscriptionQuery();
  const { data: rawPlans = [], isLoading } = useGetSubscriptionPlansQuery();
  const plans = rawPlans as PlanItem[];

  const activeTier = currentSub?.tier ?? tier;
  const activeSub = currentSub?.subscription;
  const [selected, setSelected] = useState<string | null>(null);

  const visible = plans.filter((p: PlanItem) => p.code !== "trial_10d");
  const upgradePlans =
    activeTier === "pro"
      ? visible.filter((p: PlanItem) => p.tier === "premium" || p.code.includes("premium"))
      : visible;

  useEffect(() => {
    if (visible.length > 0 && !selected) {
      const defaultPlan =
        activeTier === "pro"
          ? (upgradePlans[0] ?? visible[0])
          : (visible.find((p) => p.is_popular || p.is_best_value) ?? visible[0]);
      if (defaultPlan) setSelected(defaultPlan.id);
    }
  }, [activeTier, visible, upgradePlans, selected]);

  const selectedPlan = visible.find((p) => p.id === selected) ?? visible[0];
  const isSelectedPremium =
    selectedPlan?.tier === "premium" || selectedPlan?.code?.includes("premium");

  const proBenefits = [
    "Voice Pipeline AI Voice Coach",
    "Unlimited access to practice modules",
    "Resume Buddy AI analysis",
    "Progress tracking & achievements",
    "Ad-free learning experience",
  ];

  const premiumBenefits = [
    "OpenAI Realtime WebRTC AI Voice Coach",
    "Interview Buddy & Interview Playground",
    "All Pro tier benefits included",
    "AI Resume Studio & Resume Builder",
    "Priority AI processing & lowest latency",
    "Ad-free & unlimited experience",
  ];

  const benefitsToDisplay =
    selectedPlan?.benefits_json && selectedPlan.benefits_json.length > 0
      ? selectedPlan.benefits_json
      : isSelectedPremium
        ? premiumBenefits
        : proBenefits;

  const planTitleName = isSelectedPremium ? "Premium" : "Pro";

  const handleSkip = () => {
    safeBack();
  };

  const handleProceed = () => {
    if (!selected) return;
    router.push({
      pathname: "/subscription/checkout",
      params: { plan_id: selected },
    } as never);
  };

  const formattedExpiry = activeSub?.expires_at
    ? new Date(activeSub.expires_at as string | number).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <View
      style={{
        flex: 1,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
      className={isDark ? "bg-slate-900" : "bg-white"}
    >
      {/* Background gradient */}
      <LinearGradient
        colors={isDark ? ["#1d3219", "#0c1b2b"] : ["#e5f5bb", "#bce3f8"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
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
              {activeTier === "premium"
                ? "Premium Member"
                : activeTier === "pro"
                  ? "Pro Member"
                  : "Become a Pro Member"}
            </Text>
          </View>
        </View>
        <Pressable onPress={handleSkip} className="h-9 items-center justify-center px-2">
          <Text className={`text-sm font-semibold ${isDark ? "text-slate-300" : "text-slate-500"}`}>
            Done
          </Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 96 }}>
        {/* PREMIUM SUBSCRIBED VIEW */}
        {activeTier === "premium" && (
          <View className="px-5 mt-6 mb-6">
            <View className="items-center mb-6">
              <View className="bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 rounded-full mb-2">
                <Text className="text-emerald-500 font-bold text-xs tracking-wide uppercase">
                  Active Subscription
                </Text>
              </View>
              <Text
                className={`text-2xl font-extrabold text-center ${isDark ? "text-white" : "text-slate-900"}`}
              >
                You're Subscribed to Premium!
              </Text>
              {formattedExpiry && (
                <Text
                  className={`text-sm mt-1 text-center ${isDark ? "text-slate-400" : "text-slate-500"}`}
                >
                  Valid until {formattedExpiry}
                </Text>
              )}
            </View>

            {/* Unlocked Benefits Card */}
            <View
              className={`p-5 rounded-3xl mb-6 ${isDark ? "bg-slate-800/90 border border-slate-700" : "bg-white border border-slate-200"}`}
              style={
                !isDark
                  ? { shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 15, elevation: 3 }
                  : {}
              }
            >
              <Text
                className={`font-bold text-base mb-4 ${isDark ? "text-white" : "text-slate-900"}`}
              >
                Your Premium Unlocked Features:
              </Text>
              {[
                "OpenAI Realtime WebRTC AI Voice Coach",
                "Interview Buddy & Interview Playground",
                "Unlimited Access to All Learning Modules",
                "Resume Studio & AI Resume Buddy",
                "Lowest Latency & Priority AI Processing",
                "Certificate upon course completion",
                "Ad-Free & Unlimited Experience",
              ].map((benefit) => (
                <View key={benefit} className="flex-row items-center mb-3">
                  <View className="w-5 h-5 rounded-full bg-blue-500/20 items-center justify-center mr-3">
                    <Feather name="check" size={12} color="#3b82f6" />
                  </View>
                  <Text
                    className={`text-sm flex-1 ${isDark ? "text-slate-200" : "text-slate-700"}`}
                  >
                    {benefit}
                  </Text>
                </View>
              ))}
            </View>

            <Pressable
              onPress={() => router.replace("/")}
              className="bg-blue-600 rounded-full py-4 items-center mb-4 shadow-md shadow-blue-600/30"
            >
              <Text className="text-white font-bold text-base">Back to Home</Text>
            </Pressable>
          </View>
        )}

        {/* PRO SUBSCRIBED VIEW WITH PREMIUM UPGRADE OPTION */}
        {activeTier === "pro" && (
          <View className="px-5 mt-4 mb-4">
            <View className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 mb-6 flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-emerald-500/20 items-center justify-center mr-3">
                <Feather name="check-circle" size={20} color="#10b981" />
              </View>
              <View className="flex-1">
                <Text className="text-emerald-500 font-bold text-xs uppercase tracking-wider">
                  Current Plan: Pro Member
                </Text>
                <Text className={`text-xs mt-0.5 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                  You are active on the Pro plan. Upgrade to Premium for OpenAI Realtime voice
                  features!
                </Text>
              </View>
            </View>

            <View className="items-center mb-6">
              <Text
                className={`text-2xl font-extrabold text-center tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}
              >
                Upgrade to Premium
              </Text>
              <Text
                className={`text-sm text-center mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}
              >
                Unlock OpenAI Realtime WebRTC Voice & lowest latency conversations.
              </Text>
            </View>
          </View>
        )}

        {/* FREE USER VIEW */}
        {activeTier === "free" && (
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
        )}

        {/* PLAN SELECTION CARDS (For Free or Pro Upgrade) */}
        {activeTier !== "premium" && (
          <>
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
                upgradePlans.map((p: PlanItem) => {
                  const isSel = p.id === selected;
                  const monthly =
                    p.duration_days >= 30
                      ? (p.price_inr / 100 / (p.duration_days / 30)).toFixed(1)
                      : null;

                  let cardBg = isDark ? "bg-slate-800" : "bg-white";
                  let cardBorder = isDark ? "border-transparent" : "border-slate-200";
                  let textColor = isDark ? "text-white" : "text-slate-900";
                  let subtextColor = isDark ? "text-slate-400" : "text-slate-500";

                  if (isSel) {
                    cardBg = isDark ? "bg-white" : "bg-blue-50";
                    cardBorder = "border-blue-500";
                    textColor = "text-slate-900";
                    subtextColor = "text-slate-500";
                  }

                  return (
                    <Pressable
                      key={p.id}
                      onPress={() => setSelected(p.id)}
                      className={`w-40 rounded-3xl mr-4 border-2 ${cardBg} ${cardBorder} overflow-hidden`}
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
                          <Text className={`text-[11px] mt-1 ${subtextColor}`}>
                            ₹{monthly}/month
                          </Text>
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

            <View className="px-5 mt-8 mb-6 items-center">
              <Text
                className={`text-xl font-bold mb-1 text-center ${isDark ? "text-white" : "text-slate-900"}`}
              >
                Get Unlimited Access to
              </Text>
              <Text
                className={`text-xl font-bold mb-2 text-center ${isDark ? "text-white" : "text-slate-900"}`}
              >
                {planTitleName} Features!
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
                <Text
                  className={`font-bold mb-4 text-base ${isDark ? "text-white" : "text-slate-900"}`}
                >
                  Why join {planTitleName}?
                </Text>
                {benefitsToDisplay.map((b) => (
                  <View key={b} className="flex-row items-center mb-3">
                    <Feather name="check" size={16} color="#3b82f6" />
                    <Text
                      className={`text-sm ml-3 ${isDark ? "text-slate-300" : "text-slate-600"}`}
                    >
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
                  className="bg-blue-500 rounded-full py-4 items-center mb-4 shadow-md shadow-blue-500/30"
                >
                  <Text className="text-white font-bold text-lg">
                    {activeTier === "pro" ? "Upgrade to Premium" : "Proceed to Payment"}
                  </Text>
                </Pressable>
              </View>
            )}
          </>
        )}

        <Text className="text-slate-400 text-[11px] text-center px-10 leading-4">
          By subscribing, you agree to our Terms of Service and{" "}
          <Text
            className="text-blue-400 font-semibold"
            onPress={() => WebBrowser.openBrowserAsync(PRIVACY_POLICY_URL)}
          >
            Privacy Policy
          </Text>
          . Cancel anytime from your account settings.
        </Text>
      </ScrollView>
    </View>
  );
}
