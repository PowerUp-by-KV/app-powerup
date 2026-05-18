import { View, Text, Pressable } from "react-native";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AttemptCardProps {
  score: number | null;
  date: string; // ISO date string
  status: "in_progress" | "completed";
  onPress: () => void;
}

// ---------------------------------------------------------------------------
// Sub-component: CheckCircleIcon
// ---------------------------------------------------------------------------

function CheckCircleIcon() {
  return (
    <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center">
      <View className="w-6 h-6 rounded-full border-2 border-blue-500 items-center justify-center">
        <View
          style={{
            width: 10,
            height: 6,
            borderLeftWidth: 2,
            borderBottomWidth: 2,
            borderColor: "#3B82F6",
            transform: [{ rotate: "-45deg" }],
            marginTop: -2,
          }}
        />
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Sub-component: ClockIcon
// ---------------------------------------------------------------------------

function ClockIcon() {
  return (
    <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center">
      <View className="w-6 h-6 rounded-full border-2 border-gray-400 items-center justify-center">
        {/* 12 o'clock hand */}
        <View
          style={{
            position: "absolute",
            width: 1.5,
            height: 5,
            backgroundColor: "#9CA3AF",
            top: 1,
            left: 8.5,
            borderRadius: 1,
          }}
        />
        {/* 3 o'clock hand */}
        <View
          style={{
            position: "absolute",
            width: 4,
            height: 1.5,
            backgroundColor: "#9CA3AF",
            top: 8.5,
            left: 8.5,
            borderRadius: 1,
          }}
        />
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function AttemptCard({ score, date, status, onPress }: AttemptCardProps) {
  const isCompleted = status === "completed";

  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center bg-white rounded-2xl px-4 py-4 mb-3"
      style={({ pressed }) => ({
        opacity: pressed ? 0.72 : 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
      })}
    >
      {isCompleted ? <CheckCircleIcon /> : <ClockIcon />}

      <View className="flex-1 ml-4">
        <Text className="text-sm font-semibold text-gray-900">
          {isCompleted && score !== null ? `Score: ${score}/10` : "In Progress"}
        </Text>
        <Text className="text-xs text-gray-400 mt-0.5">{formattedDate}</Text>
      </View>

      {/* Chevron */}
      <Text className="text-gray-300 text-lg">›</Text>
    </Pressable>
  );
}
