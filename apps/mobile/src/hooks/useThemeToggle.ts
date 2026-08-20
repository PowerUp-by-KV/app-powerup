import { useEffect, useCallback } from "react";
import { Platform } from "react-native";
import { useColorScheme } from "nativewind";
import AsyncStorage from "@react-native-async-storage/async-storage";

// In-memory cache to make tab-switching and loads instantaneous
let cachedTheme: "light" | "dark" | null = null;
let isLoadInitiated = false;

export function useThemeToggle() {
  const { colorScheme, setColorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  useEffect(() => {
    if (cachedTheme !== null) return;

    // Prevent multiple concurrent reads
    if (isLoadInitiated) return;
    isLoadInitiated = true;

    const loadTheme = async () => {
      try {
        let storedDarkMode: string | null = null;
        if (Platform.OS === "web" && typeof window !== "undefined") {
          storedDarkMode = window.localStorage.getItem("settings_dark_mode");
        } else {
          storedDarkMode = await AsyncStorage.getItem("settings_dark_mode");
        }

        if (storedDarkMode !== null) {
          const targetTheme: "light" | "dark" = storedDarkMode === "true" ? "dark" : "light";
          cachedTheme = targetTheme;

          if (colorScheme !== targetTheme) {
            setColorScheme(targetTheme);
          }

          if (Platform.OS === "web" && typeof document !== "undefined") {
            if (targetTheme === "dark") {
              document.documentElement.classList.add("dark");
            } else {
              document.documentElement.classList.remove("dark");
            }
          }
        } else {
          cachedTheme = colorScheme === "dark" ? "dark" : "light";
        }
      } catch (err) {
        console.warn("Failed to load theme settings", err);
        cachedTheme = "light";
      }
    };

    loadTheme();
  }, [colorScheme, setColorScheme]);

  const toggleTheme = useCallback(() => {
    const nextIsDark = !isDark;
    const nextTheme: "light" | "dark" = nextIsDark ? "dark" : "light";

    // Update local cache and state instantly
    cachedTheme = nextTheme;
    setColorScheme(nextTheme);

    // Perform the disk write in the background without blocking the UI rendering thread
    if (Platform.OS === "web") {
      try {
        window.localStorage?.setItem("settings_dark_mode", String(nextIsDark));
        if (typeof document !== "undefined") {
          if (nextIsDark) {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
        }
      } catch (err) {
        console.warn("Failed to save theme setting", err);
      }
    } else {
      AsyncStorage.setItem("settings_dark_mode", String(nextIsDark)).catch((err) => {
        console.warn("Failed to save theme setting", err);
      });
    }
  }, [isDark, setColorScheme]);

  return { isDark, toggleTheme };
}
