import libphonenumber from "google-libphonenumber";
const phoneUtil = libphonenumber.PhoneNumberUtil.getInstance();

function getPhoneNumberLength(countryCode) {
  try {
    const example = phoneUtil.getExampleNumberForType(countryCode, libphonenumber.PhoneNumberType.MOBILE);
    return example.getNationalNumber().toString().length;
  } catch (err) {
    return null;
  }
}

export default getPhoneNumberLength;

