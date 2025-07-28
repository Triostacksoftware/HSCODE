import { parsePhoneNumber } from "libphonenumber-js";

export const getCountryFromNumber = (number) => {
  try {
    const phoneNumber = parsePhoneNumber(number);
    return phoneNumber.country; // e.g., 'IN' for India
  } catch (err) {
    console.error("Invalid number:", err.message);
    return null;
  }
};

// Example usage
console.log(getCountryFromNumber("+919876543210")); // Output: 'IN'
