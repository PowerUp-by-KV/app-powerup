const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Watch all files in the monorepo
config.watchFolders = [monorepoRoot];

// Let Metro know where to resolve packages from (including pnpm virtual store)
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules/.pnpm/node_modules"),
];

// Ensure Metro resolves symlinks correctly for pnpm
config.resolver.unstable_enableSymlinks = true;
config.resolver.unstable_enablePackageExports = true;

// Add Rive and Lottie extension support
config.resolver.assetExts.push("riv");
config.resolver.assetExts.push("lottie");

module.exports = withNativeWind(config, { input: "./global.css" });
