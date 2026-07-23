/**
 * Razorpay Checkout - Web Platform Implementation.
 *
 * Web loads Razorpay's checkout.js and drives `window.Razorpay`.
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

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

const CHECKOUT_JS = "https://checkout.razorpay.com/v1/checkout.js";
let scriptPromise: Promise<void> | null = null;

/** The web build is prerendered (app.json sets output: "static"), so there is no DOM at build time. */
function hasDom(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

const GATEWAY_UNAVAILABLE = "Could not load the payment gateway. Check your connection.";

function loadCheckoutScript(): Promise<void> {
  if (!hasDom()) return Promise.reject(new Error(GATEWAY_UNAVAILABLE));
  if (window.Razorpay) return Promise.resolve();
  // Cached so concurrent or repeat checkouts don't inject the tag more than once.
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = CHECKOUT_JS;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error(GATEWAY_UNAVAILABLE));
    };
    document.body.appendChild(script);
  });

  return scriptPromise;
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
  await loadCheckoutScript();

  const Razorpay = hasDom() ? window.Razorpay : undefined;
  if (!Razorpay) {
    throw new Error(GATEWAY_UNAVAILABLE);
  }

  return new Promise<RazorpaySuccess>((resolve, reject) => {
    const checkout = new Razorpay({
      ...buildOptions(order),
      handler: (response: RazorpaySuccess) => resolve(response),
      modal: { ondismiss: () => reject(new RazorpayCancelledError()) },
    });
    checkout.open();
  });
}
