# Chrome Web Store Permission Justifications

**Extension Name:** Himoya: AI Scam & Phishing Detector  
**Version:** 5.4.0  
**Manifest Version:** 3  

---

## 1. Overview & Principle of Least Privilege

Himoya is an on-device security extension architected strictly under the **Principle of Least Privilege**. It does not request broad permissions such as `<all_urls>`, `webRequest`, `cookies`, or `tabs`. Every declared permission and host permission is strictly required for its single purpose: protecting Central Asian users from financial card-draining, SMS OTP theft, fake subsidies, and malicious APK droppers.

---

## 2. API Permissions Justification

| Permission | Justification |
| :--- | :--- |
| `"storage"` | **Required for client-side persistence without external servers.**<br>• Persists user security configuration (extension toggle state, notification preferences).<br>• Stores user-defined whitelisted domains to prevent repeated warnings.<br>• Retains aggregate threat telemetry counters (e.g., total threats blocked today, threat category tallies) strictly on-device for display within the user popup dashboard (`src/popup/`).<br>• **Zero remote synchronization:** All storage operations use `chrome.storage.local`. |
| `"alarms"` | **Required for service worker lifecycle maintenance.**<br>• In Manifest V3, background service workers are ephemeral and terminate when idle.<br>• The `"alarms"` API schedules daily counter rollovers and cached rule pack validation pulses without keeping persistent wake-locks or polling loops active, maximizing browser power efficiency. |

---

## 3. Host Permissions Justification

Himoya intentionally avoids wildcard `<all_urls>` or `*://*/*` host patterns. Instead, it restricts its host permissions exclusively to the three platforms that account for over 90% of targeted Central Asian consumer phishing campaigns:

```json
"host_permissions": [
  "https://web.telegram.org/*",
  "https://*.facebook.com/*",
  "https://*.instagram.com/*"
]
```

### Specific Vector Analysis:

1. **`https://web.telegram.org/*` (Telegram Web)**
   - **Threat Vector:** Telegram channels, private chats, and direct messages are the dominant vector in Central Asia for automated bot scams, fake presidential subsidy giveaways, malicious APK distribution masquerading as banking apps, and unauthorized Telegram Web session takeover links.
   - **Necessity:** Content scripts inspect incoming chat DOM nodes to alert users in real time *before* they click malicious links, download `.apk` binaries, or transmit card numbers and SMS OTPs.

2. **`https://*.facebook.com/*` (Facebook)**
   - **Threat Vector:** Sponsored advertisements and compromised business pages running fake state compensation campaigns (e.g., targeting pensioners and cardholders of Uzcard, Humo, Click, Payme).
   - **Necessity:** Content scripts detect sponsored post text containing scam hooks and alert users within their feed.

3. **`https://*.instagram.com/*` (Instagram)**
   - **Threat Vector:** High-volume deceptive carousel ads, bios, and direct messages promoting fraudulent investment multipliers and card-verification phishing forms.
   - **Necessity:** Content scripts parse dynamic post text and bio elements as users scroll through content.

---

## 4. Execution Sandbox & Isolation Architecture

- **`world: "ISOLATED"`:** Content scripts run in an isolated execution environment, preventing target web pages from accessing or modifying extension state.
- **`run_at: "document_idle"`:** Content scripts only execute after the initial page DOM has loaded, ensuring zero degradation to initial page load times.
- **Closed Shadow DOM (`element.attachShadow({ mode: 'closed' })`):** All warning banners are encapsulated within closed Shadow Roots. The host SPA's JavaScript cannot read, tamper with, or hide Himoya's security indicators via `element.shadowRoot` (which evaluates to `null`).
- **Zero Remote Network Calls:** No `fetch()` or `XMLHttpRequest` is initiated to external endpoints. The threat engine (Aho-Corasick automaton + Bloom filter) is 100% on-device.
