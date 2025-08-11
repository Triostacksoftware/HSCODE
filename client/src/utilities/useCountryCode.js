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
          `${process.env.NEXT_PUBLIC_BASE_URL}/get-countrycode`,
          {
            withCredentials: true,
          }
        );

        setCountryCode(response.data.countryCode);
      } catch (err) {
        console.error("Error fetching country code:", err);
        setError(err.message);
        // Fallback to a default country code
        setCountryCode("US");
      } finally {
        setLoading(false);
      }
    };

    getCountryCode();
  }, []);

  return { countryCode, loading, error };
};

export default useCountryCode;
