import { useState } from "react";

export function useResults<T = unknown>() {
  const [results, setResults] = useState<T[]>([]);

  return {
    results,
    setResults,
  };
}
