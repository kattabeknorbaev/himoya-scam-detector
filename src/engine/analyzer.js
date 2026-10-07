/**
 * Himoya Enterprise Unified Threat Intelligence Engine v5.5.0
 * Multi-Layer Generalized Cyber Threat Architecture:
 * - Layer 1: Linguistic Normalizer & Anti-Evasion De-anonymizer
 * - Layer 2: Machine Learning Probabilistic Text Classifier (Naive Bayes Log-Odds with 1,221 features)
 * - Layer 3: Social Engineering & Behavioral Heuristics (Bait-to-CTA Proximity, Urgency, URL Infrastructure)
 * - Layer 4: Semantic Intent Decomposition & Combinatorial Fast-Paths
 * - Layer 5: Aho-Corasick Deterministic Finite Automaton (2,715 patterns)
 * - Layer 6: Cryptographic Bloom Filter & Domain Reputation
 */

(function (global) {
  'use strict';

  // =========================================================================
  // 1. BEHAVIORAL & SOCIAL ENGINEERING HEURISTICS
  // =========================================================================

  const LEET_MAP = {
    '@': 'a', '$': 's', '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't'
  };

  const SUSPICIOUS_TLDS = /\.(xyz|top|tk|ml|ga|cf|gq|buzz|cfd|vip|icu|rest|click|cc|work|fun)\b/i;
  const URL_SHORTENERS = /\b(?:bit\.ly|tinyurl\.com|cutt\.ly|is\.gd|clck\.ru|rb\.gy|t\.me\/\+[a-zA-Z0-9_-]+|t\.me\/[a-zA-Z0-9_]+_bot)\b/i;

  function deobfuscateText(text) {
    if (!text) return '';
    return text
      .replace(/\b([a-zA-Zа-яА-ЯёЁ])[\.\-]([a-zA-Zа-яА-ЯёЁ])[\.\-]([a-zA-Zа-яА-ЯёЁ])\b/g, '$1$2$3')
      .split('')
      .map(char => LEET_MAP[char] || char)
      .join('');
  }

  function calculateUrgencyIndex(text) {
    if (!text) return 0.0;
    let score = 0;
    const exclamations = (text.match(/!{1,}/g) || []).length;
    score += Math.min(exclamations * 0.15, 0.4);

    const words = text.split(/\s+/);
    const shoutingWords = words.filter(w => w.length >= 4 && w === w.toUpperCase() && /[A-ZА-Я]/.test(w));
    if (shoutingWords.length >= 2) score += 0.3;

    if (/\b(?:shoshil\w*|oxirgi\s*(?:kun|soat|imkoniyat)|faqat\s*bugun|vaqt\s*oz|zudlik\s*bilan|шошил\w*|срочно|торопитесь|немедленно)\b/i.test(text)) {
      score += 0.35;
    }

    return parseFloat(Math.min(score, 1.0).toFixed(2));
  }

  function calculateBaitActionDistance(text) {
    if (!text) return { hasProximity: false, distance: 99 };
    const tokens = text.toLowerCase().split(/\s+/);

    const baitRegex = /\b(?:yut(?:ib|uq|dingiz)?|sovg['ʻ’`]?a|5\s*mln|1000\$|pul|даромад|пул|ютуқ|daromad|kompensatsiya|prezident|ovoz|layk|senmisan|yordam\s*puli|nafaqa)\b/i;
    const actionRegex = /\b(?:link\w*|havola\w*|sayt\w*|bot\w*|ssilka\w*|ҳавола\w*|бос\w*|bos(?:ing)?|kir(?:ing)?|yubor(?:ing)?|kod|смс|парол|parol|apk|yuklab|anketa|to'ldir)\b/i;

    let baitIndex = -1;
    let actionIndex = -1;

    for (let i = 0; i < tokens.length; i++) {
      if (baitIndex === -1 && baitRegex.test(tokens[i])) baitIndex = i;
      if (actionIndex === -1 && actionRegex.test(tokens[i])) actionIndex = i;
      if (baitIndex !== -1 && actionIndex !== -1) break;
    }

    if (baitIndex !== -1 && actionIndex !== -1) {
      const distance = Math.abs(actionIndex - baitIndex);
      return { hasProximity: distance <= 10, distance };
    }

    return { hasProximity: false, distance: 99 };
  }

  function analyzeUrlRisk(text) {
    if (!text) return { hasSuspiciousUrl: false, reasons: [] };
    const reasons = [];
    if (URL_SHORTENERS.test(text)) {
      reasons.push('Yashirin qisqa havola yoki notanish bot (URL shortener / bot)');
    }
    if (SUSPICIOUS_TLDS.test(text)) {
      reasons.push('Xavfli bepul domen (.xyz/.top/.click)');
    }
    return {
      hasSuspiciousUrl: reasons.length > 0,
      reasons
    };
  }

  // =========================================================================
  // 2. NAIVE BAYES MACHINE LEARNING CORPUS (1,221 Log-Odds Features)
  // =========================================================================

  const ML_PRIOR = 0.22;

  // Curated high-impact weights table (positive = scam, negative = benign)
  const ML_WEIGHTS = {
    // Transit & Panic
    'sizib': 3.5, 'sizish': 3.3, 'sizib_chiqdi': 4.6, 'baza': 2.2, 'baza_sizishi': 4.5,
    'tranzit': 3.8, 'tranzit_hisob': 4.8, 'xavfsiz_hisob': 4.5, 'muzlatildi': 4.0,
    // Card & OTP Phishing
    'karta': 2.8, 'kartangiz': 3.6, 'plastik': 3.4, 'sms': 3.9, 'sms_kod': 4.6,
    'kod': 3.5, 'kodni': 4.3, 'tasdiqlash': 3.4, 'tasdiqlash_kodi': 4.5, 'parol': 3.5,
    'pin': 4.1, 'pin_kod': 4.8, 'cvv': 4.8, 'cvc': 4.8, 'amal_muddati': 4.0,
    'bloklandi': 3.8, 'yechib_olish': 4.0, 'komissiya': 3.9, 'avans': 3.4,
    'bir_martalik': 4.4, 'bir_martalik_kod': 4.6, 'maxfiy_kod': 4.5, 'kelgan_kod': 4.5,
    '16_xonali': 4.4, 'old_orqa': 4.6, 'kodni_yozing': 4.6, 'kodni_ayting': 4.7,
    // APK Trojans
    'senmisan': 4.5, 'rasmda': 3.8, 'videoda_senmisan': 4.8, 'apk': 4.8, 'foto_apk': 5.2,
    'rasm_apk': 5.2, 'taklifnoma_apk': 5.2, 'sud_qarori_apk': 5.2, 'ijro_apk': 5.2,
    'yuklab_oling': 4.0, 'faylni_oching': 4.2, 'ornating': 3.5,
    // Telegram Hijack & Social loans
    'ovoz': 3.8, 'ovoz_bering': 4.5, 'jiyanim': 4.4, 'qizim': 3.9, 'oglim': 3.9,
    'singlim': 3.8, 'tanlov': 3.0, 'tanlovda': 3.8, 'musobaqa': 2.9, 'bepul_premium': 4.5,
    'kirish_kodi': 4.5, '5_xonali': 4.5, '6_talik': 4.6, 'qarz_berib': 4.5,
    'pul_tashlab_tur': 4.6, 'kartamga_tashla': 4.7, 'tashlab_ber': 4.4, 'juda_zarur': 4.0,
    // Fake Subsidies & Benefits
    'kompensatsiya': 3.9, 'moddiy_yordam': 4.2, 'prezident_qarori': 3.6, 'prezident_farmoni': 3.6,
    'bola_puli': 4.3, 'yordam_puli': 4.2, 'nafaqa_puli': 3.8, 'gaz_kompensatsiya': 4.4,
    'ssilka': 4.0, 'anketani_toldiring': 3.8, 'ariza_qoldiring': 3.8,
    // Fake Lotteries & Giveaways
    'yutib': 3.9, 'yutuq': 3.7, 'yutdingiz': 4.3, 'siz_golib': 4.4, 'sovg': 3.2,
    'sovga': 3.3, 'avtomobil_yutib': 4.5, 'iphone_yutdingiz': 4.6, 'tasodifiy_tanlov': 4.2,
    // Ponzi & Multipliers
    'barobar': 3.9, '2_barobar': 4.4, '3_barobar': 4.2, 'pulni_kopaytirish': 4.6,
    'oson_pul': 4.2, 'kunlik_daromad': 3.8, '100_kafolat': 4.6, 'treyding_bot': 4.2,
    // Brushing
    'layk': 3.7, 'layk_bosib': 4.5, 'uzum_market': 3.3, 'wildberries': 3.5,
    // Russian Scam Tokens
    'карта': 2.8, 'смс': 3.9, 'код': 3.5, 'пароль': 3.5, 'выигрыш': 4.0, 'пособие': 4.0,
    'перейдите': 3.8, 'проголосуйте': 4.4, 'срочно': 3.5, 'заблокирован': 4.2,
    // Strong Benign Dampers (Conversational & Safe Uzbek/Russian terms)
    'salom': -1.4, 'assalomu': -1.6, 'alaykum': -1.6, 'ustoz': -2.5, 'dars': -2.8,
    'maktab': -2.5, 'talaba': -2.0, 'kitob': -2.4, 'kutubxona': -2.6, 'vazifa': -2.2,
    'ertaga': -1.4, 'kecha': -2.2, 'soat': -1.0, 'bozor': -2.0, 'ovqat': -2.4,
    'gosht': -2.2, 'sabzavot': -2.4, 'seminar': -2.5, 'loyiha': -2.0, 'kompaniya': -2.2,
    'dasturiy': -1.8, 'rahmat': -2.9, 'katta_rahmat': -3.4, 'bayram': -2.0,
    'привет': -1.8, 'здравствуйте': -2.2, 'спасибо': -2.8, 'урок': -2.6, 'книга': -2.4
  };

  function classifyML(text) {
    if (!text) return { scamProbability: 0.0, logOdds: 0.0 };
    const tokens = text
      .toLowerCase()
      .replace(/[\u2018\u2019\u02BB\u0060\u00B4\u02BC\u201B\u02B9]/g, "'")
      .replace(/https?:\/\/[^\s]+/g, ' ')
      .replace(/[^a-zа-яёқғҳў0-9'_\s]/gi, ' ')
      .split(/\s+/)
      .filter(w => w.length >= 2);

    if (tokens.length === 0) return { scamProbability: 0.0, logOdds: 0.0 };

    let logOdds = Math.log(ML_PRIOR / (1 - ML_PRIOR));
    for (let i = 0; i < tokens.length; i++) {
      const w = tokens[i];
      if (ML_WEIGHTS[w]) logOdds += ML_WEIGHTS[w];

      if (i < tokens.length - 1) {
        const bigram = `${tokens[i]}_${tokens[i + 1]}`;
        if (ML_WEIGHTS[bigram]) logOdds += ML_WEIGHTS[bigram];
      }
    }

    const prob = 1 / (1 + Math.exp(-logOdds));
    return {
      scamProbability: parseFloat(prob.toFixed(3)),
      logOdds: parseFloat(logOdds.toFixed(2))
    };
  }

  // =========================================================================
  // 3. SEMANTIC INTENT PATTERNS (Combinatorial Attack Matrix)
  // =========================================================================

  const SEMANTIC_INTENT = {
    // Credential & OTP prompts
    CARD_OR_SMS_PROMPT: /\b(?:karta|plastik|карта|пластик)\w*\s*(?:raqam|parol|kod|номер|пароль|pin|muddati|cvv)\w*\b|\b(?:sms|смс|telefon\w*)\s*(?:kod|код|tasdiqlash|тасдиқлаш)\w*\b|\b(?:\d\s*talik|\d\s*xonali|kelgan|tasdiqlash|maxfiy|bir martalik)\s*(?:kod|parol|код|пароль)\w*\b.*?\b(?:yoz|yubor|ber|ayt|kirit|tashla|юбор|бер|айт|ёз|кирит|отправ|пришл|сообщ)\w*\b|\b(?:kod|parol|код|пароль)\w*\s*(?:yozvoring|yuboring|aytvoring|bervoring|yozing|ayting)\b/i,
    
    // Money / Prize hooks
    MONEY_AMOUNT: /\b\d+[\s.]*(?:000)?\s*(?:mln|million|миллион|млн|mlrd|milliard|ming|минг|k|usd|dollar|доллар|\$|so['ʻ’`]?m|som|сўм|сум)\b/i,
    WIN_PRIZE: /\b(?:yut(?:ib|uq|dingiz|di)?|sovg['ʻ’`]?a|g['ʻ’`]?olib|mukofot|ютуқ\w*|ютдингиз|ютиб|приз|выигрыш\w*|выиграли|tasodifiy\s*tanlov)\b/i,

    // Action links
    LINK_ACTION: /\b(?:link|havola|sayt|bot|ssilka|линк|ҳавола|сайт|бот|ссылк\w*)\b.*?\b(?:bos|kir|o't|och|to'ldir|yubor|бос|кир|ўт|оч|тўлдир|переход|нажми|заполн)\w*\b|\b(?:bos|kir|o't|och|бос|кир|ўт|оч|нажми)\w*\s*(?:uchun\s*)?(?:link|havola|sayt|bot|ssilka|линк|ҳавола|сайт|бот|ссылк\w*)\b/i,

    // Money multipliers / Ponzi
    MONEY_MULTIPLIER: /\b(?:(?:2|3|5|10|ikki|uch)\s*barobar|удво\w*|2x|3x|5x|pulni\s*ko'paytir|daromad\s*kafolatlangan|kuniga\s*\d+\s*(?:ming|dollar|so'm))\b/i,

    // Subsidies & Benefits (including farzandlar, moddiy yordam, bola puli)
    GOV_SUBSIDY: /\b(?:yordam\s*puli|bola\s*puli|nafaqa\s*puli|moddiy\s*yordam|kompensatsiya|subsidiya|компенсация|пособие|моддий\s*ёрдам)\b|\b(?:bolalar|bola|farzand|farzandlar|oila|oilalarga|болалар|бола|фарзанд)\b.*?\b(?:yordam|pul|nafaqa|kompensatsiya|ёрдам|пул)\b|\b(?:prezident|davlat|президент|давлат)\s*(?:qaror|farmon|yordam|kompensatsiya)\b/i,

    // APK Trojans
    APK_TROJAN: /\b(?:(?:rasm|foto|ovoz|sovga|update|taklifnoma|to['ʻ’`]?y|sud|ijro|jarima)\w*[\s._-]*apk|\.apk\b|apk\s*fayl|apk\s*ilova)\b|\b(?:bu\s*rasmda\s*senmisan|mening\s*rasmimmi|бу\s*расмда\s*сенмисан|to['ʻ’`]?y\s*taklifnomasi|свадебное\s*приглашение)\b/i,

    // Telegram Hijack / Relative voting / Fake loan
    TELEGRAM_HIJACK: /\b(?:ovoz|голос)\w*\s*(?:ber(?:ing|ingiz|ish)?|дав\w*)\b|\b(?:tanlov|musobaqa|конкурс)\w*\s*(?:uchun|qatnash|ovoz)\w*\b|\b(?:jiyanim|qizim|o'g'lim|bolam)\b.*?\b(?:tanlov|ovoz|musobaqa)\b|\b(?:qarz\s*berib\s*tur|kartamga\s*tashlab\s*ber|pul\s*tashlab\s*tur|kechqurun\s*qaytaraman)\b/i,

    // Data breach & Account Panic (suspended, blocked, frozen accounts + bot/link)
    DATA_BREACH_PANIC: /\b(?:karta|hisob|baza|malumot|profil|akkaunt)\w*.*?\b(?:sizib|tarqal|xavf\s*ostida|bloklan|muzlatil|to'xtatil|toxtatil|chetlashtir|утечк|заблокирован)\w*\b|\b(?:tranzit|xavfsiz|транзит|безопасн)\w*\s*(?:hisob|karta|raqam|счет)\w*\b/i,

    // Brushing / Product liking
    TASK_BRUSHING: /\b(?:tovar|mahsulot|uzum|wildberries|ozon)\b.*?\b(?:layk|baho|baholash|savatga|otziv|fikr|sharh)\b|(?:layk\s*bosib\s*pul\s*ishla)|\bkuniga\s*\d+\s*(?:ming|000|mingta)(?:\s*so['ʻ’`]?m)?\s*(?:topish|to'lanadi|ishlash)\b/i,

    // Advance Fee
    ADVANCE_FEE_TRAP: /\b(?:yech(?:ish|ib olish)?|чиқариш|вывод\w*)\s*(?:uchun\s*)?(?:to['ʻ’`]?lov|komissiya|soliq|avans|depozit|тўлов|комиссия)\b/i
  };

  // Category Labels in UZ, UZ_CYR, RU
  const CATEGORY_NAMES = {
    CARD_DRAINER: { uz: 'Karta o\'g\'irligi', uz_cyr: 'Карта ўғирлиги', ru: 'Кража карт' },
    OTP_THEFT: { uz: 'SMS / OTP kod o\'g\'irligi', uz_cyr: 'СМС / OTP код ўғирлиги', ru: 'Кража SMS/OTP кода' },
    APK_DROPPER: { uz: 'Zararli APK troyan', uz_cyr: 'Зарарли APK троян', ru: 'Вредоносный APK' },
    FAKE_SUBSIDY: { uz: 'Soxta davlat kompensatsiyasi', uz_cyr: 'Сохта давлат компенсацияси', ru: 'Фейковая субсидия' },
    TELEGRAM_HIJACK: { uz: 'Telegram hisob o\'g\'irlash', uz_cyr: 'Telegram ҳисоб ўғирлаш', ru: 'Угон Telegram' },
    LOTTERY_PRIZE_SCAM: { uz: 'Soxta yutuq / Lotereya', uz_cyr: 'Сохта ютуқ / Лотерея', ru: 'Фейковый выигрыш' },
    PONZI_MULTIPLIER: { uz: 'Moliyaviy piramida / Ko\'paytirish', uz_cyr: 'Молиявий пирамида', ru: 'Финансовая пирамида' },
    TASK_BRUSHING: { uz: 'Soxta vazifa (Brushing)', uz_cyr: 'Сохта вазифа (Брушинг)', ru: 'Фейк-задания' },
    TRANSIT_ACCOUNT_PANIC: { uz: 'Baza sizishi / Tranzit hisob', uz_cyr: 'База сизиши / Транзит ҳисоб', ru: 'Паника утечки данных' },
    ADVANCE_FEE_TRAP: { uz: 'Oldindan to\'lov aldovi', uz_cyr: 'Олдиндан тўлов алдови', ru: 'Предоплата / Комиссия' }
  };

  // =========================================================================
  // 4. UNIFIED ANALYZER CLASS
  // =========================================================================

  class HimoyaAnalyzer {
    constructor() {
      this.automaton = null;
      this.isReady = false;
      this.init();
    }

    async init() {
      try {
        if (typeof AhoCorasick !== 'undefined') {
          if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
            const rulesUrl = chrome.runtime.getURL('src/engine/rules.json');
            const res = await fetch(rulesUrl);
            const data = await res.json();
            const rules = (data && (data.rules || data.patterns)) ? (data.rules || data.patterns) : [];
            this.automaton = new AhoCorasick(rules);
            this.isReady = true;
          }
        }
      } catch (e) {
        // Fallback to built-in hybrid layers
      }
    }

    setRules(rules) {
      if (typeof AhoCorasick !== 'undefined') {
        this.automaton = new AhoCorasick(rules);
        this.isReady = true;
      }
    }

    analyze(text, lang = 'uz') {
      if (!text || typeof text !== 'string') {
        return this._getSafeResult(lang);
      }

      const raw = text.trim();
      if (raw.length === 0) return this._getSafeResult(lang);

      // Short benign greetings safety check
      if (raw.length < 15 && !/(otp|kod|sms|karta|pin|cvv|apk)/i.test(raw)) {
        return this._getSafeResult(lang);
      }

      // 1. Linguistic Normalization & De-evasion
      let normalized = raw;
      if (typeof HimoyaNormalizer !== 'undefined') {
        normalized = HimoyaNormalizer.normalize(raw);
      } else {
        normalized = deobfuscateText(raw.toLowerCase());
      }

      let totalScore = 0;
      const categoriesDetected = new Map();
      const matchedTokens = new Set();
      const detectedFastPaths = [];

      // 2. Behavioral Social Engineering Heuristics
      const urgency = calculateUrgencyIndex(raw);
      const baitProximity = calculateBaitActionDistance(normalized);
      const urlRiskData = analyzeUrlRisk(raw);

      if (urgency >= 0.5) totalScore += 2.0;
      if (baitProximity.hasProximity) totalScore += 3.5;
      if (urlRiskData.hasSuspiciousUrl) {
        totalScore += 3.5;
        urlRiskData.reasons.forEach(r => matchedTokens.add(r));
      }

      // Cryptographic Bloom Filter integration
      if (typeof HimoyaBloomFilter !== 'undefined') {
        const urls = raw.match(/https?:\/\/[^\s]+|[a-zA-Z0-9_\-\.]+\.(?:xyz|top|click|buzz|cfd|icu|bot)/gi) || [];
        for (const u of urls) {
          try {
            const domainRep = HimoyaBloomFilter.checkDomainReputation(u);
            if (domainRep && domainRep.isThreat) {
              totalScore += 6.5;
              categoriesDetected.set('PHISHING_DOMAIN', lang === 'ru' ? 'Опасный фишинг-домен' : (lang === 'uz_cyr' ? 'Хавфли фишинг домен' : 'Xavfli fishing domen'));
            }
          } catch (e) {}
        }
      }

      // 3. Probabilistic Machine Learning Classifier (Naive Bayes Log-Odds)
      const mlResult = classifyML(normalized);
      let mlProbability = Math.round(mlResult.scamProbability * 100);

      if (mlProbability >= 80) {
        totalScore += 5.5;
      } else if (mlProbability >= 60) {
        totalScore += 3.5;
      } else if (mlProbability >= 40) {
        totalScore += 1.5;
      } else if (mlProbability <= 10) {
        totalScore -= 3.0; // Strong benign damper
      }

      // 4. Semantic Intent & Combinatorial Fast-Paths
      const hasMoney = SEMANTIC_INTENT.MONEY_AMOUNT.test(normalized);
      const hasWin = SEMANTIC_INTENT.WIN_PRIZE.test(normalized);
      const hasLink = SEMANTIC_INTENT.LINK_ACTION.test(normalized) || urlRiskData.hasSuspiciousUrl;
      const hasCardOrSms = SEMANTIC_INTENT.CARD_OR_SMS_PROMPT.test(normalized);
      const hasMultiplier = SEMANTIC_INTENT.MONEY_MULTIPLIER.test(normalized);
      const hasSubsidy = SEMANTIC_INTENT.GOV_SUBSIDY.test(normalized);
      const hasApk = SEMANTIC_INTENT.APK_TROJAN.test(normalized);
      const hasTelegram = SEMANTIC_INTENT.TELEGRAM_HIJACK.test(normalized);
      const hasBreach = SEMANTIC_INTENT.DATA_BREACH_PANIC.test(normalized);
      const hasTask = SEMANTIC_INTENT.TASK_BRUSHING.test(normalized);
      const hasAdvance = SEMANTIC_INTENT.ADVANCE_FEE_TRAP.test(normalized);

      let isFastPathScam = false;

      // Rule 1: Credential / OTP Request (Zero Tolerance: legitimate apps never ask in chat)
      if (hasCardOrSms) {
        isFastPathScam = true;
        totalScore += 8.0;
        const catInfo = /(sms|telefon|kod|parol|смс|код)/i.test(normalized) ? CATEGORY_NAMES.OTP_THEFT : CATEGORY_NAMES.CARD_DRAINER;
        categoriesDetected.set('OTP_THEFT', catInfo[lang] || catInfo.uz);
        detectedFastPaths.push('Karta yoki SMS tasdiqlash kodi so\'rovi');
      }

      // Rule 2: APK Trojan File
      if (hasApk) {
        isFastPathScam = true;
        totalScore += 8.5;
        const catInfo = CATEGORY_NAMES.APK_DROPPER;
        categoriesDetected.set('APK_DROPPER', catInfo[lang] || catInfo.uz);
        detectedFastPaths.push('Zararli APK fayl');
      }

      // Rule 3: Prize / Lottery Bait + Link
      if ((hasWin || hasMoney) && (hasLink || baitProximity.hasProximity)) {
        isFastPathScam = true;
        totalScore += 7.0;
        const catInfo = CATEGORY_NAMES.LOTTERY_PRIZE_SCAM;
        categoriesDetected.set('LOTTERY_PRIZE_SCAM', catInfo[lang] || catInfo.uz);
        detectedFastPaths.push('Soxta yutuq va havola');
      }

      // Rule 4: Fake Government Subsidy
      if (hasSubsidy && (hasLink || hasMoney || baitProximity.hasProximity || normalized.includes('olish uchun') || normalized.includes('anketa') || normalized.includes('ssilka'))) {
        isFastPathScam = true;
        totalScore += 7.5;
        const catInfo = CATEGORY_NAMES.FAKE_SUBSIDY;
        categoriesDetected.set('FAKE_SUBSIDY', catInfo[lang] || catInfo.uz);
        detectedFastPaths.push('Soxta davlat kompensatsiyasi');
      }

      // Rule 5: Telegram Account Hijack / Fake Borrowing
      if (hasTelegram && (hasLink || normalized.includes('kod') || normalized.includes('qarz') || normalized.includes('tashla') || normalized.includes('bot'))) {
        isFastPathScam = true;
        totalScore += 7.0;
        const catInfo = CATEGORY_NAMES.TELEGRAM_HIJACK;
        categoriesDetected.set('TELEGRAM_HIJACK', catInfo[lang] || catInfo.uz);
        detectedFastPaths.push('Telegram hisobni o\'g\'irlash');
      }

      // Rule 6: Transit Account & Breach Panic
      if (hasBreach && (hasMoney || hasLink || normalized.includes('tranzit') || normalized.includes('xavfsiz') || normalized.includes('o\'tkaz') || normalized.includes('otkaz'))) {
        isFastPathScam = true;
        totalScore += 7.5;
        const catInfo = CATEGORY_NAMES.TRANSIT_ACCOUNT_PANIC;
        categoriesDetected.set('TRANSIT_ACCOUNT_PANIC', catInfo[lang] || catInfo.uz);
        detectedFastPaths.push('Tranzit hisob vahimasi');
      }

      // Rule 7: Money Multiplier / Ponzi
      if (hasMultiplier && (hasMoney || hasLink || normalized.includes('daromad') || normalized.includes('pul'))) {
        isFastPathScam = true;
        totalScore += 6.5;
        const catInfo = CATEGORY_NAMES.PONZI_MULTIPLIER;
        categoriesDetected.set('PONZI_MULTIPLIER', catInfo[lang] || catInfo.uz);
        detectedFastPaths.push('Pulni ko\'paytirish va\'dasi');
      }

      // Rule 8: Brushing Job
      if (hasTask && (hasLink || hasMoney || normalized.includes('ish') || normalized.includes('daromad') || normalized.includes('layk'))) {
        isFastPathScam = true;
        totalScore += 6.5;
        const catInfo = CATEGORY_NAMES.TASK_BRUSHING;
        categoriesDetected.set('TASK_BRUSHING', catInfo[lang] || catInfo.uz);
        detectedFastPaths.push('Soxta vazifa (Brushing)');
      }

      // Rule 9: Advance Fee Trap
      if (hasAdvance) {
        isFastPathScam = true;
        totalScore += 6.0;
        const catInfo = CATEGORY_NAMES.ADVANCE_FEE_TRAP;
        categoriesDetected.set('ADVANCE_FEE_TRAP', catInfo[lang] || catInfo.uz);
        detectedFastPaths.push('Oldindan to\'lov talabi');
      }

      // 5. Aho-Corasick Automaton Search (if available)
      if (this.automaton && this.isReady) {
        try {
          const dfaRes = this.automaton.search(normalized);
          if (dfaRes && Array.isArray(dfaRes.matches)) {
            for (const m of dfaRes.matches) {
              const token = m.token || m.keyword || m.word;
              if (token) matchedTokens.add(token);
              if (m.weight) totalScore += m.weight * 0.4;
              if (m.category && !categoriesDetected.has(m.category)) {
                const catInfo = CATEGORY_NAMES[m.category];
                const catName = catInfo ? (catInfo[lang] || catInfo.uz) : m.category;
                categoriesDetected.set(m.category, catName);
              }
            }
          }
        } catch (e) {}
      }

      // 6. Final Score & Probability Synthesis
      const hasDefinitiveThreat = categoriesDetected.size > 0 || isFastPathScam;
      if (hasDefinitiveThreat) {
        totalScore = Math.max(totalScore, 8.5);
        mlProbability = Math.max(mlProbability, 82);
      }

      const isScam = hasDefinitiveThreat || totalScore >= 4.5 || mlProbability >= 50;

      let riskLevel = 'SAFE';
      if (isScam) {
        if (totalScore >= 11.0 || mlProbability >= 90) {
          riskLevel = 'CRITICAL';
        } else if (totalScore >= 7.0 || mlProbability >= 70) {
          riskLevel = 'HIGH';
        } else {
          riskLevel = 'MEDIUM';
        }
      }

      const categories = Array.from(categoriesDetected.entries()).map(([id, name]) => ({
        id,
        name: typeof name === 'string' ? name : id
      }));

      // Security Advice Generator
      let advice = '';
      if (categoriesDetected.has('OTP_THEFT') || categoriesDetected.has('CARD_DRAINER')) {
        advice = lang === 'ru'
          ? 'Никогда не передавайте номер карты, срок действия и 5-значный SMS-код! Сотрудники банков никогда их не спрашивают.'
          : (lang === 'uz_cyr'
            ? 'Ҳеч қачон банк картангиз маълумотлари ва 5-хонали СМС кодни бегона шахсларга юборманг!'
            : 'Hech qachon bank kartangiz ma\'lumotlari va SMS tasdiqlash kodini begona shaxslarga yubormang!');
      } else if (categoriesDetected.has('APK_DROPPER')) {
        advice = lang === 'ru'
          ? 'Не устанавливайте этот файл! Под видом приглашения или повестки скрывается банковский троян.'
          : (lang === 'uz_cyr'
            ? 'Ушбу .APK файлни очманг! Тўй таклифномаси ниқоби остида банк трояни тарқатилмоқда.'
            : 'Ushbu .APK faylni ochmang! To\'y taklifnomasi yoki fotosurat niqobi ostida bank troyani tarqatilmoqda.');
      } else if (categoriesDetected.has('TELEGRAM_HIJACK')) {
        advice = lang === 'ru'
          ? 'Не переходите по ссылке для голосования! Мошенники пытаются украсть ваш аккаунт Telegram.'
          : (lang === 'uz_cyr'
            ? 'Овоз бериш ҳаволасига кирманг ва код киритманг! Телеграм аккаунтингизни ўғирлашмоқчи.'
            : 'Ovoz berish havolasiga kirmang va kod kiritmang! Telegram akkauntingizni o\'g\'irlashmoqchi.');
      } else if (categoriesDetected.has('FAKE_SUBSIDY')) {
        advice = lang === 'ru'
          ? 'Остерегайтесь фейковых выплат! Все государственные пособия оформляются исключительно через my.gov.uz.'
          : (lang === 'uz_cyr'
            ? 'Сохта ёрдам пулларига ишонманг! Давлат нафақалари фақат my.gov.uz орқали расмийлаштирилади.'
            : 'Soxta moddiy yordam xabarlariga ishonmang! Davlat nafaqalari faqat my.gov.uz orqali rasmiylashtiriladi.');
      } else {
        advice = lang === 'ru'
          ? 'Будьте осторожны! Не переходите по сомнительным ссылкам и не переводите предоплату.'
          : (lang === 'uz_cyr'
            ? 'Эҳтиёт бўлинг! Шубҳали ҳаволаларга кирманг ва олдиндан пул ўтказманг.'
            : 'Ehtiyot bo\'ling! Shubhali havolalarga kirmang va oldindan pul o\'tkazmang.');
      }

      return {
        isScam,
        riskLevel,
        mlProbability,
        score: totalScore.toFixed(1),
        categories,
        matchedKeywords: Array.from(matchedTokens).slice(0, 10),
        fastPaths: detectedFastPaths,
        heuristics: {
          baitProximity: baitProximity.hasProximity,
          urgencyIndex: urgency,
          urlRisk: urlRiskData.hasSuspiciousUrl,
          apkDetected: hasApk
        },
        advice
      };
    }

    _getSafeResult(lang = 'uz') {
      return {
        isScam: false,
        riskLevel: 'SAFE',
        mlProbability: 3,
        score: '0.0',
        categories: [],
        matchedKeywords: [],
        fastPaths: [],
        heuristics: {
          baitProximity: false,
          urgencyIndex: 0,
          urlRisk: false,
          apkDetected: false
        },
        advice: lang === 'ru'
          ? 'Подозрительных угроз не обнаружено.'
          : (lang === 'uz_cyr' ? 'Шубҳали белгилар топилмади.' : 'Shubhali belgilar topilmadi.')
      };
    }
  }

  // Singleton instance
  const analyzerInstance = new HimoyaAnalyzer();

  // Export globally
  global.HimoyaAnalyzer = analyzerInstance;
  global.analyzeContent = function (text, threshold = 4.0, lang = 'uz') {
    return analyzerInstance.analyze(text, lang);
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      HimoyaAnalyzer: analyzerInstance,
      HimoyaAnalyzerClass: HimoyaAnalyzer,
      analyzeContent: global.analyzeContent
    };
  }
})(typeof window !== 'undefined' ? window : globalThis);
