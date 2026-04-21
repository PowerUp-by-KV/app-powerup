import React, { useState } from "react";
import { SafeAreaView, View, Text, TextInput, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export function OtpVerifyScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState("");

  const handleSendOtp = () => {
    // in real app, trigger OTP send here
    router.push("/otp-enter");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-center items-center px-6">
        <View className="w-full max-w-[360px]">
          <View className="items-center mb-6">
            <View className="w-16 h-16 rounded-2xl bg-gray-400 mb-6" />
            <Text className="text-xl font-extrabold text-center text-slate-900">
              Verify Your Phone
            </Text>
            <Text className="text-sm text-center text-slate-500 mt-2">
              Enter your phone number to receive a one time password
            </Text>
          </View>

          <View>
            <Text className="text-xs text-slate-600 mb-2">Phone Number</Text>
            <View className="border border-slate-200 rounded-full flex-row items-center px-4 py-3 mb-6">
              <Text className="text-slate-400 mr-3">+91</Text>
              <TextInput
                placeholder="000 000-0000"
                keyboardType="phone-pad"
                className="flex-1 text-base text-slate-900"
                value={phone}
                onChangeText={setPhone}
              />
            </View>

            <TouchableOpacity
              className="rounded-full py-4 items-center mb-4 bg-gray-700"
              onPress={handleSendOtp}
            >
              <Text className="text-white text-base font-bold">Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
