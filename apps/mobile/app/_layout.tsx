import "../global.css";
import { Stack } from "expo-router";
import { Provider } from "react-redux";
import { store } from "@/store";

export default function AuthLayout() {
  return (
    <Provider store={store}>
      <Stack
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
        }}
        initialRouteName="splash"
      >
        {/* Splash -> Login -> Register -> Google-Success -> Profile -> Read -> Listen -> Write */}
        <Stack.Screen name="splash" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="google-success" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="read" />
        <Stack.Screen name="listen" />
        <Stack.Screen name="write" />
        <Stack.Screen name="results" />
        <Stack.Screen name="dashboard" />
      </Stack>
    </Provider>
  );
}
