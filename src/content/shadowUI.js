/**
 * Himoya UI Encapsulation & Closed Shadow DOM Engine
 * Mounts tamper-proof, style-isolated threat alerts and warning banners
 * without leaking CSS or raw DOM elements into host SPAs (Telegram Web, Facebook, Instagram).
 */

(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.HimoyaShadowUI = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Category display names in Uzbek & Russian
  const CATEGORY_LABELS = {
    CARD_DRAINER: 'Plastik karta va CVV kod o\'g\'irligi',
    OTP_THEFT: 'SMS tasdiqlash kodini o\'g\'irlash',
    FAKE_SUBSIDY: 'Soxta davlat kompensatsiyasi',
    APK_DROPPER: 'Zararli APK troyan fayli',
    PONZI_MULTIPLIER: 'Moliyaviy piramida / Ko\'paytirish',
    TASK_BRUSHING: 'Soxta layk bosish sxemasi',
    TRANSIT_ACCOUNT_PANIC: 'Ma\'lumotlar sizishi / Tranzit hisob',
    ESCROW_DELIVERY: 'Soxta yetkazib berish havolasi',
    TELEGRAM_HIJACK: 'Telegram profilni o\'g\'irlash',
    VISA_UMRA_FRAUD: 'Soxta Umra / Viza firibgarligi',
    GENERIC_SUSPICIOUS: 'Shubhali xabar'
  };

  const ADVICE_GUIDES = {
    CARD_DRAINER: 'Hech qachon 16 xonali karta raqami, amal qilish muddati va CVV kodini begona saytlarga kiritmang.',
    OTP_THEFT: 'Hech qachon telefoningizga kelgan 5 yoki 6 xonali SMS tasdiqlash kodini (OTP) hech kimga aytmang!',
    FAKE_SUBSIDY: 'Hukumat yoki prezident nomidan tarqatilayotgan yordam pullari yolg\'on. Rasmiy manba: my.gov.uz.',
    APK_DROPPER: 'Noma\'lum shaxslardan kelgan fayllarni (.apk) aslo yuklab olmang va ochmang! Bu bank kartangizni o\'g\'irlaydi.',
    TRANSIT_ACCOUNT_PANIC: 'Banklar hech qachon "tranzit" yoki "xavfsiz" hisobga pul o\'tkazishni so\'ramaydi. Bu firibgarlik!',
    ESCROW_DELIVERY: 'Click yoki Payme xizmatlarida pul qabul qilish uchun karta kodini kiritish talab qilinmaydi.',
    TELEGRAM_HIJACK: 'Tanlovda ovoz berish uchun Telegram-dan kelgan kodni so\'rashmoqdami? Bu akkauntingizni o\'g\'irlash.',
    TASK_BRUSHING: 'Layk bosish evaziga pul to\'lashni va\'da qilib, depozit so\'rash — klassik piramidadir.',
    PONZI_MULTIPLIER: 'Pulni bir necha soatda 2-3 barobar qilib beruvchi hech qanday qonuniy tizim mavjud emas.'
  };

  /**
   * Generates Shadow DOM stylesheet
   */
  function getShadowStyles(riskLevel) {
    const isCritical = riskLevel === 'CRITICAL';
    const isHigh = riskLevel === 'HIGH';

    const accentColor = isCritical ? '#FF385C' : isHigh ? '#F59E0B' : '#06B6D4';
    const accentBg = isCritical ? 'rgba(255, 56, 92, 0.12)' : isHigh ? 'rgba(245, 158, 11, 0.12)' : 'rgba(6, 182, 212, 0.12)';
    const borderColor = isCritical ? 'rgba(255, 56, 92, 0.35)' : isHigh ? 'rgba(245, 158, 11, 0.35)' : 'rgba(6, 182, 212, 0.35)';

    return `
      :host {
        display: block !important;
        margin: 10px 0 !important;
        width: 100% !important;
        box-sizing: border-box !important;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
        font-size: 13px !important;
        line-height: 1.45 !important;
        color: #F8FAFC !important;
      }

      * {
        box-sizing: border-box !important;
        margin: 0;
        padding: 0;
      }

      .himoya-banner {
        background: #080C14 !important;
        background: linear-gradient(135deg, #0A0F1D 0%, #080C14 100%) !important;
        border: 1px solid ${borderColor} !important;
        border-left: 4px solid ${accentColor} !important;
        border-radius: 10px !important;
        padding: 12px 14px !important;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45) !important;
        backdrop-filter: blur(16px) !important;
        transition: all 0.25s ease !important;
      }

      .banner-header {
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        gap: 8px !important;
        margin-bottom: 6px !important;
      }

      .banner-title-area {
        display: flex !important;
        align-items: center !important;
        gap: 8px !important;
        font-weight: 700 !important;
        font-size: 13px !important;
        color: #FFFFFF !important;
      }

      .shield-icon {
        width: 18px !important;
        height: 18px !important;
        fill: ${accentColor} !important;
        flex-shrink: 0 !important;
      }

      .risk-pill {
        display: inline-flex !important;
        align-items: center !important;
        padding: 2px 7px !important;
        border-radius: 9999px !important;
        font-size: 10px !important;
        font-weight: 800 !important;
        letter-spacing: 0.5px !important;
        text-transform: uppercase !important;
        background: ${accentBg} !important;
        color: ${accentColor} !important;
        border: 1px solid ${borderColor} !important;
      }

      .banner-desc {
        color: #94A3B8 !important;
        font-size: 12px !important;
        margin-bottom: 8px !important;
      }

      .advice-box {
        background: rgba(255, 255, 255, 0.04) !important;
        border: 1px dashed rgba(255, 255, 255, 0.12) !important;
        border-radius: 6px !important;
        padding: 6px 10px !important;
        margin-bottom: 10px !important;
        font-size: 11.5px !important;
        color: #E2E8F0 !important;
      }

      .advice-box strong {
        color: ${accentColor} !important;
      }

      .indicators-row {
        display: flex !important;
        flex-wrap: wrap !important;
        gap: 5px !important;
        margin-bottom: 10px !important;
      }

      .indicator-tag {
        background: rgba(255, 255, 255, 0.06) !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        border-radius: 4px !important;
        padding: 2px 6px !important;
        font-size: 10.5px !important;
        color: #CBD5E1 !important;
        font-family: monospace !important;
      }

      .actions-row {
        display: flex !important;
        align-items: center !important;
        justify-content: flex-end !important;
        gap: 8px !important;
      }

      .btn {
        appearance: none !important;
        border: none !important;
        outline: none !important;
        cursor: pointer !important;
        font-size: 11.5px !important;
        font-weight: 600 !important;
        padding: 5px 11px !important;
        border-radius: 6px !important;
        transition: all 0.2s ease !important;
      }

      .btn-ghost {
        background: transparent !important;
        color: #94A3B8 !important;
      }

      .btn-ghost:hover {
        background: rgba(255, 255, 255, 0.08) !important;
        color: #FFFFFF !important;
      }

      .btn-action {
        background: rgba(255, 255, 255, 0.1) !important;
        border: 1px solid rgba(255, 255, 255, 0.15) !important;
        color: #F8FAFC !important;
      }

      .btn-action:hover {
        background: rgba(255, 255, 255, 0.18) !important;
      }
    `;
  }

  /**
   * Encapsulates a flagged DOM element in a Closed Shadow DOM boundary.
   * Keeps target content blurred by default while presenting professional institutional guidance.
   *
   * @param {HTMLElement} targetElement The SPA message/post DOM element
   * @param {Object} threatResult Output from AhoCorasick engine
   * @param {Function} [onWhitelist] Callback when user whitelists domain
   * @param {Function} [onDismiss] Callback when user dismisses alert
   * @returns {HTMLElement|null} The created custom shadow host element
   */
  function mountThreatBanner(targetElement, threatResult, onWhitelist, onDismiss) {
    if (!targetElement || !targetElement.parentNode) return null;

    // Check if already mounted
    if (targetElement.__himoyaMounted) return null;
    targetElement.__himoyaMounted = true;

    const riskLevel = threatResult.riskLevel || 'HIGH';
    const primaryCat = threatResult.categories && threatResult.categories[0]
      ? threatResult.categories[0].category
      : 'GENERIC_SUSPICIOUS';

    const catLabel = CATEGORY_LABELS[primaryCat] || primaryCat;
    const adviceText = ADVICE_GUIDES[primaryCat] || 'Ushbu xabarda shubhali firibgarlik belgilari mavjud.';

    // Create the isolated custom host element
    const hostEl = document.createElement('himoya-shield-host');
    hostEl.setAttribute('data-himoya-threat', primaryCat);
    hostEl.setAttribute('data-risk', riskLevel);

    // Attach CLOSED Shadow Root to completely block host script access and style leakage
    const shadowRoot = hostEl.attachShadow({ mode: 'closed' });

    // Apply inline blur filter to host target element non-destructively
    let isRevealed = false;
    const originalFilter = targetElement.style.filter || '';
    const originalTransition = targetElement.style.transition || '';
    targetElement.style.transition = 'filter 0.3s ease';
    targetElement.style.filter = 'blur(9px)';
    targetElement.style.pointerEvents = 'none';

    // Build internal Shadow DOM markup
    const styleEl = document.createElement('style');
    styleEl.textContent = getShadowStyles(riskLevel);

    const bannerEl = document.createElement('div');
    bannerEl.className = 'himoya-banner';

    // Tokens list
    const matchedTokens = (threatResult.matches || []).slice(0, 5).map(m => m.token);
    const tokensHtml = matchedTokens.map(t => `<span class="indicator-tag">${t}</span>`).join('');

    bannerEl.innerHTML = `
      <div class="banner-header">
        <div class="banner-title-area">
          <svg class="shield-icon" viewBox="0 0 24 24">
            <path d="M12 2L3 6v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V6l-9-4z"/>
          </svg>
          <span>Himoya: ${catLabel}</span>
          <span class="risk-pill">${riskLevel}</span>
        </div>
      </div>

      <div class="banner-desc">
        Ushbu xabar moliyaviy firibgarlik ehtimoli yuqori deb topildi.
      </div>

      <div class="advice-box">
        <strong>Xavfsizlik qoidasi:</strong> ${adviceText}
      </div>

      ${matchedTokens.length > 0 ? `<div class="indicators-row">${tokensHtml}</div>` : ''}

      <div class="actions-row">
        <button type="button" class="btn btn-ghost" id="btnWhitelist">Oq ro'yxat</button>
        <button type="button" class="btn btn-action" id="btnToggle">Xabarni ko'rish</button>
      </div>
    `;

    shadowRoot.appendChild(styleEl);
    shadowRoot.appendChild(bannerEl);

    // Event Listeners inside Shadow DOM
    const btnToggle = shadowRoot.getElementById('btnToggle');
    const btnWhitelist = shadowRoot.getElementById('btnWhitelist');

    btnToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      isRevealed = !isRevealed;
      if (isRevealed) {
        targetElement.style.filter = originalFilter;
        targetElement.style.pointerEvents = 'auto';
        btnToggle.textContent = 'Qayta yashirish';
      } else {
        targetElement.style.filter = 'blur(9px)';
        targetElement.style.pointerEvents = 'none';
        btnToggle.textContent = 'Xabarni ko\'rish';
      }
    });

    btnWhitelist.addEventListener('click', (e) => {
      e.stopPropagation();
      targetElement.style.filter = originalFilter;
      targetElement.style.pointerEvents = 'auto';
      hostEl.remove();
      targetElement.__himoyaMounted = false;
      if (typeof onWhitelist === 'function') {
        onWhitelist(primaryCat);
      }
    });

    // Safely insert hostEl as a sibling before the targetElement without reparenting
    targetElement.parentNode.insertBefore(hostEl, targetElement);

    return hostEl;
  }

  return {
    mountThreatBanner,
    CATEGORY_LABELS,
    ADVICE_GUIDES
  };
});
