import { api } from "./api";

export interface Avatar {
  id: string;
  url: string;
  locked: boolean;
  unlock_criteria: string | null;
}

export interface AvatarsResponse {
  avatars: Avatar[];
}

export interface StreakDay {
  date: string;
  active: boolean;
}

export interface StreakCalendarResponse {
  month: string;
  days: StreakDay[];
  total_active_days: number;
}

export interface SubscriptionPlan {
  id: string;
  code: string;
  name: string;
  duration_days: number;
  price_inr: number;
  savings_label: string | null;
  is_popular: boolean;
  is_best_value: boolean;
  benefits_json: string[];
}

export interface CurrentSubscription {
  active: boolean;
  subscription: {
    id: string;
    plan_id: string;
    plan_name: string;
    status: string;
    started_at: string;
    expires_at: string;
  } | null;
}

export interface CheckoutArgs {
  plan_id: string;
  payment_method: "razorpay" | "stripe" | "mock";
}

export const profileApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getAvatars: builder.query<Avatar[], void>({
      query: () => "/v1/avatars",
      transformResponse: (resp: AvatarsResponse) => resp.avatars ?? [],
      providesTags: ["Avatars"],
    }),
    getStreakCalendar: builder.query<StreakCalendarResponse, string>({
      query: (month) => `/v1/analytics/streak-calendar?month=${month}`,
    }),
    getSubscriptionPlans: builder.query<SubscriptionPlan[], void>({
      query: () => "/v1/subscription/plans",
      transformResponse: (resp: { plans?: SubscriptionPlan[] } | SubscriptionPlan[]) =>
        Array.isArray(resp) ? resp : (resp.plans ?? []),
      providesTags: ["Subscription"],
    }),
    getCurrentSubscription: builder.query<CurrentSubscription, void>({
      query: () => "/v1/subscription/current",
      providesTags: ["Subscription"],
    }),
    checkoutSubscription: builder.mutation<
      { subscription_id: string; status: string; payment_url?: string | null },
      CheckoutArgs
    >({
      query: (body) => ({ url: "/v1/subscription/checkout", method: "POST", body }),
      invalidatesTags: ["Subscription"],
    }),
    cancelSubscription: builder.mutation<void, void>({
      query: () => ({ url: "/v1/subscription/cancel", method: "POST" }),
      invalidatesTags: ["Subscription"],
    }),
  }),
});

export const {
  useGetAvatarsQuery,
  useGetStreakCalendarQuery,
  useGetSubscriptionPlansQuery,
  useGetCurrentSubscriptionQuery,
  useCheckoutSubscriptionMutation,
  useCancelSubscriptionMutation,
} = profileApi;
