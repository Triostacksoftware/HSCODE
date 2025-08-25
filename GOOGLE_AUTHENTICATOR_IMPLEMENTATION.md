# Google Authenticator (TOTP) Implementation Guide

## Overview
This guide explains how to implement Google Authenticator (Time-based One-Time Password - TOTP) in your application, based on the implementation in the admin login system.

## What is TOTP?
TOTP (Time-based One-Time Password) is a computer algorithm that generates a one-time password based on:
- A shared secret key
- The current timestamp
- A time step (usually 30 seconds)

This creates a 6-digit code that changes every 30 seconds, providing an additional layer of security beyond username/password authentication.

## Implementation Flow

### 1. Initial Login Flow
```
User enters credentials → Server validates → Check if TOTP is configured
```

**Code Example:**
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Step 1: Check admin credentials
  const response = await axios.post(
    `${process.env.NEXT_PUBLIC_BASE_URL}/auth/admin-login`,
    {
      ...formData,
      countryCode: countryCode,
    },
    {
      withCredentials: true,
    }
  );

  if (response.data.requiresTOTP) {
    // Admin has TOTP configured - show TOTP input
    setRequiresTOTP(true);
    setMessage("Please enter your Google Authenticator code");
  } else {
    // Admin doesn't have TOTP - show TOTP setup
    setShowTOTPSetup(true);
    setQrCode(response.data.qrCode);
    setTotpSecret(response.data.totpSecret.secret);
    setMessage("Please scan the QR code and enter the TOTP code to complete setup");
  }
};
```

### 2. TOTP Verification Flow (Existing Users)
```
User enters 6-digit code → Server verifies TOTP → Login successful
```

**Code Example:**
```javascript
const handleTOTPSubmit = async (e) => {
  e.preventDefault();
  
  // Step 2A: If admin has TOTP - verify and login
  const response = await axios.post(
    `${process.env.NEXT_PUBLIC_BASE_URL}/auth/admin-login-totp`,
    {
      ...formData,
      totpToken: totpToken,
      countryCode: countryCode,
    },
    {
      withCredentials: true,
    }
  );

  if (response.status === 200) {
    setMessage("Login successful! Redirecting...");
    setTimeout(() => {
      router.push("/ap-admin-panel");
    }, 1000);
  }
};
```

### 3. TOTP Setup Flow (New Users)
```
Generate QR code → User scans with app → User enters code → Verify and complete setup
```

**Code Example:**
```javascript
const handleTOTPSetupSubmit = async (e) => {
  e.preventDefault();
  
  // Step 2B: If admin doesn't have TOTP - verify setup and login
  const response = await axios.post(
    `${process.env.NEXT_PUBLIC_BASE_URL}/auth/admin-verify-totp-setup`,
    {
      totpCode: totpCode,
    },
    {
      withCredentials: true,
    }
  );

  if (response.status === 200) {
    setMessage("TOTP setup complete! Login successful. Redirecting...");
    setTimeout(() => {
      router.push("/ap-admin-panel");
    }, 1000);
  }
};
```

## Frontend Components

### 1. TOTP Input Fields
The implementation uses 6 separate input fields for better UX:

```javascript
<div className="flex justify-center space-x-1 sm:space-x-2">
  {[0, 1, 2, 3, 4, 5].map((index) => (
    <input
      key={index}
      type="text"
      maxLength={1}
      value={totpToken[index] || ""}
      onChange={(e) => {
        const value = e.target.value;
        if (value.length <= 1) {
          const newToken = totpToken.split("");
          newToken[index] = value;
          setTotpToken(newToken.join(""));

          // Auto-focus next input
          if (value && index < 5) {
            const nextInput = e.target.parentNode.children[index + 1];
            if (nextInput) nextInput.focus();
          }
        }
      }}
      onKeyDown={(e) => {
        // Handle backspace navigation
        if (e.key === "Backspace" && !totpToken[index] && index > 0) {
          const prevInput = e.target.parentNode.children[index - 1];
          if (prevInput) prevInput.focus();
        }
      }}
      className="w-10 h-10 sm:w-12 sm:h-12 text-center border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none text-base sm:text-lg font-semibold"
      required
    />
  ))}
