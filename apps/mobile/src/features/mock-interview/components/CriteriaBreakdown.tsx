import { View, Text } from "react-native";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CriteriaItem {
  label: string;
  score: number; // 0 – 10
}

export interface CriteriaBreakdownProps {
  items: CriteriaItem[];
}

// ---------------------------------------------------------------------------
// Sub-component: CriteriaBar
// ---------------------------------------------------------------------------

function CriteriaBar({ label, score }: CriteriaItem) {
  const pct = Math.min((score / 10) * 100, 100);
  const displayScore = score.toFixed(2);

  return (
    <View className="mb-4">
      <View className="flex-row justify-between items-center mb-1.5">
        <Text className="text-sm text-gray-700">{label}</Text>
        <Text className="text-sm text-gray-500">{displayScore}/10</Text>
      </View>
      <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <View className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function CriteriaBreakdown({ items }: CriteriaBreakdownProps) {
  return (
    <View
      className="bg-white rounded-2xl p-5"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <Text className="text-base font-bold text-gray-900 mb-4">Criteria Breakdown</Text>
      {items.map((item) => (
        <CriteriaBar key={item.label} label={item.label} score={item.score} />
      ))}
    </View>
  );
}
