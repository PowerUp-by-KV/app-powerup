import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import prettierConfig from "eslint-config-prettier";

export default [
  {
    ignores: [
      "node_modules/",
      "dist/",
      ".expo/",
      "android/",
      "ios/",
      "web-build/",
    ],
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      // React Native / Metro resolves static assets via require()
      // (Image/Lottie/Rive sources). It is the idiomatic pattern, not a bug.
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  prettierConfig,
];
