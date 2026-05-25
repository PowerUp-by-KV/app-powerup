import React from "react";
import { Pressable, View } from "react-native";
import { RiveMascot } from "@/components/RiveMascot";

interface ChatFabProps {
  onPress: () => void;
}

export function ChatFab({ onPress }: ChatFabProps) {
  return (
    <View
      style={{
        position: "absolute",
        right: 8,
        bottom: 64,
      }}
      pointerEvents="box-none"
    >
      <Pressable
        onPress={onPress}
        className="active:scale-90"
        style={{
          width: 110,
          height: 110,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View pointerEvents="none" style={{ width: 110, height: 110 }}>
          <RiveMascot width={110} height={110} />
        </View>
      </Pressable>
    </View>
  );
}
