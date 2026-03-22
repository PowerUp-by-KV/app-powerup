import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="splash"
    >
      {/* Splash -> Login -> Register -> Profile */}
      <Stack.Screen name="splash" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="read" />
      <Stack.Screen name="listen" />
      <Stack.Screen name="write" />
      <Stack.Screen name="results" />
    </Stack>
  );
}
