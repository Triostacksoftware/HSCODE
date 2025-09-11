# Google Translate API Setup Guide

This guide will help you set up Google Translate API for automatic translation of lead form data to English.

## Prerequisites

- Google Cloud Platform account
- Billing enabled on your Google Cloud project
- Basic knowledge of Google Cloud Console

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "New Project"
4. Enter a project name (e.g., "hscode-translation")
5. Click "Create"

## Step 2: Enable Google Translate API

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Cloud Translation API"
3. Click on "Cloud Translation API"
4. Click "Enable"

## Step 3: Create API Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the generated API key
4. (Optional) Click "Restrict Key" to limit usage:
   - Under "API restrictions", select "Restrict key"
   - Choose "Cloud Translation API"
   - Click "Save"

## Step 4: Set Up Billing

1. Go to "Billing" in the Google Cloud Console
2. Link a billing account to your project
3. Note: Google Translate API has a free tier (500,000 characters per month)

## Step 5: Configure Environment Variables

Add the API key to your server environment variables:

### For Development (.env file):

```bash
# Add this to your server/.env file
GOOGLE_TRANSLATE_API_KEY=your_actual_api_key_here
```

### For Production:

Set the environment variable in your hosting platform:

- **Vercel**: Add in Project Settings > Environment Variables
- **Heroku**: Use `heroku config:set GOOGLE_TRANSLATE_API_KEY=your_key`
- **AWS**: Add to your EC2 instance or Lambda environment variables

## Step 6: Test the Translation Service

The translation middleware will automatically:

1. **Detect Language**: Uses Google's language detection API
2. **Translate to English**: Only translates if the detected language is not English
3. **Log Results**: Shows translation logs in server console

### Example Translation Flow:

```
Input: "नमस्ते, मैं चावल खरीदना चाहता हूं"
Detected Language: hi (Hindi)
Translated: "Hello, I want to buy rice"
```

## Supported Languages

Google Translate API supports 100+ languages including:

- Hindi, Chinese, Arabic, Spanish, French, German
- Japanese, Korean, Russian, Portuguese, Italian
- And many more...

## API Usage and Costs

### Free Tier:

- **500,000 characters per month** (free)
- After free tier: $20 per 1M characters

### Cost Optimization:

- Only translates non-English text
- Caches results to avoid duplicate translations
- Batch processing for multiple fields

## Monitoring Usage

1. Go to Google Cloud Console > "APIs & Services" > "Dashboard"
2. Select "Cloud Translation API"
3. View usage statistics and costs

## Security Best Practices

1. **Restrict API Key**: Limit to specific APIs and IP addresses
2. **Environment Variables**: Never commit API keys to version control
3. **Rate Limiting**: Implement rate limiting in your application
4. **Error Handling**: Gracefully handle API failures

## Troubleshooting

### Common Issues:

1. **"API key not valid"**

   - Check if the API key is correctly set in environment variables
   - Verify the key has Translation API access

2. **"Quota exceeded"**

   - Check your billing account
   - Monitor usage in Google Cloud Console

3. **"Translation failed"**
   - The middleware will log the error and continue with original text
   - Check server logs for detailed error messages

### Debug Mode:

Enable debug logging by setting:

```bash
DEBUG=translation:*
```

## Example Server Logs

When translation is working, you'll see logs like:

```
🔄 Translation middleware: Processing lead data...
Translated from hi: "चावल खरीदना चाहते हैं" -> "Want to buy rice"
✅ Translation middleware: Lead data translated successfully
```

## Testing the Implementation

1. **Submit a lead** with non-English text
2. **Check server logs** for translation activity
3. **Verify database** contains English text
4. **Test with multiple languages** to ensure compatibility

## Support

- [Google Translate API Documentation](https://cloud.google.com/translate/docs)
- [Google Cloud Support](https://cloud.google.com/support)
- [API Pricing Calculator](https://cloud.google.com/translate/pricing)

---

**Note**: This translation service ensures consistent English data in your database while preserving the original user experience in their preferred language.
