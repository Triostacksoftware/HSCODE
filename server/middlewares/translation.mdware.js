import {
  translateLeadData,
  translateUserData,
} from "../utilities/translation.util.js";

/**
 * Translation middleware for lead data
 * Automatically translates lead form data to English before saving to database
 */
export const translateLeadMiddleware = async (req, res, next) => {
  try {
    // Only translate if we have body data
    if (!req.body || Object.keys(req.body).length === 0) {
      return next();
    }

    // Translate the lead data
    const translatedData = await translateLeadData(req.body);

    // Replace the original body with translated data
    req.body = translatedData;
    next();
  } catch (error) {
    console.error("❌ Translation middleware error:", error.message);
    // Continue without translation if there's an error
    next();
  }
};

/**
 * Translation middleware for user data
 * Automatically translates user profile data to English before saving to database
 */
export const translateUserMiddleware = async (req, res, next) => {
  try {
    // Only translate if we have body data
    if (!req.body || Object.keys(req.body).length === 0) {
      return next();
    }

    // Translate the user data
    const translatedData = await translateUserData(req.body);

    // Replace the original body with translated data
    req.body = translatedData;
    next();
  } catch (error) {
    console.error("❌ Translation middleware error:", error.message);
    // Continue without translation if there's an error
    next();
  }
};

export default {
  translateLeadMiddleware,
  translateUserMiddleware,
};
