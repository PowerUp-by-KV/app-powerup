import { useGoogleAuth } from "@/hooks/use-google-auth";
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

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert("Error", "Enter email and password");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      if (rememberMe) {
        router.replace("/(tabs)/dashboard");
      } else {
        router.replace("/(auth)/profile");
      }
      setIsLoading(false);
    }, 300);
  };

  const handleGoogleLogin = async () => {
    const result = await authenticateWithGoogle();

    if (result.status === "success") {
      router.replace("/(tabs)");
      return;
    }

    if (result.status === "error") {
      Alert.alert("Google Login Failed", result.message);
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
