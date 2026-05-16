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

import { getApiErrorMessage, setAuthToken } from "@/services/auth-service";
import { saveAuthSession } from "@/services/auth-storage";
import { useRegisterMutation, AuthResponse } from "@/services/auth-api";

export function RegisterScreen() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
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
      router.replace("/home" as any);
      return;
    }

    router.replace("/dynamic-onboarding");
  };

  const handleRegister = async () => {
    const firstName_value = firstName.trim();
    const lastName_value = lastName.trim();
    const name_value = `${firstName_value} ${lastName_value}`.trim();
    const email_value = email.trim();
    const phoneNumber_value = phoneNumber.trim();
    const password_value = password.trim();
    const confirmPassword_value = confirmPassword.trim();

    if (
      !firstName_value ||
      !lastName_value ||
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

      const regResponse = await register({
        email: email_value,
        phone_number: phoneNumber_value,
        password: password_value,
        name: name_value,
      }).unwrap();

      // Convert AuthRegisterResponse to AuthResponse structure for storage
      // Since it's a new registration, we know profile is not completed
      const auth: AuthResponse = {
        access_token: regResponse.access_token,
        refresh_token: regResponse.refresh_token,
        user: {
          id: regResponse.user_id,
          name: name_value,
          email: email_value,
          phone_number: phoneNumber_value,
        },
      };

      await saveAuthSession(auth);
      setAuthToken(auth.access_token);
      // Alert.alert("Success", "Registration successful.");
      handlePostAuthNavigation(false);
    } catch (error) {
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
              <Text className="text-xl font-bold text-slate-900">Welcome to Powerup</Text>
              <Text className="text-sm text-slate-400 mt-1">
                Join powerup to start your learning journey
              </Text>
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

            {/* Divider */}
            <View className="flex-row items-center my-6 w-full">
              <View className="h-px bg-slate-100 flex-1" />
              <Text className="mx-4 text-sm text-slate-400">or</Text>
              <View className="h-px bg-slate-100 flex-1" />
            </View>

            {/* Form Fields */}
            <View className="space-y-4">
              {/* First Name & Last Name Row */}
              <View className="flex-row justify-between w-full">
                <View className="flex-1 mr-2">
                  <Text className="text-sm font-bold text-slate-700 mb-1.5">First Name</Text>
                  <TextInput
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm"
                    value={firstName}
                    onChangeText={setFirstName}
                    editable={!isLoading}
                  />
                </View>
                <View className="flex-1 ml-2">
                  <Text className="text-sm font-bold text-slate-700 mb-1.5">Last Name</Text>
                  <TextInput
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm"
                    value={lastName}
                    onChangeText={setLastName}
                    editable={!isLoading}
                  />
                </View>
              </View>

              {/* Mobile Number */}
              <View className="w-full mt-3">
                <Text className="text-sm font-bold text-slate-700 mb-1.5">Mobile Number</Text>
                <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-1">
                  <Feather name="phone" size={16} color="#94A3B8" className="mr-3" />
                  <TextInput
                    placeholder="Enter your mobile number"
                    keyboardType="phone-pad"
                    className="flex-1 text-sm text-slate-900 py-2.5"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    editable={!isLoading}
                    placeholderTextColor="#94A3B8"
                  />
                </View>
              </View>

              {/* Email */}
              <View className="w-full mt-3">
                <Text className="text-sm font-bold text-slate-700 mb-1.5">Email</Text>
                <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-1">
                  <Feather name="mail" size={16} color="#94A3B8" className="mr-3" />
                  <TextInput
                    placeholder="your@email.com"
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
                  <Feather name="lock" size={16} color="#94A3B8" className="mr-3" />
                  <TextInput
                    placeholder="Create a strong password"
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

              {/* Confirm Password */}
              <View className="w-full mt-3">
                <Text className="text-sm font-bold text-slate-700 mb-1.5">Confirm Password</Text>
                <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-1">
                  <Feather name="lock" size={16} color="#94A3B8" className="mr-3" />
                  <TextInput
                    placeholder="Enter password"
                    secureTextEntry={!showConfirmPassword}
                    className="flex-1 text-sm text-slate-900 py-2.5"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholderTextColor="#94A3B8"
                    editable={!isLoading}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword((p) => !p)}
                    disabled={isLoading}
                    className="ml-2 py-1"
                  >
                    <Feather
                      name={showConfirmPassword ? "eye-off" : "eye"}
                      size={16}
                      color="#94A3B8"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Terms and Privacy Checkbox */}
              <View className="flex-row items-center w-full mt-5 mb-2">
                <TouchableOpacity
                  onPress={() => setAgreedToTerms(!agreedToTerms)}
                  className={`w-5 h-5 border rounded mr-3 items-center justify-center ${
                    agreedToTerms ? "bg-slate-700 border-slate-700" : "border-slate-300 bg-slate-50"
                  }`}
                >
                  {agreedToTerms && <Feather name="check" size={12} color="white" />}
                </TouchableOpacity>
                <Text className="text-slate-600 text-sm flex-1">
                  I agree to the Terms of Service and Privacy Policy
                </Text>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                className={`rounded-2xl py-3.5 px-16 items-center justify-center self-center mt-3 mb-4 bg-slate-600 shadow-sm ${
                  isLoading ? "opacity-75" : ""
                }`}
                disabled={isLoading}
                onPress={handleRegister}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-white text-sm font-bold">Sign up</Text>
                )}
              </TouchableOpacity>

              {/* Login Link */}
              <View className="items-center mt-1">
                <Text className="text-sm text-slate-500">
                  Already have an account?{" "}
                  <Text className="text-blue-600 font-bold" onPress={() => router.push("/login")}>
                    Log In
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
