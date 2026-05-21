export interface PhoneValidationResult {
  isValid: boolean;
  message: string;
}

export interface CountryCode {
  code: string;
  country: string;
  digits: number;
}

const countryCodes: CountryCode[] = [
  { code: "+91", country: "India", digits: 10 },
  { code: "+1", country: "United States / Canada", digits: 10 },
  { code: "+44", country: "United Kingdom", digits: 10 },
  { code: "+61", country: "Australia", digits: 9 },
  { code: "+65", country: "Singapore", digits: 8 },
  { code: "+971", country: "United Arab Emirates", digits: 9 },
];

export function getCountryCodesList(): CountryCode[] {
  return countryCodes;
}

export function getExpectedDigitCount(code: string): number {
  const match = countryCodes.find((c) => c.code === code);
  return match ? match.digits : 10;
}

export function validatePhoneDigits(code: string, phone: string): PhoneValidationResult {
  const digitsOnly = phone.replace(/\D/g, "");
  const expected = getExpectedDigitCount(code);
  if (digitsOnly.length === 0) {
    return { isValid: false, message: "Phone number is required." };
  }
  if (digitsOnly.length < expected) {
    return { isValid: false, message: `Expected ${expected} digits for ${code}.` };
  }
  if (digitsOnly.length > expected) {
    return { isValid: false, message: `Expected ${expected} digits for ${code}.` };
  }
  return { isValid: true, message: "Valid phone number." };
}
