import { useState, useEffect } from 'react';
import axios from 'axios';

function useCountryCode() {
  const [countryInfo, setCountryInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCountryCode = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/location`
        );
        console.log("response", response);
        setCountryInfo(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching country code:', err);
        setError(err);
        // Fallback to India if there's an error
        setCountryInfo({ code: "IN", name: "India" });
      } finally {
        setLoading(false);
      }
    };

    fetchCountryCode();
  }, []);

  return { countryInfo, loading, error };
}

export default useCountryCode;