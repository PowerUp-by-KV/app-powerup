import { useState } from "react";

export function useGrammars() {
  const [answer, setAnswer] = useState("");

  return {
    answer,
    setAnswer,
  };
}
