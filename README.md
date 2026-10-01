# Himoya: AI Scam & Phishing Detector 🛡️

**Enterprise-Grade Client-Side Security Engine for Central Asia**

[![Chrome Web Store Manifest V3](https://img.shields.io/badge/Manifest-V3-blue.svg)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![Version](https://img.shields.io/badge/Version-5.4.0-rose.svg)](https://github.com/kattabeknorbaev/himoya-scam-detector/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Privacy: 100% Offline](https://img.shields.io/badge/Privacy-100%25%20On--Device-success.svg)](store-assets/PRIVACY_POLICY.md)
[![Throughput](https://img.shields.io/badge/Throughput-46k%20nodes%2Fsec-brightgreen.svg)](tests/benchmark.js)

Himoya (*"Protection"*) is an enterprise-grade, client-side browser extension (Manifest V3) purpose-built to shield Central Asian web users from digital financial fraud, card-draining funnels, OTP theft, fake subsidies, and malicious APK droppers across dynamic Single Page Applications (SPAs)—specifically **Telegram Web** (`web.telegram.org`), **Facebook** (`facebook.com`), and **Instagram** (`instagram.com`).

Moving beyond naive sequential regex scanning, **Himoya v5.4.0** runs a pure JavaScript **Aho-Corasick Deterministic Finite Automaton (DFA)** over **2,715 pre-compiled threat patterns**, coupled with a **multi-stage linguistic normalization pipeline**, a **cryptographic Bloom filter** (MurmurHash3 / FNV-1a), and isolated **Closed Shadow DOM** UI injection.

---

## 🏛️ Engineering Specifications & Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Dynamic SPA Text Stream                         │
│             (Telegram Web, Facebook, Instagram DOM Mutations)          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Cooperative requestIdleCallback (60 FPS)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│        Specification 2: Linguistic Normalization & Anti-Evasion        │
│  • Unicode NFKC Decomposition                                          │
│  • Cross-Script Homoglyph Transliteration (Cyrillic -> Latin)          │
│  • Evasion Stripping (Zero-width chars, character spam, separators)    │
│  • Uzbek Agglutinative Morphological Stemmer (-ingiz, -dan, -gacha...) │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Normalized token stream
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│        Specification 1: Aho-Corasick Deterministic Finite Automaton     │
│  • Linear-time O(n + m + z) string-matching engine                     │
│  • 2,715 Threat Patterns (10 Cyber Threat Categories)                  │
│  • BFS Failure Transitions with Dynamic State Transition Memoization   │
│  • Non-blocking O(1) state transitions during active text scanning     │
└──────────────────┬─────────────────────────────────┬───────────────────┘
                   │ Matches found                   │ Hyperlinks extracted
                   ▼                                 ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────┐
│ Risk Aggregator & Threat Classifier  │  │ Specification 3: Bloom Filter│
│ • Category weighting (CARD_DRAINER,  │  │ • 8192-bit Murmur3 + FNV-1a  │
│   OTP_THEFT, APK_DROPPER, etc.)      │  │ • Tier 2 Local Storage Map   │
│ • Risk Level: INFO, WARNING, CRITICAL│  │ • 0% False Positive Domain   │
└──────────────────┬───────────────────┘  └──────────────┬───────────────┘
                   │                                     │
                   └──────────────────┬──────────────────┘
                                      ▼
┌────────────────────────────────────────────────────────────────────────┐
│             Specification 4: Encapsulated Closed Shadow DOM            │
│  • element.attachShadow({ mode: 'closed' })                            │
│  • Host scripts cannot inspect or tamper (shadowRoot returns null)     │
│  • Frosted glassmorphism warning banner, localized guidance, whitelist │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🔬 Core Engineering Innovations

### 1. Algorithmic Refactor (Aho-Corasick DFA) — `src/engine/ahoCorasick.js`
- Eliminates sequential RegExp array scanning ($O(k \cdot n)$), replacing it with an $O(n + m + z)$ multi-pattern Deterministic Finite Automaton.
- BFS-driven failure link resolution aggregates multi-pattern outputs at shared sub-branches.
- **Dynamic Transition Memoization:** Resolved failure links are memoized into `node.transitions` during traversal, guaranteeing true $O(1)$ state lookups per input byte.
- Supports full JSON state serialization (`exportJSON()` / `fromJSON()`) for instant runtime hydration.

### 2. Linguistic Normalization & Anti-Evasion Engine — `src/engine/normalizer.js`
- **Unicode Decomposition:** Applies `String.prototype.normalize('NFKC')` to collapse compatibility characters, symbols, and ligatures.
- **Cross-Script Homoglyph Mapping:** Transliterates visually identical Cyrillic characters used in phishing attacks into Latin equivalents (e.g., Cyrillic `а, е, о, р, с, у, х` $\to$ Latin `a, e, o, p, c, y, x`).
- **Anti-Evasion Stripping:** Removes zero-width spaces (`\u200B`), zero-width non-joiners (`\u200C`), soft hyphens (`\u00AD`), decorative emojis, and repeating character spam (`kkaaarrrtttaa` $\to$ `karta`).
- **Uzbek Morphological Stemmer:** Implements an agglutinative Uzbek stemmer stripping possessive and case suffixes (e.g., `-ingiz`, `-dan`, `-gacha`, `-ning`, `-da`, `-lar`) to accurately recover dictionary root forms.

### 3. Cryptographic Bloom Filter for URL Reputation — `src/engine/bloomFilter.js`
- Compact 8,192-bit `Uint8Array` bit vector utilizing **MurmurHash3** and **FNV-1a** Kirsch-Mitzenmacher double-hashing ($k = 4$).
- Pre-seeded with malicious Central Asian domain prefixes, disposable TLDs (`.xyz`, `.top`, `.click`), and phishing patterns.
- **Two-Tiered Verification:** Fast $O(1)$ Bloom filter test backed by an authoritative local map in `chrome.storage.local` to achieve **zero false positives**.

### 4. Closed Shadow DOM UI Encapsulation — `src/content/shadowUI.js`
- Banners are mounted using `element.attachShadow({ mode: 'closed' })`.
- Host page scripts on Telegram Web or Facebook cannot inspect, modify, or conceal Himoya's security indicators via `element.shadowRoot` (returns `null`).
- Non-destructive DOM insertion: Sibling placement preserves host virtual DOM trees (React, Vue) without breaking SPA message feeds.
- Inline frosted glassmorphism styling with distinct threat escalation levels: `INFO`, `WARNING`, and `CRITICAL`.

### 5. Manifest V3 Compliance & Least Privilege — `manifest.json`
- **Strict Host Permissions:** Strictly restricted to `https://web.telegram.org/*`, `https://*.facebook.com/*`, and `https://*.instagram.com/*`.
- **Minimal Permissions:** Only `"storage"` and `"alarms"`.
- **Zero-Knowledge Privacy:** 100% of DOM scanning, normalization, and evaluation runs on-device. No browsing history, chat text, or URLs are ever transmitted to any remote server.
- **Stateless Service Worker:** `src/background/serviceWorker.js` manages alarms and badge states without persistent wake locks.

---

## ⚡ Performance Benchmark

Benchmarked on simulated high-traffic DOM mutation streams with 1,000 text nodes (95 KB text payload, 70% benign, 20% direct attacks, 10% obfuscated evasions) using `tests/benchmark.js`:

| Metric | Result | Target Specification |
| :--- | :--- | :--- |
| **Total Batch Latency (1,000 nodes)** | **21.72 ms** | `< 50 ms` batch |
| **Average Latency Per Node** | **21.72 µs** | `< 100 µs / node` |
| **Scanning Throughput** | **46,031 nodes/sec** | `> 10,000 nodes/sec` |
| **Data Processing Bandwidth** | **4.26 MB/sec** | Real-time stream |
| **Frame Budget Impact** | **0 frame drops (60 FPS preserved)** | Sub-frame slice |

---

## 📂 Project Structure

```
himoya-scam-detector/
├── manifest.json                        # Manifest V3 configuration with least privilege
├── package.json                         # NPM test and benchmark runner scripts
├── package.ps1                          # Automated CWS validation & zip packaging
├── README.md                            # Comprehensive architectural documentation
├── LICENSE                              # MIT License
├── src/
│   ├── background/
│   │   └── serviceWorker.js             # Stateless MV3 service worker & alarms
│   ├── content/
│   │   ├── contentScript.js             # MutationObserver & cooperative idle scheduler
│   │   └── shadowUI.js                  # Closed Shadow DOM warning banner component
│   ├── engine/
│   │   ├── ahoCorasick.js               # Aho-Corasick DFA multi-pattern matching engine
│   │   ├── normalizer.js                # NFKC, homoglyphs, de-evasion & Uzbek stemmer
│   │   ├── bloomFilter.js               # MurmurHash3 + FNV-1a two-tiered Bloom filter
│   │   └── rules.json                   # 2,715 pre-compiled categorized threat patterns
│   ├── popup/
│   │   ├── popup.html                   # Cyber-dark glassmorphism popup dashboard
│   │   ├── popup.js                     # Popup state manager, radar sweep & scanner
│   │   └── popup.css                    # Obsidian dark mode stylesheet
│   └── utils/
│       └── storage.js                   # Asynchronous chrome.storage.local wrapper
├── tests/
│   ├── ahoCorasick.test.js              # Unit tests: exact match, failure links, hydration
│   ├── normalizer.test.js               # Unit tests: homoglyphs, stemming, de-evasion
│   └── benchmark.js                     # High-throughput 1,000-node DOM benchmark
└── store-assets/
    ├── PRIVACY_POLICY.md                # 100% on-device zero-knowledge privacy policy
    └── PERMISSION_JUSTIFICATIONS.md     # Line-by-line CWS reviewer justification
```

---

## 🧪 Testing & Verification

Run the comprehensive unit test suite:

```bash
npm test
```

```
--- Running tests/ahoCorasick.test.js ---
✅ Test 1 Passed: Basic exact match and critical hit identification
✅ Test 2 Passed: Overlapping substring matches via failure links
✅ Test 3 Passed: Multi-category detection and CRITICAL risk escalation
✅ Test 4 Passed: Zero false positives on benign text
✅ Test 5 Passed: Automaton exportJSON & fromJSON graph hydration
✅ Test 6 Passed: Enterprise rules.json (2715 patterns) successfully verified
All Aho-Corasick unit tests completed successfully! ✨

--- Running tests/normalizer.test.js ---
✅ Test 1 Passed: NFKC ligature decomposition
✅ Test 2 Passed: Cross-script homoglyph transliteration
✅ Test 3 Passed: Zero-width evasion and character spam stripping
✅ Test 4 Passed: Uzbek agglutinative suffix stripping and root recovery
✅ Test 5 Passed: Full multi-stage normalization pipeline
All Normalizer unit tests completed successfully! ✨
```

Run the performance benchmark harness:

```bash
npm run benchmark
```

---

## 📦 Chrome Web Store Packaging

To produce a production zip file ready for the Chrome Web Store Developer Console:

```powershell
.\package.ps1
```

- **Output:** `himoya-extension-v5.4.0.zip`
- **Store Documentation:** [`store-assets/`](store-assets/)
- **Privacy Policy:** [`store-assets/PRIVACY_POLICY.md`](store-assets/PRIVACY_POLICY.md)

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details. Built for the digital safety and financial security of our people.
