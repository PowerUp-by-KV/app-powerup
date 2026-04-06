import { useState } from "react";

export function useDashboard<T = unknown>() {
  const [data, setData] = useState<T | null>(null);

  return {
    data,
    setData,
  };
}
