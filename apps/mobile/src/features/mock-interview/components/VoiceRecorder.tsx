import { View, Text, Pressable } from "react-native";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface VoiceRecorderProps {
  isRecording: boolean;
  onStart: () => void;
  onStop: () => void;
}

// ---------------------------------------------------------------------------
// Sub-component: MicIcon (drawn with Views, no SVG dependency)
// ---------------------------------------------------------------------------

function MicIcon({ color = "#fff" }: { color?: string }) {
  return (
    <View className="items-center">
      {/* Mic capsule */}
      <View
        style={{
          width: 12,
          height: 18,
          borderRadius: 6,
          backgroundColor: color,
        }}
      />
      {/* Mic arm */}
      <View
        style={{
          width: 20,
          height: 10,
          borderLeftWidth: 2,
          borderRightWidth: 2,
          borderBottomWidth: 2,
          borderColor: color,
          borderBottomLeftRadius: 10,
          borderBottomRightRadius: 10,
          marginTop: -1,
        }}
      />
      {/* Stand */}
      <View style={{ width: 2, height: 4, backgroundColor: color }} />
      <View
        style={{
          width: 12,
          height: 2,
          backgroundColor: color,
          borderRadius: 1,
        }}
      />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// Purely presentational — recording logic lives in useVoiceRecorder hook.
// ---------------------------------------------------------------------------

export function VoiceRecorder({ isRecording, onStart, onStop }: VoiceRecorderProps) {
  const handleToggle = isRecording ? onStop : onStart;

  return (
    <View
      className="bg-white rounded-2xl p-10 items-center"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <Pressable onPress={handleToggle} style={({ pressed }) => ({ opacity: pressed ? 0.82 : 1 })}>
        <View
          className={`w-16 h-16 rounded-full items-center justify-center ${
            isRecording ? "bg-red-400" : "bg-blue-500"
          }`}
        >
          {isRecording ? (
            // Stop square
            <View className="w-5 h-5 bg-white rounded-sm" />
          ) : (
            <MicIcon />
          )}
        </View>
      </Pressable>

      <Text className="text-sm font-semibold text-gray-800 mt-5">
        {isRecording ? "Recording..." : "Tap to record"}
      </Text>
      {isRecording && <Text className="text-xs text-gray-400 mt-1">Tap again to stop</Text>}
    </View>
  );
}