</div>
```

**Key Features:**
- Auto-focus to next input when typing
- Backspace navigation to previous input
- Individual input validation
- Responsive design

### 2. QR Code Display
For new users setting up TOTP:

```javascript
{/* QR Code Display */}
{qrCode && (
  <div className="text-center">
    <img 
      src={qrCode} 
      alt="TOTP QR Code" 
      className="mx-auto w-48 h-48 border border-gray-300 rounded-lg"
    />
    <p className="text-xs text-gray-500 mt-2">
      Secret: {totpSecret}
    </p>
  </div>
)}
```

## State Management

### Key State Variables
```javascript
const [requiresTOTP, setRequiresTOTP] = useState(false);
const [showTOTPSetup, setShowTOTPSetup] = useState(false);
const [qrCode, setQrCode] = useState("");
const [totpSecret, setTotpSecret] = useState("");
const [totpCode, setTotpCode] = useState("");
const [totpToken, setTotpToken] = useState("");
```

### State Flow Logic
```javascript
// Debug state changes
useEffect(() => {
  console.log("State changed:", {
    requiresTOTP,
    showTOTPSetup,
    qrCode: qrCode ? "QR code exists" : "No QR code",
    totpSecret: totpSecret ? "Secret exists" : "No secret"
  });
}, [requiresTOTP, showTOTPSetup, qrCode, totpSecret]);
```

## Complete Implementation Code

### 1. **Install Required Packages**
```bash
npm install speakeasy qrcode
```

### 2. **Backend Implementation (Node.js/Express)**

#### **TOTP Utility Functions**
```javascript
// utils/totp.js
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

class TOTPManager {
  // Generate new TOTP secret and QR code
  static async generateTOTP(userEmail, appName = 'YourApp') {
    try {
      const secret = speakeasy.generateSecret({
        name: userEmail,
        issuer: appName,
        length: 20
      });

      const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
      
      return {
        secret: secret.base32,
        qrCode: qrCodeUrl,
        otpauthUrl: secret.otpauth_url
      };
    } catch (error) {
      throw new Error('Failed to generate TOTP: ' + error.message);
    }
  }

  // Verify TOTP code
  static verifyTOTP(secret, token, window = 2) {
    try {
      return speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: token,
        window: window // Allow 2 time steps (60 seconds) for clock drift
      });
    } catch (error) {
      throw new Error('Failed to verify TOTP: ' + error.message);
    }
  }

  // Generate current TOTP code (for testing)
  static generateCurrentCode(secret) {
    try {
      return speakeasy.totp({
        secret: secret,
        encoding: 'base32'
      });
    } catch (error) {
      throw new Error('Failed to generate current code: ' + error.message);
    }
  }
}

