import React from "react";
import { StyleSheet, View, UIManager } from "react-native";
import Rive from "rive-react-native";
import { useAssets } from "expo-asset";
import { RobotMascot } from "./RobotMascot";

interface RiveMascotProps {
  width?: number;
  height?: number;
}

export function RiveMascot({ width = 200, height = 200 }: RiveMascotProps) {
  const [assets] = useAssets([
    require("../../assets/mascot/5308-11093-cute-interactive-robot.riv"),
  ]);

  // Gracefully fallback to RobotMascot if the native RiveReactNativeView is not compiled/linked (e.g. running in Expo Go)
  const isRiveAvailable = !!UIManager.getViewManagerConfig("RiveReactNativeView");

  if (!isRiveAvailable) {
    return <RobotMascot width={width} height={height} />;
  }

  const asset = assets ? assets[0] : null;

  if (!asset) {
    return <View style={{ width, height }} />;
  }

  return (
    <View style={{ width, height, alignItems: "center", justifyContent: "center" }}>
      <Rive url={asset.localUri || asset.uri} style={{ width, height }} autoplay={true} />
    </View>
  );
}
