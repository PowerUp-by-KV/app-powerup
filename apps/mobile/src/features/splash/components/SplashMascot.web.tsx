import React from "react";
import { RiveMascot } from "@/components/RiveMascot";

interface SplashMascotProps {
  width?: number;
  height?: number;
}

export function SplashMascot(props: SplashMascotProps) {
  // Use the brilliantly crafted RiveMascot SVG on the web!
  return <RiveMascot {...props} />;
}
