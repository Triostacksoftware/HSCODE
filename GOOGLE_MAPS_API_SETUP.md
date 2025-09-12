# Google Maps API Setup Guide

This guide will help you set up Google Maps API for location sharing functionality in the lead form.

## Prerequisites

- Google Cloud Platform account
- Billing enabled on your Google Cloud project

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable billing for your project

## Step 2: Enable Required APIs

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for and enable the following APIs:
   - **Geocoding API** (for converting coordinates to addresses)
   - **Maps JavaScript API** (for future map features)

## Step 3: Create API Key

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the generated API key

## Step 4: Secure Your API Key (Recommended)

1. Click on your API key to edit it
2. Under "Application restrictions", select "HTTP referrers (web sites)"
3. Add your domain(s):
   - `http://localhost:3000/*` (for development)
   - `https://yourdomain.com/*` (for production)
4. Under "API restrictions", select "Restrict key"
5. Choose only the APIs you need:
   - Geocoding API
   - Maps JavaScript API

## Step 5: Configure Environment Variables

1. In your project root, create or edit `.env.local` file
2. Add your API key:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

## Step 6: Test the Integration

1. Start your development server: `npm run dev`
2. Open the lead form in your application
3. Click the location icon next to the address field
4. Allow location access when prompted
5. The address field should automatically populate with your current location

## Reusable Code Implementation

Here's the complete, reusable code you can use in any React/Next.js project:

### 1. Environment Variables (.env.local)

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

### 2. Location Utility Functions

Create a new file `utils/locationUtils.js`:

```javascript
// Get current location using geolocation API
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        resolve({ latitude, longitude });
      },
      (error) => {
        let errorMessage = "Unable to retrieve your location";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied by user";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out";
            break;
          default:
            errorMessage =
              "An unknown error occurred while retrieving location";
            break;
        }
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  });
};

// Get address from coordinates using Google Maps Geocoding API
export const getAddressFromCoordinates = async (latitude, longitude) => {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      throw new Error("Google Maps API key is not configured");
    }

    console.log("Getting address for coordinates:", latitude, longitude);

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
    );
    const data = await response.json();

    console.log("Google Maps API response:", data);

    if (data.status === "OK" && data.results.length > 0) {
      const address = data.results[0].formatted_address;
      console.log("Found address:", address);
      return address;
    } else {
      console.error("Google Maps API error:", data.status, data.error_message);
      throw new Error(
        `Google Maps API error: ${data.status} - ${
          data.error_message || "No address found"
        }`
      );
    }
  } catch (error) {
    console.error("Error getting address from coordinates:", error);
    throw error;
  }
};

// Complete location sharing function
export const getCurrentLocationWithAddress = async () => {
  try {
    console.log("Starting location sharing process...");

    // Get current location
    const location = await getCurrentLocation();
    console.log("Got current location:", location);

    // Get address from coordinates using Google Maps API
    const address = await getAddressFromCoordinates(
      location.latitude,
      location.longitude
    );
    console.log("Got address from Google Maps:", address);

    console.log("Location sharing completed successfully");

    return {
      success: true,
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
      },
      address: address,
    };
  } catch (error) {
    console.error("Error getting location:", error);

    let errorMessage = "Failed to get your location. Please try again.";

    if (error.message === "Geolocation is not supported by this browser") {
      errorMessage = "Location sharing is not supported by your browser.";
    } else if (error.code === 1) {
      errorMessage =
        "Location access denied. Please enable location permissions.";
    } else if (error.code === 2) {
      errorMessage = "Location unavailable. Please check your GPS settings.";
    } else if (error.code === 3) {
      errorMessage = "Location request timed out. Please try again.";
    } else if (error.message.includes("No address found")) {
      errorMessage =
        "Could not find address for this location. Please enter manually.";
    } else if (error.message.includes("API key")) {
      errorMessage = "Google Maps API key is not configured properly.";
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
};
```

### 3. React Hook for Location Sharing

Create a new file `hooks/useLocationSharing.js`:

