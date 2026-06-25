import React, { useEffect, useState } from "react";

import { Feather } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColorScheme } from "nativewind";

import { getAuthSession } from "@/services/auth-storage";

export default function TabLayout() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isAuthed, setIsAuthed] = useState<boolean | null>(null);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const activeColor = "#3b82f6";
  const inactiveColor = isDark ? "#7f85a3" : "#94a3b8";

  useEffect(() => {
    getAuthSession().then((session) => {
      const authed = !!session?.access_token;
      setIsAuthed(authed);
      if (!authed) router.replace("/login");
    });
  }, [router]);

  // Only block render if we've confirmed the user is NOT authenticated.
  // While isAuthed is null (check still in flight) we render the tabs —
  // the root RouteGuard has already verified auth before mounting this layout.
  if (isAuthed === false) return null;

  return (
    <Tabs
      backBehavior="history"
      screenOptions={{
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        tabBarStyle: {
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: "#000000",
          shadowOffset: {
            width: 0,
            height: -4,
          },
          shadowOpacity: isDark ? 0.3 : 0.08,
          shadowRadius: 12,
          height: 64 + Math.max(0, insets.bottom),
          paddingBottom: 8 + Math.max(0, insets.bottom),
          backgroundColor: isDark ? "#252945" : "#ffffff",
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }: { color: string }) => (
            <Feather name="home" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="my-learning"
        options={{
          title: "My Learning",
          tabBarIcon: ({ color }: { color: string }) => (
            <Feather name="book-open" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="achievements"
        options={{
          title: "Achievements",
          tabBarIcon: ({ color }: { color: string }) => (
            <Feather name="award" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: "Leader Board",
          tabBarIcon: ({ color }: { color: string }) => (
            <Feather name="bar-chart-2" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="two" options={{ href: null }} />
      <Tabs.Screen name="profile" options={{ href: null }} />
      <Tabs.Screen name="profile/avatar" options={{ href: null }} />
      <Tabs.Screen name="profile/custom-avatar" options={{ href: null }} />
      <Tabs.Screen name="profile/edit" options={{ href: null }} />
      <Tabs.Screen name="profile/language" options={{ href: null }} />
      <Tabs.Screen name="profile/resume" options={{ href: null }} />
      <Tabs.Screen name="achievements/accuracy" options={{ href: null }} />
      <Tabs.Screen name="achievements/level" options={{ href: null }} />
      <Tabs.Screen name="achievements/medals" options={{ href: null }} />
      <Tabs.Screen name="achievements/xp" options={{ href: null }} />
    </Tabs>
  );
}
