import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  Animated,
  PanResponder,
  Pressable,
  Dimensions,
  StyleSheet,
} from "react-native";
import { QuizQuestion } from "../types/quiz.types";
import { LinearGradient } from "expo-linear-gradient";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface QuizEngineProps {
  questions: QuizQuestion[];
  onComplete?: (score: number) => void;
}

// ---------- Draggable Token ----------
function DraggableToken({
  text,
  onDrop,
  disabled,
}: {
  text: string;
  onDrop: (text: string, pageX: number, pageY: number) => void;
  disabled: boolean;
}) {
  const pan = useRef(new Animated.ValueXY()).current;
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const responder = PanResponder.create({
    onStartShouldSetPanResponder: () => !disabled,
    onMoveShouldSetPanResponder: () => !disabled,
    onPanResponderGrant: () => {
      Animated.parallel([
        Animated.spring(scale, { toValue: 1.12, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.9, duration: 100, useNativeDriver: true }),
      ]).start();
    },
    onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
      useNativeDriver: false,
    }),
    onPanResponderRelease: (e, gesture) => {
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 100, useNativeDriver: true }),
        Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }),
      ]).start();
      onDrop(text, gesture.moveX, gesture.moveY);
    },
  });

  return (
    <Animated.View
      {...responder.panHandlers}
      style={[
        styles.token,
        {
          transform: [...pan.getTranslateTransform(), { scale }],
          opacity,
          zIndex: 99,
        },
      ]}
    >
      <LinearGradient
        colors={["#4f46e5", "#7c3aed"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.tokenGradient}
      >
        <Text style={styles.tokenText}>{text}</Text>
      </LinearGradient>
    </Animated.View>
  );
}

// ---------- Result Screen ----------
function ResultScreen({
  score,
  total,
  onRestart,
}: {
  score: number;
  total: number;
  onRestart: () => void;
}) {
  const isPerfect = score === total;
  const scaleAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      bounciness: 14,
    }).start();
  }, [scaleAnim]);

  return (
    <View style={styles.resultContainer}>
      <LinearGradient
        colors={isPerfect ? ["#7c3aed", "#4f46e5"] : ["#1e293b", "#334155"]}
        style={StyleSheet.absoluteFillObject}
      />
      <Animated.View style={[styles.resultCard, { transform: [{ scale: scaleAnim }] }]}>
        <Text style={styles.resultEmoji}>{isPerfect ? "🏆" : "🎯"}</Text>
        <Text style={styles.resultTitle}>{isPerfect ? "Perfect Score!" : "Quiz Complete!"}</Text>
        <Text style={styles.resultSubtitle}>
          {isPerfect
            ? "You nailed every question! Amazing!"
            : `You got ${score} out of ${total} correct`}
        </Text>

        <View style={styles.scoreRow}>
          {Array.from({ length: total }).map((_, i) => (
            <View
              key={i}
              style={[styles.scoreDot, { backgroundColor: i < score ? "#4ade80" : "#475569" }]}
            />
          ))}
        </View>

        <Text style={styles.scoreText}>
          {score}/{total}
        </Text>

        <Pressable onPress={onRestart} style={styles.restartBtn}>
          <LinearGradient
            colors={["#4ade80", "#16a34a"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.restartGradient}
          >
            <Text style={styles.restartText}>Try Again 🔄</Text>
          </LinearGradient>
        </Pressable>
      </Animated.View>
    </View>
  );
}

