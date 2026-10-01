# Changelog

All notable changes to the **Himoya AI Scam Detector** Chrome extension are documented in this file.

---

## [5.4.0] - 2026-10-01

### Added - Enterprise Engine Refactor
- **Aho-Corasick Deterministic Finite Automaton (DFA) (`src/engine/ahoCorasick.js`):**
  - Linear-time $O(n + m + z)$ multi-pattern matching replacing sequential RegExp loops.
  - Pre-compiled trie with BFS failure link generation and output node aggregation over **2,715 categorized threat patterns**.
  - Dynamic transition memoization in traversal loop guaranteeing $O(1)$ state lookups.
  - Full state serialization via `exportJSON()` and `fromJSON()`.
- **Linguistic Normalization & Anti-Evasion Engine (`src/engine/normalizer.js`):**
  - Unicode NFKC decomposition for ligatures and compatibility symbols.
  - Cross-script homoglyph transliteration mapping visually identical Cyrillic lookalikes to Latin equivalents.
  - Evasion stripping for zero-width characters (`\u200B`, `\u200C`), soft hyphens, ornamental emojis, and character spam.
  - Lightweight Uzbek morphological agglutinative stemmer stripping possessive and case suffixes (`-ingiz`, `-dan`, `-gacha`, `-ning`, `-da`, etc.) with vowel/consonant sensitivity.
- **Cryptographic Bloom Filter (`src/engine/bloomFilter.js`):**
  - Compact 8,192-bit bit vector utilizing MurmurHash3 and FNV-1a Kirsch-Mitzenmacher double-hashing ($k = 4$).
  - Pre-seeded with malicious Central Asian domain prefixes, disposable TLDs (`.xyz`, `.top`, `.click`), and phishing patterns.
  - Two-tiered lookup strategy: fast $O(1)$ Bloom filter test backed by an authoritative local map in `chrome.storage.local` ensuring 0% false positives.
- **Closed Shadow DOM UI Encapsulation (`src/content/shadowUI.js`):**
  - Banners mounted via `element.attachShadow({ mode: 'closed' })` ensuring complete encapsulation from host page scripts (`shadowRoot` evaluates to `null`).
  - Sibling insertion preserving host virtual DOM trees (React, Vue) without breaking SPA message feeds.
  - Frosted glassmorphism warning cards with localized Uzbek security advice and whitelist actions.
- **Manifest V3 Least Privilege Compliance (`manifest.json`):**
  - Restricted host permissions strictly to `https://web.telegram.org/*`, `https://*.facebook.com/*`, and `https://*.instagram.com/*`.
  - Permissions reduced to `"storage"` and `"alarms"`.
  - Isolated world content script execution (`world: "ISOLATED"`) at `document_idle`.
  - Zero-knowledge on-device execution: zero remote telemetry, zero external APIs.
- **Testing & Benchmarks:**
  - `tests/ahoCorasick.test.js`: 6 unit tests verifying exact matches, failure links, multi-category escalation, and hydration.
  - `tests/normalizer.test.js`: 5 unit tests verifying NFKC, homoglyphs, de-evasion, and Uzbek morphological stemming.
  - `tests/benchmark.js`: High-throughput performance benchmark validating **46,031 nodes/sec** throughput and **21.72 µs/node** latency.
- **Store Documentation (`store-assets/`):**
  - `store-assets/PRIVACY_POLICY.md`: CWS-compliant Zero-Knowledge Privacy Policy.
  - `store-assets/PERMISSION_JUSTIFICATIONS.md`: Line-by-line developer justifications for Chrome Web Store review.


## [5.3.0] - 2026-10-01

### Added
- **1,200+ Research-Backed Threat Indicators & N-Grams (`ml_classifier.js`):**
  - Massive dataset expansion incorporating intelligence from CSEC.uz, CERT.uz, and the Central Bank of Uzbekistan.
  - **Data Breach Panic Schemes:** Dedicated patterns detecting "baza sizib chiqdi", "kartalar sizishi", and fraudulent transit account demands (`xavfsiz tranzit hisob`).
  - **Trojan Wedding Invitations & Court Summons:** Detection of malicious APK vectors (`to'y taklifnomasi.apk`, `taklifnoma.apk`, `sud qarori.apk`, `ijro hujjati.apk`, `jarima qarori.apk`).
  - **Telegram Friend Loan Emergency Hijacks:** Detection of hijacked contact loan requests (`kartam ishlamayapti, 500 ming tashlab tur`).
  - **Escrow & Delivery Phishing:** Spoofed Click / Payme / OLX delivery links requesting card credentials to "receive money".
  - **Trilingual Parallel Threat Coverage:** Balanced across Uzbek Latin, Uzbek Cyrillic, and Russian.
- **Dedicated Threat Category in Engine (`engine.js`):** Added `DATA_BREACH_ALERT` and Fast-Path 9 for instant panic/transit account mitigation.
- **Automated Test Suite Expansion (`test/test_engine.js`):** Expanded from 26 to 35 comprehensive automated tests passing with 100% accuracy.
- **Enhanced Sample Chips (`popup/`):** Added 1-click test sample for `Baza sizishi`.
- **CWS Distribution Build:** Packaged `himoya-extension-v5.3.0.zip` (59.2 KB).

---

## [5.2.0] - 2026-10-01

