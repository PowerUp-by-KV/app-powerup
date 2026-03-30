import { clearAuthState, getApiErrorMessage } from "@/services/auth-service";
import { setProfileCompletedInSession } from "@/services/auth-storage";
import { submitOnboarding } from "@/services/onboarding-service";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ImageBackground, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function ProfileScreen() {
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
      router.replace("/(auth)/read");
    } catch (error) {
      if ((error as { response?: { status?: number } })?.response?.status === 401) {
        await clearAuthState();
        router.replace("/(auth)/login");
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
      <View className="flex-1 justify-center items-center bg-black/40">
        <View className="w-[85%] max-w-[400px] bg-white p-6 rounded-2xl shadow-lg">
          <Text className="text-2xl text-center mb-6 font-bold text-gray-800">
            Complete Your Profile
          </Text>

          <TextInput
            placeholder="Full Name"
            className="border border-gray-300 px-3 py-3 rounded-lg mb-4 text-gray-800"
            value={name}
            onChangeText={setName}
            placeholderTextColor="#999"
          />

          <TextInput
            placeholder="Mobile Number"
            className="border border-gray-300 px-3 py-3 rounded-lg mb-4 text-gray-800"
            keyboardType="number-pad"
            value={mobile}
            onChangeText={setMobile}
            placeholderTextColor="#999"
          />

          <TextInput
            placeholder="Date of Birth (DD/MM/YYYY)"
            className="border border-gray-300 px-3 py-3 rounded-lg mb-4 text-gray-800"
            value={dob}
            onChangeText={setDob}
            placeholderTextColor="#999"
          />

          <TextInput
            placeholder="College Name"
            className="border border-gray-300 px-3 py-3 rounded-lg mb-4 text-gray-800"
            value={college}
            onChangeText={setCollege}
            placeholderTextColor="#999"
          />

          <TouchableOpacity
            className={`bg-indigo-600 py-3 rounded-lg items-center ${
              isLoading ? "opacity-70" : ""
            }`}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <Text className="text-white font-bold text-base">Continue{isLoading ? "..." : ""}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}
