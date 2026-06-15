import React, { useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSafeBack } from "@/hooks/useSafeBack";

import {
  useCheckoutSubscriptionMutation,
  useGetSubscriptionPlansQuery,
} from "@/services/profile-api";

export function CheckoutScreen() {
  const router = useRouter();
  const safeBack = useSafeBack();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ plan_id?: string }>();
  const { data: plans = [] } = useGetSubscriptionPlansQuery();
  const [checkout, { isLoading }] = useCheckoutSubscriptionMutation();
  const [method, setMethod] = useState<"razorpay" | "stripe" | "mock">("mock");

  const plan = useMemo(() => plans.find((p) => p.id === params.plan_id), [plans, params.plan_id]);

  const handlePay = async () => {
    if (!plan) return;
    try {
      const result = await checkout({ plan_id: plan.id, payment_method: method }).unwrap();
      Alert.alert("Subscription started", `Status: ${result.status}`, [
        { text: "OK", onPress: () => router.replace("/(tabs)") },
      ]);
    } catch {
      Alert.alert("Checkout failed", "Could not complete checkout.");
    }
  };

  if (!plan) {
    return (
      <View
        style={{
          flex: 1,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        }}
        className="flex-1 bg-white items-center justify-center"
      >
        <Text className="text-slate-500">Plan not found.</Text>
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
      className="flex-1 bg-white"
    >
      <View className="flex-row items-center justify-between px-4 py-3">
        <Pressable onPress={() => safeBack()} className="w-9 h-9 items-center justify-center">
          <Feather name="chevron-left" size={22} color="#0f172a" />
        </Pressable>
        <Text className="text-slate-900 font-extrabold text-lg">Checkout</Text>
        <Pressable onPress={() => safeBack()}>
          <Text className="text-indigo-600 text-xs font-semibold">Change Plan</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 96 }}>
        <View className="bg-slate-900 rounded-3xl p-5 mb-6">
          <Text className="text-white font-bold">{plan.name}</Text>
          <Text className="text-white text-3xl font-extrabold mt-1">
            ₹{(plan.price_inr / 100).toFixed(0)}/-
          </Text>
          {plan.benefits_json.map((b) => (
            <View key={b} className="flex-row items-center mt-2">
              <Feather name="check" size={14} color="#22c55e" />
              <Text className="text-slate-200 text-sm ml-2">{b}</Text>
            </View>
          ))}
        </View>

        <Text className="text-slate-900 font-bold mb-1">Choose how to pay</Text>
        <Text className="text-slate-500 text-xs mb-4">
          You can directly pay through any online payment method.
        </Text>

        <View className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100">
          <View className="flex-row" style={{ gap: 12 }}>
            {(["razorpay", "stripe", "mock"] as const).map((m) => (
              <Pressable
                key={m}
                onPress={() => setMethod(m)}
                className="w-12 h-12 rounded-full bg-slate-300 items-center justify-center"
                style={{ borderWidth: method === m ? 3 : 0, borderColor: "#0f172a" }}
              >
                <Text className="text-slate-700 text-xs font-bold uppercase">{m.slice(0, 3)}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable
          onPress={handlePay}
          disabled={isLoading}
          className={`rounded-full py-4 items-center ${isLoading ? "bg-slate-300" : "bg-slate-900"}`}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-bold">Pay Now</Text>
          )}
        </Pressable>

        <Text className="text-slate-400 text-xs text-center mt-4">
          By subscribing, you agree to our Terms of Service and Privacy Policy. Cancel anytime from
          your account settings.
        </Text>
      </ScrollView>
    </View>
  );
}
