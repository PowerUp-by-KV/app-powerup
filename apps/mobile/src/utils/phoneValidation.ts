/**
 * Phone Validation Utility
 * Validates phone numbers based on country code
 */

export interface CountryCode {
  code: string;
  digits: number;
  country: string;
}

export const countryCodeMap: Record<string, CountryCode> = {
  "+1": { code: "+1", digits: 10, country: "USA/Canada" },
  "+44": { code: "+44", digits: 10, country: "UK" },
  "+91": { code: "+91", digits: 10, country: "India" },
  "+86": { code: "+86", digits: 11, country: "China" },
  "+81": { code: "+81", digits: 10, country: "Japan" },
  "+33": { code: "+33", digits: 9, country: "France" },
  "+49": { code: "+49", digits: 11, country: "Germany" },
  "+61": { code: "+61", digits: 9, country: "Australia" },
  "+39": { code: "+39", digits: 10, country: "Italy" },
  "+34": { code: "+34", digits: 9, country: "Spain" },
  "+55": { code: "+55", digits: 11, country: "Brazil" },
  "+7": { code: "+7", digits: 10, country: "Russia" },
  "+82": { code: "+82", digits: 10, country: "South Korea" },
  "+60": { code: "+60", digits: 9, country: "Malaysia" },
  "+65": { code: "+65", digits: 8, country: "Singapore" },
  "+66": { code: "+66", digits: 9, country: "Thailand" },
  "+62": { code: "+62", digits: 10, country: "Indonesia" },
  "+63": { code: "+63", digits: 10, country: "Philippines" },
  "+92": { code: "+92", digits: 10, country: "Pakistan" },
  "+880": { code: "+880", digits: 10, country: "Bangladesh" },
};

/**
 * Get list of country codes for dropdown selector
 */
export const getCountryCodesList = (): CountryCode[] => {
  return Object.values(countryCodeMap).sort((a, b) => {
    // Sort by code length descending, then alphabetically
    if (a.code.length !== b.code.length) {
      return b.code.length - a.code.length;
    }
    return a.code.localeCompare(b.code);
  });
};

/**
 * Extract country code from phone number
 * @param phone - Phone number string
 * @returns Country code or null
 */
export const extractCountryCode = (phone: string): string | null => {
  const trimmed = phone.trim();
  for (const code of Object.keys(countryCodeMap).sort((a, b) => b.length - a.length)) {
    if (trimmed.startsWith(code)) {
      return code;
    }
  }
  return null;
};

/**
 * Validate phone number based on country code (without country code prefix)
 * @param countryCode - Country code (e.g., "+91")
 * @param phoneDigits - Phone number digits only
 * @returns Validation result with message
 */
export const validatePhoneDigits = (
  countryCode: string,
  phoneDigits: string,
): { isValid: boolean; message: string; remainingDigits?: number } => {
  if (!countryCodeMap[countryCode]) {
    return { isValid: false, message: "Invalid country code" };
  }

  const countryInfo = countryCodeMap[countryCode];
  const digitCount = phoneDigits.replace(/\D/g, "").length;

  if (digitCount < countryInfo.digits) {
    const remaining = countryInfo.digits - digitCount;
    return {
      isValid: false,
      message: `Need ${remaining} more digit${remaining > 1 ? "s" : ""}`,
      remainingDigits: remaining,
    };
  }

  if (digitCount > countryInfo.digits) {
    return {
      isValid: false,
      message: `Too many digits (max ${countryInfo.digits})`,
    };
  }

  return { isValid: true, message: `Valid ${countryInfo.country} number` };
};

/**
 * Validate full phone number based on country code
 * @param phone - Full phone number with country code
 * @returns Validation result with message
 */
export const validatePhoneNumber = (
  phone: string,
): { isValid: boolean; message: string; remainingDigits?: number } => {
  const trimmed = phone.trim();

  // Check if starts with +
  if (!trimmed.startsWith("+")) {
    return { isValid: false, message: "Phone must start with +" };
  }

  const countryCode = extractCountryCode(trimmed);
  if (!countryCode) {
    return { isValid: false, message: "Invalid country code" };
  }

  const countryInfo = countryCodeMap[countryCode];

  if (!countryInfo) {
    return { isValid: false, message: "Country code not found" };
  }

  const phoneWithoutCode = trimmed.substring(countryCode.length);
  const digitCount = phoneWithoutCode.replace(/\D/g, "").length;

  if (digitCount < countryInfo.digits) {
    const remaining = countryInfo.digits - digitCount;
    return {
      isValid: false,
      message: `${countryInfo.country}: Need ${remaining} more digit${remaining > 1 ? "s" : ""}`,
      remainingDigits: remaining,
    };
  }

  if (digitCount > countryInfo.digits) {
    return {
      isValid: false,
      message: `${countryInfo.country}: Too many digits (max ${countryInfo.digits})`,
    };
  }

  return { isValid: true, message: `Valid ${countryInfo.country} number` };
};

/**
 * Get expected digit count for a country code
 */
export const getExpectedDigitCount = (countryCode: string): number | null => {
  if (!countryCodeMap[countryCode]) return null;
  return countryCodeMap[countryCode].digits;
};
