import React, { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeBack } from "@/hooks/useSafeBack";
import { useThemeToggle } from "@/hooks/useThemeToggle";
import { getApiErrorMessage } from "@/utils/error-message";

import {
  useCheckoutMutation,
  useGetPlansQuery,
  useVerifyPaymentMutation,
} from "@/services/subscription-api";

import {
  openRazorpayCheckout,
  RazorpayCancelledError,
  type RazorpaySuccess,
} from "./razorpay-checkout";

function formatINR(paise: number): string {
  return `₹${(paise / 100).toFixed(0)}`;
}

async function retry<T>(attempts: number, fn: () => Promise<T>): Promise<T> {
  for (let i = 1; ; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i >= attempts) throw err;
      await new Promise((resolve) => setTimeout(resolve, 500 * i));
    }
  }
}

export function CheckoutScreen() {
  const router = useRouter();
  const safeBack = useSafeBack();
  const insets = useSafeAreaInsets();
  const { isDark } = useThemeToggle();
  const params = useLocalSearchParams<{ plan_id?: string }>();
  const { data: plans = [] } = useGetPlansQuery();
  const [checkout, { isLoading: isCheckingOut }] = useCheckoutMutation();
  const [verifyPayment, { isLoading: isVerifying }] = useVerifyPaymentMutation();

  const [error, setError] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);

  const plan = useMemo(() => plans.find((p) => p.id === params.plan_id), [plans, params.plan_id]);

  const isLoading = isCheckingOut || isVerifying || isPaying;

  const handlePay = async () => {
    if (!plan) return;
    setError(null);

    // Set the moment Razorpay confirms the charge. Past this point the user's money is
    // gone, so a later failure must never tell them to "try again" — that invites a
    // double charge.
    let charged: RazorpaySuccess | null = null;

    try {
      const order = await checkout({ plan_id: plan.id, payment_method: "razorpay" }).unwrap();

      if (!order.order_id || !order.razorpay_key_id) {
        setError("Payments aren't available right now. Please try again later.");
        return;
      }

      setIsPaying(true);
      charged = await openRazorpayCheckout({
        keyId: order.razorpay_key_id,
        orderId: order.order_id,
        amount: order.amount ?? plan.price_inr,
        currency: order.currency ?? "INR",
        planName: plan.name,
      });
      setIsPaying(false);

      // Only the server may activate a subscription — a client-side "success" callback
      // proves nothing until the signature is verified against the key secret. Verification
      // is idempotent, so a transient failure is worth retrying before we give up.
      await retry(3, () =>
        verifyPayment({
          razorpay_order_id: charged!.razorpay_order_id,
          razorpay_payment_id: charged!.razorpay_payment_id,
          razorpay_signature: charged!.razorpay_signature,
        }).unwrap(),
      );

      router.replace("/(tabs)");
    } catch (err) {
      setIsPaying(false);

      if (err instanceof RazorpayCancelledError) {
        setError("Payment cancelled. You have not been charged.");
        return;
      }

      if (charged) {
        // Charged, but we couldn't confirm it. Razorpay's webhook is the backstop and will
        // still activate the subscription, so the one thing we must not do is invite a retry.
        setError(
          `Your payment went through, but we couldn't confirm it just yet. Do not pay again — ` +
            `your subscription will activate shortly. If it doesn't, contact support with ` +
            `payment ID ${charged.razorpay_payment_id}.`,
        );
        return;
      }

      setError(getApiErrorMessage(err, "We couldn't complete your payment. Please try again."));
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
            {(plan.benefits_json ?? []).map((b) => (
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

        {/* Razorpay is the only provider with a backend integration. */}
        <View className="mb-8">
          <View
            className={`flex-row items-center justify-between p-4 rounded-2xl border ${
              isDark ? "bg-slate-700 border-slate-500" : "bg-white border-blue-500 shadow-sm"
            }`}
          >
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center mr-3">
                <Feather name="smartphone" size={16} color="#333" />
              </View>
              <Text className={`font-semibold text-sm ${isDark ? "text-white" : "text-slate-900"}`}>
                Razorpay (UPI, Cards, Netbanking)
              </Text>
            </View>
            <Feather name="check-circle" size={18} color="#3b82f6" />
          </View>
        </View>

        {error && (
          <View className="flex-row items-start p-4 mb-4 rounded-2xl bg-red-50 border border-red-200">
            <Feather name="alert-circle" size={16} color="#dc2626" />
            <Text className="text-red-700 text-sm ml-3 flex-1">{error}</Text>
          </View>
        )}

        <Pressable
          onPress={handlePay}
          disabled={isLoading}
          className={`rounded-full py-4 items-center ${isLoading ? "bg-slate-300" : "bg-blue-600"}`}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-bold text-lg">Pay {formatINR(plan.price_inr)}</Text>
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
