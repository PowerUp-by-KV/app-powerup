// ---------------------------------------------------------------------------
// Google sign-in via expo-auth-session.
//
// Client IDs come from env (set per-profile in eas.json):
//   EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID      (required — also the id_token audience
//                                           the backend validates against)
//   EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID  (required for Android builds)
//   EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID      (optional — iOS only)
//
// IMPORTANT: this hook must NEVER throw. The previous version threw when client
// IDs were missing, which crashed the login/register screens and left the app
// stuck on the splash. Instead, when the IDs required for the current platform
// are absent, `request` comes back null and the caller keeps the Google button
// hidden/disabled. Email/password sign-in is unaffected either way.
// ---------------------------------------------------------------------------

import { useEffect } from "react";
import { Alert } from "react-native";

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

  const router = useRouter();
  const dispatch = useDispatch();
  const [socialGoogleLogin] = useSocialGoogleLoginMutation();
  const [getOnboardingStatus] = onboardingApi.useLazyGetOnboardingStatusQuery();

  // useIdTokenAuthRequest (NOT useAuthRequest): the backend validates a Google
  // **id_token**, so we must request one. On web this uses responseType=id_token
  // (the plain useAuthRequest defaults to responseType=token → access token only,
  // no id_token → nothing to send the backend → no redirect). On native it falls
  // back to the auth-code flow with auto-exchange, which also yields an id_token.
  //
  // Called unconditionally to satisfy the rules of hooks. With no client IDs for
  // the current platform, expo-auth-session returns `request === null` (no throw),
  // and the caller keeps the button disabled.
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
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

      // Without a user id we can't query onboarding status — default to the
      // onboarding flow instead of sending an empty-id request to the backend.
      const userId = auth.user?.id;
      if (!userId) {
        router.replace("/onboarding" as never);
        return;
      }

      try {
        const status = await getOnboardingStatus(userId).unwrap();
        if (status?.answers_present) {
          router.replace("/(tabs)/my-learning" as never);
        } else {
          router.replace("/onboarding" as never);
        }
      } catch {
        router.replace("/onboarding" as never);
      }
    } catch (err) {
      // Do NOT rethrow: this runs from a `void handleGoogleToken(...)` call inside
      // a useEffect, so a rejection here would be an unhandled promise rejection.
      // Surface the failure to the user instead.
      console.error("Google login failed:", err);
      Alert.alert("Google Sign-In", "Could not complete Google sign-in. Please try again.");
    }
  };

  return { request, promptAsync };
}
