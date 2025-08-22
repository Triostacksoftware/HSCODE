// Country code to phone number prefix mapping
export const countryCodeToPhonePrefix = {
  // Major countries
  IN: "+91", // India
  US: "+1", // United States
  CA: "+1", // Canada
  GB: "+44", // United Kingdom
  DE: "+49", // Germany
  FR: "+33", // France
  IT: "+39", // Italy
  ES: "+34", // Spain
  NL: "+31", // Netherlands
  BE: "+32", // Belgium
  CH: "+41", // Switzerland
  AT: "+43", // Austria
  SE: "+46", // Sweden
  NO: "+47", // Norway
  DK: "+45", // Denmark
  FI: "+358", // Finland
  PL: "+48", // Poland
  CZ: "+420", // Czech Republic
  HU: "+36", // Hungary
  RO: "+40", // Romania
  BG: "+359", // Bulgaria
  HR: "+385", // Croatia
  SI: "+386", // Slovenia
  SK: "+421", // Slovakia
  LT: "+370", // Lithuania
  LV: "+371", // Latvia
  EE: "+372", // Estonia
  IE: "+353", // Ireland
  PT: "+351", // Portugal
  GR: "+30", // Greece
  CY: "+357", // Cyprus
  MT: "+356", // Malta
  LU: "+352", // Luxembourg
  IS: "+354", // Iceland
  LI: "+423", // Liechtenstein
  MC: "+377", // Monaco
  SM: "+378", // San Marino
  VA: "+379", // Vatican City
  AD: "+376", // Andorra

  // Asia Pacific
  CN: "+86", // China
  JP: "+81", // Japan
  KR: "+82", // South Korea
  AU: "+61", // Australia
  NZ: "+64", // New Zealand
  SG: "+65", // Singapore
  MY: "+60", // Malaysia
  TH: "+66", // Thailand
  VN: "+84", // Vietnam
  ID: "+62", // Indonesia
  PH: "+63", // Philippines
  BD: "+880", // Bangladesh
  PK: "+92", // Pakistan
  LK: "+94", // Sri Lanka
  NP: "+977", // Nepal
  MM: "+95", // Myanmar
  KH: "+855", // Cambodia
  LA: "+856", // Laos
  BN: "+673", // Brunei
  TL: "+670", // Timor-Leste
  PG: "+675", // Papua New Guinea
  FJ: "+679", // Fiji
  NC: "+687", // New Caledonia
  VU: "+678", // Vanuatu
  SB: "+677", // Solomon Islands
  TO: "+676", // Tonga
  WS: "+685", // Samoa
  KI: "+686", // Kiribati
  TV: "+688", // Tuvalu
  NR: "+674", // Nauru
  PW: "+680", // Palau
  MH: "+692", // Marshall Islands
  FM: "+691", // Micronesia

  // Middle East
  SA: "+966", // Saudi Arabia
  AE: "+971", // UAE
  QA: "+974", // Qatar
  KW: "+965", // Kuwait
  BH: "+973", // Bahrain
  OM: "+968", // Oman
  JO: "+962", // Jordan
  LB: "+961", // Lebanon
  SY: "+963", // Syria
  IQ: "+964", // Iraq
  IR: "+98", // Iran
  TR: "+90", // Turkey
  IL: "+972", // Israel
  PS: "+970", // Palestine
  EG: "+20", // Egypt
  LY: "+218", // Libya
  TN: "+216", // Tunisia
  DZ: "+213", // Algeria
  MA: "+212", // Morocco
  SD: "+249", // Sudan
  SS: "+211", // South Sudan
  ET: "+251", // Ethiopia
  ER: "+291", // Eritrea
  DJ: "+253", // Djibouti
  SO: "+252", // Somalia
  KE: "+254", // Kenya
  UG: "+256", // Uganda
  TZ: "+255", // Tanzania
  RW: "+250", // Rwanda
  BI: "+257", // Burundi
  MZ: "+258", // Mozambique
  ZW: "+263", // Zimbabwe
  ZM: "+260", // Zambia
  MW: "+265", // Malawi
  BW: "+267", // Botswana
  NA: "+264", // Namibia
  SZ: "+268", // Eswatini
  LS: "+266", // Lesotho
  MG: "+261", // Madagascar
  MU: "+230", // Mauritius
  SC: "+248", // Seychelles
  KM: "+269", // Comoros
  YT: "+262", // Mayotte
  RE: "+262", // Réunion

  // Americas
  MX: "+52", // Mexico
  BR: "+55", // Brazil
  AR: "+54", // Argentina
  CL: "+56", // Chile
  CO: "+57", // Colombia
  PE: "+51", // Peru
  VE: "+58", // Venezuela
  EC: "+593", // Ecuador
  BO: "+591", // Bolivia
  PY: "+595", // Paraguay
  UY: "+598", // Uruguay
  GY: "+592", // Guyana
  SR: "+597", // Suriname
  GF: "+594", // French Guiana
  FK: "+500", // Falkland Islands
  GS: "+500", // South Georgia
  BZ: "+501", // Belize
  GT: "+502", // Guatemala
  SV: "+503", // El Salvador
  HN: "+504", // Honduras
  NI: "+505", // Nicaragua
  CR: "+506", // Costa Rica
  PA: "+507", // Panama
  CU: "+53", // Cuba
  JM: "+1876", // Jamaica
  HT: "+509", // Haiti
  DO: "+1809", // Dominican Republic
  PR: "+1787", // Puerto Rico
  TT: "+1868", // Trinidad and Tobago
  BB: "+1246", // Barbados
  GD: "+1473", // Grenada
  LC: "+1758", // Saint Lucia
  VC: "+1784", // Saint Vincent
  AG: "+1268", // Antigua and Barbuda
  KN: "+1869", // Saint Kitts and Nevis
  DM: "+1767", // Dominica

  // Africa
  ZA: "+27", // South Africa
  NG: "+234", // Nigeria
  GH: "+233", // Ghana
  CI: "+225", // Ivory Coast
  SN: "+221", // Senegal
  ML: "+223", // Mali
  BF: "+226", // Burkina Faso
  NE: "+227", // Niger
  TD: "+235", // Chad
  CF: "+236", // Central African Republic
  CM: "+237", // Cameroon
  GQ: "+240", // Equatorial Guinea
  GA: "+241", // Gabon
  CG: "+242", // Republic of Congo
  CD: "+243", // Democratic Republic of Congo
  AO: "+244", // Angola
  GW: "+245", // Guinea-Bissau
  GN: "+224", // Guinea
  SL: "+232", // Sierra Leone
  LR: "+231", // Liberia
  TG: "+228", // Togo
  BJ: "+229", // Benin
  ST: "+239", // São Tomé and Príncipe
  CV: "+238", // Cape Verde
  GM: "+220", // Gambia
  RS: "+381", // Serbia
  ME: "+382", // Montenegro
  BA: "+387", // Bosnia and Herzegovina
  MK: "+389", // North Macedonia
  AL: "+355", // Albania
  XK: "+383", // Kosovo
  MD: "+373", // Moldova
  UA: "+380", // Ukraine
  BY: "+375", // Belarus
  RU: "+7", // Russia
  KZ: "+7", // Kazakhstan
  UZ: "+998", // Uzbekistan
  KG: "+996", // Kyrgyzstan
  TJ: "+992", // Tajikistan
  TM: "+993", // Turkmenistan
  AZ: "+994", // Azerbaijan
  GE: "+995", // Georgia
  AM: "+374", // Armenia
};

