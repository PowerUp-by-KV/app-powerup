import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { RiveMascot } from "@/components/RiveMascot";

interface ChatFabProps {
  onPress: () => void;
}

export function ChatFab({ onPress }: ChatFabProps) {
  return (
    <View style={styles.container} pointerEvents="box-none">
      <Pressable onPress={onPress} className="active:scale-95" style={styles.pressable}>
        <View pointerEvents="none" style={styles.mascotWrapper}>
          <RiveMascot width={110} height={130} />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    right: -10,
    bottom: 50,
  },
  pressable: {
    width: 110,
    height: 110,
    alignItems: "center",
    justifyContent: "center",
  },
  mascotWrapper: {
    width: 110,
    height: 130,
    marginTop: -20,
    overflow: "visible",
  },
});
