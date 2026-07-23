/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from "./api";

export type PlanTier = "free" | "pro" | "premium";

export interface SubscriptionPlan {
  id: string;
  code: string;
  name: string;
  duration_days: number;
  /** In paise, not rupees: 49900 renders as ₹499. */
  price_inr: number;
  tier: PlanTier;
  savings_label: string | null;
  is_popular: boolean;
  is_best_value: boolean;
  benefits_json: string[];
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  current_period_end?: string;
  cancel_at_period_end?: boolean;
  payment_provider?: string;
  provider_subscription_id?: string;
  [key: string]: any;
}

export interface CheckoutRequest {
  plan_id: string;
  /** Razorpay is the only provider with a backend; the API rejects anything else. */
  payment_method?: "razorpay";
}

export interface CheckoutResponse {
  subscription_id: string;
  status: string;
  payment_url?: string | null;
  order_id?: string | null;
  /** In paise. */
  amount?: number | null;
  currency?: string | null;
  /** Publishable key id for the Checkout SDK. Never the secret. */
  razorpay_key_id?: string | null;
}

export interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

/**
 * Shape actually returned by GET /subscription/current and POST /subscription/verify.
 * Both wrap the subscription in { active, tier, subscription } — the `tier` here is what
 * drives feature gating (usePlanTier). Previously these endpoints were mis-typed as the
 * inner subscription object, so nothing read `tier` and every user looked free-tier.
 */
export interface CurrentSubscription {
  active: boolean;
  tier: PlanTier;
  subscription: UserSubscription | null;
}

export const subscriptionApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getPlans: builder.query<SubscriptionPlan[], void>({
      query: () => "/v1/subscription/plans",
      transformResponse: (resp: { plans?: SubscriptionPlan[] } | SubscriptionPlan[]) =>
        Array.isArray(resp) ? resp : (resp.plans ?? []),
      providesTags: ["Subscription"],
    }),

    getCurrentSubscription: builder.query<CurrentSubscription, void>({
      query: () => "/v1/subscription/current",
      providesTags: ["Subscription"],
    }),

    checkout: builder.mutation<CheckoutResponse, CheckoutRequest>({
      query: (data) => ({
        url: "/v1/subscription/checkout",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Subscription"],
    }),

    cancelSubscription: builder.mutation<any, void>({
      query: () => ({
        url: "/v1/subscription/cancel",
        method: "POST",
      }),
      invalidatesTags: ["Subscription"],
    }),

    // Confirms a Razorpay Checkout callback server-side and activates the subscription.
    verifyPayment: builder.mutation<CurrentSubscription, VerifyPaymentRequest>({
      query: (data) => ({
        url: "/v1/subscription/verify",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Subscription"],
    }),
  }),
});

export const {
  useGetPlansQuery,
  useGetCurrentSubscriptionQuery,
  useCheckoutMutation,
  useCancelSubscriptionMutation,
  useVerifyPaymentMutation,
} = subscriptionApi;
