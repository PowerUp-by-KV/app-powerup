declare module "react-native-razorpay" {
  export interface RazorpayOptions {
    description: string;
    image: string;
    currency: string;
    key: string;
    amount: string | number;
    name: string;
    subscription_id?: string;
    order_id?: string;
    theme: {
      color: string;
    };
    prefill?: {
      email?: string;
      contact?: string;
      name?: string;
    };
  }

  export interface RazorpaySuccess {
    razorpay_payment_id: string;
    razorpay_order_id?: string;
    razorpay_signature?: string;
  }

  export interface RazorpayError {
    code: number;
    description: string;
    source: string;
    step: string;
    reason: string;
    metadata: {
      order_id: string;
      payment_id: string;
    };
  }

  const RazorpayCheckout: {
    open: (options: RazorpayOptions) => Promise<RazorpaySuccess>;
  };
  export default RazorpayCheckout;
}
