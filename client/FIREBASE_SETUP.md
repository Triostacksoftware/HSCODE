# Firebase Phone Authentication Setup

This project now uses Firebase Phone Authentication instead of email OTP for both user authentication and admin TOTP setup.

## Setup Instructions

### 1. Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable Authentication in the Firebase console
4. In Authentication > Sign-in method, enable "Phone" provider

### 2. Get Firebase Configuration
1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps" section
3. Click on the web app or create a new one
4. Copy the configuration object

### 3. Environment Variables
Create a `.env.local` file in the client directory with:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# Base URL for your backend
NEXT_PUBLIC_BASE_URL=http://localhost:8000
```

### 4. Phone Number Format
- Phone numbers should include country code (e.g., +1234567890)
- The system will automatically add '+' if not provided

### 5. Testing
- Use real phone numbers for testing
- Firebase provides test phone numbers for development
- Check Firebase console for verification logs

## How It Works

### User Authentication (Login/Signup)
1. **Form Input**: User enters name, email, phone number, and password
2. **Phone OTP Send**: Firebase sends SMS with 6-digit code to phone
3. **Phone OTP Verification**: User enters the code received on phone
4. **Account Creation/Login**: After phone verification, proceed with backend authentication
5. **Email Storage**: Email is stored in database for user identification and communication

### Admin TOTP Setup
1. **Phone Input**: Admin enters phone number and password
2. **OTP Send**: Firebase sends SMS with 6-digit code
3. **OTP Verification**: Admin enters the code received
4. **TOTP Setup**: After phone verification, proceed to Google Authenticator setup
5. **Final Verification**: Admin scans QR code and enters TOTP code

## Security Features

- reCAPTCHA verification for OTP sending
- Phone number validation and verification through Firebase
- Secure OTP verification through Firebase
- Maintains existing password requirement
- Email storage for user identification and communication
- Hybrid approach: Firebase handles phone verification, backend handles user data
