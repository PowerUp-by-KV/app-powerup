import React from "react";
import { View, Text, Dimensions } from "react-native";
import Svg, { Circle, Path, Line } from "react-native-svg";

interface ProgressChartProps {
  data: {
    labels: string[];
    datasets: {
      data: number[];
    }[];
  };
}

const CHART_HEIGHT = 180;
const CHART_WIDTH = Dimensions.get("window").width - 80;

export const ProgressChart: React.FC<ProgressChartProps> = ({ data }) => {
  const chartWidth = CHART_WIDTH;
  const chartHeight = CHART_HEIGHT;
  const paddingLeft = 40;

  const points = data.datasets?.[0]?.data || [];
  const yLabels = [100, 80, 60, 40, 20];

  const getLinePath = () => {
    if (points.length < 2) return "";
    const xStep = chartWidth / (points.length - 1);
    const firstPoint = points[0] ?? 0;
    let path = `M ${paddingLeft} ${chartHeight - (firstPoint / 100) * chartHeight}`;

    for (let i = 1; i < points.length; i++) {
      const x = i * xStep + paddingLeft;
      const currentPoint = points[i] ?? 0;
      const y = chartHeight - (currentPoint / 100) * chartHeight;
      path += ` L ${x} ${y}`;
    }
    return path;
  };

  return (
    <View className="my-5 bg-white">
      <View className="flex-row items-start">
        <View style={{ height: CHART_HEIGHT }} className="justify-between pr-[5px] pb-0.5">
          {yLabels.map((label) => (
            <Text key={label} className="text-sm font-bold text-[#B08500] text-right">
              {label}|
            </Text>
          ))}
        </View>
        <Svg height={chartHeight + 20} width={chartWidth + paddingLeft + 20}>
          {/* X and Y axes */}
          <Line
            x1={paddingLeft}
            y1={0}
            x2={paddingLeft}
            y2={chartHeight}
            stroke="#64748B"
            strokeWidth="1"
          />
          <Line
            x1={paddingLeft}
            y1={chartHeight}
            x2={chartWidth + paddingLeft}
            y2={chartHeight}
            stroke="#64748B"
            strokeWidth="1"
          />

          <Path d={getLinePath()} fill="none" stroke="#64748B" strokeWidth="1" />

          {points.map((p, i) => {
            const xStep = chartWidth / (points.length - 1);
            const x = i * xStep + paddingLeft;
            const y = chartHeight - (p / 100) * chartHeight;
            return <Circle key={i} cx={x} cy={y} r="1.5" fill="#64748B" />;
          })}
        </Svg>
      </View>
      <View style={{ width: CHART_WIDTH + 40 }} className="flex-row justify-between pl-10 mt-2.5">
        {data.labels.map((label, index) => (
          <Text key={index} className="text-sm font-bold text-[#B08500]">
            {label}
          </Text>
        ))}
      </View>
    </View>
  );
};
