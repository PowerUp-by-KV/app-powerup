import { VerifyPhoneScreen } from "@/features/auth";
import { useLocalSearchParams } from "expo-router";

export default function VerifyPhoneRoute() {
  const params = useLocalSearchParams<{ flow?: "signup" | "signin" }>();
  return <VerifyPhoneScreen flow={params.flow ?? "signup"} />;
}
