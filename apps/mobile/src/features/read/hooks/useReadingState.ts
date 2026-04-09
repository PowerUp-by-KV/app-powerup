import { useState } from "react";

export function useReadingState() {
  const [selected, setSelected] = useState<Record<string, string>>({});

  return {
    selected,
    setSelected,
  };
}
