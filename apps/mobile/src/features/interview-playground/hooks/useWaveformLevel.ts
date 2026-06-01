import { useEffect } from "react";
import {
  cancelAnimation,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
} from "react-native-reanimated";
import type { SharedValue } from "react-native-reanimated";

const SILENT_HEIGHT = 8;
// Center-tallest shape when speaking
const SPEAKING_HEIGHTS = [20, 35, 60, 35, 20];

interface UseWaveformLevelReturn {
  barHeights: SharedValue<number>[];
}

export function useWaveformLevel(isSpeaking: {
  user: boolean;
  ai: boolean;
}): UseWaveformLevelReturn {
  const isActive = isSpeaking.user || isSpeaking.ai;

  const bar0 = useSharedValue(SILENT_HEIGHT);
  const bar1 = useSharedValue(SILENT_HEIGHT);
  const bar2 = useSharedValue(SILENT_HEIGHT);
  const bar3 = useSharedValue(SILENT_HEIGHT);
  const bar4 = useSharedValue(SILENT_HEIGHT);

  const barHeights: SharedValue<number>[] = [bar0, bar1, bar2, bar3, bar4];

  useEffect(() => {
    if (isActive) {
      barHeights.forEach((bar, i) => {
        const base = SPEAKING_HEIGHTS[i] ?? 30;
        bar.value = withRepeat(
          withSequence(
            withSpring(base - 10 + Math.random() * 20, { damping: 6 }),
            withSpring(base - 15 + Math.random() * 30, { damping: 6 }),
            withSpring(base - 5 + Math.random() * 10, { damping: 6 }),
          ),
          -1,
          true,
        );
      });
    } else {
      barHeights.forEach((bar) => {
        cancelAnimation(bar);
        bar.value = withSpring(SILENT_HEIGHT, { damping: 10 });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  return { barHeights };
}
