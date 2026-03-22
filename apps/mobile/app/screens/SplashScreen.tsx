import React, { useEffect, useRef, useState } from "react";
import {
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SplashScreen() {
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const bgAnim = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(1)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const checkAuthAndNavigate = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (token) {
          // User is already logged in, skip splash
          router.replace("/");
          return;
        }
      } catch (error) {
        console.error("Auth check error:", error);
      }

      // Continue with animation if not logged in
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),

        Animated.timing(textOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),

        Animated.timing(bgAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: false,
        }),
      ]).start(() => {
        setShowContent(true);

        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }).start();
      });
    };

    checkAuthAndNavigate();
  }, [scaleAnim, bgAnim, textOpacity, contentOpacity, router]);

  const bgColor = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#ffffff", "#05071A"],
  });

  return (
    <Animated.View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Initial Text */}
      {!showContent && (
        <Animated.Text style={[styles.initialText, { opacity: textOpacity }]}>
          HEXAWARE
        </Animated.Text>
      )}

      {/* Expanding Circle */}
      <Animated.View
        style={[
          styles.circle,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      />

      {/* Center Content */}
      {showContent && (
        <Animated.View style={[styles.centerContent, { opacity: contentOpacity }]}>
          <Image
            source={{
              uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT5qRo3DHpnxAUtNwv7575TUVhUZKHqtElokQ&s",
            }}
            style={styles.logo}
          />

          <Text style={styles.title}>Welcome to Hexaware Learning</Text>

          <Text style={styles.subtitle}>
            Build skills, practice speaking, and track your learning progress.
          </Text>
        </Animated.View>
      )}

      {/* Bottom Right Button */}
      {showContent && (
        <Animated.View style={[styles.buttonWrapper, { opacity: contentOpacity }]}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push("/(auth)/login")}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  initialText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#3D5AFE",
    letterSpacing: 2,
  },

  circle: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#3D5AFE",
  },

  centerContent: {
    position: "absolute",
    top: "35%",
    alignItems: "center",
    paddingHorizontal: 30,
  },

  logo: {
    width: 200,
    height: 80,
    marginBottom: 20,
  },

  title: {
    fontSize: 22,
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },

  subtitle: {
    color: "#9CA3AF",
    textAlign: "center",
  },

  buttonWrapper: {
    position: "absolute",
    bottom: 40,
    right: 30,
  },

  button: {
    backgroundColor: "#3D5AFE",
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 30,
  },

  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