module.exports = TOTPManager;
```

#### **Database Model (MongoDB/Mongoose)**
```javascript
// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  // TOTP fields
  totpSecret: {
    type: String,
    default: null
  },
  totpEnabled: {
    type: Boolean,
    default: false
  },
  totpCreatedAt: {
    type: Date,
    default: null
  },
  totpVerifiedAt: {
    type: Date,
    default: null
  },
  // Other fields...
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);
```

#### **Authentication Controller**
```javascript
// controllers/auth.controller.js
const User = require('../models/User');
const TOTPManager = require('../utils/totp');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class AuthController {
  // Initial login - check credentials and TOTP status
  static async adminLogin(req, res) {
    try {
      const { email, password, countryCode } = req.body;

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Check if user has TOTP configured
      if (user.totpEnabled && user.totpSecret) {
        // User has TOTP - require TOTP verification
        return res.json({
          requiresTOTP: true,
          message: 'Please enter your Google Authenticator code'
        });
      } else {
        // User doesn't have TOTP - generate and show setup
        const totpData = await TOTPManager.generateTOTP(email, 'HSCODE Admin');
        
        // Store the secret temporarily (you might want to use Redis for this)
        // For now, we'll store it in the user document
        user.totpSecret = totpData.secret;
        user.totpCreatedAt = new Date();
        await user.save();

        return res.json({
          requiresTOTP: false,
          qrCode: totpData.qrCode,
          totpSecret: {
            secret: totpData.secret,
            otpauthUrl: totpData.otpauthUrl
          },
          message: 'Please scan the QR code and enter the TOTP code to complete setup'
        });
      }
    } catch (error) {
      console.error('Admin login error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Verify TOTP for existing users
  static async adminLoginTOTP(req, res) {
    try {
      const { email, password, totpToken, countryCode } = req.body;

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Verify password again
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Verify TOTP
      const isTOTPValid = TOTPManager.verifyTOTP(user.totpSecret, totpToken);
      if (!isTOTPValid) {
        return res.status(401).json({ message: 'Invalid TOTP code' });
      }

      // TOTP is valid - generate JWT token
      const token = jwt.sign(
        { userId: user._id, email: user.email, role: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Set cookie
      res.cookie('adminToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });

      res.json({
        message: 'Login successful',
        user: {
          id: user._id,
          email: user.email,
          role: 'admin'
        }
      });
    } catch (error) {
      console.error('TOTP verification error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Verify TOTP setup for new users
  static async adminVerifyTOTPSetup(req, res) {
    try {
      const { totpCode } = req.body;

      // Get user from session/token (you'll need to implement session management)
      // For now, we'll assume we have the user ID from middleware
      const userId = req.userId; // This should come from your auth middleware
      
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Verify TOTP code
      const isTOTPValid = TOTPManager.verifyTOTP(user.totpSecret, totpCode);
      if (!isTOTPValid) {
        return res.status(401).json({ message: 'Invalid TOTP code' });
      }

      // TOTP setup is complete - enable TOTP for user
      user.totpEnabled = true;
      user.totpVerifiedAt = new Date();
      await user.save();

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, email: user.email, role: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Set cookie
      res.cookie('adminToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });

      res.json({
        message: 'TOTP setup complete',
        user: {
          id: user._id,
          email: user.email,
          role: 'admin'
        }
      });
    } catch (error) {
      console.error('TOTP setup verification error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

module.exports = AuthController;
```

#### **Routes**
```javascript
// routes/auth.routes.js
const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');

// Admin authentication routes
router.post('/admin-login', AuthController.adminLogin);
router.post('/admin-login-totp', AuthController.adminLoginTOTP);
router.post('/admin-verify-totp-setup', AuthController.adminVerifyTOTPSetup);

module.exports = router;
```

#### **Main Server File**
```javascript
// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/auth', authRoutes);

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### 3. **Frontend Implementation (React/Next.js)**

#### **Complete TOTP Component**
```jsx
// components/TOTPComponent.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MdVisibility, MdVisibilityOff, MdSecurity } from 'react-icons/md';

export default function TOTPComponent() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [totpToken, setTotpToken] = useState('');
  const [requiresTOTP, setRequiresTOTP] = useState(false);
  const [showTOTPSetup, setShowTOTPSetup] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [totpSecret, setTotpSecret] = useState('');
  const [totpCode, setTotpCode] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/auth/admin-login`,
        formData,
        { withCredentials: true }
      );

      if (response.data.requiresTOTP) {
        setRequiresTOTP(true);
        setShowTOTPSetup(false);
        setMessage('Please enter your Google Authenticator code');
      } else {
        setShowTOTPSetup(true);
        setRequiresTOTP(false);
        setQrCode(response.data.qrCode);
        setTotpSecret(response.data.totpSecret.secret);
        setMessage('Please scan the QR code and enter the TOTP code to complete setup');
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTOTPSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/auth/admin-login-totp`,
        {
          ...formData,
          totpToken
        },
        { withCredentials: true }
      );

      if (response.status === 200) {
        setMessage('Login successful! Redirecting...');
        // Redirect to admin panel
        setTimeout(() => {
          window.location.href = '/admin-panel';
        }, 1000);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'TOTP verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTOTPSetupSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/auth/admin-verify-totp-setup`,
        { totpCode },
        { withCredentials: true }
      );

      if (response.status === 200) {
        setMessage('TOTP setup complete! Login successful. Redirecting...');
        setTimeout(() => {
          window.location.href = '/admin-panel';
        }, 1000);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'TOTP setup verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setRequiresTOTP(false);
    setShowTOTPSetup(false);
    setTotpToken('');
    setTotpCode('');
    setMessage('');
  };

  // TOTP Input Component
  const TOTPInput = ({ value, onChange, placeholder = '0' }) => (
    <input
      type="text"
      maxLength={1}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-12 h-12 text-center border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none text-lg font-semibold"
      required
    />
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-8">Admin Login</h1>

        {message && (
          <div className={`p-3 rounded-lg text-sm mb-4 border ${
            message.includes('successful') || message.includes('complete')
              ? 'bg-green-50 text-green-700 border-green-200'
              : 'bg-red-50 text-red-700 border-red-200'
          }`}>
            {message}
          </div>
        )}

        {!requiresTOTP && !showTOTPSetup ? (
          // Login Form
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <MdVisibility className="w-5 h-5" /> : <MdVisibilityOff className="w-5 h-5" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Verifying...' : 'Continue'}
            </button>
          </form>
        ) : requiresTOTP ? (
          // TOTP Verification
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-center">Enter Google Auth Code</h3>
            <p className="text-sm text-gray-600 text-center">Please enter the 6-digit code from Google Authenticator</p>

            <form onSubmit={handleTOTPSubmit} className="space-y-4">
              <div className="flex justify-center space-x-2">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <TOTPInput
                    key={index}
                    value={totpToken[index] || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.length <= 1) {
                        const newToken = totpToken.split('');
                        newToken[index] = value;
                        setTotpToken(newToken.join(''));

                        if (value && index < 5) {
                          const nextInput = e.target.parentNode.children[index + 1];
                          if (nextInput) nextInput.focus();
                        }
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !totpToken[index] && index > 0) {
                        const prevInput = e.target.parentNode.children[index - 1];
                        if (prevInput) prevInput.focus();
                      }
                    }}
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={isLoading || totpToken.length !== 6}
                className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Verifying...' : 'Verify & Login'}
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="w-full text-blue-600 hover:text-blue-700 text-sm underline"
              >
                ← Back to login
              </button>
            </form>
          </div>
        ) : (
          // TOTP Setup
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-center">Setup Google Authenticator</h3>
            <p className="text-sm text-gray-600 text-center">Scan the QR code with Google Authenticator app</p>

            {qrCode && (
              <div className="text-center">
                <img 
                  src={qrCode} 
                  alt="TOTP QR Code" 
                  className="mx-auto w-48 h-48 border border-gray-300 rounded-lg"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Secret: {totpSecret}
                </p>
              </div>
            )}

            <form onSubmit={handleTOTPSetupSubmit} className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-3">Enter the 6-digit code from Google Authenticator</p>
                <div className="flex justify-center space-x-2">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <TOTPInput
                      key={index}
                      value={totpCode[index] || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.length <= 1) {
                          const newCode = totpCode.split('');
                          newCode[index] = value;
                          setTotpCode(newCode.join(''));

                          if (value && index < 5) {
                            const nextInput = e.target.parentNode.children[index + 1];
                            if (nextInput) nextInput.focus();
                          }
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !totpCode[index] && index > 0) {
                          const prevInput = e.target.parentNode.children[index - 1];
                          if (prevInput) prevInput.focus();
                        }
                      }}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || totpCode.length !== 6}
                className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Setting up...' : 'Complete Setup & Login'}
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="w-full text-blue-600 hover:text-blue-700 text-sm underline"
              >
                ← Back to login
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
```

### 4. **Environment Variables**
```bash
# .env
MONGODB_URI=mongodb://localhost:27017/your_database
JWT_SECRET=your_super_secret_jwt_key_here
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

### 5. **Package.json Dependencies**
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.5.0",
    "speakeasy": "^2.0.0",
    "qrcode": "^1.5.3",
    "bcrypt": "^5.1.0",
    "jsonwebtoken": "^9.0.2",
    "cors": "^2.8.5",
    "cookie-parser": "^1.4.6",
    "dotenv": "^16.3.1"
  }
}
```

## Security Best Practices

### 1. Secret Storage
- Never expose the TOTP secret in client-side code
- Store secrets encrypted in the database
- Use environment variables for sensitive configuration

### 2. Rate Limiting
- Implement rate limiting on TOTP verification attempts
- Lock accounts after multiple failed attempts
- Use exponential backoff for failed verifications

### 3. Time Window
- TOTP codes are valid for a specific time window (usually 30 seconds)
- Consider allowing a small time drift for user convenience
- Implement proper time synchronization

## User Experience Considerations

### 1. Clear Instructions
- Provide step-by-step guidance for TOTP setup
- Explain what Google Authenticator is and how to install it
- Show both QR code and manual secret entry option

### 2. Error Handling
- Clear error messages for invalid codes
- Helpful hints for common issues
- Easy recovery options

### 3. Accessibility
- Ensure TOTP input fields are keyboard navigable
- Provide alternative input methods for mobile users
- Consider voice input for visually impaired users

## Testing TOTP Implementation

### 1. Test Scenarios
- New user TOTP setup flow
- Existing user TOTP verification
- Invalid TOTP code handling
- Expired TOTP code handling
- Rate limiting behavior

### 2. Test Tools
- Use TOTP testing libraries
- Mock time for testing different time windows
- Test with various authenticator apps

## Common Issues and Solutions

### 1. Time Synchronization
**Problem:** TOTP codes not working due to time differences
**Solution:** Implement proper time synchronization and allow small time drift

### 2. QR Code Generation
**Problem:** QR codes not displaying or scanning properly
**Solution:** Ensure proper QR code format and size, test with multiple authenticator apps

### 3. State Management
**Problem:** UI state getting out of sync
**Solution:** Use proper state management, implement proper error handling, and reset states appropriately

## Conclusion

This TOTP implementation provides a robust two-factor authentication system that:
- Enhances security beyond password-only authentication
- Provides a smooth user experience for both setup and verification
- Handles edge cases gracefully
- Is accessible and user-friendly

The key to success is proper backend implementation, clear user communication, and robust error handling throughout the authentication flow.
