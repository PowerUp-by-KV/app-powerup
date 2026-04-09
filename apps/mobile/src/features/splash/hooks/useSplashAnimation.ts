import { useRef } from "react";
import { Animated } from "react-native";

export function useSplashAnimation() {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  return {
    scaleAnim,
    opacityAnim,
  };
}
