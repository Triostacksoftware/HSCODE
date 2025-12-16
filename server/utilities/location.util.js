import geoip from 'geoip-lite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory (ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load countries from countries.json (only countries where application works)
let countryNamesMap = null;

function loadCountriesMap() {
  if (countryNamesMap) {
    return countryNamesMap; // Return cached map
  }
  
  try {
    // Path to countries.json in server/public directory
    const countriesPath = path.join(__dirname, '..', 'public', 'countries.json');
    
    if (!fs.existsSync(countriesPath)) {
      console.warn('⚠️ countries.json not found at:', countriesPath, '- Using fallback');
      countryNamesMap = { 'IN': 'India' }; // Fallback to just India
      return countryNamesMap;
    }
    
    const countriesData = JSON.parse(fs.readFileSync(countriesPath, 'utf8'));
    
    // Create a map from country code to country name
    countryNamesMap = {};
    countriesData.forEach(country => {
      if (country.code && country.name) {
        countryNamesMap[country.code] = country.name;
      }
    });
    
    console.log(`✅ Loaded ${Object.keys(countryNamesMap).length} countries from countries.json`);
    return countryNamesMap;
  } catch (error) {
    console.error('❌ Error loading countries.json:', error.message);
    countryNamesMap = { 'IN': 'India' }; // Fallback to just India
    return countryNamesMap;
  }
}

function getCountry(ip) {
  try {
    // Validate IP address
    if (!ip || typeof ip !== 'string') {
      console.error('❌ Invalid IP address:', ip);
      return { code: "IN", name: "India" };
    }
    
    // Handle localhost FIRST - before cleaning (to catch ::1)
    const originalIP = ip.trim();
    if (originalIP === '::1' || originalIP === '127.0.0.1' || originalIP === 'localhost' || originalIP.startsWith('127.') || originalIP.startsWith('::')) {
      console.log('🏠 Localhost detected, using test IP for development');
      const cleanIP = '198.145.121.235'; // Test IP for localhost development
      
      // Use geoip-lite to lookup country for test IP
      const geo = geoip.lookup(cleanIP);
      
      console.log('🔍 GeoIP lookup for', cleanIP, ':', geo ? 'Found' : 'Not found');
      
      if (geo && geo.country) {
        const countryCode = geo.country;
        const countryNames = loadCountriesMap();
        
        if (countryNames[countryCode]) {
          const countryName = countryNames[countryCode];
          
          console.log('✅ Country detected (supported) from test IP:', { 
            code: countryCode, 
            name: countryName,
            region: geo.region || 'N/A',
            city: geo.city || 'N/A'
          });
          
          return {
            code: countryCode,
            name: countryName
          };
        }
      }
      
      // Fallback if test IP lookup fails
      return { code: "IN", name: "India" };
    }
    
    // Clean IP address (remove port if present and handle IPv6)
    let cleanIP = ip.split(':')[0].trim();
    
    // Handle IPv6 mapped IPv4 addresses (::ffff:)
    if (cleanIP.startsWith('::ffff:')) {
      cleanIP = cleanIP.substring(7);
    }
    
    // Validate IP format (basic check)
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!ipRegex.test(cleanIP)) {
      console.error('❌ Invalid IP format:', cleanIP);
      return { code: "IN", name: "India" };
    }
    
    // Use geoip-lite to lookup country
    const geo = geoip.lookup(cleanIP);
    
    console.log('🔍 GeoIP lookup for', cleanIP, ':', geo ? 'Found' : 'Not found');
    
    if (geo && geo.country) {
      const countryCode = geo.country;
      
      // Load countries map (only countries where application works)
      const countryNames = loadCountriesMap();
      
      // Check if detected country is supported by the application
      if (countryNames[countryCode]) {
        const countryName = countryNames[countryCode];
        
        console.log('✅ Country detected (supported):', { 
          code: countryCode, 
          name: countryName,
          region: geo.region || 'N/A',
          city: geo.city || 'N/A'
        });
        
        return {
          code: countryCode,  // e.g. "US"
          name: countryName   // e.g. "United States"
        };
      } else {
        // Country detected but not supported by application - fallback to India
        console.warn('⚠️ Country detected but not supported:', {
          detected: countryCode,
          region: geo.region || 'N/A',
          city: geo.city || 'N/A',
          fallback: 'IN (India)'
        });
        return { code: "IN", name: "India" };
      }
    } else {
      console.warn('⚠️ No country data found for IP:', cleanIP, '- Using default (India)');
      return { code: "IN", name: "India" };
    }
  } catch (error) {
    console.error('❌ Error in getCountry:', error.message);
    console.error('Stack:', error.stack);
    return { code: "IN", name: "India" };
  }
}

export default getCountry;
