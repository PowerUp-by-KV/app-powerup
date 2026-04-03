import { useGoogleAuth } from "@/hooks/use-google-auth";
import {
  clearAuthState,
  getApiErrorMessage,
  signupWithEmail,
  signupWithGoogleCode,
  signupWithGoogleIdToken,
} from "@/services/auth-service";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, ImageBackground, Text, TextInput, TouchableOpacity, View } from "react-native";
import { GoogleLogo } from "@/components/svg";

export function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { request, isAuthenticating, authenticateWithGoogle } = useGoogleAuth();

  const handlePostAuthNavigation = (profileCompleted: boolean) => {
    if (profileCompleted) {
      router.replace("/(tabs)");
      return;
    }

    router.replace("/google-success");
  };

  const handleRegister = async () => {
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

    try {
      setIsLoading(true);

      const auth = await signupWithEmail({
        email: email_value,
        password: password_value,
        confirm_password: confirmPassword_value,
        remember_me: true,
      });

      Alert.alert("Success", "Registration successful.");
      handlePostAuthNavigation(auth.profile_completed);
    } catch (error) {
      if ((error as { response?: { status?: number } })?.response?.status === 401) {
        await clearAuthState();
        router.replace("/login");
        return;
      }

      Alert.alert(
        "Registration Failed",
        getApiErrorMessage(error, "Unable to register right now. Please try again."),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    try {
      setIsLoading(true);
      const result = await authenticateWithGoogle();

      if (result.status === "error") {
        Alert.alert("Google Sign-up Failed", result.message);
        return;
      }

      if (result.status !== "success") {
        return;
      }

      const oauthEmail = result.oauth.email ?? email.trim();

      if (!oauthEmail) {
        Alert.alert(
          "Google Sign-up Failed",
          "Unable to resolve email from Google account. Enter your email and try again.",
        );
        return;
      }

      let auth;

      if (result.oauth.oauth_id_token) {
        auth = await signupWithGoogleIdToken({
          email: oauthEmail,
          oauth_id_token: result.oauth.oauth_id_token,
        });
      } else if (
        result.oauth.oauth_code &&
        result.oauth.oauth_redirect_uri &&
        result.oauth.oauth_code_verifier
      ) {
        auth = await signupWithGoogleCode({
          email: oauthEmail,
          oauth_code: result.oauth.oauth_code,
          oauth_redirect_uri: result.oauth.oauth_redirect_uri,
          oauth_code_verifier: result.oauth.oauth_code_verifier,
        });
      } else {
        Alert.alert("Google Sign-up Failed", "Google did not return complete OAuth credentials.");
        return;
      }

      Alert.alert("Success", "Google registration successful.");
      handlePostAuthNavigation(auth.profile_completed);
    } catch (error) {
      if ((error as { response?: { status?: number } })?.response?.status === 401) {
        await clearAuthState();
        router.replace("/login");
        return;
      }

      Alert.alert(
        "Google Sign-up Failed",
        getApiErrorMessage(error, "Unable to complete Google sign-up right now. Please try again."),
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ImageBackground
      source={{
        uri: "https://images.unsplash.com/photo-1508780709619-79562169bc64",
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
            Create Account
          </Text>

          <TextInput
            placeholder="Email"
            keyboardType="email-address"
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
            value={email}
            onChangeText={setEmail}
            placeholderTextColor="#999"
          />
          <TextInput
            placeholder="Password"
            secureTextEntry
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
            value={password}
            onChangeText={setPassword}
            placeholderTextColor="#999"
          />
          <TextInput
            placeholder="Confirm Password"
            secureTextEntry
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
            value={confirmPassword}
            onChangeText={setConfirmPassword}
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
            disabled={isLoading}
            onPress={handleRegister}
          >
            <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>
              Register{isLoading ? "..." : ""}
            </Text>
          </TouchableOpacity>

          <Text style={{ textAlign: "center", marginVertical: 12, color: "#4B5563" }}>OR</Text>

          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: "#D1D5DB",
              paddingVertical: 12,
              borderRadius: 8,
              marginBottom: 8,
              opacity: isLoading || isAuthenticating || !request ? 0.5 : 1,
            }}
            onPress={handleGoogleRegister}
            disabled={isLoading || isAuthenticating || !request}
          >
            <View style={{ marginRight: 8 }}>
              <GoogleLogo width={22} height={22} />
            </View>
            <Text style={{ fontSize: 16, color: "#1F2937" }}>
              Continue with Google{isAuthenticating ? "..." : ""}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/login")}>
            <Text style={{ marginTop: 16, textAlign: "center", color: "#3B82F6", fontSize: 14 }}>
              Already have an account? Login
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}
