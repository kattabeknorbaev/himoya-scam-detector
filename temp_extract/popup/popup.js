/**
 * Himoya Popup Controller v3.0.0
 * Connects UI elements with chrome.storage.local and current tab content script.
 */

document.addEventListener('DOMContentLoaded', async () => {
  const masterToggle = document.getElementById('masterToggle');
  const statusDot = document.getElementById('statusDot');
  const statusText = document.getElementById('statusText');
  const threatCountBadge = document.getElementById('threatCountBadge');
  const siteDomainEl = document.getElementById('siteDomain');
  const whitelistBtn = document.getElementById('whitelistBtn');
  const statsTodayEl = document.getElementById('statsToday');
  const statsTotalEl = document.getElementById('statsTotal');
  const sensitivityInputs = document.querySelectorAll('input[name="sensitivity"]');

  let currentDomain = '';
  let activeTabId = null;

  // 1. Get current active tab
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs && tabs.length > 0 && tabs[0].url) {
      activeTabId = tabs[0].id;
      const url = new URL(tabs[0].url);
      if (url.protocol.startsWith('http')) {
        currentDomain = url.hostname.toLowerCase();
        siteDomainEl.textContent = currentDomain;
      } else {
        siteDomainEl.textContent = 'Brauzer maxsus sahifasi';
        whitelistBtn.style.display = 'none';
      }
    } else {
      siteDomainEl.textContent = 'Sahifa aniqlanmadi';
      whitelistBtn.style.display = 'none';
    }
  } catch (err) {
    siteDomainEl.textContent = 'Mavjud emas';
    whitelistBtn.style.display = 'none';
  }

  // 2. Load stored settings and stats
  chrome.storage.local.get(
    ['himoya_enabled', 'himoya_sensitivity', 'himoya_whitelist', 'himoya_stats_today', 'himoya_stats_total'],
    (data) => {
      const enabled = data.himoya_enabled !== undefined ? data.himoya_enabled : true;
      const sensitivity = data.himoya_sensitivity || 'balanced';
      const whitelist = Array.isArray(data.himoya_whitelist) ? data.himoya_whitelist : [];
      const statsToday = data.himoya_stats_today || 0;
      const statsTotal = data.himoya_stats_total || 0;

      // Update toggle & status
      masterToggle.checked = enabled;
      updateStatusDisplay(enabled);

      // Update stats
      statsTodayEl.textContent = statsToday;
      statsTotalEl.textContent = statsTotal;

      // Update sensitivity radio
      const matchedRadio = document.querySelector(`input[name="sensitivity"][value="${sensitivity}"]`);
      if (matchedRadio) matchedRadio.checked = true;

      // Update whitelist button
      updateWhitelistButtonState(whitelist.includes(currentDomain));
    }
  );

  // 3. Query active tab for page threat count
  if (activeTabId) {
    chrome.tabs.sendMessage(activeTabId, { type: 'HIMOYA_GET_PAGE_STATUS' }, (res) => {
      if (chrome.runtime.lastError || !res) {
        threatCountBadge.textContent = '0';
        threatCountBadge.classList.remove('has-threats');
        return;
      }

      const count = res.count || 0;
      threatCountBadge.textContent = count.toString();
      if (count > 0) {
        threatCountBadge.classList.add('has-threats');
      } else {
        threatCountBadge.classList.remove('has-threats');
      }
    });
  }

  // Update Status Display
  function updateStatusDisplay(isEnabled) {
    if (isEnabled) {
      statusDot.className = 'status-dot active';
      statusText.textContent = 'Himoya faol ishlamoqda';
    } else {
      statusDot.className = 'status-dot disabled';
      statusText.textContent = 'Himoya to\'xtatilgan';
    }
  }

  // Update Whitelist Button UI
  function updateWhitelistButtonState(isWhitelisted) {
    if (isWhitelisted) {
      whitelistBtn.textContent = '⚠️ Ushbu sayt uchun himoyani yoqish';
      whitelistBtn.classList.add('whitelisted');
    } else {
      whitelistBtn.textContent = '🛡️ Bu saytni ishonchli deb belgilash';
      whitelistBtn.classList.remove('whitelisted');
    }
  }

  // Event: Master Toggle Switch
  masterToggle.addEventListener('change', () => {
    const isEnabled = masterToggle.checked;
    updateStatusDisplay(isEnabled);

    chrome.storage.local.set({ himoya_enabled: isEnabled }, () => {
      notifyTabSettingsChanged();
    });
  });

  // Event: Sensitivity Change
  sensitivityInputs.forEach(input => {
    input.addEventListener('change', () => {
      const selected = input.value;
      chrome.storage.local.set({ himoya_sensitivity: selected }, () => {
        notifyTabSettingsChanged();
      });
    });
  });

  // Event: Whitelist Button Click
  whitelistBtn.addEventListener('click', () => {
    if (!currentDomain) return;

    chrome.storage.local.get(['himoya_whitelist'], (res) => {
      let list = Array.isArray(res.himoya_whitelist) ? [...res.himoya_whitelist] : [];
      const index = list.indexOf(currentDomain);

      if (index === -1) {
        list.push(currentDomain);
        updateWhitelistButtonState(true);
      } else {
        list.splice(index, 1);
        updateWhitelistButtonState(false);
      }

      chrome.storage.local.set({ himoya_whitelist: list }, () => {
        notifyTabSettingsChanged();
      });
    });
  });

  // Helper: notify active tab content script
  function notifyTabSettingsChanged() {
    if (activeTabId) {
      chrome.tabs.sendMessage(activeTabId, { type: 'HIMOYA_SETTINGS_CHANGED' }, (response) => {
        if (!chrome.runtime.lastError && response) {
          const count = response.count || 0;
          threatCountBadge.textContent = count.toString();
          if (count > 0) {
            threatCountBadge.classList.add('has-threats');
          } else {
            threatCountBadge.classList.remove('has-threats');
          }
        }
      });
    }
  }
});
