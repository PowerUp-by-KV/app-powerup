import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeBack } from "@/hooks/useSafeBack";
import { usePatchProfileMutation, useGetProfileQuery } from "@/services/auth-api";

// Dynamically check OS to prevent packaging native WebView on Web builds
const WebView = Platform.OS !== "web" ? require("react-native-webview").WebView : null;

// Curated options for local customizer
const SKIN_TONES = [
  { label: "Peach", value: "ffdfd3", hex: "#ffdfd3" },
  { label: "Warm Gold", value: "f8d25c", hex: "#f8d25c" },
  { label: "Caramel", value: "e1aa5a", hex: "#e1aa5a" },
  { label: "Natural Tan", value: "f1c27d", hex: "#f1c27d" },
  { label: "Bronze", value: "b98236", hex: "#b98236" },
  { label: "Cocoa", value: "82531e", hex: "#82531e" },
];

const HAIR_STYLES = [
  { label: "Crop Cut", value: "short01" },
  { label: "Crew Cut", value: "short03" },
  { label: "Slick Back", value: "short02" },
  { label: "Flowing Locks", value: "long01" },
  { label: "Pigtails", value: "long02" },
  { label: "Sleek Bob", value: "long03" },
  { label: "Curly Bob", value: "curly" },
  { label: "Afro", value: "afro" },
];

const HAIR_COLORS = [
  { label: "Obsidian Black", value: "2c1b18", hex: "#2c1b18" },
  { label: "Walnut Brown", value: "6a4e3b", hex: "#6a4e3b" },
  { label: "Honey Blonde", value: "eed685", hex: "#eed685" },
  { label: "Crimson Red", value: "b15124", hex: "#b15124" },
  { label: "Silver Grey", value: "929292", hex: "#929292" },
  { label: "Indigo Blue", value: "3b82f6", hex: "#3b82f6" },
];

const ACCESSORIES = [
  { label: "None", value: "none" },
  { label: "Classic Glasses", value: "glasses" },
  { label: "Round Glasses", value: "glasses5" },
  { label: "Sunglasses", value: "sunglasses" },
];

const CLOTHING_COLORS = [
  { label: "Indigo Breeze", value: "3b82f6", hex: "#3b82f6" },
  { label: "Forest Emerald", value: "10b981", hex: "#10b981" },
  { label: "Rose Petal", value: "f43f5e", hex: "#f43f5e" },
  { label: "Slate Shadow", value: "475569", hex: "#475569" },
  { label: "Sunset Amber", value: "f59e0b", hex: "#f59e0b" },
];

const BACKGROUND_GRADIENTS = [
  { label: "Dreamy Ice", value: "b6e3f4,c0aede", colors: ["#b6e3f4", "#c0aede"] },
  { label: "Warm Sunset", value: "ffdfd3,fec8d8", colors: ["#ffdfd3", "#fec8d8"] },
  { label: "Lilac Dream", value: "d1d4f9,c0aede", colors: ["#d1d4f9", "#c0aede"] },
  { label: "Fresh Meadow", value: "d4fc79,96e6a1", colors: ["#d4fc79", "#96e6a1"] },
];

type Category = "skin" | "hair" | "hairColor" | "accessories" | "clothing" | "background";

// Local Three.js HTML Engine String
const threeHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <style>
    body { margin: 0; padding: 0; overflow: hidden; background: transparent; }
    canvas { width: 100vw; height: 100vh; display: block; }
  </style>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
