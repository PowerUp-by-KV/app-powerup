import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";

import { getAuthSession } from "@/services/auth-storage";
import { AuthSuccessScreen } from "./components/AuthSuccessScreen";

export function WelcomeBackScreen() {
  const router = useRouter();
  const [userName, setUserName] = useState("there");

  useEffect(() => {
    getAuthSession().then(async (session) => {
      if (session?.user) {
        const firstName = session.user.name?.split(" ")[0] ?? "there";
        setUserName(firstName);
      }
    });
  }, []);

  const name = userName;

  return (
    <AuthSuccessScreen
      title="Welcome Back!"
      subtitle={`Good to see you again, ${name}. You've successfully signed in.`}
      cta="Get Started"
      onCta={() => {
        router.replace("/(tabs)/my-learning" as never);
      }}
    />
  );
}
