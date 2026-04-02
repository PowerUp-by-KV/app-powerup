/**
 * app/session-picker.tsx — Session picker route (/session-picker)
 *
 * Thin wrapper for SessionPickerScreen.
 *
 * Receives via search params (from HomeScreen → bridge.navigate("SessionPicker", ...)):
 *   candidateId: string
 *   resumeId:    string
 */
import { SessionPickerScreen } from "@/features/session-picker";

export default function SessionPickerRoute() {
  return <SessionPickerScreen />;
}
