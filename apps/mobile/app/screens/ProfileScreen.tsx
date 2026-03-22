import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
} from "react-native";
import { useRouter } from "expo-router";

export default function ProfileScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [dob, setDob] = useState("");
  const [college, setCollege] = useState("");

  const handleSubmit = () => {
    if (!name || !mobile || !dob || !college) {
      alert("Please fill all fields");
      return;
    }

    alert("Profile created successfully");
    router.replace("/read");
  };

  return (
    <ImageBackground
      source={{
        uri: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f",
      }}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Complete Your Profile</Text>

          <TextInput
            placeholder="Full Name"
            style={styles.input}
            value={name}
            onChangeText={setName}
          />

          <TextInput
            placeholder="Mobile Number"
            style={styles.input}
            keyboardType="number-pad"
            value={mobile}
            onChangeText={setMobile}
          />

          <TextInput
            placeholder="Date of Birth (DD/MM/YYYY)"
            style={styles.input}
            value={dob}
            onChangeText={setDob}
          />

          <TextInput
            placeholder="College Name"
            style={styles.input}
            value={college}
            onChangeText={setCollege}
          />

          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.btnText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },

  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },

  card: {
    width: "85%",
    maxWidth: 400,
    backgroundColor: "#fff",
    padding: 25,
    borderRadius: 14,
  },

  title: {
    fontSize: 28,
    textAlign: "center",
    marginBottom: 25,
    fontWeight: "bold",
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },

  button: {
    backgroundColor: "#4F46E5",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },

  btnText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
