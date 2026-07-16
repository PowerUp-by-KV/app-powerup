/**
 * Razorpay Checkout - Native Platform Implementation.
 *
 * Native defers to `react-native-razorpay`, which is a native module.
 */

export interface RazorpayOrder {
  /** Publishable key id from the backend (never the secret). */
  keyId: string;
  orderId: string;
  /** In paise, matching the backend's price_inr. */
  amount: number;
  currency: string;
  planName: string;
  userEmail?: string;
  userName?: string;
}

export interface RazorpaySuccess {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

/** Thrown when the user closes the checkout sheet without paying. */
export class RazorpayCancelledError extends Error {
  constructor() {
    super("Payment cancelled");
    this.name = "RazorpayCancelledError";
  }
}

interface NativeCheckout {
  open: (options: Record<string, unknown>) => Promise<RazorpaySuccess>;
}

function buildOptions(order: RazorpayOrder): Record<string, unknown> {
  return {
    key: order.keyId,
    order_id: order.orderId,
    amount: order.amount,
    currency: order.currency,
    name: "PowerUp",
    description: order.planName,
    theme: { color: "#2563eb" },
    prefill: {
      ...(order.userEmail ? { email: order.userEmail } : {}),
      ...(order.userName ? { name: order.userName } : {}),
    },
  };
}

export async function openRazorpayCheckout(order: RazorpayOrder): Promise<RazorpaySuccess> {
  // react-native-razorpay is legacy CommonJS (module.exports = RazorpayCheckout), so `.default`
  // may be undefined depending on interop — fall back to the module object itself.
  const mod = require("react-native-razorpay") as { default?: NativeCheckout } & NativeCheckout;
  const RazorpayCheckout: NativeCheckout = mod.default ?? mod;

  if (typeof RazorpayCheckout?.open !== "function") {
    throw new Error("Payments aren't available in this build. Please update the app.");
  }

  try {
    return await RazorpayCheckout.open(buildOptions(order));
  } catch (err) {
    // The SDK rejects with { code, description } — code 0 (or 2) is a user dismissal.
    const code = (err as { code?: number })?.code;
    if (code === 0 || code === 2) throw new RazorpayCancelledError();
    throw err;
  }
}