</head>
<body>
  <script>
    // 3D Scene Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    document.body.appendChild(renderer.domElement);

    // Warm & Vibrant Lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);
    
    const keyLight = new THREE.DirectionalLight(0xffffff, 0.8);
    keyLight.position.set(5, 8, 5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xdbeafe, 0.4);
    fillLight.position.set(-5, 3, 2);
    scene.add(fillLight);

    // Character Group
    const avatarGroup = new THREE.Group();
    avatarGroup.position.y = -0.3;
    scene.add(avatarGroup);

    // Shared Materials
    const skinMaterial = new THREE.MeshStandardMaterial({ color: 0xffdfd3, roughness: 0.55 });
    const hairMaterial = new THREE.MeshStandardMaterial({ color: 0x2c1b18, roughness: 0.75 });
    const clothingMaterial = new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.5 });
    const whiteMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const blackMaterial = new THREE.MeshBasicMaterial({ color: 0x0f172a });
    const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3 });
    const lensMaterial = new THREE.MeshPhysicalMaterial({ 
      color: 0x38bdf8, 
      transparent: true, 
      opacity: 0.4, 
      roughness: 0.1,
      transmission: 0.9 
    });

    // 1. Head Sphere
    const headGeom = new THREE.SphereGeometry(0.72, 32, 32);
    const headMesh = new THREE.Mesh(headGeom, skinMaterial);
    headMesh.position.y = 1.25;
    avatarGroup.add(headMesh);

    // 2. Eyes
    const eyeGeom = new THREE.SphereGeometry(0.1, 16, 16);
    const leftEye = new THREE.Mesh(eyeGeom, whiteMaterial);
    leftEye.position.set(-0.22, 1.3, 0.58);
    avatarGroup.add(leftEye);

    const rightEye = leftEye.clone();
    rightEye.position.x = 0.22;
    avatarGroup.add(rightEye);

    // Pupils
    const pupilGeom = new THREE.SphereGeometry(0.05, 16, 16);
    const leftPupil = new THREE.Mesh(pupilGeom, blackMaterial);
    leftPupil.position.set(-0.22, 1.3, 0.66);
    avatarGroup.add(leftPupil);

    const rightPupil = leftPupil.clone();
    rightPupil.position.x = 0.22;
    avatarGroup.add(rightPupil);

    // 3. Torso Body
    const torsoGeom = new THREE.CylinderGeometry(0.42, 0.6, 1.0, 32);
    const torsoMesh = new THREE.Mesh(torsoGeom, clothingMaterial);
    torsoMesh.position.y = 0.25;
    avatarGroup.add(torsoMesh);

    // Neck
    const neckGeom = new THREE.CylinderGeometry(0.18, 0.2, 0.25, 16);
    const neckMesh = new THREE.Mesh(neckGeom, skinMaterial);
    neckMesh.position.y = 0.8;
    avatarGroup.add(neckMesh);

    // 4. Hair Styles Group
    const hairGroup = new THREE.Group();
    avatarGroup.add(hairGroup);

    function buildHair(style, colorHex) {
      while(hairGroup.children.length > 0) { hairGroup.remove(hairGroup.children[0]); }
      hairMaterial.color.set(colorHex);

      const colorInt = parseInt(colorHex.replace("#", "0x"));

      if (style === "short01") {
        // Crop Cut
        const capG = new THREE.SphereGeometry(0.74, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
        const cap = new THREE.Mesh(capG, hairMaterial);
        cap.position.set(0, 1.3, 0);
        cap.rotation.x = -0.15;
        hairGroup.add(cap);
      } else if (style === "short02") {
        // Slick Back
        const capG = new THREE.SphereGeometry(0.74, 32, 32);
        const cap = new THREE.Mesh(capG, hairMaterial);
        cap.position.set(0, 1.3, -0.05);
        cap.scale.set(1.02, 1.02, 1.08);
        hairGroup.add(cap);
      } else if (style === "afro") {
        // Afro bubbles cloud
        const baseG = new THREE.SphereGeometry(0.74, 32, 32);
        const base = new THREE.Mesh(baseG, hairMaterial);
        base.position.set(0, 1.32, 0);
        hairGroup.add(base);

        for(let i = 0; i < 10; i++) {
          const sg = new THREE.SphereGeometry(0.3, 16, 16);
          const sm = new THREE.Mesh(sg, hairMaterial);
          const angle = (i / 10) * Math.PI * 2;
          sm.position.set(
            Math.cos(angle) * 0.58, 
            1.48 + Math.sin(angle) * 0.15, 
            Math.sin(angle) * 0.58
          );
          hairGroup.add(sm);
        }
      } else if (style === "long01") {
        // Flowing Locks
        const capG = new THREE.SphereGeometry(0.74, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
        const cap = new THREE.Mesh(capG, hairMaterial);
        cap.position.set(0, 1.3, 0);
        hairGroup.add(cap);

        const strandG = new THREE.CylinderGeometry(0.12, 0.08, 0.75, 16);
        const leftStrand = new THREE.Mesh(strandG, hairMaterial);
        leftStrand.position.set(-0.55, 0.85, 0.2);
        leftStrand.rotation.z = 0.15;
        hairGroup.add(leftStrand);

        const rightStrand = leftStrand.clone();
        rightStrand.position.x = 0.55;
        rightStrand.rotation.z = -0.15;
        hairGroup.add(rightStrand);
      } else {
        // Fallback Cap Hair
        const capG = new THREE.SphereGeometry(0.74, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
        const cap = new THREE.Mesh(capG, hairMaterial);
        cap.position.set(0, 1.3, 0);
        hairGroup.add(cap);
      }
    }

    // 5. Glasses / Accessories Group
    const glassesGroup = new THREE.Group();
    avatarGroup.add(glassesGroup);

    function buildGlasses(style) {
      while(glassesGroup.children.length > 0) { glassesGroup.remove(glassesGroup.children[0]); }
      if (style === "none") return;

      const frameGeom = new THREE.BoxGeometry(0.24, 0.16, 0.04);
      const bridgeGeom = new THREE.BoxGeometry(0.18, 0.04, 0.04);

      if (style === "sunglasses") {
        frameMaterial.color.set(0x0f172a);
        lensMaterial.color.set(0x1e293b);
        lensMaterial.opacity = 0.95;
      } else {
        frameMaterial.color.set(0x1e293b);
        lensMaterial.color.set(0x38bdf8);
        lensMaterial.opacity = 0.45;
      }

      // Left Ring Frame
      const leftFrame = new THREE.Mesh(frameGeom, frameMaterial);
      leftFrame.position.set(-0.22, 1.3, 0.65);
      glassesGroup.add(leftFrame);

      const leftLens = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.11, 0.02), lensMaterial);
      leftLens.position.set(-0.22, 1.3, 0.66);
      glassesGroup.add(leftLens);

      // Right Ring Frame
      const rightFrame = leftFrame.clone();
      rightFrame.position.x = 0.22;
      glassesGroup.add(rightFrame);

      const rightLens = leftLens.clone();
      rightLens.position.x = 0.22;
      glassesGroup.add(rightLens);

      // Connector Bridge
      const bridge = new THREE.Mesh(bridgeGeom, frameMaterial);
      bridge.position.set(0, 1.3, 0.65);
      glassesGroup.add(bridge);
    }

    // Standard Setup
    camera.position.set(0, 0.9, 3.4);
    camera.lookAt(0, 0.72, 0);

    // Initial builds
    buildHair("short01", "#2c1b18");
    buildGlasses("none");

    // Touch Horizontal rotation
    let isDragging = false;
    let previousMousePosition = { x: 0 };

    window.addEventListener('mousedown', () => { isDragging = true; });
    window.addEventListener('mousemove', (e) => {
      const deltaMove = e.offsetX - previousMousePosition.x;
      if (isDragging) {
        avatarGroup.rotation.y += deltaMove * 0.012;
      }
      previousMousePosition = { x: e.offsetX };
    });
    window.addEventListener('mouseup', () => { isDragging = false; });

    // Touch bindings for mobile devices
    window.addEventListener('touchstart', (e) => {
      isDragging = true;
      previousMousePosition = { x: e.touches[0].clientX };
    });
    window.addEventListener('touchmove', (e) => {
      if (isDragging) {
        const deltaMove = e.touches[0].clientX - previousMousePosition.x;
        avatarGroup.rotation.y += deltaMove * 0.012;
        previousMousePosition = { x: e.touches[0].clientX };
      }
    });
    window.addEventListener('touchend', () => { isDragging = false; });

    // Rendering loop
    function animate() {
      requestAnimationFrame(animate);
      if (!isDragging) {
        avatarGroup.rotation.y += 0.005; // Soft ambient spin
      }
      renderer.render(scene, camera);
    }
    animate();

    // Bi-directional state callback
    window.updateAvatar = function(config) {
      if (config.skinColor) skinMaterial.color.set(config.skinColor);
      if (config.clothingColor) clothingMaterial.color.set(config.clothingColor);
      if (config.hair || config.hairColor) {
        buildHair(config.hair, config.hairColor);
      }
      if (config.accessories) {
        buildGlasses(config.accessories);
      }
    };

    // React Native Web iframe handler
    window.addEventListener("message", (event) => {
      if (event.data && event.data.type === "update") {
        window.updateAvatar(event.data.config);
      }
    });
  </script>
</body>
</html>
`;

export function ReadyPlayerMe() {
  const safeBack = useSafeBack();
  const { data: profile } = useGetProfileQuery();
  const [patchProfile, { isLoading: isSaving }] = usePatchProfileMutation();

  const webViewRef = useRef<any>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [isLoading, setIsLoading] = useState(true);

  // Parse existing custom avatar state if user previously saved one
  const initialSettings = useMemo(() => {
    const defaults = {
      skin: "ffdfd3",
      hair: "short01",
      hairColor: "2c1b18",
      accessories: "none",
      clothing: "3b82f6",
      background: "b6e3f4,c0aede",
    };

    if (profile?.avatar_id && profile.avatar_id.startsWith("rpm_custom?")) {
      const query = profile.avatar_id.replace("rpm_custom?", "");
      const params = new URLSearchParams(query);
      return {
        skin: params.get("skinColor") || defaults.skin,
        hair: params.get("hair") || defaults.hair,
        hairColor: params.get("hairColor") || defaults.hairColor,
        accessories: params.get("accessories") || defaults.accessories,
        clothing: params.get("clothingColor") || defaults.clothing,
        background: params.get("backgroundColor") || defaults.background,
      };
    }
    return defaults;
  }, [profile]);

  // Real-time customizer state variables
  const [skin, setSkin] = useState(initialSettings.skin);
  const [hair, setHair] = useState(initialSettings.hair);
  const [hairColor, setHairColor] = useState(initialSettings.hairColor);
  const [accessories, setAccessories] = useState(initialSettings.accessories);
  const [clothing, setClothing] = useState(initialSettings.clothing);
  const [background, setBackground] = useState(initialSettings.background);

  const [activeCategory, setActiveCategory] = useState<Category>("skin");

  // Synchronize state variables when asynchronously loaded profile initialSettings changes
  useEffect(() => {
    setSkin(initialSettings.skin);
    setHair(initialSettings.hair);
    setHairColor(initialSettings.hairColor);
    setAccessories(initialSettings.accessories);
    setClothing(initialSettings.clothing);
    setBackground(initialSettings.background);
  }, [initialSettings]);

  // Construct query string to store in profile DB
  const currentAvatarId = `rpm_custom?skinColor=${skin}&hair=${hair}&hairColor=${hairColor}&accessories=${accessories}&clothingColor=${clothing}&backgroundColor=${background}`;

  // Helper to push configuration updates into WebGL 3D Canvas
  const update3DCanvas = () => {
    const config = {
      skinColor: skin.startsWith("#") ? skin : `#${skin}`,
      clothingColor: clothing.startsWith("#") ? clothing : `#${clothing}`,
      hair: hair,
      hairColor: hairColor.startsWith("#") ? hairColor : `#${hairColor}`,
      accessories: accessories,
    };

    if (Platform.OS === "web") {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage({ type: "update", config }, "*");
      }
    } else {
      if (webViewRef.current) {
        webViewRef.current.injectJavaScript(`window.updateAvatar(${JSON.stringify(config)});`);
      }
    }
  };

  // Push updates to 3D scene whenever parameters change
  useEffect(() => {
    update3DCanvas();
  }, [skin, hair, hairColor, accessories, clothing]);

  const handleSave = async () => {
    try {
      await patchProfile({ avatar_id: currentAvatarId }).unwrap();
      Alert.alert("Success", "Your customized 3D Avatar has been saved!");
      safeBack();
    } catch {
      Alert.alert("Save Failed", "Could not save your new 3D Avatar.");
    }
  };

  const categories: { key: Category; label: string; icon: string }[] = [
    { key: "skin", label: "Skin", icon: "🎨" },
    { key: "hair", label: "Hair Style", icon: "💇‍♂️" },
    { key: "hairColor", label: "Hair Color", icon: "💈" },
    { key: "accessories", label: "Glasses", icon: "👓" },
    { key: "clothing", label: "Clothing", icon: "👕" },
    { key: "background", label: "Background", icon: "🌈" },
  ];

  // Pick dynamic background styles for visual gradient backing
  const activeGradient = useMemo(() => {
    const match = BACKGROUND_GRADIENTS.find((item) => item.value === background);
    return match ? match.colors : ["#b6e3f4", "#c0aede"];
  }, [background]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header Bar */}
      <View className="flex-row items-center px-4 py-3 border-b border-slate-100 bg-white shadow-sm z-10">
        <Pressable
          onPress={() => safeBack()}
          className="w-9 h-9 items-center justify-center rounded-full active:bg-slate-100"
        >
          <Feather name="x" size={22} color="#0f172a" />
        </Pressable>
        <Text className="flex-1 text-center font-bold text-slate-900 text-base">
          Customize 3D Avatar
        </Text>
        <View className="w-9" />
      </View>

      {/* 3D WebGL Viewport Container */}
      <View className="flex-1 relative justify-center items-center">
        {/* Soft Focused Gradient Backdrop mapping user customization */}
        <View
          className="absolute inset-0 opacity-80"
          style={{
            backgroundColor: activeGradient[0],
            shadowColor: activeGradient[1],
          }}
        />

        {/* Real 3D Renderer Canvas Frame */}
        <View className="w-full h-full relative z-20">
          {Platform.OS === "web" ? (
            <iframe
              ref={iframeRef}
              srcDoc={threeHtml}
              style={{ width: "100%", height: "100%", border: "none" }}
              onLoad={() => {
                setIsLoading(false);
                setTimeout(update3DCanvas, 150);
              }}
            />
          ) : (
            WebView && (
              <WebView
                ref={webViewRef}
                source={{ html: threeHtml }}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                originWhitelist={["*"]}
                onLoadEnd={() => {
                  setIsLoading(false);
                  setTimeout(update3DCanvas, 150);
                }}
                style={{ flex: 1, backgroundColor: "transparent" }}
              />
            )
          )}
        </View>

        {/* Loading Spinner overlay */}
        {isLoading && (
          <View className="absolute inset-0 items-center justify-center bg-slate-50/95 z-30">
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text className="text-slate-500 font-semibold mt-3 text-xs">Loading 3D Canvas...</Text>
          </View>
        )}
      </View>

      {/* Categories Horizontal Tabs */}
      <View className="border-t border-slate-100 py-3 bg-white">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        >
          {categories.map((cat) => {
            const isActive = activeCategory === cat.key;
            return (
              <Pressable
                key={cat.key}
                onPress={() => setActiveCategory(cat.key)}
                className={`px-4 py-2 rounded-full flex-row items-center border ${
                  isActive ? "bg-slate-900 border-slate-900" : "bg-slate-50 border-slate-100"
                }`}
                style={{ gap: 6 }}
              >
                <Text className="text-sm">{cat.icon}</Text>
                <Text className={`text-xs font-bold ${isActive ? "text-white" : "text-slate-600"}`}>
                  {cat.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Categories Selections Drawer */}
      <View className="h-44 bg-white border-t border-slate-50">
        <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
          {activeCategory === "skin" && (
            <View className="flex-row flex-wrap justify-start" style={{ gap: 10 }}>
              {SKIN_TONES.map((item) => {
                const isSel = skin === item.value;
                return (
                  <Pressable
                    key={item.value}
                    onPress={() => setSkin(item.value)}
                    className="w-16 p-1.5 items-center justify-center rounded-xl bg-slate-50"
                    style={{ borderWidth: isSel ? 2 : 0, borderColor: "#3b82f6" }}
                  >
                    <View
                      className="w-8 h-8 rounded-full border border-slate-200 shadow-sm"
                      style={{ backgroundColor: item.hex }}
                    />
                    <Text className="text-[9px] text-slate-500 font-bold mt-1 text-center">
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}

          {activeCategory === "hair" && (
            <View className="flex-row flex-wrap justify-start" style={{ gap: 10 }}>
              {HAIR_STYLES.map((item) => {
                const isSel = hair === item.value;
                return (
                  <Pressable
                    key={item.value}
                    onPress={() => setHair(item.value)}
                    className={`px-3 py-2.5 rounded-xl border ${
                      isSel
                        ? "bg-slate-900 border-slate-900 text-white"
                        : "bg-slate-50 border-slate-100"
                    }`}
                  >
                    <Text
                      className={`text-[11px] font-bold ${isSel ? "text-white" : "text-slate-700"}`}
                    >
                      💇‍♂️ {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}

          {activeCategory === "hairColor" && (
            <View className="flex-row flex-wrap justify-start" style={{ gap: 10 }}>
              {HAIR_COLORS.map((item) => {
                const isSel = hairColor === item.value;
                return (
                  <Pressable
                    key={item.value}
                    onPress={() => setHairColor(item.value)}
                    className="w-16 p-1.5 items-center justify-center rounded-xl bg-slate-50"
                    style={{ borderWidth: isSel ? 2 : 0, borderColor: "#3b82f6" }}
                  >
                    <View
                      className="w-8 h-8 rounded-full border border-slate-200 shadow-sm"
                      style={{ backgroundColor: item.hex }}
                    />
                    <Text className="text-[9px] text-slate-500 font-bold mt-1 text-center">
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}

          {activeCategory === "accessories" && (
            <View className="flex-row flex-wrap justify-start" style={{ gap: 10 }}>
              {ACCESSORIES.map((item) => {
                const isSel = accessories === item.value;
                return (
                  <Pressable
                    key={item.value}
                    onPress={() => setAccessories(item.value)}
                    className={`px-3 py-2.5 rounded-xl border ${
                      isSel ? "bg-slate-900 border-slate-900" : "bg-slate-50 border-slate-100"
                    }`}
                    style={{
                      borderWidth: isSel ? 2 : 1,
                      borderColor: isSel ? "#3b82f6" : "#f1f5f9",
                    }}
                  >
                    <Text
                      className={`text-[11px] font-bold ${isSel ? "text-white" : "text-slate-700"}`}
                    >
                      👓 {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}

          {activeCategory === "clothing" && (
            <View className="flex-row flex-wrap justify-start" style={{ gap: 10 }}>
              {CLOTHING_COLORS.map((item) => {
                const isSel = clothing === item.value;
                return (
                  <Pressable
                    key={item.value}
                    onPress={() => setClothing(item.value)}
                    className="w-16 p-1.5 items-center justify-center rounded-xl bg-slate-50"
                    style={{ borderWidth: isSel ? 2 : 0, borderColor: "#3b82f6" }}
                  >
                    <View
                      className="w-8 h-8 rounded-full border border-slate-200 shadow-sm"
                      style={{ backgroundColor: item.hex }}
                    />
                    <Text className="text-[9px] text-slate-500 font-bold mt-1 text-center">
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}

          {activeCategory === "background" && (
            <View className="flex-row flex-wrap justify-start" style={{ gap: 10 }}>
              {BACKGROUND_GRADIENTS.map((item) => {
                const isSel = background === item.value;
                return (
                  <Pressable
                    key={item.value}
                    onPress={() => setBackground(item.value)}
                    className="w-16 p-1.5 items-center justify-center rounded-xl bg-slate-50"
                    style={{ borderWidth: isSel ? 2 : 0, borderColor: "#3b82f6" }}
                  >
                    <View className="w-8 h-8 rounded-full border border-slate-200 shadow-sm flex-row overflow-hidden">
                      <View className="flex-1" style={{ backgroundColor: item.colors[0] }} />
                      <View className="flex-1" style={{ backgroundColor: item.colors[1] }} />
                    </View>
                    <Text className="text-[9px] text-slate-500 font-bold mt-1 text-center">
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </ScrollView>
      </View>

      {/* Save Action Bar */}
      <View className="p-4 border-t border-slate-100 bg-white">
        <Pressable
          onPress={handleSave}
          disabled={isSaving}
          className={`w-full py-4 rounded-full flex-row items-center justify-center shadow-md active:opacity-90 ${
            isSaving ? "bg-blue-300" : "bg-blue-500 active:bg-blue-600"
          }`}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Feather name="check" size={18} color="#fff" style={{ marginRight: 6 }} />
              <Text className="text-white font-bold text-base">Save & Apply Avatar</Text>
            </>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
