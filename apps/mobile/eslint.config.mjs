import rnConfig from "@powerup/eslint-config/react-native";

export default [
  ...rnConfig,
  {
    ignores: [".expo/**/*"],
  },
];
