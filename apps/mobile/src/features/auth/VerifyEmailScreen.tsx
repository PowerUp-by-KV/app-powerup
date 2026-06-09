/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import Svg, { Circle, Path, Defs, LinearGradient, Stop } from "react-native-svg";
import { Feather } from "@expo/vector-icons";

import { OtpInput } from "./components/OtpInput";
import { OtpResendTimer } from "./components/OtpResendTimer";
import { useSendEmailOtpMutation, useVerifyEmailOtpMutation } from "../../services/auth-api";
import { onboardingApi } from "../../services/onboarding-api";
import { getAuthSession } from "../../services/auth-storage";

export function VerifyEmailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ email?: string; next?: string }>();
  const [email, setEmail] = useState(params.email ?? "");
  const [code, setCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const [sendOtp, { isLoading: isSending }] = useSendEmailOtpMutation();
  const [verifyOtp, { isLoading: isVerifying }] = useVerifyEmailOtpMutation();
  const [getOnboardingStatus] = onboardingApi.useLazyGetOnboardingStatusQuery();

  // Auto-send the OTP when arriving with an email pre-filled (post-signup flow).
  useEffect(() => {
    if (params.email && !otpSent) {
      void handleSendOtp(params.email);
    }
  }, [params.email]);

  const handleSendOtp = async (target?: string) => {
    const addr = (target ?? email).trim();
    if (!addr) {
      Alert.alert("Enter your email", "Please type your email address first.");
      return;
    }
    try {
      await sendOtp({ email: addr }).unwrap();
      setOtpSent(true);
    } catch (err) {
      const data = (err as { data?: { detail?: string } })?.data;
      Alert.alert("Couldn't send code", data?.detail ?? "Please try again in a moment.");
    }
  };

  const handleContinue = async () => {
    if (code.length !== 6) return;
    try {
      await verifyOtp({ email: email.trim(), code }).unwrap();
      const session = await getAuthSession();
      const userId = session?.user?.id;
      if (userId) {
        try {
          const status = await getOnboardingStatus(userId).unwrap();
          if (status?.answers_present) {
            const next = params.next ?? "/(tabs)/my-learning";
            router.replace(next as never);
          } else {
            router.replace("/onboarding" as never);
          }
        } catch (err) {
          console.warn("Failed to check onboarding status, defaulting to /onboarding:", err);
          router.replace("/onboarding" as never);
        }
      } else {
        router.replace("/onboarding" as never);
      }
    } catch (err) {
      const data = (err as { data?: { detail?: string } })?.data;
      Alert.alert("Invalid code", data?.detail ?? "That code didn't match. Try again.");
      setCode("");
    }
  };

  return (
    <View style={{ flex: 1, paddingTop: insets.top }} className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            flexGrow: 1,
            padding: 24,
            paddingTop: Platform.OS === "android" ? 60 : 40,
            paddingBottom: 60,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="w-full max-w-sm self-center py-4">
            {/* Top Logo Icon */}
            <View className="items-center mb-6">
              {/* Lumino Logo Header */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 38,
                    fontWeight: "900",
                    color: "#3b82f6",
                    letterSpacing: -1.5,
                    marginRight: 1,
                  }}
                >
                  lumin
                </Text>

                <View
                  style={{
                    width: 38,
                    height: 38,
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: 3,
                  }}
                >
                  <Svg width={34} height={34} viewBox="0 0 48 48" fill="none">
                    <Defs>
                      <LinearGradient id="gradientOEmailForm" x1="0%" y1="0%" x2="100%" y2="100%">
                        <Stop offset="0%" stopColor="#86efac" />
                        <Stop offset="50%" stopColor="#22d3ee" />
                        <Stop offset="100%" stopColor="#3b82f6" />
                      </LinearGradient>
                    </Defs>
                    <Circle cx="24" cy="24" r="22" fill="url(#gradientOEmailForm)" />
                  </Svg>

                  <View style={{ position: "absolute", transform: [{ rotate: "45deg" }] }}>
                    <Svg width={34} height={34} viewBox="0 0 48 48" fill="none">
                      <Path
                        d="M24 10 C24 17, 17 24, 10 24 C17 24, 24 31, 24 38 C24 31, 31 24, 38 24 C31 24, 24 17, 24 10 Z"
                        fill="#ffffff"
                      />
                    </Svg>
                  </View>
                </View>
              </View>

              <Text className="text-2xl font-bold text-slate-900 text-center mb-1">
                Verify Your Email
              </Text>
              <Text className="text-xs text-slate-400 text-center mb-6 px-4">
                {otpSent
                  ? `We sent a 6-digit code to ${email}`
                  : "Enter your email id to receive a one time password"}
              </Text>
            </View>

            {/* Email Field */}
            <View className="mb-4">
              <Text className="text-xs font-bold text-slate-700 mb-1.5">Email ID</Text>
              <View className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 flex-row items-center">
                <Feather name="mail" size={16} color="#94A3B8" style={{ marginRight: 8 }} />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="your@email.com"
                  placeholderTextColor="#94a3b8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!otpSent}
                  className="flex-1 text-sm text-slate-900"
                />
              </View>
            </View>

            {!otpSent ? (
              <Pressable
                onPress={() => handleSendOtp()}
                disabled={isSending || !email.trim()}
                className={`w-full py-4 rounded-2xl items-center justify-center shadow-lg mb-6 ${
                  isSending || !email.trim()
                    ? "bg-slate-300 shadow-slate-100"
                    : "bg-[#3b82f6] shadow-blue-200"
                }`}
              >
                {isSending ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text className="text-white font-bold text-sm">Send code</Text>
                )}
              </Pressable>
            ) : (
              <>
                {/* OR / ENTER OTP Separator */}
                <View className="flex-row items-center mb-6 mt-6">
                  <View className="h-px flex-1 bg-slate-200" />
                  <Text className="mx-4 text-xs font-medium text-slate-400 tracking-widest">
                    ENTER OTP
                  </Text>
                  <View className="h-px flex-1 bg-slate-200" />
                </View>

                <Text className="text-xs font-bold text-slate-700 mb-3">Enter 6-digit code</Text>
                <OtpInput length={6} value={code} onChange={setCode} />

                <View className="mt-6 mb-2">
                  <OtpResendTimer onResend={() => handleSendOtp()} />
                </View>

                {/* Back / Use Phone Instead Button */}
                <Pressable
                  onPress={() => router.push("/verify-phone")}
                  className="mt-4 items-center"
                >
                  <Text className="text-xs font-bold text-slate-800 underline">
                    Use Mobile number Instead
                  </Text>
                </Pressable>

                {/* Confirm / Verify Action Button */}
                <Pressable
                  onPress={handleContinue}
                  disabled={code.length !== 6 || isVerifying}
                  className={`w-full py-4 rounded-2xl items-center justify-center shadow-lg mt-8 ${
                    code.length === 6 && !isVerifying
                      ? "bg-[#3b82f6] shadow-blue-200"
                      : "bg-slate-300 shadow-slate-100"
                  }`}
                >
                  {isVerifying ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text className="text-white font-bold text-sm">Continue</Text>
                  )}
                </Pressable>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
