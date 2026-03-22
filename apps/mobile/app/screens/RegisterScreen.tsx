import { useGoogleAuth } from "@/hooks/use-google-auth";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { GoogleLogo } from "../../src/components/svg";

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading] = useState(false);
  const { request, isAuthenticating, authenticateWithGoogle } = useGoogleAuth();

  const handleRegister = () => {
    const email_value = email.trim();
    const password_value = password.trim();
    const confirmPassword_value = confirmPassword.trim();

    if (!email_value || !password_value || !confirmPassword_value) {
      Alert.alert("Error", "All fields are required");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email_value)) {
      Alert.alert("Error", "Please enter a valid email");
      return;
    }

    if (password_value.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    if (password_value !== confirmPassword_value) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

<<<<<<< HEAD
    Alert.alert("Success", "Registration successful. Please login.");
    router.replace("/(auth)/login");
=======
    alert("Registration successful. Please login.");
    router.replace("/login");
>>>>>>> c9bbd3aa9ad3e2e82558186199802fe2e575033b
  };

  const handleGoogleRegister = async () => {
    const result = await authenticateWithGoogle();

    if (result.status === "success") {
      router.replace("/(auth)/profile");
      return;
    }

    if (result.status === "error") {
      Alert.alert("Google Sign-up Failed", result.message);
    }
  };

  return (
    <ImageBackground
<<<<<<< HEAD
      source={{
        uri: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=500",
      }}
=======
      source={{ uri: "https://images.unsplash.com/photo-1508780709619-79562169bc64" }}
>>>>>>> c9bbd3aa9ad3e2e82558186199802fe2e575033b
      style={styles.background}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Create Account</Text>

          <TextInput
            placeholder="Email"
            keyboardType="email-address"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            placeholder="Password"
            secureTextEntry
            style={styles.input}
            value={password}
            onChangeText={setPassword}
          />
          <TextInput
            placeholder="Confirm Password"
            secureTextEntry
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          <TouchableOpacity
            style={[styles.btn, isLoading && styles.disabledBtn]}
            disabled={isLoading}
            onPress={handleRegister}
          >
            <Text style={styles.btnText}>Register{isLoading ? "..." : ""}</Text>
          </TouchableOpacity>

          <Text style={styles.or}>OR</Text>

          <TouchableOpacity
<<<<<<< HEAD
            style={styles.oauthBtn}
            onPress={handleGoogleRegister}
            disabled={isLoading || isAuthenticating || !request}
=======
            style={styles.googleBtn}
            onPress={() => router.replace("/profile")}
>>>>>>> c9bbd3aa9ad3e2e82558186199802fe2e575033b
          >
            <View style={{ marginRight: 10 }}>
              <GoogleLogo width={22} height={22} />
            </View>
            <Text style={styles.oauthText}>
              Continue with Google{isAuthenticating ? "..." : ""}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/login")}>
            <Text style={styles.link}>Already have an account? Login</Text>
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
  btn: {
    backgroundColor: "#4F46E5",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  or: {
    textAlign: "center",
    marginVertical: 12,
    color: "#333",
  },
  oauthBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  oauthText: {
    fontSize: 15,
  },
  btnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  disabledBtn: { opacity: 0.7 },
  link: { marginTop: 15, textAlign: "center", color: "blue" },
});
