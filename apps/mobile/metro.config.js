const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Watch all files in the monorepo
config.watchFolders = [monorepoRoot];

// Let Metro know where to resolve packages from
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];

// Ensure Metro resolves symlinks correctly for pnpm
config.resolver.unstable_enableSymlinks = true;
config.resolver.unstable_enablePackageExports = true;

// Add Rive, Lottie, and GLTF extension support
config.resolver.assetExts.push("riv", "lottie", "glb", "gltf");

// Add support for .mjs files (Required for Three.js / @react-three/drei to bundle correctly)
config.resolver.sourceExts.push("mjs");

module.exports = withNativeWind(config, { input: "./global.css" });
