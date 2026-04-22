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

import { setAuthToken } from "@/services/auth-service";
import { saveAuthSession } from "@/services/auth-storage";
import { useRegisterMutation } from "@/services/auth-api";

export function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [register] = useRegisterMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handlePostAuthNavigation = (profileCompleted: boolean) => {
    if (profileCompleted) {
      router.replace("/dashboard");
      return;
    }

    router.replace("/success?mode=register");
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

      const auth = await register({
        email: email_value,
        password: password_value,
        confirm_password: confirmPassword_value,
        remember_me: true,
      }).unwrap();

      await saveAuthSession(auth);
      setAuthToken(auth.access_token);
      Alert.alert("Success", "Registration successful.");
      handlePostAuthNavigation(auth.profile_completed);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      Alert.alert("Registration Failed", errorMessage);
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
              <Text className="text-3xl font-extrabold text-slate-900">Create Account</Text>
              <Text className="text-base text-slate-500 mt-2">
                Join us to start your learning journey
              </Text>
            </View>

            <View className="space-y-6">
              <View className="flex-row items-center border-b-2 border-gray-200 py-2">
                <Feather name="phone" size={20} color="#94A3B8" className="mr-3" />
                <TextInput
                  placeholder="Enter your mobile number"
                  keyboardType="phone-pad"
                  className="flex-1 text-base text-slate-900"
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
                <Text className="text-white text-base font-bold">Sign Up</Text>
              )}
            </TouchableOpacity>

            <View className="items-center mt-4">
              <Text className="text-sm text-slate-500">
                Already have an account?{" "}
                <Text className="text-indigo-600 font-bold" onPress={() => router.push("/login")}>
                  Sign In
                </Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
