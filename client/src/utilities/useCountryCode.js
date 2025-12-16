import { useState, useEffect } from 'react';
import axios from 'axios';

function useCountryCode(onCountryDetected) {
  const [countryInfo, setCountryInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCountryCode = async () => {
      try {
        setLoading(true);
        
        // Check localStorage first for user's manually selected country
        let savedSelectedCountry = localStorage.getItem('selectedCountry');
        let parsedSelectedCountry = null;
        
        // Migration: If old homeCountry exists but selectedCountry doesn't, migrate it
        if (!savedSelectedCountry) {
          const oldHomeCountry = localStorage.getItem('homeCountry');
          if (oldHomeCountry) {
            try {
              localStorage.setItem('selectedCountry', oldHomeCountry);
              localStorage.removeItem('homeCountry'); // Remove old key
              savedSelectedCountry = oldHomeCountry;
              console.log('Migrated homeCountry to selectedCountry in useCountryCode');
            } catch (error) {
              console.error('Error migrating homeCountry:', error);
              localStorage.removeItem('homeCountry');
            }
          }
        }
        
        if (savedSelectedCountry) {
          try {
            parsedSelectedCountry = JSON.parse(savedSelectedCountry);
          } catch (error) {
            console.error('Error parsing saved selected country:', error);
            localStorage.removeItem('selectedCountry');
            parsedSelectedCountry = null;
          }
        }

        // Always fetch current IP detected country to check if it differs
        let ipDetectedCountry = null;
        try {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_BASE_URL}/location`
          );
          ipDetectedCountry = response.data;
          
          // Console log the detected country
          console.log("🌍 IP Detected Country:", {
            code: ipDetectedCountry.code,
            name: ipDetectedCountry.name,
            timestamp: new Date().toISOString()
          });
          
          // Store IP detected country in localStorage
          localStorage.setItem('ipDetectedCountry', JSON.stringify(ipDetectedCountry));
        } catch (err) {
          console.error('Error fetching IP detected country:', err);
          // Try to use stored IP detected country as fallback
          const savedIpDetectedCountry = localStorage.getItem('ipDetectedCountry');
          if (savedIpDetectedCountry) {
            try {
              ipDetectedCountry = JSON.parse(savedIpDetectedCountry);
            } catch (error) {
              console.error('Error parsing saved IP detected country:', error);
            }
          }
          
          // Final fallback to India
          if (!ipDetectedCountry) {
            ipDetectedCountry = { code: "IN", name: "India" };
            localStorage.setItem('ipDetectedCountry', JSON.stringify(ipDetectedCountry));
          }
        }

        // If user has a selected country, check if IP detected country differs
        if (parsedSelectedCountry && ipDetectedCountry) {
          if (parsedSelectedCountry.code !== ipDetectedCountry.code) {
            // IP detected country is different from selected country
            console.log("📍 Country mismatch detected:", {
              selected: parsedSelectedCountry,
              detected: ipDetectedCountry
            });
            
            // Trigger the prompt callback if provided
            if (onCountryDetected && typeof onCountryDetected === 'function') {
              onCountryDetected(ipDetectedCountry, parsedSelectedCountry);
            }
            
            // Still use selected country by default (user will be prompted)
            setCountryInfo(parsedSelectedCountry);
          } else {
            // Same country, no prompt needed
            setCountryInfo(parsedSelectedCountry);
          }
        } else if (parsedSelectedCountry) {
          // User has selected country but IP detection failed, use selected
          setCountryInfo(parsedSelectedCountry);
        } else if (ipDetectedCountry) {
          // No selected country, use IP detected
          setCountryInfo(ipDetectedCountry);
        } else {
          // Fallback to India
          const fallbackCountry = { code: "IN", name: "India" };
          setCountryInfo(fallbackCountry);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error in fetchCountryCode:', err);
        setError(err);
        // Fallback to India if there's an error
        const fallbackCountry = { code: "IN", name: "India" };
        localStorage.setItem('ipDetectedCountry', JSON.stringify(fallbackCountry));
        setCountryInfo(fallbackCountry);
      } finally {
        setLoading(false);
      }
    };

    fetchCountryCode();
  }, [onCountryDetected]);

  return { countryInfo, loading, error };
}

export default useCountryCode;