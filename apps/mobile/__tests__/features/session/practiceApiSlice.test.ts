import { configureStore } from "@reduxjs/toolkit";
import { practiceApi } from "../../../src/services/practiceApiSlice";
import * as apiConfig from "../../../src/constants/apiConfig";

jest.mock("../../../src/constants/apiConfig", () => ({
  USE_MOCK_API: true,
  FULL_API_BASE_URL: "http://localhost:8000",
}));

describe("practiceApiSlice", () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        [practiceApi.reducerPath]: practiceApi.reducer,
      },
      middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(practiceApi.middleware),
    });
  });

  afterEach(() => {
    store.dispatch(practiceApi.util.resetApiState());
  });

  it("practiceApi slice is configured correctly", () => {
    expect(practiceApi).toBeDefined();
    expect(practiceApi.reducerPath).toBe("practiceApi");
    expect(practiceApi.endpoints).toBeDefined();
  });
});
