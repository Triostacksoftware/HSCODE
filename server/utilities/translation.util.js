import axios from "axios";

/**
 * Translation utility for converting text to English
 * Uses Google Translate API to detect language and translate if needed
 */

// Detect language using Google Translate API
export const detectLanguage = async (text) => {
  try {
    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return "en";
    }

    const response = await axios.post(
      "https://translation.googleapis.com/language/translate/v2/detect",
      {
        q: text,
      },
      {
        params: {
          key: process.env.GOOGLE_TRANSLATE_API_KEY,
        },
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data && response.data.data && response.data.data.detections) {
      const detection = response.data.data.detections[0][0];
      return detection.language;
    }

    return "en"; // Default to English if detection fails
  } catch (error) {
    console.error("Language detection error:", error.message);
    return "en"; // Default to English if detection fails
  }
};

// Clean and normalize text after translation
const cleanTranslatedText = (text) => {
  if (!text || typeof text !== "string") return text;

  return text
    .trim() // Remove leading/trailing whitespace
    .replace(/\n+/g, " ") // Replace multiple newlines with single space
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .trim(); // Final trim
};

// Language detection and translation service
export const translateToEnglish = async (text) => {
  try {
    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return text;
    }

    // Check if Google Translate API key is configured
    if (!process.env.GOOGLE_TRANSLATE_API_KEY) {
      console.warn(
        "⚠️ GOOGLE_TRANSLATE_API_KEY not configured, skipping translation"
      );
      return text;
    }

    // First detect the language
    const detectedLanguage = await detectLanguage(text);

    // If already English, return cleaned version
    if (detectedLanguage === "en") {
      const cleanedText = cleanTranslatedText(text);
      return cleanedText;
    }

    // Use Google Translate API to translate to English
    const response = await axios.post(
      "https://translation.googleapis.com/language/translate/v2",
      {
        q: text,
        target: "en",
        source: detectedLanguage,
        format: "text",
      },
      {
        params: {
          key: process.env.GOOGLE_TRANSLATE_API_KEY,
        },
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (
      response.data &&
      response.data.data &&
      response.data.data.translations
    ) {
      const translatedText = response.data.data.translations[0].translatedText;
      const cleanedText = cleanTranslatedText(translatedText);
      return cleanedText;
    }

    return text; // Return original if translation fails
  } catch (error) {
    console.error("Translation error:", error.message);
    return text; // Return original text if translation fails
  }
};

// Batch translate multiple texts
export const translateMultipleToEnglish = async (texts) => {
  try {
    const translationPromises = texts.map((text) => translateToEnglish(text));
    const results = await Promise.all(translationPromises);
    return results;
  } catch (error) {
    console.error("Batch translation error:", error.message);
    return texts; // Return original texts if translation fails
  }
};

// Deep clone an object
const deepClone = (obj) => {
  if (obj === null || typeof obj !== "object") return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(deepClone);
  if (typeof obj === "object") {
    const cloned = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }
};

// Recursively find and collect all string values from an object
const collectStrings = (obj, path = "") => {
  const strings = [];

  if (typeof obj === "string" && obj.trim()) {
    strings.push({ value: obj, path });
  } else if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      strings.push(...collectStrings(item, `${path}[${index}]`));
    });
  } else if (obj && typeof obj === "object") {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const newPath = path ? `${path}.${key}` : key;
        strings.push(...collectStrings(obj[key], newPath));
      }
    }
  }

  return strings;
};

// Set a value in an object using dot notation path
const setValueByPath = (obj, path, value) => {
  const keys = path.split(".");
  let current = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];

    // Handle array indices
    if (key.includes("[") && key.includes("]")) {
      const arrayKey = key.substring(0, key.indexOf("["));
      const index = parseInt(
        key.substring(key.indexOf("[") + 1, key.indexOf("]"))
      );

      if (!current[arrayKey]) current[arrayKey] = [];
      if (!current[arrayKey][index]) current[arrayKey][index] = {};
      current = current[arrayKey][index];
    } else {
      if (!current[key]) current[key] = {};
      current = current[key];
    }
  }

  const lastKey = keys[keys.length - 1];
  if (lastKey.includes("[") && lastKey.includes("]")) {
    const arrayKey = lastKey.substring(0, lastKey.indexOf("["));
    const index = parseInt(
      lastKey.substring(lastKey.indexOf("[") + 1, lastKey.indexOf("]"))
    );
    if (!current[arrayKey]) current[arrayKey] = [];
    current[arrayKey][index] = value;
  } else {
    current[lastKey] = value;
  }
};

