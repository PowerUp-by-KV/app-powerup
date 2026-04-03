import { useState } from "react";

export function useAudioPlayback() {
  const [isPlaying, setIsPlaying] = useState(false);

  return {
    isPlaying,
    setIsPlaying,
  };
}
