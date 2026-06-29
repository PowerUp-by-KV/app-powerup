import { Text, View } from "react-native";
import { SimpleLineIcons } from "@expo/vector-icons";

interface WeeklyStreakProps {
  // Optional bool[7] starting Monday. Falls back to a single-day fill at today's index.
  days?: boolean[];
  fallbackTodayIndex?: number;
}

const LABELS = ["M", "T", "W", "T", "F", "S", "S"];

export function WeeklyStreak({ days, fallbackTodayIndex }: WeeklyStreakProps) {
  const today = fallbackTodayIndex ?? mondayIndexFromDate(new Date());
  const filled = days ?? Array.from({ length: 7 }, (_, i) => i <= today);

  return (
    <View className="bg-white dark:bg-[#16161c] border border-slate-100 dark:border-slate-800/80 rounded-[24px] p-5 mb-4 shadow-sm shadow-slate-100 dark:shadow-none">
      <Text className="text-slate-900 dark:text-white text-base font-bold mb-4 text-center">
        Weekly Streak
      </Text>
      <View className="flex-row justify-between px-1">
        {LABELS.map((label, i) => {
          const active = filled[i];
          return (
            <View key={i} className="items-center">
              {active ? (
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mb-1.5"
                  style={{
                    backgroundColor: "#3b82f6",
                  }}
                >
                  <SimpleLineIcons name="fire" size={20} color="#ffffff" />
                </View>
              ) : (
                <View className="w-10 h-10 rounded-full bg-[#e2f9cc] dark:bg-[#1d1d26] border border-transparent dark:border-[#2b2b38] items-center justify-center mb-1.5" />
              )}
              <Text className="text-slate-400 dark:text-slate-500 text-xs font-semibold">
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
