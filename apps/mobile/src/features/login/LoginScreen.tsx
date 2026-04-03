import { useGoogleAuth } from "@/hooks/use-google-auth";
import { clearAuthState, getApiErrorMessage, setAuthToken } from "@/services/auth-service";
import { AuthResponse, saveAuthSession } from "@/services/auth-storage";
import { api } from "@/utils/api";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, ImageBackground, Text, TextInput, TouchableOpacity, View } from "react-native";
import { GoogleLogo } from "@/components/svg";

export function LoginScreen() {
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

    router.replace("/google-success");
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
        router.replace("/login");
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
      style={{ flex: 1 }}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0, 0, 0, 0.4)",
        }}
      >
        <View
          style={{
            width: "85%",
            maxWidth: 400,
            backgroundColor: "white",
            padding: 24,
            borderRadius: 16,
            elevation: 5,
          }}
        >
          <Text
            style={{
              fontSize: 24,
              textAlign: "center",
              marginBottom: 16,
              fontWeight: "bold",
              color: "#1F2937",
            }}
          >
            Login
          </Text>

          <TextInput
            placeholder="Email"
            style={{
              borderWidth: 1,
              borderColor: "#D1D5DB",
              paddingHorizontal: 12,
              paddingVertical: 12,
              borderRadius: 8,
              marginBottom: 12,
              color: "#1F2937",
              fontSize: 16,
            }}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#999"
          />

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              borderWidth: 1,
              borderColor: "#D1D5DB",
              borderRadius: 8,
              marginBottom: 12,
              paddingRight: 8,
            }}
          >
            <TextInput
              placeholder="Password"
              secureTextEntry={!showPassword}
              style={{
                flex: 1,
                paddingHorizontal: 12,
                paddingVertical: 12,
                fontSize: 16,
                color: "#1F2937",
              }}
              value={password}
              onChangeText={setPassword}
              placeholderTextColor="#999"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 8 }}>
              <Text style={{ fontSize: 18 }}>{showPassword ? "👁️" : "👁️‍🗨️"}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}
            onPress={() => setRememberMe((prev) => !prev)}
          >
            <View
              style={{
                width: 20,
                height: 20,
                borderWidth: 1,
                borderColor: rememberMe ? "#4F46E5" : "#4B5563",
                borderRadius: 4,
                justifyContent: "center",
                alignItems: "center",
                marginRight: 8,
                backgroundColor: rememberMe ? "#4F46E5" : "transparent",
              }}
            >
              {rememberMe && (
                <Text style={{ color: "white", fontSize: 12, fontWeight: "bold" }}>✓</Text>
              )}
            </View>
            <Text style={{ fontSize: 16, color: "#374151" }}>Remember me</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: "#4F46E5",
              paddingVertical: 12,
              borderRadius: 8,
              alignItems: "center",
              opacity: isLoading ? 0.7 : 1,
            }}
            disabled={isLoading}
            onPress={handleLogin}
          >
            <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>
              Login{isLoading ? "..." : ""}
            </Text>
          </TouchableOpacity>

          <Text style={{ textAlign: "center", marginVertical: 12, color: "#4B5563" }}>OR</Text>

          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: "#D1D5DB",
              paddingVertical: 12,
              borderRadius: 8,
              marginBottom: 8,
              opacity: isLoading || isAuthenticating || !request ? 0.5 : 1,
            }}
            onPress={handleGoogleLogin}
            disabled={isLoading || isAuthenticating || !request}
          >
            <View style={{ marginRight: 8 }}>
              <GoogleLogo width={22} height={22} />
            </View>
            <Text style={{ fontSize: 16, color: "#1F2937" }}>
              Continue with Google{isAuthenticating ? "..." : ""}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/register")}>
            <Text style={{ marginTop: 16, textAlign: "center", color: "#3B82F6", fontSize: 14 }}>
              Don{"'"}t have an Account? Sign up
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}
