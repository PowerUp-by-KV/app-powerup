import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSafeBack } from "@/hooks/useSafeBack";
import { usePatchProfileMutation, useGetProfileQuery } from "@/services/auth-api";

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
    }
  }, [profile]);

  // Construct URL
  const buildPreviewUrl = () => {
    const params = new URLSearchParams();
    params.append("skinColor", skinColor);
    params.append("hairColor", hairColor);
    params.append("hair", hair);
    params.append("eyes", eyes);
    params.append("mouth", mouth);
    if (glasses !== "none") {
      params.append("glasses", glasses);
      params.append("glassesProbability", "100");
    }
    // Hardcode background to match adventurer preset style
    params.append("backgroundColor", "b6e3f4,c0aede,d1d4f9");
    params.append("seed", "user_custom");
    return `https://api.dicebear.com/7.x/adventurer/png?${params.toString()}`;
  };

  const previewUrl = buildPreviewUrl();

  const handleSave = async () => {
    try {
      // Compress data to fit within backend string length limits
      const h = hair.replace("short", "s").replace("long", "l");
      const e = eyes.replace("variant", "");
      const m = mouth.replace("variant", "");
      const g = glasses === "none" ? "x" : glasses.replace("variant", "");

      const avatarId = `c2d?${skinColor}-${hairColor}-${h}-${e}-${m}-${g}`;
      await patch({ avatar_id: avatarId }).unwrap();
      safeBack();
    } catch {
      Alert.alert("Error", "Could not save avatar. Please try again.");
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
              ...(Platform.OS === "web" ? ({ cursor: "pointer" } as Record<string, unknown>) : {}),
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
            className="w-20 h-20 rounded-xl bg-slate-100 items-center justify-center border-2 overflow-hidden"
            style={{
              borderColor: isSelected ? "#4f46e5" : "transparent",
              ...(Platform.OS === "web" ? ({ cursor: "pointer" } as Record<string, unknown>) : {}),
            }}
          >
            {opt === "none" && categoryKey !== "glasses" ? (
              <Text
                className={`font-medium text-xs ${isSelected ? "text-indigo-600 font-bold" : "text-slate-600"}`}
              >
                None
              </Text>
            ) : (
              <Image source={{ uri: optUrl }} className="w-full h-full" resizeMode="contain" />
            )}
            {opt === "none" && categoryKey === "glasses" && (
              <View className="absolute inset-0 bg-white/60 items-center justify-center">
                <Text className="font-bold text-xs text-slate-800">None</Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );

  return (
    <View style={{ flex: 1, paddingTop: insets.top }} className="bg-slate-50">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 bg-white border-b border-slate-100">
        <Pressable
          onPress={() => safeBack()}
          className="w-10 h-10 items-center justify-center rounded-full bg-slate-50"
        >
          <Feather name="x" size={20} color="#0f172a" />
        </Pressable>
        <Text className="flex-1 text-center font-bold text-lg text-slate-900">Custom Avatar</Text>
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
      <View className="items-center justify-center py-6 bg-white shadow-sm z-10">
        <View className="w-40 h-40 rounded-full border-4 border-white shadow-md overflow-hidden bg-slate-100">
          <Image source={{ uri: previewUrl }} className="w-full h-full" />
        </View>
      </View>

      {/* Category Tabs */}
      <View className="bg-white border-b border-slate-200">
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
              className={`py-4 px-5 border-b-2 ${activeCategory === cat.id ? "border-indigo-600" : "border-transparent"}`}
            >
              <Text
                className={`font-bold ${activeCategory === cat.id ? "text-indigo-600" : "text-slate-500"}`}
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
