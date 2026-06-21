import React, { useRef, useEffect, useState, useCallback } from "react";
import { View, ActivityIndicator, Platform } from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";

interface AvatarCreatorWebViewProps {
  onAvatarExported: (avatarUrl: string) => void;
  subdomain?: string;
}

export function AvatarCreatorWebView({
  onAvatarExported,
  subdomain = "demo",
}: AvatarCreatorWebViewProps) {
  const webviewRef = useRef<WebView>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleMessage = useCallback(
    (event: WebViewMessageEvent | MessageEvent) => {
      try {
        const data = "nativeEvent" in event ? event.nativeEvent.data : event.data;

        // Ignore React Native / Expo dev server messages
        if (typeof data === "string" && data.startsWith("webpack")) return;

        const parsedData = typeof data === "string" ? JSON.parse(data) : data;
        const eventName = parsedData?.eventName || parsedData?.type;

        // Debug log to see exactly what Avaturn is sending
        if (eventName && !eventName.includes("webpack")) {
          console.log("AvatarCreator received event:", eventName, parsedData);
        }

        // Handle Ready Player Me / Avaturn 'v1.avatar.exported' format
        if (
          eventName === "v1.avatar.exported" ||
          eventName === "avatar_exported" ||
          eventName === "export"
        ) {
          const url = parsedData?.data?.url || parsedData?.url;
          console.log("Extracted Avatar URL:", url);
          if (url) {
            onAvatarExported(url);
          }
        }
      } catch {
        // Ignore parsing errors from non-JSON messages
      }
    },
    [onAvatarExported],
  );

  useEffect(() => {
    if (Platform.OS === "web") {
      window.addEventListener("message", handleMessage as EventListener);
      return () => window.removeEventListener("message", handleMessage as EventListener);
    }
  }, [handleMessage]);

  if (!isMounted) {
    return (
      <View className="absolute inset-0 items-center justify-center bg-white z-50">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  // Use Avaturn instead of Ready Player Me
  const url = `https://${subdomain}.avaturn.dev/`;

  if (Platform.OS === "web") {
    return (
      <View
        style={[
          { width: "100%", backgroundColor: "#fff" },
          Platform.OS === "web" &&
            ({ height: "calc(100vh - 65px)", minHeight: "calc(100vh - 65px)" } as any),
        ]}
      >
        <iframe
          src={url}
          style={{ width: "100%", height: "100%", border: "none", minHeight: "100vh" }}
          allow="camera *; microphone *"
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <WebView
        ref={webviewRef}
        source={{ uri: url }}
        onMessage={handleMessage}
        className="flex-1 opacity-100"
        startInLoadingState
        javaScriptEnabled={true}
        domStorageEnabled={true}
        mixedContentMode="always"
        originWhitelist={["*"]}
        renderLoading={() => (
          <View className="absolute inset-0 items-center justify-center bg-white z-50">
            <ActivityIndicator size="large" color="#3b82f6" />
          </View>
        )}
        // Allow camera access for selfies
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
      />
    </View>
  );
}
