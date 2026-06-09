import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

export function EmailOtpScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  const handleSendOtp = () => {
    // Logic to trigger Email OTP send
    router.push("/otp-enter");
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
              <Text className="text-base text-slate-500">Enter your email id</Text>
            </View>

            <View className="mb-8">
              <Text className="text-sm font-medium text-slate-500 mb-2 ml-1">Email ID</Text>
              <View className="bg-slate-100 rounded-xl px-4 py-4 flex-row items-center">
                <Feather name="mail" size={20} color="#94A3B8" className="mr-3" />
                <TextInput
                  placeholder="your@email.com"
                  keyboardType="email-address"
                  className="flex-1 text-base text-slate-900"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  placeholderTextColor="#94A3B8"
                />
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
              onPress={() => router.push("/otp-mobile")}
            >
              <Text className="text-slate-600 text-base font-bold">Use Mobile number Instead</Text>
            </TouchableOpacity>

            <View className="items-center">
              <Text className="text-sm text-slate-500">
                Don&apos;t have an account?{" "}
                <Text
                  className="text-slate-900 font-bold underline"
                  onPress={() => router.push("/register")}
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
