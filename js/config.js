/*
  THE HOME TEAM — site settings
  ------------------------------------------------------------
  Fill these in when you're ready to launch. Nothing here is
  required to preview the site locally; empty values just turn
  the feature off.
*/
window.HT_CONFIG = {
  // Which smoke-test version is live. Change this (V1, V2, ...) every
  // time you change the page, so analytics events say which version
  // the visitor saw.
  version: "V1",

  // Where the QR code on the card back (photo 5) sends people.
  // Leave blank to use this page's own address automatically, so once the
  // site is published the QR code scans straight to the live page.
  qrUrl: "https://thehometeamcards.com/",

  // Google Analytics 4 "Measurement ID", looks like G-XXXXXXXXXX.
  // Create it with a PERSONAL/school Google account.
  ga4Id: "",

  // Microsoft Clarity project ID (heat maps + recordings), looks like abc123xyz.
  clarityId: "zeveirryoe",

  // Waitlist → Google Form (personal/school account). Leave blank to
  // preview locally — the form will still show its thank-you message.
  googleForm: {
    action: "",        // https://docs.google.com/forms/d/e/XXXX/formResponse
    emailField: "",    // entry.123456789
    editionField: "",  // entry.987654321  (optional)
    versionField: "",  // entry.555555555  (optional)
    paymentField: ""   // entry.444444444  (optional: card / venmo / gift_card)
  }
};
