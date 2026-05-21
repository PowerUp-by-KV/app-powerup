import React from "react";
import { View } from "react-native";
import Rive from "rive-react-native";

interface SplashMascotProps {
  width?: number;
  height?: number;
}

export function SplashMascot({ width = 240, height = 240 }: SplashMascotProps) {
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
