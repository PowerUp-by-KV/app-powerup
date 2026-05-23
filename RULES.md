# PowerUp - Developer Rules & Coding Practices

This document defines the coding conventions, patterns, and workflows for the PowerUp project. All developers should follow these guidelines to maintain consistency and quality across the codebase.

---

## Naming Conventions

### Files & Directories

| Type                | Convention                 | Example                      |
| ------------------- | -------------------------- | ---------------------------- |
| React components    | `PascalCase.tsx`           | `OnboardingScreen.tsx`       |
| Hooks               | `camelCase.ts`             | `useAuth.ts`                 |
| Redux slices        | `kebab-case.slice.ts`      | `auth.slice.ts`              |
| RTK Query services  | `kebab-case.ts`            | `auth-api.ts`                |
| Utilities           | `kebab-case.ts`            | `format-date.ts`             |
| Types               | `kebab-case.ts`            | `navigation.ts`              |
| Constants           | `kebab-case.ts`            | `api-routes.ts`              |
| Test files          | `*.test.tsx` / `*.test.ts` | `OnboardingScreen.test.tsx`  |
| Feature directories | `kebab-case/`              | `src/features/user-profile/` |

### Code

| Type                  | Convention                 | Example                                |
| --------------------- | -------------------------- | -------------------------------------- |
| Variables & functions | `camelCase`                | `const userName`, `function getData()` |
| React components      | `PascalCase`               | `function OnboardingScreen()`          |
| Types & interfaces    | `PascalCase`               | `interface UserProfile`                |
| Constants             | `UPPER_SNAKE_CASE`         | `const API_TIMEOUT = 15_000`           |
| Redux actions         | `camelCase`                | `setOnboarded`, `fetchUser`            |
| Boolean variables     | `is`/`has`/`should` prefix | `isLoading`, `hasError`                |

---

## Import Order

Organize imports in this order, with a blank line between each group:

```typescript
// 1. React & React Native
import { useState } from "react";
import { View, Text } from "react-native";

// 2. Third-party libraries
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";

// 3. Monorepo packages
import { APP_NAME } from "@powerup/shared";

// 4. Internal absolute imports (@/)
import { useAppSelector } from "@/store/hooks";
import { api } from "@/services/api";

// 5. Relative imports
import { OnboardingCard } from "./OnboardingCard";
```

---

## How to Build a New Feature

Follow these steps when adding a new feature to the app. Use the `src/features/onboarding/` directory as a reference implementation.

### Step 1: Create the Feature Directory

```
src/features/<feature-name>/
├── <FeatureName>Screen.tsx    # Main screen component
├── components/                 # Feature-specific components (if needed)
├── hooks/                      # Feature-specific hooks (if needed)
├── index.ts                    # Barrel export
└── README.md                   # Feature documentation (optional)
```

### Step 2: Create a Redux Slice (if the feature has state)

Create `src/store/slices/<feature-name>.slice.ts`:

```typescript
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface FeatureState {
  // Define your state shape
}

const initialState: FeatureState = {
  // Set initial values
};

const featureSlice = createSlice({
  name: "<feature-name>",
  initialState,
  reducers: {
    // Define your reducers
  },
});

export const {
  /* actions */
} = featureSlice.actions;
export default featureSlice.reducer;
```

Then add it to the store in `src/store/index.ts`:

```typescript
import featureReducer from "./slices/<feature-name>.slice";

export const store = configureStore({
  reducer: {
    // ...existing reducers
    featureName: featureReducer,
  },
});
```

### Step 3: Create RTK Query Endpoints (if the feature calls APIs)

Add endpoints to `src/services/api.ts` or create a new API slice:

```typescript
import { api } from "./api";

const featureApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getFeatureData: builder.query<ResponseType, RequestType>({
      query: (params) => `/feature/${params.id}`,
    }),
  }),
});

export const { useGetFeatureDataQuery } = featureApi;
```

### Step 4: Add a Route

Create `app/<feature-name>.tsx` (or nest under a group like `app/(auth)/login.tsx`):

```typescript
import { FeatureScreen } from "@/features/<feature-name>";

export default function FeatureRoute() {
  return <FeatureScreen />;
}
```

### Step 5: Write Tests

Create `__tests__/features/<feature-name>.test.tsx`:

```typescript
import { render, screen } from "@testing-library/react-native";
import { FeatureScreen } from "@/features/<feature-name>";

describe("FeatureScreen", () => {
  it("renders correctly", () => {
    render(<FeatureScreen />);
    expect(screen.getByText("Expected Text")).toBeTruthy();
  });
});
```

---

## Component Patterns

### Functional Components Only

Always use functional components with TypeScript props:

