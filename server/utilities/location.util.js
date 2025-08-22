import maxmind from 'maxmind';

async function getCountry(ip) {
 try {
    // Load the database (only once)
    const lookup = await maxmind.open('./db/GeoLite2-Country.mmdb');
  
    // Get country info
    const result = lookup.get(ip);
  
    if (result && result.country) {
      return {
        code: result.country.iso_code,  // e.g. "US"
        name: result.country.names.en   // e.g. "United States"
      };
    } else {
      return { code: "IN", name: "India" };
    }
 } catch (error) {
  return { code: "IN", name: "India" };
 }
}

// Example
export default getCountry;
