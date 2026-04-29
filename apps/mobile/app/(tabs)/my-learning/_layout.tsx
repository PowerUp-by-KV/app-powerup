import { Stack } from "expo-router";

export default function LearningLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="modules" />
      <Stack.Screen name="lesson" />
    </Stack>
  );
}
