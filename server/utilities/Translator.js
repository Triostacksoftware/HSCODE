import fetch from "node-fetch";

// Detect language
async function detectLanguage(text) {
  const res = await fetch("https://translate.argosopentech.com/detect", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q: text })
  });
  const data = await res.json();
  return data[0].language;
}

// Translate text to English
async function translateToEnglish(text) {
  const sourceLang = await detectLanguage(text);
  const res = await fetch("https://translate.argosopentech.com/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q: text, source: sourceLang, target: "en", format: "text" })
  });
  const data = await res.json();
  return data.translatedText;
}

// Example usage
(async () => {
  const text = "नमस्ते दुनिया";
  const translated = await translateToEnglish(text);
  console.log(translated); // "Hello world"
})();
