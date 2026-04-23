import { useState } from "react";

export function useLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return {
    email,
    setEmail,
    password,
    setPassword,
  };
}
