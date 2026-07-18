import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Image,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSafeBack } from "@/hooks/useSafeBack";
import { usePatchProfileMutation, useGetProfileQuery } from "@/services/auth-api";
import { showAlert } from "@/utils/alert";

// Options for the Adventurer DiceBear style
const SKIN_COLORS = [
  "f8d9ce",
  "f1c27d",
  "e0ac69",
  "c89b7b",
  "8d5524",
  "c68642",
  "e8beac",
  "ffdbac",
];
const HAIR_COLORS = [
  "090806",
  "2c222b",
  "71635a",
  "b7a69e",
  "d6c4c2",
  "cab2a7",
  "9f7a68",
  "b55239",
  "e6cea8",
  "e5c8a8",
  "debc99",
  "a3a89e",
];

// Generate variants
const HAIRS = [
  ...Array.from({ length: 16 }, (_, i) => `short${String(i + 1).padStart(2, "0")}`),
  ...Array.from({ length: 19 }, (_, i) => `long${String(i + 1).padStart(2, "0")}`),
];
const EYES = Array.from({ length: 25 }, (_, i) => `variant${String(i + 2).padStart(2, "0")}`);
const MOUTHS = Array.from({ length: 30 }, (_, i) => `variant${String(i + 1).padStart(2, "0")}`);
const GLASSES = [
  "none",
  ...Array.from({ length: 5 }, (_, i) => `variant${String(i + 1).padStart(2, "0")}`),
];

type Category = "skinColor" | "hairColor" | "hair" | "eyes" | "mouth" | "glasses";

