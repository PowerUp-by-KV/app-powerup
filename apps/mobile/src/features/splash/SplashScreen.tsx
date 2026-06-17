/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef } from "react";
import { View, Text, Animated } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Svg, {
  Circle,
  Path,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
} from "react-native-svg";

export function SplashScreen() {
  const router = useRouter();

  // Animation drivers
  const logoScale = useRef(new Animated.Value(0.85)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const sparkScale = useRef(new Animated.Value(0)).current;
  const sparkRotation = useRef(new Animated.Value(0)).current;
  const splashOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 1. Cinematic entrance timeline
    Animated.parallel([
      // Logo zoom and fade-in
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 1600,
        useNativeDriver: true,
      }),
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 1600,
        useNativeDriver: true,
      }),
      // Pinch diamond spark spring scale and rotation
      Animated.sequence([
        Animated.delay(700),
        Animated.parallel([
          Animated.spring(sparkScale, {
            toValue: 1,
            friction: 7,
            tension: 20,
            useNativeDriver: true,
          }),
          Animated.timing(sparkRotation, {
            toValue: 1,
            duration: 1400,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start();

    // 2. Seamless automatic redirect with cinematic fade out ONLY if going to login
    const transitionTimer = setTimeout(async () => {
      const { getAuthSession } = await import("@/services/auth-storage");
      const session = await getAuthSession();
      if (!session) {
        Animated.parallel([
          Animated.timing(splashOpacity, {
            toValue: 0,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(logoScale, {
            toValue: 1.12,
            duration: 900,
            useNativeDriver: true,
          }),
        ]).start(() => {
          router.replace("/login");
        });
      }
    }, 4000);

    return () => clearTimeout(transitionTimer);
  }, []);

  // Spin interpolation: 0 -> 1 maps to 0deg -> 45deg
  const spin = sparkRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "45deg"],
  });

  return (
    <Animated.View style={{ flex: 1, opacity: splashOpacity }}>
      {/* Pastel Gradient Backdrop matching your mockup */}
      <LinearGradient
        colors={["#e0e7ff", "#ffffff", "#fef9c3"]}
        style={{
          flex: 1,
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Animated.View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            transform: [{ scale: logoScale }],
            opacity: logoOpacity,
          }}
        >
          {/* Lumino "lumin" lettering */}
          <Text
            style={{
              fontSize: 52,
              fontFamily: "Inter-Bold",
              color: "#3b82f6",
              letterSpacing: -2,
              marginRight: 2,
            }}
          >
            lumin
          </Text>

          {/* Stylized vector circular "o" frame */}
          <View
            style={{
              width: 52,
              height: 52,
              justifyContent: "center",
              alignItems: "center",
              marginTop: 4,
            }}
          >
            <Svg width={46} height={46} viewBox="0 0 48 48" fill="none">
              <Defs>
                <SvgLinearGradient id="gradientO" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor="#86efac" />
                  <Stop offset="50%" stopColor="#22d3ee" />
                  <Stop offset="100%" stopColor="#3b82f6" />
                </SvgLinearGradient>
              </Defs>
              <Circle cx="24" cy="24" r="22" fill="url(#gradientO)" />
            </Svg>

            {/* Pinch Diamond Spark overlay */}
            <Animated.View
              style={{
                position: "absolute",
                transform: [{ scale: sparkScale }, { rotate: spin }],
              }}
            >
              <Svg width={46} height={46} viewBox="0 0 48 48" fill="none">
                <Path
                  d="M24 10 C24 17, 17 24, 10 24 C17 24, 24 31, 24 38 C24 31, 31 24, 38 24 C31 24, 24 17, 24 10 Z"
                  fill="#ffffff"
                />
              </Svg>
            </Animated.View>
          </View>
        </Animated.View>
      </LinearGradient>
    </Animated.View>
  );
}
