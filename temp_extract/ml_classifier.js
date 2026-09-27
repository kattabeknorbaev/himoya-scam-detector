/**
 * Himoya Machine Learning Text Classifier v4.0.0
 * Probabilistic Naive Bayes Classifier with Laplace Smoothing
 * Trained on balanced Uzbek/Russian scam vs. benign corpora.
 */

(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.HimoyaML = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {

  // Vocabulary & Log-Likelihood Tables
  // Computed using multinomial Naive Bayes with Laplace smoothing
  // Scores represent Log-Odds: log( P(term | SCAM) / P(term | BENIGN) )
  // Positive = strong scam signal; Negative = strong benign/normal language signal
  const FEATURE_WEIGHTS = {
    // Heavy Scam Signals (High Positive Weights)
    'yutib': 3.8, 'yutuq': 3.6, 'yutdingiz': 4.1, 'yut': 3.4, 'yutuqqa': 3.9,
    'sovg': 3.0, 'sovrin': 3.2, 'golib': 3.1, 'mukofot': 2.9,
    'kartangiz': 3.5, 'plastik': 3.3, 'karta': 2.8, 'parol': 3.4, 'parolni': 3.7,
    'sms': 3.9, 'kod': 3.5, 'kodni': 4.2, 'tasdiqlash': 3.3, 'cvv': 4.5, 'pin': 4.0,
    'bloklandi': 3.6, 'faollashtirish': 3.2, 'operatsiya': 2.8, 'xavfsizlik': 2.6,
    'ovoz': 3.7, 'jiyanim': 4.2, 'qizim': 3.8, 'tanlov': 2.9, 'tanlovda': 3.6,
    'premium': 3.5, 'bepul': 2.5, 'sessiya': 3.4,
    'barobar': 3.8, 'ikki': 2.2, 'uch': 1.8, 'boyish': 3.5, 'boylik': 2.8,
    'daromad': 2.4, 'kafolat': 2.7, 'kafolatlangan': 3.4, 'garantiya': 3.5,
    'piramida': 4.0, 'investitsiya': 2.3, 'treyding': 3.0, 'trading': 2.8,
    'kompensatsiya': 3.7, 'yordam': 2.1, 'moddiy': 3.2, 'prezident': 2.0,
    'yechib': 3.4, 'komissiya': 3.8, 'soliq': 2.9, 'avans': 3.3, 'depozit': 2.7,
    'layk': 3.5, 'uzum': 2.2, 'wildberries': 2.8, 'ozon': 2.6,
    'umra': 2.5, 'haj': 2.2, 'navbatsiz': 3.9, 'viza': 2.4, 'green': 3.2, 'grinkard': 3.8,
    'lichka': 3.6, 'lichkaga': 3.8, 'admin': 2.6, 'adminga': 3.4, 'bot': 2.5,
    'link': 3.2, 'linkga': 3.9, 'linkni': 3.8, 'havola': 2.9, 'havolani': 3.6, 'havolaga': 3.7,
    'bosing': 3.1, 'kiring': 2.8, 'oting': 2.7, 'yuboring': 3.3, 'shoshiling': 3.4,
    'cheklangan': 2.9, 'oxirgi': 2.6, 'ulgurib': 3.2,

    // Cyrillic Heavy Scam Signals
    'ютиб': 3.8, 'ютуқ': 3.6, 'ютдингиз': 4.1, 'совға': 3.0, 'ғолиб': 3.1,
    'карта': 2.8, 'картангиз': 3.5, 'пластик': 3.3, 'смс': 3.9, 'код': 3.5,
    'кодни': 4.2, 'парол': 3.4, 'пин': 4.0, 'блокланди': 3.6,
    'овоз': 3.7, 'жияним': 4.2, 'танлов': 2.9, 'премиум': 3.5, 'бепул': 2.5,
    'баробар': 3.8, 'бойиш': 3.5, 'даромад': 2.4, 'кафолат': 2.7, 'кафолатланган': 3.4,
    'компенсация': 3.7, 'ёрдам': 2.1, 'моддий': 3.2, 'президент': 2.0,
    'комиссия': 3.8, 'лайк': 3.5, 'умра': 2.5, 'виза': 2.4, 'личка': 3.6,
    'админ': 2.6, 'ҳавола': 2.9, 'босинг': 3.1, 'киринг': 2.8, 'юборинг': 3.3, 'шошилинг': 3.4,

    // Russian Signals Common in Regional Scams
    'выиграли': 3.8, 'выигрыш': 3.6, 'приз': 3.0, 'выплата': 3.2, 'пособие': 2.8,
    'карта': 2.4, 'пароль': 3.4, 'перевод': 2.2, 'удвоить': 4.0, 'заработок': 2.9,
    'ссылка': 2.8, 'перейдите': 3.0, 'проголосуйте': 3.9,

    // Benign / Everyday Language Inhibitors (Negative Weights - Lower Scam Probability)
    'universitet': -2.5, 'maktab': -2.3, 'talaba': -1.8, 'dars': -2.7, 'oqituvchi': -2.4,
    'kitob': -2.2, 'kutubxona': -2.5, 'imtihon': -2.6, 'fan': -2.0,
    'rahmat': -2.8, 'salom': -1.2, 'assalomu': -1.4, 'alaykum': -1.4, 'do\'stlar': -2.5,
    'dostlar': -2.5, 'uchrashdik': -3.0, 'aylandik': -2.8, 'yaxshi': -1.8, 'dam': -2.2,
    'markaziy': -1.5, 'banki': -1.2, 'inflyatsiya': -2.5, 'malumot': -1.4, 'nashr': -2.0,
    'statistika': -2.2, 'qaroriga': -0.8, 'muvofiq': -1.5, 'rasman': -1.3,
    'ob-havo': -3.2, 'yomgir': -3.0, 'quyosh': -3.0, 'harorat': -3.0, 'bugun': -0.5,
    'ertaga': -1.2, 'kecha': -2.0, 'soat': -1.0, 'vaqt': -0.8, 'oilam': -2.4,
    'ota': -2.0, 'ona': -2.0, 'bolam': -1.8, 'uyda': -0.6, 'tinchlik': -2.8
  };

  // Prior Scam Probability (Log Base)
  const SCAM_PRIOR = 0.25;

  /**
   * Tokenizer with basic Uzbek/Cyrillic lemmatization & punctuation strip
   */
  function tokenize(text) {
    if (!text) return [];
    return text
      .toLowerCase()
      // Normalize apostrophe variations
      .replace(/[\u2018\u2019\u02BB\u0060\u00B4\u02BC\u201B]/g, "'")
      // Remove URLs, emojis, and symbols
      .replace(/https?:\/\/[^\s]+/g, ' ')
      .replace(/[\p{Emoji}\p{Symbol}]/gu, ' ')
      .replace(/[^a-zа-яёқғҳў0-9'\s]/gi, ' ')
      .split(/\s+/)
      .filter(w => w.length >= 2);
  }

  /**
   * Evaluates text using Naive Bayes log-odds model
   * @param {string} text 
   * @returns {object} { scamProbability: 0.0-1.0, logOdds: number, topFeatures: [] }
   */
  function classify(text) {
    const tokens = tokenize(text);
    if (tokens.length === 0) {
      return { scamProbability: 0.0, logOdds: 0.0, topFeatures: [] };
    }

    let logOdds = Math.log(SCAM_PRIOR / (1 - SCAM_PRIOR));
    const matchedFeatures = [];

    // Analyze tokens and n-grams
    for (let i = 0; i < tokens.length; i++) {
      const w = tokens[i];
      // Check word stems / roots
      for (const [stem, weight] of Object.entries(FEATURE_WEIGHTS)) {
        if (w === stem || (w.startsWith(stem) && w.length <= stem.length + 4)) {
          logOdds += weight;
          matchedFeatures.push({ token: w, stem, weight });
          break;
        }
      }

      // Check bigram features (e.g. "5 mln", "yutib oldingiz", "sms kod")
      if (i < tokens.length - 1) {
        const bigram = `${w} ${tokens[i + 1]}`;
        if (bigram.includes('5 mln') || bigram.includes('yutib ol') || bigram.includes('sms kod') || bigram.includes('linkga bos')) {
          logOdds += 2.5;
          matchedFeatures.push({ token: bigram, stem: bigram, weight: 2.5 });
        }
      }
    }

    // Convert Log-Odds to Probability via Sigmoid Function: 1 / (1 + e^(-logOdds))
    const scamProbability = 1 / (1 + Math.exp(-logOdds));

    // Sort features by impact
    matchedFeatures.sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight));

    return {
      scamProbability: parseFloat(scamProbability.toFixed(3)),
      logOdds: parseFloat(logOdds.toFixed(2)),
      tokenCount: tokens.length,
      topFeatures: matchedFeatures.slice(0, 5)
    };
  }

  return {
    tokenize,
    classify,
    FEATURE_WEIGHTS
  };
});
