# Project Bug Resolution Walkthrough & History

This document outlines the bugs identified in the `app-powerup` mobile application, including the recent fixes from this pairing session and historical resolutions extracted from the repository's commit history.

---

## 1. Recently Resolved Issues (Current Session)

### **Submit Button Invisible in Writing Activity**

- **The Problem**: In `WritingActivity.tsx`, the "Submit" button was nested inside the `ScrollView`. On smaller screen sizes or when the soft keyboard was active, the button was pushed off-screen and blocked, making it impossible to submit answers.
- **The Resolution**: Pushed the Pressable button out of the `ScrollView` and docked it at the bottom of the screen inside a `KeyboardAvoidingView` container. The question content now scrolls independently, and the button automatically rises above the keyboard when active.
- **File**: [WritingActivity.tsx](file:///c:/Users/lavan/Desktop/testing1/app-powerup/apps/mobile/src/features/learning-journey/components/WritingActivity.tsx)

### **Action Buttons Occluded in Reading & Grammar Screens**

- **The Problem**: The navigation buttons ("Next Question" / "Check Answers") on `ReadingScreen.tsx` and `GrammarScreen.tsx` were nested inside the `ScrollView`. For fill-in-the-blank questions, the button was hidden behind the open keyboard.
- **The Resolution**: Extracted the button container and docked it at the bottom of the screen inside a keyboard-adaptive view.
- **Files**: [ReadingScreen.tsx](file:///c:/Users/lavan/Desktop/testing1/app-powerup/apps/mobile/src/features/pre-assessment/ReadingScreen.tsx), [GrammarScreen.tsx](file:///c:/Users/lavan/Desktop/testing1/app-powerup/apps/mobile/src/features/pre-assessment/GrammarScreen.tsx)

### **Badges Collection Row Alignment**

- **The Problem**: In `MedalsScreen.tsx`, the grid layout was configured with `justifyContent: "space-between"` and card widths of `30%`. When the final row had 2 items instead of 3, the items were forced to the far left and right edges, leaving an empty space in the middle.
- **The Resolution**: Switched the container to `justifyContent: "flex-start"` and card widths to exactly `33.33%` (one-third). The items now align sequentially left-to-right.
- **File**: [MedalsScreen.tsx](file:///c:/Users/lavan/Desktop/testing1/app-powerup/apps/mobile/src/features/achievements/MedalsScreen.tsx)

### **MCQ Validation False Negatives (Unicode Arrow Mismatch)**

- **The Problem**: Selecting correct answers containing arrow paths (e.g. `A → B → D → C`) failed validation and marked selections as incorrect because the database defined them with ASCII arrows (`->`), creating a character mismatch.
- **The Resolution**: Added a normalization utility to `isMatch` in `McqActivity.tsx` that replaces `→` with `->`, standardizes whitespace, and strips option prefixes (e.g., `C: `) before checking correctness.
- **File**: [McqActivity.tsx](file:///c:/Users/lavan/Desktop/testing1/app-powerup/apps/mobile/src/features/learning-journey/components/McqActivity.tsx)

### **Lint Check Unused Import Error**

- **The Problem**: Code compilation failed under the linter due to an unused `SafeAreaView` import in `avatar-creator.tsx`.
- **The Resolution**: Cleaned up the imports to achieve `0 ESLint Errors`.
- **File**: [avatar-creator.tsx](file:///c:/Users/lavan/Desktop/testing1/app-powerup/apps/mobile/app/profile/avatar-creator.tsx)

---

## 2. Historical Project Issues & Resolutions (Git History)

By analyzing previous commits in the repository, we compiled a history of key issues that were resolved earlier in the project lifecycle:

### **A. Startup, Dependency, & Authentication Issues**

- **Launch Crash on SDK 55**: Pinpointed a startup crash on newer devices. Resolved by pinning `expo-gl` to version `~55.0.14` to prevent compatibility crashes.
- **Transient Refresh Logout Bug**: Addressed a bug where minor transient network timeouts during silent token refresh would force-logout the user. Modified authentication handlers to skip logging out on temporary connection drops.
- **Google Sign-In Web / Native Crash**: Wrapped conditional checks around Google OAuth native handlers to ensure missing or invalid client IDs do not crash the login screen wrapper.

### **B. Media, Audio Recording, & System Calls**

- **Audio Setup Race Conditions**: Mock interview sessions encountered race conditions when attempting to request audio focus. Resolved by serializing all audio-mode calls in sequence.
- **In-Call Manager Startup Crash**: The `react-native-incall-manager` package was causing crashes on the React Native New Architecture. It was replaced entirely with clean, native configurations via `expo-av`.
- **Microphone Permissions**: Fixed missing audio recording permissions in production APK builds by adding the `expo-av` config plugin and declaring audio permission rules directly in `app.json`.

### **C. UI Overlap, Layouts, & Responsiveness**

- **Gesture & Status Bar Overlaps**: Modals and full-screen screens were overlapping with the system status bar and gesture navigation bar. Fixed globally by adding responsive layout offsets matching platform-specific safe area insets.
- **Timeline and Chatbot Backdrop Clipping**: Corrected transparent backdrops, clipped diagnostic icons, and offset timeline layouts under Tailwind configurations to match style guidelines.

### **D. Onboarding & Resume Features**

- **Skip Onboarding Gate**: Resolved an issue where selecting "Skip for now" on the resume upload card during onboarding failed to register, locking users on the onboarding screen.
- **Resume Buddy ATS score display**: Polished the Resume Buddy feedback screen by rounding overall scores, implementing gradient background rings, and adding clean color-coding.
