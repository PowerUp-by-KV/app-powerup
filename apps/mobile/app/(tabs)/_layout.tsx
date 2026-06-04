import React, { useEffect, useState } from "react";
import { Feather } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";

import { getAuthSession } from "@/services/auth-storage";

const ACTIVE_COLOR = "#4f46e5";
const INACTIVE_COLOR = "#94a3b8";

export default function TabLayout() {
  const router = useRouter();
  const [isAuthed, setIsAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    getAuthSession().then((session) => {
      const authed = !!session?.access_token;
      setIsAuthed(authed);
      if (!authed) router.replace("/login");
    });
  }, [router]);

  if (isAuthed !== true) return null;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: ACTIVE_COLOR,
        tabBarInactiveTintColor: INACTIVE_COLOR,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        tabBarStyle: {
          borderTopWidth: 0,
          elevation: 8,
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
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
    </Tabs>
  );
}
