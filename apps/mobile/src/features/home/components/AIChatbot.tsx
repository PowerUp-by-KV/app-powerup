import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { X, Send, Bot, Trash2 } from "lucide-react-native";

export const AIChatbot = ({ visible, onClose }: { visible: boolean; onClose: () => void }) => {
  const [messages, setMessages] = useState([
    { id: "1", text: "Hello! I'm your AI English Tutor. How can I help you today?", sender: "bot" },
  ]);
  const [inputText, setInputText] = useState("");
  const flatListRef = useRef<FlatList>(null);

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

  const getBotResponse = (text: string) => {
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

  const renderMessage = ({ item }: { item: any }) => (
    <View
      className={`flex-row mb-5 max-w-[85%] ${item.sender === "user" ? "self-end justify-end" : "self-start"}`}
    >
      {item.sender === "bot" && (
        <View className="w-7 h-7 rounded-full bg-[#6366F1] justify-center items-center mr-2 mt-1">
          <Bot size={16} color="#FFF" />
        </View>
      )}
      <View
        className={`p-3 rounded-[18px] ${
          item.sender === "user"
            ? "bg-[#6366F1] rounded-br-[5px]"
            : "bg-[#F8F9FA] rounded-bl-[5px] flex-1"
        }`}
      >
        <Text
          className={`text-[15px] leading-5 font-medium ${item.sender === "user" ? "text-white" : "text-black"}`}
        >
          {item.text}
        </Text>
      </View>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View className="flex-1 bg-transparent">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="absolute bottom-[80px] left-5 width-[320px] height-[480px] bg-white rounded-[25px] overflow-hidden shadow-2xl shadow-black/20 elevation-15 border border-[#F8F9FA]"
          style={{ width: 320, height: 480 }}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between p-5 pt-6.5 bg-[#6366F1]">
            <View className="flex-row items-center">
              <Bot size={24} color="#FFF" />
              <View className="ml-3">
                <Text className="text-white text-lg font-bold">AI Tutor</Text>
                <Text className="text-white text-[12px] opacity-80 font-medium">
                  Online • Ready to help
                </Text>
              </View>
            </View>
            <View className="flex-row items-center">
              <TouchableOpacity onPress={clearChat} className="ml-[15px]">
                <Trash2 size={20} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} className="ml-[15px]">
                <X size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Chat List */}
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
            onLayout={() => flatListRef.current?.scrollToEnd()}
          />

          {/* Input Area */}
          <View className="flex-row items-center p-[15px] bg-white border-t border-[#F8F9FA]">
            <TextInput
              className="flex-1 bg-[#F8F9FA] rounded-[25px] px-5 py-2.5 max-h-[100px] text-[15px] font-medium color-black"
              placeholder="Type your question..."
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            <TouchableOpacity
              className={`w-[45px] h-[45px] rounded-[22.5px] justify-center items-center ml-2.5 bg-[#6366F1] ${inputText.trim() === "" ? "bg-[#94A3B8] opacity-50" : ""}`}
              onPress={sendMessage}
              disabled={inputText.trim() === ""}
            >
              <Send size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};
