import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import Svg, {
  Circle,
  Ellipse,
  Defs,
  LinearGradient,
  Stop,
  Filter,
  FeGaussianBlur,
  G,
} from "react-native-svg";

interface ChatOrbProps {
  size?: number;
  showPause?: boolean;
}

/**
 * Floating Abstract AI Orb
 * - Swirling motion ring layer with gradient
 * - Inner frosted glass core sphere
 * - Depth shadow layer
 * - White pill-shaped eyes
 * - Top-left lighting with right-bottom shadow
 */
export function ChatOrb({ size = 130, showPause = false }: ChatOrbProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.08,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.92,
          duration: 3000,
          useNativeDriver: true,
        }),
      ]),
    );

    const rotateLoop = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 8000,
        useNativeDriver: true,
      }),
    );

    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 3500,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 3500,
          useNativeDriver: true,
        }),
      ]),
    );

    pulseLoop.start();
    rotateLoop.start();
    glowLoop.start();

    return () => {
      pulseLoop.stop();
      rotateLoop.stop();
      glowLoop.stop();
    };
  }, [scaleAnim, rotateAnim, glowAnim]);

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const center = size / 2;
  const ringRadius = center * 0.95;
  const coreRadius = center * 0.75;
  const eyeWidth = size * 0.046; // 6px for 130px
  const eyeHeight = size * 0.138; // 18px for 130px
  const eyeSpacing = size * 0.092; // 12px for 130px
  const eyeLeftX = center - eyeSpacing / 2 - eyeWidth / 2;
  const eyeRightX = center + eyeSpacing / 2 + eyeWidth / 2;
  const eyeY = center - size * 0.08;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Depth shadow layer - Blue glow */}
      <Animated.View
        style={[
          styles.shadowLayer1,
          {
            width: size * 1.6,
            height: size * 1.6,
            borderRadius: (size * 1.6) / 2,
            opacity: glowOpacity,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      />

      {/* Depth shadow layer - Green glow */}
      <Animated.View
        style={[
          styles.shadowLayer2,
          {
            width: size * 1.8,
            height: size * 1.8,
            borderRadius: (size * 1.8) / 2,
            opacity: glowOpacity,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      />

      {/* Main orb container */}
      <Animated.View
        style={[
          styles.orbContainer,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <Defs>
            {/* Swirling motion ring gradient - clockwise flow */}
            <LinearGradient
              id="ringGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
              gradientUnits="objectBoundingBox"
            >
              <Stop offset="0%" stopColor="#4A6CFF" stopOpacity={0.8} />
              <Stop offset="25%" stopColor="#5AC8FA" stopOpacity={0.7} />
              <Stop offset="50%" stopColor="#B7F397" stopOpacity={0.6} />
              <Stop offset="75%" stopColor="#DDFB72" stopOpacity={0.75} />
              <Stop offset="100%" stopColor="#4A6CFF" stopOpacity={0.8} />
            </LinearGradient>

            {/* Inner core frosted glass gradient */}
            <LinearGradient id="coreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.55} />
              <Stop offset="50%" stopColor="#C8F0FF" stopOpacity={0.35} />
              <Stop offset="100%" stopColor="#D2FFDC" stopOpacity={0.3} />
            </LinearGradient>

            {/* Blur filters */}
            <Filter id="ringBlur">
              <FeGaussianBlur in="SourceGraphic" stdDeviation="15" />
            </Filter>

            <Filter id="coreBlur">
              <FeGaussianBlur in="SourceGraphic" stdDeviation="8" />
            </Filter>

            <Filter id="eyeShadow">
              <FeGaussianBlur in="SourceGraphic" stdDeviation="3" />
            </Filter>
          </Defs>

          {/* Swirling motion ring layer - uneven thickness effect */}
          <G
            strokeWidth={size * 0.08}
            stroke="url(#ringGradient)"
            fill="none"
            filter="url(#ringBlur)"
          >
            <Circle cx={center} cy={center} r={ringRadius} opacity={0.5} />
            <Circle cx={center} cy={center} r={ringRadius * 1.08} opacity={0.35} />
            <Circle cx={center} cy={center} r={ringRadius * 0.92} opacity={0.45} />
          </G>

          {/* Inner core frosted glass sphere */}
          <Circle
            cx={center}
            cy={center}
            r={coreRadius}
            fill="url(#coreGradient)"
            opacity={0.7}
            filter="url(#coreBlur)"
          />

          {/* Core highlight (top-left lighting) */}
          <Circle
            cx={center * 0.6}
            cy={center * 0.6}
            r={coreRadius * 0.5}
            fill="#FFFFFF"
            opacity={0.25}
            filter="url(#coreBlur)"
          />

          {/* Left eye - vertical pill shape */}
          <Ellipse
            cx={eyeLeftX}
            cy={eyeY}
            rx={eyeWidth}
            ry={eyeHeight}
            fill="#FFFFFF"
            opacity={0.95}
            filter="url(#eyeShadow)"
          />

          {/* Right eye - vertical pill shape */}
          <Ellipse
            cx={eyeRightX}
            cy={eyeY}
            rx={eyeWidth}
            ry={eyeHeight}
            fill="#FFFFFF"
            opacity={0.95}
            filter="url(#eyeShadow)"
          />

          {/* Eye subtle shadow for depth */}
          <Ellipse
            cx={eyeLeftX + size * 0.01}
            cy={eyeY + size * 0.01}
            rx={eyeWidth}
            ry={eyeHeight}
            fill="#000000"
            opacity={0.08}
          />

          <Ellipse
            cx={eyeRightX + size * 0.01}
            cy={eyeY + size * 0.01}
            rx={eyeWidth}
            ry={eyeHeight}
            fill="#000000"
            opacity={0.08}
          />
        </Svg>

        {/* Pause bars overlay (only on Screen 1) */}
        {showPause && (
          <View style={[styles.pauseOverlay, { width: size, height: size }]}>
            <View style={[styles.pauseBar, { height: size * 0.18 }]} />
            <View style={[styles.pauseBar, { height: size * 0.18 }]} />
          </View>
        )}
      </Animated.View>

      {/* Rotating swirl accent ring (subtle rotation animation) */}
      <Animated.View
        style={[
          styles.rotatingRing,
          {
            width: size * 1.15,
            height: size * 1.15,
            borderRadius: (size * 1.15) / 2,
            transform: [{ rotate: rotation }],
          },
        ]}
      />
    </View>
  );
}

/**
 * Mini orb for chat messages (28–30px).
 * Simplified version of the floating orb.
 */
export function ChatOrbMini({ size = 28 }: { size?: number }) {
  const center = size / 2;
  const coreRadius = center * 0.7;
  const eyeWidth = size * 0.22;
  const eyeHeight = size * 0.57;
  const eyeSpacing = size * 0.28;
  const eyeLeftX = center - eyeSpacing / 2 - eyeWidth / 2;
  const eyeRightX = center + eyeSpacing / 2 + eyeWidth / 2;
  const eyeY = center - size * 0.15;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          <LinearGradient id="coreGradientMini" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.55} />
            <Stop offset="50%" stopColor="#C8F0FF" stopOpacity={0.35} />
            <Stop offset="100%" stopColor="#D2FFDC" stopOpacity={0.3} />
          </LinearGradient>

          <Filter id="coreBlurMini">
            <FeGaussianBlur in="SourceGraphic" stdDeviation="4" />
          </Filter>
        </Defs>

        {/* Core sphere */}
        <Circle
          cx={center}
          cy={center}
          r={coreRadius}
          fill="url(#coreGradientMini)"
          opacity={0.7}
          filter="url(#coreBlurMini)"
        />

        {/* Highlight */}
        <Circle
          cx={center * 0.6}
          cy={center * 0.6}
          r={coreRadius * 0.5}
          fill="#FFFFFF"
          opacity={0.25}
        />

        {/* Left eye */}
        <Ellipse
          cx={eyeLeftX}
          cy={eyeY}
          rx={eyeWidth}
          ry={eyeHeight}
          fill="#FFFFFF"
          opacity={0.95}
        />

        {/* Right eye */}
        <Ellipse
          cx={eyeRightX}
          cy={eyeY}
          rx={eyeWidth}
          ry={eyeHeight}
          fill="#FFFFFF"
          opacity={0.95}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },

  orbContainer: {
    overflow: "hidden",
    backgroundColor: "transparent",
  },

  // Depth shadow layer 1 - Blue glow
  shadowLayer1: {
    position: "absolute",
    backgroundColor: "rgba(74, 108, 255, 0.25)",
    borderRadius: 9999,
    shadowColor: "#4A6CFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 50,
    elevation: 20,
  },

  // Depth shadow layer 2 - Green glow
  shadowLayer2: {
    position: "absolute",
    backgroundColor: "rgba(183, 243, 151, 0.20)",
    borderRadius: 9999,
    shadowColor: "#B7F397",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 70,
    elevation: 15,
  },

  // Rotating ring for motion effect
  rotatingRing: {
    position: "absolute",
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "rgba(74, 108, 255, 0.15)",
    borderRadius: 9999,
  },

  pauseOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  pauseBar: {
    width: 4,
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    borderRadius: 2,
  },
});
