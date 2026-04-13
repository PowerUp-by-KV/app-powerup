import { clearAuthState, getApiErrorMessage } from "@/services/auth-service";
import { setProfileCompletedInSession } from "@/services/auth-storage";
import { useSubmitOnboardingMutation } from "@/services/onboarding-api";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export function ProfileScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [dob, setDob] = useState("");
  const [college, setCollege] = useState("");
  const [submitOnboarding, { isLoading }] = useSubmitOnboardingMutation();

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
      await submitOnboarding({
        name: name.trim(),
        mobile: mobile.trim(),
        dob: dob.trim(),
        college: college.trim(),
      }).unwrap();

      await setProfileCompletedInSession(true);
      alert("Profile created successfully");
      router.replace("/read");
    } catch (error) {
      const apiError = error as { response?: { status?: number } };
      if (apiError?.response?.status === 401) {
        await clearAuthState();
        router.replace("/login");
        return;
      }

      alert(
        getApiErrorMessage(error, "Unable to save onboarding details right now. Please try again."),
      );
    }
  };

  return (
    <ImageBackground
      source={{
        uri: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
      }}
      resizeMode="cover"
      className="flex-1"
      imageStyle={{ opacity: 1 }}
    >
      <View className="flex-1 bg-black/45">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1">
            <View className="flex-1 justify-center px-4 py-10">
              <View className="w-full max-w-md mx-auto bg-white/95 p-8 rounded-[32px] border border-white/20 shadow-2xl">
                <Text className="text-3xl text-center mb-3 font-bold text-slate-900">
                  Complete Your Profile
                </Text>
                <Text className="text-center text-sm text-slate-600 mb-7">
                  Help us personalize your experience.
                </Text>

                <View className="space-y-4">
                  <TextInput
                    placeholder="Full Name"
                    className="bg-slate-50 border border-slate-200 px-4 py-3 rounded-3xl text-slate-900 text-base"
                    value={name}
                    onChangeText={setName}
                    placeholderTextColor="#9CA3AF"
                  />

                  <TextInput
                    placeholder="Mobile Number"
                    className="bg-slate-50 border border-slate-200 px-4 py-3 rounded-3xl text-slate-900 text-base"
                    keyboardType="number-pad"
                    value={mobile}
                    onChangeText={setMobile}
                    placeholderTextColor="#9CA3AF"
                  />

                  <TextInput
                    placeholder="Date of Birth (DD/MM/YYYY)"
                    className="bg-slate-50 border border-slate-200 px-4 py-3 rounded-3xl text-slate-900 text-base"
                    value={dob}
                    onChangeText={setDob}
                    placeholderTextColor="#9CA3AF"
                  />

                  <TextInput
                    placeholder="College Name"
                    className="bg-slate-50 border border-slate-200 px-4 py-3 rounded-3xl text-slate-900 text-base"
                    value={college}
                    onChangeText={setCollege}
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <TouchableOpacity
                  className={`bg-indigo-600 py-3 rounded-3xl items-center mt-6 ${isLoading ? "opacity-70" : ""}`}
                  onPress={handleSubmit}
                  disabled={isLoading}
                >
                  <Text className="text-white font-bold text-base">
                    Continue{isLoading ? "..." : ""}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </ImageBackground>
  );
}
