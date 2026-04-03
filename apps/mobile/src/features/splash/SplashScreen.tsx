import { restoreSession } from "@/services/auth-service";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Image, Text, TouchableOpacity, View } from "react-native";

export function SplashScreen() {
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const bgAnim = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(1)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const checkAuthAndNavigate = async () => {
      try {
        const session = await restoreSession();
        if (session) {
          if (session.profile_completed) {
            router.replace("/(tabs)");
          } else {
            router.replace("/profile");
          }
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
          duration: 600,
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
    <Animated.View
      style={[
        { flex: 1, justifyContent: "center", alignItems: "center" },
        { backgroundColor: bgColor },
      ]}
    >
      {/* Initial Text */}
      {!showContent && (
        <Animated.Text
          style={[
            { fontSize: 28, fontWeight: "bold", color: "#3D5AFE", letterSpacing: 2 },
            { opacity: textOpacity },
          ]}
        >
          HEXAWARE
        </Animated.Text>
      )}

      {/* Expanding Circle */}
      <Animated.View
        style={[
          {
            position: "absolute",
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: "#3D5AFE",
          },
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      />

      {/* Center Content */}
      {showContent && (
        <Animated.View
          style={[
            {
              position: "absolute",
              top: "40%",
              alignItems: "center",
              paddingHorizontal: 30,
              width: "100%",
            },
            { opacity: contentOpacity },
          ]}
        >
          <Image
            source={{
              uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT5qRo3DHpnxAUtNwv7575TUVhUZKHqtElokQ&s",
            }}
            style={{
              width: 200,
              height: 80,
              marginBottom: 20,
              resizeMode: "contain",
            }}
          />

          <Text
            style={{
              fontSize: 18,
              fontWeight: "bold",
              color: "#FFFFFF",
              textAlign: "center",
              marginBottom: 12,
            }}
          >
            Welcome to Hexaware Learning
          </Text>

          <Text style={{ fontSize: 14, color: "#A0AEC0", textAlign: "center" }}>
            Build skills, practice speaking, and track your learning progress.
          </Text>
        </Animated.View>
      )}

      {/* Bottom Right Button */}
      {showContent && (
        <Animated.View
          style={[
            { position: "absolute", bottom: 30, right: 20, width: "auto" },
            { opacity: contentOpacity },
          ]}
        >
          <TouchableOpacity
            style={{
              backgroundColor: "#2563EB",
              paddingVertical: 12,
              paddingHorizontal: 24,
              borderRadius: 24,
            }}
            onPress={() => router.push("/login")}
          >
            <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "bold" }}>Get Started</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </Animated.View>
  );
}
