import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

export function OtpEnterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [otp, setOtp] = useState("");

  const handleVerify = () => {
    // in real app, verify OTP here
    router.replace("/success?mode=login");
  };

  return (
    <View style={{ flex: 1, paddingTop: insets.top }} className="bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ alignItems: "center", paddingBottom: 50 }}
          className="px-6"
          keyboardShouldPersistTaps="handled"
        >
          <View className="w-full max-w-sm py-8">
            <View className="items-center mb-8">
              <View className="w-16 h-16 rounded-2xl bg-gray-400 mb-6" />
              <Text className="text-2xl font-extrabold text-center text-slate-900">Enter OTP</Text>
              <Text className="text-base text-center text-slate-500 mt-2">
                We’ve sent a code to your phone number
              </Text>
            </View>

            <View>
              <Text className="text-sm font-medium text-slate-500 mb-2">Enter 6-digit code</Text>
              <TextInput
                placeholder="------"
                keyboardType="number-pad"
                maxLength={6}
                className="border-b-2 border-slate-200 py-3 text-center text-2xl tracking-widest mb-10"
                value={otp}
                onChangeText={setOtp}
                placeholderTextColor="#94A3B8"
              />

              <TouchableOpacity
                className="rounded-full py-4 items-center mb-4 bg-gray-800"
                onPress={handleVerify}
              >
                <Text className="text-white text-base font-bold">Verify</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
