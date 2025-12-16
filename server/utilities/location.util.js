import maxmind from 'maxmind';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get current directory (ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cache the lookup instance to avoid reloading on every request
let lookupCache = null;

async function getCountry(ip) {
  try {
    // Validate IP address
    if (!ip || typeof ip !== 'string') {
      console.error('❌ Invalid IP address:', ip);
      return { code: "IN", name: "India" };
    }
    
    // Clean IP address (remove port if present)
    const cleanIP = ip.split(':')[0].trim();
    
    // Validate IP format (basic check)
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!ipRegex.test(cleanIP) && cleanIP !== '::1' && !cleanIP.startsWith('::ffff:')) {
      console.error('❌ Invalid IP format:', cleanIP);
      return { code: "IN", name: "India" };
    }
    
    // Get absolute path to database
    const dbPath = path.join(__dirname, '..', 'db', 'GeoLite2-Country.mmdb');
    
    // Check if database file exists
    if (!fs.existsSync(dbPath)) {
      console.error('❌ GeoLite2 database not found at:', dbPath);
      return { code: "IN", name: "India" };
    }
    
    // Load the database (cache it to avoid reloading)
    if (!lookupCache) {
      console.log('📂 Loading GeoLite2 database from:', dbPath);
      lookupCache = await maxmind.open(dbPath);
      console.log('✅ GeoLite2 database loaded successfully');
    }
  
    // Get country info
    const result = lookupCache.get(cleanIP);
    
    console.log('🔍 GeoIP lookup for', cleanIP, ':', result ? 'Found' : 'Not found');
  
    if (result && result.country) {
      const countryCode = result.country.iso_code;
      const countryName = result.country.names?.en || result.country.names?.en || 'Unknown';
      
      console.log('✅ Country detected:', { code: countryCode, name: countryName });
      
      return {
        code: countryCode,  // e.g. "US"
        name: countryName   // e.g. "United States"
      };
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

// Example
export default getCountry;
