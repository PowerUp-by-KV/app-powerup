import React from "react";
import { StyleSheet, View, UIManager } from "react-native";
import Rive from "rive-react-native";
import { RobotMascot } from "./RobotMascot";

interface RiveMascotProps {
  width?: number;
  height?: number;
}

export function RiveMascot({ width = 200, height = 200 }: RiveMascotProps) {
  // Gracefully fallback to RobotMascot if the native RiveReactNativeView is not compiled/linked (e.g. running in Expo Go)
  const isRiveAvailable = !!UIManager.getViewManagerConfig("RiveReactNativeView");

  if (!isRiveAvailable) {
    return <RobotMascot width={width} height={height} />;
  }

  return (
    <View style={{ width, height, alignItems: "center", justifyContent: "center" }}>
      <Rive
        url="https://public.rive.app/community/runtime-files/2195-4346-avatar-demo.riv"
        style={{ width, height }}
        autoplay={true}
      />
    </View>
  );
}
