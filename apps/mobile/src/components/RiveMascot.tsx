import React from "react";
import { StyleSheet, View } from "react-native";
import Rive from "rive-react-native";

interface RiveMascotProps {
  width?: number;
  height?: number;
}

export function RiveMascot({ width = 200, height = 200 }: RiveMascotProps) {
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
