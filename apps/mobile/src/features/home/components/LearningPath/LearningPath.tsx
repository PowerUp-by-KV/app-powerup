import React from "react";
import { View, Text, Dimensions, TouchableOpacity } from "react-native";
import { PathNode } from "./PathNode";
import { PathConnector } from "./PathConnector";
import { Play } from "lucide-react-native";

const { width } = Dimensions.get("window");

export const LearningPath = ({
  data,
  onNodePress,
  onContinuePress,
}: {
  data: any[];
  onNodePress: (node: any) => void;
  onContinuePress: () => void;
}) => {
  const NODE_SPACING_Y = 120;
  const X_OFFSET = width * 0.25;

  const getNodePosition = (index: number) => {
    const row = index;
    let x = width / 2;

    if (index === 0) x = width / 2;
    else if (index % 2 === 1) x -= X_OFFSET;
    else x += X_OFFSET;

    return { x, y: row * NODE_SPACING_Y + 50 };
  };

  const completedCount = data.filter((item) => item.status === "completed").length;
  const progressPercent = Math.round((completedCount / data.length) * 100);

  return (
    <View className="mt-5 bg-white rounded-[24px] p-5 shadow-lg shadow-black/10 elevation-5 mb-[30px]">
      <View className="mb-5">
        <View className="flex-row justify-between items-center mb-2.5">
          <Text className="text-xl font-bold color-black">Learning Path</Text>
          <Text className="text-base font-bold color-[#6366F1]">{progressPercent}%</Text>
        </View>
        <View className="h-2.5 bg-[#E2E8F0] rounded-[5px] overflow-hidden">
          <View
            style={{ width: `${progressPercent}%` }}
            className="h-full bg-[#6366F1] rounded-[5px]"
          />
        </View>
      </View>

      <View className="h-[500px] w-full my-5 relative">
        {data.map((item, index) => {
          if (index === data.length - 1) return null;
          const start = getNodePosition(index);
          const end = getNodePosition(index + 1);
          const isFilled = item.status === "completed";
          return (
            <PathConnector
              key={`conn-${index}`}
              startPos={start}
              endPos={end}
              isFilled={isFilled}
            />
          );
        })}

        {data.map((item, index) => {
          const pos = getNodePosition(index);
          return (
            <View
              key={item.id}
              className="absolute items-center justify-center"
              style={{ left: pos.x - 60, top: pos.y }}
            >
              <PathNode
                item={item}
                isCurrent={item.status === "current"}
                onPress={() => onNodePress(item)}
              />
            </View>
          );
        })}
      </View>

      <View className="mt-5 items-center">
        <TouchableOpacity
          className="bg-[#6366F1] flex-row items-center px-[30px] py-[15px] rounded-[20px] w-full justify-center shadow-lg shadow-[#6366F1]/30 elevation-4"
          activeOpacity={0.8}
          onPress={onContinuePress}
        >
          <Text className="text-white text-lg font-bold mr-2.5">Continue Learning</Text>
          <Play size={18} color="#FFF" fill="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};
