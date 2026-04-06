import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import { COLORS, FONTS, SIZES } from "@/constants/theme";
import { X, Send, Bot, User, Trash2 } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

const { height } = Dimensions.get("window");

const AIChatbot = ({ visible, onClose }) => {
  const [messages, setMessages] = useState([
    { id: "1", text: "Hello! I'm your AI English Tutor. How can I help you today?", sender: "bot" },
  ]);
  const [inputText, setInputText] = useState("");
  const flatListRef = useRef(null);

  const sendMessage = () => {
    if (inputText.trim() === "") return;

    const userMessage = { id: Date.now().toString(), text: inputText, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInputText("");

    // Simulate AI Response
    setTimeout(() => {
      const botResponse = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(inputText),
        sender: "bot",
      };
      setMessages((prev) => [...prev, botResponse]);
    }, 1000);
  };

  const getBotResponse = (text) => {
    const input = text.toLowerCase();
    if (input.includes("hello") || input.includes("hi"))
      return "Hi there! Ready for some English practice?";
    if (input.includes("grammar"))
      return "I can help with grammar! What specifically are you struggling with? Tenses, articles, or maybe prepositions?";
    if (input.includes("reading"))
      return "Reading is key! Try our 'Reading Exploration' module to improve your comprehension.";
    if (input.includes("score") || input.includes("points"))
      return "You're doing great! Keep completing lessons to earn more points and build your streak.";
    return "That's interesting! Tell me more, or ask me a specific question about English.";
  };

  const clearChat = () => {
    setMessages([
      {
        id: "1",
        text: "Hello! I'm your AI English Tutor. How can I help you today?",
        sender: "bot",
      },
    ]);
  };

  const renderMessage = ({ item }) => (
    <View
      style={[
        styles.messageWrapper,
        item.sender === "user" ? styles.userMessageWrapper : styles.botMessageWrapper,
      ]}
    >
      {item.sender === "bot" && (
        <View style={styles.botIconSmall}>
          <Bot size={16} color={COLORS.white} />
        </View>
      )}
      <View
        style={[
          styles.messageBubble,
          item.sender === "user" ? styles.userBubble : styles.botBubble,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            item.sender === "user" ? styles.userMessageText : styles.botMessageText,
          ]}
        >
          {item.text}
        </Text>
      </View>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.chatContainer}
        >
          {/* Header */}
          <LinearGradient colors={["#6366F1", "#8B5CF6"]} style={styles.header}>
            <View style={styles.headerInfo}>
              <Bot size={24} color={COLORS.white} />
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerTitle}>AI Tutor</Text>
                <Text style={styles.headerStatus}>Online • Ready to help</Text>
              </View>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={clearChat} style={styles.headerIcon}>
                <Trash2 size={20} color={COLORS.white} />
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} style={styles.headerIcon}>
                <X size={24} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          {/* Chat List */}
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messageList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
            onLayout={() => flatListRef.current?.scrollToEnd()}
          />

          {/* Input Area */}
          <View style={styles.inputArea}>
            <TextInput
              style={styles.input}
              placeholder="Type your question..."
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            <TouchableOpacity
              style={[styles.sendButton, inputText.trim() === "" && styles.sendButtonDisabled]}
              onPress={sendMessage}
              disabled={inputText.trim() === ""}
            >
              <Send size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "transparent", // Make overlay transparent to feel like a floating panel
  },
  chatContainer: {
    position: "absolute",
    bottom: 150, // Positioned above the AI button (which is at bottom 80)
    left: 20,
    width: 320,
    height: 480,
    backgroundColor: COLORS.white,
    borderRadius: 25,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 15,
    borderWidth: 1,
    borderColor: COLORS.background,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    paddingTop: 25,
  },
  headerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTextContainer: {
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    color: COLORS.white,
    ...FONTS.bold,
  },
  headerStatus: {
    fontSize: 12,
    color: COLORS.white,
    opacity: 0.8,
    ...FONTS.medium,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerIcon: {
    marginLeft: 15,
  },
  messageList: {
    padding: 20,
    paddingBottom: 40,
  },
  messageWrapper: {
    flexDirection: "row",
    marginBottom: 20,
    maxWidth: "85%",
  },
  userMessageWrapper: {
    alignSelf: "flex-end",
    justifyContent: "flex-end",
  },
  botMessageWrapper: {
    alignSelf: "flex-start",
  },
  botIconSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#6366F1",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    marginTop: 5,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 18,
    flexShrink: 1, // Crucial for text wrapping in a row
  },

  userBubble: {
    backgroundColor: "#6366F1",
    borderBottomRightRadius: 5,
  },
  botBubble: {
    backgroundColor: COLORS.background,
    borderBottomLeftRadius: 5,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
    ...FONTS.medium,
  },
  userMessageText: {
    color: COLORS.white,
  },
  botMessageText: {
    color: COLORS.black,
  },
  inputArea: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.background,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 15,
    ...FONTS.medium,
    color: COLORS.black,
  },
  sendButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "#6366F1",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.gray,
    opacity: 0.5,
  },
});

export default AIChatbot;
