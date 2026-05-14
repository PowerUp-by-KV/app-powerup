import React from "react";
import { Tabs } from "expo-router";
import Colors from "@/constants/Colors";
import { Home, BookOpen, Medal, BarChart3 } from "lucide-react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#475569",
        tabBarInactiveTintColor: "#94A3B8",
        tabBarItemStyle: { display: "none" }, // Hide all by default
        tabBarStyle: {
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          height: 56,
          paddingBottom: 4,
          paddingTop: 4,
          backgroundColor: "#FFFFFF",
          elevation: 20,
          borderTopWidth: 0,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Home size={22} color={color} />,
          tabBarItemStyle: { display: "flex" }, // Show Home
        }}
      />
      <Tabs.Screen
        name="my-learning"
        options={{
          title: "My Learning",
          tabBarIcon: ({ color, size }) => <BookOpen size={22} color={color} />,
          tabBarItemStyle: { display: "flex" },
        }}
      />

      <Tabs.Screen
        name="achievements"
        options={{
          title: "Achievements",
          tabBarIcon: ({ color, size }) => <Medal size={22} color={color} />,
          tabBarItemStyle: { display: "flex" },
        }}
      />

      <Tabs.Screen
        name="leaderboard"
        options={{
          title: "Leader Board",
          tabBarIcon: ({ color, size }) => <BarChart3 size={22} color={color} />,
          tabBarItemStyle: { display: "flex" },
        }}
      />

      {/* Hidden tabs that still need the tab bar persistent */}
      <Tabs.Screen name="progress_details" options={{ href: null }} />
      <Tabs.Screen name="progress" options={{ href: null }} />
      <Tabs.Screen name="premium" options={{ href: null }} />
      <Tabs.Screen name="profile" options={{ href: null }} />
      <Tabs.Screen name="rewards" options={{ href: null }} />
    </Tabs>
  );
}