export function CustomAvatarScreen() {
  const safeBack = useSafeBack();
  const insets = useSafeAreaInsets();
  const [patch, { isLoading: isSaving }] = usePatchProfileMutation();
  const { data: profile } = useGetProfileQuery();

  const [activeCategory, setActiveCategory] = useState<Category>("hair");

  // Avatar state
  const [skinColor, setSkinColor] = useState("f1c27d");
  const [hairColor, setHairColor] = useState("090806");
  const [hair, setHair] = useState("short02");
  const [eyes, setEyes] = useState("variant02");
  const [mouth, setMouth] = useState("variant01");
  const [glasses, setGlasses] = useState("none");

  // Load existing if it is a custom avatar
  useEffect(() => {
    if (profile?.avatar_id && profile.avatar_id.startsWith("c2d?")) {
      const data = profile.avatar_id.replace("c2d?", "").split("-");
      if (data.length === 6) {
        const [s, hc, h, e, m, g] = data as [string, string, string, string, string, string];
        setSkinColor(s);
        setHairColor(hc);
        setHair(h.startsWith("s") ? h.replace("s", "short") : h.replace("l", "long"));
        setEyes(`variant${e}`);
        setMouth(`variant${m}`);
        setGlasses(g === "x" ? "none" : `variant${g}`);
      }
    } else if (profile?.avatar_id && profile.avatar_id.startsWith("c2d!")) {
      const data = profile.avatar_id.replace("c2d!", "").split("-");
      if (data.length === 6) {
        const [sIdx, hcIdx, h, e, m, g] = data as [string, string, string, string, string, string];
        setSkinColor(SKIN_COLORS[parseInt(sIdx, 36)] || "f1c27d");
        setHairColor(HAIR_COLORS[parseInt(hcIdx, 36)] || "090806");

        const hairPrefix = h.startsWith("s") ? "short" : "long";
        const hairNum = h.replace(/^[sl]/, "").padStart(2, "0");
        setHair(`${hairPrefix}${hairNum}`);

        setEyes(`variant${e.padStart(2, "0")}`);
        setMouth(`variant${m.padStart(2, "0")}`);
        setGlasses(g === "x" ? "none" : `variant${g.padStart(2, "0")}`);
      }
    }
  }, [profile]);

  // Construct URL
  const buildPreviewUrl = () => {
    let params = `skinColor=${skinColor}&hairColor=${hairColor}&hair=${hair}&eyes=${eyes}&mouth=${mouth}`;
    if (glasses !== "none") {
      params += `&glasses=${glasses}&glassesProbability=100`;
    }
    // Hardcode background to match adventurer preset style
    params += `&backgroundColor=b6e3f4,c0aede,d1d4f9&seed=user_custom`;
    return `https://api.dicebear.com/7.x/adventurer/png?${params}`;
  };

  const previewUrl = buildPreviewUrl();

  const handleSave = async () => {
    try {
      // Compress data aggressively to fit within backend string length limits
      // c2d!s-hc-h-e-m-g
      const s = SKIN_COLORS.indexOf(skinColor).toString(36);
      const hc = HAIR_COLORS.indexOf(hairColor).toString(36);
      const h = hair
        .replace("short", "s")
        .replace("long", "l")
        .replace(/^s0?/, "s")
        .replace(/^l0?/, "l");
      const e = eyes.replace("variant", "").replace(/^0/, "");
      const m = mouth.replace("variant", "").replace(/^0/, "");
      const g = glasses === "none" ? "x" : glasses.replace("variant", "").replace(/^0/, "");

      const avatarId = `c2d!${s}-${hc}-${h}-${e}-${m}-${g}`;
      await patch({ avatar_id: avatarId }).unwrap();
      safeBack();
    } catch {
      showAlert("Error", "Could not save avatar. Please try again.");
    }
  };

  const renderColorOptions = (
    options: string[],
    current: string,
    setter: (val: string) => void,
  ) => (
    <View className="flex-row flex-wrap justify-center mt-4" style={{ gap: 12 }}>
      {options.map((opt) => {
        const isSelected = current === opt;
        return (
          <Pressable
            key={opt}
            onPress={() => setter(opt)}
            className="w-14 h-14 rounded-full items-center justify-center shadow-sm"
            style={{
              backgroundColor: `#${opt}`,
              borderWidth: isSelected ? 4 : 2,
              borderColor: isSelected ? "#4f46e5" : "#e2e8f0",
              ...(Platform.OS === "web" ? ({ cursor: "pointer" } as Record<string, string>) : {}),
            }}
          >
            {isSelected && (
              <Feather
                name="check"
                size={18}
                color={["090806", "2c222b", "8d5524"].includes(opt) ? "#fff" : "#000"}
              />
            )}
          </Pressable>
        );
      })}
    </View>
  );

  const renderVariantOptions = (
    options: string[],
    current: string,
    setter: (val: string) => void,
    categoryKey: string,
  ) => (
    <View className="flex-row flex-wrap justify-center mt-4" style={{ gap: 12 }}>
      {options.map((opt) => {
        const isSelected = current === opt;

        const s = categoryKey === "skinColor" ? opt : skinColor;
        const hc = categoryKey === "hairColor" ? opt : hairColor;
        const h = categoryKey === "hair" ? opt : hair;
        const e = categoryKey === "eyes" ? opt : eyes;
        const m = categoryKey === "mouth" ? opt : mouth;
        const g = categoryKey === "glasses" ? opt : glasses;

        let optUrl = `https://api.dicebear.com/7.x/adventurer/png?skinColor=${s}&hairColor=${hc}&hair=${h}&eyes=${e}&mouth=${m}&backgroundColor=b6e3f4,c0aede,d1d4f9&seed=user_custom`;
        if (g !== "none") {
          optUrl += `&glasses=${g}&glassesProbability=100`;
        }

        return (
          <Pressable
            key={opt}
            onPress={() => setter(opt)}
            className="w-20 h-20 rounded-xl bg-slate-100 dark:bg-slate-700 items-center justify-center border-2 overflow-hidden"
            style={{
              borderColor: isSelected ? "#4f46e5" : "transparent",
              ...(Platform.OS === "web" ? ({ cursor: "pointer" } as Record<string, string>) : {}),
            }}
          >
            {opt === "none" && categoryKey !== "glasses" ? (
              <Text
                className={`font-medium text-xs ${isSelected ? "text-indigo-600 dark:text-indigo-400 font-bold" : "text-slate-600 dark:text-slate-300"}`}
              >
                None
              </Text>
            ) : (
              <Image source={{ uri: optUrl }} className="w-full h-full" resizeMode="contain" />
            )}
            {opt === "none" && categoryKey === "glasses" && (
              <View className="absolute inset-0 bg-white/60 dark:bg-black/60 items-center justify-center">
                <Text className="font-bold text-xs text-slate-800 dark:text-slate-200">None</Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );

  return (
    <View
      style={{
        flex: 1,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
      className="bg-slate-50 dark:bg-slate-900"
    >
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
        <Pressable
          onPress={() => safeBack()}
          className="w-10 h-10 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-700"
        >
          <Feather
            name="x"
            size={20}
            color={Platform.OS === "web" ? "#0f172a" : undefined}
            className="text-slate-900 dark:text-slate-50"
          />
        </Pressable>
        <Text className="flex-1 text-center font-bold text-lg text-slate-900 dark:text-slate-50">
          Custom Avatar
        </Text>
        <Pressable
          onPress={handleSave}
          disabled={isSaving}
          className={`px-4 py-2 rounded-full ${isSaving ? "bg-indigo-300" : "bg-indigo-600"}`}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text className="text-white font-bold text-sm">Save</Text>
          )}
        </Pressable>
      </View>

      {/* Avatar Preview */}
      <View className="items-center justify-center py-6 bg-white dark:bg-slate-800 shadow-sm z-10">
        <View className="w-40 h-40 rounded-full border-4 border-white dark:border-slate-700 shadow-md overflow-hidden bg-slate-100 dark:bg-slate-900">
          <Image source={{ uri: previewUrl }} className="w-full h-full" />
        </View>
      </View>

      {/* Category Tabs */}
      <View className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        >
          {[
            { id: "skinColor", label: "Skin Tone" },
            { id: "hair", label: "Hair Style" },
            { id: "hairColor", label: "Hair Color" },
            { id: "eyes", label: "Eyes" },
            { id: "mouth", label: "Mouth" },
            { id: "glasses", label: "Glasses" },
          ].map((cat) => (
            <Pressable
              key={cat.id}
              onPress={() => setActiveCategory(cat.id as Category)}
              className={`py-4 px-5 border-b-2 ${activeCategory === cat.id ? "border-indigo-600 dark:border-indigo-400" : "border-transparent"}`}
            >
              <Text
                className={`font-bold ${activeCategory === cat.id ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500 dark:text-slate-400"}`}
              >
                {cat.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Options Panel */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        {activeCategory === "skinColor" && renderColorOptions(SKIN_COLORS, skinColor, setSkinColor)}
        {activeCategory === "hairColor" && renderColorOptions(HAIR_COLORS, hairColor, setHairColor)}
        {activeCategory === "hair" && renderVariantOptions(HAIRS, hair, setHair, "hair")}
        {activeCategory === "eyes" && renderVariantOptions(EYES, eyes, setEyes, "eyes")}
        {activeCategory === "mouth" && renderVariantOptions(MOUTHS, mouth, setMouth, "mouth")}
        {activeCategory === "glasses" &&
          renderVariantOptions(GLASSES, glasses, setGlasses, "glasses")}
      </ScrollView>
    </View>
  );
}
