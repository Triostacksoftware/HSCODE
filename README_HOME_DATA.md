# HSCODE Home Data Management System

## Overview

This system allows country-specific admins to customize their home page content dynamically. Each admin can manage content for their specific country, and users see personalized content based on their location.

## Features

- **Country-specific content**: Each country has its own home page data
- **Admin management**: Country admins can edit all home page sections
- **Dynamic content**: Components automatically adapt to country-specific data
- **IP-based location detection**: Automatically detects user's country
- **Fallback system**: Uses default content if country-specific data is unavailable

## Architecture

### Backend

1. **HomeData Model** (`server/models/HomeData.js`)

   - Stores country-specific home page content
   - Links to admin by country code
   - Includes all sections: hero, about, categories, news, testimonials, stats, FAQ, footer

2. **API Endpoints** (`server/routes/homeData.routes.js`)

   - `GET /api/v1/home-data/country/:countryCode` - Public endpoint for users
   - `GET /api/v1/home-data/admin` - Admin endpoint to get their country's data
   - `POST /api/v1/home-data/admin` - Create/update home data
   - `POST /api/v1/home-data/admin/reset` - Reset to defaults

3. **Controllers** (`server/controllers/homeData.ctrls.js`)
   - Handles CRUD operations
   - Automatically associates data with admin's country
   - Creates default data if none exists

### Frontend

1. **Custom Hooks**

   - `useCountryCode()` - Detects user's country from IP
   - `useHomeData(countryCode)` - Fetches country-specific home data

2. **Updated Components**

   - All components now accept props for dynamic content
   - Fallback to default content if props are missing
   - Maintains existing design and functionality

3. **Admin Panel** (`client/src/component/adminPanelComponent/HomeContent.jsx`)
   - Comprehensive content management interface
   - Tabbed sections for each home page area
   - Real-time editing and preview
   - Reset to defaults functionality

## Usage

### For Users

Users automatically see content relevant to their country based on IP detection. No login required.

### For Admins

1. **Access Admin Panel**: Navigate to the admin panel
2. **Home Content Section**: Click on "Home Content" in the admin menu
3. **Edit Content**: Use the tabbed interface to edit different sections
4. **Save Changes**: Click "Save Changes" to update the content
5. **Reset to Defaults**: Use "Reset to Defaults" if needed

### Content Sections

1. **Hero Section**: Banner text, headings, video IDs, CTA buttons
2. **About Section**: Title, subtitle, description, features
3. **Featured Categories**: Section title, category list with images and descriptions
4. **News Section**: Section title, subtitle, news items
5. **Testimonials**: Section title, subtitle, customer testimonials with ratings
6. **Statistics**: Section title, subtitle, numerical stats
7. **FAQ Section**: Section title, subtitle, Q&A pairs
8. **Footer**: Company description, contact info, social links

## Data Flow

1. **User visits home page**
2. **IP detection** determines country code
3. **API call** fetches country-specific home data
4. **Components render** with dynamic content
5. **Fallback** to defaults if no country data exists

## Security

- Admin endpoints require authentication
- Country data is automatically associated with admin's country
- Public endpoints only return published content
- No cross-country data access

## Setup

1. **Database**: Ensure MongoDB is running
2. **Server**: Start the Node.js server
3. **Client**: Start the Next.js client
4. **Admin Access**: Login as a country admin
5. **Content Management**: Use the admin panel to customize content

## Default Content

Each country starts with default content that can be customized:

- Professional B2B marketplace messaging
- Sample categories, testimonials, and FAQs
- Generic contact information
- Standard social media links

## Customization

Admins can customize:

- Text content for all sections
- Images and media URLs
- Contact information
- Social media links
- Business-specific messaging
- Local language and cultural adaptations

## Troubleshooting

- **No content showing**: Check if country data exists in database
- **Admin can't edit**: Verify admin authentication and country association
- **Content not saving**: Check server logs and database connection
- **IP detection failing**: Verify the IP utility service is working

## Future Enhancements

- Content versioning and history
- Multi-language support
- Content scheduling and publishing
- Analytics and performance tracking
- Content templates and themes
- Bulk import/export functionality
