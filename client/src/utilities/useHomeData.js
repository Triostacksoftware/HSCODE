import { useState, useEffect } from "react";
import axios from "axios";

const useHomeData = (countryCode) => {
  const [homeData, setHomeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHomeData = async () => {
      if (!countryCode) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/home-data/country/${countryCode}`,
          {
            withCredentials: true,
          }
        );

        setHomeData(response.data.data);
      } catch (err) {
        console.error("Error fetching home data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, [countryCode]);

  return { homeData, loading, error };
};

export default useHomeData;
