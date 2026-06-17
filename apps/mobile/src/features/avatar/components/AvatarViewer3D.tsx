/* eslint-disable react/no-unknown-property */
import React, { Suspense, useState, useEffect } from "react";
import { View, StyleSheet, ActivityIndicator, Text } from "react-native";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import { AvatarModel } from "./AvatarModel";
import { getAvatarGlbUrl } from "@/utils/avatar";

interface AvatarViewer3DProps {
  avatarId: string;
  action?: "idle" | "walking" | "waving" | "talking";
  animationUrl?: string;
  cameraPosition?: [number, number, number];
}

function LoadingPlaceholder() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#3b82f6" />
      <Text style={styles.loadingText}>Loading 3D Avatar...</Text>
    </View>
  );
}

export function AvatarViewer3D({
  avatarId,
  action = "idle",
  animationUrl,
  cameraPosition = [0, 1.2, 3],
}: AvatarViewer3DProps) {
  const glbUrl = getAvatarGlbUrl(avatarId);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <LoadingPlaceholder />;
  }

  if (!glbUrl) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Invalid Avatar ID for 3D Viewer</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Suspense fallback={<LoadingPlaceholder />}>
        <Canvas camera={{ position: cameraPosition, fov: 45 }}>
          {/* Lighting setup */}
          <ambientLight intensity={0.5} />
          <directionalLight position={[2, 5, 2]} intensity={1} castShadow />
          <Environment preset="city" />

          <group position={[0, -1, 0]}>
            <AvatarModel url={glbUrl} action={action} animationUrl={animationUrl} />
            <ContactShadows
              opacity={0.5}
              scale={10}
              blur={2}
              far={10}
              resolution={256}
              color="#000000"
            />
          </group>

          {/* Controls to allow user to spin the avatar around */}
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 2}
          />
        </Canvas>
      </Suspense>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  loadingText: {
    marginTop: 12,
    color: "#64748b",
    fontSize: 14,
    fontWeight: "600",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fef2f2",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 14,
    fontWeight: "600",
  },
});
