import React from "react";
import { View, UIManager } from "react-native";
import Rive from "rive-react-native";
import { RobotMascot } from "@/components/RobotMascot";

interface SplashMascotProps {
  width?: number;
  height?: number;
}

export function SplashMascot({ width = 240, height = 240 }: SplashMascotProps) {
  // Gracefully fallback to RobotMascot if the native RiveReactNativeView is not compiled/linked (e.g. running in Expo Go)
  const isRiveAvailable = !!UIManager.getViewManagerConfig("RiveReactNativeView");

  if (!isRiveAvailable) {
    return <RobotMascot width={width} height={height} />;
  }

  return (
    <View style={{ width, height, alignItems: "center", justifyContent: "center" }}>
      <Rive
        url="https://public.rive.app/community/runtime-files/2195-4346-avatar-demo.riv"
        autoplay
        style={{ width, height }}
      />
    </View>
  );
}
