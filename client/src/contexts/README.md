# HS Code Context System

This context system provides a comprehensive way to manage HS (Harmonized System) codes in your React application.

## 🚀 Features

- **Fetch HS codes** by country code from your backend API
- **Parse CSV data** automatically with header detection
- **Search and filter** HS codes by code or description
- **Download files** in CSV or JSON format
- **Statistics and analytics** for loaded data
- **Caching** - data is stored in context and reused
- **Error handling** with user-friendly messages

## 📁 Files

- `HSCodeContext.js` - Main context with core functionality
- `useHSCodeHook.js` - Extended hook with additional utilities
- `HSCodeExample.jsx` - Example component showing usage
- `README.md` - This documentation

## 🔧 Setup

### 1. Wrap your app with the provider

```jsx
// In your main layout or app component
import { HSCodeProvider } from './contexts/HSCodeContext';

function App() {
  return (
    <HSCodeProvider>
      {/* Your app components */}
    </HSCodeProvider>
  );
}
```

### 2. Use the context in your components

```jsx
import { useHSCode } from './contexts/HSCodeContext';

function MyComponent() {
  const {
    hscodes,
    loading,
    error,
    fetchHSCodes,
    downloadHSCodes
  } = useHSCode();

  // Your component logic
}
```

## 🎯 Basic Usage

### Fetch HS codes for a country

```jsx
const { fetchHSCodes, loading, error } = useHSCode();

const handleFetch = async () => {
  const data = await fetchHSCodes('US');
  if (data) {
    console.log(`Loaded ${data.length} HS codes for US`);
  }
};
```

### Download CSV file

```jsx
const { downloadHSCodes } = useHSCode();

const handleDownload = async () => {
  const success = await downloadHSCodes('US');
  if (success) {
    console.log('Download completed!');
  }
};
```

### Search within loaded data

```jsx
const { searchHSCodes, selectedCountry } = useHSCode();

const searchResults = searchHSCodes(selectedCountry, 'textile');
console.log(`Found ${searchResults.length} matching codes`);
```

## 🔍 Extended Features

### Get statistics

```jsx
import { useHSCodeExtended } from './contexts/useHSCodeHook';

const { getStatistics } = useHSCodeExtended();

const stats = getStatistics('US');
console.log(`US has ${stats.totalCodes} codes across ${stats.sections} sections`);
```

### Filter by chapter

```jsx
const { getHSCodesBySection } = useHSCodeExtended();

const chapterCodes = getHSCodesBySection('US', '85');
console.log(`Chapter 85 has ${chapterCodes.length} codes`);
```

### Export to JSON

```jsx
const { exportToJSON } = useHSCodeExtended();

const handleExport = () => {
  exportToJSON('US'); // Downloads US_hscodes.json
};
```

## 📊 Data Structure

Each HS code item has this structure:

```javascript
{
  id: 1,
  hscode: "010101",
  description: "Live horses, pure-bred breeding animals",
  lineNumber: 2
}
```

## 🌍 Available Countries

The context automatically loads common countries:
- US, IN, CN, JP, DE, GB, FR, CA, AU

You can extend this by implementing the `/api/v1/hscodes/countries` endpoint.

## 🔄 API Endpoints

The context expects these backend endpoints:

- `GET /api/v1/hscodes?countryCode=US` - Fetch HS codes for a country
- `GET /api/v1/hscodes/countries` - Get list of available countries (optional)

## 💡 Best Practices

1. **Wrap your app** with `HSCodeProvider` at the top level
2. **Use the context** in components that need HS code data
3. **Check loading states** before rendering data
4. **Handle errors** gracefully with user feedback
5. **Cache data** - the context automatically stores fetched data
6. **Clear data** when no longer needed to free memory

## 🚨 Error Handling

The context provides comprehensive error handling:

```jsx
const { error, loading } = useHSCode();

if (error) {
  return <div className="error">Error: {error}</div>;
}

if (loading) {
  return <div className="loading">Loading...</div>;
}
```

## 📱 Performance Tips

1. **Limit results** - Use search to find specific codes instead of loading all
2. **Clear data** - Remove unused country data with `clearHSCodes()`
3. **Lazy load** - Only fetch data when user selects a country
4. **Use pagination** - For very large datasets, implement frontend pagination

## 🔧 Customization

You can extend the context by:

1. **Adding new functions** to the context value
2. **Creating custom hooks** that use the base context
3. **Modifying the CSV parser** for different file formats
4. **Adding validation** for HS code formats

## 📞 Support

If you need help or want to add features:

1. Check the example component for usage patterns
2. Review the context implementation for customization
3. Test with your backend API endpoints
4. Ensure your CSV files follow the expected format

---

**Happy coding! 🎉**
