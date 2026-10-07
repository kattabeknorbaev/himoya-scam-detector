/**
 * Himoya Unified Threat Analyzer v5.4.1
 * Integrates Aho-Corasick DFA, Linguistic Normalizer, and Heuristic Profiler
 */

(function (global) {
  'use strict';

  // Core Seed Rules for Immediate Synchronous Protection
  const CORE_SEED_RULES = [
    { word: 'karta', category: 'CARD_DRAINER', weight: 4.8, critical: true },
    { word: 'kartangiz', category: 'CARD_DRAINER', weight: 4.8, critical: true },
    { word: 'karta raqam', category: 'CARD_DRAINER', weight: 5.0, critical: true },
    { word: 'karta raqami', category: 'CARD_DRAINER', weight: 5.0, critical: true },
    { word: 'plastik karta', category: 'CARD_DRAINER', weight: 5.0, critical: true },
    { word: '8600', category: 'CARD_DRAINER', weight: 4.5, critical: false },
    { word: '9860', category: 'CARD_DRAINER', weight: 4.5, critical: false },
    { word: 'cvv', category: 'CARD_DRAINER', weight: 5.0, critical: true },
    { word: 'sms kod', category: 'OTP_THEFT', weight: 5.0, critical: true },
    { word: 'kodni yuboring', category: 'OTP_THEFT', weight: 5.0, critical: true },
    { word: 'tasdiqlash kodi', category: 'OTP_THEFT', weight: 5.0, critical: true },
    { word: 'maxfiy kod', category: 'OTP_THEFT', weight: 5.0, critical: true },
    { word: 'yutib oldingiz', category: 'CARD_DRAINER', weight: 4.5, critical: false },
    { word: 'yutuq', category: 'CARD_DRAINER', weight: 4.0, critical: false },
    { word: 'ovoz bering', category: 'TELEGRAM_HIJACK', weight: 5.5, critical: true },
    { word: 'ovoz', category: 'TELEGRAM_HIJACK', weight: 4.5, critical: false },
    { word: 'jiyanim', category: 'TELEGRAM_HIJACK', weight: 4.8, critical: true },
    { word: 'tanlovda', category: 'TELEGRAM_HIJACK', weight: 4.0, critical: false },
    { word: 'bolamga ovoz', category: 'TELEGRAM_HIJACK', weight: 5.5, critical: true },
    { word: 'kompensatsiya', category: 'FAKE_SUBSIDY', weight: 5.0, critical: true },
    { word: 'moddiy yordam', category: 'FAKE_SUBSIDY', weight: 5.0, critical: true },
    { word: 'prezident qarori', category: 'FAKE_SUBSIDY', weight: 5.0, critical: true },
    { word: 'bolalar nafaqasi', category: 'FAKE_SUBSIDY', weight: 4.5, critical: true },
    { word: 'yordam puli', category: 'FAKE_SUBSIDY', weight: 4.5, critical: true },
    { word: '.apk', category: 'APK_DROPPER', weight: 6.0, critical: true },
    { word: 'taklifnoma.apk', category: 'APK_DROPPER', weight: 6.0, critical: true },
    { word: 'foto.apk', category: 'APK_DROPPER', weight: 6.0, critical: true },
    { word: 'fotolar.apk', category: 'APK_DROPPER', weight: 6.0, critical: true },
    { word: 'baza sizib', category: 'TRANSIT_ACCOUNT_PANIC', weight: 5.5, critical: true },
    { word: 'tranzit hisob', category: 'TRANSIT_ACCOUNT_PANIC', weight: 5.5, critical: true },
    { word: 'xavfsiz tranzit', category: 'TRANSIT_ACCOUNT_PANIC', weight: 5.5, critical: true },
    { word: 'uzum layk', category: 'TASK_BRUSHING', weight: 4.5, critical: true },
    { word: 'wildberries layk', category: 'TASK_BRUSHING', weight: 4.5, critical: true },
    { word: 'pulni ko\'paytirish', category: 'PONZI_MULTIPLIER', weight: 4.5, critical: true },
    { word: '2 barobar', category: 'PONZI_MULTIPLIER', weight: 4.5, critical: true },
    { word: 'kunlik daromad', category: 'PONZI_MULTIPLIER', weight: 4.0, critical: false }
  ];

  const CATEGORY_NAMES = {
    CARD_DRAINER: { uz: 'Karta o\'g\'irligi', uz_cyr: 'Карта ўғирлиги', ru: 'Кража карт' },
    OTP_THEFT: { uz: 'SMS kod o\'g\'irligi', uz_cyr: 'СМС код ўғирлиги', ru: 'Кража SMS-кода' },
    APK_DROPPER: { uz: 'Zararli APK troyan', uz_cyr: 'Зарарли APK троян', ru: 'Вредоносный APK' },
    FAKE_SUBSIDY: { uz: 'Soxta kompensatsiya', uz_cyr: 'Сохта компенсация', ru: 'Фейковая субсидия' },
    TELEGRAM_HIJACK: { uz: 'Telegram hisob o\'g\'irlash', uz_cyr: 'Telegram ҳисоб ўғирлаш', ru: 'Угон Telegram' },
    PONZI_MULTIPLIER: { uz: 'Moliyaviy piramida', uz_cyr: 'Молиявий пирамида', ru: 'Финансовая пирамида' },
    TASK_BRUSHING: { uz: 'Soxta vazifa (Brushing)', uz_cyr: 'Сохта вазифа (Брушинг)', ru: 'Фейк-задания' },
    TRANSIT_ACCOUNT_PANIC: { uz: 'Baza sizishi vahimasi', uz_cyr: 'База сизиши ваҳимаси', ru: 'Паника утечки данных' },
    ESCROW_DELIVERY: { uz: 'Soxta to\'lov havolasi', uz_cyr: 'Сохта тўлов ҳаволаси', ru: 'Поддельная оплата' },
    VISA_UMRA_FRAUD: { uz: 'Soxta Umra / Viza', uz_cyr: 'Сохта Умра / Виза', ru: 'Фейковая виза / Умра' }
  };

  class HimoyaAnalyzer {
    constructor() {
      this.automaton = null;
      this.rules = null;
      this.isReady = false;

      // Seed synchronous baseline immediately
      if (typeof AhoCorasick !== 'undefined') {
        this.automaton = new AhoCorasick(CORE_SEED_RULES);
        this.isReady = true;
      }

      this.init();
    }

    async init() {
      try {
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
          const rulesUrl = chrome.runtime.getURL('src/engine/rules.json');
          const res = await fetch(rulesUrl);
          const data = await res.json();
          this.rules = (data && (data.rules || data.patterns)) ? (data.rules || data.patterns) : [];
          if (this.rules.length > 0) {
            if (typeof AhoCorasick !== 'undefined') {
              this.automaton = new AhoCorasick(this.rules);
              this.isReady = true;
            }
          }
        }
      } catch (e) {
        // Core seed rules remain fully active
      }
    }

    setRules(rules) {
      if (typeof AhoCorasick !== 'undefined') {
        this.automaton = new AhoCorasick(rules);
        this.rules = rules;
        this.isReady = true;
      }
    }

    analyze(text, lang = 'uz') {
      if (!text || typeof text !== 'string') {
        return this._getSafeResult(lang);
      }

      const raw = text.trim();
      if (raw.length === 0) return this._getSafeResult(lang);

      // 1. Linguistic Normalization & De-evasion
      let normalized = raw.toLowerCase();
      if (typeof HimoyaNormalizer !== 'undefined') {
        normalized = HimoyaNormalizer.normalize(raw);
      }

      // 2. Aho-Corasick DFA Pattern Matching
      let dfaMatches = [];
      let totalRiskWeight = 0;
      const matchedTokens = new Set();
      const categoriesDetected = new Map();

      if (this.automaton && this.isReady) {
        try {
          const dfaRes = this.automaton.search(normalized);
          if (dfaRes) {
            dfaMatches = Array.isArray(dfaRes.matches) ? dfaRes.matches : (Array.isArray(dfaRes) ? dfaRes : []);
            if (dfaRes.totalScore) {
              totalRiskWeight += dfaRes.totalScore;
            }
          }
        } catch (e) {
          console.warn('[Himoya Analyzer] DFA search fallback:', e);
        }
      }

      // Extract findings from DFA
      for (const m of dfaMatches) {
        const token = m.token || m.keyword || m.word;
        if (token) matchedTokens.add(token);
        if (m.weight) totalRiskWeight += m.weight;
        if (m.category && !categoriesDetected.has(m.category)) {
          const catInfo = CATEGORY_NAMES[m.category];
          const catName = catInfo ? (catInfo[lang] || catInfo.uz) : m.category;
          categoriesDetected.set(m.category, catName);
        }
      }

      // 3. Supplementary High-Risk Regex Checks
      const regexPatterns = [
        {
          id: 'CARD_DRAINER',
          re: /(karta|kartangiz|karta raqam|pan|cvv|pin|8600|9860|plastik karta|карта|карту|номер карты)/i,
          weight: 5.0,
          name: { uz: 'Karta o\'g\'irligi', uz_cyr: 'Карта ўғирлиги', ru: 'Кража карт' }
        },
        {
          id: 'OTP_THEFT',
          re: /(sms|kod|tasdiqlash kodi|maxfiy kod|parol|kodni yuboring|смс|код подтверждения|пароль)/i,
          weight: 5.5,
          name: { uz: 'SMS kod o\'g\'irligi', uz_cyr: 'СМС код ўғирлиги', ru: 'Кража SMS-кода' }
        },
        {
          id: 'APK_DROPPER',
          re: /(\.apk|taklifnoma\.apk|sud\.apk|foto\.apk|rasm\.apk|ijro\.apk|yuklab oling|скачать apk)/i,
          weight: 6.5,
          name: { uz: 'Zararli APK troyan', uz_cyr: 'Зарарли APK троян', ru: 'Вредоносный APK' }
        },
        {
          id: 'FAKE_SUBSIDY',
          re: /(kompensatsiya|moddiy yordam|prezident qarori|bolalar nafaqasi|gaz kompensatsiya|subsidiy|компенсация|пособие)/i,
          weight: 5.0,
          name: { uz: 'Soxta kompensatsiya', uz_cyr: 'Сохта компенсация', ru: 'Фейковая субсидия' }
        },
        {
          id: 'TELEGRAM_HIJACK',
          re: /(ovoz bering|bolamga ovoz|jiyanimga ovoz|tanlovda ovoz|ovoz berib yordam|jiyanim|ovoz|проголосуйте)/i,
          weight: 5.5,
          name: { uz: 'Telegram hisob o\'g\'irlash', uz_cyr: 'Telegram ҳисоб ўғирлаш', ru: 'Угон Telegram' }
        },
        {
          id: 'DATA_BREACH_PANIC',
          re: /(baza sizib chiqdi|kartalar sizishi|xavfsiz tranzit hisob|tranzit hisob|sizib chiqqan|утечка базы)/i,
          weight: 5.5,
          name: { uz: 'Baza sizishi vahimasi', uz_cyr: 'База сизиши ваҳимаси', ru: 'Паника утечки данных' }
        },
        {
          id: 'PONZI_MULTIPLIER',
          re: /(2 barobar|pulni ko'paytirish|kunlik daromad|100 ming tikib|daromad kafolatlangan|удвоение)/i,
          weight: 4.5,
          name: { uz: 'Moliyaviy piramida', uz_cyr: 'Молиявий пирамида', ru: 'Финансовая пирамида' }
        },
        {
          id: 'LOTTERY_PRIZE_SCAM',
          re: /(yutib oldingiz|yutib oldi|yutuq chiqdi|5 mln yutib|sovg'a yutib|siz g'olib|yutuqqa ega|yutuqni olish|выиграли|выигрыш)/i,
          weight: 5.5,
          name: { uz: 'Soxta yutuq / Lotereya', uz_cyr: 'Сохта ютуқ / Лотерея', ru: 'Фейковый выигрыш' }
        },
        {
          id: 'TASK_BRUSHING',
          re: /(uzum.*layk|wildberries.*layk|layk bosib|tovarlarga layk|kuniga 300|kunlik 300|kunlik.*daromad|mahsulotga baho|онлайн заработок.*лайк)/i,
          weight: 5.0,
          name: { uz: 'Soxta vazifa (Brushing)', uz_cyr: 'Сохта вазифа (Брушинг)', ru: 'Фейк-задания' }
        }
      ];

      for (const p of regexPatterns) {
        if (p.re.test(normalized)) {
          totalRiskWeight += p.weight;
          if (!categoriesDetected.has(p.id)) {
            categoriesDetected.set(p.id, p.name[lang] || p.name.uz);
          }
        }
      }

      // 4. Behavioral Heuristics Profiler
      const hasBait = /(yutuq|pul|so'm|sovg'a|daromad|mukofot|kompensatsiya|yutib|mln|выигрыш|деньги|приз)/i.test(normalized);
      const hasCTA = /(kiring|bosing|kodni|yuboring|to'lang|oching|havola|link|linkga|перейдите|отправьте)/i.test(normalized);
      const baitProximity = hasBait && hasCTA;
      if (baitProximity) {
        totalRiskWeight += 4.5;
        if (!categoriesDetected.has('LOTTERY_PRIZE_SCAM') && /(yutib|yutuq|mln|sovg'a)/i.test(normalized)) {
          categoriesDetected.set('LOTTERY_PRIZE_SCAM', lang === 'ru' ? 'Фейковый выигрыш' : (lang === 'uz_cyr' ? 'Сохта ютуқ / Лотерея' : 'Soxta yutuq / Lotereya'));
        }
      }

      const exclCount = (raw.match(/!/g) || []).length;
      const urgencyIndex = Math.min(1.0, (exclCount * 0.15) + (baitProximity ? 0.35 : 0));
      if (urgencyIndex >= 0.4) totalRiskWeight += 2.0;

      // URL / Domain Reputation Check
      let urlRisk = false;
      const urlMatches = raw.match(/https?:\/\/[^\s]+|t\.me\/[^\s]+|[a-zA-Z0-9_\-\.]+\.(?:xyz|top|click|buzz|cfd|icu|bot)/gi) || [];
      if (urlMatches.length > 0) {
        urlRisk = true;
        totalRiskWeight += 3.0;
        const bloom = typeof HimoyaBloomFilter !== 'undefined' ? HimoyaBloomFilter : (typeof BloomFilter !== 'undefined' ? BloomFilter : null);
        if (bloom && typeof bloom.checkDomainReputation === 'function') {
          for (const u of urlMatches) {
            try {
              const domainRep = bloom.checkDomainReputation(u);
              if (domainRep && domainRep.isThreat) {
                totalRiskWeight += 6.5;
                categoriesDetected.set(domainRep.threatType || 'PHISHING_DOMAIN', lang === 'ru' ? 'Опасный фишинг-домен' : (lang === 'uz_cyr' ? 'Хавфли фишинг домен' : 'Xavfli fishing domen'));
              }
            } catch (e) {}
          }
        }
      }

      // APK Attachment check
      const apkDetected = /\.apk\b/i.test(raw);
      if (apkDetected) totalRiskWeight += 6.0;

      // 5. Probability & Risk Classification
      const hasDefinitiveCategory = categoriesDetected.size > 0;
      if (hasDefinitiveCategory) {
        totalRiskWeight = Math.max(totalRiskWeight, 9.0);
      }

      const mlProbability = Math.min(99, Math.max(0, Math.round((1 / (1 + Math.exp(-(totalRiskWeight - 5.5) / 1.8))) * 100)));
      const isScam = hasDefinitiveCategory || mlProbability >= 50 || totalRiskWeight >= 5.5;

      let riskLevel = 'SAFE';
      if (isScam) {
        if (mlProbability >= 85 || totalRiskWeight >= 11.0) {
          riskLevel = 'CRITICAL';
        } else if (mlProbability >= 65 || totalRiskWeight >= 7.5) {
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
      if (categoriesDetected.has('CARD_DRAINER') || categoriesDetected.has('OTP_THEFT')) {
        advice = lang === 'ru'
          ? 'Никогда не передавайте номер карты, срок действия и 5-значный SMS-код! Сотрудники банков никогда их не спрашивают.'
          : (lang === 'uz_cyr'
            ? 'Ҳеч қачон банк картангиз маълумотлари ва 5-хонали СМС кодни бегона шахсларга юборманг!'
            : 'Hech qachon bank kartangiz ma\'lumotlari va 5-xonali SMS kodni begona shaxslarga yubormang!');
      } else if (categoriesDetected.has('APK_DROPPER')) {
        advice = lang === 'ru'
          ? 'Не устанавливайте этот файл! Под видом приглашения или повестки скрывается банковский троян.'
          : (lang === 'uz_cyr'
            ? 'Ушбу .APK файлни очманг! Тўй таклифномаси ниқоби остида банк трояни тарқатилмоқда.'
            : 'Ushbu .APK faylni ochmang! To\'y taklifnomasi niqobi ostida bank troyani tarqatilmoqda.');
      } else if (categoriesDetected.has('TELEGRAM_HIJACK')) {
        advice = lang === 'ru'
          ? 'Не переходите по ссылке для голосования! Мошенники пытаются украсть ваш аккаунт Telegram.'
          : (lang === 'uz_cyr'
            ? 'Овоз бериш ҳаволасига кирманг ва код киритманг! Телеграм аккаунтингизни ўғирлашмоқчи.'
            : 'Ovoz berish havolasiga kirmang va kod kiritmang! Telegram akkauntingizni o\'g\'irlashmoqchi.');
      } else if (categoriesDetected.has('FAKE_SUBSIDY')) {
        advice = lang === 'ru'
          ? 'Остерегайтесь фейковых субсидий! Официальные пособия оформляются только через my.gov.uz.'
          : (lang === 'uz_cyr'
            ? 'Сохта компенсация хабарларига ишонманг! Давлат ёрдами фақат my.gov.uz орқали расмийлаштирилади.'
            : 'Soxta kompensatsiya xabarlariga ishonmang! Davlat yordami faqat my.gov.uz orqali rasmiylashtiriladi.');
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
        score: totalRiskWeight.toFixed(1),
        categories,
        matchedKeywords: Array.from(matchedTokens).slice(0, 10),
        heuristics: {
          baitProximity,
          urgencyIndex,
          urlRisk,
          apkDetected
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
