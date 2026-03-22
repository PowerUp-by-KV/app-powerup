import { clearAuthState, getApiErrorMessage } from "@/services/auth-service";
import { setProfileCompletedInSession } from "@/services/auth-storage";
import { submitOnboarding } from "@/services/onboarding-service";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

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
      if (
        (error as { response?: { status?: number } })?.response?.status === 401
      ) {
        await clearAuthState();
        router.replace("/(auth)/login");
        return;
      }

      alert(
        getApiErrorMessage(
          error,
          "Unable to save onboarding details right now. Please try again.",
        ),
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
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Complete Your Profile</Text>

          <TextInput
            placeholder="Full Name"
            style={styles.input}
            value={name}
            onChangeText={setName}
          />

          <TextInput
            placeholder="Mobile Number"
            style={styles.input}
            keyboardType="number-pad"
            value={mobile}
            onChangeText={setMobile}
          />

          <TextInput
            placeholder="Date of Birth (DD/MM/YYYY)"
            style={styles.input}
            value={dob}
            onChangeText={setDob}
          />

          <TextInput
            placeholder="College Name"
            style={styles.input}
            value={college}
            onChangeText={setCollege}
          />

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <Text style={styles.btnText}>Continue{isLoading ? "..." : ""}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },

  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },

  card: {
    width: "85%",
    maxWidth: 400,
    backgroundColor: "#fff",
    padding: 25,
    borderRadius: 14,
  },

  title: {
    fontSize: 28,
    textAlign: "center",
    marginBottom: 25,
    fontWeight: "bold",
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },

  button: {
    backgroundColor: "#4F46E5",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },

  buttonDisabled: {
    opacity: 0.7,
  },

  btnText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
