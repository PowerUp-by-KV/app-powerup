import { render, screen, fireEvent } from "@testing-library/react-native";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import appReducer from "../../src/store/slices/app.slice";
import { OnboardingScreen } from "../../src/features/onboarding";

const mockReplace = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

function createTestStore(preloadedState = {}) {
  return configureStore({
    reducer: { app: appReducer },
    preloadedState,
  });
}

function renderWithStore(ui: React.ReactElement, preloadedState = {}) {
  const store = createTestStore(preloadedState);
  return { ...render(<Provider store={store}>{ui}</Provider>), store };
}

describe("OnboardingScreen", () => {
  beforeEach(() => {
    mockReplace.mockClear();
  });

  it("renders welcome message when not onboarded", () => {
    renderWithStore(<OnboardingScreen />);
    expect(screen.getByText("Welcome to PowerUp")).toBeTruthy();
    expect(screen.getByText("Get Started")).toBeTruthy();
  });

  it("renders nothing when already onboarded", () => {
    const { toJSON } = renderWithStore(<OnboardingScreen />, {
      app: { isOnboarded: true, theme: "system" },
    });
    expect(toJSON()).toBeNull();
  });

  it("dispatches setOnboarded and navigates on button press", () => {
    const { store } = renderWithStore(<OnboardingScreen />);
    fireEvent.press(screen.getByText("Get Started"));
    expect(store.getState().app.isOnboarded).toBe(true);
    expect(mockReplace).toHaveBeenCalledWith("/(tabs)");
  });
});
