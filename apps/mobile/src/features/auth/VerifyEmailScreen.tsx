import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { OtpInput } from "./components/OtpInput";
import { OtpResendTimer } from "./components/OtpResendTimer";
import {
  useSendEmailOtpMutation,
  useVerifyEmailOtpMutation,
} from "../../services/auth-api";

export function VerifyEmailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string; next?: string }>();
  const [email, setEmail] = useState(params.email ?? "");
  const [code, setCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const [sendOtp, { isLoading: isSending }] = useSendEmailOtpMutation();
  const [verifyOtp, { isLoading: isVerifying }] = useVerifyEmailOtpMutation();

  // Auto-send the OTP when arriving with an email pre-filled (post-signup flow).
  useEffect(() => {
    if (params.email && !otpSent) {
      void handleSendOtp(params.email);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      const next = params.next ?? "/(tabs)";
      router.replace(next as never);
    } catch (err) {
      const data = (err as { data?: { detail?: string } })?.data;
      Alert.alert("Invalid code", data?.detail ?? "That code didn't match. Try again.");
      setCode("");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
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
          <View className="items-center mb-8">
            <View className="w-16 h-16 rounded-2xl bg-slate-200 mb-6" />
            <Text className="text-3xl font-extrabold text-slate-900 mb-2">Verify Your Email</Text>
            <Text className="text-slate-500 text-center">
              {otpSent
                ? `We sent a 6-digit code to ${email}`
                : "Enter your email id to receive a one time password"}
            </Text>
          </View>

          <View className="mb-6">
            <Text className="text-slate-500 text-sm mb-1.5">Email ID</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="your@email.com"
              placeholderTextColor="#94a3b8"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!otpSent}
              className="border border-slate-200 rounded-xl px-4 py-3 text-slate-900"
            />
          </View>

          {!otpSent ? (
            <Pressable
              onPress={() => handleSendOtp()}
              disabled={isSending || !email.trim()}
              className={`rounded-full py-4 items-center ${
                isSending || !email.trim() ? "bg-slate-300" : "bg-slate-700"
              }`}
            >
              {isSending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-bold text-base">Send code</Text>
              )}
            </Pressable>
          ) : (
            <>
              <View className="flex-row items-center my-6">
                <View className="h-px flex-1 bg-slate-200" />
                <Text className="mx-3 text-slate-400 text-xs tracking-widest">ENTER OTP</Text>
                <View className="h-px flex-1 bg-slate-200" />
              </View>

              <Text className="text-slate-500 text-sm mb-3">Enter 6-digit code</Text>
              <OtpInput length={6} value={code} onChange={setCode} />

              <View className="mt-6">
                <OtpResendTimer onResend={() => handleSendOtp()} />
              </View>

              <Pressable
                onPress={handleContinue}
                disabled={code.length !== 6 || isVerifying}
                className={`mt-8 rounded-full py-4 items-center ${
                  code.length === 6 && !isVerifying ? "bg-slate-700" : "bg-slate-300"
                }`}
              >
                {isVerifying ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-bold text-base">Verify</Text>
                )}
              </Pressable>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
