import speakeasy from "speakeasy";
import QRCode from "qrcode";

// Generate a new TOTP secret for an admin
export const generateTOTPSecret = (email) => {
  const secret = speakeasy.generateSecret({
    name: `HSCODE Admin (${email})`,
    issuer: "HSCODE",
    length: 32,
  });

  return {
    secret: secret.base32,
    otpauth_url: secret.otpauth_url,
  };
};

// Generate QR code for Google Authenticator setup
export const generateQRCode = async (otpauth_url) => {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(otpauth_url);
    return qrCodeDataURL;
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw new Error("Failed to generate QR code");
  }
};

// Verify TOTP token from Google Authenticator
export const verifyTOTP = (token, secret) => {
  try {
    return speakeasy.totp.verify({
      secret: secret,
      encoding: "base32",
      token: token,
      window: 2, // Allow 2 time steps (60 seconds) before and after current time
    });
  } catch (error) {
    console.error("Error verifying TOTP:", error);
    return false;
  }
};

// Generate current TOTP token (for testing purposes)
export const generateCurrentTOTP = (secret) => {
  try {
    return speakeasy.totp({
      secret: secret,
      encoding: "base32",
    });
  } catch (error) {
    console.error("Error generating current TOTP:", error);
    return null;
  }
};
