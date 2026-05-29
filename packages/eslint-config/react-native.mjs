import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import baseConfig from "./base.mjs";

export default [
  ...baseConfig,
  {
    files: ["**/*.{tsx,jsx}"],
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      // Not meaningful in React Native <Text> — apostrophes/quotes in copy
      // render literally; this is an HTML-entity concern.
      "react/no-unescaped-entities": "off",
    },
    settings: {
      react: { version: "detect" },
    },
  },
];
