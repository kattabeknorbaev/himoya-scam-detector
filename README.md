# Himoya AI 🛡️

**Next-Generation Multi-Layer AI & Behavioral Defense Against Online Financial Scams**

[![Chrome Web Store Manifest V3](https://img.shields.io/badge/Manifest-V3-blue.svg)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![Version](https://img.shields.io/badge/Version-5.3.0-rose.svg)](https://github.com/kattabeknorbaev/himoya-scam-detector/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Privacy: 100% Offline](https://img.shields.io/badge/Privacy-100%25%20On--Device-success.svg)](store/PRIVACY.md)

Himoya (Uzbek for *"Protection"*) is an intelligent, privacy-first cybersecurity browser extension that protects Uzbek-speaking internet users from digital financial fraud, fake lotteries, Telegram account hijacking, APK trojans, and phishing in real time.

Moving far beyond rigid keyword matching, **Himoya v5.3.0** utilizes a **multi-layer cybersecurity intelligence architecture** combining probabilistic Machine Learning, behavioral social engineering heuristics, de-obfuscation, and on-device Chrome Built-in AI (Gemini Nano) with **1,200+ research-backed threat indicators & n-grams** across **13 comprehensive cyber threat categories**.

---

## Real-World Cyber Threat Landscape (2024–2026 Intelligence)

According to official briefings from Uzbekistan's Cyber Security Center (CSEC.uz), CERT.uz, and the Central Bank:
- **Card-Draining Fraud represents ~98% of all digital crimes in Uzbekistan**, heavily targeting Uzcard, Humo, Click, Payme, Uzum Bank, Anorbank, and TBC Bank users.
- **Malicious APK Trojans account for ~60% of modern malware delivery**, weaponizing lures such as fake wedding invitations (`to'y taklifnomasi.apk`), court orders (`sud qarori.apk`), debt executions (`ijro hujjati.apk`), and photo traps (`bu rasmda senmisan?`, `foto.apk`).
- **Data Breach Panic Schemes ("Baza sizib chiqdi"):** Scammers exploit public fear of leaks by claiming the victim's card details were exposed online, demanding urgent transfers to a fraudulent "safe transit account" (`xavfsiz tranzit hisob`).
- **Telegram Account Session Hijacking ("Ovoz bering"):** Deceptive voting contests for children or nieces proxying Telegram web authentication to steal 5-digit login codes and bypass 2FA.
- **Stolen Profile Friend Loans:** Hijacked Telegram accounts messaging family and contacts with urgent requests (`kartam ishlamayapti, 500 ming tashlab tur, ertaga qaytaraman`).
- **Fake Government Subsidies & Tax Portals:** Spoofed portals impersonating `my.gov.uz`, `soliq.uz`, `hududgaz`, and presidential child compensation decrees.
- **Escrow & Delivery Phishing:** Counterfeit Click / Payme / OLX delivery links tricking sellers into inputting card numbers, CVV, and SMS OTPs to "receive money".

Himoya was built to protect internet users, parents, and families from losing their life savings to these predatory schemes.

---

## Multi-Layer Intelligence Architecture

```
┌────────────────────────────────────────────────────────┐
│                   Target Web Content                   │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│  Layer 1: Obfuscation & Leetspeak De-anonymizer        │
│  Unmasks "5 m1n yut1b", "k@rta", "p.u.l", "s-m-s"      │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│  Layer 2: Statistical NLP Machine Learning Model       │
│  Naive Bayes log-odds model (1,200+ tokens & n-grams)  │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│  Layer 3: Social Engineering & Behavioral Profiler     │
│  Bait-to-CTA Proximity, Urgency Index, URL & APK Risk  │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│  Layer 4: Combinatorial Semantic Fast-Paths            │
│  Instant detection of breach panic, trojans & links    │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│  Layer 5: On-Device Chrome Built-in AI (Gemini Nano)   │
│  Zero-shot semantic understanding with local fallback  │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│       Unified Threat Intelligence Decision & UI        │
└────────────────────────────────────────────────────────┘
```

---

## 13 Cyber Threat Categories Detected (1,200+ Indicators)

1. **Card Phishing & SMS OTP Exfiltration:** Demands for 16-digit PANs, expiry dates, CVV/CVC, PINs, single-use SMS confirmation codes.
2. **Fake Bank Security Service Alerts:** Scams impersonating Central Bank or bank security claiming urgent account freezes or suspicious transfers.
3. **Data Breach Panic & Transit Account Traps:** Claims of leaked card databases (`kartangiz sizib chiqdi`, `baza tarqaldi`) pressuring victims into moving money to "safe accounts".
4. **Malicious APK Trojans & Fake Documents:** Wedding invitations (`to'y taklifnomasi.apk`), court summons (`sud qarori.apk`), photo traps (`bu rasmda senmisan?`, `foto.apk`).
5. **Telegram Hijacking & Contest Voting:** Deceptive voting links designed to steal active Telegram sessions and bypass 2FA.
6. **Fake Government Aid & Subsidies:** Fabricated child compensations, material aid decrees, and utility/gas subsidies.
7. **Fake Lotteries & Brand Anniversaries:** False claims of 5–10 million sum wins, Click/Payme/Korzinka giveaways.
8. **Ponzi Schemes & Doubling Promises:** "Pulni 2 barobar", guaranteed returns, high-yield investment traps.
9. **E-Commerce Task Scams (Brushing):** Uzum Market / Wildberries product rating schemes promising 300k–500k sums daily.
10. **Crypto & Airdrop Fraud:** Telegram bot airdrop scams (Hamster, Notcoin, Toncoin).
11. **Fake Umra / Hajj / Visa Services:** Unregulated visa guarantees, queue-skipping Hajj schemes.
12. **Traffic Fines & Utility Discounts:** Fake 50% discount portals impersonating YHXBB / traffic police.
13. **Psychological Urgency & Secret Contact Traps:** Artificial scarcity countdowns, requests to message admins/private chat.

---

## Key Capabilities in v5.3.0

1. **Probabilistic Machine Learning (`ml_classifier.js`)**:
   - Evaluates vocabulary log-odds probabilities rather than exact string matches.
   - Computes statistical scam likelihood ($0\%$ to $100\%$) based on word and n-gram distributions across **1,200+ research indicators**.
   - Includes natural language inhibitors (everyday speech, news, university notices, family greetings) to guarantee zero false positives.
   - Trilingual coverage across Uzbek Latin, Uzbek Cyrillic (Кирилл), and Russian (Русский).

2. **Social Engineering & Behavioral Profiler (`heuristics.js`)**:
   - **Bait-to-Action Proximity:** Calculates token distance between an incentive (e.g., money or prize) and a call to action (e.g., link or credential request).
   - **Urgency Index:** Measures punctuation clustering (`!!!`), all-caps shouting, and psychological time constraints.
   - **Infrastructure Risk Profiling:** Detects URL shorteners (`bit.ly`, `tinyurl`, `cutt.ly`, `t.me/+...`), high-risk TLDs (`.xyz`, `.top`, `.click`), raw IP addresses, and suspicious `.apk` attachments.
   - **Obfuscation De-anonymizer:** Strips intra-word separators (`s-m-s`, `p.u.l`) and resolves leetspeak substitutions (`k@rt@`, `5 m1n`).

3. **Chrome Built-in AI Integration (`ai_provider.js`)**:
   - Interfaces directly with Chrome's on-device Gemini Nano model via `window.ai` / `ai.languageModel` (Chrome Prompt API).
   - Operates 100% locally with zero external API calls, zero server latency, and complete privacy.

4. **Raycast / Linear Grade Cyber Dark UI (`popup/`)**:
   - Deep obsidian dark glassmorphism (`#080c14` / `#0f172a`) with ambient neon gradient lighting.
   - Rotating radar sweep beacon indicating live tab threat posture (emerald safe, crimson alert pulse).
   - Sliding pill segmented navigation bar with spring physics (`cubic-bezier(0.16, 1, 0.3, 1)`).
   - Dual-tone vector SVG icons across all tabs, metrics, and actions.
   - Keyboard shortcut: `Ctrl+Enter` (or `Cmd+Enter`) instant scanner trigger.
   - 1-click text clearing button, dynamic character counter, and instant diagnostic report export.
   - Quick sample chips including `5 mln yutuq`, `Karta / SMS`, `Ovoz berish`, `Foto.apk`, `Uzum layk`, `Kompensatsiya`, and `Baza sizishi`.
   - Interactive Telegram sandbox simulator.

5. **SPA-Safe Non-Destructive DOM Injection (`content.js` & `styles.css`)**:
   - Sibling insertion instead of element reparenting: zero interference with React/Vue virtual DOMs on Telegram Web, X/Twitter, or Facebook.
   - Modern frosted glassmorphism warning cards with fluid CSS transitions and instant reveal/re-hide ribbons.

---

## Automated Verification & Testing

Himoya includes an automated test suite verifying malicious scam detection across real-world vectors and zero false positives on benign everyday text:

```bash
node test/test_engine.js
```

**Result:** All 35 automated unit test cases pass with **100% accuracy**.

---

## Chrome Web Store Packaging

Build the clean, validated distribution package ready for the Chrome Web Store Developer Console:

```powershell
.\package.ps1
```

- **Output:** `himoya-extension-v5.3.0.zip` (59.2 KB)
- **Store Listing & Reviewer Justifications:** [`store/CWS_LISTING.md`](store/CWS_LISTING.md)
- **Hosted Privacy Policy:** [`store/privacy.html`](store/privacy.html) (100% client-side, zero data collection)

---

## License

MIT License — see [LICENSE](LICENSE) for details. Built for the digital safety of our people.
