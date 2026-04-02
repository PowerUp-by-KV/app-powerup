/**
 * app/index.tsx — Home route (/)
 *
 * Thin wrapper: passes a stable navigation bridge and empty route params to
 * HomeScreen, which manages its own state via AsyncStorage on mount.
 *
 * Phase 1 note: HomeScreen's addListener("focus", ...) refresh is a no-op here.
 * The initial fetch on mount still works correctly.
 * Fixed in Phase 4 with RTK Query / useFocusEffect.
 */
import { HomeScreen } from "@/features/home";

export default function HomeRoute() {
  return <HomeScreen />;
}
