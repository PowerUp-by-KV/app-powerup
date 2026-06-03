export interface CountryCodeItem {
  code: string;
  country: string;
  digits: number;
}

const COUNTRY_CODES: CountryCodeItem[] = [
  { code: "+1", country: "United States / Canada", digits: 10 },
  { code: "+44", country: "United Kingdom", digits: 10 },
  { code: "+91", country: "India", digits: 10 },
  { code: "+61", country: "Australia", digits: 9 },
  { code: "+49", country: "Germany", digits: 11 },
  { code: "+33", country: "France", digits: 9 },
  { code: "+81", country: "Japan", digits: 10 },
  { code: "+86", country: "China", digits: 11 },
  { code: "+55", country: "Brazil", digits: 11 },
  { code: "+52", country: "Mexico", digits: 10 },
];

export function getCountryCodesList(): CountryCodeItem[] {
  return COUNTRY_CODES;
}

export function getExpectedDigitCount(code: string): number {
  const item = COUNTRY_CODES.find((c) => c.code === code);
  return item ? item.digits : 10;
}

export function validatePhoneDigits(
  code: string,
  phone: string,
): { isValid: boolean; message: string } {
  // Strip country code prefix from phone number if prepended
  let phoneWithoutCode = phone.trim();
  const cleanCode = code.replace(/\D/g, ""); // e.g. "+91" -> "91"
  const expected = getExpectedDigitCount(code);
  const digitsOnly = phoneWithoutCode.replace(/\D/g, "");

  if (phoneWithoutCode.startsWith("+")) {
    if (phoneWithoutCode.startsWith(code)) {
      phoneWithoutCode = phoneWithoutCode.slice(code.length).trim();
    }
  } else if (cleanCode && digitsOnly.startsWith(cleanCode) && digitsOnly.length > expected) {
    phoneWithoutCode = digitsOnly.slice(cleanCode.length);
  }

  const cleaned = phoneWithoutCode.replace(/\D/g, "");

  if (!cleaned) {
    return { isValid: false, message: "Phone number is required" };
  }
  if (cleaned.length !== expected) {
    return { isValid: false, message: `Expected exactly ${expected} digits for ${code}` };
  }
  return { isValid: true, message: "Valid phone number format" };
}
