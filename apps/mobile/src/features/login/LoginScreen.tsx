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
import { AuthResponse, saveAuthSession } from "@/services/auth-storage";

export function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [login] = useLoginMutation();

  const handlePostAuthNavigation = (profileCompleted: boolean) => {
    if (profileCompleted) {
      router.replace("/home");
    } else {
      router.replace("/dynamic-onboarding");
    }
  };

  const persistAuthAndNavigate = async (auth: AuthResponse) => {
    await saveAuthSession(auth);
    setAuthToken(auth.access_token);
    handlePostAuthNavigation(auth.profile_completed);
  };

  const handleLogin = async () => {
    const email_value = email.trim();
    const phone_value = phoneNumber.trim();
    const identifier_value = identifier.trim();
    const password_value = password.trim();
    const normalizedPhone = phone_value.replace(/[\s\-()]/g, "");

    // Validate password is required
    if (!password_value) {
      Alert.alert("Error", "Password is required");
      return;
    }

    const filledIdentifiers = [email_value, phone_value, identifier_value].filter(Boolean).length;

    if (filledIdentifiers === 0) {
      Alert.alert("Error", "Please enter email, phone number, or username/ID");
      return;
    }

    // Choose one identifier deterministically to keep requests valid for backend contract.
    const identifierType = email_value ? "email" : phone_value ? "phone_number" : "identifier";

    if (identifierType === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email_value)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    if (identifierType === "phone_number" && !/^\+?\d{7,15}$/.test(normalizedPhone)) {
      Alert.alert("Error", "Please enter a valid phone number");
      return;
    }

    try {
      setIsLoading(true);

      const payload: LoginRequest = {
        password: password_value,
        remember_me: rememberMe,
      };

      if (identifierType === "email") {
        payload.email = email_value.toLowerCase();
      } else if (identifierType === "phone_number") {
        payload.phone_number = normalizedPhone;
      } else {
        payload.identifier = identifier_value;
      }

      console.log("Login payload:", payload);

      const response = await login(payload).unwrap();

      console.log("Login response:", response);
      Alert.alert("Success", "Login successful");
      await persistAuthAndNavigate(response);
    } catch (error) {
      console.error("Login error:", error);
      const apiError = error as { status?: number; data?: { message?: string } };
      if (apiError?.status === 401) {
        await clearAuthState();
        Alert.alert("Error", "Invalid credentials");
        router.replace("/login");
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
          contentContainerStyle={{ alignItems: "center", paddingBottom: 50 }}
          style={{ flex: 1 }}
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

            <View className="space-y-4">
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
                <Feather name="phone" size={20} color="#94A3B8" className="mr-3" />
                <TextInput
                  placeholder="Your phone number"
                  keyboardType="phone-pad"
                  className="flex-1 text-base text-slate-900"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholderTextColor="#94A3B8"
                  editable={!isLoading}
                />
              </View>

              <View className="flex-row items-center border-b-2 border-gray-200 py-2">
                <Feather name="user" size={20} color="#94A3B8" className="mr-3" />
                <TextInput
                  placeholder="Username or ID"
                  className="flex-1 text-base text-slate-900"
                  value={identifier}
                  onChangeText={setIdentifier}
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

            <View className="flex-row items-center justify-between my-6">
              <View className="flex-row items-center">
                <TouchableOpacity
                  onPress={() => setRememberMe(!rememberMe)}
                  className="w-4 h-4 border border-slate-300 rounded-sm items-center justify-center mr-2"
                >
                  {rememberMe && <View className="w-2 h-2 bg-indigo-600" />}
                </TouchableOpacity>
                <Text className="text-slate-600">Remember me</Text>
              </View>
              <TouchableOpacity onPress={() => {}}>
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
                Don&apos;t have an account?{" "}
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

            <TouchableOpacity
              onPress={() => {}}
              className="rounded-full py-4 items-center justify-center border-2 border-slate-300 mt-3 flex-row"
            >
              <AntDesign name="google" size={18} color="#DB4437" className="mr-3" />
              <Text className="text-slate-800 text-base font-bold">Sign in with Google</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {}}
              className="rounded-full py-4 items-center justify-center border-2 border-slate-300 mt-3 flex-row"
            >
              <AntDesign name="github" size={18} color="#333" className="mr-3" />
              <Text className="text-slate-800 text-base font-bold">Sign in with GitHub</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
