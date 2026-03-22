import { setToken } from "@/utils/auth";
import * as AuthSession from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { useCallback, useMemo, useState } from "react";
import { Platform } from "react-native";

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID =
  "617587192867-b28cp4lrbjpgo6k14au20p4pd1i6lu4d.apps.googleusercontent.com";

const resolveClientId = (value: string | undefined): string | undefined => {
  if (!value) {
    return undefined;
  }

  const normalized = value.trim();

  if (!normalized || normalized.startsWith("YOUR_")) {
    return undefined;
  }

  return normalized;
};

const WEB_CLIENT_ID =
  resolveClientId(process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID) ?? GOOGLE_CLIENT_ID;
const ANDROID_CLIENT_ID = resolveClientId(
  process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID,
);
const IOS_CLIENT_ID = resolveClientId(
  process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS,
);

type GoogleAuthOutcome =
  | {
      status: "success";
      token: string;
    }
  | {
      status: "cancelled";
      message: string;
    }
  | {
      status: "error";
      message: string;
    };

const getTokenFromResult = (
  response: AuthSession.AuthSessionResult,
): string | null => {
  if (response.type !== "success") {
    return null;
  }

  const idToken = response.params.id_token ?? response.authentication?.idToken;
  const accessToken =
    response.params.access_token ?? response.authentication?.accessToken;

  return idToken ?? accessToken ?? null;
};

export const useGoogleAuth = () => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const redirectUri = useMemo(
    () =>
      AuthSession.makeRedirectUri({
        scheme: "apppowerup",
        path: "oauthredirect",
        native: "apppowerup:/oauthredirect",
      }),
    [],
  );

  const [request, , promptAsync] = Google.useAuthRequest({
    webClientId: WEB_CLIENT_ID,
    androidClientId: ANDROID_CLIENT_ID,
    iosClientId: IOS_CLIENT_ID,
    redirectUri,
    scopes: ["openid", "profile", "email"],
    selectAccount: true,
  });

  const authenticateWithGoogle =
    useCallback(async (): Promise<GoogleAuthOutcome> => {
      if (!request) {
        return {
          status: "error",
          message: "Google auth is still initializing. Try again in a moment.",
        };
      }

      if (Platform.OS === "android" && !ANDROID_CLIENT_ID) {
        return {
          status: "error",
          message:
            "Android Google client ID is missing. Set EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID in .env with a valid Android OAuth client ID.",
        };
      }

      try {
        setIsAuthenticating(true);
        const response = await promptAsync();

        if (response.type === "cancel" || response.type === "dismiss") {
          return {
            status: "cancelled",
            message: "Google sign-in was cancelled.",
          };
        }

        if (response.type !== "success") {
          return {
            status: "error",
            message: "Google sign-in did not complete successfully.",
          };
        }

        const token = getTokenFromResult(response);

        if (!token) {
          return {
            status: "error",
            message: "Google sign-in succeeded but no token was returned.",
          };
        }

        await setToken(token);

        return {
          status: "success",
          token,
        };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unexpected auth error";

        if (message.toLowerCase().includes("redirect_uri_mismatch")) {
          return {
            status: "error",
            message: `Google rejected the redirect URI. Add this URI in Google Cloud Console -> OAuth client -> Authorized redirect URIs: ${redirectUri}`,
          };
        }

        return {
          status: "error",
          message,
        };
      } finally {
        setIsAuthenticating(false);
      }
    }, [promptAsync, redirectUri, request]);

  return {
    request,
    isAuthenticating,
    authenticateWithGoogle,
  };
};
