import React, { useState } from "react";
import {
  View, Text, FlatList, TextInput,
  TouchableOpacity, StyleSheet
} from "react-native";
import { useRouter } from "expo-router";

const passage = `React Native enables you to build mobile apps using only JavaScript. It uses the same design as React, letting you compose a rich mobile UI from declarative components, and compiles to native platform UI.`;

const questions = [
  {
    id: "1",
    question: "React Native compiles to which UI?",
    options: ["Web UI", "Native UI", "Console UI", "Server UI"],
  },
  {
    id: "2",
    question: "Which component is used for rendering a list in React Native?",
    options: ["ListView", "FlatList", "sectionList", "GridView"],
  },
];

export default function ReadingScreen() {
  const router = useRouter();

  const [selected, setSelected] = useState<Record<string, string>>({});

  const setAnswer = (id: string, option: string) => {
    setSelected((prev) => ({ ...prev, [id]: option }));
  };

  const allAnswered = Object.keys(selected).length === questions.length;

  const handleNext = () => {
    router.push("/listen");
  };

  return (
    <View style={styles.container}>

      <Text style={styles.title}>Reading Test</Text>
      <Text style={styles.passage}>{passage}</Text>

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
  question: { fontSize: 16, marginBottom: 6 },
  passage: { fontSize: 16, marginBottom: 16, color: "#333" },
  choiceButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  choiceSelected: {
    borderColor: "#4F46E5",
    backgroundColor: "#EEF2FF",
  },
  choiceText: {
    color: "#333",
  },
  choiceTextSelected: {
    color: "#4F46E5",
    fontWeight: "bold",
  },
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