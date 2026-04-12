/**
 * src/features/interview/components/live/LiveIndicator.tsx
 *
 * Reusable real-time indicator row.
 *
 * Layout:   [Label]  ──── animated bar ────  [Status]
 *
 * The `status` prop drives both the bar colour and the right-hand label,
 * so callers never need to pass a colour manually.
 *
 * Note: NativeWind className API is not enabled in this project
 * (babel.config.js has no NativeWind plugin). Styles use StyleSheet.create()
 * to stay consistent with every other component in this feature.
 */

import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

// ── Types ─────────────────────────────────────────────────────────────────────

export type IndicatorStatus = "Good" | "OK" | "Low";

export interface LiveIndicatorProps {
  /** Short descriptor shown on the left, e.g. "Pace", "Clarity". */
  label: string;
  /**
   * Numeric score that controls bar width.
   * Expected range: 0–100. Values outside that range are clamped.
   */
  value: number;
  /** Semantic quality level — drives the bar fill colour and status badge. */
  status: IndicatorStatus;
}

// ── Token maps ────────────────────────────────────────────────────────────────

/** Solid fill colour for bar and status text. */
const FILL_COLOR: Record<IndicatorStatus, string> = {
  Good: "#10B981", // emerald-500
  OK:   "#F59E0B", // amber-500
  Low:  "#EF4444", // red-500
};

/**
 * Lightly tinted track background — matches the fill hue so the
 * "empty" portion of the bar still feels intentional, not just grey.
 */
const TRACK_COLOR: Record<IndicatorStatus, string> = {
  Good: "#D1FAE5", // emerald-100
  OK:   "#FEF3C7", // amber-100
  Low:  "#FEE2E2", // red-100
};

/** Duration in ms for bar width transitions. */
const ANIM_DURATION = 400;

// ── Component ─────────────────────────────────────────────────────────────────

export function LiveIndicator({ label, value, status }: LiveIndicatorProps) {
  const clamped = Math.max(0, Math.min(value, 100));
  const fillColor  = FILL_COLOR[status];
  const trackColor = TRACK_COLOR[status];

  // Initialise once — re-using the same Animated.Value avoids jitter when the
  // parent re-renders while an animation is already in flight.
  const animWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Calling .start() on an in-flight animation automatically cancels it,
    // so rapid value updates (real-time WebSocket data) stay smooth.
    Animated.timing(animWidth, {
      toValue:        clamped,
      duration:       ANIM_DURATION,
      useNativeDriver: false, // layout property — cannot use native driver
    }).start();
  }, [clamped, animWidth]);

  // Map 0–100 animation unit → 0%–100% string for the flex-1 track container.
  const widthInterp = animWidth.interpolate({
    inputRange:  [0, 100],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.row}>

      {/* ── Left: label ─────────────────────────────────────────────────── */}
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>

      {/* ── Centre: progress track ──────────────────────────────────────── */}
      <View style={[styles.track, { backgroundColor: trackColor }]}>
        <Animated.View
          style={[styles.fill, { width: widthInterp, backgroundColor: fillColor }]}
        />
      </View>

      {/* ── Right: status badge ─────────────────────────────────────────── */}
      <View style={[styles.badge, { borderColor: fillColor }]}>
        <Text style={[styles.badgeText, { color: fillColor }]}>
          {status}
        </Text>
      </View>

    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  row: {
    flexDirection:  "row",
    alignItems:     "center",
    paddingVertical: 6,
  },

  // ── Label ────────────────────────────────────────────────────────────────
  label: {
    // Fixed width keeps the bar left-edge visually stable across rows whose
    // labels have different character lengths.
    width:      88,
    fontSize:   13,
    fontWeight: "600",
    color:      "#334155", // slate-700
  },

  // ── Track ────────────────────────────────────────────────────────────────
  track: {
    flex:         1,
    height:       6,
    borderRadius: 3,
    overflow:     "hidden",
    marginHorizontal: 10,
  },
  fill: {
    height:       "100%",
    borderRadius: 3,
  },

  // ── Status badge ─────────────────────────────────────────────────────────
  badge: {
    width:         42,
    alignItems:    "center",
    paddingVertical:   2,
    paddingHorizontal: 6,
    borderRadius:  10,
    borderWidth:    1,
  },
  badgeText: {
    fontSize:   11,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});
