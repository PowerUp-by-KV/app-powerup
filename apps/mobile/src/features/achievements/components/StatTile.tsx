import React from "react";
import { Pressable, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import Svg, { Path, Circle } from "react-native-svg";
import { useThemeToggle } from "@/hooks/useThemeToggle";

export type TileType = "xp" | "badges" | "accuracy" | "level";

interface StatTileProps {
  type: TileType;
  value: string | number;
  onPress?: () => void;
}

export function StatTile({ type, value, onPress }: StatTileProps) {
  const { isDark } = useThemeToggle();

  const bg = isDark ? "#2A2C3E" : "#F0F4FF";
  const textColorPrimary = isDark ? "#F9FAFB" : "#374151";
  const textColorSecondary = isDark ? "#9CA3AF" : "#4B5563";
  const iconColor = isDark ? "#D1D5DB" : "#4B5563";

  const watermarkColor = isDark ? "#36384C" : "#DEE6FF";

  const renderWatermark = () => {
    switch (type) {
      case "xp":
        return (
          <View style={{ position: "absolute", right: -15, top: -5, opacity: 1 }}>
            <Svg width={120} height={120} viewBox="0 0 100 100">
              <Path
                d="M 60 10 L 68 35 L 94 35 L 73 50 L 81 75 L 60 60 L 39 75 L 47 50 L 26 35 L 52 35 Z"
                fill={watermarkColor}
                transform="rotate(15 60 45) scale(1.1)"
              />
              <Path
                d="M 25 70 L 28 80 L 38 80 L 30 86 L 33 96 L 25 90 L 17 96 L 20 86 L 12 80 L 22 80 Z"
                fill={watermarkColor}
                transform="rotate(-15 25 80)"
              />
              <Path
                d="M 85 80 Q 85 88 93 88 Q 85 88 85 96 Q 85 88 77 88 Q 85 88 85 80 Z"
                fill={watermarkColor}
              />
              <Path
                d="M 35 15 Q 35 22 42 22 Q 35 22 35 29 Q 35 22 28 22 Q 35 22 35 15 Z"
                fill={watermarkColor}
              />
            </Svg>
          </View>
        );
      case "badges":
        return (
          <View style={{ position: "absolute", right: -20, top: -15, opacity: 1 }}>
            <Svg width={140} height={140} viewBox="0 0 100 100">
              <Path d="M 35 50 L 25 90 L 40 80 L 50 90 L 55 50 Z" fill={watermarkColor} />
              <Path d="M 65 50 L 55 90 L 70 80 L 85 90 L 75 50 Z" fill={watermarkColor} />
              <Circle cx="60" cy="45" r="35" fill={watermarkColor} />
              <Circle cx="60" cy="45" r="28" fill={bg} />
              <Circle cx="60" cy="45" r="24" fill={watermarkColor} />
              <Path
                d="M 60 28 L 65 38 L 76 38 L 67 45 L 70 56 L 60 49 L 50 56 L 53 45 L 44 38 L 55 38 Z"
                fill={bg}
              />
            </Svg>
          </View>
        );
      case "accuracy":
        return (
          <View style={{ position: "absolute", right: -30, top: 10, opacity: 1 }}>
            <Svg width={120} height={120} viewBox="0 0 100 100">
              <Circle cx="90" cy="50" r="15" stroke={watermarkColor} strokeWidth="12" fill="none" />
              <Circle cx="90" cy="50" r="40" stroke={watermarkColor} strokeWidth="12" fill="none" />
              <Circle cx="90" cy="50" r="65" stroke={watermarkColor} strokeWidth="12" fill="none" />
              <Circle cx="90" cy="50" r="90" stroke={watermarkColor} strokeWidth="12" fill="none" />
            </Svg>
          </View>
        );
      case "level":
        return (
          <View style={{ position: "absolute", right: -20, bottom: -20, opacity: 1 }}>
            <Svg width={130} height={130} viewBox="0 0 100 100">
              <Path
                d="M 10 90 L 50 50 L 10 10"
                fill="none"
                stroke={watermarkColor}
                strokeWidth="18"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="M 50 90 L 90 50 L 50 10"
                fill="none"
                stroke={watermarkColor}
                strokeWidth="18"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="M 90 90 L 130 50 L 90 10"
                fill="none"
                stroke={watermarkColor}
                strokeWidth="18"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
        );
    }
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        minHeight: 110,
        backgroundColor: bg,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(113, 116, 246, 0.12)",
        overflow: "hidden",
        position: "relative",
        opacity: pressed ? 0.85 : 1,
        shadowColor: isDark ? "#000" : "#7174F6",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.2 : 0.04,
        shadowRadius: 8,
        elevation: 2,
      })}
    >
      {renderWatermark()}

      <View className="flex-1 justify-between relative z-10" style={{ padding: 18 }}>
        {type === "xp" && (
          <>
            <Text
              style={{
                color: textColorSecondary,
                fontWeight: "700",
                fontSize: 15,
                letterSpacing: 0.2,
              }}
            >
              XP Points
            </Text>
            <Text
              style={{
                color: textColorPrimary,
                fontWeight: "800",
                fontSize: 32,
                letterSpacing: -0.5,
              }}
            >
              {value}
            </Text>
          </>
        )}
        {type === "badges" && (
          <>
            <Feather name="award" size={26} color={iconColor} strokeWidth={2.5} />
            <Text style={{ color: textColorSecondary, fontWeight: "700", fontSize: 16 }}>
              Badges
            </Text>
          </>
        )}
        {type === "accuracy" && (
          <>
            <Feather name="target" size={26} color={iconColor} strokeWidth={2.5} />
            <Text style={{ color: textColorSecondary, fontWeight: "700", fontSize: 16 }}>
              Accuracy
            </Text>
          </>
        )}
        {type === "level" && (
          <>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Text
                style={{
                  color: textColorPrimary,
                  fontWeight: "800",
                  fontSize: 26,
                  letterSpacing: -0.5,
                }}
              >
                {value}
              </Text>
              <Feather name="arrow-up-right" size={22} color={iconColor} strokeWidth={3} />
            </View>
            <Text style={{ color: textColorSecondary, fontWeight: "700", fontSize: 16 }}>
              Level
            </Text>
          </>
        )}
      </View>
    </Pressable>
  );
}
