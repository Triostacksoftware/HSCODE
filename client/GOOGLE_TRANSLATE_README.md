# Google Translate Integration for Next.js

This project includes a complete Google Translate integration that allows users to translate the entire website into multiple languages.

## Features

- 🌍 **Multi-language Support**: Supports 40+ languages including English, Hindi, French, Spanish, German, Italian, Portuguese, Russian, Japanese, Korean, Chinese, Arabic, and many more
- 📱 **Responsive Design**: Works seamlessly on both desktop and mobile devices
- 🚀 **Client-side Only**: No SSR issues - loads only on the client side
- 🎨 **Beautiful Modern UI**: Glassmorphism design with gradients, shadows, and smooth animations
- ✨ **Enhanced UX**: Loading states, hover effects, focus states, and accessibility features
- 🌙 **Dark Mode Support**: Automatic dark mode detection and styling
- 🔧 **Flexible Integration**: Can be placed anywhere in your layout with custom positioning

## Components

### 1. GoogleTranslate (Fixed Position)

A floating translate widget that appears in the top-right corner of the page.

**Location**: `src/component/GoogleTranslate.jsx`

**Usage**: Already integrated in `src/app/layout.js` for site-wide translation.

### 2. NavbarGoogleTranslate (Inline)

A compact translate widget designed for navigation bars and inline placement.

**Location**: `src/component/NavbarGoogleTranslate.jsx`

**Usage**: Already integrated in the main Navbar component.

## How It Works

1. **Script Loading**: The Google Translate script is dynamically loaded when the component mounts
2. **Widget Initialization**: Creates a language selector dropdown with all supported languages
3. **Page Translation**: When a language is selected, Google Translate automatically translates the entire page
4. **Persistence**: The selected language persists during the user's session

## Supported Languages

The integration includes these languages (and more):

- English (en)
- Hindi (hi)
- French (fr)
- Spanish (es)
- German (de)
- Italian (it)
- Portuguese (pt)
- Russian (ru)
- Japanese (ja)
- Korean (ko)
- Chinese Simplified (zh-CN)
- Arabic (ar)
- Turkish (tr)
- Dutch (nl)
- Polish (pl)
- Swedish (sv)
- Danish (da)
- Norwegian (no)
- Finnish (fi)
- Czech (cs)
- Hungarian (hu)
- Romanian (ro)
- Slovak (sk)
- Slovenian (sl)
- Bulgarian (bg)
- Croatian (hr)
- Greek (el)
- Estonian (et)
- Latvian (lv)
- Lithuanian (lt)
- Maltese (mt)

## Customization Options

### Positioning

You can customize the position of the GoogleTranslate component:

```jsx
// Fixed position (default)
<GoogleTranslate />

// Custom position
<GoogleTranslate
  position="absolute"
  top="100px"
  left="20px"
/>

// Bottom right
<GoogleTranslate
  position="fixed"
  bottom="20px"
  right="20px"
/>
```

### Styling

Customize the appearance with custom styles:

```jsx
<GoogleTranslate
  style={{
    backgroundColor: "#f0f0f0",
    border: "2px solid #007bff",
    borderRadius: "12px",
  }}
/>
```

### Language Selection

Modify the supported languages by editing the `includedLanguages` parameter in the component:

```jsx
includedLanguages: "en,hi,fr,es,de,it,pt,ru,ja,ko,zh-CN,ar";
```

## Integration Points

### 1. Layout Level (Global)

The main `GoogleTranslate` component is already added to `src/app/layout.js` and will appear on every page.

### 2. Navbar Level

The `NavbarGoogleTranslate` component is integrated into both desktop and mobile navigation.

### 3. Custom Placement

You can add the translate widget to any component:

```jsx
import GoogleTranslate from "../component/GoogleTranslate";

function MyComponent() {
  return (
    <div>
      <h1>My Page</h1>
      <GoogleTranslate position="static" />
      {/* Your content */}
    </div>
  );
}
```

## CSS Styling

The integration includes beautiful, modern CSS in `src/app/globals.css`:

- **Glassmorphism Design**: Backdrop blur effects with semi-transparent backgrounds
- **Gradient Backgrounds**: Beautiful color transitions and modern aesthetics
- **Smooth Animations**: Hover effects, focus states, and loading animations
- **Enhanced Shadows**: Multi-layered shadows for depth and modern look
- **Dark Mode Support**: Automatic dark mode detection with appropriate styling
- **Custom Scrollbars**: Styled scrollbars for dropdown menus
- **Accessibility**: Focus indicators and keyboard navigation support
- **Responsive Design**: Mobile-first approach with touch-friendly interactions

## Browser Compatibility

- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Mobile browsers

## Performance Considerations

- **Lazy Loading**: Script only loads when the component mounts
- **Cleanup**: Proper cleanup on component unmount
- **No SSR Issues**: Client-side only execution
- **Minimal Impact**: Lightweight integration

## Troubleshooting

### Widget Not Appearing

1. Check browser console for errors
2. Ensure the component is properly imported
3. Verify the script is loading (check Network tab)

### Translation Not Working

1. Check if Google Translate service is accessible
2. Verify the language codes are correct
3. Ensure the page content is not blocked by robots.txt

### Styling Issues

1. Check if custom CSS is being applied
2. Verify the component positioning
3. Check for CSS conflicts with existing styles

## Advanced Usage

### Custom Language Detection

You can enhance the component to detect the user's preferred language:

```jsx
useEffect(() => {
  const userLang = navigator.language || navigator.userLanguage;
  // Set initial language based on user preference
}, []);
```

### Translation Callbacks

Add custom logic when translation occurs:

```jsx
// Listen for translation events
window.addEventListener("load", () => {
  if (window.google && window.google.translate) {
    // Custom logic after translation
  }
});
```

## Support

For issues or questions about the Google Translate integration:

1. Check the browser console for error messages
2. Verify all imports are correct
3. Ensure the Google Translate service is accessible in your region

## License

This integration is part of your project and follows the same licensing terms.
