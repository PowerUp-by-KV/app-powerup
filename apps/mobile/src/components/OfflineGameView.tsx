import React, { useState, useEffect, useRef } from "react";
import { Text, View, Pressable, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const GAME_HEIGHT = 180;
const MASCOT_SIZE = 22;
const OBSTACLE_WIDTH = 28;
const GAP_SIZE = 95; // Massive gap size for super easy scoring!

interface OfflineGameViewProps {
  onScoreUpdate?: (score: number) => void;
}

interface Obstacle {
  x: number;
  topHeight: number;
  bottomHeight: number;
  passed: boolean;
}

export function OfflineGameView({ onScoreUpdate }: OfflineGameViewProps) {
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameState, setGameState] = useState<"start" | "play" | "gameover">("start");

  // Dynamic container measurements
  const [gameWidth, setGameWidth] = useState(280);

  // States that drive the visual layout in perfect sync
  const [mascotYState, setMascotYState] = useState(60);
  const [obstaclesState, setObstaclesState] = useState<Obstacle[]>([]);

  // Physics refs to prevent closure scope stalls
  const mascotY = useRef(60);
  const velocity = useRef(0);
  const obstacles = useRef<Obstacle[]>([]);

  const jump = () => {
    velocity.current = -3.0; // Soft, highly controllable float jump
  };

  const startGame = () => {
    mascotY.current = 50;
    velocity.current = -1.8;
    obstacles.current = [];
    setMascotYState(50);
    setObstaclesState([]);
    setScore(0);
    setGameState("play");
  };

  // Keyboard controls for laptop/web emulators
  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        if (gameState === "play") {
          jump();
        } else {
          startGame();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState, gameWidth]);

  useEffect(() => {
    if (gameState !== "play") return;

    //Throttled 24ms loop (40 FPS) perfectly matched to mobile UI refresh cycles
    const interval = setInterval(() => {
      // Apply gravity (Tuned to be super floaty, like low-gravity bubble)
      velocity.current += 0.11;
      mascotY.current += velocity.current;

      // Ground/ceiling collisions
      if (mascotY.current < 0 || mascotY.current > GAME_HEIGHT - MASCOT_SIZE) {
        setGameState("gameover");
        return;
      }

      // Move columns (Tuned slow-motion scrolling speed for easy planning!)
      const speed = 1.6;
      const currentObstacles = obstacles.current.map((obs) => ({
        ...obs,
        x: obs.x - speed,
      }));

      let scoreInc = 0;
      currentObstacles.forEach((obs) => {
        if (!obs.passed && obs.x < 40) {
          obs.passed = true;
          scoreInc += 1;
        }
      });

      // Spawn first column safely to the right, and subsequent columns dynamically
      if (currentObstacles.length === 0) {
        const topHeight = Math.floor(Math.random() * (GAME_HEIGHT - GAP_SIZE - 30)) + 15;
        const bottomHeight = GAME_HEIGHT - GAP_SIZE - topHeight;
        currentObstacles.push({
          x: gameWidth + 120, // Clean runway at start
          topHeight,
          bottomHeight,
          passed: false,
        });
      } else if (currentObstacles[currentObstacles.length - 1].x < gameWidth - 200) {
        const topHeight = Math.floor(Math.random() * (GAME_HEIGHT - GAP_SIZE - 30)) + 15;
        const bottomHeight = GAME_HEIGHT - GAP_SIZE - topHeight;
        currentObstacles.push({
          x: gameWidth,
          topHeight,
          bottomHeight,
          passed: false,
        });
      }

      const filteredObstacles = currentObstacles.filter((obs) => obs.x > -OBSTACLE_WIDTH);

      // Check precise overlap collisions
      const mascotBox = {
        left: 40,
        right: 40 + MASCOT_SIZE,
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

      // Sync refs & states for perfect visual representation
      obstacles.current = filteredObstacles;
      setMascotYState(mascotY.current);
      setObstaclesState(filteredObstacles);

      if (scoreInc > 0) {
        setScore((prev) => {
          const next = prev + scoreInc;
          if (next > highScore) setHighScore(next);
          if (onScoreUpdate) onScoreUpdate(next);
          return next;
        });
      }
    }, 24);

    return () => clearInterval(interval);
  }, [gameState, gameWidth, highScore, onScoreUpdate]);

  return (
    <View
      onLayout={(e) => setGameWidth(e.nativeEvent.layout.width)}
      style={{ width: "100%", height: GAME_HEIGHT, overflow: "hidden", position: "relative" }}
      className="bg-indigo-950/90 rounded-2xl border border-indigo-900/60 my-4"
    >
      {/* Tap-to-jump active overlay */}
      {gameState === "play" && (
        <Pressable
          onPressIn={jump}
          style={{ ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0)", zIndex: 99 }}
        />
      )}

      {/* Cloud Decors */}
      <View style={{ position: "absolute", bottom: 10, left: 30 }} className="opacity-10">
        <Ionicons name="cloud" size={40} color="#fff" />
      </View>
      <View style={{ position: "absolute", bottom: 30, right: 60 }} className="opacity-10">
        <Ionicons name="cloud" size={26} color="#fff" />
      </View>

      {/* Score overlays */}
      <View style={{ position: "absolute", top: 10, right: 12, zIndex: 10 }}>
        <Text className="text-indigo-400 text-base font-black text-right">{score}</Text>
      </View>
      <View style={{ position: "absolute", top: 10, left: 12, zIndex: 10 }}>
        <Text className="text-amber-400 text-xs font-black">HI {highScore}</Text>
      </View>

      {/* Render Obstacles */}
      {obstaclesState.map((obs, idx) => (
        <React.Fragment key={idx}>
          <View
            style={{
              position: "absolute",
              left: obs.x,
              top: 0,
              width: OBSTACLE_WIDTH,
              height: obs.topHeight,
              borderBottomLeftRadius: 4,
              borderBottomRightRadius: 4,
            }}
            className="bg-emerald-500 border border-emerald-400"
          />
          <View
            style={{
              position: "absolute",
              left: obs.x,
              top: GAME_HEIGHT - obs.bottomHeight,
              width: OBSTACLE_WIDTH,
              height: obs.bottomHeight,
              borderTopLeftRadius: 4,
              borderTopRightRadius: 4,
            }}
            className="bg-emerald-500 border border-emerald-400"
          />
        </React.Fragment>
      ))}

      {/* Render Mascot Flame */}
      <View
        style={{
          position: "absolute",
          left: 40,
          top: mascotYState,
          width: MASCOT_SIZE,
          height: MASCOT_SIZE,
          borderRadius: MASCOT_SIZE / 2,
          justifyContent: "center",
          alignItems: "center",
        }}
        className="bg-amber-500 shadow-sm"
      >
        <Ionicons name="flame" size={12} color="#fff" />
      </View>

      {/* Start State Overlay */}
      {gameState === "start" && (
        <View
          style={StyleSheet.absoluteFillObject}
          className="bg-slate-950/80 items-center justify-center p-3"
        >
          <Text className="text-white text-sm font-black mb-0.5">Mascot Dino Dash</Text>
          <Text className="text-slate-400 text-[9px] font-bold text-center px-4 mb-2">
            {Platform.OS === "web"
              ? "Press Spacebar or click Play to Start"
              : "Fly through the gates to score!"}
          </Text>
          <Pressable
            onPress={startGame}
            className="bg-indigo-600 active:bg-indigo-500 px-6 py-2 rounded-full shadow-sm z-50 mt-1 active:scale-95"
          >
            <Text className="text-white font-black text-xs">Play Game</Text>
          </Pressable>
        </View>
      )}

      {/* Game Over State Overlay */}
      {gameState === "gameover" && (
        <View
          style={StyleSheet.absoluteFillObject}
          className="bg-slate-950/90 items-center justify-center p-3"
        >
          <Text className="text-rose-500 text-sm font-black mb-0.5">Game Over</Text>
          <Text className="text-slate-400 text-[10px] font-semibold mb-2">Score: {score}</Text>
          <Text className="text-slate-500 text-[8px] font-bold mb-2 uppercase">
            {Platform.OS === "web" ? "Press Spacebar to Play Again" : ""}
          </Text>
          <Pressable
            onPress={startGame}
            className="bg-indigo-600 active:bg-indigo-500 px-6 py-2 rounded-full shadow-sm z-50 active:scale-95"
          >
            <Text className="text-white font-black text-xs">Play Again</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
