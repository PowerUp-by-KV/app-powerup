import React from "react";
import { Pressable, View } from "react-native";
import { Feather } from "@expo/vector-icons";

interface ChatFabProps {
  onPress: () => void;
}

export function ChatFab({ onPress }: ChatFabProps) {
  return (
    <View
      style={{
        position: "absolute",
        right: 20,
        bottom: 84,
      }}
      pointerEvents="box-none"
    >
      <Pressable
        onPress={onPress}
        className="w-14 h-14 rounded-full bg-slate-900 items-center justify-center active:scale-95"
        style={{
          shadowColor: "#000",
          shadowOpacity: 0.2,
          shadowOffset: { width: 0, height: 4 },
          shadowRadius: 8,
          elevation: 6,
        }}
      >
        <Feather name="message-circle" size={24} color="#fff" />
      </Pressable>
    </View>
  );
}
