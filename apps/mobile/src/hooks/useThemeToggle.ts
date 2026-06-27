import { Platform } from "react-native";
import { useColorScheme } from "nativewind";
import * as SecureStore from "expo-secure-store";

export function useThemeToggle() {
  const { colorScheme, setColorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const toggleDarkMode = async (value?: boolean) => {
    const newValue = value !== undefined ? value : !isDark;
    setColorScheme(newValue ? "dark" : "light");
    try {
      if (Platform.OS === "web") {
        window.localStorage?.setItem("settings_dark_mode", String(newValue));
        if (typeof document !== "undefined") {
          if (newValue) {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
        }
      } else {
        await SecureStore.setItemAsync("settings_dark_mode", String(newValue));
      }
    } catch {}
  };

  return { isDark, toggleDarkMode, colorScheme };
}
