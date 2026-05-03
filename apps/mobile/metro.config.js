const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");
const fs = require("fs");

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

// Custom resolver for TypeScript path aliases
const originalResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const resolve = originalResolveRequest || context.resolveRequest;

  // Handle @app-powerup/* path aliases
  if (moduleName.startsWith("@app-powerup/")) {
    const parts = moduleName.split("/");
    const packageName = parts[1];
    const subpath = parts.slice(2).join("/");

    const packagePath = path.resolve(monorepoRoot, "packages", packageName, "src");

    if (subpath) {
      // Subpath import like @app-powerup/shared/types
      const resolvedPath = path.resolve(packagePath, subpath);

      // Check if it's a directory with index.ts or if it's a .ts file
      if (fs.existsSync(resolvedPath + ".ts")) {
        return resolve(context, resolvedPath + ".ts", platform);
      } else if (fs.existsSync(resolvedPath + "/index.ts")) {
        return resolve(context, resolvedPath + "/index.ts", platform);
      } else if (fs.existsSync(resolvedPath)) {
        return resolve(context, resolvedPath, platform);
      }
    } else {
      // Main package import like @app-powerup/shared
      const indexPath = path.resolve(packagePath, "index.ts");
      if (fs.existsSync(indexPath)) {
        return resolve(context, indexPath, platform);
      }
    }
  }

  // Fall back to default resolution
  return resolve(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: "./global.css" });
