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

import { getApiErrorMessage } from "@/utils/error-message";
import {
  saveAuthSession,
  clearProfileCompletedInSession,
  clearCompletedSections,
  clearAssessmentSessionId,
  clearAssessmentStartTime,
  saveLastLoggedInEmail,
  clearPreAssessmentResults,
} from "@/services/auth-storage";
import { AuthResponse, useRegisterMutation } from "@/services/auth-api";
import { onboardingApi } from "@/services/onboarding-api";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\d{10}$/;

function passwordStrength(pw: string): { score: number; label: string; color: string } {
  if (pw.length === 0) return { score: 0, label: "", color: "#e5e7eb" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const labels = ["Weak", "Fair", "Good", "Strong"];
  const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e"];
  return { score, label: labels[score - 1] ?? "Weak", color: colors[score - 1] ?? "#ef4444" };
}

export function RegisterScreen() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [register] = useRegisterMutation();
  const prefetchOnboarding = onboardingApi.usePrefetch("getGroupedQuestions");

  // Prefetch onboarding questions in the background during the registration handshake
  React.useEffect(() => {
    prefetchOnboarding();
  }, [prefetchOnboarding]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const strength = passwordStrength(password);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!firstName.trim() || firstName.trim().length < 2)
      errs.firstName = "First name must be at least 2 characters.";

    if (!lastName.trim()) errs.lastName = "Last name is required.";

    if (!email.trim()) {
      errs.email = "Email is required.";
    } else if (!EMAIL_RE.test(email.trim())) {
      errs.email = "Enter a valid email address (e.g. you@example.com).";
    }

    if (phone.trim() && !PHONE_RE.test(phone.replace(/\s/g, ""))) {
      errs.phone = "Phone must be exactly 10 digits.";
    }

    if (!password) {
      errs.password = "Password is required.";
    } else if (password.length < 8) {
      errs.password = "Password must be at least 8 characters.";
    } else if (strength.score < 2) {
      errs.password = "Password is too weak. Add uppercase letters or numbers.";
    }

    if (password !== confirmPassword) errs.confirmPassword = "Passwords do not match.";

    if (!agreedToTerms) errs.terms = "You must accept the Terms of Service to continue.";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    try {
      setIsLoading(true);
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      const regResponse = await register({
        email: email.trim(),
        phone_number: phone.trim() || "",
        password,
        name: fullName,
      }).unwrap();

      const auth: AuthResponse = {
        access_token: regResponse.access_token,
        refresh_token: regResponse.refresh_token,
        user: {
          id: regResponse.user?.id || regResponse.user_id || "",
          name: fullName,
          email: email.trim(),
          phone_number: phone.trim(),
        },
      };

      await saveAuthSession(auth);
      // Clear any device-local onboarding completion flags and session IDs from a previous user
      await clearProfileCompletedInSession();
      await clearCompletedSections();
      await clearAssessmentSessionId();
      await clearAssessmentStartTime();
      await saveLastLoggedInEmail(email.trim());
      await clearPreAssessmentResults();

      Alert.alert("Success", "Registration successful.");
      router.replace({ pathname: "/verify-email", params: { email: email.trim() } });
    } catch (error: any) {
      const status = error?.status;
      const detail = error?.data?.detail;

      let msg: string;
      if (status === 409) {
        msg = "An account with this email already exists. Please sign in or use a different email.";
      } else if (Array.isArray(detail)) {
        msg = detail.map((e: any) => e.msg).join("\n");
      } else if (typeof detail === "string") {
        msg = detail;
      } else {
        msg = getApiErrorMessage(error, "Registration failed. Please try again.");
      }

      Alert.alert(status === 409 ? "Account already exists" : "Registration failed", msg);
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
              <View className="w-14 h-14 rounded-2xl bg-slate-600 mb-4 items-center justify-center shadow-sm" />
              <Text className="text-2xl font-bold text-slate-900 text-center mb-1">
                Welcome to Powerup
              </Text>
              <Text className="text-xs text-slate-500 text-center mb-6">
                Join powerup to start your learning journey
              </Text>

              {/* Social Login Buttons */}
              <View className="flex-row gap-4 w-full">
                <TouchableOpacity
                  onPress={() => {}}
                  className="flex-1 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex-row items-center justify-center shadow-sm"
                  activeOpacity={0.7}
                >
                  <AntDesign name="google" size={18} color="#DB4437" style={{ marginRight: 8 }} />
                  <Text className="text-slate-800 font-bold text-sm">Google</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {}}
                  className="flex-1 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex-row items-center justify-center shadow-sm"
                  activeOpacity={0.7}
                >
                  <AntDesign name="github" size={18} color="#333333" style={{ marginRight: 8 }} />
                  <Text className="text-slate-800 font-bold text-sm">Github</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* OR Separator */}
            <View className="flex-row items-center mb-6">
              <View className="flex-1 h-px bg-slate-200" />
              <Text className="mx-4 text-xs font-medium text-slate-400">or</Text>
              <View className="flex-1 h-px bg-slate-200" />
            </View>

            {/* Form Fields */}
            {/* First Name & Last Name */}
            <View className="flex-row gap-3 mb-4">
              <View className="flex-1">
                <Text className="text-xs font-bold text-slate-700 mb-1.5">First Name</Text>
                <View
                  className={`bg-slate-50 border rounded-2xl px-4 py-3.5 ${
                    errors.firstName ? "border-red-400" : "border-slate-200"
                  }`}
                >
                  <TextInput
                    placeholder=""
                    className="text-sm text-slate-900"
                    value={firstName}
                    onChangeText={(t) => {
                      setFirstName(t);
                      if (errors.firstName) setErrors((prev) => ({ ...prev, firstName: "" }));
                    }}
                    autoCapitalize="words"
                    editable={!isLoading}
                  />
                </View>
                {!!errors.firstName && (
                  <Text className="text-red-500 text-xs mt-1">{errors.firstName}</Text>
                )}
              </View>

              <View className="flex-1">
                <Text className="text-xs font-bold text-slate-700 mb-1.5">Last Name</Text>
                <View
                  className={`bg-slate-50 border rounded-2xl px-4 py-3.5 ${
                    errors.lastName ? "border-red-400" : "border-slate-200"
                  }`}
                >
                  <TextInput
                    placeholder=""
                    className="text-sm text-slate-900"
                    value={lastName}
                    onChangeText={(t) => {
                      setLastName(t);
                      if (errors.lastName) setErrors((prev) => ({ ...prev, lastName: "" }));
                    }}
                    autoCapitalize="words"
                    editable={!isLoading}
                  />
                </View>
                {!!errors.lastName && (
                  <Text className="text-red-500 text-xs mt-1">{errors.lastName}</Text>
                )}
              </View>
            </View>

            {/* Mobile Number */}
            <View className="mb-4">
              <Text className="text-xs font-bold text-slate-700 mb-1.5">Mobile Number</Text>
              <View
                className={`bg-slate-50 border rounded-2xl px-4 py-3.5 flex-row items-center ${
                  errors.phone ? "border-red-400" : "border-slate-200"
                }`}
              >
                <Feather name="phone" size={16} color="#94A3B8" style={{ marginRight: 8 }} />
                <TextInput
                  placeholder="Enter your mobile number"
                  className="flex-1 text-sm text-slate-900"
                  value={phone}
                  onChangeText={(t) => {
                    setPhone(t);
                    if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
                  }}
                  keyboardType="phone-pad"
                  placeholderTextColor="#94A3B8"
                  editable={!isLoading}
                />
              </View>
              {!!errors.phone && <Text className="text-red-500 text-xs mt-1">{errors.phone}</Text>}
            </View>

            {/* Email */}
            <View className="mb-4">
              <Text className="text-xs font-bold text-slate-700 mb-1.5">Email</Text>
              <View
                className={`bg-slate-50 border rounded-2xl px-4 py-3.5 flex-row items-center ${
                  errors.email ? "border-red-400" : "border-slate-200"
                }`}
              >
                <Feather name="mail" size={16} color="#94A3B8" style={{ marginRight: 8 }} />
                <TextInput
                  placeholder="your@email.com"
                  className="flex-1 text-sm text-slate-900"
                  value={email}
                  onChangeText={(t) => {
                    setEmail(t);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#94A3B8"
                  editable={!isLoading}
                />
              </View>
              {!!errors.email && <Text className="text-red-500 text-xs mt-1">{errors.email}</Text>}
            </View>

            {/* Password */}
            <View className="mb-4">
              <Text className="text-xs font-bold text-slate-700 mb-1.5">Password</Text>
              <View
                className={`bg-slate-50 border rounded-2xl px-4 py-3.5 flex-row items-center ${
                  errors.password ? "border-red-400" : "border-slate-200"
                }`}
              >
                <Feather name="lock" size={16} color="#94A3B8" style={{ marginRight: 8 }} />
                <TextInput
                  placeholder="Create a strong password"
                  className="flex-1 text-sm text-slate-900"
                  value={password}
                  onChangeText={(t) => {
                    setPassword(t);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
                  }}
                  secureTextEntry={!showPassword}
                  placeholderTextColor="#94A3B8"
                  editable={!isLoading}
                />
                <TouchableOpacity onPress={() => setShowPassword((p) => !p)} disabled={isLoading}>
                  <Feather name={showPassword ? "eye-off" : "eye"} size={16} color="#94A3B8" />
                </TouchableOpacity>
              </View>
              {/* Strength indicator */}
              {password.length > 0 && (
                <View className="flex-row items-center mt-2 gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <View
                      key={i}
                      className="h-1 flex-1 rounded-full"
                      style={{ backgroundColor: i <= strength.score ? strength.color : "#e5e7eb" }}
                    />
                  ))}
                  <Text className="text-xs ml-2 font-medium" style={{ color: strength.color }}>
                    {strength.label}
                  </Text>
                </View>
              )}
              {!!errors.password && (
                <Text className="text-red-500 text-xs mt-1">{errors.password}</Text>
              )}
            </View>

            {/* Confirm Password */}
            <View className="mb-6">
              <Text className="text-xs font-bold text-slate-700 mb-1.5">Confirm Password</Text>
              <View
                className={`bg-slate-50 border rounded-2xl px-4 py-3.5 flex-row items-center ${
                  errors.confirmPassword ? "border-red-400" : "border-slate-200"
                }`}
              >
                <Feather name="lock" size={16} color="#94A3B8" style={{ marginRight: 8 }} />
                <TextInput
                  placeholder="Enter password"
                  className="flex-1 text-sm text-slate-900"
                  value={confirmPassword}
                  onChangeText={(t) => {
                    setConfirmPassword(t);
                    if (errors.confirmPassword)
                      setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                  }}
                  secureTextEntry={!showConfirmPassword}
                  placeholderTextColor="#94A3B8"
                  editable={!isLoading}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword((p) => !p)}
                  disabled={isLoading}
                >
                  <Feather
                    name={showConfirmPassword ? "eye-off" : "eye"}
                    size={16}
                    color="#94A3B8"
                  />
                </TouchableOpacity>
              </View>
              {!!errors.confirmPassword && (
                <Text className="text-red-500 text-xs mt-1">{errors.confirmPassword}</Text>
              )}
            </View>

            {/* Terms Checkbox */}
            <View className="mb-6">
              <TouchableOpacity
                onPress={() => {
                  setAgreedToTerms((v) => !v);
                  if (errors.terms) setErrors((prev) => ({ ...prev, terms: "" }));
                }}
                className="flex-row items-center px-1"
                activeOpacity={0.8}
              >
                <View
                  className={`w-5 h-5 border rounded mr-3 items-center justify-center ${
                    agreedToTerms
                      ? "bg-slate-700 border-slate-700"
                      : errors.terms
                        ? "border-red-400"
                        : "border-slate-300"
                  }`}
                >
                  {agreedToTerms && <Feather name="check" size={14} color="white" />}
                </View>
                <Text className="text-slate-600 text-xs font-medium flex-1">
                  I agree to the Terms of Service and Privacy Policy
                </Text>
              </TouchableOpacity>
              {!!errors.terms && (
                <Text className="text-red-500 text-xs mt-1 ml-8">{errors.terms}</Text>
              )}
            </View>

            {/* Action Sign Up Button */}
            <TouchableOpacity
              className={`bg-slate-700 py-4 rounded-2xl items-center justify-center shadow-lg shadow-slate-300 mb-6 ${
                isLoading ? "opacity-75" : ""
              }`}
              disabled={isLoading}
              onPress={handleRegister}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-white font-bold text-sm">Sign up</Text>
              )}
            </TouchableOpacity>

            {/* Footer Link */}
            <View className="items-center mb-8">
              <Text className="text-xs text-slate-500">
                Already have an account?{" "}
                <Text className="text-blue-600 font-bold" onPress={() => router.push("/login")}>
                  Log In
                </Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default RegisterScreen;
