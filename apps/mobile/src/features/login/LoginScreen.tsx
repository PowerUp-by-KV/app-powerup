import React, { useState } from "react";
import { Alert, SafeAreaView, Text, TextInput, TouchableOpacity, View } from "react-native";

import { useRouter } from "expo-router";

import { clearAuthState, getApiErrorMessage, setAuthToken } from "@/services/auth-service";
import { AuthResponse, saveAuthSession } from "@/services/auth-storage";
import { useLoginMutation } from "@/services/auth-api";

export function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [login] = useLoginMutation();

  const handlePostAuthNavigation = (profileCompleted: boolean) => {
    if (profileCompleted) {
      router.replace("/dashboard");
      return;
    }
    // route to OTP verify flow before final success
    router.push("/otp");
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
      const apiError = error as { response?: { status?: number } };
      if (apiError?.response?.status === 401) {
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

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-center items-center px-6">
        <View className="w-full max-w-[360px]">
          <View className="items-center mb-6">
            <View className="w-16 h-16 rounded-2xl bg-gray-400 mb-6 shadow" />
            <Text className="text-2xl font-extrabold text-center text-slate-900">Welcome Back</Text>
            <Text className="text-sm text-center text-slate-500 mt-2">
              Sign in to continue your learning
            </Text>
          </View>

          <View className="bg-white p-0">
            <View className="mb-4">
              <View className="border border-slate-200 rounded-full flex-row items-center px-4 py-3">
                <Text className="text-slate-400 mr-3">📧</Text>
                <TextInput
                  placeholder="your@email.com"
                  keyboardType="email-address"
                  className="flex-1 text-base text-slate-900"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  placeholderTextColor="#94A3B8"
                  editable={!isLoading}
                />
              </View>
            </View>

            <View className="mb-3">
              <View className="border border-slate-200 rounded-full flex-row items-center px-4 py-3">
                <Text className="text-slate-400 mr-3">🔒</Text>
                <TextInput
                  placeholder="Password"
                  secureTextEntry={!showPassword}
                  className="flex-1 text-base text-slate-900"
                  value={password}
                  onChangeText={setPassword}
                  placeholderTextColor="#94A3B8"
                  editable={!isLoading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword((p) => !p)}
                  disabled={isLoading}
                  className="ml-2"
                >
                  <Text className="text-slate-500">{showPassword ? "Hide" : "Show"}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View className="flex-row items-center justify-between mb-6">
              <View className="flex-row items-center">
                <TouchableOpacity
                  onPress={() => {}}
                  className="w-4 h-4 border border-slate-300 rounded-sm items-center justify-center mr-2"
                >
                  <View />
                </TouchableOpacity>
                <Text className="text-slate-600">Remember me</Text>
              </View>
              <TouchableOpacity
                onPress={() =>
                  Alert.alert("Forgot Password", "Password reset is not implemented yet.")
                }
              >
                <Text className="text-indigo-600">Forgot password?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              className={`rounded-full py-4 items-center mb-4 bg-gray-700 ${isLoading ? "opacity-75" : ""}`}
              disabled={isLoading}
              onPress={handleLogin}
            >
              <Text className="text-white text-base font-bold">
                {isLoading ? "Signing in..." : "Sign In"}
              </Text>
            </TouchableOpacity>

            <View className="items-center mt-2">
              <Text className="text-sm text-slate-500">
                Don’t have an account?{" "}
                <Text
                  className="text-indigo-600 font-bold"
                  onPress={() => router.push("/register")}
                >
                  Sign Up
                </Text>
              </Text>
            </View>

            <TouchableOpacity onPress={() => router.push("/otp")} className="items-center mt-6">
              <Text className="text-sm underline font-semibold">Login with OTP</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
