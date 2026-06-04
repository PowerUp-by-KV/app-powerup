declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EXPO_PUBLIC_ADMIN_PANEL_PASSWORD?: string;
      EXPO_PUBLIC_ADMIN_PASSWORD?: string;
      EXPO_PUBLIC_API_URL?: string;
      EXPO_PUBLIC_USE_MOCK_API?: string;
      EXPO_PUBLIC_USE_MOCK_INTERVIEW?: string;
      EXPO_PUBLIC_TUNNEL_HEADER?: string;
      EXPO_PUBLIC_AUTH_TOKEN?: string;
      EXPO_PUBLIC_APP_ENV?: string;
    }
  }
}

export {};
