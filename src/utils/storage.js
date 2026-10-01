/**
 * Himoya Local Storage Utility
 * Promise-based asynchronous wrapper for chrome.storage.local.
 * Maintains in-memory cache and provides seamless fallback for test harnesses.
 */

(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.HimoyaStorage = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // In-memory fallback cache (used in tests or service worker warm cache)
  const memoryCache = new Map();

  const DEFAULT_SETTINGS = {
    engineEnabled: true,
    sensitivity: 'BALANCED', // STRICT, BALANCED, RELAXED
    audioAlerts: false,
    whitelistedDomains: [],
    statsToday: 0,
    statsTotal: 0,
    lastActiveDate: new Date().toISOString().split('T')[0]
  };

  /**
   * Safe getter from chrome.storage.local
   */
  async function get(key, defaultValue = null) {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      return new Promise((resolve) => {
        chrome.storage.local.get([key], (result) => {
          if (chrome.runtime.lastError || result[key] === undefined) {
            resolve(defaultValue);
          } else {
            resolve(result[key]);
          }
        });
      });
    }
    return memoryCache.has(key) ? memoryCache.get(key) : defaultValue;
  }

  /**
   * Safe setter to chrome.storage.local
   */
  async function set(key, value) {
    memoryCache.set(key, value);
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      return new Promise((resolve) => {
        chrome.storage.local.set({ [key]: value }, () => {
          resolve(true);
        });
      });
    }
    return true;
  }

  /**
   * Retrieves all user settings
   */
  async function getSettings() {
    const enabled = await get('engineEnabled', DEFAULT_SETTINGS.engineEnabled);
    const sensitivity = await get('sensitivity', DEFAULT_SETTINGS.sensitivity);
    const audioAlerts = await get('audioAlerts', DEFAULT_SETTINGS.audioAlerts);
    const whitelistedDomains = await get('whitelistedDomains', DEFAULT_SETTINGS.whitelistedDomains);
    const statsToday = await get('statsToday', DEFAULT_SETTINGS.statsToday);
    const statsTotal = await get('statsTotal', DEFAULT_SETTINGS.statsTotal);

    return {
      engineEnabled: enabled,
      sensitivity,
      audioAlerts,
      whitelistedDomains: Array.isArray(whitelistedDomains) ? whitelistedDomains : [],
      statsToday,
      statsTotal
    };
  }

  /**
   * Increments blocked scam count for today and total
   */
  async function recordThreatBlocked(count = 1) {
    const today = new Date().toISOString().split('T')[0];
    const lastDate = await get('lastActiveDate', today);

    let statsToday = await get('statsToday', 0);
    let statsTotal = await get('statsTotal', 0);

    if (lastDate !== today) {
      statsToday = 0;
      await set('lastActiveDate', today);
    }

    statsToday += count;
    statsTotal += count;

    await set('statsToday', statsToday);
    await set('statsTotal', statsTotal);

    return { statsToday, statsTotal };
  }

  /**
   * Whitelists a domain so scanning is bypassed
   */
  async function addWhitelistDomain(domain) {
    if (!domain) return;
    const clean = domain.toLowerCase().trim();
    const list = await get('whitelistedDomains', []);
    if (!list.includes(clean)) {
      list.push(clean);
      await set('whitelistedDomains', list);
    }
  }

  /**
   * Checks if domain is whitelisted
   */
  async function isDomainWhitelisted(domain) {
    if (!domain) return false;
    const clean = domain.toLowerCase().trim();
    const list = await get('whitelistedDomains', []);
    return list.some(item => clean === item || clean.endsWith(`.${item}`));
  }

  return {
    get,
    set,
    getSettings,
    recordThreatBlocked,
    addWhitelistDomain,
    isDomainWhitelisted,
    DEFAULT_SETTINGS
  };
});
