/**
 * Himoya Detection Engine v3.0.0
 * Multi-category weighted scam and phishing detector for Uzbek language content.
 * Supports Uzbek Latin, Uzbek Cyrillic, and regional loanwords.
 */

// Normalized text helper: converts all Uzbek apostrophe variants to standard '
function normalizeUzbekText(text) {
  if (!text) return '';
  return text
    // Replace all quotation/apostrophe variants: ’ ‘ ʻ ` ´ with standard '
    .replace(/[\u2018\u2019\u02BB\u0060\u00B4\u02BC\u201B]/g, "'")
    // Replace non-breaking spaces and tabs with normal space
    .replace(/\s+/g, ' ')
    .trim();
}

// Category Definitions & Weights
const SCAM_CATEGORIES = {
  CRITICAL_PHISHING: {
    id: 'CRITICAL_PHISHING',
    nameUz: 'Plastik karta va SMS kod so\'rovi',
    weight: 5.0,
    critical: true,
    patterns: [
      // Latin
      'karta raqami', 'karta raqamini', 'plastik karta raqami', 'karta paroli',
      'sms kod', 'sms kodni', 'tasdiqlash kodi', 'tasdiqlash kodini',
      'kodni yuboring', 'kodni ayting', 'parolni yuboring', 'pin kod', 'pin-kod',
      'cvv', 'cvc', 'pasport seriya', 'passport seriya', 'shaxsiy kod',
      'kartangiz bloklandi', 'karta bloklandi', 'kod keldi', 'kelgan kodni',
      'kodni bering', 'karta ma\'lumotlari', 'plastik paroli',
      // Cyrillic
      'карта рақами', 'карта рақамини', 'пластик карта рақами', 'карта пароли',
      'смс код', 'смс кодни', 'тасдиқлаш коди', 'тасдиқлаш кодини',
      'кодни юборинг', 'кодни айтинг', 'паролни юборинг', 'пин код', 'пин-код',
      'паспорт серия', 'шахсий код', 'картангиз блокланди', 'карта блокланди',
      'код келди', 'келган кодни', 'кодни беринг', 'карта маълумотлари',
      // Russian / Mixed common in UZ
      'номер карты', 'код из смс', 'пароль от карты', 'срок действия карты',
      'подтвердите перевод кодом'
    ]
  },

  PROMISED_RETURNS: {
    id: 'PROMISED_RETURNS',
    nameUz: 'Kafolatlangan mo\'may daromad / Piramida',
    weight: 3.5,
    critical: false,
    patterns: [
      // Latin
      'pulni ikki barobar', 'pulni 2 barobar', '2 barobar qilib', 'ikki barobar qilib',
      'kuniga pul ishlash', 'kunlik daromad', 'oson pul topish', 'tez boyish',
      'kafolatlangan daromad', 'kafolatlangan foyda', 'passiv daromad',
      '100% kafolat', '100% garantiya', 'investitsiya qilib kuniga', 'har kuni daromad',
      'kamida kuniga', 'moliyaviy erkinlik', 'moliyaviy piramida', 'pul tikib',
      'sarflamasdan daromad', 'investitsiya qiling va oling', 'halol investitsiya kafolati',
      'pul qozonish', 'oyiga 5000$', 'kuniga 100$', 'kuniga 50$', 'kuniga 500$',
      // Cyrillic
      'пулни икки баробар', 'пулни 2 баробар', '2 баробар қилиб', 'икки баробар қилиб',
      'кунига пул ишлаш', 'кунлик даромад', 'осон пул топиш', 'тез бойиш',
      'кафолатланган даромад', 'кафолатланган фойда', 'пассив даромад',
      '100% кафолат', '100% гарантия', 'инвестиция қилиб кунига', 'ҳар куни даромад',
      'молиявий эркинлик', 'молиявий пирамида', 'пул тикиб', 'кунига 100$', 'кунига 50$',
      // Russian / Mixed
      'удвоить деньги', 'гарантированный доход', 'пассивный заработок', 'быстрый заработок',
      'заработок без вложений'
    ]
  },

  FAKE_GIVEAWAYS_SUBSIDIES: {
    id: 'FAKE_GIVEAWAYS_SUBSIDIES',
    nameUz: 'Soxta yutuq yoki kompensatsiya',
    weight: 3.5,
    critical: false,
    patterns: [
      // Latin
      'yutib oldingiz', 'yutuqqa ega bo\'ldingiz', 'siz g\'olib bo\'ldingiz',
      'prezident yordami', 'moddiy yordam', 'moddiy yordam puli', 'davlat kompensatsiyasi',
      'kompensatsiya to\'lanadi', 'kompensatsiya to\'lovi', 'kompensatsiya puli', 'kompensatsiya',
      'bolalar uchun kompensatsiya', 'bolalar uchun yordam', 'bolalar uchun pul', 'bolalar uchun nafaqa',
      'yutuqni olish uchun', 'sovg\'ani qabul qiling', 'sovg\'a olish', 'sovgani qabul qiling',
      'omadli raqam egasi', 'click yutuq', 'payme yutuq', 'prezident sovg\'asi',
      'prezident qaroriga binoan', 'prezident qarori bilan',
      'tasodifiy tanlov g\'olibi', 'sovg\'a sizga tushdi', 'bepul tarqatilmoqda',
      'davlat tomonidan yordam', 'davlat yordami',
      // Cyrillic
      'ютиб олдингиз', 'ютуққа эга бўлдингиз', 'сиз ғолиб бўлдингиз',
      'президент ёрдами', 'моддий ёрдам', 'моддий ёрдам пули', 'давлат компенсацияси',
      'компенсация тўланади', 'компенсация тўлови', 'компенсация пули', 'компенсация',
      'болалар учун компенсация', 'болалар учун ёрдам', 'болалар учун пул', 'болалар учун нафақа',
      'президент қарорига биноан', 'президент қарори билан',
      'ютуқни олиш учун', 'совғани қабул қилинг', 'совға олиш',
      'омадли рақам эгаси', 'клик ютуқ', 'пайме ютуқ', 'президент совғаси',
      'тасодифий танлов ғолиби', 'давлат томонидан ёрдам', 'давлат ёрдами',
      // Russian / Mixed
      'вы выиграли', 'государственная компенсация', 'выплата от государства',
      'получить приз', 'денежная помощь от фонда', 'компенсация'
    ]
  },

  INVESTMENT_CRYPTO_BOT: {
    id: 'INVESTMENT_CRYPTO_BOT',
    nameUz: 'Shubhali trading bot va kripto sxema',
    weight: 2.5,
    critical: false,
    patterns: [
      // Latin
      'trading bot', 'treyding bot', 'avto trading', 'avtomatik daromad',
      'binance signal', 'kripto signal', 'kunlik foiz', 'depozit kiritish',
      'investitsion platforma', 'treyderlik sirlari', 'signal boti',
      'kafolatli signal', 'forex bot', 'investitsiya boti', 'avtomatik pul ishlash',
      // Cyrillic
      'трейдинг бот', 'авто трейдинг', 'автоматик даромад',
      'крипто сигнал', 'кунлик фоиз', 'депозит киритиш',
      'инвестицион платформа', 'трейдерлик сирлари', 'сигнал боти',
      'форекс бот', 'инвестиция боти',
      // Russian / Mixed
      'торговый бот', 'крипто сигналы', 'депозит под высокий процент',
      'робот для трейдинга'
    ]
  },

  SUSPICIOUS_CTA: {
    id: 'SUSPICIOUS_CTA',
    nameUz: 'Lichkaga yo\'naltirish va to\'lov so\'rovi',
    weight: 2.0,
    critical: false,
    patterns: [
      // Latin
      'lichkaga yozing', 'lichkaga o\'ting', 'lichkamga yozing', 'admin bilan bog\'laning',
      'adminga yozing', 'botga kiring', 'botga yozing', 'havola orqali kiring',
      'link orqali o\'ting', 'ro\'yxatdan o\'ting va oling', 'oldindan to\'lov',
      'oldindan to\'lang', 'avans to\'lovi', 'kartaga pul o\'tkazing',
      'havolani bosing', 'kanalga ulaning va pul oling',
      // Cyrillic
      'личкага ёзинг', 'личкага ўтинг', 'личкамга ёзинг', 'админ билан боғланинг',
      'админга ёзинг', 'ботга киринг', 'ботга ёзинг', 'ҳавола орқали киринг',
      'линк орқали ўтинг', 'рўйхатдан ўтинг ва олинг', 'олдиндан тўлов',
      'олдиндан тўланг', 'картага пул ўтказинг',
      // Russian / Mixed
      'пишите в лс', 'переходите по ссылке', 'связаться с админом',
      'перейти в бота', 'предоплата для получения'
    ]
  },

  URGENCY_FOMO: {
    id: 'URGENCY_FOMO',
    nameUz: 'Sun\'iy shoshiltirish (Psixologik bosim)',
    weight: 1.0,
    critical: false,
    patterns: [
      // Latin
      'shoshiling', 'oxirgi imkoniyat', 'faqat bugun', 'vaqt oz qoldi',
      'faqat 5 kishiga', 'faqat 10 kishiga', 'joylar chegaralangan',
      'joylar cheklangan', 'ulgurib qoling', 'darhol bog\'laning',
      'oxirgi soat', 'bugun tugaydi',
      // Cyrillic
      'шошилинг', 'охирги имконият', 'фақат бугун', 'вақт оз қолди',
      'фақат 5 кишига', 'фақат 10 кишига', 'жойлар чекланган',
      'улгуриб қолинг', 'дарҳол боғланинг', 'бугун тугайди',
      // Russian / Mixed
      'торопитесь', 'последний шанс', 'только сегодня', 'места ограничены',
      'осталось мало времени'
    ]
  }
};

