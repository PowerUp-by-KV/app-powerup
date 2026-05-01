import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { clearAuthState, getApiErrorMessage, setAuthToken } from "@/services/auth-service";
import { AuthResponse, saveAuthSession } from "@/services/auth-storage";
import { useLoginMutation } from "@/services/auth-api";

export function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
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
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center" }}
          className="px-6"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="w-full max-w-sm py-8">
            <View className="items-center mb-8">
              <View className="w-20 h-20 rounded-2xl bg-gray-200 mb-6 shadow-md" />
              <Text className="text-3xl font-extrabold text-slate-900">Welcome Back</Text>
              <Text className="text-base text-slate-500 mt-2">
                Sign in to continue your learning
              </Text>
            </View>

            <View className="space-y-6">
              <View className="flex-row items-center border-b-2 border-gray-200 py-2">
                <Feather name="mail" size={20} color="#94A3B8" className="mr-3" />
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

              <View className="flex-row items-center border-b-2 border-gray-200 py-2">
                <Feather name="lock" size={20} color="#94A3B8" className="mr-3" />
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
                  <Feather name={showPassword ? "eye-off" : "eye"} size={20} color="#94A3B8" />
                </TouchableOpacity>
              </View>
            </View>

            <View className="flex-row items-center justify-between mb-6">
              <View className="flex-row items-center">
                <TouchableOpacity
                  onPress={() => setRememberMe(!rememberMe)}
                  className="w-4 h-4 border border-slate-300 rounded-sm items-center justify-center mr-2"
                >
                  {rememberMe && <View className="w-2 h-2 bg-indigo-600" />}
                </TouchableOpacity>
                <Text className="text-slate-600">Remember me</Text>
              </View>
              <TouchableOpacity onPress={() => router.push("/register")}>
                <Text className="text-indigo-600">Forgot password?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              className={`rounded-full py-4 items-center justify-center mb-4 bg-gray-800 ${
                isLoading ? "opacity-75" : ""
              }`}
              disabled={isLoading}
              onPress={handleLogin}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-white text-base font-bold">Sign In</Text>
              )}
            </TouchableOpacity>

            <View className="items-center mt-2">
              <Text className="text-sm text-slate-500">
                Don't have an account?{" "}
                <Text
                  className="text-indigo-600 font-bold"
                  onPress={() => router.push("/register")}
                >
                  Sign up
                </Text>
              </Text>
            </View>

            <View className="relative flex-row justify-center items-center my-6">
              <View className="h-px bg-slate-200 flex-1" />
              <Text className="mx-4 text-slate-400">OR</Text>
              <View className="h-px bg-slate-200 flex-1" />
            </View>

            <TouchableOpacity
              onPress={() => router.push("/otp")}
              className="rounded-full py-4 items-center justify-center border-2 border-slate-300"
            >
              <Text className="text-slate-800 text-base font-bold">Login with OTP</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
