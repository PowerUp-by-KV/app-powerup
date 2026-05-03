import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter, type Href } from "expo-router";

export function OtpVerifyScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState("");

  const handleSendOtp = () => {
    // in real app, trigger OTP send here
    router.push("/otp-enter" as Href);
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ alignItems: "center", paddingBottom: 50 }}
          style={{ flex: 1 }}
          className="px-6"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="w-full max-w-sm py-8">
            <View className="items-center mb-10">
              <View className="w-20 h-20 rounded-2xl bg-slate-500 mb-8 shadow-sm" />
              <Text className="text-3xl font-extrabold text-slate-900 mb-2">Login with OTP</Text>
              <Text className="text-base text-slate-500">Enter your phone number</Text>
            </View>

            <View className="mb-8">
              <Text className="text-sm font-medium text-slate-500 mb-2 ml-1">Phone Number</Text>
              <View className="flex-row gap-3">
                <View className="bg-slate-100 rounded-xl px-4 py-4 justify-center">
                  <Text className="text-slate-600 font-medium">+91</Text>
                </View>
                <View className="flex-1 bg-slate-100 rounded-xl px-4 py-4">
                  <TextInput
                    placeholder="000 000-0000"
                    keyboardType="phone-pad"
                    className="text-base text-slate-900"
                    value={phone}
                    onChangeText={setPhone}
                    placeholderTextColor="#94A3B8"
                  />
                </View>
              </View>
            </View>

            <TouchableOpacity
              className="bg-slate-600 rounded-xl py-4 items-center mb-6 shadow-sm active:opacity-90"
              onPress={handleSendOtp}
            >
              <Text className="text-white text-base font-bold">Send OTP</Text>
            </TouchableOpacity>

            <View className="flex-row items-center mb-6">
              <View className="flex-1 h-[1px] bg-slate-200" />
              <Text className="mx-4 text-xs font-bold text-slate-400 uppercase">OR</Text>
              <View className="flex-1 h-[1px] bg-slate-200" />
            </View>

            <TouchableOpacity
              className="border border-slate-300 rounded-xl py-4 items-center mb-8 active:bg-slate-50"
              onPress={() => router.replace("/login" as Href)}
            >
              <Text className="text-slate-600 text-base font-bold">Back to Email Login</Text>
            </TouchableOpacity>

            <View className="items-center">
              <Text className="text-sm text-slate-500">
                Don&apos;t have an account?{" "}
                <Text
                  className="text-slate-900 font-bold underline"
                  onPress={() => router.push("/register" as Href)}
                >
                  Sign up
                </Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
