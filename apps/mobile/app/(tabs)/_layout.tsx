import React from "react";
import { Tabs } from "expo-router";

import { Home, BookOpen, Compass, Medal } from "lucide-react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#475569",
        tabBarInactiveTintColor: "#94A3B8",
        tabBarItemStyle: { display: "none" }, // Hide all by default
        tabBarStyle: {
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          height: 80,
          paddingBottom: 12,
          paddingTop: 10,
          backgroundColor: "#FFFFFF",
          elevation: 20,
          borderTopWidth: 0,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
          tabBarItemStyle: { display: "flex" }, // Show Home
        }}
      />
      <Tabs.Screen
        name="my-learning"
        options={{
          title: "My Learning",
          tabBarIcon: ({ color, size }) => <BookOpen size={size} color={color} />,
          tabBarItemStyle: { display: "flex" },
        }}
      />

      <Tabs.Screen
        name="progress"
        options={{
          title: "Progress",
          tabBarIcon: ({ color, size }) => <Compass size={size} color={color} />,
          tabBarItemStyle: { display: "flex" },
        }}
      />

      <Tabs.Screen
        name="achievements"
        options={{
          title: "Achievements",
          tabBarIcon: ({ color, size }) => <Medal size={size} color={color} />,
          tabBarItemStyle: { display: "flex" },
        }}
      />
    </Tabs>
  );
}
