/**
 * Himoya Behavioral & Social Engineering Heuristics v4.0.0
 * Analyzes psychological manipulation vectors, obfuscation entropy, and URL infrastructure.
 */

(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.HimoyaHeuristics = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {

  // Leetspeak symbol map (leave pure Cyrillic intact!)
  const LEET_MAP = {
    '@': 'a', '$': 's', '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't'
  };

  const SUSPICIOUS_TLDS = /\.(xyz|top|tk|ml|ga|cf|gq|buzz|cfd|vip|icu|rest|click|cc|work|fun)\b/i;
  const URL_SHORTENERS = /\b(?:bit\.ly|tinyurl\.com|cutt\.ly|is\.gd|clck\.ru|rb\.gy|t\.me\/\+[a-zA-Z0-9_-]+|t\.me\/[a-zA-Z0-9_]+_bot)\b/i;

  /**
   * Normalizes leetspeak symbols and intra-word separators without breaking Cyrillic
   */
  function deobfuscate(text) {
    if (!text) return '';
    return text
      // Replace intra-word dots/dashes e.g. "p.u.l" -> "pul", "s-m-s" -> "sms"
      .replace(/\b([a-zA-Zа-яА-ЯёЁ])[\.\-]([a-zA-Zа-яА-ЯёЁ])[\.\-]([a-zA-Zа-яА-ЯёЁ])\b/g, '$1$2$3')
      .split('')
      .map(char => LEET_MAP[char] || char)
      .join('');
  }

  /**
   * Calculates psychological urgency & pressure index (0.0 to 1.0)
   */
  function calculateUrgencyIndex(text) {
    if (!text) return 0.0;
    let score = 0;

    // Exclamation mark clustering
    const exclamations = (text.match(/!{1,}/g) || []).length;
    score += Math.min(exclamations * 0.15, 0.4);

    // All-Caps shouting words (> 3 chars)
    const words = text.split(/\s+/);
    const shoutingWords = words.filter(w => w.length >= 4 && w === w.toUpperCase() && /[A-ZА-Я]/.test(w));
    if (shoutingWords.length >= 2) score += 0.3;

    // Time-constraint terms
    if (/\b(?:shoshil\w*|oxirgi\s*(?:kun|soat|imkoniyat)|faqat\s*bugun|vaqt\s*oz|шошил\w*|срочно|торопитесь)\b/i.test(text)) {
      score += 0.35;
    }

    return parseFloat(Math.min(score, 1.0).toFixed(2));
  }

  /**
   * Measures token distance between Incentive (Money/Prize) and Action (CTA/Link)
   */
  function calculateBaitActionDistance(text) {
    if (!text) return { hasProximity: false, distance: 99 };
    const tokens = text.toLowerCase().split(/\s+/);

    const baitRegex = /\b(?:yut(?:ib|uq|dingiz)?|sovg['ʻ’`]?a|5\s*mln|1000\$|pul|даромад|пул|ютуқ|daromad|kompensatsiya|prezident|ovoz|layk|senmisan)\b/i;
    const actionRegex = /\b(?:link\w*|havola\w*|sayt\w*|bot\w*|ҳавола\w*|бос\w*|bos(?:ing)?|kir(?:ing)?|yubor(?:ing)?|kod|смс|парол|parol|apk|yuklab)\b/i;

    let baitIndex = -1;
    let actionIndex = -1;

    for (let i = 0; i < tokens.length; i++) {
      if (baitIndex === -1 && baitRegex.test(tokens[i])) baitIndex = i;
      if (actionIndex === -1 && actionRegex.test(tokens[i])) actionIndex = i;
      if (baitIndex !== -1 && actionIndex !== -1) break;
    }

    if (baitIndex !== -1 && actionIndex !== -1) {
      const distance = Math.abs(actionIndex - baitIndex);
      return {
        hasProximity: distance <= 8,
        distance
      };
    }

    return { hasProximity: false, distance: 99 };
  }

  /**
   * Analyzes URLs, TLDs, Shorteners, APKs, and Bots for infrastructure risk
   */
  function analyzeUrlRisk(text) {
    if (!text) return { hasSuspiciousUrl: false, reasons: [] };

    const reasons = [];
    if (URL_SHORTENERS.test(text)) {
      reasons.push('Yashirin qisqa havola yoki notanish bot (URL shortener / bot)');
    }
    if (SUSPICIOUS_TLDS.test(text)) {
      reasons.push('Xavfli bepul domen (.xyz/.top/.click)');
    }
    if (/\b(?:https?:\/\/)?\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/.test(text)) {
      reasons.push('To\'g\'ridan-to\'g\'ri IP manzil havolasi');
    }
    if (/\b[a-zA-Z0-9_\-\.]+\.apk\b/i.test(text) || /\b(?:apk\s*fayl|apk\s*ilova)\b/i.test(text)) {
      reasons.push('Shubhali Android APK virus fayli');
    }

    return {
      hasSuspiciousUrl: reasons.length > 0,
      reasons
    };
  }

  /**
   * Evaluates total heuristic risk
   */
  function evaluate(rawText) {
    const cleanText = deobfuscate(rawText);
    const urgency = calculateUrgencyIndex(rawText);
    const proximity = calculateBaitActionDistance(cleanText);
    const urlRisk = analyzeUrlRisk(rawText);

    let heuristicScore = 0;
    if (urgency >= 0.5) heuristicScore += 2.0;
    if (proximity.hasProximity) heuristicScore += 3.5;
    if (urlRisk.hasSuspiciousUrl) heuristicScore += 3.0;

    return {
      deobfuscatedText: cleanText,
      urgencyIndex: urgency,
      baitProximity: proximity.hasProximity,
      proximityDistance: proximity.distance,
      urlRisk: urlRisk.hasSuspiciousUrl,
      urlReasons: urlRisk.reasons,
      heuristicScore: parseFloat(heuristicScore.toFixed(1))
    };
  }

  return {
    deobfuscate,
    calculateUrgencyIndex,
    calculateBaitActionDistance,
    analyzeUrlRisk,
    evaluate
  };
});
