/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef } from "react";
import { View } from "react-native";
import { useAssets } from "expo-asset";
import { useRive, useStateMachineInput } from "@rive-app/react-canvas";

interface RiveMascotProps {
  width?: number;
  height?: number;
}

export function RiveMascot({ width = 200, height = 200 }: RiveMascotProps) {
  const [assets] = useAssets([
    require("../../assets/mascot/5308-11093-cute-interactive-robot.riv"),
  ]);

  const containerRef = useRef<any>(null);
  const asset = assets ? assets[0] : null;

  if (!asset) {
    return <View style={{ width, height }} />;
  }

  const sourceUri = asset.localUri || asset.uri;

  return (
    <View
      ref={containerRef}
      style={{ width, height, alignItems: "center", justifyContent: "center" }}
    >
      <RiveContainer src={sourceUri} width={width} height={height} containerRef={containerRef} />
    </View>
  );
}

interface RiveContainerProps {
  src: string;
  width: number;
  height: number;
  containerRef: React.RefObject<any>;
}

function RiveContainer({ src, width, height, containerRef }: RiveContainerProps) {
  const { rive, RiveComponent } = useRive({
    src,
    stateMachines: "State Machine 1",
    autoplay: true,
  });

  // Defensively match any of the standard tracking inputs (xAxis, pointerX,
  // mouseX). Every hook must be called unconditionally on every render — do
  // NOT short-circuit the hook calls with ||, only combine their results.
  const xAxisStd = useStateMachineInput(rive, "State Machine 1", "xAxis");
  const xAxisPointer = useStateMachineInput(rive, "State Machine 1", "pointerX");
  const xAxisMouse = useStateMachineInput(rive, "State Machine 1", "mouseX");
  const xAxis = xAxisStd || xAxisPointer || xAxisMouse;

  const yAxisStd = useStateMachineInput(rive, "State Machine 1", "yAxis");
  const yAxisPointer = useStateMachineInput(rive, "State Machine 1", "pointerY");
  const yAxisMouse = useStateMachineInput(rive, "State Machine 1", "mouseY");
  const yAxis = yAxisStd || yAxisPointer || yAxisMouse;

  useEffect(() => {
    if (!rive) return;

    // Set default initial center state
    if (xAxis) xAxis.value = 50;
    if (yAxis) yAxis.value = 50;

    const handleMouseMove = (event: MouseEvent) => {
      let cx = window.innerWidth / 2;
      let cy = window.innerHeight / 2;

      // Find the screen position of the mascot container dynamically
      if (containerRef.current) {
        const element = containerRef.current;
        const rect =
          typeof element.getBoundingClientRect === "function"
            ? element.getBoundingClientRect()
            : null;
        if (rect) {
          cx = rect.left + rect.width / 2;
          cy = rect.top + rect.height / 2;
        }
      }

      // Calculate the delta vector from mascot center to the cursor
      const dx = event.clientX - cx;
      const dy = event.clientY - cy;

      // 1. Screen-absolute percentage (keeps the eyes moving smoothly across the whole page)
      const screenX = (event.clientX / Math.max(1, window.innerWidth)) * 100;
      const screenY = (event.clientY / Math.max(1, window.innerHeight)) * 100;

      // 2. Mascot-relative highly sensitive percentage (provides excellent response near the mascot)
      const lookRadius = 320; // Tight, highly active radius
      const rx = Math.max(-1, Math.min(1, dx / lookRadius));
      const ry = Math.max(-1, Math.min(1, dy / lookRadius));
      const relX = 50 + rx * 50;
      const relY = 50 + ry * 50;

      // 3. Blend them: 45% screen-absolute + 55% mascot-relative for perfect continuous full-screen tracking
      const xPercent = screenX * 0.45 + relX * 0.55;
      const yPercent = screenY * 0.45 + relY * 0.55;

      if (xAxis) xAxis.value = xPercent;
      if (yAxis) yAxis.value = yPercent;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length === 0) return;
      const touch = event.touches[0];
      if (!touch) return;

      let cx = window.innerWidth / 2;
      let cy = window.innerHeight / 2;

      if (containerRef.current) {
        const element = containerRef.current;
        const rect =
          typeof element.getBoundingClientRect === "function"
            ? element.getBoundingClientRect()
            : null;
        if (rect) {
          cx = rect.left + rect.width / 2;
          cy = rect.top + rect.height / 2;
        }
      }

      const dx = touch.clientX - cx;
      const dy = touch.clientY - cy;

      const screenX = (touch.clientX / Math.max(1, window.innerWidth)) * 100;
      const screenY = (touch.clientY / Math.max(1, window.innerHeight)) * 100;

      const lookRadius = 320;
      const rx = Math.max(-1, Math.min(1, dx / lookRadius));
      const ry = Math.max(-1, Math.min(1, dy / lookRadius));
      const relX = 50 + rx * 50;
      const relY = 50 + ry * 50;

      const xPercent = screenX * 0.45 + relX * 0.55;
      const yPercent = screenY * 0.45 + relY * 0.55;

      if (xAxis) xAxis.value = xPercent;
      if (yAxis) yAxis.value = yPercent;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [rive, xAxis, yAxis, containerRef]);

  return <RiveComponent style={{ width, height }} />;
}
