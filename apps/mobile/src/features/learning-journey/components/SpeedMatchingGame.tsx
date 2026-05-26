import React, { useEffect, useMemo, useState } from "react";
import { Animated, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import type { ActivityQuestion } from "@powerup/shared";

interface SpeedMatchingGameProps {
  questions: ActivityQuestion[];
  onComplete: (result: { passed: boolean; score: number }) => void;
}

// Fisher-Yates shuffle helper
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}

export function SpeedMatchingGame({ questions, onComplete }: SpeedMatchingGameProps) {
  const speedQuestion = useMemo(
    () => questions.find((q) => q.question_type === "speed_matching") || questions[0],
    [questions]
  );

  const leftItems = useMemo(
    () => speedQuestion?.content?.left_items || [],
    [speedQuestion]
  );

  const correctMatches = useMemo(
    () => speedQuestion?.evaluation?.matches || {},
    [speedQuestion]
  );

  // Shuffle right items once on load
  const rightItemsShuffled = useMemo(() => {
    const items = speedQuestion?.content?.right_items || [];
    return shuffleArray(items);
  }, [speedQuestion]);

  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  
  const [matchedLefts, setMatchedLefts] = useState<Set<string>>(new Set());
  const [matchedRights, setMatchedRights] = useState<Set<string>>(new Set());
  
  const [wrongLeft, setWrongLeft] = useState<string | null>(null);
  const [wrongRight, setWrongRight] = useState<string | null>(null);
  
  const [timeLeft, setTimeLeft] = useState(90); // 90 seconds timer
  const [isGameOver, setIsGameOver] = useState(false);
  const [hasWon, setHasWon] = useState(false);

  // Timer logic
  useEffect(() => {
    if (isGameOver) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleGameOver(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isGameOver]);

  // Handle game end state
  const handleGameOver = (won: boolean) => {
    setIsGameOver(true);
    setHasWon(won);
  };

  // Check match when both sides are selected
  useEffect(() => {
    if (selectedLeft && selectedRight) {
      const isCorrect = correctMatches[selectedLeft] === selectedRight;
      
      if (isCorrect) {
        // Success match
        const newMatchedLefts = new Set(matchedLefts).add(selectedLeft);
        const newMatchedRights = new Set(matchedRights).add(selectedRight);
        
        setMatchedLefts(newMatchedLefts);
        setMatchedRights(newMatchedRights);
        
        setSelectedLeft(null);
        setSelectedRight(null);

        // Check if all left items are matched
        if (newMatchedLefts.size >= leftItems.length && leftItems.length > 0) {
          handleGameOver(true);
        }
      } else {
        // Mismatch
        setWrongLeft(selectedLeft);
        setWrongRight(selectedRight);
        
        const tempLeft = selectedLeft;
        const tempRight = selectedRight;
        
        setSelectedLeft(null);
        setSelectedRight(null);
        
        setTimeout(() => {
          setWrongLeft((prev) => (prev === tempLeft ? null : prev));
          setWrongRight((prev) => (prev === tempRight ? null : prev));
        }, 1000);
      }
    }
  }, [selectedLeft, selectedRight, correctMatches, matchedLefts, matchedRights, leftItems]);

  const progressPercentage = (timeLeft / 90) * 100;
  const progressColor = timeLeft > 45 ? "bg-emerald-500" : timeLeft > 20 ? "bg-amber-500" : "bg-rose-500";

  const totalPairs = leftItems.length;
  const matchedPairsCount = matchedLefts.size;
  const currentScore = totalPairs > 0 ? Math.round((matchedPairsCount / totalPairs) * 100) : 0;

  if (isGameOver) {
    const passed = hasWon || currentScore >= 70;
    return (
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 24, paddingBottom: 120, alignItems: "center", justifyContent: "center" }}
      >
        <View style={{ alignItems: "center", marginVertical: 32 }}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: passed ? "#dcfce7" : "#fee2e2",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 20,
            }}
          >
            <Feather
              name={passed ? "check-circle" : "alert-circle"}
              size={40}
              color={passed ? "#10b981" : "#ef4444"}
            />
          </View>
          
          <Text className="text-slate-500 text-xs uppercase tracking-wider font-bold mb-1">
            Matching Completion
          </Text>
          <Text
            style={{
              fontSize: 64,
              fontWeight: "900",
              color: passed ? "#10b981" : "#ef4444",
              lineHeight: 72,
            }}
          >
            {currentScore}%
          </Text>
          
          <Text className="text-slate-900 text-xl font-bold mt-4 text-center">
            {passed ? "Brilliant Job!" : "Keep Practicing!"}
          </Text>
          <Text className="text-slate-500 text-sm mt-2 text-center px-4">
            {passed
              ? `You successfully matched ${matchedPairsCount} of ${totalPairs} vocabulary pairs.`
              : `You matched ${matchedPairsCount} of ${totalPairs} pairs. You need 70% to pass.`}
          </Text>
        </View>

        <Pressable
          onPress={() => onComplete({ passed, score: currentScore })}
          className="w-full max-w-sm mt-8 bg-slate-900 py-4 rounded-2xl items-center active:opacity-90"
          style={{ ...Platform.select({ web: { cursor: "pointer" } as any }) }}
        >
          <Text className="text-white font-bold text-base">Continue</Text>
        </Pressable>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, ...Platform.select({ web: { userSelect: "none" } as any }) }}
      contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
    >
      {/* Gamified Header */}
      <View className="mb-6">
        <Text className="text-slate-900 text-2xl font-black mb-1">Speed Matcher</Text>
        <Text className="text-slate-500 text-sm mb-4">
          Match the action verbs with their definitions before the timer runs out!
        </Text>
        
        {/* Timer Bar */}
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center">
            <Feather name="clock" size={16} color={timeLeft > 20 ? "#64748b" : "#ef4444"} />
            <Text className={`font-bold ml-1.5 ${timeLeft > 20 ? "text-slate-600" : "text-rose-500"}`}>
              {timeLeft}s remaining
            </Text>
          </View>
          <Text className="text-slate-500 font-semibold text-xs">
            {matchedPairsCount}/{totalPairs} Matched
          </Text>
        </View>
        <View className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
          <View
            className={`h-full rounded-full transition-all duration-300 ${progressColor}`}
            style={{ width: `${progressPercentage}%` }}
          />
        </View>
      </View>

      {/* Grid Match Section */}
      <View className="flex-row justify-between" style={{ gap: 16 }}>
        {/* Vocabulary Column */}
        <View className="flex-1" style={{ gap: 12 }}>
          <Text className="text-xs font-bold uppercase tracking-wider text-indigo-500 mb-1">Verbs</Text>
          {leftItems.map((word) => {
            const isMatched = matchedLefts.has(word);
            const isSelected = selectedLeft === word;
            const isWrong = wrongLeft === word;
            
            let bgStyle = "bg-white border-slate-200";
            let textStyle = "text-slate-900";
            
            if (isMatched) {
              bgStyle = "bg-emerald-50 border-emerald-200 opacity-60";
              textStyle = "text-emerald-700 line-through";
            } else if (isWrong) {
              bgStyle = "bg-rose-100 border-rose-400";
              textStyle = "text-rose-700";
            } else if (isSelected) {
              bgStyle = "bg-indigo-50 border-indigo-500 shadow-sm shadow-indigo-100";
              textStyle = "text-indigo-900";
            }

            return (
              <Pressable
                key={word}
                disabled={isMatched}
                onPress={() => setSelectedLeft(word)}
                className={`p-4 rounded-2xl border-2 min-h-[72px] items-center justify-center ${bgStyle}`}
                style={{
                  ...Platform.select({ web: { cursor: isMatched ? "default" : "pointer" } as any }),
                }}
              >
                <Text className={`font-bold text-center text-base ${textStyle}`}>{word}</Text>
                {isMatched && (
                  <View className="absolute right-3 top-3">
                    <Feather name="check" size={14} color="#10b981" />
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        {/* Definitions Column */}
        <View className="flex-[1.5]" style={{ gap: 12 }}>
          <Text className="text-xs font-bold uppercase tracking-wider text-purple-500 mb-1">Definitions</Text>
          {rightItemsShuffled.map((definition) => {
            const isMatched = matchedRights.has(definition);
            const isSelected = selectedRight === definition;
            const isWrong = wrongRight === definition;
            
            let bgStyle = "bg-white border-slate-200";
            let textStyle = "text-slate-900";
            
            if (isMatched) {
              bgStyle = "bg-emerald-50 border-emerald-200 opacity-60";
              textStyle = "text-emerald-700 line-through font-normal";
            } else if (isWrong) {
              bgStyle = "bg-rose-100 border-rose-400";
              textStyle = "text-rose-700";
            } else if (isSelected) {
              bgStyle = "bg-purple-50 border-purple-500 shadow-sm shadow-purple-100";
              textStyle = "text-purple-900";
            }

            return (
              <Pressable
                key={definition}
                disabled={isMatched}
                onPress={() => setSelectedRight(definition)}
                className={`p-3 rounded-2xl border-2 min-h-[72px] justify-center ${bgStyle}`}
                style={{
                  ...Platform.select({ web: { cursor: isMatched ? "default" : "pointer" } as any }),
                }}
              >
                <Text className={`font-semibold text-xs leading-4 ${textStyle}`}>{definition}</Text>
                {isMatched && (
                  <View className="absolute right-2.5 top-2.5">
                    <Feather name="check" size={12} color="#10b981" />
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}
