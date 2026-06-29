import { api } from "./api";

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
  payment_method?: string; // e.g. 'stripe', 'razorpay', 'mock'
}

export interface CheckoutResponse {
  subscription_id: string;
  status: string;
  payment_url?: string | null;
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

    getCurrentSubscription: builder.query<UserSubscription | null, void>({
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

    simulatePaymentWebhook: builder.mutation<any, { provider_ref: string; status: string }>({
      query: (data) => ({
        url: "/v1/webhooks/payment",
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
  useSimulatePaymentWebhookMutation,
} = subscriptionApi;
