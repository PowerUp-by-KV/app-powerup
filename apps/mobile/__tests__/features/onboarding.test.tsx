import { render } from "@testing-library/react-native";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import appReducer from "../../src/store/slices/app.slice";
import onboardingReducer from "../../src/store/slices/onboardingSlice";
import { OnboardingScreen } from "../../src/features/onboarding";

// OnboardingScreen is a data-driven multi-step wizard. Mock its data/router/
// storage dependencies so we can smoke-test that it mounts without crashing.
const mockReplace = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn(), back: jest.fn() }),
}));

jest.mock("@/services/auth-api", () => ({
  useGetProfileQuery: () => ({ data: undefined, isLoading: true }),
}));
jest.mock("@/services/onboarding-api", () => ({
  useGetGroupedQuestionsQuery: () => ({
    data: undefined,
    isLoading: true,
    isError: false,
    refetch: jest.fn(),
  }),
  useSubmitOnboardingMutation: () => [jest.fn(), { isLoading: false }],
}));
jest.mock("@/services/assessment-api", () => ({
  useStartSessionMutation: () => [jest.fn(), { isLoading: false }],
}));
jest.mock("@/services/auth-storage", () => ({
  getProfileCompletedInSession: jest.fn().mockResolvedValue(false),
  setProfileCompletedInSession: jest.fn().mockResolvedValue(undefined),
  setPreAssessmentCompletedInSession: jest.fn().mockResolvedValue(undefined),
  getAuthSession: jest.fn().mockResolvedValue(null),
  clearCompletedSections: jest.fn().mockResolvedValue(undefined),
  saveLocalOnboardingAnswers: jest.fn().mockResolvedValue(undefined),
}));

function renderWithStore(ui: React.ReactElement) {
  const store = configureStore({
    reducer: { app: appReducer, onboarding: onboardingReducer },
  });
  return { ...render(<Provider store={store}>{ui}</Provider>), store };
}

describe("OnboardingScreen", () => {
  beforeEach(() => {
    mockReplace.mockClear();
  });

  it("mounts without crashing while data is loading", () => {
    const { toJSON } = renderWithStore(<OnboardingScreen />);
    expect(toJSON()).toBeTruthy();
  });
});
