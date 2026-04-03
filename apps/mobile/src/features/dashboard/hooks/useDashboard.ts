import { useState } from "react";

export function useDashboard() {
  const [data, setData] = useState<any>(null);

  return {
    data,
    setData,
  };
}
