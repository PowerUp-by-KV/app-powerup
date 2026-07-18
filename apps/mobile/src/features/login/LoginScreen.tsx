import React, { useState } from "react";
import { useDispatch } from "react-redux";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { AntDesign, Feather } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { AuthResponse, LoginRequest, useLoginMutation } from "@/services/auth-api";
import { getApiErrorMessage } from "@/utils/error-message";
import {
  clearAuthSession,
  saveAuthSession,
  clearStaleLocalFlagsIfUserChanged,
  saveLastLoggedInEmail,
} from "@/services/auth-storage";
import { onboardingApi } from "@/services/onboarding-api";
import { api } from "@/services/api";
import { resetOnboarding } from "@/store/slices/onboardingSlice";
import { setTier, type Tier } from "@/store/slices/subscription.slice";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import * as WebBrowser from "expo-web-browser";
import { showAlert } from "@/utils/alert";

WebBrowser.maybeCompleteAuthSession();

export function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [login] = useLoginMutation();
  const { request: googleRequest, promptAsync: promptGoogle } = useGoogleAuth();
  const prefetchOnboarding = onboardingApi.usePrefetch("getGroupedQuestions");

  // Prefetch onboarding questions in the background during the authentication handshake
  React.useEffect(() => {
    prefetchOnboarding();
  }, [prefetchOnboarding]);

  const persistAuthAndNavigate = async (auth: AuthResponse, loginEmail: string) => {
    try {
      await saveAuthSession(auth);
      // Wait for secure storage to fully write before reading profile
      await new Promise((resolve) => setTimeout(resolve, 200));

      // ─── USER-SWITCH DETECTION ─────────────────────────────────────────────
      // If a different email has logged in on this device, wipe stale local flags
      // so they don't mistakenly mark the new user's onboarding/assessment as done.
      await clearStaleLocalFlagsIfUserChanged(loginEmail);
      // Persist the current email for future login comparisons
      await saveLastLoggedInEmail(loginEmail);

      // Wipe RTK Query caches and reset onboarding state to prevent leak from previous user sessions
      dispatch(api.util.resetApiState());
      dispatch(resetOnboarding());
      dispatch(setTier((auth.tier as Tier | undefined) ?? "free"));

      // Prefetch questions immediately upon successful handshake
      prefetchOnboarding();

      const userId = auth?.user?.id;
      if (!userId) {
        router.replace("/onboarding" as never);
        return;
      }

      // Instantly route to the main app. The LearningJourneyGate will fetch onboarding status asynchronously
      router.replace("/(tabs)");
    } catch (err) {
      showAlert("Login Failed", getApiErrorMessage(err, "Could not sign in. Please try again."));
    }
  };

  const handleLogin = async () => {
    const email_value = email.trim();
    const password_value = password.trim();

    if (!email_value) {
      showAlert("Error", "Email is required");
      return;
    }

    if (!password_value) {
      showAlert("Error", "Password is required");
      return;
    }

    try {
      setIsLoading(true);

      const payload: LoginRequest = {
        password: password_value,
        remember_me: rememberMe,
      };

      if (email_value.includes("@")) {
        payload.email = email_value.toLowerCase();
      } else {
        payload.identifier = email_value;
      }

      const response = await login(payload).unwrap();
      // Pass the email so we can detect if a different user has logged in on this device
      const resolvedEmail = payload.email ?? payload.identifier ?? "";
      await persistAuthAndNavigate(response, resolvedEmail);
    } catch (error) {
      const apiError = error as { status?: number; data?: { message?: string } };
      if (apiError?.status === 401) {
        await clearAuthSession();
        showAlert("Error", "Invalid credentials");
        return;
      }

      const errorMessage =
        apiError?.data?.message ||
        getApiErrorMessage(error, "Unable to login right now. Please try again.");
      showAlert("Login Failed", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
      className="bg-white dark:bg-[#18181b]"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            alignItems: "center",
            paddingBottom: 60,
            paddingTop: Platform.OS === "android" ? 48 : 24,
          }}
          style={{ flex: 1 }}
          className="px-6"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="w-full max-w-sm py-4">
            {/* Top Logo Icon */}
            <View className="items-center mb-6">
              {/* Lumino Logo Header */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 38,
                    fontWeight: "900",
                    color: "#3b82f6",
                    letterSpacing: -1.5,
                    marginRight: 1,
                  }}
                >
                  lumin
                </Text>

                <LinearGradient
                  colors={["#86efac", "#22d3ee", "#3b82f6"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 17,
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: 3,
                  }}
                >
                  <View style={{ transform: [{ rotate: "45deg" }] }}>
                    <Svg width={34} height={34} viewBox="0 0 48 48" fill="none">
                      <Path
                        d="M24 10 C24 17, 17 24, 10 24 C17 24, 24 31, 24 38 C24 31, 31 24, 38 24 C31 24, 24 17, 24 10 Z"
                        fill="#ffffff"
                      />
                    </Svg>
                  </View>
                </LinearGradient>
              </View>

              <Text className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-1">
                Welcome Back
              </Text>
              <Text className="text-xs text-slate-400 dark:text-slate-300 text-center mb-6 px-4">
                Sign in to your Lumino account to continue your learning journey
              </Text>

              {/* Google sign-in. Rendered only when a valid auth request could be
                  built (i.e. the Google client IDs are configured for this build);
                  otherwise it stays hidden so missing IDs can never crash the screen. */}
              {googleRequest ? (
                <View className="flex-row gap-4 w-full">
                  <TouchableOpacity
                    onPress={() => {
                      promptGoogle().catch(() =>
                        showAlert(
                          "Google Sign-In",
                          "Could not open Google sign-in. Please try again.",
                        ),
                      );
                    }}
                    disabled={isLoading || !googleRequest}
                    className={`flex-1 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl flex-row items-center justify-center shadow-sm ${
                      isLoading || !googleRequest ? "opacity-50" : ""
                    }`}
                    activeOpacity={0.7}
                  >
                    <AntDesign name="google" size={18} color="#DB4437" style={{ marginRight: 8 }} />
                    <Text className="text-slate-800 dark:text-white font-bold text-sm">Google</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </View>

            {/* OTP Option */}
            <TouchableOpacity
              onPress={() => router.push("/verify-phone")}
              className="w-full py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl flex-row items-center justify-center shadow-sm mb-2"
              activeOpacity={0.7}
            >
              <Feather name="shield" size={16} color="#94A3B8" style={{ marginRight: 8 }} />
              <Text className="text-slate-800 dark:text-white font-bold text-sm">
                Login with OTP
              </Text>
            </TouchableOpacity>

            {/* OR Separator */}
            <View className="flex-row items-center mb-6 mt-4">
              <View className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
              <Text className="mx-4 text-xs font-medium text-slate-400 dark:text-slate-500">
                or
              </Text>
              <View className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            </View>

            {/* Form Fields */}
            <View className="mb-4">
              <Text className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Email
              </Text>
              <View className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3.5 flex-row items-center">
                <Feather name="mail" size={16} color="#94A3B8" style={{ marginRight: 8 }} />
                <TextInput
                  placeholder="Your@email.com"
                  keyboardType="email-address"
                  className="flex-1 text-sm text-slate-900 dark:text-white"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  placeholderTextColor="#94A3B8"
                  editable={!isLoading}
                />
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Password
              </Text>
              <View className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3.5 flex-row items-center">
                <Feather name="lock" size={16} color="#94A3B8" style={{ marginRight: 8 }} />
                <TextInput
                  placeholder="Enter your password"
                  secureTextEntry={!showPassword}
                  className="flex-1 text-sm text-slate-900 dark:text-white"
                  value={password}
                  onChangeText={setPassword}
                  placeholderTextColor="#94A3B8"
                  editable={!isLoading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword((p) => !p)}
                  disabled={isLoading}
                  style={{ marginLeft: 8 }}
                >
                  <Feather name={showPassword ? "eye-off" : "eye"} size={16} color="#94A3B8" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Remember Me & Forgot Password */}
            <View className="flex-row items-center justify-between w-full mt-4 mb-6">
              <TouchableOpacity
                onPress={() => setRememberMe(!rememberMe)}
                className="flex-row items-center"
                activeOpacity={0.8}
              >
                <View
                  className={`w-5 h-5 border rounded mr-3 items-center justify-center ${
                    rememberMe
                      ? "bg-[#3b82f6] border-[#3b82f6]"
                      : "border-slate-300 dark:border-slate-600"
                  }`}
                >
                  {rememberMe && <Feather name="check" size={14} color="white" />}
                </View>
                <Text className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  Remember me
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {}} activeOpacity={0.7}>
                <Text className="text-xs text-blue-600 font-medium">Forgot password?</Text>
              </TouchableOpacity>
            </View>

            {/* Action Sign In Button */}
            <TouchableOpacity
              className={`bg-[#3b82f6] py-4 rounded-2xl items-center justify-center mb-6 ${
                isLoading ? "opacity-75" : ""
              }`}
              disabled={isLoading}
              onPress={handleLogin}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-white font-bold text-sm">Sign in</Text>
              )}
            </TouchableOpacity>

            {/* Footer Link */}
            <View className="items-center mb-8">
              <Text className="text-xs text-slate-500 dark:text-slate-400">
                Don&apos;t have an account?{" "}
                <Text className="text-blue-600 font-bold" onPress={() => router.push("/register")}>
                  Sign up
                </Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
