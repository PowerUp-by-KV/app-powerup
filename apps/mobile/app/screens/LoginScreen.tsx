import { useGoogleAuth } from "@/hooks/use-google-auth";
import {
  clearAuthState,
  getApiErrorMessage,
  setAuthToken,
} from "@/services/auth-service";
import { AuthResponse, saveAuthSession } from "@/services/auth-storage";
import { api } from "@/utils/api";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { GoogleLogo } from "../../src/components/svg";

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

    router.replace("/(auth)/profile");
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
      if (
        (error as { response?: { status?: number } })?.response?.status === 401
      ) {
        await clearAuthState();
        router.replace("/(auth)/login");
        return;
      }

      Alert.alert(
        "Login Failed",
        getApiErrorMessage(
          error,
          "Unable to login right now. Please try again.",
        ),
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
        Alert.alert(
          "Google Login Failed",
          "Google did not return an ID token for backend login.",
        );
        return;
      }

      const response = await api.post<AuthResponse>("/auth/login", {
        email: oauthEmail,
        oauth_id_token: result.oauth.oauth_id_token,
      });

      await persistAuthAndNavigate(response.data);
    } catch (error) {
      if (
        (error as { response?: { status?: number } })?.response?.status === 401
      ) {
        await clearAuthState();
        router.replace("/(auth)/login");
        return;
      }

      Alert.alert(
        "Google Login Failed",
        getApiErrorMessage(
          error,
          "Unable to login with Google right now. Please try again.",
        ),
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
      style={styles.background}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Login</Text>

          <TextInput
            placeholder="Email"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="Password"
              secureTextEntry={!showPassword}
              style={styles.passwordInput}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Text style={styles.eyeText}>{showPassword ? "👁️" : "👁️‍🗨️"}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.rememberRow}
            onPress={() => setRememberMe((prev) => !prev)}
          >
            <View
              style={[styles.checkbox, rememberMe && styles.checkboxChecked]}
            >
              {rememberMe && <Text style={styles.checkboxTick}>✓</Text>}
            </View>
            <Text style={styles.rememberText}>Remember me</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginBtn, isLoading && styles.disabledBtn]}
            disabled={isLoading}
            onPress={handleLogin}
          >
            <Text style={styles.btnText}>Login{isLoading ? "..." : ""}</Text>
          </TouchableOpacity>

          <Text style={styles.or}>OR</Text>

          <TouchableOpacity
            style={styles.oauthBtn}
            onPress={handleGoogleLogin}
            disabled={isLoading || isAuthenticating || !request}
          >
            <View style={{ marginRight: 10 }}>
              <GoogleLogo width={22} height={22} />
            </View>
            <Text style={styles.oauthText}>
              Continue with Google{isAuthenticating ? "..." : ""}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
            <Text style={styles.link}>Don{"'"}t have an Account? Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  card: {
    width: "85%",
    maxWidth: 400,
    backgroundColor: "#fff",
    padding: 25,
    borderRadius: 14,
  },
  title: {
    fontSize: 28,
    textAlign: "center",
    marginBottom: 15,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 12,
    paddingRight: 10,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 8,
  },
  eyeText: {
    fontSize: 18,
  },
  rememberRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: "#888",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: "#4F46E5",
    borderColor: "#4F46E5",
  },
  checkboxTick: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  rememberText: {
    fontSize: 15,
  },
  loginBtn: {
    backgroundColor: "#4F46E5",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  disabledBtn: {
    opacity: 0.7,
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
  },
  or: {
    textAlign: "center",
    marginVertical: 12,
    color: "#333",
  },
  oauthBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  oauthIcon: {
    width: 22,
    height: 22,
    marginRight: 10,
  },
  oauthText: {
    fontSize: 15,
  },
  link: {
    marginTop: 15,
    textAlign: "center",
    color: "blue",
  },
});
