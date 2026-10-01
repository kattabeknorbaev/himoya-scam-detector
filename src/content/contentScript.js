/**
 * Himoya Enterprise Content Script v5.4.0
 * Document Object Model (DOM) Runtime Threat Monitor for SPAs.
 * Specifically optimized for Telegram Web, Facebook, and Instagram.
 *
 * Pipeline:
 * DOM Mutation -> requestIdleCallback Batcher -> Linguistic Normalizer
 *   -> Aho-Corasick DFA String Search & Cryptographic Bloom Filter
 *   -> Closed Shadow DOM Isolation Banner
 */

(async function () {
  'use strict';

  // Prevent multiple injections in same frame
  if (window.__himoyaEngineInjected) return;
  window.__himoyaEngineInjected = true;

  const currentHost = window.location.hostname.toLowerCase();

  // Check Whitelist
  if (typeof HimoyaStorage !== 'undefined') {
    const isWhitelisted = await HimoyaStorage.isDomainWhitelisted(currentHost);
    if (isWhitelisted) {
      console.log(`[Himoya] Domain ${currentHost} is whitelisted. Engine paused.`);
      return;
    }
  }

  // SPA-Specific Target Content Selectors
  const SELECTORS = [
    // Telegram Web (K & A versions)
    '.message-content', '.bubble-content', '.text-content', '.message',
    '[data-message-id]', '.im_message_text', '.translatable-message',
    // Facebook
    '[role="article"]', '[data-ad-preview="message"]', '.userContent',
    // Instagram
    'article', 'ul._a9z6', 'div._a9zs',
    // Generic fallback for Central Asian web portals
    '.comment-text', '.post-text', '.forum-message'
  ].join(', ');

  // State Management
  const scannedNodes = new WeakSet();
  let pendingNodes = [];
  let isScanningScheduled = false;
  let pageThreatCount = 0;
  let engineActive = true;
  let sensitivityThreshold = 4.5; // Balanced default

  // Load Engine Configuration
  if (typeof HimoyaStorage !== 'undefined') {
    const settings = await HimoyaStorage.getSettings();
    engineActive = settings.engineEnabled;
    if (settings.sensitivity === 'STRICT') sensitivityThreshold = 3.2;
    if (settings.sensitivity === 'RELAXED') sensitivityThreshold = 6.0;
  }

  // Initialize Aho-Corasick Automaton
  let acEngine = null;
  async function initAutomaton() {
    try {
      const rulesUrl = chrome.runtime.getURL('src/engine/rules.json');
      const response = await fetch(rulesUrl);
      const data = await response.json();
      acEngine = new AhoCorasick(data.rules);
    } catch (e) {
      console.warn('[Himoya] Failed to fetch external rules.json, falling back to core rules:', e);
      acEngine = new AhoCorasick([
        { word: 'karta raqami', category: 'CARD_DRAINER', weight: 5.0, critical: true },
        { word: 'sms kod', category: 'OTP_THEFT', weight: 5.0, critical: true },
        { word: 'cvv', category: 'CARD_DRAINER', weight: 5.5, critical: true },
        { word: 'ovoz bering', category: 'TELEGRAM_HIJACK', weight: 4.8, critical: true },
        { word: 'bu rasmda senmisan', category: 'APK_DROPPER', weight: 5.2, critical: true },
        { word: 'prezident qarori', category: 'FAKE_SUBSIDY', weight: 4.5, critical: false },
        { word: 'kartangiz sizib chiqdi', category: 'TRANSIT_ACCOUNT_PANIC', weight: 5.5, critical: true },
        { word: 'tranzit hisob', category: 'TRANSIT_ACCOUNT_PANIC', weight: 5.0, critical: true },
        { word: '5 mln yutib', category: 'VISA_UMRA_FRAUD', weight: 4.5, critical: false }
      ]);
    }
  }

  await initAutomaton();

  /**
   * Evaluates a single DOM node through the multi-stage security pipeline
   */
  function inspectNode(node) {
    if (!node || !node.isConnected || scannedNodes.has(node) || node.__himoyaMounted) {
      return;
    }
    scannedNodes.add(node);

    // Skip input fields, scripts, styles, and Himoya's own shadow hosts
    const tag = node.tagName ? node.tagName.toLowerCase() : '';
    if (['input', 'textarea', 'script', 'style', 'code', 'himoya-shield-host'].includes(tag)) {
      return;
    }

    const rawText = node.innerText || node.textContent || '';
    if (rawText.trim().length < 15) return;

    // Stage 1: Linguistic Normalization & Anti-Evasion
    const normalizedText = typeof HimoyaNormalizer !== 'undefined'
      ? HimoyaNormalizer.normalize(rawText)
      : rawText.toLowerCase();

    // Stage 2: Aho-Corasick DFA String Matching
    let result = acEngine.search(normalizedText, sensitivityThreshold);

    // Stage 3: Cryptographic Bloom Filter URL / Domain Check
    if (typeof HimoyaBloomFilter !== 'undefined') {
      const urlMatches = rawText.match(/\b(?:https?:\/\/|www\.)[^\s<>"']+|\b[a-zA-Z0-9_\-\.]+\.(?:xyz|top|click|buzz|cfd|icu|bot)\b/gi) || [];
      for (const url of urlMatches) {
        const domainRep = HimoyaBloomFilter.checkDomainReputation(url);
        if (domainRep.isThreat) {
          result.isScam = true;
          result.totalScore += 5.0;
          result.matches.push({
            token: domainRep.domain,
            category: domainRep.threatType || 'SUSPICIOUS_INFRASTRUCTURE',
            weight: 5.0,
            critical: true
          });
          result.riskLevel = 'CRITICAL';
          break;
        }
      }
    }

    // Stage 4: Closed Shadow DOM Mount
    if (result.isScam) {
      pageThreatCount++;

      if (typeof HimoyaShadowUI !== 'undefined') {
        HimoyaShadowUI.mountThreatBanner(
          node,
          result,
          (cat) => {
            // Whitelist callback
            if (typeof HimoyaStorage !== 'undefined') {
              HimoyaStorage.addWhitelistDomain(currentHost);
            }
          }
        );
      }

      // Record threat statistics
      if (typeof HimoyaStorage !== 'undefined') {
        HimoyaStorage.recordThreatBlocked(1);
      }

      // Notify background service worker for badge synchronization
      try {
        chrome.runtime.sendMessage({
          type: 'THREAT_DETECTED',
          host: currentHost,
          threatCount: pageThreatCount,
          categories: result.categories
        });
      } catch (e) {}
    }
  }

  /**
   * Cooperative non-blocking idle batch runner
   */
  function processPendingBatch(deadline) {
    while (pendingNodes.length > 0 && (deadline.timeRemaining() > 1 || deadline.didTimeout)) {
      const node = pendingNodes.shift();
      inspectNode(node);
    }

    if (pendingNodes.length > 0) {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(processPendingBatch, { timeout: 800 });
      } else {
        setTimeout(() => processPendingBatch({ timeRemaining: () => 5, didTimeout: true }), 30);
      }
    } else {
      isScanningScheduled = false;
    }
  }

  function scheduleBatchScan() {
    if (isScanningScheduled || !engineActive) return;
    isScanningScheduled = true;

    if ('requestIdleCallback' in window) {
      requestIdleCallback(processPendingBatch, { timeout: 800 });
    } else {
      setTimeout(() => processPendingBatch({ timeRemaining: () => 5, didTimeout: true }), 30);
    }
  }

  function enqueueElements(rootNode = document.body) {
    if (!rootNode || !engineActive) return;

    if (rootNode.matches && rootNode.matches(SELECTORS)) {
      pendingNodes.push(rootNode);
    }

    const matches = rootNode.querySelectorAll ? rootNode.querySelectorAll(SELECTORS) : [];
    for (let i = 0; i < matches.length; i++) {
      pendingNodes.push(matches[i]);
    }

    if (pendingNodes.length > 0) {
      scheduleBatchScan();
    }
  }

  // 1. Initial scanning pass on page load
  enqueueElements(document.body);

  // 2. High-performance MutationObserver watching SPA DOM streams
  const mutationObserver = new MutationObserver((mutations) => {
    if (!engineActive) return;

    for (let i = 0; i < mutations.length; i++) {
      const m = mutations[i];
      if (m.type === 'childList') {
        for (let j = 0; j < m.addedNodes.length; j++) {
          const added = m.addedNodes[j];
          if (added.nodeType === 1) { // ELEMENT_NODE
            enqueueElements(added);
          }
        }
      }
    }
  });

  mutationObserver.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Listen for Runtime Commands from Popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'GET_PAGE_THREATS') {
      sendResponse({ threatCount: pageThreatCount, host: currentHost });
    } else if (request.type === 'TRIGGER_MANUAL_SCAN') {
      scannedNodes.clear && (scannedNodes = new WeakSet());
      enqueueElements(document.body);
      sendResponse({ status: 'SCAN_STARTED' });
    } else if (request.type === 'CONFIG_CHANGED') {
      engineActive = request.settings.engineEnabled;
      sendResponse({ status: 'OK' });
    }
    return true;
  });

  console.log(`[Himoya] Enterprise Engine v5.4.0 initialized on ${currentHost}`);
})();
