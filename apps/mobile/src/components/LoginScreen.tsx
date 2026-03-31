import { useGoogleAuth } from "@/hooks/use-google-auth";
import { clearAuthState, getApiErrorMessage, setAuthToken } from "@/services/auth-service";
import { AuthResponse, saveAuthSession } from "@/services/auth-storage";
import { api } from "@/utils/api";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, ImageBackground, Text, TextInput, TouchableOpacity, View } from "react-native";
import { GoogleLogo } from "@/components/svg";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { request, isAuthenticating, authenticateWithGoogle } = useGoogleAuth();

  const handlePostAuthNavigation = (profileCompleted: boolean) => {
    if (profileCompleted) {
      router.replace("/(tabs)");
      return;
    }

    router.replace("/(auth)/google-success");
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

      const response = await api.post<AuthResponse>("/auth/login", {
        email: email.trim(),
        password,
        remember_me: rememberMe,
      });

      await persistAuthAndNavigate(response.data);
    } catch (error) {
      if ((error as { response?: { status?: number } })?.response?.status === 401) {
        await clearAuthState();
        router.replace("/(auth)/login");
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

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      const result = await authenticateWithGoogle();

      if (result.status === "error") {
        Alert.alert("Google Login Failed", result.message);
        return;
      }

      if (result.status !== "success") {
        return;
      }

      const oauthEmail = result.oauth.email ?? email.trim();

      if (!oauthEmail) {
        Alert.alert(
          "Google Login Failed",
          "Unable to resolve email from Google account. Enter your email and try again.",
        );
        return;
      }

      if (!result.oauth.oauth_id_token) {
        Alert.alert("Google Login Failed", "Google did not return an ID token for backend login.");
        return;
      }

      const response = await api.post<AuthResponse>("/auth/login", {
        email: oauthEmail,
        oauth_id_token: result.oauth.oauth_id_token,
      });

      await persistAuthAndNavigate(response.data);
    } catch (error) {
      if ((error as { response?: { status?: number } })?.response?.status === 401) {
        await clearAuthState();
        router.replace("/(auth)/login");
        return;
      }

      Alert.alert(
        "Google Login Failed",
        getApiErrorMessage(error, "Unable to login with Google right now. Please try again."),
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ImageBackground
      source={{
        uri: "https://images.unsplash.com/photo-1508780709619-79562169bc64",
      }}
      className="flex-1"
    >
      <View className="flex-1 justify-center items-center bg-black/40">
        <View className="w-[85%] max-w-[400px] bg-white p-6 rounded-2xl shadow-lg">
          <Text className="text-2xl text-center mb-4 font-bold text-gray-800">Login</Text>

          <TextInput
            placeholder="Email"
            className="border border-gray-300 px-3 py-3 rounded-lg mb-3 text-gray-800"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#999"
          />

          <View className="flex-row items-center border border-gray-300 rounded-lg mb-3 pr-2">
            <TextInput
              placeholder="Password"
              secureTextEntry={!showPassword}
              className="flex-1 px-3 py-3 text-base text-gray-800"
              value={password}
              onChangeText={setPassword}
              placeholderTextColor="#999"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="p-2">
              <Text className="text-lg">{showPassword ? "👁️" : "👁️‍🗨️"}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            className="flex-row items-center mb-3"
            onPress={() => setRememberMe((prev) => !prev)}
          >
            <View
              className={`w-5 h-5 border rounded justify-center items-center mr-2 ${
                rememberMe ? "bg-indigo-600 border-indigo-600" : "border-gray-600"
              }`}
            >
              {rememberMe && <Text className="text-white text-sm font-bold">✓</Text>}
            </View>
            <Text className="text-base text-gray-700">Remember me</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`bg-indigo-600 py-3 rounded-lg items-center ${
              isLoading ? "opacity-70" : ""
            }`}
            disabled={isLoading}
            onPress={handleLogin}
          >
            <Text className="text-white font-bold">Login{isLoading ? "..." : ""}</Text>
          </TouchableOpacity>

          <Text className="text-center my-3 text-gray-600">OR</Text>

          <TouchableOpacity
            className="flex-row items-center justify-center border border-gray-300 py-3 rounded-lg mb-2"
            onPress={handleGoogleLogin}
            disabled={isLoading || isAuthenticating || !request}
          >
            <View className="mr-2">
              <GoogleLogo width={22} height={22} />
            </View>
            <Text className="text-base text-gray-800">
              Continue with Google{isAuthenticating ? "..." : ""}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
            <Text className="mt-4 text-center text-blue-500">
              Don{"'"}t have an Account? Sign up
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}