// Function to validate if phone number matches country code
export const validatePhoneCountryCode = (phoneNumber, countryCode) => {
  if (!phoneNumber || !countryCode) {
    return {
      isValid: false,
      message: "Phone number and country code are required",
    };
  }

  // Get expected prefix for the country
  const expectedPrefix = countryCodeToPhonePrefix[countryCode];
  if (!expectedPrefix) {
    return {
      isValid: false,
      message: `Unsupported country code: ${countryCode}. Please contact support.`,
    };
  }

  // Ensure phone number starts with +
  const normalizedPhone = phoneNumber.startsWith("+")
    ? phoneNumber
    : `+${phoneNumber}`;

  // Check if phone number starts with the expected prefix
  if (normalizedPhone.startsWith(expectedPrefix)) {
    return {
      isValid: true,
      message: "Phone number matches country code",
      normalizedPhone,
    };
  } else {
    const countryInfo = getCountryInfo(countryCode);
    return {
      isValid: false,
      message:
        countryInfo?.message ||
        `Phone number should start with ${expectedPrefix} for ${countryCode}`,
      expectedPrefix,
      normalizedPhone,
    };
  }
};

// Function to get country code from phone number
export const getCountryCodeFromPhone = (phoneNumber) => {
  if (!phoneNumber) return null;

  const normalizedPhone = phoneNumber.startsWith("+")
    ? phoneNumber
    : `+${phoneNumber}`;

  // Find matching country code
  for (const [countryCode, prefix] of Object.entries(
    countryCodeToPhonePrefix
  )) {
    if (normalizedPhone.startsWith(prefix)) {
      return countryCode;
    }
  }

  return null;
};

