/**
 * Himoya Content Script v3.5.0
 * Monitors page DOM, identifies suspicious Uzbek content using engine.js & i18n.js,
 * safely blurs threats, and renders localized warning cards.
 */

(function () {
  // Global configuration state
  let config = {
    enabled: true,
    sensitivity: 'balanced', // 'strict' (4.0), 'balanced' (5.0), 'relaxed' (7.0)
    lang: 'uz',              // 'uz' | 'uz_cyr' | 'ru'
    audioAlert: false,
    whitelistedDomains: []
  };

  const THRESHOLD_MAP = {
    strict: 4.0,
    balanced: 5.0,
    relaxed: 7.0
  };

  const currentHost = window.location.hostname.toLowerCase();
  const scannedElements = new WeakSet();
  let flaggedCount = 0;
  let isScanningQueued = false;
  let hasChimedThisPage = false;
  const scanQueue = [];

  // Helper for localized text
  function t() {
    if (typeof HIMOYA_I18N !== 'undefined' && HIMOYA_I18N[config.lang]) {
      return HIMOYA_I18N[config.lang];
    }
    return HIMOYA_I18N ? HIMOYA_I18N.uz : {};
  }

  // Gentle audio chime synthesized via Web Audio API (no external asset needed)
  function playWarningChime() {
    if (!config.audioAlert || hasChimedThisPage) return;
    hasChimedThisPage = true;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.25); // A4
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (err) {}
  }

  // Initialize extension settings from storage
  function loadSettings(callback) {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(
        ['himoya_enabled', 'himoya_sensitivity', 'himoya_whitelist', 'himoya_lang', 'himoya_audio'], 
        (res) => {
          if (res.himoya_enabled !== undefined) config.enabled = res.himoya_enabled;
          if (res.himoya_sensitivity) config.sensitivity = res.himoya_sensitivity;
          if (res.himoya_lang) config.lang = res.himoya_lang;
          if (res.himoya_audio !== undefined) config.audioAlert = res.himoya_audio;
          if (Array.isArray(res.himoya_whitelist)) config.whitelistedDomains = res.himoya_whitelist;

          if (callback) callback();
        }
      );
    } else {
      if (callback) callback();
    }
  }

  // Check if current site is whitelisted
  function isSiteWhitelisted() {
    return config.whitelistedDomains.some(domain => 
      currentHost === domain.toLowerCase() || currentHost.endsWith('.' + domain.toLowerCase())
    );
  }

  // Report threat count to background service worker for badge display
  function notifyBackgroundThreat() {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      try {
        chrome.runtime.sendMessage({
          type: 'HIMOYA_BADGE_UPDATE',
          count: flaggedCount,
          host: currentHost
        });
      } catch (err) {}
    }
  }

  /**
   * Safely decorates a flagged element with warning overlay and blur
   */
  function applyScamWarning(element, result) {
    if (!element || scannedElements.has(element)) return;
    if (element.closest('.himoya-flagged-wrapper')) return;

    scannedElements.add(element);
    flaggedCount++;
    notifyBackgroundThreat();
    playWarningChime();

    const strings = t();
    const isTableCell = element.tagName === 'TD' || element.tagName === 'TH';
    
    // Create card overlay
    const card = document.createElement('div');
    card.className = 'himoya-warning-card';

    const riskBadgeClass = result.riskLevel === 'HIGH' ? 'high' : 'medium';
    const riskBadgeText = result.riskLevel === 'HIGH' ? (strings.riskHigh || '🚨 Yuqori xavf') : (strings.riskMedium || '⚠️ Shubhali xabar');

    const tagsHtml = result.categories.map(c => 
      `<span class="himoya-tag">${escapeHtml(c.name)}</span>`
    ).join('');

    const descText = (strings.cardDesc || "Ushbu xabarda firibgarlik alomatlari topildi (Ball: {score})")
      .replace('{score}', result.score);

    card.innerHTML = `
      <div class="himoya-header-row">
        <div class="himoya-header-left">
          <span class="himoya-shield-icon">🛡️</span>
          <h4 class="himoya-title">${escapeHtml(strings.cardTitle || 'Himoya: Shubhali post aniqlandi')}</h4>
        </div>
        <span class="himoya-risk-badge ${riskBadgeClass}">${riskBadgeText}</span>
      </div>
      <p class="himoya-body-desc">${escapeHtml(descText)}</p>
      <div class="himoya-tags-list">
        ${tagsHtml}
      </div>
      <div class="himoya-actions-row">
        <button type="button" class="himoya-btn himoya-btn-primary himoya-reveal-btn">
          ${escapeHtml(strings.cardReveal || "👁️ Ko'rish")}
        </button>
        <button type="button" class="himoya-btn himoya-btn-secondary himoya-dismiss-btn">
          ${escapeHtml(strings.cardDismiss || "✓ Xatolik (Xavfsiz)")}
        </button>
      </div>
    `;

    // Apply blur to target
    element.classList.add('himoya-blurred-content');

    // Safe insertion
    if (isTableCell) {
      element.prepend(card);
    } else {
      const parent = element.parentNode;
      if (parent) {
        const wrapper = document.createElement('div');
        wrapper.className = 'himoya-flagged-wrapper';
        parent.insertBefore(wrapper, element);
        wrapper.appendChild(card);
        wrapper.appendChild(element);
      } else {
        return;
      }
    }

    // Event: Reveal content
    const revealBtn = card.querySelector('.himoya-reveal-btn');
    revealBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      element.classList.remove('himoya-blurred-content');
      card.style.display = 'none';

      // Insert subtle ribbon with re-blur option
      const ribbon = document.createElement('div');
      ribbon.className = 'himoya-revealed-ribbon';
      const catName = result.categories[0]?.name || 'Shubhali';
      ribbon.innerHTML = `
        <span>${escapeHtml(strings.ribbonTitle || '🛡️ Himoya: Ogohlantirish ochildi')} (${escapeHtml(catName)})</span>
        <button type="button" class="himoya-reblur-btn">${escapeHtml(strings.ribbonReblur || 'Qayta yashirish')}</button>
      `;

      ribbon.querySelector('.himoya-reblur-btn').addEventListener('click', (ev) => {
        ev.stopPropagation();
        element.classList.add('himoya-blurred-content');
        card.style.display = 'block';
        ribbon.remove();
      });

      card.parentNode.insertBefore(ribbon, card);
    });

    // Event: Dismiss as false positive
    const dismissBtn = card.querySelector('.himoya-dismiss-btn');
    dismissBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      element.classList.remove('himoya-blurred-content');
      card.remove();
      if (flaggedCount > 0) {
        flaggedCount--;
        notifyBackgroundThreat();
      }
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Scan an individual DOM element
  function evaluateElement(el) {
    if (!el || scannedElements.has(el)) return;
    if (el.closest('.himoya-flagged-wrapper') || el.classList.contains('himoya-warning-card')) {
      scannedElements.add(el);
      return;
    }

    const tagName = el.tagName;
    if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'HEAD', 'META', 'LINK', 'TEXTAREA', 'INPUT'].includes(tagName)) {
      scannedElements.add(el);
      return;
    }

    const text = el.innerText || el.textContent;
    if (!text || text.length < 25 || text.length > 20000) {
      scannedElements.add(el);
      return;
    }

    const threshold = THRESHOLD_MAP[config.sensitivity] || 5.0;
    if (typeof analyzeContent === 'function') {
      const result = analyzeContent(text, threshold, config.lang);
      if (result.isScam) {
        applyScamWarning(el, result);
      } else {
        scannedElements.add(el);
      }
    }
  }

  // Chunked queue processing using requestIdleCallback / setTimeout
  function processQueue() {
    if (!config.enabled || isSiteWhitelisted()) {
      scanQueue.length = 0;
      isScanningQueued = false;
      return;
    }

    const startTime = Date.now();
    const CHUNK_BUDGET_MS = 12;

    while (scanQueue.length > 0 && (Date.now() - startTime < CHUNK_BUDGET_MS)) {
      const el = scanQueue.shift();
      evaluateElement(el);
    }

    if (scanQueue.length > 0) {
      if (window.requestIdleCallback) {
        window.requestIdleCallback(processQueue);
      } else {
        setTimeout(processQueue, 16);
      }
    } else {
      isScanningQueued = false;
    }
  }

  function queueScanElements(elements) {
    if (!config.enabled || isSiteWhitelisted()) return;

    for (let i = 0; i < elements.length; i++) {
      const el = elements[i];
      if (!scannedElements.has(el)) {
        scanQueue.push(el);
      }
    }

    if (!isScanningQueued && scanQueue.length > 0) {
      isScanningQueued = true;
      if (window.requestIdleCallback) {
        window.requestIdleCallback(processQueue);
      } else {
        setTimeout(processQueue, 16);
      }
    }
  }

  // Scan candidate containers
  function scanPage() {
    if (!config.enabled || isSiteWhitelisted()) return;

    const selectors = [
      'article',
      'div[role="article"]',
      '[data-testid="post"]',
      '[data-testid="tweet"]',
      '.feed-shared-update-v2',
      'div.tgme_widget_message_wrap',
      '.message-content',
      'div.post',
      'div.comment',
      'blockquote',
      'div.message',
      'p'
    ];

    const elements = document.querySelectorAll(selectors.join(','));
    queueScanElements(elements);
  }

  // Debounced mutation observer
  let debounceTimer = null;
  function handleMutations(mutations) {
    if (!config.enabled || isSiteWhitelisted()) return;

    const hasRelevantAddedNodes = mutations.some(m => 
      m.type === 'childList' && m.addedNodes.length > 0
    );

    if (hasRelevantAddedNodes) {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(scanPage, 400);
    }
  }

  // Listen for configuration updates from popup
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
      if (msg.type === 'HIMOYA_SETTINGS_CHANGED') {
        loadSettings(() => {
          if (!config.enabled || isSiteWhitelisted()) {
            document.querySelectorAll('.himoya-blurred-content').forEach(el => {
              el.classList.remove('himoya-blurred-content');
            });
            document.querySelectorAll('.himoya-warning-card').forEach(c => c.remove());
            flaggedCount = 0;
            notifyBackgroundThreat();
          } else {
            scanPage();
          }
        });
        sendResponse({ success: true, count: flaggedCount });
      } else if (msg.type === 'HIMOYA_GET_PAGE_STATUS') {
        sendResponse({
          count: flaggedCount,
          isWhitelisted: isSiteWhitelisted(),
          enabled: config.enabled
        });
      }
      return true;
    });
  }

  // Start initialization
  loadSettings(() => {
    if (config.enabled && !isSiteWhitelisted()) {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(scanPage, 300));
      } else {
        setTimeout(scanPage, 300);
      }

      const observer = new MutationObserver(handleMutations);
      observer.observe(document.body || document.documentElement, {
        childList: true,
        subtree: true
      });
    }
  });

  console.log('Himoya v3.5.0: Initialized successfully with trilingual support.');
})();