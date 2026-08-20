import React, { useState, useEffect } from "react";
import { Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useThemeToggle } from "@/hooks/useThemeToggle";
import type { LeaderboardScope } from "@/services/social-api";

export const COLLEGE_OPTIONS: string[] = [];
export const REGION_OPTIONS: string[] = [];

export interface FilterState {
  scope: LeaderboardScope;
  college?: string;
  region?: string;
}

interface LeaderboardFilterModalProps {
  visible: boolean;
  onClose: () => void;
  currentFilter: FilterState;
  onApply: (filter: FilterState) => void;
  userCollege?: string | null;
  userCountry?: string | null;
}

export function LeaderboardFilterModal({
  visible,
  onClose,
  currentFilter,
  onApply,
  userCollege,
  userCountry,
}: LeaderboardFilterModalProps) {
  const { isDark } = useThemeToggle();
  const [tempScope, setTempScope] = useState<LeaderboardScope>(currentFilter.scope);
  const [tempCollege, setTempCollege] = useState<string | undefined>(currentFilter.college);
  const [tempRegion, setTempRegion] = useState<string | undefined>(currentFilter.region);

  useEffect(() => {
    if (visible) {
      setTempScope(currentFilter.scope);
      setTempCollege(currentFilter.college);
      setTempRegion(currentFilter.region);
    }
  }, [visible, currentFilter]);

  const handleReset = () => {
    setTempScope("global");
    setTempCollege(undefined);
    setTempRegion(undefined);
  };

  const handleApply = () => {
    onApply({
      scope: tempScope,
      college: tempScope === "college" ? tempCollege : undefined,
      region: tempScope === "region" ? tempRegion : undefined,
    });
    onClose();
  };

  const scopeOptions: {
    key: LeaderboardScope;
    label: string;
    icon: keyof typeof Feather.glyphMap;
    subtitle: string;
  }[] = [
    { key: "global", label: "Global", icon: "globe", subtitle: "All players worldwide" },
    {
      key: "college",
      label: "College / Organisation",
      icon: "award",
      subtitle: "Players in your or selected organisation",
    },
    {
      key: "region",
      label: "Region",
      icon: "map-pin",
      subtitle: "Players in your state, country, or zone",
    },
    { key: "friends", label: "Friends", icon: "users", subtitle: "Players in your friends list" },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/50">
        <Pressable className="flex-1" onPress={onClose} />
        <View
          style={{ maxHeight: "85%" }}
          className={`rounded-t-3xl p-6 ${isDark ? "bg-[#111827] border-t border-slate-800" : "bg-white"}`}
        >
          {/* Header */}
          <View className="flex-row justify-between items-center pb-4 mb-2 border-b border-slate-200 dark:border-slate-800">
            <View className="flex-row items-center gap-2">
              <Feather name="filter" size={20} color={isDark ? "#a7f3d0" : "#059669"} />
              <Text
                className={`text-xl font-extrabold ${isDark ? "text-slate-100" : "text-slate-900"}`}
              >
                Leaderboard Filters
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              className={`p-2 rounded-full ${isDark ? "bg-slate-800" : "bg-slate-100"}`}
            >
              <Feather name="x" size={18} color={isDark ? "#94a3b8" : "#64748b"} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} className="py-2">
            {/* Scope Selection */}
            <Text
              className={`text-xs font-bold uppercase tracking-wider mb-3 ${isDark ? "text-slate-400" : "text-slate-500"}`}
            >
              1. Choose Ranking Scope
            </Text>
            <View className="gap-2 mb-6">
              {scopeOptions.map((opt) => {
                const isSelected = tempScope === opt.key;
                return (
                  <Pressable
                    key={opt.key}
                    onPress={() => {
                      setTempScope(opt.key);
                      if (opt.key === "college") {
                        setTempRegion(undefined);
                        if (!tempCollege) setTempCollege(userCollege || "");
                      } else if (opt.key === "region") {
                        setTempCollege(undefined);
                        if (!tempRegion) setTempRegion(userCountry || "");
                      } else {
                        setTempCollege(undefined);
                        setTempRegion(undefined);
                      }
                    }}
                    className={`p-3.5 rounded-2xl flex-row items-center justify-between border ${
                      isSelected
                        ? isDark
                          ? "bg-purple-950/40 border-purple-500/60"
                          : "bg-purple-50 border-purple-400"
                        : isDark
                          ? "bg-slate-900/60 border-slate-800"
                          : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <View className="flex-row items-center flex-1 pr-2">
                      <View
                        className={`w-10 h-10 rounded-xl items-center justify-center mr-3 ${
                          isSelected
                            ? isDark
                              ? "bg-purple-900/60"
                              : "bg-purple-100"
                            : isDark
                              ? "bg-slate-800"
                              : "bg-slate-200/60"
                        }`}
                      >
                        <Feather
                          name={opt.icon}
                          size={18}
                          color={isSelected ? "#9333ea" : isDark ? "#94a3b8" : "#64748b"}
                        />
                      </View>
                      <View className="flex-1">
                        <Text
                          className={`font-bold text-sm ${
                            isSelected
                              ? isDark
                                ? "text-purple-300"
                                : "text-purple-900"
                              : isDark
                                ? "text-slate-200"
                                : "text-slate-800"
                          }`}
                        >
                          {opt.label}
                        </Text>
                        <Text className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                          {opt.subtitle}
                        </Text>
                      </View>
                    </View>
                    <View
                      className={`w-5 h-5 rounded-full border items-center justify-center ${
                        isSelected
                          ? "border-purple-600 bg-purple-600"
                          : isDark
                            ? "border-slate-600"
                            : "border-slate-300"
                      }`}
                    >
                      {isSelected && <Feather name="check" size={12} color="#ffffff" />}
                    </View>
                  </Pressable>
                );
              })}
            </View>

            {/* College Input Bar (only shown when College scope is selected) */}
            {tempScope === "college" && (
              <View className="mb-6">
                <Text
                  className={`text-xs font-bold uppercase tracking-wider mb-2 ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  2. Enter College / Organisation Name
                </Text>

                <View
                  className={`flex-row items-center px-3.5 py-3 rounded-2xl border ${
                    isDark ? "bg-slate-900 border-slate-700" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <Feather name="award" size={18} color={isDark ? "#c084fc" : "#9333ea"} />
                  <TextInput
                    value={tempCollege || ""}
                    onChangeText={(text) => setTempCollege(text)}
                    placeholder="Enter college or institution name..."
                    placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
                    className={`flex-1 text-sm font-semibold ml-2.5 ${
                      isDark ? "text-slate-100" : "text-slate-800"
                    }`}
                    style={{ padding: 0 }}
                    autoCapitalize="words"
                    autoFocus
                  />
                  {tempCollege ? (
                    <Pressable onPress={() => setTempCollege("")} className="p-1">
                      <Feather name="x-circle" size={16} color={isDark ? "#94a3b8" : "#64748b"} />
                    </Pressable>
                  ) : null}
                </View>
              </View>
            )}

            {/* Region Input Bar (only shown when Region scope is selected) */}
            {tempScope === "region" && (
              <View className="mb-6">
                <Text
                  className={`text-xs font-bold uppercase tracking-wider mb-2 ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  2. Enter Region / Location Name
                </Text>

                <View
                  className={`flex-row items-center px-3.5 py-3 rounded-2xl border ${
                    isDark ? "bg-slate-900 border-slate-700" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <Feather name="map-pin" size={18} color={isDark ? "#6ee7b7" : "#059669"} />
                  <TextInput
                    value={tempRegion || ""}
                    onChangeText={(text) => setTempRegion(text)}
                    placeholder="Enter region, state, or location..."
                    placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
                    className={`flex-1 text-sm font-semibold ml-2.5 ${
                      isDark ? "text-slate-100" : "text-slate-800"
                    }`}
                    style={{ padding: 0 }}
                    autoCapitalize="words"
                    autoFocus
                  />
                  {tempRegion ? (
                    <Pressable onPress={() => setTempRegion("")} className="p-1">
                      <Feather name="x-circle" size={16} color={isDark ? "#94a3b8" : "#64748b"} />
                    </Pressable>
                  ) : null}
                </View>
              </View>
            )}
          </ScrollView>

          {/* Action Buttons */}
          <View className="flex-row gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Pressable
              onPress={handleReset}
              className={`flex-1 py-3.5 rounded-2xl items-center justify-center border ${
                isDark ? "bg-slate-800 border-slate-700" : "bg-slate-100 border-slate-200"
              }`}
            >
              <Text className={`font-bold text-sm ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                Reset
              </Text>
            </Pressable>

            <Pressable
              onPress={handleApply}
              className="flex-1 rounded-2xl overflow-hidden active:opacity-90"
            >
              <LinearGradient
                colors={["#a855f7", "#7e22ce"]}
                className="w-full py-3.5 items-center justify-center"
              >
                <Text className="text-white font-bold text-sm">Apply Filters</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
