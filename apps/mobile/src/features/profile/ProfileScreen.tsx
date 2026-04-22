import { clearAuthState, getApiErrorMessage } from "@/services/auth-service";
import { setProfileCompletedInSession } from "@/services/auth-storage";
import { submitOnboarding } from "@/services/onboarding-service";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ImageBackground, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

export function ProfileScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [dob, setDob] = useState("");
  const [college, setCollege] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name || !mobile || !dob || !college) {
      alert("Please fill all fields");
      return;
    }

    if (mobile.trim().length < 10 || mobile.trim().length > 20) {
      alert("Mobile number must be 10 to 20 characters");
      return;
    }

    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dob.trim())) {
      alert("Date of birth must be DD/MM/YYYY");
      return;
    }

    try {
      setIsLoading(true);
      await submitOnboarding({
        name: name.trim(),
        mobile: mobile.trim(),
        dob: dob.trim(),
        college: college.trim(),
      });

      await setProfileCompletedInSession(true);
      alert("Profile created successfully");
      router.replace("/read");
    } catch (error) {
      if ((error as { response?: { status?: number } })?.response?.status === 401) {
        await clearAuthState();
        router.replace("/login");
        return;
      }

      alert(
        getApiErrorMessage(error, "Unable to save onboarding details right now. Please try again."),
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ImageBackground
      source={{
        uri: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f",
      }}
      className="flex-1"
      resizeMode="cover"
    >
      <ScrollView className="flex-1" contentContainerClassName="flex-1 justify-center py-10">
        <View className="flex-1 justify-center items-center px-6">
          <View className="w-full max-w-[420px] bg-white/95 rounded-[32px] p-8 border border-slate-300/25 shadow-2xl backdrop-blur-xl">
            <View className="items-center mb-4">
              <View className="w-16 h-1 bg-indigo-600 rounded mb-4" />
              <Text className="text-4xl font-black text-center tracking-tight text-slate-900">
                Complete Profile
              </Text>
            </View>
            <Text className="text-base text-center mb-16 text-slate-600 font-bold leading-relaxed">
              Help us personalize your learning experience
            </Text>

            <View className="space-y-3.5 mb-6">
              <TextInput
                placeholder="Full Name"
                className="border border-slate-200 bg-white rounded-2xl px-4 py-3.5 text-slate-900 text-base"
                value={name}
                onChangeText={setName}
                placeholderTextColor="#94A3B8"
                editable={!isLoading}
              />

              <TextInput
                placeholder="Mobile Number"
                keyboardType="number-pad"
                className="border border-slate-200 bg-white rounded-2xl px-4 py-3.5 text-slate-900 text-base"
                value={mobile}
                onChangeText={setMobile}
                placeholderTextColor="#94A3B8"
                editable={!isLoading}
              />

              <TextInput
                placeholder="Date of Birth (DD/MM/YYYY)"
                className="border border-slate-200 bg-white rounded-2xl px-4 py-3.5 text-slate-900 text-base"
                value={dob}
                onChangeText={setDob}
                placeholderTextColor="#94A3B8"
                editable={!isLoading}
              />

              <TextInput
                placeholder="College/University"
                className="border border-slate-200 bg-white rounded-2xl px-4 py-3.5 text-slate-900 text-base"
                value={college}
                onChangeText={setCollege}
                placeholderTextColor="#94A3B8"
                editable={!isLoading}
              />
            </View>

            <TouchableOpacity
              className={`rounded-2xl py-4 items-center mb-5.5 bg-indigo-600 ${isLoading ? "opacity-75" : ""}`}
              disabled={isLoading}
              onPress={handleSubmit}
            >
              <Text className="text-white text-base font-bold">
                {isLoading ? "Processing..." : "Continue"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}
