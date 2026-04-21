import { useState } from "react";

export function useOtp() {
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const sendOtp = async (phone: string) => {
    setIsSending(true);
    try {
      // placeholder for API call
      await new Promise((res) => setTimeout(res, 500));
      return true;
    } finally {
      setIsSending(false);
    }
  };

  const verifyOtp = async (code: string) => {
    setIsVerifying(true);
    try {
      // placeholder for API call
      await new Promise((res) => setTimeout(res, 500));
      return true;
    } finally {
      setIsVerifying(false);
    }
  };

  return { isSending, isVerifying, sendOtp, verifyOtp } as const;
}

export default useOtp;
