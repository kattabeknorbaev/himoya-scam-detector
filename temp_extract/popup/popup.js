/**
 * Himoya Popup Controller v4.0.0
 * Modern UI interactions, segmented controls, quick sample chips, and instant scam diagnosis.
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Brand & Controls
  const masterToggle = document.getElementById('masterToggle');
  const statusDot = document.getElementById('statusDot');
  const statusText = document.getElementById('statusText');
  const threatSub = document.getElementById('threatSub');
  const threatCountBadge = document.getElementById('threatCountBadge');
  const siteDomainEl = document.getElementById('siteDomain');
  const whitelistBtn = document.getElementById('whitelistBtn');
  const statsTodayEl = document.getElementById('statsToday');
  const statsTotalEl = document.getElementById('statsTotal');
  const statsTodayLabel = document.getElementById('statsTodayLabel');
  const statsTotalLabel = document.getElementById('statsTotalLabel');
  const sensitivityLabel = document.getElementById('sensitivityLabel');
  const optStrict = document.getElementById('optStrict');
  const optBalanced = document.getElementById('optBalanced');
  const optRelaxed = document.getElementById('optRelaxed');
  const audioToggle = document.getElementById('audioToggle');
  const audioLabel = document.getElementById('audioLabel');
  const footerCopy = document.getElementById('footerCopy');
  const reportLink = document.getElementById('reportLink');

  // Language Pills
  const langPills = document.querySelectorAll('.lang-pill');

  // Navigation Tabs
  const navBtns = document.querySelectorAll('.nav-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');
  const navShield = document.getElementById('navShield');
  const navChecker = document.getElementById('navChecker');
  const navRules = document.getElementById('navRules');

  // Scanner Tab
  const checkerTitle = document.getElementById('checkerTitle');
  const checkerHint = document.getElementById('checkerHint');
  const checkerInput = document.getElementById('checkerInput');
  const checkMsgBtn = document.getElementById('checkMsgBtn');
  const checkBtnText = document.getElementById('checkBtnText');
  const checkerResult = document.getElementById('checkerResult');
  const resultBox = document.getElementById('resultBox');
  const chipBtns = document.querySelectorAll('.chip-btn');

  // Rules & Demo
  const rulesList = document.getElementById('rulesList');
  const demoBtn = document.getElementById('demoBtn');
  const demoContainer = document.getElementById('demoContainer');
  const demoPost = document.getElementById('demoPost');

  let currentDomain = '';
  let activeTabId = null;
  let currentLang = 'uz';

  // Apply Language Strings
  function applyLanguage(lang) {
    currentLang = lang;
    const str = (typeof HIMOYA_I18N !== 'undefined' && HIMOYA_I18N[lang]) ? HIMOYA_I18N[lang] : HIMOYA_I18N.uz;

    // Update active pill
    langPills.forEach(pill => {
      pill.classList.toggle('active', pill.dataset.lang === lang);
    });

    // Navigation
    if (navShield) navShield.textContent = `🛡️ ${str.extensionTitle || 'Himoya'}`;
    if (navChecker) navChecker.textContent = `⚡ ${str.checkerTab || 'Tekshirish'}`;
    if (navRules) navRules.textContent = `📖 ${str.rulesTab || 'Qoidalar'}`;

    // Status & Labels
    updateStatusDisplay(masterToggle.checked);
    statsTodayLabel.textContent = str.statsToday;
    statsTotalLabel.textContent = str.statsTotal;
    sensitivityLabel.textContent = str.sensitivityLabel;
    optStrict.textContent = str.sensitivityStrict;
    optBalanced.textContent = str.sensitivityBalanced;
    optRelaxed.textContent = str.sensitivityRelaxed;
    audioLabel.textContent = `🔔 ${str.audioAlertLabel}`;
    reportLink.textContent = str.reportLink;
    footerCopy.textContent = str.tagline;

    // Scanner
    if (checkerTitle) checkerTitle.textContent = str.checkerTab || 'Matnni tekshirish';
    if (checkerHint) checkerHint.textContent = (str.checkerPlaceholder || '').replace('...', '');
    if (checkerInput) checkerInput.placeholder = str.checkerPlaceholder;
    if (checkBtnText) checkBtnText.textContent = str.checkerBtn ? str.checkerBtn.replace('🔍 ', '') : 'Xabarni tekshirish';

    // Rules
    rulesList.innerHTML = str.rules.map(r => `
      <div class="rule-card">
        <div class="rule-heading">${escapeHtml(r.title)}</div>
        <div class="rule-body">${escapeHtml(r.desc)}</div>
      </div>
    `).join('');
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

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
        siteDomainEl.textContent = 'Brauzer sahifasi';
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
    ['himoya_enabled', 'himoya_sensitivity', 'himoya_whitelist', 'himoya_stats_today', 'himoya_stats_total', 'himoya_lang', 'himoya_audio'],
    (data) => {
      const enabled = data.himoya_enabled !== undefined ? data.himoya_enabled : true;
      const sensitivity = data.himoya_sensitivity || 'balanced';
      const whitelist = Array.isArray(data.himoya_whitelist) ? data.himoya_whitelist : [];
      const statsToday = data.himoya_stats_today || 0;
      const statsTotal = data.himoya_stats_total || 0;
      const lang = data.himoya_lang || 'uz';
      const audio = data.himoya_audio !== undefined ? data.himoya_audio : false;

      // Apply language
      applyLanguage(lang);

      // Audio
      audioToggle.checked = audio;

      // Master toggle
      masterToggle.checked = enabled;
      updateStatusDisplay(enabled);

      // Stats
      statsTodayEl.textContent = statsToday;
      statsTotalEl.textContent = statsTotal;

      // Sensitivity radio
      const matchedRadio = document.querySelector(`input[name="sensitivity"][value="${sensitivity}"]`);
      if (matchedRadio) matchedRadio.checked = true;

      // Whitelist button
      updateWhitelistButtonState(whitelist.includes(currentDomain));
    }
  );

  // 3. Query active tab for page threat count
  if (activeTabId) {
    chrome.tabs.sendMessage(activeTabId, { type: 'HIMOYA_GET_PAGE_STATUS' }, (res) => {
      if (chrome.runtime.lastError || !res) {
        threatCountBadge.textContent = '0';
        threatCountBadge.classList.remove('has-threats');
        threatSub.textContent = 'Sahifada xavf aniqlanmadi';
        return;
      }

      const count = res.count || 0;
      threatCountBadge.textContent = count.toString();
      if (count > 0) {
        threatCountBadge.classList.add('has-threats');
        threatSub.textContent = `${count} ta xavf bartaraf etildi`;
      } else {
        threatCountBadge.classList.remove('has-threats');
        threatSub.textContent = 'Sahifada xavf aniqlanmadi';
      }
    });
  }

  // Update Status Display
  function updateStatusDisplay(isEnabled) {
    const str = (typeof HIMOYA_I18N !== 'undefined' && HIMOYA_I18N[currentLang]) ? HIMOYA_I18N[currentLang] : {};
    if (isEnabled) {
      statusDot.className = 'beacon-pulse';
      statusText.textContent = str.statusActive || 'Himoya faol ishlamoqda';
    } else {
      statusDot.className = 'beacon-pulse disabled';
      statusText.textContent = str.statusDisabled || 'Himoya to\'xtatilgan';
    }
  }

  // Update Whitelist Button UI
  function updateWhitelistButtonState(isWhitelisted) {
    if (isWhitelisted) {
      whitelistBtn.textContent = 'O\'chirilgan';
      whitelistBtn.classList.add('whitelisted');
    } else {
      whitelistBtn.textContent = 'Ishonchli';
      whitelistBtn.classList.remove('whitelisted');
    }
  }

  // Event: Tabs Switching
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      navBtns.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const target = document.getElementById(btn.dataset.tab);
      if (target) target.classList.add('active');
    });
  });

  // Event: Language Switch Pills
  langPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const lang = pill.dataset.lang;
      chrome.storage.local.set({ himoya_lang: lang }, () => {
        applyLanguage(lang);
        notifyTabSettingsChanged();
      });
    });
  });

  // Event: Master Toggle Switch
  masterToggle.addEventListener('change', () => {
    const isEnabled = masterToggle.checked;
    updateStatusDisplay(isEnabled);

    chrome.storage.local.set({ himoya_enabled: isEnabled }, () => {
      notifyTabSettingsChanged();
    });
  });

  // Event: Audio Toggle
  audioToggle.addEventListener('change', () => {
    chrome.storage.local.set({ himoya_audio: audioToggle.checked }, () => {
      notifyTabSettingsChanged();
    });
  });

  // Event: Sensitivity Change
  document.querySelectorAll('input[name="sensitivity"]').forEach(input => {
    input.addEventListener('change', () => {
      chrome.storage.local.set({ himoya_sensitivity: input.value }, () => {
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

  // Quick Sample Chips Click
  chipBtns.forEach(chip => {
    chip.addEventListener('click', () => {
      checkerInput.value = chip.dataset.sample;
      runAnalysis();
    });
  });

  // Scanner Button Click
  checkMsgBtn.addEventListener('click', () => {
    runAnalysis();
  });

  function runAnalysis() {
    const text = (checkerInput.value || '').trim();
    if (!text) return;

    if (typeof analyzeContent === 'function') {
      const res = analyzeContent(text, 4.0, currentLang);
      checkerResult.style.display = 'block';

      if (res.isScam) {
        resultBox.className = 'result-card scam';
        const tagsHtml = res.categories.map(c => `<span class="res-tag">${escapeHtml(c.name)}</span>`).join('');
        const matchedKw = res.matchedKeywords.length > 0 
          ? `<div class="res-advice"><strong>Kalit belgilar:</strong> ${res.matchedKeywords.map(k => `<code>${escapeHtml(k)}</code>`).join(', ')}</div>`
          : '';

        resultBox.innerHTML = `
          <div class="res-header-row">
            <span class="res-title">🚨 XAVF: FIRIBGARLIK ANIQLANDI</span>
            <span class="res-badge high">${res.riskLevel}</span>
          </div>
          <div class="res-tags">
            ${tagsHtml}
          </div>
          ${matchedKw}
          <div class="res-advice" style="color: #9f1239; font-weight: 600; margin-top: 6px;">
            ⚠️ Hech qachon bu havolani ochmang va shaxsiy ma'lumotlaringizni kiritmang!
          </div>
        `;
      } else {
        resultBox.className = 'result-card safe';
        resultBox.innerHTML = `
          <div class="res-header-row">
            <span class="res-title" style="color: #166534;">🛡️ SHUBHALI BELGILAR TOPILMADI</span>
            <span class="res-badge safe">XAVFSIZ</span>
          </div>
          <div class="res-advice" style="color: #166534;">
            Xabarda moliyaviy firibgarlik yoki fishing alomatlari aniqlanmadi.
          </div>
        `;
      }
    }
  }

  // Event: Simulator Demo Button
  demoBtn.addEventListener('click', () => {
    demoContainer.style.display = 'block';
    if (typeof analyzeContent === 'function') {
      const sampleText = demoPost.innerText;
      const res = analyzeContent(sampleText, 4.0, currentLang);

      // Create simulator overlay
      demoPost.style.filter = 'blur(6px)';
      demoPost.style.opacity = '0.4';
      
      const str = (typeof HIMOYA_I18N !== 'undefined' && HIMOYA_I18N[currentLang]) ? HIMOYA_I18N[currentLang] : {};
      const card = document.createElement('div');
      card.style.cssText = 'background:#fff;border:1.5px solid #e11d48;border-radius:10px;padding:10px;margin-bottom:8px;font-size:11px;';
      card.innerHTML = `
        <div style="font-weight:700;color:#e11d48;margin-bottom:4px;">🛡️ ${str.cardTitle || 'Himoya: Shubhali post aniqlandi'}</div>
        <div style="font-size:10.5px;color:#475569;margin-bottom:6px;">${res.categories.map(c => c.name).join(', ')}</div>
        <button type="button" style="background:#e11d48;color:#fff;border:none;padding:5px 12px;border-radius:6px;font-weight:600;cursor:pointer;">${str.cardReveal || "Ko'rish"}</button>
      `;

      card.querySelector('button').addEventListener('click', () => {
        demoPost.style.filter = 'none';
        demoPost.style.opacity = '1';
        card.remove();
      });

      demoContainer.prepend(card);
    }
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
            threatSub.textContent = `${count} ta xavf bartaraf etildi`;
          } else {
            threatCountBadge.classList.remove('has-threats');
            threatSub.textContent = 'Sahifada xavf aniqlanmadi';
          }
        }
      });
    }
  }
});
