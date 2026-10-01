# Chrome Web Store (CWS) Publishing Guide & Store Listing Copy 🚀

This document contains everything needed to publish **Himoya** to the Google Chrome Web Store with zero friction or policy rejections.

---

## 1. Store Listing Metadata

### Extension Name:
```text
Himoya: Uzbek Scam & Phishing Detector
```

### Short Description (max 132 characters):
```text
Protects Uzbek speakers from financial fraud, fake giveaways, and phishing in real time using smart pattern analysis.
```

### Category:
- **Primary:** Productivity / Tools
- **Secondary / Topic:** Privacy & Security

---

### Detailed Store Description (English):
```text
Himoya (Uzbek for "Protection") is an open-source browser extension designed to protect Uzbek-speaking internet users from digital financial scams, phishing attacks, and fraudulent investment schemes in real time.

Across Central Asia, localized social media scams—such as fake "presidential subsidies", plastic card SMS phishing (Uzcard/Humo), doubling money pyramid schemes, and fake automated trading bots—frequently target vulnerable internet users. Himoya acts as your digital shield.

🛡️ KEY FEATURES:
• Dual-Script Support: Comprehensive detection across both Uzbek Latin and Uzbek Cyrillic text.
• Smart Multi-Category Detection: Weighted scoring system identifies critical phishing (card numbers, SMS verification codes), fake lotteries, and pressure tactics.
• Minimal False Positives: Sophisticated cross-category evaluation ensures everyday conversations and regular news are never falsely flagged.
• Non-Disruptive Visual Alerts: Blurs suspected fraudulent posts with clear category tags and provides one-click instant reveal.
• Complete Privacy Guarantee: 100% client-side execution. Zero data collection, no analytics, no external servers, and zero telemetry.
• Extension Action Dashboard: View scams blocked on the current page, lifetime statistics, whitelist trusted sites, and configure detection sensitivity (Strict, Balanced, Relaxed).

🔒 PRIVACY & SECURITY:
All text scanning happens exclusively within your browser's local memory. No text, URLs, or browsing history is ever transmitted or recorded.

Himoya is free and open-source under the MIT License.
```

### Detailed Store Description (O'zbekcha):
```text
Himoya — O'zbekiston va o'zbekzabon internet foydalanuvchilarini onlayn moliyaviy firibgarliklar, soxta aksiyalar, piramidalar va fishing xabarlaridan real vaqt rejimida himoya qiluvchi bepul brauzer kengaytmasi.

Internet va ijtimoiy tarmoqlarda keng tarqalgan xavflar — plastik karta ma'lumotlari va SMS kodlarni o'g'irlash, "pulni 2 barobar qilib berish" va'dalari, soxta davlat kompensatsiyalari va shubhali trading botlariga qarshi Himoya sizning ishonchli qalqoningizdir.

🛡️ ASOSIY IMKONIYATLAR:
• Lotin va Kirill yozuvlari: O'zbek tilidagi lotin hamda kirill alifbosidagi xabarlarni birdek aniqlaydi.
• Ko'p bosqichli tahlil: Plastik karta, SMS kod so'rovlari, soxta yutuqlar va shoshiltirish usullarini maxsus tahlil algoritmi orqali tekshiradi.
• Past xatolik (Low false positives): Oddiy xabarlar yoki yangiliklar asossiz bloklanmaydi — faqat haqiqiy xavf belgilari bo'lgandagina ogohlantiradi.
• Zamonaviy va qulay interfeys: Shubhali postlarni xavfsiz xiralashtiradi va birgina tugma orqali ko'rish imkonini beradi.
• 100% Maxfiylik: Barcha tekshiruvlar to'liq brauzeringiz ichida amalga oshiriladi. Hech qanday ma'lumot, matn yoki havola tashqi serverlarga yuborilmaydi.
• Boshqaruv paneli: Joriy sahifadagi va umumiy to'xtatilgan firibgarliklar statistikasi, oq ro'yxat va sezgirlik darajasi (Kuchli, Standart, Yengil).

Himoya — o'zbek xalqi xavfsizligi uchun yaratilgan bepul va ochiq kodli loyiha.
```

---

## 2. Chrome Web Store Permission Justifications (CRITICAL)

Google reviewers inspect permissions rigorously. Use these exact justification texts in the Developer Dashboard:

### 1. `storage` Permission Justification:
> "The 'storage' permission is required solely to persist local user preferences (such as detection sensitivity level and whitelisted websites) and local blocked scam counters directly on the user's device via chrome.storage.local. No data is synchronized or sent to external servers."

### 2. Broad Host Permission (`<all_urls>`) Justification:
> "Himoya functions as a real-time scam and phishing detector across the open web. Because fraudulent posts, fake investment ads, and phishing messages appear unpredictably on arbitrary websites, social media platforms (Facebook, X, Instagram), forums, and messaging web clients (Telegram Web), the content script requires access to all URLs to analyze text locally and protect users from financial fraud. All processing occurs strictly on the client side; no URLs, page contents, or personal information are collected or transmitted."

---

## 3. Step-by-Step Publishing Walkthrough

### Step 1: Create a Google Chrome Developer Account
1. Go to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole).
2. Sign in with your Google account.
3. Pay the one-time **$5 USD** developer registration fee (required by Google once per developer account).

### Step 2: Build the Extension Package
Run the included packaging script:
```powershell
.\package.ps1
```
This generates `himoya-extension-v3.0.0.zip` in the root folder, containing only the required production files.

### Step 3: Upload Package
1. In the Chrome Web Store Developer Dashboard, click **Add new item**.
2. Drag and drop `himoya-extension-v3.0.0.zip`.

### Step 4: Fill Store Listing Details
1. Fill in **Product details** (copy text from Section 1 above).
2. Upload Visual Assets:
   - **Store Icon:** 128x128 PNG (`icon128.png`)
   - **Screenshots:** At least 1 screenshot (1280x800 or 640x400) showing Himoya in action (warning card on social media / popup UI).
   - **Promotional Tile (Small Tile):** 440x280 PNG.
3. Enter Privacy Policy URL:
   - Host `store/privacy.html` on GitHub Pages (e.g., `https://<username>.github.io/<repo>/privacy.html`) or your website.

### Step 5: Privacy Tab & Permissions
1. Single purpose statement:
   *"Protecting Uzbek speakers from online financial fraud, fake investment schemes, and phishing attacks in real time."*
2. Justifications: Paste the justifications from Section 2 above.
3. Certification: Check the checkboxes declaring:
   - Does not collect or transmit user data.
   - Complies with Chrome Web Store Developer Program Policies.

### Step 6: Submit for Review
1. Click **Submit for Review**.
2. Standard review time is typically **24 to 72 hours**. Once approved, your extension will be live on the Chrome Web Store!
