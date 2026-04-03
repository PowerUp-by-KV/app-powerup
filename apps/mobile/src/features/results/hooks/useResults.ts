import { useState } from "react";

export function useResults() {
  const [results, setResults] = useState<any[]>([]);

  return {
    results,
    setResults,
  };
}
