import React, { useEffect, useState } from "react";
import {
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

const DEV_BYPASS = process.env.EXPO_PUBLIC_DEV_BYPASS_OTP === "1" || __DEV__;

export function VerifyEmailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = useState(params.email ?? "");
  const [code, setCode] = useState("");

  useEffect(() => {
    if (DEV_BYPASS) {
      // Auto-fill with 6 zeros in dev so testers don't burn time
      const t = setTimeout(() => setCode("000000"), 600);
      return () => clearTimeout(t);
    }
  }, []);

  const handleContinue = () => {
    // Backend OTP endpoint not yet shipped — accept any 6-digit code in dev.
    // Route to thank-you after successful email verification
    router.replace("/thank-you" as never);
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
              Enter your email id to receive a one time password
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
              className="border border-slate-200 rounded-xl px-4 py-3 text-slate-900"
            />
          </View>

          <View className="flex-row items-center my-6">
            <View className="h-px flex-1 bg-slate-200" />
            <Text className="mx-3 text-slate-400 text-xs tracking-widest">ENTER OTP</Text>
            <View className="h-px flex-1 bg-slate-200" />
          </View>

          <Text className="text-slate-500 text-sm mb-3">Enter 6-digit code</Text>
          <OtpInput length={6} value={code} onChange={setCode} />

          <View className="mt-6">
            <OtpResendTimer onResend={() => {}} />
          </View>

          <Pressable
            onPress={() => router.push({ pathname: "/verify-phone", params: { email } } as never)}
            className="mt-6 items-center"
          >
            <Text className="text-slate-900 font-bold underline">Use Mobile number Instead</Text>
          </Pressable>

          <Pressable
            onPress={handleContinue}
            disabled={code.length !== 6}
            className={`mt-8 rounded-full py-4 items-center ${code.length === 6 ? "bg-slate-700" : "bg-slate-300"}`}
          >
            <Text className="text-white font-bold text-base">Continue</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