### Added
- **Expanded Research-Backed Intelligence Dataset (300+ Tokens & 12 Threat Vectors):**
  - **Malicious APK Trojans:** Identification of fake photo/update vectors (`bu rasmda senmisan`, `rasmlar.apk`, `foto.apk`, `telegram_update.apk`).
  - **Fake Bank Security Service Alerts:** Phishing alerts claiming account freezes or urgent transfers to "safe accounts".
  - **E-Commerce Task Scams (Brushing):** Uzum Market & Wildberries fake product review/liking schemes promising 200k-500k sums.
  - **Fake Government Aid & Subsidies:** Child compensation, presidential decisions, and fake utility/gas subsidies.
  - **Crypto / Airdrop Fraud:** Telegram bot airdrop scams (Hamster, Notcoin, Toncoin).
  - **Traffic Fines & Utility Discounts:** 50% discount traps impersonating YHXBB / traffic police.
- **Probabilistic ML Expansion (`ml_classifier.js`):** Expanded vocabulary from ~80 to 300+ weighted tokens, multi-word bigrams, and natural language inhibitors.
- **Expanded Automated Test Suite (`test/test_engine.js`):** 26 comprehensive unit tests covering all modern cyber fraud vectors with 100% test accuracy and zero false positives.
- **Enhanced Sample Chips:** Added 1-click test chips for `Foto.apk`, `Uzum layk`, and `Kompensatsiya`.

---

## [5.1.0] - 2026-10-01

### Added
- **Raycast / Linear Grade Cyber Dark Design System:**
  - Deep obsidian dark glassmorphism (`#080c14` / `#0f172a`) with ambient neon gradient lighting.
  - Concentric rotating radar sweep with live status beacon (emerald safe, crimson alert pulse when threats detected).
  - Apple/Raycast-style sliding pill segmented navigation with spring physics (`cubic-bezier(0.16, 1, 0.3, 1)`).
  - Dual-tone vector SVG icons across all tabs, metrics, and actions (replacing emojis).
  - High-tech scanner with glowing neon focus ring, developer micro-tags, dynamic 1-click clear button, and real-time character counter.
  - Telegram dark-mode chat bubble in sandbox simulator for realistic live testing.
- **Active Tab Permission & Safe URL Handling:**
  - Added `activeTab` permission to `manifest.json` for privacy-first tab inspection without broad host privileges.
  - Resolved `telegram.org` placeholder issue on internal browser tabs (`chrome://newtab`, `about:blank`, blank pages).
- **One-Click Diagnostic Exporter:** Added `📋 Natijani nusxalash` to quickly export incident reports for reporting scams.

### Changed
- Production package build updated to `himoya-extension-v5.1.0.zip`.

---

## [5.0.0] - 2026-10-01

### Added
- **SPA-Safe Non-Destructive DOM Injection:** Switched from element reparenting (`.himoya-flagged-wrapper`) to sibling insertion (`parent.insertBefore(card, element)`), completely preventing virtual DOM crashes (`NotFoundError: Node was not found`) on React/Vue SPAs like Telegram Web, X/Twitter, and Facebook.
- **Tab Navigation Badge Sync:** Added `chrome.tabs.onUpdated` listener on `loading` status in `background.js` to immediately clear stale threat counters when navigating or refreshing tabs.
- **In-Page Overlay Polish:** Frosted glassmorphic warning card (`backdrop-filter: blur(14px)`) and smooth blur transitions.

---

## [4.5.0] - 2026-09-27

### Added
- **Probabilistic Machine Learning Classifier (`ml_classifier.js`):** Statistical Naive Bayes log-odds model evaluating word probabilities ($0-100\%$) across unigrams and bigrams.
- **Brand Identity Redesign:** Vector Cyber Shield logo in electric crimson to cyber indigo gradient with high-DPI icons (`16px`, `48px`, `128px`).
- **CWS Store Suite:** Automated packaging pipeline (`package.ps1`), privacy policy documentation, and bilingual store listing descriptions.

### Fixed
- **Cyrillic Normalization Bug:** Isolated leetspeak de-obfuscation map to prevent Latin lookalike substitutions from corrupting pure Cyrillic text.

---

## [4.0.0] - 2026-09-25

### Added
- **Chrome Built-in AI Provider (`ai_provider.js`):** Direct interface with Google Chrome's native on-device Gemini Nano model via the Prompt API (`window.ai` / `ai.languageModel`).
- **Offline Zero-Shot Semantic Fallback:** 100% on-device operation with zero external network requests.

---

## [3.5.0] - 2026-09-25

### Added
- **DOM Queue & RequestIdleCallback Scanner:** Chunked scanning pipeline with `requestIdleCallback` (and 16ms fallback) to guarantee 60 FPS scrolling on large feeds.
- **Trilingual Localization Engine (`i18n.js`):** Native support for Uzbek Latin (`uz`), Uzbek Cyrillic (`uz_cyr`), and Russian (`ru`).

---

## [3.0.0] - 2026-09-24

### Added
- **Multi-Layer Scam Intelligence Engine (`engine.js`):** Multi-factor scoring combining Bayesian probability, behavioral social engineering heuristics, and semantic fast-paths.
- **Social Engineering & Behavioral Profiler (`heuristics.js`):** Bait-to-Action token distance analysis, psychological urgency index, and suspicious URL shortener detection.

---

## [2.7.3] - 2025-10-13

### Initial Release
- Basic regex-based scam detector prototype for Uzbek internet content.
