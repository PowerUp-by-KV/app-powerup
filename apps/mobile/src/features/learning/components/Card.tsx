import React from "react";
import { View } from "react-native";

interface CardProps {
  children: React.ReactNode;
  style?: any;
  className?: string;
}

export const Card = ({ children, style, className = "" }: CardProps) => {
  return (
    <View
      className={`bg-white rounded-2xl p-5 shadow-sm shadow-black/10 elevation-5 ${className}`}
      style={style}
    >
      {children}
    </View>
  );
};
