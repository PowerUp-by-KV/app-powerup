import { useState, useEffect, useCallback } from "react";
import { Platform } from "react-native";
import { useColorScheme } from "nativewind";
import * as SecureStore from "expo-secure-store";

export function useThemeToggle() {
  const { colorScheme, setColorScheme } = useColorScheme();
  const [isDark, setIsDark] = useState(colorScheme === "dark");

  useEffect(() => {
    const loadTheme = async () => {
      try {
        let storedDarkMode: string | null = null;
        if (Platform.OS === "web" && typeof window !== "undefined") {
          storedDarkMode = window.localStorage.getItem("settings_dark_mode");
        } else if (Platform.OS !== "web") {
          storedDarkMode = await SecureStore.getItemAsync("settings_dark_mode");
        }

        if (storedDarkMode !== null) {
          const isDarkStored = storedDarkMode === "true";
          setIsDark(isDarkStored);
          setTimeout(() => setColorScheme(isDarkStored ? "dark" : "light"), 0);
          if (Platform.OS === "web" && typeof document !== "undefined") {
            if (isDarkStored) {
              document.documentElement.classList.add("dark");
            } else {
              document.documentElement.classList.remove("dark");
            }
          }
        } else {
          setIsDark(colorScheme === "dark");
        }
      } catch (err) {
        console.warn("Failed to load theme settings", err);
      }
    };
    loadTheme();
  }, [colorScheme, setColorScheme]);

  const toggleTheme = useCallback(async () => {
    const nextIsDark = !isDark;
    setIsDark(nextIsDark);
    setTimeout(() => setColorScheme(nextIsDark ? "dark" : "light"), 0);

    try {
      if (Platform.OS === "web") {
        window.localStorage?.setItem("settings_dark_mode", String(nextIsDark));
        if (typeof document !== "undefined") {
          if (nextIsDark) {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
        }
      } else {
        await SecureStore.setItemAsync("settings_dark_mode", String(nextIsDark));
      }
    } catch (err) {
      console.warn("Failed to save theme setting", err);
    }
  }, [isDark, setColorScheme]);

  return { isDark, toggleTheme };
}
