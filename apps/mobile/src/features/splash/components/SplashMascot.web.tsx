import React, { useRef } from "react";
import { View } from "react-native";
import LottieView from "lottie-react-native";
import companyEmployees from "../../../../assets/mascot/company-employees.json";

interface SplashMascotProps {
  width?: number;
  height?: number;
}

export function SplashMascot({ width = 240, height = 240 }: SplashMascotProps) {
  const lottieRef = useRef<LottieView>(null);

  return (
    <View style={{ width, height, alignItems: "center", justifyContent: "center" }}>
      <LottieView
        ref={lottieRef}
        source={companyEmployees}
        autoPlay
        loop
        style={{ width, height }}
      />
    </View>
  );
}
