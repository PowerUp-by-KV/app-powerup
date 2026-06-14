import React, { useEffect, useRef } from "react";
import { View, Animated, Easing } from "react-native";

interface RobotMascotProps {
  width?: number;
  height?: number;
}

export function RobotMascot({ width = 240, height = 240 }: RobotMascotProps) {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -8,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [rotateAnim, floatAnim]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={{ width, height, alignItems: "center", justifyContent: "center" }}>
      {/* Background glow */}
      <View className="absolute w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl" />

      {/* Orbit Rings */}
      <Animated.View
        style={{ transform: [{ rotate }] }}
        className="absolute w-44 h-44 rounded-full border-2 border-transparent border-t-indigo-400 border-b-cyan-400 opacity-60"
      />

      {/* Floating Robot */}
      <Animated.View style={{ transform: [{ translateY: floatAnim }] }} className="items-center">
        {/* Propeller */}
        <View className="items-center mb-[-5px] z-0">
          <View className="w-16 h-1.5 bg-indigo-300 rounded-full" />
          <View className="w-1.5 h-6 bg-indigo-500" />
        </View>

        {/* Head */}
        <View className="w-28 h-20 bg-indigo-500 rounded-[30px] justify-center items-center shadow-xl z-10">
          {/* Ears */}
          <View className="absolute left-[-12] w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-r-[12px] border-r-indigo-500" />
          <View className="absolute right-[-12] w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-l-[12px] border-l-indigo-500" />

          {/* Face Display */}
          <View className="w-22 h-14 bg-[#0a0f25] rounded-full flex-row justify-center items-center px-3 border-2 border-indigo-600 overflow-hidden">
            {/* Eyes */}
            <View className="flex-row items-center justify-between w-14">
              <View className="w-5 h-5 rounded-full bg-cyan-400 shadow-cyan-400" />
              <View className="w-3 h-3 rounded-full bg-cyan-400 shadow-cyan-400" />
            </View>

            {/* Happy Tongue */}
            <View className="absolute bottom-[-6px] w-4 h-4 bg-rose-500 rounded-full" />
          </View>
        </View>

        {/* Neck */}
        <View className="w-4 h-2 bg-indigo-700 z-0" />

        {/* Body */}
        <View className="w-20 h-16 bg-indigo-500 rounded-[20px] items-center justify-center z-10 shadow-lg">
          <View className="w-10 h-8 bg-[#0a0f25] rounded-full border border-indigo-600 opacity-80" />
        </View>

        {/* Floating Base */}
        <View className="w-12 h-3 bg-indigo-600 rounded-full mt-[-8px] z-0 shadow-md" />
      </Animated.View>
    </View>
  );
}
