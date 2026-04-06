import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import Svg, { Circle, Path, Line } from "react-native-svg";
import { COLORS, FONTS } from "@/constants/theme";

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

  const points = data.datasets[0].data;
  const yLabels = [100, 80, 60, 40, 20];

  const getLinePath = () => {
    if (points.length === 0) return "";
    const xStep = chartWidth / (points.length - 1);
    let path = `M ${paddingLeft} ${chartHeight - (points[0] / 100) * chartHeight}`;

    for (let i = 1; i < points.length; i++) {
      const x = i * xStep + paddingLeft;
      const y = chartHeight - (points[i] / 100) * chartHeight;
      path += ` L ${x} ${y}`;
    }
    return path;
  };

  return (
    <View style={styles.container}>
      <View style={styles.chartWrapper}>
        <View style={styles.yAxis}>
          {yLabels.map((label) => (
            <Text key={label} style={styles.yLabel}>
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
            stroke={COLORS.darkGray}
            strokeWidth="1"
          />
          <Line
            x1={paddingLeft}
            y1={chartHeight}
            x2={chartWidth + paddingLeft}
            y2={chartHeight}
            stroke={COLORS.darkGray}
            strokeWidth="1"
          />

          <Path
            d={getLinePath()}
            fill="none"
            stroke={COLORS.darkGray}
            strokeWidth="1" // Thinner line
          />

          {points.map((p, i) => {
            const xStep = chartWidth / (points.length - 1);
            const x = i * xStep + paddingLeft;
            const y = chartHeight - (p / 100) * chartHeight;
            return <Circle key={i} cx={x} cy={y} r="1.5" fill={COLORS.darkGray} />;
          })}
        </Svg>
      </View>
      <View style={styles.labelsRow}>
        {data.labels.map((label, index) => (
          <Text key={index} style={styles.labelText}>
            {label}
          </Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
    backgroundColor: COLORS.white,
  },
  chartWrapper: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  yAxis: {
    justifyContent: "space-between",
    paddingRight: 5,
    height: CHART_HEIGHT,
    paddingBottom: 2, // Align with Axis line
  },
  yLabel: {
    fontSize: 14,
    ...FONTS.bold,
    color: "#B08500", // Yellowish-brown color from image
    textAlign: "right",
  },
  labelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingLeft: 40,
    marginTop: 10,
    width: CHART_WIDTH + 40,
  },
  labelText: {
    fontSize: 14,
    ...FONTS.bold,
    color: "#B08500", // Yellowish-brown color from image
  },
});
