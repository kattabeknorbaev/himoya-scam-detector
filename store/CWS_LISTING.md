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
Himoya (Uzbek for "Protection") is an open-source, privacy-first cybersecurity browser extension designed to protect Uzbek-speaking internet users from digital financial scams, phishing attacks, Trojan APKs, and fraudulent schemes in real time.

Across Central Asia, localized cyber attacks—such as plastic card drainers (Uzcard/Humo), fake "data breach" panic lures, Trojan APK wedding invitations, Telegram account hijacking ("Ovoz bering"), fake government subsidies, and brushing task scams—frequently target unsuspecting internet users. Himoya acts as your institutional-grade digital shield.

🛡️ KEY FEATURES:
• 1,200+ Threat Indicator Model: High-precision probabilistic Naive Bayes NLP model covering card drainers, transit account lures, malicious APKs, and Telegram hijacking.
• Dual-Script & Russian Support: Native, seamless detection across Uzbek Latin, Uzbek Cyrillic, and regional Russian threat text.
• Zero False Positives: Calibrated with natural language inhibitors so everyday conversation, news, and school notices are never flagged.
• Behavioral Heuristics: Analyzes psychological urgency, bait-to-action proximity, suspicious URL shorteners, and obfuscated leetspeak.
• Non-Disruptive Visual Alerts: Safely blurs suspected fraudulent posts with transparent category badges and instant 1-click reveal.
• Complete Privacy Guarantee: 100% client-side execution. Zero telemetry, zero analytics, zero external API calls, and no data collection.
• Extension Dashboard: Live site threat monitor, lifetime statistics, trusted website whitelist, sensitivity controls, and instant text scanner.

🔒 PRIVACY & SECURITY:
All text scanning happens exclusively within your browser's local memory. No text, URLs, or browsing history is ever transmitted or recorded.

Himoya is free and open-source under the MIT License.
```

### Detailed Store Description (O'zbekcha):
```text
Himoya — O'zbekiston va o'zbekzabon internet foydalanuvchilarini onlayn moliyaviy firibgarliklar, plastik karta o'g'irligi, zararli APK troyanlar va soxta havolalardan real vaqt rejimida himoya qiluvchi bepul brauzer kengaytmasi.

Internet va ijtimoiy tarmoqlarda keng tarqalgan xavflar — "kartangiz sizib chiqdi" vahimalari, soxta to'y taklifnomasi yoki sud qarori APK fayllari, "ovoz bering" niqobidagi Telegram o'g'irlashlar, soxta davlat kompensatsiyalari va layk bosish sxemalariga qarshi Himoya sizning ishonchli qalqoningizdir.

🛡️ ASOSIY IMKONIYATLAR:
• 1,200+ Tahdid Indikatorlari: Sun'iy intellekt va ehtimollik tahlili (Naive Bayes) asosida eng so'nggi kiberjinoyat usullarini aniqlaydi.
• Lotin, Kirill va Rus tillari: O'zbek tilidagi lotin, kirill hamda keng tarqalgan ruscha firibgarlik xabarlarini birdek tahlil qiladi.
• 0% Soxta Ogohlantirish (No False Positives): Maxsus til inhibitatorlari oddiy do'stona suhbatlar, yangiliklar yoki ta'lim xabarlarini asossiz bloklamaydi.
• Xulq-atvor tahlili: Shoshiltirish usullari, havola xavfi va yashirin leetspeak yozuvlarini ochib beradi.
• Qulay va zamonaviy interfeys: Xavfli postlarni xiralashtirib ko'rsatadi va bitta tugma bilan xavfsiz ko'rish imkonini beradi.
• 100% Maxfiylik: Barcha tekshiruvlar to'liq qurilmangiz ichida bajariladi. Hech qanday ma'lumot yoki havolalar tashqi serverlarga yuborilmaydi.
• Boshqaruv paneli: Jonli monitoring, firibgarliklar statistikasi, oq ro'yxat va matnlarni darhol tekshirish skaneri.

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
