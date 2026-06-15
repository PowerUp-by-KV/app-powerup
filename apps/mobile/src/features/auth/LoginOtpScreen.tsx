import React, { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { OtpInput } from "./components/OtpInput";
import { OtpResendTimer } from "./components/OtpResendTimer";

export function LoginOtpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const handleSendOtp = () => {
    if (phone.replace(/\D/g, "").length < 7) return;
    setModalOpen(true);
  };

  const handleVerify = () => {
    setModalOpen(false);
    router.replace("/welcome-back" as never);
  };

  return (
    <View
      style={{
        flex: 1,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
      className="bg-white"
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
            alignItems: "center",
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="w-16 h-16 rounded-2xl bg-slate-200 mb-6" />
          <Text className="text-3xl font-extrabold text-slate-900 mb-2 text-center">
            Login with OTP
          </Text>
          <Text className="text-slate-500 text-center mb-8">Enter your phone number</Text>

          <View className="w-full mb-4">
            <Text className="text-slate-500 text-sm mb-1.5">Phone Number</Text>
            <View className="flex-row" style={{ gap: 10 }}>
              <View className="bg-slate-100 rounded-xl px-3 py-3 items-center justify-center">
                <Text className="text-slate-900 font-semibold">+91</Text>
              </View>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="000 000-0000"
                placeholderTextColor="#94a3b8"
                keyboardType="phone-pad"
                className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-slate-900"
              />
            </View>
          </View>

          <Pressable
            onPress={handleSendOtp}
            className="w-full bg-slate-700 rounded-full py-4 items-center active:opacity-85"
          >
            <Text className="text-white font-bold text-base">Send OTP</Text>
          </Pressable>

          <View className="flex-row items-center my-6 w-full">
            <View className="h-px flex-1 bg-slate-200" />
            <Text className="mx-3 text-slate-400 text-xs tracking-widest">OR</Text>
            <View className="h-px flex-1 bg-slate-200" />
          </View>

          <Pressable
            onPress={() => router.push("/login")}
            className="w-full border-2 border-slate-300 rounded-full py-4 items-center"
          >
            <Text className="text-slate-900 font-bold text-base">Back to Email Login</Text>
          </Pressable>

          <View className="items-center mt-8">
            <Text className="text-slate-500 text-sm">
              Don&apos;t have an account?{" "}
              <Text className="text-indigo-600 font-bold" onPress={() => router.push("/register")}>
                Sign up
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        transparent
        visible={modalOpen}
        animationType="slide"
        onRequestClose={() => setModalOpen(false)}
      >
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-slate-900 text-xl font-extrabold">Enter OTP</Text>
              <Pressable onPress={() => setModalOpen(false)}>
                <Feather name="x" size={22} color="#475569" />
              </Pressable>
            </View>
            <Text className="text-slate-500 text-sm mb-4">
              We&apos;ve sent a code to {phone.slice(0, 3)}*******
            </Text>
            <OtpInput length={4} value={code} onChange={setCode} />
            <Pressable
              onPress={handleVerify}
              disabled={code.length !== 4}
              className={`mt-6 rounded-full py-4 items-center ${code.length === 4 ? "bg-slate-700" : "bg-slate-300"}`}
            >
              <Text className="text-white font-bold text-base">Verify</Text>
            </Pressable>
            <View className="mt-4">
              <OtpResendTimer initialSeconds={45} onResend={() => {}} />
            </View>
            <Pressable onPress={() => router.push("/login")} className="mt-6 items-center">
              <Text className="text-slate-900 font-bold underline">Use Email Instead</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
