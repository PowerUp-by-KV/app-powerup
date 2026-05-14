import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import Svg, { Path, Circle } from "react-native-svg";
import { BookOpen, Headphones, PenTool, Mic } from "lucide-react-native";

interface CefrResultViewProps {
  overallScore: number;
  totalScore: number;
  maxScore: number;
  maxTotalPoints: number;
  cefrLevel: string;
  readingScore: number;
  listeningScore: number;
  writingScore: number;
  speakingScore: number;
}

const { width } = Dimensions.get("window");
const GAUGE_SIZE = Math.min(width * 0.45, 180);
const STROKE_WIDTH = 10;
const RADIUS = (GAUGE_SIZE - STROKE_WIDTH) / 2;

export const CefrResultView: React.FC<CefrResultViewProps> = ({
  overallScore,
  totalScore,
  maxScore,
  maxTotalPoints,
  cefrLevel,
  readingScore,
  listeningScore,
  writingScore,
  speakingScore,
}) => {
  // Calculate stroke dash array for semi-circle
  const circumference = Math.PI * RADIUS;
  const progress = overallScore / maxScore;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <View className="items-center py-4 px-4">
      <Text className="text-[#1E293B] text-[16px] font-bold mb-3">Overall Score</Text>

      {/* Semi-circular Gauge */}
      <View
        style={{ width: GAUGE_SIZE, height: GAUGE_SIZE / 2 + 5 }}
        className="items-center justify-start overflow-hidden"
      >
        <Svg width={GAUGE_SIZE} height={GAUGE_SIZE}>
          {/* Background Arc */}
          <Path
            d={`M ${STROKE_WIDTH / 2} ${GAUGE_SIZE / 2} A ${RADIUS} ${RADIUS} 0 0 1 ${GAUGE_SIZE - STROKE_WIDTH / 2} ${GAUGE_SIZE / 2}`}
            stroke="#E2E8F0"
            strokeWidth={STROKE_WIDTH}
            fill="none"
            strokeLinecap="round"
          />
          {/* Progress Arc */}
          <Path
            d={`M ${STROKE_WIDTH / 2} ${GAUGE_SIZE / 2} A ${RADIUS} ${RADIUS} 0 0 1 ${GAUGE_SIZE - STROKE_WIDTH / 2} ${GAUGE_SIZE / 2}`}
            stroke="#94A3B8"
            strokeWidth={STROKE_WIDTH}
            fill="none"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </Svg>

        {/* Score Overlay */}
        <View style={{ position: "absolute", bottom: -5, alignItems: "center" }}>
          <Text className="text-[#1E293B] text-[24px] font-extrabold">
            {overallScore.toFixed(1)} of {maxScore}
          </Text>
          <Text className="text-[#64748B] text-[12px] font-medium mt-0.5">
            {totalScore} of {maxTotalPoints}
          </Text>
        </View>
      </View>

      <Text className="text-[#1E293B] text-[18px] font-bold mt-2 mb-6">CEFR: {cefrLevel}</Text>

      {/* Skills Grid */}
      <View className="w-full flex-row flex-wrap justify-between">
        {[
          { label: "Reading", icon: <BookOpen size={18} color="#1E293B" />, score: readingScore },
          {
            label: "Listening",
            icon: <Headphones size={18} color="#1E293B" />,
            score: listeningScore,
          },
          { label: "Writing", icon: <PenTool size={18} color="#1E293B" />, score: writingScore },
          { label: "Speaking", icon: <Mic size={18} color="#1E293B" />, score: speakingScore },
        ].map((skill, idx) => (
          <View key={idx} className="w-[47%] mb-4">
            <View className="flex-row items-center mb-1.5 px-1">
              {skill.icon}
              <Text className="text-[#1E293B] text-[14px] font-bold ml-1.5">{skill.label}</Text>
            </View>
            <View className="bg-[#E2E8F0]/40 rounded-[10px] h-14 items-center justify-center">
              <Text className="text-[#1E293B] text-[16px] font-extrabold">
                {skill.score.toFixed(1)} of {maxScore}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};
