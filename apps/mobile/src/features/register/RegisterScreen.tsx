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
import { useRouter, type Href } from "expo-router";

import { getApiErrorMessage, setAuthToken } from "@/services/auth-service";
import { saveAuthSession } from "@/services/auth-storage";
import { useRegisterMutation } from "@/services/auth-api";

export function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [register] = useRegisterMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handlePostAuthNavigation = (profileCompleted: boolean) => {
    if (profileCompleted) {
      router.replace("/dashboard" as Href);
      return;
    }

    router.replace("/dynamic-onboarding" as Href);
  };

  const handleRegister = async () => {
    const name_value = name.trim();
    const email_value = email.trim();
    const phoneNumber_value = phoneNumber.trim();
    const password_value = password.trim();
    const confirmPassword_value = confirmPassword.trim();

    if (
      !name_value ||
      !email_value ||
      !phoneNumber_value ||
      !password_value ||
      !confirmPassword_value
    ) {
      Alert.alert("Error", "All fields are required");
      return;
    }

    if (name_value.length < 2) {
      Alert.alert("Error", "Name must be at least 2 characters");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email_value)) {
      Alert.alert("Error", "Please enter a valid email");
      return;
    }

    if (!/^\+?[\d\s\-\(\)]{10,}$/.test(phoneNumber_value)) {
      Alert.alert("Error", "Please enter a valid phone number");
      return;
    }

    if (password_value.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters");
      return;
    }

    if (password_value !== confirmPassword_value) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (!agreedToTerms) {
      Alert.alert("Error", "You must agree to the Terms of Service and Privacy Policy");
      return;
    }

    try {
      setIsLoading(true);

      const auth = await register({
        email: email_value,
        phone_number: phoneNumber_value,
        password: password_value,
        name: name_value,
      }).unwrap();

      await saveAuthSession(auth);
      setAuthToken(auth.access_token);
      Alert.alert("Success", "Registration successful.");
      handlePostAuthNavigation(auth.profile_completed);
    } catch (error) {
      console.error("Registration error:", error);
      const apiError = error as { status?: number; data?: { message?: string; detail?: any } };

      let errorMessage: string | undefined;

      // Handle FastAPI validation error format (array of details)
      if (Array.isArray(apiError?.data?.detail)) {
        errorMessage = apiError.data.detail.map((err: any) => err.msg).join("\n");
      } else if (typeof apiError?.data?.detail === "string") {
        errorMessage = apiError.data.detail;
      } else if (apiError?.data?.message) {
        errorMessage = apiError.data.message;
      }

      if (!errorMessage) {
        errorMessage = getApiErrorMessage(error, "Unable to register right now. Please try again.");
      }

      if (apiError?.status === 409) {
        Alert.alert(
          "Registration Failed",
          errorMessage || "An account with this email or phone number already exists.",
        );
      } else {
        Alert.alert("Registration Failed", errorMessage);
      }
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
              <Text className="text-3xl font-extrabold text-slate-900">Create Account</Text>
              <Text className="text-base text-slate-500 mt-2">
                Join us to start your learning journey
              </Text>
            </View>

            <View className="space-y-6">
              <View className="flex-row items-center border-b-2 border-gray-200 py-2">
                <Feather name="user" size={20} color="#94A3B8" className="mr-3" />
                <TextInput
                  placeholder="Full name"
                  className="flex-1 text-base text-slate-900"
                  value={name}
                  onChangeText={setName}
                  editable={!isLoading}
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View className="flex-row items-center border-b-2 border-gray-200 py-2">
                <Feather name="phone" size={20} color="#94A3B8" className="mr-3" />
                <TextInput
                  placeholder="Enter your mobile number"
                  keyboardType="phone-pad"
                  className="flex-1 text-base text-slate-900"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  editable={!isLoading}
                  placeholderTextColor="#94A3B8"
                />
              </View>

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
                  placeholder="Create a strong password"
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

              <View className="flex-row items-center border-b-2 border-gray-200 py-2">
                <Feather name="lock" size={20} color="#94A3B8" className="mr-3" />
                <TextInput
                  placeholder="Confirm password"
                  secureTextEntry={!showConfirmPassword}
                  className="flex-1 text-base text-slate-900"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholderTextColor="#94A3B8"
                  editable={!isLoading}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword((p) => !p)}
                  disabled={isLoading}
                  className="ml-2"
                >
                  <Feather
                    name={showConfirmPassword ? "eye-off" : "eye"}
                    size={20}
                    color="#94A3B8"
                  />
                </TouchableOpacity>
              </View>

              <View className="flex-row items-center my-6">
                <TouchableOpacity
                  onPress={() => setAgreedToTerms(!agreedToTerms)}
                  className={`w-6 h-6 border-2 rounded-md mr-3 flex items-center justify-center ${
                    agreedToTerms ? "bg-indigo-600 border-indigo-600" : "border-slate-300"
                  }`}
                >
                  {agreedToTerms && <Feather name="check" size={16} color="white" />}
                </TouchableOpacity>
                <Text className="text-slate-600 text-sm flex-1">
                  I agree to the{" "}
                  <Text className="text-indigo-600 font-semibold">Terms of Service</Text> and{" "}
                  <Text className="text-indigo-600 font-semibold">Privacy Policy</Text>
                </Text>
              </View>

              <TouchableOpacity
                className={`rounded-full py-4 items-center justify-center mb-4 bg-gray-800 ${
                  isLoading ? "opacity-75" : ""
                }`}
                disabled={isLoading}
                onPress={handleRegister}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-white text-base font-bold">Create Account</Text>
                )}
              </TouchableOpacity>

              <View className="items-center mt-2">
                <Text className="text-sm text-slate-500">
                  Already have an account?{" "}
                  <Text
                    className="text-indigo-600 font-bold"
                    onPress={() => router.push("/login" as Href)}
                  >
                    Sign In
                  </Text>
                </Text>
              </View>

              <View className="relative flex-row justify-center items-center my-6">
                <View className="h-px bg-slate-200 flex-1" />
                <Text className="mx-4 text-slate-400">OR</Text>
                <View className="h-px bg-slate-200 flex-1" />
              </View>

              <TouchableOpacity
                onPress={() => router.push("/otp" as Href)}
                className="rounded-full py-4 items-center justify-center border-2 border-slate-300"
              >
                <Text className="text-slate-800 text-base font-bold">Sign up with OTP</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {}}
                className="rounded-full py-4 items-center justify-center border-2 border-slate-300 mt-3 flex-row"
              >
                <AntDesign name="google" size={18} color="#DB4437" className="mr-3" />
                <Text className="text-slate-800 text-base font-bold">Sign up with Google</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {}}
                className="rounded-full py-4 items-center justify-center border-2 border-slate-300 mt-3 flex-row"
              >
                <AntDesign name="github" size={18} color="#333" className="mr-3" />
                <Text className="text-slate-800 text-base font-bold">Sign up with GitHub</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
