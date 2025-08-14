import { useState, useEffect } from "react";
import axios from "axios";

const useCountryCode = () => {
  const [countryCode, setCountryCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getCountryCode = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/location`,
          {
            withCredentials: true,
            timeout: 10000, // 10 second timeout
          }
        );

        console.log("Location API Response:", response.data);

        // Handle the new unified response structure
        if (response.data.success && response.data.data) {
          const receivedCountryCode = response.data.data.countryCode;

          // Validate country code
          if (
            !receivedCountryCode ||
            receivedCountryCode === "XX" ||
            receivedCountryCode === "Unknown"
          ) {
            console.warn("Invalid country code received, using fallback");
            // Use a fallback country code based on user's browser language or timezone
            const fallbackCountry = getFallbackCountry();
            setCountryCode(fallbackCountry);
          } else {
            setCountryCode(receivedCountryCode);
          }
        } else {
          throw new Error("Invalid response structure from location API");
        }
      } catch (err) {
        console.error("Error fetching location:", err);
        setError(err.message);

        // Production fallback: try to determine country from browser
        const fallbackCountry = getFallbackCountry();
        setCountryCode(fallbackCountry);
      } finally {
        setLoading(false);
      }
    };

    getCountryCode();
  }, []);

  // Fallback method to determine country from browser
  const getFallbackCountry = () => {
    try {
      // Try to get country from browser language
      const language = navigator.language || navigator.userLanguage;
      if (language) {
        const countryFromLang = language.split("-")[1]?.toUpperCase();
        if (countryFromLang && countryFromLang.length === 2) {
          return countryFromLang;
        }
      }

      // Try to get country from timezone
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (timezone) {
        // Extract country from timezone (e.g., "Asia/Kolkata" -> "IN")
        const timezoneParts = timezone.split("/");
        if (timezoneParts.length > 1) {
          const countryMap = {
            "Asia/Kolkata": "IN",
            "America/New_York": "US",
            "Europe/London": "GB",
            "Asia/Tokyo": "JP",
            "Asia/Shanghai": "CN",
            "Europe/Paris": "FR",
            "Europe/Berlin": "DE",
            "Australia/Sydney": "AU",
            "America/Toronto": "CA",
            "America/Sao_Paulo": "BR",
          };

          if (countryMap[timezone]) {
            return countryMap[timezone];
          }
        }
      }

      // Final fallback
      return "US";
    } catch (err) {
      console.warn("Fallback country detection failed:", err);
      return "US";
    }
  };

  return { countryCode, loading, error };
};

export default useCountryCode;
