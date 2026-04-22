import React, { useState } from "react";
import { Alert, SafeAreaView, Text, TextInput, TouchableOpacity, View } from "react-native";

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
      <View className="flex-1 justify-center items-center px-6">
        <View className="w-full max-w-[360px]">
          <View className="items-center mb-6">
            <View className="w-16 h-16 rounded-2xl bg-gray-400 mb-6 shadow" />
            <Text className="text-xl font-extrabold text-center text-slate-900">
              Welcome to Powerup
            </Text>
            <Text className="text-sm text-center text-slate-500 mt-2">
              Join powerup to start your learning journey
            </Text>
          </View>

          <View>
            <View className="mb-3">
              <Text className="text-xs text-slate-600 mb-2">Mobile Number</Text>
              <View className="border border-slate-200 rounded-full flex-row items-center px-4 py-3">
                <Text className="text-slate-400 mr-3">📞</Text>
                <TextInput
                  placeholder="Enter your mobile number"
                  keyboardType="phone-pad"
                  className="flex-1 text-base text-slate-900"
                  editable={!isLoading}
                />
              </View>
            </View>

            <View className="mb-3">
              <Text className="text-xs text-slate-600 mb-2">Email</Text>
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
              <Text className="text-xs text-slate-600 mb-2">Password</Text>
              <View className="border border-slate-200 rounded-full flex-row items-center px-4 py-3">
                <Text className="text-slate-400 mr-3">🔒</Text>
                <TextInput
                  placeholder="create a strong password"
                  secureTextEntry
                  className="flex-1 text-base text-slate-900"
                  value={password}
                  onChangeText={setPassword}
                  placeholderTextColor="#94A3B8"
                  editable={!isLoading}
                />
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-xs text-slate-600 mb-2">Confirm Password</Text>
              <View className="border border-slate-200 rounded-full flex-row items-center px-4 py-3">
                <Text className="text-slate-400 mr-3">🔒</Text>
                <TextInput
                  placeholder="Enter password"
                  secureTextEntry
                  className="flex-1 text-base text-slate-900"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholderTextColor="#94A3B8"
                  editable={!isLoading}
                />
              </View>
            </View>

            <View className="flex-row items-center mb-6">
              <TouchableOpacity
                onPress={() => {}}
                className="w-4 h-4 border border-slate-300 rounded-sm items-center justify-center mr-3"
              >
                <View />
              </TouchableOpacity>
              <Text className="text-slate-600 text-sm">
                I agree to the Terms of Service and Privacy Policy
              </Text>
            </View>

            <TouchableOpacity
              className={`rounded-full py-4 items-center mb-4 bg-gray-700 ${isLoading ? "opacity-75" : ""}`}
              disabled={isLoading}
              onPress={handleRegister}
            >
              <Text className="text-white text-base font-bold">
                {isLoading ? "Creating Account..." : "Register"}
              </Text>
            </TouchableOpacity>

            <View className="items-center mt-2">
              <Text className="text-sm text-slate-500">
                Already have an account?{" "}
                <Text className="text-indigo-600 font-bold" onPress={() => router.push("/login")}>
                  Sign In
                </Text>
              </Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
