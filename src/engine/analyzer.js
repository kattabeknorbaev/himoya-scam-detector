/**
 * Himoya Unified Threat Analyzer v5.4.1
 * Integrates Aho-Corasick DFA, Linguistic Normalizer, and Heuristic Profiler
 */

(function (global) {
  'use strict';

  class HimoyaAnalyzer {
    constructor() {
      this.automaton = null;
      this.rules = null;
      this.isReady = false;
      this.init();
    }

    async init() {
      try {
        if (typeof AhoCorasick !== 'undefined') {
          this.automaton = new AhoCorasick();
          // Load pre-compiled rules if running in extension environment
          if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
            const rulesUrl = chrome.runtime.getURL('src/engine/rules.json');
            const res = await fetch(rulesUrl);
            const data = await res.json();
            this.rules = (data && (data.rules || data.patterns)) ? (data.rules || data.patterns) : [];
            this.automaton.build(this.rules);
            this.isReady = true;
          }
        }
      } catch (e) {
        console.warn('[Himoya Analyzer] Async rule fetch deferred:', e);
      }
    }

    /**
     * Synchronously builds or verifies automaton with provided rules
     */
    setRules(rules) {
      if (typeof AhoCorasick !== 'undefined') {
        this.automaton = new AhoCorasick();
        this.rules = rules;
        this.automaton.build(rules);
        this.isReady = true;
      }
    }

    /**
     * Evaluates text payload across all cybersecurity layers
     * @param {string} text - Raw input text
     * @param {string} lang - 'uz' | 'uz_cyr' | 'ru'
     * @returns {Object} Threat evaluation result
     */
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
      if (this.automaton && this.isReady) {
        dfaMatches = this.automaton.search(normalized);
      }

      // 3. Fallback Heuristic Pattern Sweeps (if DFA rules still hydrating)
      const matchedTokens = new Set();
      const categoriesDetected = new Map();
      let totalRiskWeight = 0;

      // Extract from DFA
      for (const m of dfaMatches) {
        matchedTokens.add(m.keyword);
        totalRiskWeight += m.weight || 2.0;
        if (m.category && !categoriesDetected.has(m.category)) {
          categoriesDetected.set(m.category, m.category);
        }
      }

      // Supplementary High-Risk Regex Checks
      const regexPatterns = [
        {
          id: 'CARD_DRAINER',
          re: /(karta|kartangiz|karta raqam|pan|cvv|pin|8600|9860|plastik karta|карта|карту|номер карты)/i,
          weight: 4.5,
          name: { uz: 'Karta o\'g\'irligi', uz_cyr: 'Карта ўғирлиги', ru: 'Кража карт' }
        },
        {
          id: 'OTP_THEFT',
          re: /(sms|kod|tasdiqlash kodi|maxfiy kod|parol|kodni yuboring|смс|код подтверждения|пароль)/i,
          weight: 5.0,
          name: { uz: 'SMS kod o\'g\'irligi', uz_cyr: 'СМС код ўғирлиги', ru: 'Кража SMS-кода' }
        },
        {
          id: 'APK_DROPPER',
          re: /(\.apk|taklifnoma\.apk|sud\.apk|foto\.apk|rasm\.apk|ijro\.apk|yuklab oling|скачать apk)/i,
          weight: 6.0,
          name: { uz: 'Zararli APK troyan', uz_cyr: 'Зарарли APK троян', ru: 'Вредоносный APK' }
        },
        {
          id: 'FAKE_SUBSIDY',
          re: /(kompensatsiya|moddiy yordam|prezident qarori|bolalar nafaqasi|gaz kompensatsiya|subsidiy|компенсация|пособие)/i,
          weight: 4.0,
          name: { uz: 'Soxta kompensatsiya', uz_cyr: 'Сохта компенсация', ru: 'Фейковая субсидия' }
        },
        {
          id: 'TELEGRAM_HIJACK',
          re: /(ovoz bering|bolamga ovoz|jiyanimga ovoz|tanlovda ovoz|ovoz berib yordam|проголосуйте)/i,
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
          weight: 3.5,
          name: { uz: 'Moliyaviy piramida', uz_cyr: 'Молиявий пирамида', ru: 'Финансовая пирамида' }
        },
        {
          id: 'TASK_BRUSHING',
          re: /(uzum layk|wildberries layk|kunlik 300 ming|mahsulotga baho bering|онлайн заработок лайк)/i,
          weight: 3.5,
          name: { uz: 'Soxta vazifa (Brushing)', uz_cyr: 'Сохта вазифа (Брушинг)', ru: 'Фейк-задания' }
        }
      ];

      for (const p of regexPatterns) {
        if (p.re.test(normalized)) {
          totalRiskWeight += p.weight;
          categoriesDetected.set(p.id, p.name[lang] || p.name.uz);
        }
      }

      // 4. Behavioral Heuristics Profiler
      const hasBait = /(yutuq|pul|so'm|sovg'a|daromad|mukofot|kompensatsiya|выигрыш|деньги|приз)/i.test(normalized);
      const hasCTA = /(kiring|bosing|kodni|yuboring|to'lang|oching|havola|перейдите|отправьте)/i.test(normalized);
      const baitProximity = hasBait && hasCTA;
      if (baitProximity) totalRiskWeight += 3.0;

      // Exclamation Clustering & Urgency
      const exclCount = (raw.match(/!/g) || []).length;
      const urgencyIndex = Math.min(1.0, (exclCount * 0.15) + (baitProximity ? 0.35 : 0));
      if (urgencyIndex >= 0.4) totalRiskWeight += 2.0;

      // URL / Domain Reputation Check
      let urlRisk = false;
      const urlMatches = raw.match(/https?:\/\/[^\s]+|t\.me\/[^\s]+/gi) || [];
      if (urlMatches.length > 0) {
        urlRisk = true;
        totalRiskWeight += 2.5;
        const bloom = typeof HimoyaBloomFilter !== 'undefined' ? HimoyaBloomFilter : (typeof BloomFilter !== 'undefined' ? BloomFilter : null);
        if (bloom && typeof bloom.checkDomainReputation === 'function') {
          for (const u of urlMatches) {
            try {
              const domainRep = bloom.checkDomainReputation(u);
              if (domainRep && domainRep.isThreat) {
                totalRiskWeight += 6.0;
                categoriesDetected.set(domainRep.threatType || 'PHISHING_DOMAIN', lang === 'ru' ? 'Опасный фишинг-домен' : (lang === 'uz_cyr' ? 'Хавфли фишинг домен' : 'Xavfli fishing domen'));
              }
            } catch (e) {}
          }
        }
      }

      // APK Attachment check
      const apkDetected = /\.apk\b/i.test(raw);
      if (apkDetected) totalRiskWeight += 5.0;

      // 5. Probability & Risk Classification
      // Logarithmic sigmoid mapping for 0-100% score
      const mlProbability = Math.min(99, Math.max(0, Math.round((1 / (1 + Math.exp(-(totalRiskWeight - 6.0) / 2.2))) * 100)));
      const isScam = mlProbability >= 50 || totalRiskWeight >= 7.0;

      let riskLevel = 'SAFE';
      if (mlProbability >= 85 || totalRiskWeight >= 12.0) {
        riskLevel = 'CRITICAL';
      } else if (mlProbability >= 65 || totalRiskWeight >= 8.0) {
        riskLevel = 'HIGH';
      } else if (mlProbability >= 45 || totalRiskWeight >= 5.0) {
        riskLevel = 'MEDIUM';
      }

      // Category objects list
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
    module.exports = { HimoyaAnalyzer, analyzeContent: global.analyzeContent };
  }
})(typeof window !== 'undefined' ? window : globalThis);
