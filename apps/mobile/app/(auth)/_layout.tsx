import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="splash"
    >
<<<<<<< HEAD
      {/* Splash -> Login -> Register -> Profile */}
=======
      {/* Splash → Login → Register → Google Success → Profile → Read */}
>>>>>>> c9bbd3aa9ad3e2e82558186199802fe2e575033b
      <Stack.Screen name="splash" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="read" />
      <Stack.Screen name="listen" />
      <Stack.Screen name="write" />
    </Stack>
  );
}
