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

export function VerifyPhoneScreen({ flow: propFlow }: { flow?: "signup" | "signin" }) {
  const router = useRouter();
  const params = useLocalSearchParams<{ phone?: string; flow?: "signup" | "signin" }>();
  const flow = propFlow ?? params.flow ?? "signup";
  const [phone, setPhone] = useState(params.phone ?? "");
  const [code, setCode] = useState("");

  useEffect(() => {
    if (DEV_BYPASS) {
      const t = setTimeout(() => setCode("000000"), 600);
      return () => clearTimeout(t);
    }
  }, []);

  const handleContinue = () => {
    if (flow === "signup") router.replace("/thank-you" as never);
    else router.replace("/welcome-back" as never);
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
            <Text className="text-3xl font-extrabold text-slate-900 mb-2">Verify Your Phone</Text>
            <Text className="text-slate-500 text-center">
              Enter your phone number to receive a one time password
            </Text>
          </View>

          <View className="mb-6">
            <Text className="text-slate-500 text-sm mb-1.5">Phone Number</Text>
            <View className="flex-row" style={{ gap: 10 }}>
              <View className="bg-slate-100 rounded-xl px-3 py-3 items-center justify-center">
                <Text className="text-slate-900 font-semibold">+91</Text>
              </View>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="9999999999"
                placeholderTextColor="#94a3b8"
                keyboardType="phone-pad"
                className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-slate-900"
              />
            </View>
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

          <Pressable onPress={() => router.back()} className="mt-6 items-center">
            <Text className="text-slate-900 font-bold underline">Use Email Instead</Text>
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
