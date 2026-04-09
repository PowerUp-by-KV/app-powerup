import React from "react";
import { View, Dimensions } from "react-native";
import Svg, {
  Polygon,
  Line,
  G,
  Text as SvgText,
  Circle,
  Defs,
  Stop,
  RadialGradient,
  ClipPath,
} from "react-native-svg";

const { width } = Dimensions.get("window");
const SVG_SIZE = 500;
const CENTER = SVG_SIZE / 2;
const RADIUS = 140; // Slightly smaller to give more room for labels
const SIDES = 6;

interface RadarChartProps {
  data: Record<string, number>;
}

/**
 * High-fidelity HEXACO Radar Chart.
 * Upgraded with better spacing for labels and a distinct plotted area.
 */
export const RadarChart = ({ data }: RadarChartProps) => {
  const traits = [
    { key: "Honesty-Humility", label: "Honesty-Humility", color: "#4CAF50" },
    { key: "Emotionality", label: "Emotionality", color: "#FFB74D" },
    { key: "Extraversion", label: "Extraversion", color: "#FF8A65" },
    { key: "Agreeableness", label: "Agreeableness", color: "#E91E63" },
    { key: "Conscientiousness", label: "Conscientiousness", color: "#9575CD" },
    { key: "Openness to Experience", label: "Openness", color: "#2196F3" },
  ];

  // Helper to calculate point coordinates
  const getPoint = (index: number, value: number, radius: number = RADIUS) => {
    const angle = (index * (360 / SIDES) - 90) * (Math.PI / 180);
    const r = (value / 100) * radius;
    return {
      x: CENTER + r * Math.cos(angle),
      y: CENTER + r * Math.sin(angle),
    };
  };

  // Generate points for the data polygon (used for clipping)
  const dataPoints = traits
    .map((t, i) => {
      const p = getPoint(i, Math.max(5, data[t.key] || 0));
      return `${p.x},${p.y}`;
    })
    .join(" ");

  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1];

  return (
    <View className="items-center justify-center py-6 overflow-visible">
      <Svg height={SVG_SIZE} width={SVG_SIZE} viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}>
        <Defs>
          {/* ClipPath for User Data */}
          <ClipPath id="userDataClip">
            <Polygon points={dataPoints} />
          </ClipPath>
        </Defs>

        {/* 1. Background Layers (Faded) */}
        {traits.map((t, i) => {
          const nextIdx = (i + 1) % SIDES;
          const p1 = getPoint(i, 100);
          const p2 = getPoint(nextIdx, 100);
          return (
            <Polygon
              key={`bg-${i}`}
              points={`${CENTER},${CENTER} ${p1.x},${p1.y} ${p2.x},${p2.y}`}
              fill={t.color}
              fillOpacity={0.12}
            />
          );
        })}

        {/* 2. User Data Layer (Vibrant Segmented Fill) */}
        <G clipPath="url(#userDataClip)">
          {traits.map((t, i) => {
            const nextIdx = (i + 1) % SIDES;
            const p1 = getPoint(i, 100);
            const p2 = getPoint(nextIdx, 100);
            return (
              <Polygon
                key={`filled-${i}`}
                points={`${CENTER},${CENTER} ${p1.x},${p1.y} ${p2.x},${p2.y}`}
                fill={t.color}
                fillOpacity={0.9}
              />
            );
          })}
          {/* Add a light overlay to the plotted area to make it stand out more */}
          <Polygon points={dataPoints} fill="rgba(255, 255, 255, 0.15)" />
        </G>

        {/* 3. Grid Lines (White & Bold) */}
        {gridLevels.map((level, i) => {
          const points = traits
            .map((_, idx) => {
              const p = getPoint(idx, 100, RADIUS * level);
              return `${p.x},${p.y}`;
            })
            .join(" ");
          return (
            <Polygon
              key={`grid-${i}`}
              points={points}
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeOpacity={0.9}
            />
          );
        })}

        {/* Axis Lines */}
        {traits.map((_, i) => {
          const p = getPoint(i, 100);
          return (
            <Line
              key={`axis-${i}`}
              x1={CENTER}
              y1={CENTER}
              x2={p.x}
              y2={p.y}
              stroke="white"
              strokeWidth="2"
              strokeOpacity={0.9}
            />
          );
        })}

        {/* 4. Data Polygon Outline - Black/Dark for contrast */}
        <Polygon
          points={dataPoints}
          fill="none"
          stroke="rgba(0,0,0,0.4)"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* 5. Vertices Dots - White centers for visibility */}
        {traits.map((t, i) => {
          const dot = getPoint(i, Math.max(5, data[t.key] || 0));
          return (
            <Circle
              key={`dot-${i}`}
              cx={dot.x}
              cy={dot.y}
              r="5"
              fill="white"
              stroke="rgba(0,0,0,0.5)"
              strokeWidth="1.5"
            />
          );
        })}

        {/* 6. Labels - Perfectly Positioned with more room */}
        {traits.map((t, i) => {
          const angle = (i * (360 / SIDES) - 90) * (Math.PI / 180);
          const labelDist = RADIUS + 45;
          const lx = CENTER + labelDist * Math.cos(angle);
          const ly = CENTER + labelDist * Math.sin(angle);

          let yOffset = 0;
          if (i === 0) yOffset = -20; // Top
          if (i === 3) yOffset = 20; // Bottom
          if (i === 4 || i === 5) yOffset = -5; // Left sides
          if (i === 1 || i === 2) yOffset = -5; // Right sides

          return (
            <G key={`label-${i}`}>
              <SvgText
                x={lx}
                y={ly + yOffset}
                fill={t.color}
                fontSize="15"
                fontWeight="900"
                textAnchor="middle"
                alignmentBaseline="middle"
              >
                {t.label}
              </SvgText>
            </G>
          );
        })}
      </Svg>
    </View>
  );
};
