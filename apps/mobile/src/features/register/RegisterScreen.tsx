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
import { saveAuthSession } from "@/services/auth-storage";
import { AuthResponse, useRegisterMutation } from "@/services/auth-api";

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
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [register] = useRegisterMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const strength = passwordStrength(password);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!name.trim() || name.trim().length < 2)
      errs.name = "Full name must be at least 2 characters.";

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
      const regResponse = await register({
        email: email.trim(),
        phone_number: phone.trim() || "",
        password,
        name: name.trim(),
      }).unwrap();

      const auth: AuthResponse = {
        access_token: regResponse.access_token,
        refresh_token: regResponse.refresh_token,
        user: {
          id: regResponse.user_id,
          name: name.trim(),
          email: email.trim(),
          phone_number: phone.trim(),
        },
      };

      await saveAuthSession(auth);
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

  const Field = ({
    icon,
    placeholder,
    value,
    onChangeText,
    keyboardType,
    autoCapitalize,
    secureTextEntry,
    toggle,
    errorKey,
    editable = true,
  }: any) => (
    <View className="mb-4">
      <View
        className={`flex-row items-center border-b-2 py-2 ${errors[errorKey] ? "border-red-400" : "border-gray-200"}`}
      >
        <Feather
          name={icon}
          size={20}
          color={errors[errorKey] ? "#f87171" : "#94A3B8"}
          style={{ marginRight: 8 }}
        />
        <TextInput
          placeholder={placeholder}
          className="flex-1 text-base text-slate-900"
          value={value}
          onChangeText={(t) => {
            onChangeText(t);
            if (errors[errorKey]) setErrors((prev) => ({ ...prev, [errorKey]: "" }));
          }}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize ?? "none"}
          secureTextEntry={secureTextEntry}
          placeholderTextColor="#94A3B8"
          editable={editable && !isLoading}
        />
        {toggle}
      </View>
      {!!errors[errorKey] && <Text className="text-red-500 text-xs mt-1">{errors[errorKey]}</Text>}
    </View>
  );

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
          <View className="w-full max-w-sm py-8">
            {/* Header */}
            <View className="items-center mb-8">
              <View className="w-20 h-20 rounded-2xl bg-gray-200 mb-6 shadow-md" />
              <Text className="text-3xl font-extrabold text-slate-900">Create Account</Text>
              <Text className="text-base text-slate-500 mt-2">
                Join us to start your learning journey
              </Text>
            </View>

            {/* Name */}
            <Field
              icon="user"
              placeholder="Full name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              errorKey="name"
            />

            {/* Email */}
            <Field
              icon="mail"
              placeholder="your@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              errorKey="email"
            />

            {/* Phone — optional */}
            <Field
              icon="phone"
              placeholder="Mobile number (optional, 10 digits)"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              errorKey="phone"
            />

            {/* Password */}
            <View className="mb-4">
              <View
                className={`flex-row items-center border-b-2 py-2 ${errors.password ? "border-red-400" : "border-gray-200"}`}
              >
                <Feather
                  name="lock"
                  size={20}
                  color={errors.password ? "#f87171" : "#94A3B8"}
                  style={{ marginRight: 8 }}
                />
                <TextInput
                  placeholder="Create a strong password"
                  className="flex-1 text-base text-slate-900"
                  value={password}
                  onChangeText={(t) => {
                    setPassword(t);
                    if (errors.password) setErrors((p) => ({ ...p, password: "" }));
                  }}
                  secureTextEntry={!showPassword}
                  placeholderTextColor="#94A3B8"
                  editable={!isLoading}
                />
                <TouchableOpacity onPress={() => setShowPassword((p) => !p)} disabled={isLoading}>
                  <Feather name={showPassword ? "eye-off" : "eye"} size={20} color="#94A3B8" />
                </TouchableOpacity>
              </View>
              {/* Strength bar */}
              {password.length > 0 && (
                <View className="flex-row items-center mt-2 gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <View
                      key={i}
                      className="h-1 flex-1 rounded-full"
                      style={{ backgroundColor: i <= strength.score ? strength.color : "#e5e7eb" }}
                    />
                  ))}
                  <Text className="text-xs ml-2" style={{ color: strength.color }}>
                    {strength.label}
                  </Text>
                </View>
              )}
              {!!errors.password && (
                <Text className="text-red-500 text-xs mt-1">{errors.password}</Text>
              )}
              {!errors.password && (
                <Text className="text-gray-400 text-xs mt-1">
                  8+ chars, uppercase, number, symbol = Strong
                </Text>
              )}
            </View>

            {/* Confirm Password */}
            <Field
              icon="lock"
              placeholder="Confirm password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              errorKey="confirmPassword"
              toggle={
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword((p) => !p)}
                  disabled={isLoading}
                >
                  <Feather
                    name={showConfirmPassword ? "eye-off" : "eye"}
                    size={20}
                    color="#94A3B8"
                  />
                </TouchableOpacity>
              }
            />

            {/* Terms */}
            <View className="mb-6">
              <TouchableOpacity
                onPress={() => {
                  setAgreedToTerms((v) => !v);
                  if (errors.terms) setErrors((p) => ({ ...p, terms: "" }));
                }}
                className="flex-row items-center"
              >
                <View
                  className={`w-6 h-6 border-2 rounded-md mr-3 items-center justify-center ${
                    agreedToTerms
                      ? "bg-indigo-600 border-indigo-600"
                      : errors.terms
                        ? "border-red-400"
                        : "border-slate-300"
                  }`}
                >
                  {agreedToTerms && <Feather name="check" size={16} color="white" />}
                </View>
                <Text className="text-slate-600 text-sm flex-1">
                  I agree to the Terms of Service and Privacy Policy
                </Text>
              </TouchableOpacity>
              {!!errors.terms && (
                <Text className="text-red-500 text-xs mt-1 ml-9">{errors.terms}</Text>
              )}
            </View>

            {/* Submit */}
            <TouchableOpacity
              className={`rounded-full py-4 items-center justify-center mb-4 bg-gray-800 ${isLoading ? "opacity-75" : ""}`}
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
                <Text className="text-indigo-600 font-bold" onPress={() => router.push("/login")}>
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
              onPress={() => {}}
              className="rounded-full py-4 items-center justify-center border-2 border-slate-300 mt-3 flex-row"
            >
              <AntDesign name="google" size={18} color="#DB4437" style={{ marginRight: 8 }} />
              <Text className="text-slate-800 text-base font-bold">Sign up with Google</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default RegisterScreen;
