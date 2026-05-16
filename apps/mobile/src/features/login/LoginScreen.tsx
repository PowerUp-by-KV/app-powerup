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

import { Feather, AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { LoginRequest, useLoginMutation } from "@/services/auth-api";
import { clearAuthState, getApiErrorMessage, setAuthToken } from "@/services/auth-service";
import { AuthResponse, saveAuthSession, getAuthSession } from "@/services/auth-storage";

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
      router.replace("/home" as any);
    } else {
      router.replace("/dynamic-onboarding");
    }
  };

  const persistAuthAndNavigate = async (auth: AuthResponse) => {
    await saveAuthSession(auth);
    setAuthToken(auth.access_token);

    // After saving, get the normalized session which has profile_completed set
    const session = await getAuthSession();
    handlePostAuthNavigation(session?.profile_completed ?? false);
  };

  const handleLogin = async () => {
    const email_value = email.trim();
    const password_value = password.trim();

    if (!email_value) {
      Alert.alert("Error", "Email is required");
      return;
    }

    if (!password_value) {
      Alert.alert("Error", "Password is required");
      return;
    }

    try {
      setIsLoading(true);

      const payload: LoginRequest = {
        password: password_value,
        remember_me: rememberMe,
      };

      // Determine if the input is an email or a generic identifier/username
      if (email_value.includes("@")) {
        payload.email = email_value.toLowerCase();
      } else {
        payload.identifier = email_value;
      }

      const response = await login(payload).unwrap();

      // Alert.alert("Success", "Login successful");
      await persistAuthAndNavigate(response);
    } catch (error) {
      const apiError = error as { status?: number; data?: { message?: string } };
      if (apiError?.status === 401) {
        await clearAuthState();
        Alert.alert("Error", "Invalid credentials");
        return;
      }

      const errorMessage =
        apiError?.data?.message ||
        getApiErrorMessage(error, "Unable to login right now. Please try again.");
      Alert.alert("Login Failed", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            alignItems: "center",
            paddingBottom: 60,
            paddingTop: Platform.OS === "android" ? 48 : 16,
          }}
          style={{ flex: 1 }}
          className="px-6"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="w-full max-w-md py-8">
            {/* Top Logo Placeholder */}
            <View className="items-center mb-6">
              <View className="w-14 h-14 rounded-2xl bg-slate-500 mb-3 shadow-sm" />
              <Text className="text-2xl font-bold text-slate-900">Welcome Back</Text>
              <Text className="text-sm text-slate-400 mt-1">Sign in to continue your learning</Text>
            </View>

            {/* OAuth Buttons */}
            <View className="flex-row justify-between w-full mt-2">
              <TouchableOpacity className="flex-1 flex-row items-center justify-center bg-white border border-slate-200 rounded-xl py-3.5 shadow-sm mr-2">
                <AntDesign name="google" size={18} color="#DB4437" className="mr-2" />
                <Text className="text-slate-700 font-bold text-sm">Google</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 flex-row items-center justify-center bg-white border border-slate-200 rounded-xl py-3.5 shadow-sm ml-2">
                <AntDesign name="github" size={18} color="#333" className="mr-2" />
                <Text className="text-slate-700 font-bold text-sm">Github</Text>
              </TouchableOpacity>
            </View>

            {/* Login with OTP Link */}
            <TouchableOpacity
              onPress={() => router.push("/otp")}
              className="mt-5 mb-2 items-center"
            >
              <Text className="text-sm font-bold text-slate-800 underline">Login with OTP</Text>
            </TouchableOpacity>

            {/* Divider */}
            <View className="flex-row items-center my-4 w-full">
              <View className="h-px bg-slate-100 flex-1" />
              <Text className="mx-4 text-sm text-slate-400">or</Text>
              <View className="h-px bg-slate-100 flex-1" />
            </View>

            {/* Form Fields */}
            <View className="space-y-4 w-full">
              {/* Email */}
              <View className="w-full">
                <Text className="text-sm font-bold text-slate-700 mb-1.5">Email</Text>
                <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-1">
                  <Feather name="mail" size={16} color="#94A3B8" className="mr-3" />
                  <TextInput
                    placeholder="Your@email.com"
                    keyboardType="email-address"
                    className="flex-1 text-sm text-slate-900 py-2.5"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    placeholderTextColor="#94A3B8"
                    editable={!isLoading}
                  />
                </View>
              </View>

              {/* Password */}
              <View className="w-full mt-3">
                <Text className="text-sm font-bold text-slate-700 mb-1.5">Password</Text>
                <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-1">
                  <TextInput
                    placeholder="Enter your password"
                    secureTextEntry={!showPassword}
                    className="flex-1 text-sm text-slate-900 py-2.5"
                    value={password}
                    onChangeText={setPassword}
                    placeholderTextColor="#94A3B8"
                    editable={!isLoading}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword((p) => !p)}
                    disabled={isLoading}
                    className="ml-2 py-1"
                  >
                    <Feather name={showPassword ? "eye-off" : "eye"} size={16} color="#94A3B8" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Options row: Remember me & Forgot password? */}
              <View className="flex-row items-center justify-between w-full mt-5 mb-2">
                <TouchableOpacity
                  onPress={() => setRememberMe(!rememberMe)}
                  className="flex-row items-center"
                >
                  <View
                    className={`w-5 h-5 rounded mr-3 items-center justify-center ${
                      rememberMe ? "bg-slate-400" : "bg-slate-200"
                    }`}
                  >
                    {rememberMe && <Feather name="check" size={12} color="white" />}
                  </View>
                  <Text className="text-sm font-bold text-slate-600">Remember me</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {}}>
                  <Text className="text-sm text-blue-500 font-medium">Forgot password?</Text>
                </TouchableOpacity>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                className={`rounded-2xl py-3.5 px-16 items-center justify-center self-center mt-3 mb-4 bg-slate-600 shadow-sm ${
                  isLoading ? "opacity-75" : ""
                }`}
                disabled={isLoading}
                onPress={handleLogin}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-white text-sm font-bold">Sign in</Text>
                )}
              </TouchableOpacity>

              {/* Sign up Link */}
              <View className="items-center mt-1">
                <Text className="text-sm text-slate-500">
                  Don&apos;t have an account?{" "}
                  <Text
                    className="text-blue-600 font-bold"
                    onPress={() => router.push("/register")}
                  >
                    Sign up
                  </Text>
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
