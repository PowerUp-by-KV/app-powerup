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
import { GoogleLogo } from "../../src/components/svg";

export default function RegisterScreen() {
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

    router.replace("/(auth)/google-success");
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
        router.replace("/(auth)/login");
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
        router.replace("/(auth)/login");
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
      className="flex-1"
    >
      <View className="flex-1 justify-center items-center bg-black/40">
        <View className="w-[85%] max-w-[400px] bg-white p-6 rounded-2xl shadow-lg">
          <Text className="text-2xl text-center mb-6 font-bold text-gray-800">Create Account</Text>

          <TextInput
            placeholder="Email"
            keyboardType="email-address"
            className="border border-gray-300 px-3 py-3 rounded-lg mb-4 text-gray-800"
            value={email}
            onChangeText={setEmail}
            placeholderTextColor="#999"
          />
          <TextInput
            placeholder="Password"
            secureTextEntry
            className="border border-gray-300 px-3 py-3 rounded-lg mb-4 text-gray-800"
            value={password}
            onChangeText={setPassword}
            placeholderTextColor="#999"
          />
          <TextInput
            placeholder="Confirm Password"
            secureTextEntry
            className="border border-gray-300 px-3 py-3 rounded-lg mb-4 text-gray-800"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholderTextColor="#999"
          />

          <TouchableOpacity
            className={`bg-indigo-600 py-3 rounded-lg items-center ${
              isLoading ? "opacity-70" : ""
            }`}
            disabled={isLoading}
            onPress={handleRegister}
          >
            <Text className="text-white font-bold text-base">Register{isLoading ? "..." : ""}</Text>
          </TouchableOpacity>

          <Text className="text-center my-3 text-gray-600">OR</Text>

          <TouchableOpacity
            className="flex-row items-center justify-center border border-gray-300 py-3 rounded-lg mb-2"
            onPress={handleGoogleRegister}
            disabled={isLoading || isAuthenticating || !request}
          >
            <View className="mr-2">
              <GoogleLogo width={22} height={22} />
            </View>
            <Text className="text-base text-gray-800">
              Continue with Google{isAuthenticating ? "..." : ""}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
            <Text className="mt-4 text-center text-blue-500">Already have an account? Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}
