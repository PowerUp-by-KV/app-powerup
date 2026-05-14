import React, { useEffect, useState } from "react";
import { SymbolView } from "expo-symbols";
import { Tabs, useRouter } from "expo-router";

import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import { useClientOnlyValue } from "@/components/useClientOnlyValue";
import { getAuthSession } from "@/services/auth-storage";

export default function TabLayout() {
  const colorScheme = useColorScheme();
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
        tabBarActiveTintColor: Colors[colorScheme].tint,
        headerShown: useClientOnlyValue(false, true),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{
                ios: "house.fill",
                android: "home",
                web: "home",
              }}
              tintColor={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="quiz"
        options={{
          title: "Quiz Center",
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{
                ios: "book.fill",
                android: "book",
                web: "book",
              }}
              tintColor={color}
              size={24}
            />
          ),
        }}
      />
      {/* Hide the old 'two' tab if it still exists in the file structure */}
      <Tabs.Screen
        name="two"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
