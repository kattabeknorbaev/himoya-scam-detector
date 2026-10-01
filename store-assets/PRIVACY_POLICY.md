# Privacy Policy for Himoya: AI Scam & Phishing Detector

**Last Updated:** October 1, 2026  
**Extension Version:** 5.4.0  
**Repository:** [github.com/kattabeknorbaev/himoya-scam-detector](https://github.com/kattabeknorbaev/himoya-scam-detector)  
**Developer Contact:** [support@himoya.uz](mailto:support@himoya.uz) / GitHub Issues

---

## 1. Executive Summary & Zero-Knowledge Architecture

**Himoya: AI Scam & Phishing Detector** ("Himoya", "we", "our") is an open-source, client-side browser extension designed to protect users across Central Asia from financial fraud, card draining, one-time password (OTP) theft, fake subsidy portals, and malicious APK droppers.

Himoya is architected under an uncompromising **Zero-Knowledge, 100% On-Device Execution Model**:
- **Zero Remote Data Transmission:** We do **not** transmit, collect, log, or sell your chat messages, personal details, browsing history, keystrokes, IP addresses, or DOM contents.
- **Local Deterministic Security Engine:** All linguistic text normalization, Aho-Corasick Deterministic Finite Automaton (DFA) string matching, and cryptographic Bloom filter lookups execute entirely inside your local browser runtime memory.
- **No Third-Party Analytics or Telemetry:** Himoya contains zero external tracking scripts, zero advertising SDKs, and zero telemetry beacons.

---

## 2. Information We Access and How It Is Processed

### 2.1 DOM Text Content (On-Device Runtime Only)
- **What is accessed:** The extension monitors dynamic Document Object Model (DOM) text mutations strictly within the designated web applications (`web.telegram.org`, `*.facebook.com`, `*.instagram.com`).
- **Purpose:** To detect patterns indicative of financial theft (e.g., requests for SMS verification codes, bank card CVVs, fake government compensation claims, or suspicious `.apk` download links).
- **Processing:** Raw text strings are normalized (Unicode NFKC, homoglyph transliteration, suffix stripping) and matched in-memory against a local pre-compiled pattern corpus (2,700+ threat definitions).
- **Retention:** **Zero retention.** Scanned text is processed in transient volatile RAM and immediately discarded. It is never persisted to disk or sent across any network connection.

### 2.2 Hyperlinks & Domains (On-Device Runtime Only)
- **What is accessed:** URLs embedded in user-visible DOM nodes within the supported platforms.
- **Purpose:** To verify domain reputation against a local cryptographic Bloom filter (MurmurHash3/FNV-1a) and local verification lookup map.
- **Processing & Retention:** All lookups run locally. URLs are never reported to external threat-intelligence services or remote APIs.

### 2.3 Extension Configuration & Local Statistics (`chrome.storage.local`)
- **What is stored:**
  - User preference toggles (e.g., extension enabled/disabled, language preference).
  - User-whitelisted domains or dismissed alert identifiers.
  - Aggregated local threat metrics (e.g., total threats intercepted, category counters) displayed in the user popup dashboard.
- **Storage Location:** All data is strictly persisted inside the browser's sandboxed `chrome.storage.local`. This data never leaves your machine.

---

## 3. Chrome Web Store Single-Purpose and Data Use Disclosure

Pursuant to the **Google Chrome Web Store Developer Program Policies**:
1. **Single Purpose:** Himoya has the single purpose of providing real-time client-side security alerts to protect users from social engineering, phishing, and payment card scams on web platforms.
2. **Minimal Data Access:** Himoya accesses only the minimum necessary DOM elements required to fulfill its security inspection purpose.
3. **No Monetization of Personal Data:** We do not sell, rent, license, or monetize any user data under any circumstance.
4. **No Telemetry / Telecommunications:** The extension makes no background HTTP requests to third-party endpoints.

---

## 4. Manifest V3 & Host Permissions

Himoya strictly adheres to the Principle of Least Privilege:
- `host_permissions` are limited strictly to:
  - `https://web.telegram.org/*`
  - `https://*.facebook.com/*`
  - `https://*.instagram.com/*`
- Himoya deliberately does **not** request `<all_urls>` or `*://*/*`.
- Content scripts operate in an **ISOLATED world** and display warnings via encapsulated **Closed Shadow DOM** (`element.attachShadow({ mode: 'closed' })`), preventing host page scripts from reading or manipulating Himoya's security notifications.

---

## 5. User Control & Data Deletion

You retain complete control over Himoya:
- **Dismiss / Whitelist:** You may dismiss alerts or whitelist specific domains directly through the interface.
- **Clear Statistics:** Resetting or uninstalling the extension instantly purges all local configuration and counters from `chrome.storage.local`.
- **Open Source Auditability:** All source code is publicly accessible and auditable on [GitHub](https://github.com/kattabeknorbaev/himoya-scam-detector).

---

## 6. Updates to this Policy

Any updates to this Privacy Policy will be reflected in extension release notes, GitHub commits, and Chrome Web Store listing updates.

---

## 7. Contact & Security Reporting

For privacy questions, vulnerability disclosures, or security inquiries, please open an issue or security advisory on:
- **GitHub:** [https://github.com/kattabeknorbaev/himoya-scam-detector](https://github.com/kattabeknorbaev/himoya-scam-detector)
