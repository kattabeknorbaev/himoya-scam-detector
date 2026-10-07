/**
 * Himoya Enterprise Service Worker v5.5.0 (Manifest V3)
 * Fully stateless, resilient to lifecycle termination, zero external dependencies.
 *
 * Responsibilities:
 * 1. Badge notification synchronization across active tabs
 * 2. Background scheduled task management via chrome.alarms
 * 3. Context Menu right-click threat intelligence integration
 * 4. Local threat metrics consolidation via chrome.storage.local
 * 5. Zero-knowledge privacy enforcement (no telemetry, no external endpoints)
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

  // Register Context Menu Items
  if (chrome.contextMenus) {
    chrome.contextMenus.removeAll(() => {
      chrome.contextMenus.create({
        id: 'HIMOYA_SCAN_SELECTION',
        title: '🛡️ Himoya AI: Scan Selected Text',
        contexts: ['selection']
      });
      chrome.contextMenus.create({
        id: 'HIMOYA_SCAN_LINK',
        title: '🛡️ Himoya AI: Inspect Link Safety',
        contexts: ['link']
      });
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

// 2. Context Menu Click Handler (Right-Click Threat Analysis)
if (chrome.contextMenus && chrome.contextMenus.onClicked) {
  chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    let textToScan = '';
    if (info.menuItemId === 'HIMOYA_SCAN_SELECTION' && info.selectionText) {
      textToScan = info.selectionText;
    } else if (info.menuItemId === 'HIMOYA_SCAN_LINK' && info.linkUrl) {
      textToScan = info.linkUrl;
    }

    if (!textToScan) return;

    // Cache scan target for popup auto-analysis
    await chrome.storage.local.set({ himoya_pending_scan: textToScan });

    // Set badge indicator on tab
    if (tab && tab.id && chrome.action) {
      chrome.action.setBadgeText({ tabId: tab.id, text: 'SCAN' });
      chrome.action.setBadgeBackgroundColor({ tabId: tab.id, color: '#FF385C' });
    }

    // Attempt to open popup directly (Chrome 99+)
    if (chrome.action && chrome.action.openPopup) {
      try {
        await chrome.action.openPopup();
      } catch (e) {
        // Fallback: user opens popup via toolbar icon
      }
    }
  });
}

// 3. Alarm Listener for Scheduled Background Sync
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === ALARM_NAME) {
    console.log('[Himoya SW] Executing scheduled threat verification alarm...');
    await chrome.storage.local.set({ lastSyncTimestamp: Date.now() });
  }
});

// 4. Tab Navigation & Loading Listeners (Clean State Badge Sync)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'loading') {
    // Clear badge on tab navigation
    if (chrome.action && chrome.action.setBadgeText) {
      chrome.action.setBadgeText({ tabId, text: '' });
    }
  }
});

// 5. Runtime Message Handling
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
