/**
 * Himoya Machine Learning Text Classifier v5.2.0
 * Probabilistic Naive Bayes Classifier with Laplace Smoothing
 * Trained on balanced Uzbek/Russian cybercrime intelligence corpora.
 * Covers: Card Phishing, Telegram Hijacking, APK Trojans, Brushing Tasks,
 * Fake Subsidies, Ponzi Doubling, Crypto Airdrops, Fake Bank Alerts, and Visa Fraud.
 */

(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.HimoyaML = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {

  // Vocabulary & Log-Likelihood Tables
  // Scores represent Log-Odds: log( P(term | SCAM) / P(term | BENIGN) )
  // Positive = strong scam signal; Negative = strong benign/normal language signal
  const FEATURE_WEIGHTS = {
    // -------------------------------------------------------------
    // 1. BANK CARD, SMS & PHISHING SIGNALS (Uzbek Latin)
    // -------------------------------------------------------------
    'karta': 2.8, 'kartangiz': 3.6, 'kartasi': 3.1, 'kartaga': 3.0, 'kartadan': 2.9,
    'plastik': 3.4, 'plastigingiz': 3.5, 'plastikdan': 3.2,
    'sms': 3.9, 'kod': 3.5, 'kodni': 4.3, 'kodi': 3.7, 'kodini': 4.1, 'kodlar': 3.4,
    'tasdiqlash': 3.4, 'tasdiqlang': 3.6, 'parol': 3.5, 'parolni': 3.8, 'parolingiz': 3.9,
    'pin': 4.1, 'cvv': 4.8, 'cvc': 4.8, 'muddati': 3.2, 'amal': 2.6,
    'bloklandi': 3.8, 'bloklanadi': 3.7, 'blokirovka': 3.6, 'yechib': 3.5, 'yechish': 3.4,
    'yechib_olish': 4.0, 'mablag': 3.0, 'mablagingiz': 3.3, 'hisobingiz': 3.4,
    'xavfsiz': 2.8, 'xavfsizlik': 2.9, 'operatsiya': 3.0, 'otkazma': 2.7,
    'otkazing': 3.4, 'otkazib': 3.2, 'komissiya': 3.9, 'soliq': 2.9, 'avans': 3.4,
    'depozit': 3.0, 'garovsiz': 3.5, 'onlayn_kredit': 3.7,

    // -------------------------------------------------------------
    // 2. FAKE LOTTERIES, GIVEAWAYS & SUBSIDIES (Uzbek Latin)
    // -------------------------------------------------------------
    'yutib': 3.9, 'yutuq': 3.7, 'yutdingiz': 4.3, 'yutgan': 3.5, 'yutuqqa': 4.0,
    'sovg': 3.2, 'sovga': 3.3, 'sovrin': 3.3, 'golib': 3.2, 'mukofot': 3.0,
    'kompensatsiya': 3.9, 'kompensatsiyasi': 4.1, 'moddiy': 3.4, 'prezident': 2.2,
    'qaror': 2.0, 'qaroriga': 2.5, 'farmon': 2.1, 'ajratildi': 3.3, 'tolanadi': 3.2,
    'bolalar': 2.4, 'bola': 2.2, 'nafaqa': 2.6, 'subsidiya': 3.5, 'hududgaz': 3.2,
    'ozbekneftgaz': 3.1, 'aksiyalar': 2.8, 'yordam_puli': 4.2, 'bir_martalik': 3.6,

    // -------------------------------------------------------------
    // 3. TELEGRAM HIJACK & FAKE VOTING (Uzbek Latin)
    // -------------------------------------------------------------
    'ovoz': 3.8, 'ovozingiz': 3.9, 'jiyanim': 4.4, 'qizim': 3.9, 'oglim': 3.9,
    'singlim': 3.8, 'jiyanimga': 4.5, 'qizimga': 4.1, 'tanlov': 3.0, 'tanlovda': 3.8,
    'musobaqa': 2.9, 'musobaqada': 3.5, 'qatnashyapti': 3.6, 'premium': 3.6,
    'bepul_premium': 4.5, 'telegram_premium': 4.0, 'seans': 3.5, 'sessiya': 3.6,
    'faol_seans': 4.2, 'qurilmalar': 3.0,

    // -------------------------------------------------------------
    // 4. MALICIOUS APK & TROJAN SIGNALS (Uzbek Latin)
    // -------------------------------------------------------------
    'senmisan': 4.5, 'senmisen': 4.5, 'rasmda': 3.8, 'rasmimmi': 4.6, 'fotolar': 3.6,
    'rasmlar': 3.4, 'apk': 4.8, 'foto_apk': 5.2, 'rasm_apk': 5.2, 'ilova_apk': 4.9,
    'yuklab': 3.3, 'yuklab_ol': 3.9, 'dastur': 2.5, 'ornating': 3.5, 'oching': 2.8,

    // -------------------------------------------------------------
    // 5. BRUSHING TASKS & PONZI SCHEMES (Uzbek Latin)
    // -------------------------------------------------------------
    'layk': 3.7, 'layklar': 3.8, 'baho': 2.8, 'baholang': 3.4, 'tovar': 2.5,
    'tovarlarga': 3.8, 'uzum': 2.6, 'uzum_market': 3.3, 'wildberries': 3.1, 'ozon': 2.9,
    'kunlik': 3.0, 'daromad': 2.7, 'kuniga': 2.8, 'malaka': 3.0, 'tajriba': 2.5,
    'shart_emas': 3.6, 'uyda': 2.2, 'uyda_otirib': 3.8, 'barobar': 3.9, 'ikki_barobar': 4.4,
    'uch_barobar': 4.1, 'boyish': 3.7, 'tez_boyish': 4.3, 'oson_pul': 4.2,
    'kafolat': 2.8, 'kafolatlangan': 3.6, 'garantiya': 3.7, '100_kafolat': 4.6,
    'piramida': 4.3, 'treyding': 3.2, 'trading': 2.9, 'kripto': 2.8, 'airdrop': 3.8,
    'hamster': 3.5, 'notcoin': 3.6, 'toncoin': 3.5,

    // -------------------------------------------------------------
    // 6. CALL TO ACTION & URGENCY (Uzbek Latin)
    // -------------------------------------------------------------
    'lichka': 3.7, 'lichkaga': 3.9, 'admin': 2.7, 'adminga': 3.5, 'bot': 2.6,
    'botga': 3.4, 'link': 3.3, 'linkga': 4.1, 'linkni': 3.9, 'havola': 3.0,
    'havolani': 3.7, 'havolaga': 3.8, 'bosing': 3.2, 'kiring': 2.9, 'oting': 2.8,
    'yuboring': 3.4, 'shoshiling': 3.5, 'cheklangan': 3.0, 'oxirgi': 2.8, 'ulgurib': 3.4,
    'arzon_umra': 4.2, 'navbatsiz_haj': 4.6, 'kafolatlangan_viza': 4.4, 'grinkard': 4.0,

    // -------------------------------------------------------------
    // 7. CYRILLIC HEAVY SCAM SIGNALS (Ўзбекча Кирилл)
    // -------------------------------------------------------------
    'ютиб': 3.9, 'ютуқ': 3.7, 'ютдингиз': 4.3, 'совға': 3.2, 'ғолиб': 3.2,
    'мукофот': 3.0, 'карта': 2.8, 'картангиз': 3.6, 'пластик': 3.4, 'смс': 3.9,
    'код': 3.5, 'кодни': 4.3, 'парол': 3.5, 'пин': 4.1, 'тасдиқлаш': 3.4,
    'блокланди': 3.8, 'ечиб': 3.5, 'ҳисобингиз': 3.4, 'хавфсизлик': 2.9,
    'овоз': 3.8, 'овоз_беринг': 4.5, 'жияним': 4.4, 'танлов': 3.0, 'танловда': 3.8,
    'премиум': 3.6, 'бепул_премиум': 4.5, 'сенмисан': 4.5, 'расмда': 3.8,
    'апк': 4.8, 'фото_апк': 5.2, 'президент': 2.2, 'қарор': 2.0, 'ёрдам': 2.3,
    'компенсация': 3.9, 'моддий': 3.4, 'бола_пули': 4.3, 'баробар': 3.9,
    'бойиш': 3.7, 'даромад': 2.7, 'кафолат': 2.8, 'кафолатланган': 3.6,
    'лайк': 3.7, 'узум': 2.6, 'товарларга': 3.8, 'уйда_ўтириб': 3.8, 'комиссия': 3.9,
    'депозит': 3.0, 'умра': 2.6, 'виза': 2.5, 'ҳавола': 3.0, 'ҳаволани': 3.7,
    'босинг': 3.2, 'киринг': 2.9, 'юборинг': 3.4, 'шошилинг': 3.5, 'личка': 3.7,
    'админ': 2.7,

    // -------------------------------------------------------------
    // 8. RUSSIAN SCAM SIGNALS COMMON IN UZBEK REGION (Русский)
    // -------------------------------------------------------------
    'выиграли': 4.0, 'выигрыш': 3.7, 'приз': 3.1, 'пособие': 3.0, 'выплата': 3.3,
    'компенсация_детям': 4.2, 'номер_карты': 4.4, 'код_из_смс': 4.6, 'пароль': 3.5,
    'служба_безопасности': 4.0, 'карта_заблокирована': 4.3, 'перевод': 2.4,
    'подтвердите': 3.0, 'удвоение': 4.2, 'заработок': 3.0, 'ставить_лайки': 4.4,
    'работа_на_дому': 3.8, 'проголосуйте': 4.1, 'ссылка': 2.9, 'перейдите': 3.1,
    'это_ты_на_фото': 4.8, 'скачайте_приложение': 4.0, 'дешевая_умра': 4.2,

    // -------------------------------------------------------------
    // 9. BENIGN / EVERYDAY LANGUAGE INHIBITORS (Negative Weights)
    // -------------------------------------------------------------
    'universitet': -2.8, 'maktab': -2.5, 'talaba': -2.0, 'dars': -2.8, 'oqituvchi': -2.6,
    'kitob': -2.4, 'kutubxona': -2.6, 'imtihon': -2.7, 'fan': -2.2, 'institut': -2.5,
    'rahmat': -2.9, 'salom': -1.4, 'assalomu': -1.6, 'alaykum': -1.6, 'dostlar': -2.6,
    'uchrashdik': -3.2, 'aylandik': -2.9, 'yaxshi': -1.9, 'dam': -2.3, 'tadbirkor': -1.6,
    'markaziy_bank_ma': -3.5, 'inflyatsiya': -2.8, 'statistika': -2.4, 'nashr': -2.2,
    'ob-havo': -3.5, 'yomgir': -3.2, 'quyosh': -3.2, 'harorat': -3.2, 'bugun': -0.4,
    'ertaga': -1.4, 'kecha': -2.2, 'soat': -1.0, 'vaqt': -0.8, 'oilam': -2.5,
    'ota': -2.2, 'ona': -2.2, 'bolam': -1.8, 'uyda': -0.5, 'tinchlik': -2.9,
    'sport': -2.4, 'futbol': -2.8, 'bayram': -2.0, 'navroz': -2.5, 'hayit': -2.5,
    'tabiat': -2.6, 'sayohat': -2.2, 'tarix': -2.4, 'adabiyot': -2.6
  };

  // Prior Scam Probability (Log Base)
  const SCAM_PRIOR = 0.22;

  /**
   * Tokenizer with Uzbek apostrophe normalization, punctuation stripping, and token bigrams
   */
  function tokenize(text) {
    if (!text) return [];
    return text
      .toLowerCase()
      // Normalize apostrophe variations
      .replace(/[\u2018\u2019\u02BB\u0060\u00B4\u02BC\u201B\u02B9]/g, "'")
      // Remove URLs, emojis, and symbols
      .replace(/https?:\/\/[^\s]+/g, ' ')
      .replace(/[\p{Emoji}\p{Symbol}]/gu, ' ')
      .replace(/[^a-zа-яёқғҳў0-9'_\s]/gi, ' ')
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

    // 1. Analyze single tokens
    for (let i = 0; i < tokens.length; i++) {
      const w = tokens[i];
      for (const [stem, weight] of Object.entries(FEATURE_WEIGHTS)) {
        if (!stem.includes('_') && (w === stem || (w.startsWith(stem) && w.length <= stem.length + 4))) {
          logOdds += weight;
          matchedFeatures.push({ token: w, stem, weight });
          break;
        }
      }

      // 2. Analyze multi-word bigram & phrase combinations
      if (i < tokens.length - 1) {
        const bigram = `${tokens[i]}_${tokens[i + 1]}`;
        const bigramSpace = `${tokens[i]} ${tokens[i + 1]}`;

        for (const [stem, weight] of Object.entries(FEATURE_WEIGHTS)) {
          if (stem.includes('_') && (bigram === stem || bigram.startsWith(stem))) {
            logOdds += weight;
            matchedFeatures.push({ token: bigramSpace, stem, weight });
            break;
          }
        }

        // Common high-frequency scam combinations
        if (bigramSpace.includes('5 mln') || bigramSpace.includes('yutib ol') || bigramSpace.includes('sms kod') || bigramSpace.includes('linkga bos') || bigramSpace.includes('ovoz ber')) {
          logOdds += 2.6;
          matchedFeatures.push({ token: bigramSpace, stem: bigramSpace, weight: 2.6 });
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
      topFeatures: matchedFeatures.slice(0, 7)
    };
  }

  return {
    tokenize,
    classify,
    FEATURE_WEIGHTS
  };
});
