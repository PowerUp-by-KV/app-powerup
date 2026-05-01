import React, { useState } from "react";
import { SafeAreaView, View, Text, TextInput, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export function OtpEnterScreen() {
  const router = useRouter();
  const [otp, setOtp] = useState("");

  const handleVerify = () => {
    // in real app, verify OTP here
    router.replace("/success?mode=login");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-center items-center px-6">
        <View className="w-full max-w-[360px]">
          <View className="items-center mb-6">
            <View className="w-16 h-16 rounded-2xl bg-gray-400 mb-6" />
            <Text className="text-xl font-extrabold text-center text-slate-900">Enter OTP</Text>
            <Text className="text-sm text-center text-slate-500 mt-2">
              We’ve sent a code to your phone number
            </Text>
          </View>

          <View>
            <Text className="text-xs text-slate-600 mb-2">Enter 6-digit code</Text>
            <TextInput
              placeholder="------"
              keyboardType="number-pad"
              maxLength={6}
              className="border border-slate-200 rounded-lg px-4 py-3 text-center text-xl tracking-widest mb-6"
              value={otp}
              onChangeText={setOtp}
            />

            <TouchableOpacity
              className="rounded-full py-4 items-center mb-4 bg-gray-700"
              onPress={handleVerify}
            >
              <Text className="text-white text-base font-bold">Verify</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
