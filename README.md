# PowerUp

React Native mobile application built with Expo, managed as a Turborepo monorepo.

## Tech Stack

- **Framework**: Expo (React Native)
- **Navigation**: Expo Router (file-based routing)
- **Language**: TypeScript (strict mode)
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **State Management**: Redux Toolkit + RTK Query
- **Monorepo**: Turborepo + pnpm workspaces
- **Testing**: Jest + React Native Testing Library + Maestro (E2E)
- **CI/CD**: GitHub Actions + EAS Build

## Prerequisites

- [Node.js](https://nodejs.org/) >= 22
- [pnpm](https://pnpm.io/) >= 10
- [Expo Go](https://expo.dev/go) app on your phone (or iOS Simulator / Android Emulator)
- [EAS CLI](https://docs.expo.dev/build/introduction/) (for building): `pnpm add -g eas-cli`

## Getting Started

```bash
# Clone the repository
git clone <repo-url>
cd app-powerup

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Start the development server
pnpm dev
```

Scan the QR code with Expo Go (Android) or Camera app (iOS) to open the app.

## Project Structure

```
app-powerup/
├── apps/
│   └── mobile/                # Expo React Native app
│       ├── app/               # File-based routes (Expo Router)
│       ├── src/
│       │   ├── components/    # Shared UI components
│       │   ├── features/      # Feature modules
│       │   ├── hooks/         # Custom hooks
│       │   ├── store/         # Redux store, slices, typed hooks
│       │   ├── services/      # RTK Query API definitions
│       │   ├── utils/         # Utility functions
│       │   ├── constants/     # App constants, theme tokens
│       │   └── types/         # Shared TypeScript types
│       ├── assets/            # Images, fonts
│       └── __tests__/         # Unit & component tests
├── packages/
│   ├── shared/                # Shared utilities, types, constants
│   └── eslint-config/         # Shared ESLint configuration
├── .github/workflows/         # CI/CD pipelines
├── turbo.json                 # Turborepo configuration
├── RULES.md                   # Coding practices & feature guide
└── README.md                  # This file
```

## Available Scripts

Run from the **root** of the monorepo:

| Command             | Description                             |
| ------------------- | --------------------------------------- |
| `pnpm dev`          | Start Expo dev server for mobile app    |
| `pnpm ios`          | Start on iOS simulator                  |
| `pnpm android`      | Start on Android emulator               |
| `pnpm lint`         | Lint all packages                       |
| `pnpm typecheck`    | Type-check all packages                 |
| `pnpm test`         | Run tests across all packages           |
| `pnpm format`       | Format all files with Prettier          |
| `pnpm format:check` | Check formatting without changing files |
| `pnpm build`        | Build all packages                      |

Run from `apps/mobile/`:

| Command              | Description                                     |
| -------------------- | ----------------------------------------------- |
| `pnpm build:dev`     | EAS build for development (includes dev client) |
| `pnpm build:preview` | EAS build for internal testing                  |
| `pnpm build:prod`    | EAS build for production release                |

## Branching Strategy

```
main   ← Production (client-facing)
qa     ← Stable, QA-tested code
dev    ← Integration branch (all PRs target here)
```

- **Branch from `qa`** when starting new work
- **Open PRs to `dev`** — never push directly to `dev`, `qa`, or `main`
- Once `dev` is stable → PR to `qa` → once QA passes → PR to `main`

See [RULES.md](RULES.md) for the full workflow and examples.

## Adding a New Feature

1. Create `src/features/<feature-name>/` with your screen component
2. Create a Redux slice in `src/store/slices/` (if needed)
3. Add RTK Query endpoints in `src/services/` (if calling APIs)
4. Create a route file in `app/`
5. Write tests in `__tests__/`

See [RULES.md](RULES.md) for detailed instructions and the `src/features/onboarding/` directory for a reference implementation.

## Adding a New Shared Package

1. Create `packages/<package-name>/` with a `package.json`:
   ```json
   {
     "name": "@powerup/<package-name>",
     "version": "0.0.0",
     "private": true,
     "main": "./src/index.ts",
     "types": "./src/index.ts"
   }
   ```
2. Add it as a dependency in the consuming app:
   ```json
   "@powerup/<package-name>": "workspace:*"
   ```
3. Run `pnpm install` to link the workspace package

## Deployment

This project uses [EAS Build](https://docs.expo.dev/build/introduction/) for cloud builds:

- **Development**: Includes Expo dev client for debugging. `pnpm --filter mobile build:dev`
- **Preview**: Internal distribution for testing. `pnpm --filter mobile build:preview`
- **Production**: App Store / Play Store release. `pnpm --filter mobile build:prod`

Set `EXPO_TOKEN` in GitHub Secrets for automated CI builds.

## Troubleshooting

### Metro cache issues

```bash
npx expo start --clear
```

### pnpm install fails

```bash
pnpm store prune && pnpm install
```

### TypeScript errors after changing tsconfig

```bash
# Restart TS server in VS Code: Cmd+Shift+P → "TypeScript: Restart TS Server"
```

### NativeWind styles not applying

```bash
# Clear Metro cache and restart
npx expo start --clear
```