```javascript
import { useState } from "react";
import { getCurrentLocationWithAddress } from "../utils/locationUtils";

export const useLocationSharing = () => {
  const [sharingLocation, setSharingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [locationSuccess, setLocationSuccess] = useState("");

  const handleLocationShare = async (onSuccess) => {
    try {
      setLocationError("");
      setSharingLocation(true);

      const result = await getCurrentLocationWithAddress();

      if (result.success) {
        setLocationSuccess("Location added successfully!");

        // Call the success callback with location data
        if (onSuccess) {
          onSuccess(result.location, result.address);
        }

        // Clear success message after 3 seconds
        setTimeout(() => {
          setLocationSuccess("");
        }, 3000);
      } else {
        setLocationError(result.error);
      }
    } catch (error) {
      console.error("Error in location sharing:", error);
      setLocationError("An unexpected error occurred. Please try again.");
    } finally {
      setSharingLocation(false);
    }
  };

  return {
    sharingLocation,
    locationError,
    locationSuccess,
    handleLocationShare,
    setLocationError,
    setLocationSuccess,
  };
};
```

### 4. Location Button Component

Create a new file `components/LocationButton.jsx`:

```jsx
import React from "react";

const LocationButton = ({
  onClick,
  disabled,
  success,
  className = "",
  title = "Add current location",
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed border ${
        success
          ? "text-green-600 bg-green-50 border-green-200"
          : "text-gray-600 hover:text-red-600 hover:bg-red-50 border-gray-200"
      } ${className}`}
      title={success ? "Location added successfully!" : title}
    >
      {disabled ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
      ) : success ? (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      ) : (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      )}
    </button>
  );
};

export default LocationButton;
```

### 5. Usage Example in Any Form

```jsx
import React, { useState } from "react";
import { useLocationSharing } from "../hooks/useLocationSharing";
import LocationButton from "../components/LocationButton";

const MyForm = () => {
  const [address, setAddress] = useState("");
  const [coordinates, setCoordinates] = useState(null);

  const {
    sharingLocation,
    locationError,
    locationSuccess,
    handleLocationShare,
  } = useLocationSharing();

  const handleLocationSuccess = (location, address) => {
    setAddress(address);
    setCoordinates(location);
  };

  return (
    <div>
      <div className="flex gap-2">
        <input
          className="flex-1 border border-gray-200 p-2 rounded"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter address"
        />
        <LocationButton
          onClick={() => handleLocationShare(handleLocationSuccess)}
          disabled={sharingLocation}
          success={!!locationSuccess}
        />
      </div>

      {locationError && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
          {locationError}
        </div>
      )}

      {locationSuccess && (
        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-green-600 text-sm">
          {locationSuccess}
        </div>
      )}
    </div>
  );
};

export default MyForm;
```

### 6. Next.js Configuration

Add to your `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY:
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  },
};

module.exports = nextConfig;
```

## Troubleshooting

### Common Issues:

1. **"Google Maps API key is not configured"**

   - Check that your `.env.local` file has the correct variable name
   - Restart your development server after adding the environment variable

2. **"Location access denied"**

   - Make sure to allow location access in your browser
   - Check that your site is served over HTTPS (required for geolocation)

3. **"No address found for these coordinates"**

   - Check that the Geocoding API is enabled
   - Verify your API key has the correct permissions

4. **API quota exceeded**
   - Check your Google Cloud Console for usage limits
   - Consider upgrading your billing plan if needed

### Debug Mode:

The application includes console logging to help debug issues. Open your browser's developer console to see detailed logs when testing the location feature.

## Cost Considerations

- Geocoding API: $5 per 1,000 requests
- Maps JavaScript API: $7 per 1,000 map loads
- Free tier: $200 credit per month for new users

## Security Best Practices

1. Always restrict your API key to specific domains
2. Use environment variables to store API keys
3. Never commit API keys to version control
4. Regularly rotate your API keys
5. Monitor your API usage in Google Cloud Console

## Support

If you encounter any issues:

1. Check the browser console for error messages
2. Verify your API key configuration
3. Ensure all required APIs are enabled
4. Check your Google Cloud Console for quota and billing issues
