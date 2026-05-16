import { useState } from "react";

export function useHome<T = unknown>() {
  const [data, setData] = useState<T | null>(null);

  return {
    data,
    setData,
  };
}
