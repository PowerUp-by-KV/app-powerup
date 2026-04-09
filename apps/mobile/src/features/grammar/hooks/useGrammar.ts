import { useState } from "react";

export function useGrammar() {
  const [answer, setAnswer] = useState("");

  return {
    answer,
    setAnswer,
  };
}
