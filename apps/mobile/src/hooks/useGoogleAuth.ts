// ---------------------------------------------------------------------------
// Google sign-in is DISABLED for now.
//
// The real implementation called expo-auth-session's Google.useAuthRequest and
// required EXPO_PUBLIC_GOOGLE_* client IDs. In EAS builds those env vars are not
// defined (env comes from eas.json), which crashed the login/register screens
// and left the app stuck after the splash screen.
//
// Until proper native Android/iOS OAuth client IDs are configured in eas.json,
// this is a no-op stub: it performs no auth-session work and returns a null
// request so the UI keeps the Google button disabled/hidden. Email/password
// sign-in is unaffected.
//
// To re-enable: restore the expo-auth-session implementation from git history
// and add the Android + iOS client IDs to eas.json.
// ---------------------------------------------------------------------------

interface GoogleAuthHandle {
  request: null;
  promptAsync: () => Promise<{ type: "dismiss" }>;
}

export function useGoogleAuth(): GoogleAuthHandle {
  return {
    request: null,
    promptAsync: async () => ({ type: "dismiss" }),
  };
}
