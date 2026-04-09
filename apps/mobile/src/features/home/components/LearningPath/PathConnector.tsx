import React from "react";
import { View } from "react-native";
import Svg, { Path } from "react-native-svg";

export const PathConnector = ({
  startPos,
  endPos,
  isFilled,
}: {
  startPos: any;
  endPos: any;
  isFilled: boolean;
}) => {
  const color = isFilled ? "#10B981" : "#E2E8F0";

  // Calculate control points for a smooth S-curve
  const controlPointY1 = startPos.y + (endPos.y - startPos.y) * 0.5;
  const controlPointY2 = startPos.y + (endPos.y - startPos.y) * 0.5;

  const pathData = `M${startPos.x},${startPos.y} C${startPos.x},${controlPointY1} ${endPos.x},${controlPointY2} ${endPos.x},${endPos.y}`;

  return (
    <View className="absolute inset-0 pointer-events-none">
      <Svg height="100%" width="100%">
        <Path d={pathData} stroke={color} strokeWidth={8} fill="none" strokeLinecap="round" />
      </Svg>
    </View>
  );
};