// Regex escape helper
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Build regex patterns with unicode boundary checks
// Allows flexible apostrophes (standard, turned comma, curly, or omitted)
const compiledCategories = Object.values(SCAM_CATEGORIES).map(cat => {
  const sortedPatterns = [...cat.patterns].sort((a, b) => b.length - a.length);
  const regexString = sortedPatterns
    .map(p => {
      const parts = p.split("'");
      let patternRegex;
      if (parts.length > 1) {
        patternRegex = parts.map(part => escapeRegex(part)).join("['ʻ’`]?");
      } else {
        patternRegex = escapeRegex(p);
      }
      return `(?:^|[^\\p{L}\\p{N}_])${patternRegex}(?=[^\\p{L}\\p{N}_]|$)`;
    })
    .join('|');

  return {
    ...cat,
    regex: new RegExp(regexString, 'gui')
  };
});

/**
 * Evaluates text against scam indicators.
 * @param {string} rawText 
 * @param {number} threshold Score threshold (default: 5.0)
 * @returns {object} { isScam, score, categories: [], matchedKeywords: [], riskLevel: 'HIGH'|'MEDIUM'|'LOW' }
 */
function analyzeContent(rawText, threshold = 5.0) {
  if (!rawText || rawText.length < 25) {
    return { isScam: false, score: 0, categories: [], matchedKeywords: [] };
  }

  const normalized = normalizeUzbekText(rawText);
  let totalScore = 0;
  const matchedCategories = [];
  const matchedKeywords = new Set();
  let hasCritical = false;

  for (const cat of compiledCategories) {
    const matches = normalized.match(cat.regex);
    if (matches && matches.length > 0) {
      // Clean up captured non-word boundary delimiters
      const cleanKeywords = matches.map(m => m.trim().toLowerCase());
      cleanKeywords.forEach(kw => matchedKeywords.add(kw));

      const count = cleanKeywords.length;
      // Diminishing returns for multiple matches within same category
      const categoryScore = cat.weight + (count > 1 ? Math.min((count - 1) * 0.5, 2.0) : 0);
      totalScore += categoryScore;

      matchedCategories.push({
        id: cat.id,
        nameUz: cat.nameUz,
        weight: cat.weight,
        critical: cat.critical,
        count
      });

      if (cat.critical) {
        hasCritical = true;
      }
    }
  }

  // Decision logic:
  // 1. Critical Phishing: Instant alert if any critical pattern matches with score >= 4.0 or at least one other match
  // 2. Multi-Category Rule: Non-critical scams must match at least 2 DISTINCT categories AND meet the score threshold.
  const meetsCategoryCount = hasCritical || matchedCategories.length >= 2;
  const meetsThreshold = totalScore >= threshold;
  const isScam = meetsCategoryCount && (hasCritical || meetsThreshold);

  let riskLevel = 'LOW';
  if (hasCritical || totalScore >= 7.0) {
    riskLevel = 'HIGH';
  } else if (totalScore >= 4.0) {
    riskLevel = 'MEDIUM';
  }

  return {
    isScam,
    score: parseFloat(totalScore.toFixed(1)),
    riskLevel,
    categories: matchedCategories,
    matchedKeywords: Array.from(matchedKeywords)
  };
}

// Export for extension content script and background/tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    normalizeUzbekText,
    analyzeContent,
    SCAM_CATEGORIES
  };
}
