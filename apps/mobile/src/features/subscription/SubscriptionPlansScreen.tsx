import React, { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSafeBack } from "@/hooks/useSafeBack";

import { useGetSubscriptionPlansQuery } from "@/services/profile-api";

function formatINR(paise: number): string {
  return `₹${(paise / 100).toFixed(0)}`;
}

export function SubscriptionPlansScreen() {
  const router = useRouter();
  const safeBack = useSafeBack();
  const insets = useSafeAreaInsets();
  const { data: plans = [], isLoading } = useGetSubscriptionPlansQuery();
  const [selected, setSelected] = useState<string | null>(null);

  const visible = plans.filter((p) => p.code !== "trial_10d");

  return (
    <View
      style={{
        flex: 1,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingBottom: insets.bottom,
      }}
      className="flex-1 bg-white"
    >
      <View className="flex-row items-center justify-between px-4 py-3">
        <Pressable onPress={() => safeBack()} className="w-9 h-9 items-center justify-center">
          <Feather name="chevron-left" size={22} color="#0f172a" />
        </Pressable>
        <Text className="text-slate-900 font-extrabold text-lg">LearnPro</Text>
        <Pressable onPress={() => safeBack()} className="w-9 h-9 items-center justify-center">
          <Text className="text-slate-500 text-xs font-semibold">Skip</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 96 }}>
        <View className="mb-6">
          <Text className="text-slate-900 font-bold mb-3">Why join Premium?</Text>
          {[
            "Unlimited access to all courses",
            "Download courses for offline learning",
            "Access to exclusive content",
            "Certificate upon completion",
            "Priority customer support",
            "Ad-free experience",
          ].map((b) => (
            <View key={b} className="flex-row items-center mb-1.5">
              <Feather name="check" size={14} color="#22c55e" />
              <Text className="text-slate-700 text-sm ml-2">{b}</Text>
            </View>
          ))}
        </View>

        <Text className="text-slate-900 font-bold mb-1">Choose your plan</Text>
        <Text className="text-slate-500 text-xs mb-4">Cancel anytime. No commitment.</Text>

        {isLoading ? (
          <ActivityIndicator color="#6366f1" />
        ) : (
          visible.map((p) => {
            const isSel = p.id === selected;
            const monthly =
              p.duration_days >= 30
                ? (p.price_inr / 100 / (p.duration_days / 30)).toFixed(1)
                : null;
            return (
              <Pressable
                key={p.id}
                onPress={() => setSelected(p.id)}
                className={`rounded-2xl p-4 mb-3 ${isSel ? "bg-slate-900" : "bg-slate-50 border border-slate-100"}`}
              >
                <View className="flex-row justify-between items-start">
                  <View>
                    <Text className={`font-bold ${isSel ? "text-white" : "text-slate-900"}`}>
                      {p.name}
                    </Text>
                    <Text
                      className={`text-2xl font-extrabold mt-1 ${isSel ? "text-white" : "text-slate-900"}`}
                    >
                      {formatINR(p.price_inr)}/-
                    </Text>
                    {monthly && (
                      <Text
                        className={`text-xs mt-1 ${isSel ? "text-slate-300" : "text-slate-500"}`}
                      >
                        ₹{monthly}/month
                      </Text>
                    )}
                  </View>
                  <View className="items-end">
                    {p.is_popular && (
                      <View className="bg-amber-500 px-2 py-0.5 rounded-full mb-2">
                        <Text className="text-white text-[10px] font-bold">MOST POPULAR</Text>
                      </View>
                    )}
                    {p.is_best_value && (
                      <View className="bg-emerald-500 px-2 py-0.5 rounded-full mb-2">
                        <Text className="text-white text-[10px] font-bold">BEST VALUE</Text>
                      </View>
                    )}
                    {p.savings_label && (
                      <View className="bg-white/20 px-2 py-0.5 rounded-full">
                        <Text
                          className={`text-[10px] font-bold ${isSel ? "text-white" : "text-slate-700"}`}
                        >
                          {p.savings_label}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </Pressable>
            );
          })
        )}

        {selected && (
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/subscription/checkout",
                params: { plan_id: selected },
              } as never)
            }
            className="bg-slate-900 rounded-full py-4 items-center mt-4"
          >
            <Text className="text-white font-bold">Proceed to payment</Text>
          </Pressable>
        )}

        <Text className="text-slate-400 text-xs text-center mt-4">
          By subscribing, you agree to our Terms of Service and Privacy Policy. Cancel anytime from
          your account settings.
        </Text>
      </ScrollView>
    </View>
  );
}
