import axios from 'axios';

export async function getIpLocation(req) {
  try {
    const forwarded = req.headers['x-forwarded-for'];
    const ip =
      forwarded?.split(',')[0]?.trim() ||
      req.socket?.remoteAddress ||
      req.ip ||
      '127.0.0.1'; // fallback for local dev

    const { data } = await axios.get(`https://ipapi.co/${'42.108.17.19'}/json/`);
    return {
      ip,
      country: data.country_name || 'Unknown',
      countryCode: data.country || 'XX'
    };
  } catch (err) {
    console.error('Failed to fetch IP location:', err.message);
    return {
      ip: 'unknown',
      country: 'Unknown',
      countryCode: 'XX'
    };
  }
}
