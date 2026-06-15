import React, { useState, useEffect, useRef } from "react";
import { Modal, Text, View, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";

const GAME_HEIGHT = 300;
const MASCOT_SIZE = 36;
const OBSTACLE_WIDTH = 40;
const GAP_SIZE = 110;

interface OfflineGameModalProps {
  visible: boolean;
  onClose: () => void;
}

interface Obstacle {
  x: number;
  topHeight: number;
  bottomHeight: number;
  passed: boolean;
}

export function OfflineGameModal({ visible, onClose }: OfflineGameModalProps) {
  const insets = useSafeAreaInsets();
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameState, setGameState] = useState<"start" | "play" | "gameover">("start");

  // Keep track of exact play container width dynamically
  const [gameWidth, setGameWidth] = useState(360);

  // Game values stored in refs for the animation loop
  const mascotY = useRef(120);
  const velocity = useRef(0);
  const obstacles = useRef<Obstacle[]>([]);
  const frameId = useRef<number | null>(null);

  // Trigger re-renders
  const [, setRenderTrigger] = useState(0);

  const jump = () => {
    velocity.current = -6.5;
  };

  const startGame = () => {
    mascotY.current = 100;
    velocity.current = -3.5; // Gentler initial upward hop to give reaction time
    obstacles.current = [{ x: gameWidth + 80, topHeight: 70, bottomHeight: 120, passed: false }];
    setScore(0);
    setGameState("play");
  };

  useEffect(() => {
    if (gameState === "play") {
      const gameLoop = () => {
        // Apply physics
        velocity.current += 0.28; // Lower gravity for smooth, fun gameplay
        mascotY.current += velocity.current;

        // Collision with floor or ceiling
        if (mascotY.current < 0 || mascotY.current > GAME_HEIGHT - MASCOT_SIZE) {
          setGameState("gameover");
          return;
        }

        // Update obstacles
        const speed = 3.2;
        const currentObstacles = [...obstacles.current];
        let scoreInc = 0;

        currentObstacles.forEach((obs) => {
          obs.x -= speed;

          // Check if passed mascot (mascot is placed at x = 50)
          if (!obs.passed && obs.x < 50) {
            obs.passed = true;
            scoreInc += 1;
          }
        });

        const lastObstacle = currentObstacles[currentObstacles.length - 1];
        if (currentObstacles.length === 0 || (lastObstacle && lastObstacle.x < gameWidth - 180)) {
          const topHeight = Math.floor(Math.random() * (GAME_HEIGHT - GAP_SIZE - 60)) + 30;
          const bottomHeight = GAME_HEIGHT - GAP_SIZE - topHeight;
          currentObstacles.push({
            x: gameWidth,
            topHeight,
            bottomHeight,
            passed: false,
          });
        }

        // Remove off-screen obstacles
        const filteredObstacles = currentObstacles.filter((obs) => obs.x > -OBSTACLE_WIDTH);

        // Check collision
        const mascotBox = {
          left: 50,
          right: 50 + MASCOT_SIZE,
          top: mascotY.current,
          bottom: mascotY.current + MASCOT_SIZE,
        };

        let collided = false;
        for (const obs of filteredObstacles) {
          const topBox = {
            left: obs.x,
            right: obs.x + OBSTACLE_WIDTH,
            top: 0,
            bottom: obs.topHeight,
          };
          const bottomBox = {
            left: obs.x,
            right: obs.x + OBSTACLE_WIDTH,
            top: GAME_HEIGHT - obs.bottomHeight,
            bottom: GAME_HEIGHT,
          };

          // Overlap check
          const hitsTop =
            mascotBox.right > topBox.left &&
            mascotBox.left < topBox.right &&
            mascotBox.top < topBox.bottom;

          const hitsBottom =
            mascotBox.right > bottomBox.left &&
            mascotBox.left < bottomBox.right &&
            mascotBox.bottom > bottomBox.top;

          if (hitsTop || hitsBottom) {
            collided = true;
            break;
          }
        }

        if (collided) {
          setGameState("gameover");
          return;
        }

        obstacles.current = filteredObstacles;
        if (scoreInc > 0) {
          setScore((prev) => {
            const next = prev + scoreInc;
            if (next > highScore) setHighScore(next);
            return next;
          });
        }

        // Trigger re-render
        setRenderTrigger((prev) => prev + 1);

        frameId.current = requestAnimationFrame(gameLoop);
      };

      frameId.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (frameId.current) {
        cancelAnimationFrame(frameId.current);
      }
    };
  }, [gameState, highScore, gameWidth]);

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View
        style={{
          flex: 1,
          backgroundColor: "#0f172a",
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        }}
        className="justify-between"
      >
        {/* Header */}
        <View className="flex-row justify-between items-center px-6 py-4 border-b border-slate-800">
          <View className="flex-row items-center gap-2">
            <Ionicons name="game-controller-outline" size={24} color="#6366f1" />
            <Text className="text-white text-lg font-extrabold">Mascot Offline Jump</Text>
          </View>
          <Pressable
            onPress={onClose}
            className="w-8 h-8 bg-slate-800 rounded-full items-center justify-center active:opacity-75"
          >
            <Feather name="x" size={18} color="#94a3b8" />
          </Pressable>
        </View>

        {/* Play Area */}
        <View style={{ flex: 1 }} className="justify-center items-center px-4">
          <View
            onLayout={(e) => setGameWidth(e.nativeEvent.layout.width)}
            style={{ width: "100%", height: GAME_HEIGHT, overflow: "hidden", position: "relative" }}
            className="bg-indigo-950/40 rounded-3xl border border-indigo-900/60"
          >
            {/* High-priority full container transparent Pressable for gameplay inputs */}
            {gameState === "play" && (
              <Pressable onPress={jump} style={StyleSheet.absoluteFillObject} className="z-50" />
            )}

            {/* Background elements */}
            <View style={{ position: "absolute", bottom: 20, left: 40 }} className="opacity-10">
              <Ionicons name="cloud" size={80} color="#fff" />
            </View>
            <View style={{ position: "absolute", bottom: 60, right: 80 }} className="opacity-15">
              <Ionicons name="cloud" size={50} color="#fff" />
            </View>

            {/* Score HUD */}
            <View style={{ position: "absolute", top: 16, right: 16, zIndex: 10 }}>
              <Text className="text-white text-[10px] font-bold uppercase tracking-widest text-right">
                Score
              </Text>
              <Text className="text-indigo-400 text-2xl font-black text-right">{score}</Text>
            </View>

            <View style={{ position: "absolute", top: 16, left: 16, zIndex: 10 }}>
              <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                High Score
              </Text>
              <Text className="text-amber-400 text-lg font-black">{highScore}</Text>
            </View>

            {/* Render Obstacles */}
            {obstacles.current.map((obs, idx) => (
              <React.Fragment key={idx}>
                {/* Top Pipe */}
                <View
                  style={{
                    position: "absolute",
                    left: obs.x,
                    top: 0,
                    width: OBSTACLE_WIDTH,
                    height: obs.topHeight,
                    borderBottomLeftRadius: 8,
                    borderBottomRightRadius: 8,
                  }}
                  className="bg-emerald-500 border border-emerald-400"
                />
                {/* Bottom Pipe */}
                <View
                  style={{
                    position: "absolute",
                    left: obs.x,
                    top: GAME_HEIGHT - obs.bottomHeight,
                    width: OBSTACLE_WIDTH,
                    height: obs.bottomHeight,
                    borderTopLeftRadius: 8,
                    borderTopRightRadius: 8,
                  }}
                  className="bg-emerald-500 border border-emerald-400"
                />
              </React.Fragment>
            ))}

            {/* Render Mascot Owl / Flame */}
            <View
              style={{
                position: "absolute",
                left: 50,
                top: mascotY.current,
                width: MASCOT_SIZE,
                height: MASCOT_SIZE,
                borderRadius: MASCOT_SIZE / 2,
                justifyContent: "center",
                alignItems: "center",
              }}
              className="bg-amber-500 shadow-lg"
            >
              <Ionicons name="flame" size={24} color="#fff" />
            </View>

            {/* Overlay Screens */}
            {gameState === "start" && (
              <View
                style={StyleSheet.absoluteFillObject}
                className="bg-slate-950/80 items-center justify-center p-6"
              >
                <Text className="text-white text-2xl font-black mb-1">Dino Flame Dash</Text>
                <Text className="text-slate-400 text-xs font-bold text-center mb-6 px-4">
                  Tap to fly up. Fly through the emerald gates to score points!
                </Text>
                <Pressable
                  onPress={startGame}
                  className="bg-indigo-600 active:bg-indigo-500 px-8 py-3 rounded-full shadow-md active:scale-95 z-50"
                >
                  <Text className="text-white font-black text-sm">Start Playing</Text>
                </Pressable>
              </View>
            )}

            {gameState === "gameover" && (
              <View
                style={StyleSheet.absoluteFillObject}
                className="bg-slate-950/90 items-center justify-center p-6"
              >
                <Text className="text-rose-500 text-3xl font-black mb-1">Game Over</Text>
                <Text className="text-slate-400 text-sm font-semibold mb-6">
                  You scored {score} points!
                </Text>
                <Pressable
                  onPress={startGame}
                  className="bg-indigo-600 active:bg-indigo-500 px-8 py-3.5 rounded-full shadow-md active:scale-95 z-50"
                >
                  <Text className="text-white font-black text-sm">Play Again</Text>
                </Pressable>
              </View>
            )}
          </View>

          {gameState === "play" && (
            <Text className="text-slate-500 text-xs font-bold mt-4 uppercase tracking-widest">
              Tap anywhere inside the box to Jump
            </Text>
          )}
        </View>

        {/* Footer */}
        <View className="items-center py-6 px-6 border-t border-slate-800">
          <Text className="text-slate-500 text-center text-xs leading-4">
            Practice makes perfect. The server will reconnect once you're back online!
          </Text>
        </View>
      </View>
    </Modal>
  );
}
