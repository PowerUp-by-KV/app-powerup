import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";

interface Item {
  id: string;
  text: string;
}

interface VocabularyMatcherProps {
  words: Item[];
  definitions: Item[];
  onComplete: (matches: { word_id: string; definition_id: string }[]) => void;
  isChecked?: boolean;
  correctMatches?: Record<string, string>; // wordId -> defId
}

export const VocabularyMatcher: React.FC<VocabularyMatcherProps> = ({
  words,
  definitions,
  onComplete,
  isChecked = false,
  correctMatches = {},
}) => {
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>({}); // wordId -> defId

  const handleWordPress = (wordId: string) => {
    if (isChecked) return;
    setSelectedWord(wordId);
  };

  const handleDefPress = (defId: string) => {
    if (isChecked || !selectedWord) return;

    // Check if this definition is already matched elsewhere
    const existingWordId = Object.keys(matches).find((key) => matches[key] === defId);

    const newMatches = { ...matches };
    if (existingWordId) {
      delete newMatches[existingWordId];
    }

    newMatches[selectedWord] = defId;
    setMatches(newMatches);
    setSelectedWord(null);

    // Notify parent
    const result = Object.entries(newMatches).map(([w, d]) => ({ word_id: w, definition_id: d }));
    onComplete(result);
  };

  const getPairColor = (wordId: string, defId: string) => {
    if (!isChecked) {
      if (matches[wordId] === defId) return "bg-blue-100 border-blue-300";
      return "bg-white border-slate-200";
    }

    const isCorrect = correctMatches[wordId] === defId;
    return isCorrect ? "bg-emerald-50 border-emerald-300" : "bg-red-50 border-red-300";
  };

  return (
    <View className="flex-row gap-x-4">
      {/* Words Column */}
      <View className="flex-1 gap-y-3">
        {words.map((word) => {
          const isSelected = selectedWord === word.id;
          const isMatched = !!matches[word.id];
          const matchId = matches[word.id];

          return (
            <TouchableOpacity
              key={word.id}
              activeOpacity={0.7}
              onPress={() => handleWordPress(word.id)}
              className={`p-4 rounded-xl border-2 ${
                isSelected
                  ? "border-slate-800 bg-slate-50"
                  : isMatched
                    ? getPairColor(word.id, matchId!)
                    : "bg-white border-slate-100"
              }`}
            >
              <Text
                className={`text-sm font-bold ${isMatched && isChecked ? "text-slate-800" : "text-[#1E293B]"}`}
              >
                {word.text}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Definitions Column */}
      <View className="flex-1 gap-y-3">
        {definitions.map((def) => {
          const wordId = Object.keys(matches).find((w) => matches[w] === def.id);
          const isMatched = !!wordId;

          return (
            <TouchableOpacity
              key={def.id}
              activeOpacity={0.7}
              onPress={() => handleDefPress(def.id)}
              className={`p-4 rounded-xl border-2 min-h-[60px] justify-center ${
                isMatched ? getPairColor(wordId!, def.id) : "bg-white border-slate-100"
              }`}
            >
              <Text
                className={`text-[12px] font-medium leading-tight ${isMatched && isChecked ? "text-slate-700" : "text-slate-500"}`}
              >
                {def.text}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};
