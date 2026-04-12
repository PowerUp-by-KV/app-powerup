import { useGoogleAuth } from "@/hooks/use-google-auth";
import { clearAuthState, getApiErrorMessage, setAuthToken } from "@/services/auth-service";
import { AuthResponse, saveAuthSession } from "@/services/auth-storage";
import { useLoginMutation } from "@/services/auth-api";
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

export function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { request, isAuthenticating, authenticateWithGoogle } = useGoogleAuth();
  const [login] = useLoginMutation();

  const handlePostAuthNavigation = (profileCompleted: boolean) => {
    if (profileCompleted) {
      router.replace("/dashboard");
      return;
    }
    router.replace("/google-success");
  };

  const persistAuthAndNavigate = async (auth: AuthResponse) => {
    await saveAuthSession(auth);
    setAuthToken(auth.access_token);
    handlePostAuthNavigation(auth.profile_completed);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Enter email and password");
      return;
    }

    try {
      setIsLoading(true);

      const response = await login({
        email: email.trim(),
        password,
        remember_me: rememberMe,
      }).unwrap();

      Alert.alert("Success", "Login successful");
      await persistAuthAndNavigate(response);
    } catch (error) {
      if ((error as { response?: { status?: number } })?.response?.status === 401) {
        await clearAuthState();
        router.replace("/login");
        return;
      }

      Alert.alert(
        "Login Failed",
        getApiErrorMessage(error, "Unable to login right now. Please try again."),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      const result = await authenticateWithGoogle();

      if (result.status === "error") {
        Alert.alert("Google Login Failed", result.message);
        return;
      }

      if (result.status !== "success") {
        return;
      }

      const oauthEmail = result.oauth.email ?? email.trim();

      if (!oauthEmail) {
        Alert.alert(
          "Google Login Failed",
          "Unable to resolve email from Google account. Enter your email and try again.",
        );
        return;
      }

      let response;

      if (result.oauth.oauth_id_token) {
        response = await login({
          email: oauthEmail,
          oauth_id_token: result.oauth.oauth_id_token,
        }).unwrap();
      } else if (
        result.oauth.oauth_code &&
        result.oauth.oauth_redirect_uri &&
        result.oauth.oauth_code_verifier
      ) {
        response = await login({
          email: oauthEmail,
          oauth_code: result.oauth.oauth_code,
          oauth_redirect_uri: result.oauth.oauth_redirect_uri,
          oauth_code_verifier: result.oauth.oauth_code_verifier,
        }).unwrap();
      } else {
        Alert.alert("Google Login Failed", "Google did not return the required OAuth credentials.");
        return;
      }

      await saveAuthSession(response);
      setAuthToken(response.access_token);
      Alert.alert("Success", "Login successful");
      router.push("/google-success");
    } catch (error) {
      if ((error as { response?: { status?: number } })?.response?.status === 401) {
        await clearAuthState();
        router.replace("/login");
        return;
      }

      Alert.alert(
        "Google Login Failed",
        getApiErrorMessage(error, "Unable to login with Google right now. Please try again."),
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
                Welcome Back
              </Text>
            </View>
            <Text className="text-base text-center mb-16 text-slate-600 font-bold leading-relaxed">
              Sign in to your account and continue learning.
            </Text>

            <View className="space-y-3.5 mb-6">
              <TextInput
                placeholder="Email"
                keyboardType="email-address"
                className="border border-slate-200 bg-white rounded-2xl px-4 py-3.5 text-slate-900 text-base"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                placeholderTextColor="#94A3B8"
                editable={!isLoading}
              />

              <View className="flex-row items-center border border-slate-200 rounded-2xl bg-white pr-4 overflow-hidden">
                <TextInput
                  placeholder="Password"
                  secureTextEntry={!showPassword}
                  className="flex-1 text-base text-slate-900 py-3.5 pl-4"
                  value={password}
                  onChangeText={setPassword}
                  placeholderTextColor="#94A3B8"
                  editable={!isLoading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword((prev) => !prev)}
                  className="px-3 py-2.5"
                  disabled={isLoading}
                >
                  <Text className="text-lg">{showPassword ? "👁️" : "👁️‍🗨️"}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              className={`rounded-2xl py-4 items-center mb-5.5 bg-indigo-600 ${isLoading ? "opacity-75" : ""}`}
              disabled={isLoading}
              onPress={handleLogin}
            >
              <Text className="text-white text-base font-bold">
                {isLoading ? "Signing in..." : "Sign In"}
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
              className={`flex-row items-center justify-center border border-slate-200 rounded-2xl py-3.5 mb-4.5 bg-slate-50 ${isLoading || isAuthenticating || !request ? "opacity-60" : ""}`}
              onPress={handleGoogleLogin}
              disabled={isLoading || isAuthenticating || !request}
            >
              <View className="mr-3">
                <GoogleLogo width={22} height={22} />
              </View>
              <Text className="text-slate-900 text-base font-bold">
                {isAuthenticating ? "Signing in..." : "Continue with Google"}
              </Text>
            </TouchableOpacity>

            <View className="flex-row justify-center items-center">
              <Text className="text-slate-600 text-sm">Don&apos;t have an account? </Text>
              <TouchableOpacity onPress={() => router.push("/register")} disabled={isLoading}>
                <Text className="text-indigo-600 text-sm font-bold">Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}
