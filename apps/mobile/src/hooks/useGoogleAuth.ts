import { useEffect } from "react";

import * as Google from "expo-auth-session/providers/google";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
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

WebBrowser.maybeCompleteAuthSession();

export function useGoogleAuth() {
  const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

  // Missing client IDs must NOT crash the login screen. When they're absent
  // (e.g. an EAS build whose env doesn't define them), Google.useAuthRequest
  // returns a null `request`, which the UI uses to disable the Google button —
  // email/password sign-in keeps working. Previously this threw and took the
  // whole LoginScreen down, leaving the app stuck after the splash screen.
  const hasGoogleConfig = !!androidClientId && !!iosClientId && !!webClientId;
  if (!hasGoogleConfig) {
    console.warn(
      "Google OAuth client IDs not configured — Google sign-in disabled, email/password still works.",
    );
  }

  const router = useRouter();
  const dispatch = useDispatch();
  const [socialGoogleLogin] = useSocialGoogleLoginMutation();
  const [getOnboardingStatus] = onboardingApi.useLazyGetOnboardingStatusQuery();

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId,
    iosClientId,
    webClientId,
  });

  useEffect(() => {
    if (response?.type !== "success") return;

    const idToken =
      (response.authentication?.idToken as string | undefined) ??
      (response.params as Record<string, string>)?.id_token;

    if (!idToken) return;

    void handleGoogleToken(idToken);
  }, [response]);

  const handleGoogleToken = async (idToken: string) => {
    try {
      const auth = await socialGoogleLogin({ id_token: idToken }).unwrap();

      await saveAuthSession(auth);
      await new Promise((resolve) => setTimeout(resolve, 200));

      const email = auth.user?.email ?? "";
      await clearStaleLocalFlagsIfUserChanged(email);
      await saveLastLoggedInEmail(email);

      dispatch(api.util.resetApiState());
      dispatch(resetOnboarding());

      try {
        const status = await getOnboardingStatus(auth.user?.id ?? "").unwrap();
        if (status?.answers_present) {
          router.replace("/(tabs)/my-learning" as never);
        } else {
          router.replace("/onboarding" as never);
        }
      } catch {
        router.replace("/onboarding" as never);
      }
    } catch (err) {
      console.error("Google login failed:", err);
      throw err;
    }
  };

  return { request, promptAsync };
}
