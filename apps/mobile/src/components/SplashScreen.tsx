import { restoreSession } from "@/services/auth-service";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Image, Text, TouchableOpacity } from "react-native";

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
        const session = await restoreSession();
        if (session) {
          if (session.profile_completed) {
            router.replace("/(tabs)");
          } else {
            router.replace("/(auth)/profile");
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
            { position: "absolute", top: "35%", alignItems: "center", paddingHorizontal: 30 },
            { opacity: contentOpacity },
          ]}
        >
          <Image
            source={{
              uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT5qRo3DHpnxAUtNwv7575TUVhUZKHqtElokQ&s",
            }}
            className="w-[200px] h-[80px] mb-5"
          />

          <Text className="text-xl text-white font-bold text-center mb-2">
            Welcome to Hexaware Learning
          </Text>

          <Text className="text-gray-400 text-center">
            Build skills, practice speaking, and track your learning progress.
          </Text>
        </Animated.View>
      )}

      {/* Bottom Right Button */}
      {showContent && (
        <Animated.View
          style={[{ position: "absolute", bottom: 10, right: 7 }, { opacity: contentOpacity }]}
        >
          <TouchableOpacity
            className="bg-blue-600 py-3 px-8 rounded-full"
            onPress={() => router.push("/(auth)/login")}
          >
            <Text className="text-white text-base font-bold">Get Started</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </Animated.View>
  );
}
