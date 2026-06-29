import React, { useEffect, useState } from "react";
import {
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
import Svg, { Path } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";

import { OtpInput } from "./components/OtpInput";
import { OtpResendTimer } from "./components/OtpResendTimer";

const DEV_BYPASS = process.env.EXPO_PUBLIC_DEV_BYPASS_OTP === "1" || __DEV__;

export function VerifyPhoneScreen({ flow: propFlow }: { flow?: "signup" | "signin" }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
    <View
      style={{
        flex: 1,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
      className="flex-1 bg-white dark:bg-[#18181b]"
    >
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

                <LinearGradient
                  colors={["#86efac", "#22d3ee", "#3b82f6"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 17,
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: 3,
                  }}
                >
                  <View style={{ transform: [{ rotate: "45deg" }] }}>
                    <Svg width={34} height={34} viewBox="0 0 48 48" fill="none">
                      <Path
                        d="M24 10 C24 17, 17 24, 10 24 C17 24, 24 31, 24 38 C24 31, 31 24, 38 24 C31 24, 24 17, 24 10 Z"
                        fill="#ffffff"
                      />
                    </Svg>
                  </View>
                </LinearGradient>
              </View>

              <Text className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-1">
                Verify Your Phone
              </Text>
              <Text className="text-xs text-slate-400 dark:text-slate-300 text-center mb-6 px-4">
                Enter your phone number to receive a one time password
              </Text>
            </View>

            {/* Phone Number Field */}
            <View className="mb-4">
              <Text className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Phone Number
              </Text>
              <View className="flex-row" style={{ gap: 10 }}>
                <View className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3.5 items-center justify-center">
                  <Text className="text-slate-900 dark:text-white font-bold text-sm">+91</Text>
                </View>
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="9999999999"
                  placeholderTextColor="#94a3b8"
                  keyboardType="phone-pad"
                  className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3.5 text-sm text-slate-900 dark:text-white"
                />
              </View>
            </View>

            {/* OR / ENTER OTP Separator */}
            <View className="flex-row items-center mb-6 mt-6">
              <View className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
              <Text className="mx-4 text-xs font-medium text-slate-400 dark:text-slate-500 tracking-widest">
                ENTER OTP
              </Text>
              <View className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
            </View>

            <Text className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-3">
              Enter 6-digit code
            </Text>
            <OtpInput length={6} value={code} onChange={setCode} />

            <View className="mt-6 mb-2">
              <OtpResendTimer onResend={() => {}} />
            </View>

            {/* Back / Use Email Instead Button */}
            <Pressable onPress={() => router.push("/verify-email")} className="mt-4 items-center">
              <Text className="text-xs font-bold text-slate-800 dark:text-white underline">
                Use Email Instead
              </Text>
            </Pressable>

            {/* Continue Button */}
            <Pressable
              onPress={handleContinue}
              disabled={code.length !== 6}
              className={`w-full py-4 rounded-2xl items-center justify-center mt-8 ${
                code.length === 6 ? "bg-[#3b82f6]" : "bg-slate-300"
              }`}
            >
              <Text className="text-white font-bold text-sm">Continue</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
