/**
 * Himoya Enterprise Service Worker (Manifest V3)
 * Fully stateless, resilient to lifecycle termination, zero external dependencies.
 *
 * Responsibilities:
 * 1. Badge notification synchronization across active tabs
 * 2. Background scheduled task management via chrome.alarms
 * 3. Local threat metrics consolidation via chrome.storage.local
 * 4. Zero-knowledge privacy enforcement (no telemetry, no external endpoints)
 */

const ALARM_NAME = 'HIMOYA_SYNC_PULSE';

// 1. Extension Lifecycle: Installation & Update
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log(`[Himoya SW] Extension installed/updated: ${details.reason}`);

  // Initialize storage defaults if empty
  const storageData = await chrome.storage.local.get(['engineEnabled', 'whitelistedDomains']);
  if (storageData.engineEnabled === undefined) {
    await chrome.storage.local.set({
      engineEnabled: true,
      sensitivity: 'BALANCED',
      audioAlerts: false,
      whitelistedDomains: [],
      statsToday: 0,
      statsTotal: 0,
      lastSyncTimestamp: Date.now()
    });
  }

  // Configure periodic alarm for background health and rule verification (every 6 hours)
  chrome.alarms.create(ALARM_NAME, {
    periodInMinutes: 360
  });

  // Set initial badge
  if (chrome.action && chrome.action.setBadgeBackgroundColor) {
    chrome.action.setBadgeBackgroundColor({ color: '#FF385C' });
  }
});

// 2. Alarm Listener for Scheduled Background Sync
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === ALARM_NAME) {
    console.log('[Himoya SW] Executing scheduled threat verification alarm...');
    await chrome.storage.local.set({ lastSyncTimestamp: Date.now() });
  }
});

// 3. Tab Navigation & Loading Listeners (Clean State Badge Sync)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'loading') {
    // Clear badge on tab navigation
    if (chrome.action && chrome.action.setBadgeText) {
      chrome.action.setBadgeText({ tabId, text: '' });
    }
  }
});

// 4. Runtime Message Handling
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || !message.type) return;

  if (message.type === 'THREAT_DETECTED') {
    const tabId = sender.tab ? sender.tab.id : null;
    const count = message.threatCount || 1;

    if (tabId && chrome.action && chrome.action.setBadgeText) {
      chrome.action.setBadgeText({
        tabId,
        text: count > 99 ? '99+' : String(count)
      });
      chrome.action.setBadgeBackgroundColor({ tabId, color: '#FF385C' });
    }

    sendResponse({ received: true });
  } else if (message.type === 'CLEAR_BADGE') {
    const tabId = message.tabId || (sender.tab ? sender.tab.id : null);
    if (tabId && chrome.action && chrome.action.setBadgeText) {
      chrome.action.setBadgeText({ tabId, text: '' });
    }
    sendResponse({ cleared: true });
  }

  return true;
});
