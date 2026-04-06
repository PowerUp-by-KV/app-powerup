import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Svg, { Path } from "react-native-svg";
import { COLORS } from "@/constants/theme";

const { width } = Dimensions.get("window");

const PathConnector = ({ startPos, endPos, isFilled }) => {
  const color = isFilled ? COLORS.success : COLORS.lightGray;

  // Calculate control points for a smooth curve
  // Calculate control points for a smooth S-curve
  const controlPointY1 = startPos.y + (endPos.y - startPos.y) * 0.5;
  const controlPointY2 = startPos.y + (endPos.y - startPos.y) * 0.5;

  const pathData = `M${startPos.x},${startPos.y} C${startPos.x},${controlPointY1} ${endPos.x},${controlPointY2} ${endPos.x},${endPos.y}`;

  return (
    <View style={[StyleSheet.absoluteFill, { pointerEvents: "none" }]}>
      <Svg height="100%" width="100%">
        <Path d={pathData} stroke={color} strokeWidth={8} fill="none" strokeLinecap="round" />
        {/* Progress indicator gradient could be added here */}
      </Svg>
    </View>
  );
};

export default PathConnector;
