import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet
} from "react-native";
import { useRouter } from "expo-router";

const passageAudioUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

const questions = [
  {
    id: "1",
    question: "What is the speaker talking about in the first line?",
    options: ["React Native", "VueJS", "Angular", "Svelte"]
  },
  {
    id: "2",
    question: "What kind of app architecture is mentioned?",
    options: ["MVC", "Redux", "React-style components", "Monolithic"]
  }
];

export default function ListeningScreen() {
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(false);
  const [selected, setSelected] = useState<Record<string, string>>({});

  const playAudio = () => {
    setIsPlaying((prev) => !prev);
  };

  const setAnswer = (id: string, option: string) => {
    setSelected((prev) => ({ ...prev, [id]: option }));
  };

  const allAnswered = Object.keys(selected).length === questions.length;

  const handleNext = () => {
    router.push("/write");
  };

  return (
    <View style={styles.container}>

      <Text style={styles.title}>Listening Test</Text>

      <TouchableOpacity style={styles.audioBtn} onPress={playAudio}>
        <Text style={styles.audioBtnText}>{isPlaying ? "Pause Audio" : "Play Audio"}</Text>
      </TouchableOpacity>
      <Text style={styles.audioInfo}>
        {isPlaying
          ? "Audio is playing... (mock playback - install expo-av for real audio)"
          : "Tap Play to hear the audio passage."}
      </Text>

      <FlatList
        style={styles.list}
        contentContainerStyle={styles.listContent}
        data={questions}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <View style={styles.card}>
            <Text style={styles.question}>
              {index + 1}. {item.question}
            </Text>

            {item.options.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.choiceButton,
                  selected[item.id] === option && styles.choiceSelected,
                ]}
                onPress={() => setAnswer(item.id, option)}
              >
                <Text
                  style={
                    selected[item.id] === option
                      ? styles.choiceTextSelected
                      : styles.choiceText
                  }
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      />

      <TouchableOpacity
        style={[styles.btnSmall, !allAnswered && styles.disabled]}
        disabled={!allAnswered}
        onPress={handleNext}
      >
        <Text style={styles.btnText}>Next</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  card: { marginBottom: 15 },
  question: { fontSize: 16, marginBottom: 8 },
  audioBtn: {
    backgroundColor: "#4F46E5",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 16
  },
  audioBtnText: { color: "#fff", fontWeight: "bold" },
  choiceButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginBottom: 8
  },
  choiceSelected: {
    borderColor: "#4F46E5",
    backgroundColor: "#EEF2FF"
  },
  choiceText: { color: "#333" },
  choiceTextSelected: { color: "#4F46E5", fontWeight: "bold" },
  audioInfo: { marginBottom: 14, color: "#555" },
  list: { flexGrow: 1 },
  listContent: { paddingBottom: 16 },
  btn: {
    backgroundColor: "blue",
    paddingVertical: 15,
    alignItems: "center",
    borderRadius: 5
  },
  btnSmall: {
    backgroundColor: "blue",
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
    borderRadius: 5,
    width: 120,
    alignSelf: "flex-end",
    marginTop: 10
  },
  disabled: { backgroundColor: "gray" },
  btnText: { color: "#fff", fontWeight: "bold" }
});