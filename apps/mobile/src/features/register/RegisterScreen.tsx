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
import {
  Alert,
  ImageBackground,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
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
      className="flex-1"
      resizeMode="cover"
    >
      <ScrollView className="flex-1" contentContainerClassName="grow justify-center py-10">
        <View className="grow justify-center items-center px-6">
          <View className="w-full max-w-[420px] bg-white/95 rounded-[32px] p-8 border border-slate-300/25 shadow-2xl backdrop-blur-xl">
            <View className="items-center mb-4">
              <View className="w-16 h-1 bg-indigo-600 rounded mb-4" />
              <Text className="text-4xl font-black text-center tracking-tight text-slate-900">
                Create Account
              </Text>
            </View>
            <Text className="text-base text-center mb-16 text-slate-600 font-bold leading-relaxed">
              Build your profile and unlock smarter learning.
            </Text>

            <View className="space-y-3.5 mb-6">
              <TextInput
                placeholder="Email"
                keyboardType="email-address"
                className="border border-slate-200 bg-white rounded-2xl px-4 py-3.5 text-slate-900 text-base"
                value={email}
                onChangeText={setEmail}
                placeholderTextColor="#94A3B8"
                editable={!isLoading}
                autoCapitalize="none"
              />

              <TextInput
                placeholder="Password"
                secureTextEntry
                className="border border-slate-200 bg-white rounded-2xl px-4 py-3.5 text-slate-900 text-base"
                value={password}
                onChangeText={setPassword}
                placeholderTextColor="#94A3B8"
                editable={!isLoading}
              />

              <TextInput
                placeholder="Confirm Password"
                secureTextEntry
                className="border border-slate-200 bg-white rounded-2xl px-4 py-3.5 text-slate-900 text-base"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholderTextColor="#94A3B8"
                editable={!isLoading}
              />
            </View>

            <TouchableOpacity
              className={`rounded-2xl py-4 items-center mb-5.5 bg-indigo-600 ${isLoading ? "opacity-75" : ""}`}
              disabled={isLoading}
              onPress={handleRegister}
            >
              <Text className="text-white text-base font-bold">
                {isLoading ? "Creating Account..." : "Register"}
              </Text>
            </TouchableOpacity>

            <View className="flex-row items-center mb-5.5">
              <View className="flex-1 h-px bg-slate-200" />
              <Text className="mx-3 text-slate-400 text-[11px] font-semibold tracking-[0.32em]">
                OR
              </Text>
              <View className="flex-1 h-px bg-slate-200" />
            </View>

            <TouchableOpacity
              className={`flex-row items-center justify-center border border-slate-200 rounded-2xl py-3.5 mb-5.5 bg-slate-50 ${isLoading || isAuthenticating || !request ? "opacity-60" : ""}`}
              onPress={handleGoogleRegister}
              disabled={isLoading || isAuthenticating || !request}
            >
              <View className="mr-3">
                <GoogleLogo width={22} height={22} />
              </View>
              <Text className="text-slate-900 text-base font-bold">
                {isAuthenticating ? "Signing up..." : "Continue with Google"}
              </Text>
            </TouchableOpacity>

            <View className="flex-row justify-center items-center">
              <Text className="text-slate-600 text-sm">Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push("/login")} disabled={isLoading}>
                <Text className="text-indigo-600 text-sm font-bold">Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}
