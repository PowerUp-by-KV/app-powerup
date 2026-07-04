import React, { useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeBack } from "@/hooks/useSafeBack";
import { useThemeToggle } from "@/hooks/useThemeToggle";

import {
  useCheckoutMutation,
  useGetPlansQuery,
  useSimulatePaymentWebhookMutation,
} from "@/services/subscription-api";
import RazorpayCheckout from "react-native-razorpay";

function formatINR(paise: number): string {
  return `₹${(paise / 100).toFixed(0)}`;
}

export function CheckoutScreen() {
  const router = useRouter();
  const safeBack = useSafeBack();
  const insets = useSafeAreaInsets();
  const { isDark } = useThemeToggle();
  const params = useLocalSearchParams<{ plan_id?: string }>();
  const { data: plans = [] } = useGetPlansQuery();
  const [checkout, { isLoading: isCheckingOut }] = useCheckoutMutation();
  const [simulateWebhook, { isLoading: isSimulating }] = useSimulatePaymentWebhookMutation();

  // Default to mock for smooth testing
  const [method, setMethod] = useState<"razorpay" | "stripe" | "mock">("mock");

  const plan = useMemo(() => plans.find((p) => p.id === params.plan_id), [plans, params.plan_id]);

  const isLoading = isCheckingOut || isSimulating;

  const handlePay = async () => {
    if (!plan) return;
    try {
      // 1. Initiate checkout
      const result = await checkout({ plan_id: plan.id, payment_method: method }).unwrap();

      if (method === "razorpay") {
        try {
          const data = await RazorpayCheckout.open({
            description: `Subscription to ${plan.name}`,
            image: "https://i.imgur.com/3g7nmJC.png", // Demo image
            currency: "INR",
            key: "rzp_test_T7WGVsxWMorhh6",
            amount: plan.price_inr.toString(),
            name: "PowerUp App",
            subscription_id: result.subscription_id,
            theme: { color: "#3b82f6" },
          });

          Alert.alert(
            "Payment Successful",
            `Your subscription is now active! Payment ID: ${data.razorpay_payment_id}`,
            [{ text: "OK", onPress: () => router.replace("/(tabs)") }],
          );
        } catch (error: any) {
          Alert.alert(
            "Payment Failed",
            error?.description || "Razorpay checkout was cancelled or failed.",
          );
        }
        return;
      }

      // 2. Handle actual payment URLs (for Stripe)
      if (result.payment_url) {
        import("expo-linking").then((Linking) => {
          Linking.openURL(result.payment_url!);
        });
        // We do not show the success alert yet because the user needs to complete the payment in the browser
        return;
      }

      // 3. Simulate payment completion via webhook (only if pending AND method is mock)
      if (result.subscription_id && result.status === "pending" && method === "mock") {
        try {
          await simulateWebhook({
            provider_ref: `mock_${result.subscription_id}`,
            status: "active",
          }).unwrap();
        } catch (webhookErr) {
          console.error(
            `Webhook 404 Error: The backend could not find a subscription with provider_ref = mock_${result.subscription_id}`,
          );
          throw webhookErr;
        }
      }

      Alert.alert("Payment Successful", `Your subscription is now active!`, [
        { text: "OK", onPress: () => router.replace("/(tabs)") },
      ]);
    } catch (err) {
      console.error(err);
      Alert.alert("Checkout failed", "Could not complete checkout and payment.");
    }
  };

  if (!plan) {
    return (
      <View
        style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom }}
        className={`flex-1 items-center justify-center ${isDark ? "bg-slate-900" : "bg-white"}`}
      >
        <Text className={isDark ? "text-slate-400" : "text-slate-500"}>Plan not found.</Text>
      </View>
    );
  }

  const monthly =
    plan.duration_days >= 30 ? (plan.price_inr / 100 / (plan.duration_days / 30)).toFixed(1) : null;

  return (
    <View
      style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom }}
      className={isDark ? "bg-slate-900" : "bg-white"}
    >
      {/* Background gradient */}
      <LinearGradient
        colors={isDark ? ["#1d3219", "#0c1b2b"] : ["#e5f5bb", "#bce3f8"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <View className="flex-row items-center justify-between px-4 py-3">
        <Pressable onPress={() => safeBack()} className="w-9 h-9 items-center justify-center">
          <Feather name="chevron-left" size={24} color={isDark ? "#fff" : "#0f172a"} />
        </Pressable>
        <Text className={`font-extrabold text-lg ${isDark ? "text-white" : "text-slate-900"}`}>
          Checkout
        </Text>
        <Pressable onPress={() => safeBack()}>
          <Text className="text-blue-500 text-xs font-semibold">Change Plan</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 96 }}>
        {/* Plan Summary Box */}
        <View
          className={`rounded-3xl p-5 mb-8 border ${isDark ? "bg-slate-800 border-slate-700" : "bg-blue-50 border-blue-100"}`}
        >
          <View className="flex-row justify-between items-start mb-4">
            <View>
              <Text className="text-blue-500 font-bold mb-1">{plan.name}</Text>
              <Text
                className={`text-3xl font-extrabold ${isDark ? "text-white" : "text-slate-900"}`}
              >
                {formatINR(plan.price_inr)}/-
              </Text>
              {monthly && (
                <Text className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  ₹{monthly}/month
                </Text>
              )}
            </View>
            <View className="w-6 h-6 rounded-full bg-teal-400 items-center justify-center">
              <Feather name="check" size={14} color="#fff" />
            </View>
          </View>

          <View className="mt-2">
            {[
              "Unlimited access to all courses",
              "Download courses for offline learning",
              "Access to exclusive content",
              "Certificate upon completion",
            ].map((b) => (
              <View key={b} className="flex-row items-center mt-2.5">
                <Feather name="check" size={14} color="#3b82f6" />
                <Text className={`text-sm ml-3 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                  {b}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <Text className={`font-bold mb-1 ${isDark ? "text-white" : "text-slate-900"}`}>
          Choose how to pay
        </Text>
        <Text className={`text-xs mb-6 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          You can directly pay through any online payment method.
        </Text>

        {/* Vertical Payment Methods */}
        <View className="mb-8">
          {[
            { id: "razorpay" as const, name: "Razorpay (UPI, Cards)", icon: "smartphone" as const },
            { id: "stripe" as const, name: "Stripe (International)", icon: "credit-card" as const },
            { id: "mock" as const, name: "Test Payment (Mock)", icon: "code" as const },
          ].map((m) => {
            const isSel = method === m.id;
            return (
              <Pressable
                key={m.id}
                onPress={() => setMethod(m.id)}
                className={`flex-row items-center justify-between p-4 mb-3 rounded-2xl border ${
                  isSel
                    ? isDark
                      ? "bg-slate-700 border-slate-500"
                      : "bg-white border-blue-500 shadow-sm"
                    : isDark
                      ? "bg-slate-800 border-slate-700"
                      : "bg-slate-50 border-transparent"
                }`}
              >
                <View className="flex-row items-center">
                  <View className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center mr-3">
                    <Feather name={m.icon} size={16} color="#333" />
                  </View>
                  <Text
                    className={`font-semibold text-sm ${isDark ? "text-white" : "text-slate-900"}`}
                  >
                    {m.name}
                  </Text>
                </View>
                <Feather name="chevron-right" size={18} color={isDark ? "#94a3b8" : "#cbd5e1"} />
              </Pressable>
            );
          })}
        </View>

        <Pressable
          onPress={handlePay}
          disabled={isLoading}
          className={`rounded-full py-4 items-center ${isLoading ? "bg-slate-300" : "bg-blue-600"}`}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-bold text-lg">Pay Now</Text>
          )}
        </Pressable>

        <Text className="text-slate-400 text-[11px] text-center mt-6 px-4 leading-4">
          By subscribing, you agree to our Terms of Service and Privacy Policy. Cancel anytime from
          your account settings.
        </Text>
      </ScrollView>
    </View>
  );
}
