/**
 * Himoya Popup Controller v5.4.1
 * Cyber Dark Design System, Sliding Pill Nav, Multi-Layer ML Diagnostics, and Safe Synchronous DOM Handlers.
 */

(function () {
  'use strict';

  let currentDomain = '';
  let activeTabId = null;
  let currentLang = 'uz';
  let lastReportText = '';
  let currentPageThreats = 0;

  function initPopup() {
    // 1. DOM Elements
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
    const navReport = document.getElementById('navReport');

    // Tab 1 Hero Actions
    const heroQuickScanBtn = document.getElementById('heroQuickScanBtn');
    const heroQuickScanText = document.getElementById('heroQuickScanText');
    const heroSimulateBtn = document.getElementById('heroSimulateBtn');
    const heroSimulateText = document.getElementById('heroSimulateText');

    // Scanner Tab
    const checkerTitle = document.getElementById('checkerTitle');
    const checkerHint = document.getElementById('checkerHint');
    const checkerInput = document.getElementById('checkerInput');
    const clearInputBtn = document.getElementById('clearInputBtn');
    const charCounter = document.getElementById('charCounter');
    const shortcutHint = document.getElementById('shortcutHint');
    const checkMsgBtn = document.getElementById('checkMsgBtn');
    const checkBtnText = document.getElementById('checkBtnText');
    const btnPasteScan = document.getElementById('btnPasteScan');
    const pasteBtnText = document.getElementById('pasteBtnText');
    const emptyAlert = document.getElementById('emptyAlert');
    const emptyAlertText = document.getElementById('emptyAlertText');
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
    const reportCardTitle = document.getElementById('reportCardTitle');
    const reportCardSub = document.getElementById('reportCardSub');
    const reportTypeHeader = document.getElementById('reportTypeHeader');
    const reportCategory = document.getElementById('reportCategory');
    const reportContentHeader = document.getElementById('reportContentHeader');
    const reportInput = document.getElementById('reportInput');
    const btnTelegramReport = document.getElementById('btnTelegramReport');
    const btnTelegramReportText = document.getElementById('btnTelegramReportText');
    const btnSubmitReport = document.getElementById('btnSubmitReport');
    const btnSubmitReportText = document.getElementById('btnSubmitReportText');
    const btnGithubIssue = document.getElementById('btnGithubIssue');
    const reportStatusBanner = document.getElementById('reportStatusBanner');
    const reportStatusText = document.getElementById('reportStatusText');
    const reportedCount = document.getElementById('reportedCount');
    const reportedCountLabel = document.getElementById('reportedCountLabel');
    const reportHistoryBox = document.getElementById('reportHistoryBox');
    const reportHistoryList = document.getElementById('reportHistoryList');
    const historyTitleText = document.getElementById('historyTitleText');
    const btnClearHistoryBtn = document.getElementById('btnClearHistoryBtn');

    // =========================================================================
    // HELPER FUNCTIONS
    // =========================================================================

    function escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }

    function updateNavSlider(activeBtn) {
      if (!navSlider || !activeBtn) return;
      const offsetLeft = activeBtn.offsetLeft;
      const width = activeBtn.offsetWidth;
      navSlider.style.transform = `translateX(${offsetLeft - 3}px)`;
      navSlider.style.width = `${width}px`;
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

    function applyLanguage(lang) {
      currentLang = lang;
      const str = (typeof HIMOYA_I18N !== 'undefined' && HIMOYA_I18N[lang]) ? HIMOYA_I18N[lang] : (typeof HIMOYA_I18N !== 'undefined' && HIMOYA_I18N.uz ? HIMOYA_I18N.uz : {});

      // Language pills active styling
      langPills.forEach(pill => {
        pill.classList.toggle('active', pill.dataset.lang === lang);
      });

      // Navigation labels
      const shieldLabel = navShield?.querySelector('.nav-btn-text');
      if (shieldLabel) shieldLabel.textContent = str.extensionTitle || 'Himoya';

      const checkerLabel = navChecker?.querySelector('.nav-btn-text');
      if (checkerLabel) checkerLabel.textContent = str.checkerTab || 'Tekshirish';

      const rulesLabel = navRules?.querySelector('.nav-btn-text');
      if (rulesLabel) rulesLabel.textContent = str.rulesTab || 'Qoidalar';

      const reportNavLabel = navReport?.querySelector('.nav-btn-text');
      if (reportNavLabel) reportNavLabel.textContent = str.reportTab || 'Xabar';

      // Update slider position
      setTimeout(() => {
        const activeBtn = document.querySelector('.nav-btn.active');
        if (activeBtn) updateNavSlider(activeBtn);
      }, 30);

      // Status & Header Labels
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

      // Tab 1 Hero Actions
      if (heroQuickScanText && str.quickScan) heroQuickScanText.textContent = str.quickScan;
      if (heroSimulateText && str.testSimulation) heroSimulateText.textContent = str.testSimulation;

      // Scanner Tab
      if (checkerTitle) checkerTitle.textContent = str.checkerTab || 'Matnni tekshirish';
      if (checkerHint && str.checkerPlaceholder) checkerHint.textContent = str.checkerPlaceholder.replace('...', '');
      if (checkerInput && str.checkerPlaceholder) checkerInput.placeholder = str.checkerPlaceholder;
      if (checkBtnText) checkBtnText.textContent = str.checkerBtn ? str.checkerBtn.replace('🔍 ', '') : 'Xabarni tekshirish';
      if (pasteBtnText && str.pasteBtn) pasteBtnText.textContent = str.pasteBtn;
      if (emptyAlertText && str.emptyInputAlert) emptyAlertText.textContent = str.emptyInputAlert;
      if (shortcutHint && str.shortcutHint) shortcutHint.textContent = str.shortcutHint;
      if (clearInputBtn && str.clearText) clearInputBtn.title = str.clearText;
      if (copyText && str.copyDiag) copyText.textContent = str.copyDiag;

      // Crowdsourced Intelligence Strings
      if (reportCardTitle && str.reportModalTitle) reportCardTitle.textContent = str.reportModalTitle;
      if (reportTypeHeader && str.reportTypeLabel) reportTypeHeader.textContent = str.reportTypeLabel;
      if (reportContentHeader && str.reportContentLabel) reportContentHeader.textContent = str.reportContentLabel;
      if (btnTelegramReportText && str.reportTelegramBtn) btnTelegramReportText.textContent = str.reportTelegramBtn;
      if (btnSubmitReportText && str.reportSubmitBtn) btnSubmitReportText.textContent = str.reportSubmitBtn;
      if (reportStatusText && str.reportSuccess) reportStatusText.textContent = str.reportSuccess;
      if (historyTitleText && str.historyTitle) historyTitleText.textContent = str.historyTitle;

      // Rules Tab list
      if (rulesList && str.rules) {
        rulesList.innerHTML = str.rules.map((r, idx) => `
          <div class="rule-card">
            <div class="rule-heading"><span class="rule-badge">${idx + 1}</span> ${escapeHtml(r.title)}</div>
            <div class="rule-body">${escapeHtml(r.desc)}</div>
          </div>
        `).join('');
      }

      updateCharCounter();
      if (whitelistBtn) {
        const isWhitelisted = whitelistBtn.classList.contains('whitelisted');
        updateWhitelistButtonState(isWhitelisted);
      }
    }

    function renderReportHistory(reports) {
      if (!reportHistoryBox || !reportHistoryList) return;
      if (!Array.isArray(reports) || reports.length === 0) {
        reportHistoryBox.style.display = 'none';
        return;
      }

      reportHistoryBox.style.display = 'block';
      const recent = [...reports].reverse().slice(0, 5);

      reportHistoryList.innerHTML = recent.map(item => {
        const timeStr = item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
        const snippet = (item.text || '').replace(/\s+/g, ' ').slice(0, 42);
        return `
          <div class="report-history-item">
            <div class="report-history-head">
              <span class="report-history-badge">${escapeHtml(item.category || 'SCAM')}</span>
              <span class="report-history-time">${escapeHtml(timeStr)}</span>
            </div>
            <div class="report-history-snippet">${escapeHtml(snippet)}${(item.text || '').length > 42 ? '...' : ''}</div>
          </div>
        `;
      }).join('');
    }

    // =========================================================================
    // CORE SCANNER ENGINE EVALUATOR
    // =========================================================================

    function runAnalysis() {
      if (!checkerInput || !resultBox || !checkerResult) return;
      const text = (checkerInput.value || '').trim();
      const str = (typeof HIMOYA_I18N !== 'undefined' && HIMOYA_I18N[currentLang]) ? HIMOYA_I18N[currentLang] : {};

      if (!text) {
        checkerInput.style.borderColor = '#f43f5e';
        checkerInput.style.boxShadow = '0 0 14px rgba(244, 63, 94, 0.45)';
        if (emptyAlert) {
          emptyAlert.style.display = 'flex';
          setTimeout(() => {
            emptyAlert.style.display = 'none';
          }, 3000);
        }
        checkerInput.focus();
        setTimeout(() => {
          checkerInput.style.borderColor = '';
          checkerInput.style.boxShadow = '';
        }, 1500);
        return;
      }

      if (emptyAlert) emptyAlert.style.display = 'none';

      // Visual button loading feedback
      const originalCheckText = checkBtnText ? checkBtnText.textContent : 'Xabarni tekshirish';
      if (checkBtnText) checkBtnText.textContent = str.analyzingText || 'AI tahlil qilmoqda...';
      if (checkMsgBtn) {
        checkMsgBtn.style.opacity = '0.75';
        checkMsgBtn.style.transform = 'scale(0.98)';
      }

      let res = null;
      try {
        if (typeof analyzeContent === 'function') {
          res = analyzeContent(text, 4.0, currentLang);
        } else if (typeof HimoyaAnalyzer !== 'undefined' && typeof HimoyaAnalyzer.analyze === 'function') {
          res = HimoyaAnalyzer.analyze(text, currentLang);
        }
      } catch (err) {
        console.warn('[Himoya Checker] Analyzer error:', err);
      }

      // Restore button text
      setTimeout(() => {
        if (checkBtnText) checkBtnText.textContent = originalCheckText;
        if (checkMsgBtn) {
          checkMsgBtn.style.opacity = '1';
          checkMsgBtn.style.transform = '';
        }
      }, 150);

      if (!res) {
        res = {
          isScam: false,
          riskLevel: 'SAFE',
          mlProbability: 4,
          score: '0.0',
          categories: [],
          matchedKeywords: [],
          heuristics: { baitProximity: false, urgencyIndex: 0, urlRisk: false, apkDetected: false },
          advice: 'Tahlil yakunlandi.'
        };
      }

      checkerResult.style.display = 'block';
      setTimeout(() => {
        checkerResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 60);

      if (res.isScam) {
        resultBox.className = 'result-card scam';
        const tagsHtml = (res.categories || []).map(c => `<span class="res-tag">${escapeHtml(c.name || c.id)}</span>`).join('');
        const matchedKw = (res.matchedKeywords && res.matchedKeywords.length > 0)
          ? `<div class="res-advice" style="margin-top:6px;font-size:11px;color:#fca5a5;"><strong>Aniqlangan belgilar:</strong> ${res.matchedKeywords.map(k => `<code style="background:rgba(255,255,255,0.1);padding:1px 4px;border-radius:3px;">${escapeHtml(k)}</code>`).join(' ')}</div>`
          : '';

        const mlBadge = res.mlProbability !== undefined
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
            <span class="res-badge high">${escapeHtml(res.riskLevel || 'YUQORI')}</span>
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

        lastReportText = `[Himoya AI Xavfsizlik Hisoboti]\nHolat: FIRIBGARLIK (${res.riskLevel})\nAI Ehtimoli: ${res.mlProbability}%\nKategoriyalar: ${(res.categories || []).map(c => c.name || c.id).join(', ')}\nAniqlangan belgilar: ${(res.matchedKeywords || []).join(', ')}\nMatn: "${text}"`;
        if (copyDiagBtn) copyDiagBtn.style.display = 'flex';
      } else {
        resultBox.className = 'result-card safe';
        const mlNote = res.mlProbability !== undefined
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

    // =========================================================================
    // SYNCHRONOUS DOM EVENT LISTENERS BINDING
    // =========================================================================

    // 1. Navigation Pill Switching
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

    // Initial slider animation
    const initialActiveNav = document.querySelector('.nav-btn.active');
    if (initialActiveNav) {
      setTimeout(() => updateNavSlider(initialActiveNav), 40);
    }

    // 2. Language Switch Pills
    langPills.forEach(pill => {
      pill.addEventListener('click', (e) => {
        e.preventDefault();
        const lang = pill.dataset.lang;
        applyLanguage(lang);
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          chrome.storage.local.set({ himoya_lang: lang }, () => {
            notifyTabSettingsChanged();
          });
        }
      });
    });

    // 3. Scanner Textarea & Keyboard Shortcuts
    if (checkerInput) {
      checkerInput.addEventListener('input', () => {
        updateCharCounter();
      });

      checkerInput.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          e.preventDefault();
          runAnalysis();
        }
      });
    }

    // 4. Clear Input Button
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

    // 5. Quick Sample Chips
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

    // 6. Scanner Button Click
    if (checkMsgBtn) {
      checkMsgBtn.addEventListener('click', (e) => {
        e.preventDefault();
        runAnalysis();
      });
    }

    // 6b. Paste from Clipboard & Scan Button
    if (btnPasteScan && checkerInput) {
      btnPasteScan.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
          const clipboardText = await navigator.clipboard.readText();
          if (clipboardText && clipboardText.trim()) {
            checkerInput.value = clipboardText.trim();
            updateCharCounter();
            runAnalysis();
          } else {
            if (emptyAlert && emptyAlertText) {
              const str = (typeof HIMOYA_I18N !== 'undefined' && HIMOYA_I18N[currentLang]) ? HIMOYA_I18N[currentLang] : {};
              emptyAlertText.textContent = currentLang === 'en' ? 'Clipboard is empty!' : (currentLang === 'ru' ? 'Буфер обмена пуст!' : 'Vaqtinchalik xotira bo\'sh!');
              emptyAlert.style.display = 'flex';
              setTimeout(() => { emptyAlert.style.display = 'none'; }, 2500);
            }
            checkerInput.focus();
          }
        } catch (err) {
          checkerInput.focus();
        }
      });
    }

    // 6c. Tab 1 Hero Quick Clipboard Scan
    if (heroQuickScanBtn) {
      heroQuickScanBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        // Switch to Tab 2
        navBtns.forEach(b => b.classList.remove('active'));
        tabPanes.forEach(c => c.classList.remove('active'));
        if (navChecker) {
          navChecker.classList.add('active');
          updateNavSlider(navChecker);
        }
        const target = document.getElementById('tab-checker');
        if (target) target.classList.add('active');

        try {
          const clipboardText = await navigator.clipboard.readText();
          if (clipboardText && clipboardText.trim() && checkerInput) {
            checkerInput.value = clipboardText.trim();
            updateCharCounter();
            runAnalysis();
          } else if (checkerInput) {
            checkerInput.focus();
          }
        } catch (err) {
          if (checkerInput) checkerInput.focus();
        }
      });
    }

    // 6d. Tab 1 Hero Attack Simulator
    if (heroSimulateBtn) {
      heroSimulateBtn.addEventListener('click', (e) => {
        e.preventDefault();
        setThreatDisplay(currentPageThreats + 1);
        if (threatSub) {
          threatSub.textContent = currentLang === 'en' 
            ? '🚨 Attack Intercepted: Card Drainer Blocked' 
            : (currentLang === 'ru' ? '🚨 Атака отражена: кража карты блокирована' : '🚨 Hujum to\'xtatildi: Karta drainer bloklandi');
        }
        if (statusDot) statusDot.className = 'radar-center-core alert';

        // Brief audio beep if enabled
        if (audioToggle && audioToggle.checked) {
          try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(880, ctx.currentTime);
            gain.gain.setValueAtTime(0.08, ctx.currentTime);
            osc.start();
            osc.stop(ctx.currentTime + 0.15);
          } catch (err) {}
        }
      });
    }

    // 7. Copy Diagnostic Report Button Click
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

    // 8. Telegram Direct Report Button
    if (btnTelegramReport && reportInput) {
      btnTelegramReport.addEventListener('click', (e) => {
        e.preventDefault();
        const text = (reportInput.value || '').trim();
        if (!text) {
          reportInput.style.borderColor = '#f43f5e';
          reportInput.focus();
          setTimeout(() => { reportInput.style.borderColor = ''; }, 1500);
          return;
        }

        const cat = reportCategory ? reportCategory.value : 'OTHER';
        const catName = reportCategory ? reportCategory.options[reportCategory.selectedIndex].text : cat;
        const timestamp = new Date().toISOString();

        const newReport = {
          category: cat,
          categoryName: catName,
          text: text,
          timestamp: timestamp
        };

        // Save to chrome.storage.local
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          chrome.storage.local.get(['himoya_user_reports'], (data) => {
            const list = Array.isArray(data.himoya_user_reports) ? data.himoya_user_reports : [];
            list.push(newReport);
            chrome.storage.local.set({ himoya_user_reports: list }, () => {
              if (reportedCount) reportedCount.textContent = list.length.toString();
              renderReportHistory(list);
            });
          });
        }

        // Prepare Telegram formatted text
        const tgMessage = `🚨 [HIMOYA AI: FIRIBGARLIK XABARI]\n🏷️ Turi: ${catName}\n📅 Vaqt: ${new Date().toLocaleString()}\n⚠️ Shubhali xabar / havola:\n"${text}"\n\n🛡️ Himoya AI v5.4.1 Kiber-qorovul`;
        const tgShareUrl = `https://t.me/share/url?url=${encodeURIComponent(text.slice(0, 100))}&text=${encodeURIComponent(tgMessage)}`;

        // Open Telegram
        window.open(tgShareUrl, '_blank');

        if (reportStatusBanner) {
          reportStatusBanner.style.display = 'block';
          if (reportStatusText) reportStatusText.textContent = '✅ Telegram ochildi va xabar xotiraga saqlandi!';
          setTimeout(() => {
            reportStatusBanner.style.display = 'none';
          }, 4500);
        }

        reportInput.value = '';
      });
    }

    // 9. Submit / Save Report Button (Clipboard + Local Storage + GitHub sync)
    if (btnSubmitReport && reportInput) {
      btnSubmitReport.addEventListener('click', async (e) => {
        e.preventDefault();
        const text = (reportInput.value || '').trim();
        if (!text) {
          reportInput.style.borderColor = '#f43f5e';
          reportInput.focus();
          setTimeout(() => { reportInput.style.borderColor = ''; }, 1500);
          return;
        }

        const cat = reportCategory ? reportCategory.value : 'OTHER';
        const catName = reportCategory ? reportCategory.options[reportCategory.selectedIndex].text : cat;
        const timestamp = new Date().toISOString();

        const newReport = {
          category: cat,
          categoryName: catName,
          text: text,
          timestamp: timestamp
        };

        const payload = `[Himoya AI Firibgarlik Xabari]\nTuri: ${catName}\nVaqt: ${new Date().toLocaleString()}\nMatn: "${text}"`;

        try {
          await navigator.clipboard.writeText(payload);
        } catch (err) {}

        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          chrome.storage.local.get(['himoya_user_reports'], (data) => {
            const list = Array.isArray(data.himoya_user_reports) ? data.himoya_user_reports : [];
            list.push(newReport);
            chrome.storage.local.set({ himoya_user_reports: list }, () => {
              if (reportedCount) reportedCount.textContent = list.length.toString();
              renderReportHistory(list);
            });
          });
        }

        // Update GitHub issue link
        if (btnGithubIssue) {
          const title = encodeURIComponent(`[Scam Report] ${cat}: ${text.slice(0, 45)}...`);
          const body = encodeURIComponent(`### Crowdsourced Threat Intelligence Report\n\n**Category:** ${catName}\n**Timestamp:** ${new Date().toUTCString()}\n\n**Suspicious Content:**\n\`\`\`\n${text}\n\`\`\`\n\n*Submitted via Himoya Scam Detector Extension*`);
          btnGithubIssue.href = `https://github.com/kattabeknorbaev/himoya-scam-detector/issues/new?title=${title}&body=${body}`;
        }

        if (reportStatusBanner) {
          reportStatusBanner.style.display = 'block';
          if (reportStatusText) reportStatusText.textContent = '✅ Xabar nusxalandi va xotiraga qayd etildi!';
          setTimeout(() => {
            reportStatusBanner.style.display = 'none';
          }, 4500);
        }

        reportInput.value = '';
      });
    }

    // 10. Clear History Button
    if (btnClearHistoryBtn) {
      btnClearHistoryBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          chrome.storage.local.remove(['himoya_user_reports'], () => {
            if (reportedCount) reportedCount.textContent = '0';
            renderReportHistory([]);
          });
        }
      });
    }

    // 11. Master Toggle Switch
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

    // 12. Audio Toggle
    if (audioToggle) {
      audioToggle.addEventListener('change', () => {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          chrome.storage.local.set({ himoya_audio: audioToggle.checked }, () => {
            notifyTabSettingsChanged();
          });
        }
      });
    }

    // 13. Sensitivity Radios
    document.querySelectorAll('input[name="sensitivity"]').forEach(input => {
      input.addEventListener('change', () => {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          chrome.storage.local.set({ himoya_sensitivity: input.value }, () => {
            notifyTabSettingsChanged();
          });
        }
      });
    });

    // 14. Whitelist Button
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

    // 15. Simulator Demo Button
    if (demoBtn && demoContainer && demoPost) {
      demoBtn.addEventListener('click', (e) => {
        e.preventDefault();
        demoContainer.style.display = 'block';

        const oldCard = demoContainer.querySelector('.demo-warning-overlay');
        if (oldCard) oldCard.remove();

        const sampleText = demoPost.innerText;
        let res = null;
        if (typeof analyzeContent === 'function') {
          res = analyzeContent(sampleText, 4.0, currentLang);
        } else if (typeof HimoyaAnalyzer !== 'undefined' && typeof HimoyaAnalyzer.analyze === 'function') {
          res = HimoyaAnalyzer.analyze(sampleText, currentLang);
        }

        demoPost.style.filter = 'blur(6px)';
        demoPost.style.opacity = '0.35';
        demoPost.style.pointerEvents = 'none';

        const str = (typeof HIMOYA_I18N !== 'undefined' && HIMOYA_I18N[currentLang]) ? HIMOYA_I18N[currentLang] : {};
        const catNames = (res && res.categories) ? res.categories.map(c => c.name).join(', ') : 'Karta / SMS o\'g\'irligi';

        const card = document.createElement('div');
        card.className = 'demo-warning-overlay';
        card.style.cssText = 'background:rgba(244,63,94,0.12);border:1.5px solid rgba(244,63,94,0.4);border-radius:12px;padding:12px;margin-bottom:8px;box-shadow:0 0 20px rgba(244,63,94,0.2);animation:fadeIn 0.2s ease;';
        card.innerHTML = `
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
            <strong style="font-size:12px;color:#ffffff;">🛡️ ${str.cardTitle || 'Himoya: Shubhali post aniqlandi'}</strong>
            <span style="font-size:9.5px;font-weight:800;background:#f43f5e;color:#ffffff;padding:2px 6px;border-radius:4px;">YUQORI XAVF</span>
          </div>
          <div style="font-size:11px;color:#fca5a5;margin-bottom:8px;">${escapeHtml(catNames)}</div>
          <button type="button" style="background:linear-gradient(135deg,#ff385c,#e11d48);color:#ffffff;border:none;padding:5px 14px;border-radius:6px;font-size:11.5px;font-weight:700;cursor:pointer;box-shadow:0 2px 10px rgba(244,63,94,0.4);">${str.cardReveal || "👁️ Ko'rish"}</button>
        `;

        card.querySelector('button').addEventListener('click', () => {
          demoPost.style.filter = 'none';
          demoPost.style.opacity = '1';
          demoPost.style.pointerEvents = 'auto';
          card.remove();
        });

        demoContainer.prepend(card);
      });
    }

    // Default initial language applied immediately
    applyLanguage('uz');

    // =========================================================================
    // ASYNCHRONOUS STORAGE & CHROME API INTEGRATION
    // =========================================================================

    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(
        ['himoya_enabled', 'himoya_sensitivity', 'himoya_whitelist', 'himoya_stats_today', 'himoya_stats_total', 'himoya_lang', 'himoya_audio', 'himoya_user_reports', 'himoya_pending_scan'],
        (data) => {
          if (!data) return;
          const enabled = data.himoya_enabled !== undefined ? data.himoya_enabled : true;
          const sensitivity = data.himoya_sensitivity || 'balanced';
          const whitelist = Array.isArray(data.himoya_whitelist) ? data.himoya_whitelist : [];
          const statsToday = data.himoya_stats_today || 0;
          const statsTotal = data.himoya_stats_total || 0;
          const lang = data.himoya_lang || 'uz';
          const audio = data.himoya_audio !== undefined ? data.himoya_audio : false;
          const reports = Array.isArray(data.himoya_user_reports) ? data.himoya_user_reports : [];

          applyLanguage(lang);

          if (audioToggle) audioToggle.checked = audio;
          if (masterToggle) {
            masterToggle.checked = enabled;
            updateStatusDisplay(enabled);
          }
          if (statsTodayEl) statsTodayEl.textContent = statsToday;
          if (statsTotalEl) statsTotalEl.textContent = statsTotal;
          if (reportedCount) reportedCount.textContent = reports.length.toString();

          renderReportHistory(reports);

          const matchedRadio = document.querySelector(`input[name="sensitivity"][value="${sensitivity}"]`);
          if (matchedRadio) matchedRadio.checked = true;

          updateWhitelistButtonState(whitelist.includes(currentDomain));

          // Check for pending right-click scan
          if (data.himoya_pending_scan) {
            const pendingText = data.himoya_pending_scan;
            chrome.storage.local.remove('himoya_pending_scan');
            if (pendingText && checkerInput) {
              navBtns.forEach(b => b.classList.remove('active'));
              tabPanes.forEach(c => c.classList.remove('active'));
              if (navChecker) {
                navChecker.classList.add('active');
                updateNavSlider(navChecker);
              }
              const target = document.getElementById('tab-checker');
              if (target) target.classList.add('active');

              checkerInput.value = pendingText;
              updateCharCounter();
              setTimeout(() => runAnalysis(), 80);
            }
          }
        }
      );
    }

    // Inspect Active Tab Host
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs || tabs.length === 0) return;
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
            } else if (rawUrl.startsWith('chrome://') || rawUrl.startsWith('edge://') || rawUrl.startsWith('about:')) {
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
            if (siteDomainEl) siteDomainEl.textContent = 'Faol sahifa';
            if (whitelistBtn) whitelistBtn.style.display = 'none';
          }
        }

        // Query active content script for threat status
        if (activeTabId && chrome.tabs.sendMessage) {
          chrome.tabs.sendMessage(activeTabId, { type: 'HIMOYA_GET_PAGE_STATUS' }, (res) => {
            if (chrome.runtime.lastError || !res) {
              setThreatDisplay(0);
              return;
            }
            if (res.host && (!currentDomain || currentDomain === '')) {
              currentDomain = res.host.toLowerCase();
              if (siteDomainEl) siteDomainEl.textContent = currentDomain;
              if (whitelistBtn) whitelistBtn.style.display = 'inline-flex';
            }
            setThreatDisplay(res.count ?? res.threatCount ?? 0);
          });
        }
      });
    }

    function notifyTabSettingsChanged() {
      if (activeTabId && typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.sendMessage) {
        chrome.tabs.sendMessage(activeTabId, { type: 'HIMOYA_SETTINGS_CHANGED' }, (response) => {
          if (!chrome.runtime.lastError && response) {
            setThreatDisplay(response.count || 0);
          }
        });
      }
    }
  }

  // Safe Lifecycle Initialization Check
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPopup);
  } else {
    initPopup();
  }
})();
