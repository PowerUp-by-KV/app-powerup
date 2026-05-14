import React from "react";
import { View, ViewProps } from "react-native";

interface CardProps extends ViewProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className, style, ...props }) => {
  return (
    <View
      className={`bg-white rounded-3xl p-5 shadow-sm border border-slate-50 ${className || ""}`}
      style={style}
      {...props}
    >
      {children}
    </View>
  );
};
