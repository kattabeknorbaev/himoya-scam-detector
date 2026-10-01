# Himoya AI 🛡️

**Next-Generation Multi-Layer AI & Behavioral Defense Against Online Financial Scams**

[![Chrome Web Store Manifest V3](https://img.shields.io/badge/Manifest-V3-blue.svg)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![Version](https://img.shields.io/badge/Version-5.2.0-rose.svg)](https://github.com/kattabeknorbaev/himoya-scam-detector/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Privacy: 100% Offline](https://img.shields.io/badge/Privacy-100%25%20On--Device-success.svg)](store/PRIVACY.md)

Himoya (Uzbek for *"Protection"*) is an intelligent, privacy-first cybersecurity browser extension that protects Uzbek-speaking internet users from digital financial fraud, fake lotteries, Telegram account hijacking, APK trojans, and phishing in real time.

Moving far beyond rigid keyword matching, **Himoya v5.2.0** utilizes a **multi-layer cybersecurity intelligence architecture** combining probabilistic Machine Learning, behavioral social engineering heuristics, de-obfuscation, and on-device Chrome Built-in AI (Gemini Nano) with **300+ research-backed threat indicators** across **12 cyber threat categories**.

---

## The Problem

Uzbek-speaking internet users on Telegram, Instagram, Facebook, and local websites are increasingly targeted by sophisticated, localized cyber scams:
- **Telegram Account Hijacking ("Ovoz bering"):** Fake voting contests for children/nieces that steal 5-digit Telegram authentication session codes.
- **Malicious APK Trojans:** Files disguised as photos or updates (`bu rasmda senmisan?`, `foto.apk`, `rasmlar.apk`) designed to drain banking apps.
- **Fake Government Subsidies:** Fabricated presidential decrees promising child compensations or utility aid to steal card credentials.
- **E-Commerce Task Scams (Brushing):** Fake Uzum Market / Wildberries part-time jobs asking victims to like products before demanding deposit fees.
- **Card-Draining Phishing:** Demands for card numbers, expiry dates, and single-use SMS confirmation codes.

Himoya was built to protect vulnerable internet users, parents, and families from losing their life savings to these predatory schemes.

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
│  Naive Bayes log-odds classifier (300+ tokens/bigrams) │
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
│  Instant detection of prize bait + link / card actions │
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

## 12 Cyber Threat Categories Detected (300+ Indicators)

1. **Card Phishing & SMS Exfiltration:** Card numbers, expiry dates, CVV, PINs, single-use SMS codes.
2. **Fake Bank Security Service Alerts:** Scams impersonating Central Bank or bank security claiming urgent account freezes.
3. **Malicious APK Trojans:** Fake photos and malicious Android APK installers sent over Telegram (`bu rasmda senmisan`, `foto.apk`).
4. **Telegram Hijacking & Contest Voting:** Deceptive voting links designed to steal active Telegram sessions.
5. **Fake Government Aid & Subsidies:** Fabricated child compensations, material aid decrees, and utility/gas subsidies.
6. **Fake Lotteries & Brand Anniversaries:** False claims of 5–10 million sum wins, Click/Payme/Korzinka giveaways.
7. **Ponzi Schemes & Doubling Promises:** "Pulni 2 barobar", guaranteed returns, high-yield investment traps.
8. **E-Commerce Task Scams (Brushing):** Uzum Market / Wildberries product rating schemes promising 300k–500k sums daily.
9. **Crypto & Airdrop Fraud:** Telegram bot airdrop scams (Hamster, Notcoin, Toncoin).
10. **Fake Umra / Hajj / Visa Services:** Unregulated visa guarantees, queue-skipping Hajj schemes.
11. **Traffic Fines & Utility Discounts:** Fake 50% discount portals impersonating YHXBB / traffic police.
12. **Psychological Urgency & Secret Contact Traps:** Artificial scarcity countdowns, requests to message admins/private chat.

---

## Key Capabilities in v5.2.0

1. **Probabilistic Machine Learning (`ml_classifier.js`)**:
   - Evaluates vocabulary log-odds probabilities rather than exact string matches.
   - Computes statistical scam likelihood ($0\%$ to $100\%$) based on word and n-gram distributions.
   - Includes natural language inhibitors (everyday speech, news, university notices) to guarantee zero false positives.
   - Adapts to unseen words and natural variations in Uzbek Latin, Uzbek Cyrillic, and Russian.

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
   - 1-click text clearing button and dynamic character counter.
   - Instant 1-click diagnostic clipboard report generator (`📋 Natijani nusxalash`).
   - Interactive Telegram sandbox simulator.

5. **SPA-Safe Non-Destructive DOM Injection (`content.js` & `styles.css`)**:
   - Sibling insertion instead of element reparenting: zero interference with React/Vue virtual DOMs on Telegram Web, X/Twitter, or Facebook.
   - Modern frosted glassmorphism warning cards with fluid CSS transitions and instant reveal/re-hide ribbons.

---

## Automated Verification & Testing

Himoya includes an automated test suite verifying both malicious scam detection and zero false positives on benign text:

```bash
node test/test_engine.js
```

**Result:** All 26 automated unit test cases pass with **100% accuracy**.

---

## Chrome Web Store Packaging

Build the clean, validated distribution package ready for the Chrome Web Store Developer Console:

```powershell
.\package.ps1
```

- **Output:** `himoya-extension-v5.2.0.zip` (47.8 KB)
- **Store Listing & Reviewer Justifications:** [`store/CWS_LISTING.md`](store/CWS_LISTING.md)
- **Hosted Privacy Policy:** [`store/privacy.html`](store/privacy.html) (100% client-side, zero data collection)

---

## License

MIT License — see [LICENSE](LICENSE) for details. Built for the digital safety of our people.
