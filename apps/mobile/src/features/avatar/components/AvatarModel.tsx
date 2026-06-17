/* eslint-disable react/no-unknown-property */
import React, { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";

interface AvatarModelProps {
  url: string;
  action?: "idle" | "walking" | "waving" | "talking";
  // If the user provides animation GLB URLs, they can be passed here
  animationUrl?: string;
}

export function AvatarModel({ url, action = "idle", animationUrl }: AvatarModelProps) {
  const group = useRef<THREE.Group>(null);

  // Load the avatar GLB
  const { scene } = useGLTF(url);

  // Optional: Load animations if provided
  const { animations } = useGLTF(animationUrl || url);
  const { actions } = useAnimations(animations, group);

  // Example: Play skeletal animation if found
  useEffect(() => {
    if (actions && Object.keys(actions).length > 0) {
      // Play the animation matching the requested action, or fallback to the first available
      const animName = actions[action] ? action : Object.keys(actions)[0];
      if (animName && actions[animName]) {
        actions[animName]?.reset().fadeIn(0.5).play();
        return () => {
          actions[animName]?.fadeOut(0.5);
        };
      }
    }
  }, [actions, action]);

  const skinnedMeshesRef = useRef<THREE.SkinnedMesh[]>([]);

  useEffect(() => {
    const meshes: THREE.SkinnedMesh[] = [];
    if (scene) {
      scene.traverse((object: THREE.Object3D) => {
        if ((object as THREE.SkinnedMesh).isSkinnedMesh) {
          meshes.push(object as THREE.SkinnedMesh);
        }
      });
    }
    skinnedMeshesRef.current = meshes;
  }, [scene]);

  // Handle ARKit Blendshapes (Blinking & Smiling)
  useFrame((state) => {
    if (!scene) return;

    for (const mesh of skinnedMeshesRef.current) {
      const dict = mesh.morphTargetDictionary as { [key: string]: number } | undefined;
      const influences = mesh.morphTargetInfluences;
      if (!dict || !influences) continue;

      // 1. Procedural Blinking
      const blinkLeftIdx = dict["eyeBlinkLeft"];
      const blinkRightIdx = dict["eyeBlinkRight"];

      if (blinkLeftIdx !== undefined && blinkRightIdx !== undefined) {
        // Blink every ~4 seconds
        const time = state.clock.elapsedTime;
        const blinkCycle = time % 4;
        let blinkAmount = 0;
        if (blinkCycle > 3.8) {
          // Rapid blink
          blinkAmount = Math.sin((blinkCycle - 3.8) * Math.PI * 5);
          blinkAmount = Math.max(0, Math.min(1, blinkAmount));
        }
        influences[blinkLeftIdx] = blinkAmount;
        influences[blinkRightIdx] = blinkAmount;
      }

      // 2. Smiling
      const smileLeftIdx = dict["mouthSmileLeft"];
      const smileRightIdx = dict["mouthSmileRight"];

      if (smileLeftIdx !== undefined && smileRightIdx !== undefined) {
        // Gentle constant smile
        const targetSmile = 0.5;
        // Smoothly interpolate to target
        const currentLeft = influences[smileLeftIdx] ?? 0;
        const currentRight = influences[smileRightIdx] ?? 0;
        influences[smileLeftIdx] = currentLeft + (targetSmile - currentLeft) * 0.1;
        influences[smileRightIdx] = currentRight + (targetSmile - currentRight) * 0.1;
      }

      // 3. Talking (Jaw Open) - if action is talking
      const jawOpenIdx = dict["jawOpen"];
      if (jawOpenIdx !== undefined) {
        let targetJaw = 0;
        if (action === "talking") {
          // Procedural babble
          const time = state.clock.elapsedTime;
          targetJaw = (Math.sin(time * 15) * 0.5 + 0.5) * 0.3;
        }
        const currentJaw = influences[jawOpenIdx] ?? 0;
        influences[jawOpenIdx] = currentJaw + (targetJaw - currentJaw) * 0.2;
      }
    }
  });

  return (
    <group ref={group} dispose={null}>
      <primitive object={scene} />
    </group>
  );
}

// Preload standard RPM URLs to speed up viewing if possible
// useGLTF.preload('https://models.readyplayer.me/....glb');