// Function to get user-friendly country info
export const getCountryInfo = (countryCode) => {
  console.log("countryCode", countryCode);  
  if (!countryCode) return null;

  const prefix = countryCodeToPhonePrefix[countryCode];
  if (!prefix) return null;

  const countryNames = {
    IN: "India",
    US: "United States",
    CA: "Canada",
    GB: "United Kingdom",
    DE: "Germany",
    FR: "France",
    IT: "Italy",
    ES: "Spain",
    NL: "Netherlands",
    BE: "Belgium",
    CH: "Switzerland",
    AT: "Austria",
    SE: "Sweden",
    NO: "Norway",
    DK: "Denmark",
    FI: "Finland",
    PL: "Poland",
    CZ: "Czech Republic",
    HU: "Hungary",
    RO: "Romania",
    BG: "Bulgaria",
    HR: "Croatia",
    SI: "Slovenia",
    SK: "Slovakia",
    LT: "Lithuania",
    LV: "Latvia",
    EE: "Estonia",
    IE: "Ireland",
    PT: "Portugal",
    GR: "Greece",
    CY: "Cyprus",
    MT: "Malta",
    LU: "Luxembourg",
    IS: "Iceland",
    LI: "Liechtenstein",
    MC: "Monaco",
    SM: "San Marino",
    VA: "Vatican City",
    AD: "Andorra",
    CN: "China",
    JP: "Japan",
    KR: "South Korea",
    AU: "Australia",
    NZ: "New Zealand",
    SG: "Singapore",
    MY: "Malaysia",
    TH: "Thailand",
    VN: "Vietnam",
    ID: "Indonesia",
    PH: "Philippines",
    BD: "Bangladesh",
    PK: "Pakistan",
    LK: "Sri Lanka",
    NP: "Nepal",
    MM: "Myanmar",
    KH: "Cambodia",
    LA: "Laos",
    BN: "Brunei",
    TL: "Timor-Leste",
    PG: "Papua New Guinea",
    FJ: "Fiji",
    NC: "New Caledonia",
    VU: "Vanuatu",
    SB: "Solomon Islands",
    TO: "Tonga",
    WS: "Samoa",
    KI: "Kiribati",
    TV: "Tuvalu",
    NR: "Nauru",
    PW: "Palau",
    MH: "Marshall Islands",
    FM: "Micronesia",
    SA: "Saudi Arabia",
    AE: "UAE",
    QA: "Qatar",
    KW: "Kuwait",
    BH: "Bahrain",
    OM: "Oman",
    JO: "Jordan",
    LB: "Lebanon",
    SY: "Syria",
    IQ: "Iraq",
    IR: "Iran",
    TR: "Turkey",
    IL: "Israel",
    PS: "Palestine",
    EG: "Egypt",
    LY: "Libya",
    TN: "Tunisia",
    DZ: "Algeria",
    MA: "Morocco",
    SD: "Sudan",
    SS: "South Sudan",
    ET: "Ethiopia",
    ER: "Eritrea",
    DJ: "Djibouti",
    SO: "Somalia",
    KE: "Kenya",
    UG: "Uganda",
    TZ: "Tanzania",
    RW: "Rwanda",
    BI: "Burundi",
    MZ: "Mozambique",
    ZW: "Zimbabwe",
    ZM: "Zambia",
    MW: "Malawi",
    BW: "Botswana",
    NA: "Namibia",
    SZ: "Eswatini",
    LS: "Lesotho",
    MG: "Madagascar",
    MU: "Mauritius",
    SC: "Seychelles",
    KM: "Comoros",
    YT: "Mayotte",
    RE: "Réunion",
    MX: "Mexico",
    BR: "Brazil",
    AR: "Argentina",
    CL: "Chile",
    CO: "Colombia",
    PE: "Peru",
    VE: "Venezuela",
    EC: "Ecuador",
    BO: "Bolivia",
    PY: "Paraguay",
    UY: "Uruguay",
    GY: "Guyana",
    SR: "Suriname",
    GF: "French Guiana",
    FK: "Falkland Islands",
    GS: "South Georgia",
    BZ: "Belize",
    GT: "Guatemala",
    SV: "El Salvador",
    HN: "Honduras",
    NI: "Nicaragua",
    CR: "Costa Rica",
    PA: "Panama",
    CU: "Cuba",
    JM: "Jamaica",
    HT: "Haiti",
    DO: "Dominican Republic",
    PR: "Puerto Rico",
    TT: "Trinidad and Tobago",
    BB: "Barbados",
    GD: "Grenada",
    LC: "Saint Lucia",
    VC: "Saint Vincent",
    AG: "Antigua and Barbuda",
    KN: "Saint Kitts and Nevis",
    DM: "Dominica",
    ZA: "South Africa",
    NG: "Nigeria",
    GH: "Ghana",
    CI: "Ivory Coast",
    SN: "Senegal",
    ML: "Mali",
    BF: "Burkina Faso",
    NE: "Niger",
    TD: "Chad",
    CF: "Central African Republic",
    CM: "Cameroon",
    GQ: "Equatorial Guinea",
    GA: "Gabon",
    CG: "Republic of Congo",
    CD: "Democratic Republic of Congo",
    AO: "Angola",
    GW: "Guinea-Bissau",
    GN: "Guinea",
    SL: "Sierra Leone",
    LR: "Liberia",
    TG: "Togo",
    BJ: "Benin",
    ST: "São Tomé and Príncipe",
    CV: "Cape Verde",
    GM: "Gambia",
    RS: "Serbia",
    ME: "Montenegro",
    BA: "Bosnia and Herzegovina",
    MK: "North Macedonia",
    AL: "Albania",
    XK: "Kosovo",
    MD: "Moldova",
    UA: "Ukraine",
    BY: "Belarus",
    RU: "Russia",
    KZ: "Kazakhstan",
    UZ: "Uzbekistan",
    KG: "Kyrgyzstan",
    TJ: "Tajikistan",
    TM: "Turkmenistan",
    AZ: "Azerbaijan",
    GE: "Georgia",
    AM: "Armenia",
  };

  return {
    countryCode,
    countryName: countryNames[countryCode] || countryCode,
    phonePrefix: prefix,
    message: `Phone should start with ${prefix} for ${
      countryNames[countryCode] || countryCode
    }`,
  };
};

// Function to format phone number for display (with country prefix)
export const formatPhoneForDisplay = (phoneNumber, countryCode) => {
  if (!phoneNumber || !countryCode) return phoneNumber;
  
  const prefix = countryCodeToPhonePrefix[countryCode];
  if (!prefix) return phoneNumber;
  
  // Remove any existing + or country prefix
  const cleanNumber = phoneNumber.replace(/^(\+?\d{1,4})?/, "");
  return `${prefix}${cleanNumber}`;
};

// Function to get clean phone number (without country prefix)
export const getCleanPhoneNumber = (phoneNumber, countryCode) => {
  if (!phoneNumber || !countryCode) return phoneNumber;
  
  const prefix = countryCodeToPhonePrefix[countryCode];
  if (!prefix) return phoneNumber;
  
  // Remove country prefix if present
  if (phoneNumber.startsWith(prefix)) {
    return phoneNumber.substring(prefix.length);
  }
  
  // Remove + if present
  return phoneNumber.replace(/^\+/, "");
};

export default countryCodeToPhonePrefix;
