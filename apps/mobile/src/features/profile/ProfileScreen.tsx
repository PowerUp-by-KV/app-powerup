import { clearAuthState, getApiErrorMessage } from "@/services/auth-service";
import { setProfileCompletedInSession } from "@/services/auth-storage";
import { submitOnboarding } from "@/services/onboarding-service";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ImageBackground, Text, TextInput, TouchableOpacity, View } from "react-native";

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
      style={{ flex: 1 }}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0, 0, 0, 0.4)",
        }}
      >
        <View
          style={{
            width: "85%",
            maxWidth: 400,
            backgroundColor: "white",
            padding: 24,
            borderRadius: 16,
            elevation: 5,
          }}
        >
          <Text
            style={{
              fontSize: 24,
              textAlign: "center",
              marginBottom: 24,
              fontWeight: "bold",
              color: "#1F2937",
            }}
          >
            Complete Your Profile
          </Text>

          <TextInput
            placeholder="Full Name"
            style={{
              borderWidth: 1,
              borderColor: "#D1D5DB",
              paddingHorizontal: 12,
              paddingVertical: 12,
              borderRadius: 8,
              marginBottom: 16,
              color: "#1F2937",
              fontSize: 16,
            }}
            value={name}
            onChangeText={setName}
            placeholderTextColor="#999"
          />

          <TextInput
            placeholder="Mobile Number"
            style={{
              borderWidth: 1,
              borderColor: "#D1D5DB",
              paddingHorizontal: 12,
              paddingVertical: 12,
              borderRadius: 8,
              marginBottom: 16,
              color: "#1F2937",
              fontSize: 16,
            }}
            keyboardType="number-pad"
            value={mobile}
            onChangeText={setMobile}
            placeholderTextColor="#999"
          />

          <TextInput
            placeholder="Date of Birth (DD/MM/YYYY)"
            style={{
              borderWidth: 1,
              borderColor: "#D1D5DB",
              paddingHorizontal: 12,
              paddingVertical: 12,
              borderRadius: 8,
              marginBottom: 16,
              color: "#1F2937",
              fontSize: 16,
            }}
            value={dob}
            onChangeText={setDob}
            placeholderTextColor="#999"
          />

          <TextInput
            placeholder="College Name"
            style={{
              borderWidth: 1,
              borderColor: "#D1D5DB",
              paddingHorizontal: 12,
              paddingVertical: 12,
              borderRadius: 8,
              marginBottom: 16,
              color: "#1F2937",
              fontSize: 16,
            }}
            value={college}
            onChangeText={setCollege}
            placeholderTextColor="#999"
          />

          <TouchableOpacity
            style={{
              backgroundColor: "#4F46E5",
              paddingVertical: 12,
              borderRadius: 8,
              alignItems: "center",
              opacity: isLoading ? 0.7 : 1,
            }}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>
              Continue{isLoading ? "..." : ""}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}
