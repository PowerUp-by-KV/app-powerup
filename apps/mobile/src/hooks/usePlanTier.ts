import { useAppSelector } from "@/store/hooks";
import type { Tier } from "@/store/slices/subscription.slice";

export function usePlanTier(): Tier {
  return useAppSelector((state) => state.subscription.tier);
}