```typescript
interface GreetingProps {
  name: string;
  onPress: () => void;
}

export function Greeting({ name, onPress }: GreetingProps) {
  return (
    <Pressable onPress={onPress}>
      <Text className="text-lg font-bold">{name}</Text>
    </Pressable>
  );
}
```

### Use NativeWind for Styling

Prefer Tailwind utility classes over `StyleSheet.create()`:

```typescript
// GOOD
<View className="flex-1 items-center justify-center bg-white p-4">
  <Text className="text-xl font-bold text-gray-900">Hello</Text>
</View>

// AVOID
const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
});
```

### Route Files Are Thin Wrappers

Route files in `app/` should only import and render feature components:

```typescript
// app/profile.tsx — GOOD (thin wrapper)
import { ProfileScreen } from "@/features/profile";
export default function ProfileRoute() {
  return <ProfileScreen />;
}

// app/profile.tsx — BAD (business logic in route)
export default function ProfileRoute() {
  const [user, setUser] = useState(null);
  // ...lots of logic here
}
```

---

## State Management Rules

### When to Use Redux (Global/Shared State)

- Authentication state
- User profile data
- App-wide settings (theme, language)
- Data fetched from APIs (via RTK Query)
- State shared across multiple screens

### When to Use Local State (`useState`)

- Form input values
- UI toggle states (modal open/closed, dropdown expanded)
- Component-specific animation state
- Temporary state that resets on unmount

### Never

- Store derived data in Redux — compute it with selectors
- Mutate state outside of Redux reducers
- Use Redux for single-component state

---

## Git Conventions

### Branching Strategy

```
main          ← Client-facing production branch (protected)
  ↑ PR
qa            ← Stable branch, QA-tested code (protected)
  ↑ PR
dev           ← Integration branch, all feature PRs merge here
  ↑ PR
feature/*     ← Developer working branches (branched from qa)
```

**Rules:**

1. **Developers always branch off `qa`** — `qa` is the stable baseline
2. **All PRs target `dev`** — features, fixes, and chores merge into `dev` first
3. **`dev` → `qa`** — once `dev` is tested and stable, a PR promotes it to `qa`
4. **`qa` → `main`** — release-ready code is promoted from `qa` to `main`
5. **Never push directly** to `main`, `qa`, or `dev` — always use PRs

**Workflow for a developer:**

```bash
# 1. Pull latest qa
git checkout qa && git pull

# 2. Create your feature branch from qa
git checkout -b feature/voice-waveform

# 3. Do your work, commit with conventional commits
git add .
git commit -m "feat(voice): add waveform visualization"

# 4. Push and create PR targeting dev
git push -u origin feature/voice-waveform
gh pr create --base dev --title "feat(voice): add waveform visualization"
```

### Branch Naming

```
feature/<description>    # New features
fix/<description>         # Bug fixes
chore/<description>       # Maintenance, refactoring, deps
docs/<description>        # Documentation changes
```

Examples: `feature/user-authentication`, `fix/splash-screen-crash`, `chore/update-expo-sdk`

### Commit Messages (Conventional Commits)

```
<type>(<scope>): <description>

[optional body]
```

Types: `feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `test`, `ci`

Examples:

```
feat(auth): add login screen with email/password
fix(navigation): resolve tab bar flickering on Android
chore(deps): update expo to v55
```

---

## PR Checklist

Before submitting a pull request, verify:

- [ ] `pnpm turbo run lint` passes with no warnings
- [ ] `pnpm turbo run typecheck` passes with no errors
- [ ] `pnpm turbo run test` passes
- [ ] No `any` types (use `unknown` if the type is truly unknown)
- [ ] New features include tests
- [ ] Route files are thin wrappers (logic lives in `src/`)
- [ ] Environment variables use `EXPO_PUBLIC_` prefix
- [ ] No secrets or API keys committed
- [ ] PR has a clear title and description
- [ ] At least 1 reviewer assigned

---

## Do's and Don'ts

### Do

- Use TypeScript strict mode — no `// @ts-ignore`
- Use path aliases (`@/components/...`) instead of relative imports
- Use RTK Query for API calls — don't roll your own fetch logic
- Use `useAppSelector` and `useAppDispatch` (typed hooks) for Redux
- Keep components small and focused — extract when > 150 lines
- Write meaningful test descriptions
- Use `EXPO_PUBLIC_` prefix for all environment variables

### Don't

- Don't use `any` — prefer `unknown` with type guards
- Don't use `StyleSheet.create()` when NativeWind classes suffice
- Don't put business logic in `app/` route files
- Don't install packages without checking if an existing one covers the need
- Don't use `console.log` in production code — use a proper logging utility
- Don't commit `.env` files — use `.env.example` as the template
- Don't skip tests for new features
- Don't use default exports for components (use named exports)
