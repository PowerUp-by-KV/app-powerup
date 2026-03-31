import * as AuthSession from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { useCallback, useMemo, useState } from "react";

WebBrowser.maybeCompleteAuthSession();

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

const GOOGLE_CLIENT_ID =
  resolveClientId(process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID) ??
  "617587192867-b28cp4lrbjpgo6k14au20p4pd1i6lu4d.apps.googleusercontent.com";

const WEB_CLIENT_ID = resolveClientId(process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID) ?? GOOGLE_CLIENT_ID;
const ANDROID_CLIENT_ID =
  resolveClientId(process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID) ?? WEB_CLIENT_ID;
const IOS_CLIENT_ID =
  resolveClientId(process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS) ?? WEB_CLIENT_ID;

type GoogleAuthOutcome =
  | {
      status: "success";
      oauth: {
        oauth_id_token?: string;
        oauth_code?: string;
        oauth_redirect_uri: string;
        oauth_code_verifier?: string;
        email?: string;
      };
    }
  | {
      status: "cancelled";
      message: string;
    }
  | {
      status: "error";
      message: string;
    };

const decodeBase64 = (base64: string): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  let str = base64.replace(/=+$/, "");
  let output = "";
  let buffer = 0;
  let bits = 0;

  for (let i = 0; i < str.length; i += 1) {
    const val = chars.indexOf(str.charAt(i));
    if (val === -1) continue;

    buffer = (buffer << 6) | val;
    bits += 6;

    if (bits >= 8) {
      bits -= 8;
      output += String.fromCharCode((buffer >> bits) & 0xff);
    }
  }

  return output;
};

const decodeEmailFromIdToken = (idToken?: string): string | undefined => {
  if (!idToken) {
    return undefined;
  }

  try {
    const parts = idToken.split(".");
    if (parts.length < 2) {
      return undefined;
    }

    const payloadPart = parts[1]!.replace(/-/g, "+").replace(/_/g, "/");
    const padded = payloadPart.padEnd(Math.ceil(payloadPart.length / 4) * 4, "=");
    const decoded = decodeBase64(padded);
    const payload = JSON.parse(decoded) as { email?: string };
    return payload.email;
  } catch {
    return undefined;
  }
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
    responseType: AuthSession.ResponseType.IdToken,
    usePKCE: false,
    redirectUri,
    scopes: ["openid", "profile", "email"],
    selectAccount: true,
  });

  const authenticateWithGoogle = useCallback(async (): Promise<GoogleAuthOutcome> => {
    if (!request) {
      return {
        status: "error",
        message: "Google auth is still initializing. Try again in a moment.",
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

      const idToken = response.params.id_token ?? response.authentication?.idToken ?? undefined;
      const code = response.params.code ?? undefined;
      const oauth = {
        oauth_id_token: idToken,
        oauth_code: code,
        oauth_redirect_uri: request.redirectUri,
        oauth_code_verifier: request.codeVerifier ?? undefined,
        email: decodeEmailFromIdToken(idToken),
      };

      const hasIdTokenFlow = Boolean(oauth.oauth_id_token);
      const hasCodeFlow = Boolean(
        oauth.oauth_code && oauth.oauth_redirect_uri && oauth.oauth_code_verifier,
      );

      if (!hasIdTokenFlow && !hasCodeFlow) {
        return {
          status: "error",
          message: "Google sign-in succeeded but required OAuth credentials were not returned.",
        };
      }

      return {
        status: "success",
        oauth,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unexpected auth error";

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
