import { Text, View } from "react-native";
import { SimpleLineIcons } from "@expo/vector-icons";
import { useThemeToggle } from "@/hooks/useThemeToggle";

interface WeeklyStreakProps {
  // Optional bool[7] starting Monday. Falls back to a single-day fill at today's index.
  days?: boolean[];
  fallbackTodayIndex?: number;
}

const LABELS = ["M", "T", "W", "T", "F", "S", "S"];

export function WeeklyStreak({ days, fallbackTodayIndex }: WeeklyStreakProps) {
  const { isDark } = useThemeToggle();
  const today = fallbackTodayIndex ?? mondayIndexFromDate(new Date());
  const filled = days ?? Array.from({ length: 7 }, (_, i) => i <= today);

  return (
    <View
      style={{
        backgroundColor: isDark ? "#16161c" : "#ffffff",
        borderWidth: 1,
        borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#f1f5f9",
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
      }}
    >
      <Text
        style={{
          color: isDark ? "#ffffff" : "#0f172a",
          fontSize: 16,
          fontWeight: "700",
          marginBottom: 16,
          textAlign: "center",
        }}
      >
        Weekly Streak
      </Text>
      <View style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 4 }}>
        {LABELS.map((label, i) => {
          const active = filled[i];

          return (
            <View key={i} style={{ alignItems: "center" }}>
              {active ? (
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: "#3b82f6",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 6,
                  }}
                >
                  <SimpleLineIcons name="fire" size={20} color="#ffffff" />
                </View>
              ) : (
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: isDark ? "#1d1d26" : "#e2f9cc",
                    borderWidth: isDark ? 1 : 0,
                    borderColor: isDark ? "#2b2b38" : "transparent",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 6,
                  }}
                />
              )}
              <Text
                style={{
                  color: isDark ? "#64748b" : "#94a3b8",
                  fontSize: 12,
                  fontWeight: "600",
                }}
              >
                {label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function mondayIndexFromDate(d: Date): number {
  const js = d.getDay();
  return js === 0 ? 6 : js - 1;
}
