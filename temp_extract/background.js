/**
 * Himoya Background Service Worker v3.0.0
 * Handles badge counters, tab state sync, and persistent statistics in chrome.storage.local
 */

// Initialize storage defaults on install
chrome.runtime.onInstalled.addListener((details) => {
  const today = new Date().toISOString().slice(0, 10);

  chrome.storage.local.get(
    ['himoya_enabled', 'himoya_sensitivity', 'himoya_whitelist', 'himoya_stats_today', 'himoya_stats_total', 'himoya_stats_date'],
    (res) => {
      const updates = {};
      if (res.himoya_enabled === undefined) updates.himoya_enabled = true;
      if (!res.himoya_sensitivity) updates.himoya_sensitivity = 'balanced';
      if (!Array.isArray(res.himoya_whitelist)) updates.himoya_whitelist = [];
      if (res.himoya_stats_date !== today) {
        updates.himoya_stats_today = 0;
        updates.himoya_stats_date = today;
      }
      if (res.himoya_stats_total === undefined) updates.himoya_stats_total = 0;

      chrome.storage.local.set(updates);
    }
  );

  // Set default badge styling
  chrome.action.setBadgeBackgroundColor({ color: '#e11d48' });
});

// Tab threat tracker: tabId -> count
const tabThreats = new Map();

// Reset tab threat count on navigation / reload
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'loading') {
    tabThreats.delete(tabId);
    try {
      chrome.action.setBadgeText({ tabId, text: '' });
    } catch (e) {}
  }
});

// Message handler from content script and popup
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'HIMOYA_BADGE_UPDATE' && sender && sender.tab) {
    const tabId = sender.tab.id;
    if (!tabId) return;
    const count = msg.count || 0;
    const prevCount = tabThreats.get(tabId) || 0;

    tabThreats.set(tabId, count);

    // Update badge text
    try {
      if (count > 0) {
        chrome.action.setBadgeText({ tabId, text: count.toString() });
        chrome.action.setBadgeBackgroundColor({ tabId, color: '#e11d48' });
      } else {
        chrome.action.setBadgeText({ tabId, text: '' });
      }
    } catch (err) {}

    // If new threats detected, increment lifetime and daily stats
    if (count > prevCount) {
      const diff = count - prevCount;
      const today = new Date().toISOString().slice(0, 10);

      chrome.storage.local.get(['himoya_stats_today', 'himoya_stats_total', 'himoya_stats_date'], (res) => {
        let todayCount = res.himoya_stats_today || 0;
        if (res.himoya_stats_date !== today) {
          todayCount = 0;
        }

        chrome.storage.local.set({
          himoya_stats_today: todayCount + diff,
          himoya_stats_total: (res.himoya_stats_total || 0) + diff,
          himoya_stats_date: today
        });
      });
    }

    sendResponse({ success: true });
    return true;
  }
});

// Clean up closed tabs
chrome.tabs.onRemoved.addListener((tabId) => {
  tabThreats.delete(tabId);
});

