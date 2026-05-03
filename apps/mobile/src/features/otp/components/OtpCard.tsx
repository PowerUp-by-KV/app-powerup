import React from "react";
import { View } from "react-native";

type Props = {
  children: React.ReactNode;
};

export function OtpCard({ children }: Props) {
  return <View className="w-full max-w-[360px] bg-white p-0">{children}</View>;
}

export default OtpCard;
