module.exports = {
  preset: "jest-expo",
  // Use our local setup shim to avoid pulling in react-native's ESM setup which
  // can break Jest in some environments.
  setupFiles: ["<rootDir>/jest.setup.js"],
  // Transform most node_modules except a small whitelist that should be
  // transformed for React Native and Expo packages. Adjust if additional
  // modules require transformation in CI/local envs.
  transformIgnorePatterns: [
    "node_modules/(?!(react-native|@react-native|@react-navigation|@expo|lucide-react-native|@expo-router|expo-router|@expo/vector-icons)/)",
  ],
  transform: {
    "^.+\\.[jt]sx?$": "babel-jest",
  },
  moduleNameMapper: {
    // Redirect react-native's jest setup (both with and without .js) to our shim
    // to avoid ESM import errors where Jest tries to load the ESM setup file.
    "^react-native/jest/setup(?:\\.js)?$": "<rootDir>/jest.setup.js",
  },
};
