/**
 * Himoya Popup Controller v5.0.0
 * Smooth sliding navigation, multi-layer ML diagnostics, keyboard shortcuts, and error-safe DOM handlers.
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
  const chipBtns = document.querySelectorAll('.chip-btn');

  // Rules & Demo
  const rulesList = document.getElementById('rulesList');
  const demoBtn = document.getElementById('demoBtn');
  const demoContainer = document.getElementById('demoContainer');
  const demoPost = document.getElementById('demoPost');

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

    // Navigation
    if (navShield) navShield.textContent = `🛡️ ${str.extensionTitle || 'Himoya'}`;
    if (navChecker) navChecker.textContent = `⚡ ${str.checkerTab || 'Tekshirish'}`;
    if (navRules) navRules.textContent = `📖 ${str.rulesTab || 'Qoidalar'}`;

    // Update nav slider position after text change
    setTimeout(() => {
      const activeBtn = document.querySelector('.nav-btn.active');
      if (activeBtn) updateNavSlider(activeBtn);
    }, 20);

    // Status & Labels
    if (masterToggle) updateStatusDisplay(masterToggle.checked);
    if (statsTodayLabel && str.statsToday) statsTodayLabel.textContent = str.statsToday;
    if (statsTotalLabel && str.statsTotal) statsTotalLabel.textContent = str.statsTotal;
    if (sensitivityLabel && str.sensitivityLabel) sensitivityLabel.textContent = str.sensitivityLabel;
    if (optStrict && str.sensitivityStrict) optStrict.textContent = str.sensitivityStrict;
    if (optBalanced && str.sensitivityBalanced) optBalanced.textContent = str.sensitivityBalanced;
    if (optRelaxed && str.sensitivityRelaxed) optRelaxed.textContent = str.sensitivityRelaxed;
    if (audioLabel && str.audioAlertLabel) audioLabel.textContent = `🔔 ${str.audioAlertLabel}`;
    if (reportLink && str.reportLink) reportLink.textContent = str.reportLink;
    if (footerCopy && str.tagline) footerCopy.textContent = str.tagline;

    // Scanner
    if (checkerTitle) checkerTitle.textContent = str.checkerTab ? `Matnni tekshirish` : 'Matnni tekshirish';
    if (checkerHint && str.checkerPlaceholder) checkerHint.textContent = str.checkerPlaceholder.replace('...', '');
    if (checkerInput && str.checkerPlaceholder) checkerInput.placeholder = str.checkerPlaceholder;
    if (checkBtnText) checkBtnText.textContent = str.checkerBtn || 'Xabarni tekshirish';
    if (shortcutHint && str.shortcutHint) shortcutHint.textContent = str.shortcutHint;
    if (clearInputBtn && str.clearText) clearInputBtn.title = str.clearText;
    if (copyText && str.copyDiag) copyText.textContent = str.copyDiag;

    // Update char counter
    updateCharCounter();

    // Rules
    if (rulesList && str.rules) {
      rulesList.innerHTML = str.rules.map((r, idx) => `
        <div class="rule-card">
          <div class="rule-heading"><span class="rule-badge">${idx + 1}</span> ${escapeHtml(r.title)}</div>
          <div class="rule-body">${escapeHtml(r.desc)}</div>
        </div>
      `).join('');
    }
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
      if (tabs && tabs.length > 0 && tabs[0].url) {
        activeTabId = tabs[0].id;
        const url = new URL(tabs[0].url);
        if (url.protocol.startsWith('http')) {
          currentDomain = url.hostname.toLowerCase();
          if (siteDomainEl) siteDomainEl.textContent = currentDomain;
        } else {
          if (siteDomainEl) siteDomainEl.textContent = 'Brauzer sahifasi';
          if (whitelistBtn) whitelistBtn.style.display = 'none';
        }
      }
    }
  } catch (err) {
    if (siteDomainEl) siteDomainEl.textContent = 'Mavjud emas';
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

  // 3. Query active tab for page threat count
  if (activeTabId && typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.sendMessage) {
    chrome.tabs.sendMessage(activeTabId, { type: 'HIMOYA_GET_PAGE_STATUS' }, (res) => {
      if (chrome.runtime.lastError || !res) {
        setThreatDisplay(0);
        return;
      }
      setThreatDisplay(res.count || 0);
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

  // Update Status Display & Pulse Beacon
  function updateStatusDisplay(isEnabled) {
    const str = (typeof HIMOYA_I18N !== 'undefined' && HIMOYA_I18N[currentLang]) ? HIMOYA_I18N[currentLang] : {};
    if (statusDot) {
      if (!isEnabled) {
        statusDot.className = 'beacon-pulse disabled';
        if (statusText) statusText.textContent = str.statusDisabled || "Himoya to'xtatilgan";
      } else if (currentPageThreats > 0) {
        statusDot.className = 'beacon-pulse alert';
        if (statusText) statusText.textContent = str.statusActive || 'Himoya faol ishlamoqda';
      } else {
        statusDot.className = 'beacon-pulse';
        if (statusText) statusText.textContent = str.statusActive || 'Himoya faol ishlamoqda';
      }
    }
  }

  // Update Whitelist Button UI
  function updateWhitelistButtonState(isWhitelisted) {
    if (!whitelistBtn) return;
    const str = (typeof HIMOYA_I18N !== 'undefined' && HIMOYA_I18N[currentLang]) ? HIMOYA_I18N[currentLang] : {};
    if (isWhitelisted) {
      whitelistBtn.textContent = str.whitelistBtnTrusted || "O'chirilgan";
      whitelistBtn.classList.add('whitelisted');
    } else {
      whitelistBtn.textContent = str.whitelistBtnTrust || 'Ishonchli';
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

    if (typeof analyzeContent === 'function') {
      const res = analyzeContent(text, 4.0, currentLang);
      checkerResult.style.display = 'block';

      if (res.isScam) {
        resultBox.className = 'result-card scam';
        const tagsHtml = res.categories.map(c => `<span class="res-tag">${escapeHtml(c.name)}</span>`).join('');
        const matchedKw = res.matchedKeywords.length > 0 
          ? `<div class="res-advice" style="margin-top:6px;"><strong>Aniqlangan belgilar:</strong> ${res.matchedKeywords.map(k => `<code>${escapeHtml(k)}</code>`).join(' ')}</div>`
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
            ⚠️ Hech qachon bu havolani ochmang va shaxsiy ma'lumotlaringizni kiritmang!
          </div>
        `;

        lastReportText = `[Himoya AI Xavfsizlik Hisoboti]\nHolat: FIRIBGARLIK (${res.riskLevel})\nAI Ehtimoli: ${res.mlProbability}%\nKategoriyalar: ${res.categories.map(c => c.name).join(', ')}\nAniqlangan belgilar: ${res.matchedKeywords.join(', ')}\nMatn: "${text}"`;
        if (copyDiagBtn) copyDiagBtn.style.display = 'flex';
      } else {
        resultBox.className = 'result-card safe';
        const mlNote = res.mlProbability 
          ? `<div style="font-size:11px;color:#166534;margin-top:4px;">🧠 AI/ML Modeli: ${res.mlProbability}% ehtimol (Xavfsiz)</div>`
          : '';
        resultBox.innerHTML = `
          <div class="res-header-row">
            <span class="res-title" style="color: #166534;">${escapeHtml(str.checkerSafe || '🛡️ SHUBHALI BELGILAR TOPILMADI')}</span>
            <span class="res-badge safe">XAVFSIZ</span>
          </div>
          <div class="res-advice" style="color: #166534;">
            ${escapeHtml(str.checkerSafeDesc || 'Xabarda moliyaviy firibgarlik yoki fishing alomatlari aniqlanmadi.')}
          </div>
          ${mlNote}
        `;

        lastReportText = `[Himoya AI Xavfsizlik Hisoboti]\nHolat: XAVFSIZ\nAI Ehtimoli: ${res.mlProbability}%\nMatn: "${text}"`;
        if (copyDiagBtn) copyDiagBtn.style.display = 'flex';
      }
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
        card.style.cssText = 'background:#ffffff;border:1.5px solid #e11d48;border-radius:12px;padding:12px;margin-bottom:8px;box-shadow:0 4px 14px rgba(225,29,72,0.15);animation:fadeIn 0.2s ease;';
        card.innerHTML = `
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
            <strong style="font-size:12px;color:#0f172a;">🛡️ ${str.cardTitle || 'Himoya: Shubhali post aniqlandi'}</strong>
            <span style="font-size:10px;font-weight:800;background:#ffe4e6;color:#e11d48;padding:2px 6px;border-radius:4px;">YUQORI XAVF</span>
          </div>
          <div style="font-size:11px;color:#475569;margin-bottom:8px;">${res.categories.map(c => c.name).join(', ')}</div>
          <button type="button" style="background:linear-gradient(135deg,#e11d48,#be123c);color:#fff;border:none;padding:5px 14px;border-radius:6px;font-size:11.5px;font-weight:700;cursor:pointer;">${str.cardReveal || "👁️ Ko'rish"}</button>
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
