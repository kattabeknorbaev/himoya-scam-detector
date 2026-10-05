/**
 * Himoya Popup Controller v5.3.0
 * Cyber Dark Design System, Sliding Pill Nav, Multi-Layer ML Diagnostics, and Safe DOM Handlers.
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Elements
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

  // Navigation Tabs & Slider
  const navBtns = document.querySelectorAll('.nav-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');
  const navSlider = document.getElementById('navSlider');
  const navShield = document.getElementById('navShield');
  const navChecker = document.getElementById('navChecker');
  const navRules = document.getElementById('navRules');

  // Scanner Tab
  const checkerTitle = document.getElementById('checkerTitle');
  const checkerHint = document.getElementById('checkerHint');
  const checkerInput = document.getElementById('checkerInput');
  const clearInputBtn = document.getElementById('clearInputBtn');
  const charCounter = document.getElementById('charCounter');
  const shortcutHint = document.getElementById('shortcutHint');
  const checkMsgBtn = document.getElementById('checkMsgBtn');
  const checkBtnText = document.getElementById('checkBtnText');
  const checkerResult = document.getElementById('checkerResult');
  const resultBox = document.getElementById('resultBox');
  const copyDiagBtn = document.getElementById('copyDiagBtn');
  const copyText = document.getElementById('copyText');
  const copyIcon = document.getElementById('copyIcon');
  const chipBtns = document.querySelectorAll('.sample-chip');

  // Rules & Demo
  const rulesList = document.getElementById('rulesList');
  const demoBtn = document.getElementById('demoBtn');
  const demoContainer = document.getElementById('demoContainer');
  const demoPost = document.getElementById('demoPost');

  // Crowdsourced Intelligence Tab Elements
  const navReport = document.getElementById('navReport');
  const reportCardTitle = document.getElementById('reportCardTitle');
  const reportCardSub = document.getElementById('reportCardSub');
  const reportTypeHeader = document.getElementById('reportTypeHeader');
  const reportCategory = document.getElementById('reportCategory');
  const reportContentHeader = document.getElementById('reportContentHeader');
  const reportInput = document.getElementById('reportInput');
  const btnSubmitReport = document.getElementById('btnSubmitReport');
  const btnSubmitReportText = document.getElementById('btnSubmitReportText');
  const btnGithubIssue = document.getElementById('btnGithubIssue');
  const reportStatusBanner = document.getElementById('reportStatusBanner');
  const reportStatusText = document.getElementById('reportStatusText');
  const reportedCount = document.getElementById('reportedCount');
  const reportedCountLabel = document.getElementById('reportedCountLabel');

  let currentDomain = '';
  let activeTabId = null;
  let currentLang = 'uz';
  let lastReportText = '';
  let currentPageThreats = 0;

  // Position the sliding navigation pill
  function updateNavSlider(activeBtn) {
    if (!navSlider || !activeBtn) return;
    const parent = activeBtn.parentElement;
    if (!parent) return;
    const offsetLeft = activeBtn.offsetLeft;
    const width = activeBtn.offsetWidth;
    navSlider.style.transform = `translateX(${offsetLeft - 3}px)`;
    navSlider.style.width = `${width}px`;
  }

  // Apply Language Strings with Null Safety
  function applyLanguage(lang) {
    currentLang = lang;
    const str = (typeof HIMOYA_I18N !== 'undefined' && HIMOYA_I18N[lang]) ? HIMOYA_I18N[lang] : (HIMOYA_I18N ? HIMOYA_I18N.uz : {});

    // Update active pill styling
    langPills.forEach(pill => {
      pill.classList.toggle('active', pill.dataset.lang === lang);
    });

    // Navigation Labels (preserving vector SVG icons)
    const shieldLabel = navShield?.querySelector('.nav-btn-text');
    if (shieldLabel) shieldLabel.textContent = str.extensionTitle || 'Himoya';
    
    const checkerLabel = navChecker?.querySelector('.nav-btn-text');
    if (checkerLabel) checkerLabel.textContent = str.checkerTab || 'Tekshirish';
    
    const rulesLabel = navRules?.querySelector('.nav-btn-text');
    if (rulesLabel) rulesLabel.textContent = str.rulesTab || 'Qoidalar';

    // Update nav slider position after text change
    setTimeout(() => {
      const activeBtn = document.querySelector('.nav-btn.active');
      if (activeBtn) updateNavSlider(activeBtn);
    }, 25);

    // Status & Labels
    if (masterToggle) updateStatusDisplay(masterToggle.checked);
    if (statsTodayLabel && str.statsToday) statsTodayLabel.textContent = str.statsToday;
    if (statsTotalLabel && str.statsTotal) statsTotalLabel.textContent = str.statsTotal;
    if (sensitivityLabel && str.sensitivityLabel) sensitivityLabel.textContent = str.sensitivityLabel;
    if (optStrict && str.sensitivityStrict) optStrict.textContent = str.sensitivityStrict;
    if (optBalanced && str.sensitivityBalanced) optBalanced.textContent = str.sensitivityBalanced;
    if (optRelaxed && str.sensitivityRelaxed) optRelaxed.textContent = str.sensitivityRelaxed;
    if (audioLabel && str.audioAlertLabel) audioLabel.textContent = str.audioAlertLabel;
    
    const reportSpan = reportLink?.querySelector('span');
    if (reportSpan && str.reportLink) reportSpan.textContent = str.reportLink.replace('⚠️ ', '');
    
    if (footerCopy && str.tagline) footerCopy.textContent = str.tagline;

    // Scanner
    if (checkerTitle) checkerTitle.textContent = str.checkerTab ? 'Matnni tekshirish' : 'Matnni tekshirish';
    if (checkerHint && str.checkerPlaceholder) checkerHint.textContent = str.checkerPlaceholder.replace('...', '');
    if (checkerInput && str.checkerPlaceholder) checkerInput.placeholder = str.checkerPlaceholder;
    if (checkBtnText) checkBtnText.textContent = str.checkerBtn ? str.checkerBtn.replace('🔍 ', '') : 'Xabarni tekshirish';
    if (shortcutHint && str.shortcutHint) shortcutHint.textContent = str.shortcutHint;
    if (clearInputBtn && str.clearText) clearInputBtn.title = str.clearText;
    if (copyText && str.copyDiag) copyText.textContent = str.copyDiag;

    // Update char counter
    updateCharCounter();

    // Whitelist button
    if (whitelistBtn) {
      const isWhitelisted = whitelistBtn.classList.contains('whitelisted');
      updateWhitelistButtonState(isWhitelisted);
    }

    // Rules
    if (rulesList && str.rules) {
      rulesList.innerHTML = str.rules.map((r, idx) => `
        <div class="rule-card">
          <div class="rule-heading"><span class="rule-badge">${idx + 1}</span> ${escapeHtml(r.title)}</div>
          <div class="rule-body">${escapeHtml(r.desc)}</div>
        </div>
      `).join('');
    }

    // Crowdsourced Intelligence Strings
    const reportNavLabel = navReport?.querySelector('.nav-btn-text');
    if (reportNavLabel) reportNavLabel.textContent = str.reportTab || 'Xabar';
    if (reportCardTitle && str.reportModalTitle) reportCardTitle.textContent = str.reportModalTitle;
    if (reportTypeHeader && str.reportTypeLabel) reportTypeHeader.textContent = str.reportTypeLabel;
    if (reportContentHeader && str.reportContentLabel) reportContentHeader.textContent = str.reportContentLabel;
    if (btnSubmitReportText && str.reportSubmitBtn) btnSubmitReportText.textContent = str.reportSubmitBtn;
    if (reportStatusText && str.reportSuccess) reportStatusText.textContent = str.reportSuccess;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function updateCharCounter() {
    if (!checkerInput || !charCounter) return;
    const len = (checkerInput.value || '').length;
    const unit = currentLang === 'ru' ? 'символов' : (currentLang === 'uz_cyr' ? 'белги' : 'belgi');
    charCounter.textContent = `${len} ${unit}`;
    if (clearInputBtn) {
      clearInputBtn.style.display = len > 0 ? 'flex' : 'none';
    }
  }

  // 1. Get current active tab safely
  try {
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tabs && tabs.length > 0) {
        const tab = tabs[0];
        activeTabId = tab.id;
        const rawUrl = tab.url || tab.pendingUrl || '';

        if (rawUrl) {
          try {
            const url = new URL(rawUrl);
            if (url.protocol === 'http:' || url.protocol === 'https:') {
              currentDomain = url.hostname.toLowerCase();
              if (siteDomainEl) siteDomainEl.textContent = currentDomain;
              if (whitelistBtn) whitelistBtn.style.display = 'inline-flex';
            } else if (rawUrl.startsWith('chrome://newtab') || rawUrl.startsWith('chrome-search://') || rawUrl.startsWith('about:blank') || rawUrl.startsWith('edge://newtab')) {
              currentDomain = '';
              if (siteDomainEl) siteDomainEl.textContent = 'Yangi sahifa';
              if (whitelistBtn) whitelistBtn.style.display = 'none';
            } else if (rawUrl.startsWith('chrome://') || rawUrl.startsWith('edge://') || rawUrl.startsWith('brave://') || rawUrl.startsWith('about:')) {
              currentDomain = '';
              if (siteDomainEl) siteDomainEl.textContent = 'Brauzer sahifasi';
              if (whitelistBtn) whitelistBtn.style.display = 'none';
            } else {
              currentDomain = '';
              if (siteDomainEl) siteDomainEl.textContent = tab.title ? tab.title.slice(0, 24) : 'Faol sahifa';
              if (whitelistBtn) whitelistBtn.style.display = 'none';
            }
          } catch (e) {
            currentDomain = '';
            if (siteDomainEl) siteDomainEl.textContent = tab.title ? tab.title.slice(0, 24) : 'Faol sahifa';
            if (whitelistBtn) whitelistBtn.style.display = 'none';
          }
        } else if (tab.title && !tab.title.toLowerCase().includes('new tab') && !tab.title.toLowerCase().includes('yangi oyna') && !tab.title.toLowerCase().includes('yangi sahifa')) {
          currentDomain = '';
          if (siteDomainEl) siteDomainEl.textContent = tab.title.slice(0, 24);
          if (whitelistBtn) whitelistBtn.style.display = 'none';
        } else {
          currentDomain = '';
          if (siteDomainEl) siteDomainEl.textContent = 'Faol sahifa';
          if (whitelistBtn) whitelistBtn.style.display = 'none';
        }
      }
    }
  } catch (err) {
    currentDomain = '';
    if (siteDomainEl) siteDomainEl.textContent = 'Faol sahifa';
    if (whitelistBtn) whitelistBtn.style.display = 'none';
  }

  // 2. Load stored settings and stats
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
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
        if (audioToggle) audioToggle.checked = audio;

        // Master toggle
        if (masterToggle) {
          masterToggle.checked = enabled;
          updateStatusDisplay(enabled);
        }

        // Stats
        if (statsTodayEl) statsTodayEl.textContent = statsToday;
        if (statsTotalEl) statsTotalEl.textContent = statsTotal;

        // Sensitivity radio
        const matchedRadio = document.querySelector(`input[name="sensitivity"][value="${sensitivity}"]`);
        if (matchedRadio) matchedRadio.checked = true;

        // Whitelist button
        updateWhitelistButtonState(whitelist.includes(currentDomain));
      }
    );
  } else {
    applyLanguage('uz');
  }

  // 3. Query active tab for page threat count and verify host
  if (activeTabId && typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.sendMessage) {
    chrome.tabs.sendMessage(activeTabId, { type: 'HIMOYA_GET_PAGE_STATUS' }, (res) => {
      if (chrome.runtime.lastError || !res) {
        setThreatDisplay(0);
        return;
      }
      if (res.host && (!currentDomain || currentDomain === '')) {
        currentDomain = res.host.toLowerCase();
        if (siteDomainEl) siteDomainEl.textContent = currentDomain;
        if (whitelistBtn) whitelistBtn.style.display = 'inline-flex';
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          chrome.storage.local.get(['himoya_whitelist'], (data) => {
            const whitelist = Array.isArray(data.himoya_whitelist) ? data.himoya_whitelist : [];
            updateWhitelistButtonState(whitelist.includes(currentDomain));
          });
        }
      }
      setThreatDisplay(res.count ?? res.threatCount ?? 0);
    });
  }

  function setThreatDisplay(count) {
    currentPageThreats = count;
    const str = (typeof HIMOYA_I18N !== 'undefined' && HIMOYA_I18N[currentLang]) ? HIMOYA_I18N[currentLang] : {};
    if (threatCountBadge) {
      threatCountBadge.textContent = count.toString();
      if (count > 0) {
        threatCountBadge.classList.add('has-threats');
        if (threatSub) threatSub.textContent = (str.threatsDetected || '{count} ta xavf bartaraf etildi').replace('{count}', count);
      } else {
        threatCountBadge.classList.remove('has-threats');
        if (threatSub) threatSub.textContent = str.threatsNone || 'Sahifada xavf aniqlanmadi';
      }
    }
    if (masterToggle) {
      updateStatusDisplay(masterToggle.checked);
    }
  }

  // Update Status Display & Pulse Radar Core
  function updateStatusDisplay(isEnabled) {
    const str = (typeof HIMOYA_I18N !== 'undefined' && HIMOYA_I18N[currentLang]) ? HIMOYA_I18N[currentLang] : {};
    if (statusDot) {
      if (!isEnabled) {
        statusDot.className = 'radar-center-core disabled';
        if (statusText) statusText.textContent = str.statusDisabled || "Himoya to'xtatilgan";
      } else if (currentPageThreats > 0) {
        statusDot.className = 'radar-center-core alert';
        if (statusText) statusText.textContent = str.statusActive || 'Himoya faol ishlamoqda';
      } else {
        statusDot.className = 'radar-center-core';
        if (statusText) statusText.textContent = str.statusActive || 'Himoya faol ishlamoqda';
      }
    }
  }

  // Update Whitelist Button UI
  function updateWhitelistButtonState(isWhitelisted) {
    if (!whitelistBtn) return;
    const str = (typeof HIMOYA_I18N !== 'undefined' && HIMOYA_I18N[currentLang]) ? HIMOYA_I18N[currentLang] : {};
    const span = whitelistBtn.querySelector('span');
    if (isWhitelisted) {
      if (span) span.textContent = str.whitelistBtnTrusted || "O'chirilgan";
      whitelistBtn.classList.add('whitelisted');
    } else {
      if (span) span.textContent = str.whitelistBtnTrust || 'Ishonchli';
      whitelistBtn.classList.remove('whitelisted');
    }
  }

  // Event: Tabs Switching with Animated Slider Pill
  navBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      navBtns.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      updateNavSlider(btn);

      const target = document.getElementById(btn.dataset.tab);
      if (target) target.classList.add('active');
    });
  });

  // Initial slider position
  const initialActiveNav = document.querySelector('.nav-btn.active');
  if (initialActiveNav) {
    setTimeout(() => updateNavSlider(initialActiveNav), 50);
  }

  // Event: Language Switch Pills
  langPills.forEach(pill => {
    pill.addEventListener('click', (e) => {
      e.preventDefault();
      const lang = pill.dataset.lang;
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ himoya_lang: lang }, () => {
          applyLanguage(lang);
          notifyTabSettingsChanged();
        });
      } else {
        applyLanguage(lang);
      }
    });
  });

  // Event: Master Toggle Switch
  if (masterToggle) {
    masterToggle.addEventListener('change', () => {
      const isEnabled = masterToggle.checked;
      updateStatusDisplay(isEnabled);

      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ himoya_enabled: isEnabled }, () => {
          notifyTabSettingsChanged();
        });
      }
    });
  }

  // Event: Audio Toggle
  if (audioToggle) {
    audioToggle.addEventListener('change', () => {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ himoya_audio: audioToggle.checked }, () => {
          notifyTabSettingsChanged();
        });
      }
    });
  }

  // Event: Sensitivity Change
  document.querySelectorAll('input[name="sensitivity"]').forEach(input => {
    input.addEventListener('change', () => {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ himoya_sensitivity: input.value }, () => {
          notifyTabSettingsChanged();
        });
      }
    });
  });

  // Event: Whitelist Button Click
  if (whitelistBtn) {
    whitelistBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (!currentDomain) return;

      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
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
      }
    });
  }

  // Textarea input and clear button handlers
  if (checkerInput) {
    checkerInput.addEventListener('input', () => {
      updateCharCounter();
    });

    // Keyboard shortcut: Ctrl+Enter (or Cmd+Enter)
    checkerInput.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        runAnalysis();
      }
    });
  }

  if (clearInputBtn) {
    clearInputBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (checkerInput) {
        checkerInput.value = '';
        updateCharCounter();
        checkerInput.focus();
      }
      if (checkerResult) checkerResult.style.display = 'none';
      if (copyDiagBtn) copyDiagBtn.style.display = 'none';
    });
  }

  // Quick Sample Chips Click
  chipBtns.forEach(chip => {
    chip.addEventListener('click', (e) => {
      e.preventDefault();
      if (checkerInput) {
        checkerInput.value = chip.dataset.sample;
        updateCharCounter();
        runAnalysis();
      }
    });
  });

  // Scanner Button Click
  if (checkMsgBtn) {
    checkMsgBtn.addEventListener('click', (e) => {
      e.preventDefault();
      runAnalysis();
    });
  }

  // Copy Diagnostic Report Button Click
  if (copyDiagBtn) {
    copyDiagBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      if (!lastReportText) return;
      const str = (typeof HIMOYA_I18N !== 'undefined' && HIMOYA_I18N[currentLang]) ? HIMOYA_I18N[currentLang] : {};
      try {
        await navigator.clipboard.writeText(lastReportText);
        if (copyText) copyText.textContent = str.copied || 'Nusxalandi!';
        if (copyIcon) copyIcon.textContent = '✅';
        setTimeout(() => {
          if (copyText) copyText.textContent = str.copyDiag || 'Natijani nusxalash';
          if (copyIcon) copyIcon.textContent = '📋';
        }, 1800);
      } catch (err) {}
    });
  }

  function runAnalysis() {
    if (!checkerInput || !resultBox || !checkerResult) return;
    const text = (checkerInput.value || '').trim();
    if (!text) return;

    const str = (typeof HIMOYA_I18N !== 'undefined' && HIMOYA_I18N[currentLang]) ? HIMOYA_I18N[currentLang] : {};

    let res = null;
    if (typeof analyzeContent === 'function') {
      res = analyzeContent(text, 4.0, currentLang);
    } else if (typeof HimoyaAnalyzer !== 'undefined' && typeof HimoyaAnalyzer.analyze === 'function') {
      res = HimoyaAnalyzer.analyze(text, currentLang);
    } else {
      res = {
        isScam: false,
        riskLevel: 'SAFE',
        mlProbability: 2,
        categories: [],
        matchedKeywords: [],
        heuristics: {},
        advice: 'Tahlil yakunlandi.'
      };
    }

    checkerResult.style.display = 'block';

    if (res.isScam) {
      resultBox.className = 'result-card scam';
      const tagsHtml = res.categories.map(c => `<span class="res-tag">${escapeHtml(c.name)}</span>`).join('');
      const matchedKw = res.matchedKeywords.length > 0 
        ? `<div class="res-advice" style="margin-top:6px;font-size:11px;color:#fca5a5;"><strong>Aniqlangan belgilar:</strong> ${res.matchedKeywords.map(k => `<code style="background:rgba(255,255,255,0.1);padding:1px 4px;border-radius:3px;">${escapeHtml(k)}</code>`).join(' ')}</div>`
        : '';

      const mlBadge = res.mlProbability 
        ? `
          <div class="ml-meter-box">
            <div class="ml-meter-label">
              <span>🧠 AI / ML Modeli:</span>
              <strong>${res.mlProbability}% Firibgarlik ehtimoli</strong>
            </div>
            <div class="ml-meter-bar">
              <div class="ml-meter-fill" style="width: ${res.mlProbability}%"></div>
            </div>
          </div>
        `
        : '';

      let heuristicNotes = '';
      const notes = [];
      if (res.heuristics) {
        if (res.heuristics.baitProximity) notes.push('🎣 Yutuq va harakat bevosita bog\'langan (Bait-to-Action)');
        if (res.heuristics.urgencyIndex >= 0.4) notes.push('⏱️ Sun\'iy psixologik shoshiltirish');
        if (res.heuristics.urlRisk) notes.push('🔗 Shubhali yoki yashirin havola formati');
        if (res.heuristics.apkDetected) notes.push('📱 Xavfli .APK fayli biriktirilgan');
        if (notes.length > 0) {
          heuristicNotes = `<div class="heuristic-box"><strong>Xulq-atvor tahlili:</strong><br>${notes.map(n => `• ${escapeHtml(n)}`).join('<br>')}</div>`;
        }
      }

      resultBox.innerHTML = `
        <div class="res-header-row">
          <span class="res-title">${escapeHtml(str.checkerScam || '🚨 XAVF: FIRIBGARLIK ANIQLANDI')}</span>
          <span class="res-badge high">${res.riskLevel}</span>
        </div>
        ${mlBadge}
        <div class="res-tags">
          ${tagsHtml}
        </div>
        ${matchedKw}
        ${heuristicNotes}
        <div class="res-advice-warning">
          ⚠️ ${escapeHtml(res.advice || 'Hech qachon bu havolani ochmang va shaxsiy ma\'lumotlaringizni kiritmang!')}
        </div>
      `;

      lastReportText = `[Himoya AI Xavfsizlik Hisoboti]\nHolat: FIRIBGARLIK (${res.riskLevel})\nAI Ehtimoli: ${res.mlProbability}%\nKategoriyalar: ${res.categories.map(c => c.name).join(', ')}\nAniqlangan belgilar: ${res.matchedKeywords.join(', ')}\nMatn: "${text}"`;
      if (copyDiagBtn) copyDiagBtn.style.display = 'flex';
    } else {
      resultBox.className = 'result-card safe';
      const mlNote = res.mlProbability 
        ? `<div style="font-size:11px;color:#a7f3d0;margin-top:6px;">🧠 AI/ML Modeli: ${res.mlProbability}% ehtimol (Xavfsiz)</div>`
        : '';
      resultBox.innerHTML = `
        <div class="res-header-row">
          <span class="res-title" style="color: #6ee7b7;">${escapeHtml(str.checkerSafe || '🛡️ SHUBHALI BELGILAR TOPILMADI')}</span>
          <span class="res-badge safe">XAVFSIZ</span>
        </div>
        <div class="res-advice" style="color: #d1fae5;font-size:11.5px;">
          ${escapeHtml(str.checkerSafeDesc || 'Xabarda moliyaviy firibgarlik yoki fishing alomatlari aniqlanmadi.')}
        </div>
        ${mlNote}
      `;

      lastReportText = `[Himoya AI Xavfsizlik Hisoboti]\nHolat: XAVFSIZ\nAI Ehtimoli: ${res.mlProbability}%\nMatn: "${text}"`;
      if (copyDiagBtn) copyDiagBtn.style.display = 'flex';
    }
  }

  // Event: Crowdsourced Intelligence Submit
  if (btnSubmitReport && reportInput) {
    btnSubmitReport.addEventListener('click', (e) => {
      e.preventDefault();
      const text = (reportInput.value || '').trim();
      if (!text) {
        reportInput.style.borderColor = '#f43f5e';
        reportInput.focus();
        setTimeout(() => { reportInput.style.borderColor = ''; }, 1500);
        return;
      }

      const cat = reportCategory ? reportCategory.value : 'OTHER';
      const newReport = {
        category: cat,
        text: text,
        timestamp: new Date().toISOString()
      };

      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(['himoya_user_reports'], (data) => {
          const list = Array.isArray(data.himoya_user_reports) ? data.himoya_user_reports : [];
          list.push(newReport);
          chrome.storage.local.set({ himoya_user_reports: list }, () => {
            if (reportedCount) reportedCount.textContent = list.length.toString();
          });
        });
      }

      // Update pre-filled GitHub issue link
      if (btnGithubIssue) {
        const title = encodeURIComponent(`[Scam Report] ${cat}: ${text.slice(0, 45)}...`);
        const body = encodeURIComponent(`### Crowdsourced Threat Intelligence Report\n\n**Category:** ${cat}\n**Timestamp:** ${new Date().toUTCString()}\n\n**Suspicious Content:**\n\`\`\`\n${text}\n\`\`\`\n\n*Submitted via Himoya Scam Detector Extension*`);
        btnGithubIssue.href = `https://github.com/kattabeknorbaev/himoya-scam-detector/issues/new?title=${title}&body=${body}`;
      }

      if (reportStatusBanner) {
        reportStatusBanner.style.display = 'block';
        setTimeout(() => {
          reportStatusBanner.style.display = 'none';
        }, 4000);
      }

      reportInput.value = '';
    });
  }

  // Load initial crowdsourced count
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['himoya_user_reports'], (data) => {
      const list = Array.isArray(data.himoya_user_reports) ? data.himoya_user_reports : [];
      if (reportedCount) reportedCount.textContent = list.length.toString();
    });
  }
  }

  // Event: Simulator Demo Button
  if (demoBtn && demoContainer && demoPost) {
    demoBtn.addEventListener('click', (e) => {
      e.preventDefault();
      demoContainer.style.display = 'block';

      // Clear any prior card
      const oldCard = demoContainer.querySelector('.demo-warning-overlay');
      if (oldCard) oldCard.remove();

      if (typeof analyzeContent === 'function') {
        const sampleText = demoPost.innerText;
        const res = analyzeContent(sampleText, 4.0, currentLang);

        demoPost.style.filter = 'blur(6px)';
        demoPost.style.opacity = '0.35';
        demoPost.style.pointerEvents = 'none';
        
        const str = (typeof HIMOYA_I18N !== 'undefined' && HIMOYA_I18N[currentLang]) ? HIMOYA_I18N[currentLang] : {};
        const card = document.createElement('div');
        card.className = 'demo-warning-overlay';
        card.style.cssText = 'background:rgba(244,63,94,0.12);border:1.5px solid rgba(244,63,94,0.4);border-radius:12px;padding:12px;margin-bottom:8px;box-shadow:0 0 20px rgba(244,63,94,0.2);animation:fadeIn 0.2s ease;';
        card.innerHTML = `
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
            <strong style="font-size:12px;color:#ffffff;">🛡️ ${str.cardTitle || 'Himoya: Shubhali post aniqlandi'}</strong>
            <span style="font-size:9.5px;font-weight:800;background:#f43f5e;color:#ffffff;padding:2px 6px;border-radius:4px;">YUQORI XAVF</span>
          </div>
          <div style="font-size:11px;color:#fca5a5;margin-bottom:8px;">${res.categories.map(c => c.name).join(', ')}</div>
          <button type="button" style="background:linear-gradient(135deg,#ff385c,#e11d48);color:#ffffff;border:none;padding:5px 14px;border-radius:6px;font-size:11.5px;font-weight:700;cursor:pointer;box-shadow:0 2px 10px rgba(244,63,94,0.4);">${str.cardReveal || "👁️ Ko'rish"}</button>
        `;

        card.querySelector('button').addEventListener('click', () => {
          demoPost.style.filter = 'none';
          demoPost.style.opacity = '1';
          demoPost.style.pointerEvents = 'auto';
          card.remove();
        });

        demoContainer.prepend(card);
      }
    });
  }

  // Helper: notify active tab content script
  function notifyTabSettingsChanged() {
    if (activeTabId && typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.sendMessage) {
      chrome.tabs.sendMessage(activeTabId, { type: 'HIMOYA_SETTINGS_CHANGED' }, (response) => {
        if (!chrome.runtime.lastError && response) {
          setThreatDisplay(response.count || 0);
        }
      });
    }
  }
});
