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
  ga4Id: "G-7KZLSWYWWF",

  // Microsoft Clarity project ID (heat maps + recordings), looks like abc123xyz.
  clarityId: "zeveirryoe",

  // Waitlist → Google Sheet. Paste the "Web app URL" of the Home Team
  // Waitlist Apps Script here (see dashboard/SETUP.md). It looks like
  // https://script.google.com/macros/s/XXXX/exec
  // Leave blank to preview locally: the thank-you message still shows.
  waitlistUrl: "https://script.google.com/macros/s/AKfycbwhx7f9tFvB6maXisG2EkCdrTBLYbpO4IPSD3xtdyRidIDJxnc7Jh-sMZSsFF5TNPAy/exec"
};
