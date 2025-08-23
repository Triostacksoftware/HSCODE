import { useState, useEffect } from "react";
import axios from "axios";

const useHomeData = (countryCode) => {
  const [homeData, setHomeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFallback, setIsFallback] = useState(false);

  useEffect(() => {
    const fetchHomeData = async () => {
      if (!countryCode) {
        return;
      }

      try {
        setLoading(true);
        setError(null);
        setIsFallback(false);

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/home-data/country/${countryCode}`,
          {
            withCredentials: true,
          }
        );

        // Check if this is fallback data
        if (response.data.fallback) {
          setIsFallback(true);
          console.log(
            `Using fallback home data from ${response.data.fallbackCountry} for ${response.data.originalCountry}`
          );

          // You can add a toast notification here if you want
          // toast.info(`Showing content for India (IN) as ${response.data.originalCountry} content is not available`);
        }

        // Ensure we always have a valid data structure
        const data = response.data.data || {};
        setHomeData(data);
      } catch (err) {
        console.error("Error fetching home data:", err);
        setError(err.message);
        // Set fallback data structure to prevent crashes
        setHomeData({
          heroSection: {},
          aboutSection: {},
          featuredCategories: {},
          newsSection: {},
          testimonialSection: {},
          stats: {},
          faqSection: {},
          footer: {},
        });
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, [countryCode]);

  return { homeData, loading, error, isFallback };
};

export default useHomeData;
