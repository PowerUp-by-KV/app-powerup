import { configureStore } from "@reduxjs/toolkit";
import { resumeApi } from "../../../src/services/resumeApiSlice";
import * as apiConfig from "../../../src/constants/apiConfig";

jest.mock("../../../src/constants/apiConfig", () => ({
  USE_MOCK_API: true,
  API_BASE_URL: "http://localhost:8000",
}));

describe("resumeApiSlice", () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        [resumeApi.reducerPath]: resumeApi.reducer,
      },
      middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(resumeApi.middleware),
    });
  });

  afterEach(() => {
    // Clear data after each test
    store.dispatch(resumeApi.util.resetApiState());
  });

  it("resumeApi slice is configured correctly", () => {
    expect(resumeApi).toBeDefined();
    expect(resumeApi.reducerPath).toBe("resumeApi");
    expect(resumeApi.endpoints).toBeDefined();
  });
});
