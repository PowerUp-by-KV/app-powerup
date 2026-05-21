import React, { useMemo, useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";

export interface TapToBuildResult {
  correct: boolean;
  builtSentence: string[];
  correctSentence: string[];
}

interface TapToBuildProps {
  promptText: string;
  audioUrl?: string | null;
  tokens: string[];
  correctSequence: string[];
  onCheck: (result: TapToBuildResult) => void;
  onPlayAudio?: () => void;
}

export function TapToBuild({
  promptText,
  audioUrl,
  tokens,
  correctSequence,
  onCheck,
  onPlayAudio,
}: TapToBuildProps) {
  const targetLength = correctSequence.length;
  const [slots, setSlots] = useState<(string | null)[]>(() => Array(targetLength).fill(null));
  const [usedTokenIndices, setUsedTokenIndices] = useState<Set<number>>(new Set());

  const filledCount = useMemo(() => slots.filter((s) => s !== null).length, [slots]);
  const canCheck = filledCount === targetLength;

  const handleTokenTap = (token: string, tokenIdx: number) => {
    if (usedTokenIndices.has(tokenIdx)) return;
    const nextEmpty = slots.findIndex((s) => s === null);
    if (nextEmpty === -1) return;
    const newSlots = [...slots];
    newSlots[nextEmpty] = token;
    setSlots(newSlots);
    const newUsed = new Set(usedTokenIndices);
    newUsed.add(tokenIdx);
    setUsedTokenIndices(newUsed);
  };

  const handleSlotTap = (slotIdx: number) => {
    const token = slots[slotIdx];
    if (token === null) return;
    const newSlots = [...slots];
    newSlots[slotIdx] = null;
    setSlots(newSlots);
    // Free the first usage of that token
    const tokenIdx = tokens.findIndex((t, i) => t === token && usedTokenIndices.has(i));
    if (tokenIdx >= 0) {
      const newUsed = new Set(usedTokenIndices);
      newUsed.delete(tokenIdx);
      setUsedTokenIndices(newUsed);
    }
  };

  const handleCheck = () => {
    const built = slots.filter((s): s is string => s !== null);
    const correct =
      built.length === correctSequence.length && built.every((t, i) => t === correctSequence[i]);
    onCheck({ correct, builtSentence: built, correctSentence: correctSequence });
  };

  return (
    <View style={{ ...Platform.select({ web: { userSelect: "none" } as any }) }}>
      <Text className="text-slate-900 text-lg font-bold mb-4">{promptText}</Text>

      {audioUrl && (
        <Pressable
          onPress={onPlayAudio}
          className="flex-row items-center bg-slate-100 rounded-2xl px-4 py-4 mb-6 active:opacity-80"
          style={{ ...Platform.select({ web: { cursor: "pointer" } as any }) }}
        >
          <View className="w-10 h-10 rounded-full bg-slate-900 items-center justify-center mr-3">
            <Feather name="volume-2" size={18} color="#fff" />
          </View>
          <Text className="text-slate-900 font-semibold">Play audio</Text>
        </Pressable>
      )}

      <View className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-6 min-h-[100px]">
        {filledCount === 0 ? (
          <Text className="text-slate-400 text-center my-4">
            Tap the words to build your response
          </Text>
        ) : (
          <View className="flex-row flex-wrap" style={{ gap: 8 }}>
            {slots.map((token, idx) =>
              token === null ? (
                <View
                  key={idx}
                  style={{ width: 64, height: 36 }}
                  className="border-2 border-dashed border-slate-300 rounded-lg"
                />
              ) : (
                <Pressable
                  key={idx}
                  onPress={() => handleSlotTap(idx)}
                  className="bg-white border border-slate-300 rounded-lg px-3 py-2"
                  style={{ ...Platform.select({ web: { cursor: "pointer" } as any }) }}
                >
                  <Text className="text-slate-900 font-semibold">{token}</Text>
                </Pressable>
              ),
            )}
          </View>
        )}
      </View>

      <View className="flex-row flex-wrap mb-6" style={{ gap: 10 }}>
        {tokens.map((token, idx) => {
          const used = usedTokenIndices.has(idx);
          return (
            <Pressable
              key={`${token}-${idx}`}
              onPress={() => handleTokenTap(token, idx)}
              disabled={used}
              className={`px-4 py-2 rounded-lg border ${used ? "bg-slate-100 border-slate-200" : "bg-white border-slate-300"}`}
              style={{ ...Platform.select({ web: { cursor: used ? "default" : "pointer" } as any }) }}
            >
              <Text className={`font-semibold ${used ? "text-slate-300" : "text-slate-900"}`}>
                {token}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        onPress={handleCheck}
        disabled={!canCheck}
        className={`rounded-2xl py-4 items-center ${canCheck ? "bg-slate-900" : "bg-slate-300"}`}
        style={{ ...Platform.select({ web: { cursor: canCheck ? "pointer" : "default" } as any }) }}
      >
        <Text className="text-white font-bold text-base">Check Answers</Text>
      </Pressable>
    </View>
  );
}
