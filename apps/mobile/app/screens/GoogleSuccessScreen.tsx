import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useRouter } from "expo-router";

export default function GoogleSuccessScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Image
        source={{
          uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT5qRo3DHpnxAUtNwv7575TUVhUZKHqtElokQ&s",
        }}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.tagline}>Digital Transformation & IT Solutions</Text>

      <Text style={styles.title}>You are all set! 🎉</Text>

      <Text style={styles.subtitle}>
        Your Google login was successful.
        Continue to create your profile.
      </Text>

      <TouchableOpacity
        style={styles.btn}
        onPress={() => router.replace("/profile")}
      >
        <Text style={styles.btnText}>Create Profile →</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#05071A",
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },

  logo: {
    width: 220,
    height: 80,
    marginBottom: 20,
  },

  tagline: {
    color: "#9CA3AF",
    fontSize: 14,
    marginBottom: 30,
    textAlign: "center",
  },

  title: {
    fontSize: 28,
    color: "white",
    fontWeight: "bold",
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 16,
    color: "#D1D5DB",
    textAlign: "center",
    marginBottom: 40,
  },

  btn: {
    backgroundColor: "#4F46E5",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
  },

  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
