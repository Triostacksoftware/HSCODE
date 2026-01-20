# SMTP Email Configuration Setup Guide

This guide will help you set up SMTP (Simple Mail Transfer Protocol) for sending OTP emails to users during signup.

## Required Environment Variables

You need to configure the following environment variables in your server:

- `SMTP_HOST` - Your SMTP server hostname
- `SMTP_PORT` - Your SMTP server port (usually 587 for TLS or 465 for SSL)
- `SMTP_USER` - Your SMTP username/email
- `SMTP_PASS` - Your SMTP password or app password

## Option 1: Using Gmail (Recommended for Development)

### Step 1: Enable 2-Factor Authentication

1. Go to your Google Account settings
2. Navigate to Security
3. Enable 2-Step Verification

### Step 2: Generate App Password

1. Go to Google Account > Security > 2-Step Verification
2. Scroll down to "App passwords"
3. Select "Mail" and "Other (Custom name)"
4. Enter "HSCODE Server" as the name
5. Click "Generate"
6. Copy the 16-character password

### Step 3: Configure Environment Variables

Create a `.env` file in the `server` directory with:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-character-app-password
```

## Option 2: Using Other Email Providers

### SendGrid

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

### Mailgun

```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your-mailgun-username
SMTP_PASS=your-mailgun-password
```

### Outlook/Office 365

```env
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

### Yahoo Mail

```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password
```

## Step 4: Create .env File

1. Navigate to the `server` directory
2. Create a file named `.env` (if it doesn't exist)
3. Add your SMTP configuration variables

**Important:** Make sure `.env` is in your `.gitignore` file to avoid committing sensitive credentials!

## Step 5: Restart Your Server

After configuring the environment variables, restart your server:

```bash
cd server
npm start
# or
node server.js
```

## Testing

Once configured, try signing up a new user. The OTP email should be sent successfully.

## Troubleshooting

### Error: "Email service configuration error"

- Make sure all SMTP environment variables are set
- Verify your credentials are correct
- Check that you're using an app password (for Gmail) instead of your regular password

### Error: "EAUTH" or authentication failed

- Double-check your SMTP_USER and SMTP_PASS
- For Gmail, make sure you're using an app password, not your regular password
- Ensure 2-factor authentication is enabled (for Gmail)

### Error: "ECONNECTION" or connection failed

- Verify SMTP_HOST and SMTP_PORT are correct
- Check your firewall/network settings
- Try using port 465 with SSL instead of 587 with TLS

## Security Notes

- Never commit your `.env` file to version control
- Use app passwords instead of your main account password
- Consider using environment-specific configurations for production
- For production, use a dedicated email service like SendGrid or Mailgun
