import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type Tier = "free" | "pro" | "premium";

interface SubscriptionState {
  tier: Tier;
}

const initialState: SubscriptionState = {
  tier: "free",
};

const subscriptionSlice = createSlice({
  name: "subscription",
  initialState,
  reducers: {
    setTier(state, action: PayloadAction<Tier>) {
      state.tier = action.payload;
    },
  },
});

export const { setTier } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;
