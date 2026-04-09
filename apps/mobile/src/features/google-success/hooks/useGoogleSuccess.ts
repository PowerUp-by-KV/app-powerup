import { useState } from "react";

export function useGoogleSuccess() {
  const [isLoading, setIsLoading] = useState(false);

  return {
    isLoading,
    setIsLoading,
  };
}
