import { useState } from "react";

export function useSuccess() {
  const [isLoading, setIsLoading] = useState(false);

  return {
    isLoading,
    setIsLoading,
  };
}

export default useSuccess;