// Translate lead object fields (supports nested objects and arrays)
export const translateLeadData = async (leadData) => {
  try {
    // Deep clone the original data
    const translatedData = deepClone(leadData);

    // Define which fields should be translated (supports nested paths)
    const fieldsToTranslate = [
      "productName",
      "productDescription",
      "buyerDeliveryAddress",
      "sellerPickupAddress",
      "companyName",
      "contactPerson",
      "additionalNotes",
      "specialRequest",
      "remarks",
      "description",
      // Support nested fields
      "buyer.companyName",
      "buyer.contactPerson",
      "buyer.address",
      "seller.companyName",
      "seller.contactPerson",
      "seller.address",
      // Support array fields
      "documents[].description",
      "specifications[].value",
      "requirements[].description",
    ];

    // Collect all strings that need translation
    const stringsToTranslate = collectStrings(translatedData);

    // Filter only the fields we want to translate
    const filteredStrings = stringsToTranslate.filter((item) => {
      return fieldsToTranslate.some((field) => {
        // Handle exact matches
        if (field === item.path) return true;

        // Handle array patterns like "documents[].description"
        if (field.includes("[]")) {
          const basePath = field.replace("[]", "");
          return item.path.startsWith(basePath);
        }

        return false;
      });
    });

    if (filteredStrings.length === 0) {
      return translatedData;
    }

    // Extract just the text values for translation
    const textsToTranslate = filteredStrings.map((item) => item.value);

    // Translate all texts
    const translatedTexts = await translateMultipleToEnglish(textsToTranslate);

    // Map translated texts back to their original paths
    for (let i = 0; i < filteredStrings.length; i++) {
      const originalPath = filteredStrings[i].path;
      const translatedText = translatedTexts[i];
      setValueByPath(translatedData, originalPath, translatedText);
    }

    return translatedData;
  } catch (error) {
    console.error("❌ Error translating lead data:", error.message);
    return leadData; // Return original data if translation fails
  }
};

// Translate user profile data (supports nested objects and arrays)
export const translateUserData = async (userData) => {
  try {
    // Deep clone the original data
    const translatedData = deepClone(userData);

    // Define which fields should be translated (supports nested paths)
    const fieldsToTranslate = [
      "companyName",
      "about",
      "address",
      // Support nested fields
      "profile.companyName",
      "profile.about",
      "profile.address",
      "company.name",
      "company.description",
      "company.address",
      // Support array fields
      "skills[]",
      "languages[]",
      "certifications[].name",
      "certifications[].description",
    ];

    // Collect all strings that need translation
    const stringsToTranslate = collectStrings(translatedData);

    // Filter only the fields we want to translate
    const filteredStrings = stringsToTranslate.filter((item) => {
      return fieldsToTranslate.some((field) => {
        // Handle exact matches
        if (field === item.path) return true;

        // Handle array patterns like "skills[]"
        if (field.includes("[]")) {
          const basePath = field.replace("[]", "");
          return item.path.startsWith(basePath);
        }

        return false;
      });
    });

    if (filteredStrings.length === 0) {
      return translatedData;
    }

    // Extract just the text values for translation
    const textsToTranslate = filteredStrings.map((item) => item.value);

    // Translate all texts
    const translatedTexts = await translateMultipleToEnglish(textsToTranslate);

    // Map translated texts back to their original paths
    for (let i = 0; i < filteredStrings.length; i++) {
      const originalPath = filteredStrings[i].path;
      const translatedText = translatedTexts[i];
      setValueByPath(translatedData, originalPath, translatedText);
    }

    return translatedData;
  } catch (error) {
    console.error("❌ Error translating user data:", error.message);
    return userData;
  }
};

export default {
  detectLanguage,
  translateToEnglish,
  translateMultipleToEnglish,
  translateLeadData,
  translateUserData,
};
