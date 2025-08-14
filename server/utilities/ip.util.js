import axios from "axios";

export async function getIpLocation(req) {
  try {
    // Get the real IP address from various headers (production-ready)
    const forwarded = req.headers["x-forwarded-for"];
    const realIp = req.headers["x-real-ip"];
    const cfConnectingIp = req.headers["cf-connecting-ip"]; // Cloudflare

    const ip =
      cfConnectingIp ||
      realIp ||
      forwarded?.split(",")[0]?.trim() ||
      req.socket?.remoteAddress ||
      req.ip ||
      "127.0.0.1";

    // Production IP location detection
    let locationData = null;

    try {
      // Primary service: ipapi.co (more reliable)
      const { data } = await axios.get(`https://ipapi.co/${ip}/json/`, {
        timeout: 5000, // 5 second timeout
        headers: {
          "User-Agent": "HSCODE-App/1.0",
        },
      });

      if (
        data &&
        data.country &&
        data.country !== "XX" &&
        data.country !== "Unknown"
      ) {
        locationData = data;
      }
    } catch (err) {
      console.log("Primary IP service failed, trying fallback...");
    }

    // Fallback service: ip-api.com
    if (!locationData) {
      try {
        const { data } = await axios.get(`http://ip-api.com/json/${ip}`, {
          timeout: 5000,
          headers: {
            "User-Agent": "HSCODE-App/1.0",
          },
        });

        if (
          data &&
          data.countryCode &&
          data.countryCode !== "XX" &&
          data.status === "success"
        ) {
          locationData = {
            country: data.countryCode,
            country_name: data.country,
          };
        }
      } catch (err) {
        console.log("Fallback IP service also failed");
      }
    }

    // If all services failed or returned invalid data, default to India
    if (!locationData) {
      console.warn(`Failed to get location for IP: ${ip}, defaulting to India`);
      return {
        ip,
        country: "India",
        countryCode: "IN", // Default to India instead of XX
      };
    }

    // Validate the country code - if it's still invalid, default to India
    if (
      locationData.country === "XX" ||
      locationData.country === "Unknown" ||
      !locationData.country
    ) {
      console.warn(
        `Invalid country code received: ${locationData.country}, defaulting to India`
      );
      return {
        ip,
        country: "India",
        countryCode: "IN", // Default to India for invalid codes
      };
    }

    return {
      ip,
      country: locationData.country_name || "India",
      countryCode: locationData.country || "IN", // Fallback to IN if still invalid
    };
  } catch (err) {
    console.error("Critical error in IP location service:", err.message);
    return {
      ip: "unknown",
      country: "India", // Default to India on any error
      countryCode: "IN", // Default to India on any error
    };
  }
}