// ---------- Main Quiz Engine ----------
export function QuizEngine({ questions = [], onComplete }: QuizEngineProps) {
  const safeQuestions: QuizQuestion[] = questions.map((q) => ({
    ...q,
    answer: String(q.answer),
    options: q.options || [],
  }));

  const [index, setIndex] = useState(0);
  const [blank, setBlank] = useState("___");
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [dropState, setDropState] = useState<"idle" | "correct" | "wrong">("idle");
  const [disabled, setDisabled] = useState(false);

  // Animations
  const progressAnim = useRef(new Animated.Value(0)).current;
  const cardShake = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(1)).current;
  const cardOpacity = useRef(new Animated.Value(1)).current;
  const dropZoneRef = useRef<View>(null);
  const dropLayout = useRef<{ x: number; y: number; width: number; height: number } | null>(null);

  const animateProgress = useCallback(
    (newIndex: number) => {
      Animated.timing(progressAnim, {
        toValue: ((newIndex + 1) / safeQuestions.length) * 100,
        duration: 500,
        useNativeDriver: false,
      }).start();
    },
    [safeQuestions.length, progressAnim],
  );

  const shake = () => {
    Animated.sequence([
      Animated.timing(cardShake, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(cardShake, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(cardShake, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(cardShake, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(cardShake, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const nextQuestion = (newScore: number) => {
    // Slide out
    Animated.parallel([
      Animated.timing(cardOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.timing(cardScale, { toValue: 0.85, duration: 300, useNativeDriver: true }),
    ]).start(() => {
      const nextIndex = index + 1;
      if (nextIndex < safeQuestions.length) {
        setIndex(nextIndex);
        setBlank("___");
        setDropState("idle");
        setDisabled(false);
        animateProgress(nextIndex);
        // Slide in
        cardOpacity.setValue(0);
        cardScale.setValue(1.1);
        Animated.parallel([
          Animated.spring(cardOpacity, { toValue: 1, useNativeDriver: true }),
          Animated.spring(cardScale, { toValue: 1, useNativeDriver: true }),
        ]).start();
      } else {
        onComplete?.(newScore);
        setFinished(true);
      }
    });
  };

  const measureDropZone = () => {
    dropZoneRef.current?.measure((_x, _y, w, h, px, py) => {
      dropLayout.current = { x: px, y: py, width: w, height: h };
    });
  };

  const handleDrop = useCallback(
    (value: string, moveX: number, moveY: number) => {
      const zone = dropLayout.current;
      const correct = safeQuestions[index]?.answer;

      // If drop zone not measured yet, try again
      if (!zone) return;

      const inside =
        moveX >= zone.x &&
        moveX <= zone.x + zone.width &&
        moveY >= zone.y &&
        moveY <= zone.y + zone.height;

      if (!inside) return;

      if (String(value) === String(correct)) {
        // ✅ Correct
        setBlank(value);
        setDropState("correct");
        setDisabled(true);
        const newScore = score + 1;
        setScore(newScore);
        Animated.spring(cardScale, { toValue: 1.03, useNativeDriver: true }).start(() => {
          setTimeout(() => nextQuestion(newScore), 900);
        });
      } else {
        // ❌ Wrong
        setBlank(value);
        setDropState("wrong");
        setDisabled(true);
        shake();
        setTimeout(() => {
          setBlank("___");
          setDropState("idle");
          setDisabled(false);
        }, 900);
      }
    },
    [index, safeQuestions, score],
  );

  if (safeQuestions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No Questions Found</Text>
      </View>
    );
  }

  if (finished) {
    return (
      <ResultScreen
        score={score}
        total={safeQuestions.length}
        onRestart={() => {
          setIndex(0);
          setScore(0);
          setFinished(false);
          setBlank("___");
          setDropState("idle");
          setDisabled(false);
          progressAnim.setValue(0);
          cardOpacity.setValue(1);
          cardScale.setValue(1);
        }}
      />
    );
  }

  const question = safeQuestions[index];
  const parts = question?.sentence?.split("__") ?? ["", ""];

  const dropBg =
    dropState === "correct"
      ? ["#dcfce7", "#bbf7d0"]
      : dropState === "wrong"
        ? ["#fee2e2", "#fecaca"]
        : ["#f1f5f9", "#e2e8f0"];

  return (
    <View style={styles.container}>
      {/* Background */}
      <LinearGradient colors={["#0f172a", "#1e293b"]} style={StyleSheet.absoluteFillObject} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerLabel}>QUESTION</Text>
          <Text style={styles.headerCount}>
            {index + 1} / {safeQuestions.length}
          </Text>
        </View>
        <View style={styles.scoreChip}>
          <Text style={styles.scoreChipText}>⭐ {score}</Text>
        </View>
      </View>

      {/* Progress */}
      <View style={styles.progressTrack}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 100],
                outputRange: ["0%", "100%"],
              }),
            },
          ]}
        />
      </View>

      {/* Drop Zone Card */}
      <Animated.View
        style={[
          styles.dropCardWrapper,
          {
            transform: [{ translateX: cardShake }, { scale: cardScale }],
            opacity: cardOpacity,
          },
        ]}
      >
        <View ref={dropZoneRef} onLayout={measureDropZone} collapsable={false}>
          <LinearGradient colors={dropBg as [string, string]} style={styles.dropCard}>
            <Text style={styles.sentenceText}>
              {parts[0]}
              <Text
                style={[
                  styles.blankText,
                  dropState === "correct" && { color: "#16a34a" },
                  dropState === "wrong" && { color: "#dc2626" },
                ]}
              >
                {blank === "___" ? "  ___  " : ` ${blank} `}
              </Text>
              {parts[1]}
            </Text>
            {dropState === "correct" && <Text style={styles.feedbackText}>✅ Correct!</Text>}
            {dropState === "wrong" && (
              <Text style={[styles.feedbackText, { color: "#dc2626" }]}>❌ Try again!</Text>
            )}
          </LinearGradient>
        </View>
      </Animated.View>

      {/* Instruction */}
      <Text style={styles.instruction}>
        {disabled && dropState === "wrong"
          ? "❌ Wrong choice, try another!"
          : "👆 Drag the correct word into the blank"}
      </Text>

      {/* Options */}
      <View style={styles.optionsContainer}>
        {question?.options?.map((opt) => (
          <DraggableToken
            key={opt}
            text={opt}
            onDrop={handleDrop}
            disabled={disabled && dropState === "correct"}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 52,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerLabel: {
    color: "#64748b",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
  },
  headerCount: {
    color: "#f8fafc",
    fontSize: 22,
    fontWeight: "800",
    marginTop: 2,
  },
  scoreChip: {
    backgroundColor: "#1e293b",
    borderWidth: 1,
    borderColor: "#334155",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  scoreChipText: {
    color: "#fbbf24",
    fontSize: 15,
    fontWeight: "700",
  },
  progressTrack: {
    height: 5,
    backgroundColor: "#1e3a5f",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 32,
  },
  progressFill: {
    height: "100%",
    borderRadius: 10,
    backgroundColor: "#6366f1",
  },
  dropCardWrapper: {
    marginBottom: 10,
  },
  dropCard: {
    borderRadius: 28,
    paddingVertical: 40,
    paddingHorizontal: 28,
    alignItems: "center",
    minHeight: 160,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  sentenceText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1e293b",
    textAlign: "center",
    lineHeight: 34,
  },
  blankText: {
    fontSize: 22,
    fontWeight: "800",
    color: "#6366f1",
    textDecorationLine: "underline",
  },
  feedbackText: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: "700",
    color: "#16a34a",
  },
  instruction: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 12,
    marginBottom: 24,
    letterSpacing: 0.5,
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
  },
  token: {
    borderRadius: 16,
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  tokenGradient: {
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  tokenText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: "#64748b",
    fontSize: 16,
    fontWeight: "600",
  },
  // Result Screen
  resultContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  resultCard: {
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 36,
    padding: 36,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    width: "100%",
  },
  resultEmoji: {
    fontSize: 72,
    marginBottom: 16,
  },
  resultTitle: {
    color: "#f8fafc",
    fontSize: 30,
    fontWeight: "800",
    marginBottom: 8,
    textAlign: "center",
  },
  resultSubtitle: {
    color: "#94a3b8",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 28,
    lineHeight: 24,
  },
  scoreRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  scoreDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  scoreText: {
    color: "#f8fafc",
    fontSize: 48,
    fontWeight: "900",
    marginBottom: 32,
  },
  restartBtn: {
    width: "100%",
    borderRadius: 20,
    overflow: "hidden",
  },
  restartGradient: {
    paddingVertical: 18,
    alignItems: "center",
    borderRadius: 20,
  },
  restartText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});
