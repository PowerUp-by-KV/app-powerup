import { Alert, Platform } from "react-native";

/**
 * Cross-platform replacement for `Alert.alert`.
 *
 * React Native's Alert has no web implementation — on the web build every `Alert.alert`
 * call silently does nothing. That was hiding real failures from users: a wrong password,
 * an already-registered email, a failed onboarding submit all just... did nothing.
 *
 * Native keeps the platform dialog. Web renders an in-app modal via <AlertHost/>, which is
 * mounted once at the root. We deliberately do NOT use window.alert/window.confirm: they
 * block the JS event loop, can't be themed, and can't express a three-button choice.
 */

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: "default" | "cancel" | "destructive";
}

export interface AlertState {
  title: string;
  message?: string;
  buttons: AlertButton[];
}

type Listener = (state: AlertState | null) => void;

let listener: Listener | null = null;

/** Called by <AlertHost/>. Returns an unsubscribe function. */
export function registerAlertHost(fn: Listener): () => void {
  listener = fn;
  return () => {
    if (listener === fn) listener = null;
  };
}

export function showAlert(title: string, message?: string, buttons?: AlertButton[]): void {
  if (Platform.OS !== "web") {
    Alert.alert(title, message, buttons);
    return;
  }

  const resolved: AlertButton[] = buttons?.length ? buttons : [{ text: "OK" }];

  if (!listener) {
    // No host mounted (e.g. an alert fired before the root laid out). Better a console
    // warning than silently swallowing the message, which is the bug this file exists to fix.
    console.warn(`[showAlert] no AlertHost mounted — "${title}": ${message ?? ""}`);
    return;
  }

  listener({ title, message, buttons: resolved });
}
