import { useHSCode } from './HSCodeContext';

export const useHSCodeExtended = () => {
  const baseContext = useHSCode();
  
  // Additional utility functions
  const getHSCodeInfo = (countryCode, hscode) => {
    const countryCodes = baseContext.hscodes[countryCode?.toUpperCase()];
    return countryCodes?.find(item => item.hscode === hscode) || null;
  };

  const getHSCodesBySection = (countryCode, sectionNumber) => {
    const countryCodes = baseContext.hscodes[countryCode?.toUpperCase()];
    if (!countryCodes || !sectionNumber) return [];
    
    return countryCodes.filter(item => 
      item.hscode.startsWith(sectionNumber.toString().padStart(2, '0'))
    );
  };

  const getHSCodesByRange = (countryCode, startCode, endCode) => {
    const countryCodes = baseContext.hscodes[countryCode?.toUpperCase()];
    if (!countryCodes) return [];
    
    return countryCodes.filter(item => {
      const code = parseInt(item.hscode);
      return code >= startCode && code <= endCode;
    });
  };

  const exportToJSON = (countryCode) => {
    const countryCodes = baseContext.hscodes[countryCode?.toUpperCase()];
    if (!countryCodes) return null;
    
    const dataStr = JSON.stringify(countryCodes, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(dataBlob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${countryCode.toUpperCase()}_hscodes.json`;
    a.click();
    
    window.URL.revokeObjectURL(url);
    return true;
  };

  const getStatistics = (countryCode) => {
    const countryCodes = baseContext.hscodes[countryCode?.toUpperCase()];
    if (!countryCodes) return null;
    
    const sections = new Set();
    const chapters = new Set();
    
    countryCodes.forEach(item => {
      if (item.hscode.length >= 2) {
        sections.add(item.hscode.substring(0, 2));
      }
      if (item.hscode.length >= 4) {
        chapters.add(item.hscode.substring(0, 4));
      }
    });
    
    return {
      totalCodes: countryCodes.length,
      sections: sections.size,
      chapters: chapters.size,
      averageDescriptionLength: Math.round(
        countryCodes.reduce((sum, item) => sum + item.description.length, 0) / countryCodes.length
      )
    };
  };

  return {
    ...baseContext,
    getHSCodeInfo,
    getHSCodesBySection,
    getHSCodesByRange,
    exportToJSON,
    getStatistics
  };
};
