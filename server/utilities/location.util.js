import { getIpLocation } from "./ip.util.js";

/**
 * Unified location detection utility
 * Can be used by any controller or route that needs location information
 */
export const getLocationInfo = async (req) => {
  try {
    const location = await getIpLocation(req);

    return {
      success: true,
      data: {
        ip: location.ip,
        country: location.country,
        countryCode: location.countryCode,
        location: {
          ip: location.ip,
          country: location.country,
          countryCode: location.countryCode,
        },
      },
    };
  } catch (error) {
    console.error("Location detection failed:", error);
    return {
      success: false,
      error: error.message,
      data: {
        ip: "unknown",
        country: "Unknown",
        countryCode: "XX",
      },
    };
  }
};

/**
 * Get only country code (lightweight version)
 */
export const getCountryCode = async (req) => {
  try {
    const location = await getIpLocation(req);
    return {
      success: true,
      countryCode: location.countryCode,
    };
  } catch (error) {
    console.error("Country code detection failed:", error);
    return {
      success: false,
      countryCode: "XX",
    };
  }
};

/**
 * Get full location details
 */
export const getFullLocation = async (req) => {
  try {
    const location = await getIpLocation(req);
    return {
      success: true,
      location: {
        ip: location.ip,
        country: location.country,
        countryCode: location.countryCode,
      },
    };
  } catch (error) {
    console.error("Full location detection failed:", error);
    return {
      success: false,
      location: {
        ip: "unknown",
        country: "Unknown",
        countryCode: "XX",
      },
    };
  }
};
