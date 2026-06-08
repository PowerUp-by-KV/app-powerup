// ---------------------------------------------------------------------------
// Google sign-in via the native Google Sign-In SDK
// (@react-native-google-signin/google-signin).
//
// Why native (not expo-auth-session): on a standalone EAS build the browser /
// AuthSession flow uses the Android OAuth client with a custom-scheme redirect,
// which Google rejects with "Error 400: invalid_request" — Android clients have
// no browser redirect URIs, they authenticate via the native SDK (package name +
// SHA-1). The native SDK avoids the browser entirely and returns an id_token
// whose audience is the WEB client id, which is exactly what the backend
// validates against.
//
// Client ID required (set per-profile in eas.json):
//   EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID  → passed as webClientId; it is the
//                                       id_token audience the backend checks.
// The Android OAuth client (package + SHA-1) is matched automatically by the
// SDK — it is NOT passed here.
//
// NOTE: requires a native rebuild (expo prebuild + EAS build). It cannot be
// delivered via OTA update because it adds a native module + config plugin.
// ---------------------------------------------------------------------------

import { Alert } from "react-native";

import { GoogleSignin, statusCodes } from "@react-native-google-signin/google-signin";
import { useRouter } from "expo-router";
import { useDispatch } from "react-redux";

import { useSocialGoogleLoginMutation } from "@/services/auth-api";
import {
  clearStaleLocalFlagsIfUserChanged,
  saveAuthSession,
  saveLastLoggedInEmail,
} from "@/services/auth-storage";
import { onboardingApi } from "@/services/onboarding-api";
import { api } from "@/services/api";
import { resetOnboarding } from "@/store/slices/onboardingSlice";

const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

// Configure once at module load. Safe to call even if webClientId is missing —
// signIn() will simply fail and we surface that to the user.
if (webClientId) {
  GoogleSignin.configure({ webClientId });
}

interface GoogleAuthError {
  code?: string;
}

export function useGoogleAuth() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [socialGoogleLogin] = useSocialGoogleLoginMutation();
  const [getOnboardingStatus] = onboardingApi.useLazyGetOnboardingStatusQuery();

  // `request` mirrors the old expo-auth-session API: truthy means the button is
  // enabled. We only require the web client id to be present.
  const request = webClientId ? {} : null;

  const handleGoogleToken = async (idToken: string) => {
    try {
      const auth = await socialGoogleLogin({ id_token: idToken }).unwrap();

      await saveAuthSession(auth);

      const email = auth.user?.email ?? "";
      await clearStaleLocalFlagsIfUserChanged(email);
      await saveLastLoggedInEmail(email);

      dispatch(api.util.resetApiState());
      dispatch(resetOnboarding());

      const userId = auth.user?.id;
      if (!userId) {
        router.replace("/onboarding");
        return;
      }

      try {
        const status = await getOnboardingStatus(userId).unwrap();
        if (status?.answers_present) {
          router.replace("/(tabs)/my-learning");
        } else {
          router.replace("/onboarding");
        }
      } catch {
        router.replace("/onboarding");
      }
    } catch (err) {
      console.error("Google login failed:", err);
      Alert.alert("Google Sign-In", "Could not complete Google sign-in. Please try again.");
    }
  };

  const promptAsync = async () => {
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const result = await GoogleSignin.signIn();

      // v13+ returns { type: "success" | "cancelled", data }. Older shapes put
      // the user object at the top level — handle both defensively.
      if (result.type === "cancelled") return;

      const idToken =
        result.data?.idToken ?? (result as unknown as { idToken?: string }).idToken ?? null;

      if (!idToken) {
        Alert.alert("Google Sign-In", "No identity token returned by Google. Please try again.");
        return;
      }

      await handleGoogleToken(idToken);
    } catch (err) {
      const code = (err as GoogleAuthError)?.code;
      // User-cancelled / in-progress are normal — don't alarm the user.
      if (code === statusCodes.SIGN_IN_CANCELLED || code === statusCodes.IN_PROGRESS) {
        return;
      }
      if (code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert("Google Sign-In", "Google Play Services is not available on this device.");
        return;
      }
      console.error("Google sign-in error:", err);
      Alert.alert("Google Sign-In", "Could not open Google sign-in. Please try again.");
    }
  };

  return { request, promptAsync };
}
