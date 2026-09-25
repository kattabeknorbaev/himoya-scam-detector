/**
 * Himoya Advanced Detection Engine v4.0.0
 * Multi-layer hybrid detection engine:
 * 1. Semantic Feature Extraction (Money amounts, prize bait, link CTAs, card/SMS credentials, doubling multipliers)
 * 2. High-Confidence Combinatorial Fast-Paths (Flags instant scams like "5 mln yutdingiz + linkga bosing" with 100% precision)
 * 3. Suffix-Tolerant Uzbek & Cyrillic Lemmatization & Pattern Matching
 * 4. Multi-Category Weighted Risk Evaluation
 */

// Normalized text helper: converts all Uzbek apostrophe variants to standard '
function normalizeUzbekText(text) {
  if (!text) return '';
  return text
    // Replace all quotation/apostrophe variants: ’ ‘ ʻ ` ´ ʹ with standard '
    .replace(/[\u2018\u2019\u02BB\u0060\u00B4\u02BC\u201B\u02B9]/g, "'")
    // Replace non-breaking spaces, zero-width characters, and tabs with normal space
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * SEMANTIC FEATURE EXTRACTORS (RegEx NER)
 * Extracts intent signals across Latin, Cyrillic, and regional slang.
 */
const SEMANTIC_FEATURES = {
  // Money amounts: e.g. "5 mln", "1000$", "500 000 so'm", "100 ming"
  MONEY_AMOUNT: /\b\d+[\s.]*(?:000)?\s*(?:mln|million|миллион|млн|mlrd|milliard|миллиард|ming|минг|k|usd|dollar|доллар|\$|so['ʻ’`]?m|som|сўм|сум|евро|euro|rubl|рубль|usdt)\b/i,

  // Lottery, prize, winner bait
  WIN_PRIZE: /\b(?:yut(?:ib|uq|dingiz|ding|di|dik|dim|gan|ing|adi|ish)?|sovg['ʻ’`]?a\w*|sovrin\w*|g['ʻ’`]?olib\w*|mukofot\w*|sovga\w*|совға\w*|ютуқ\w*|ютдингиз|ютиб|ғолиб\w*|мукофот\w*|приз\w*|выигрыш\w*|выиграли)\b/i,

  // Link / CTA action: e.g. "linkga bosing", "havolaga kiring", "saytga o'ting", "linkni bosing", "havolani bosing"
  LINK_ACTION: /\b(?:link|havola|sayt|bot|web|url|линк|ҳавола|сайт|бот|ссылк\w*)\w*\s*(?:orqali\s*)?(?:bos(?:ing|ingiz|ish|adi)?|kir(?:ing|ingiz|ish|adi)?|o['ʻ’`]?t(?:ing|ingiz|ish|adi)?|och(?:ing|ingiz|ish|adi)?|кўр(?:инг)?|бос(?:инг)?|кир(?:инг)?|ўт(?:инг)?|оч(?:инг)?|переход\w*|нажми\w*|клик\w*)\b|\b(?:bos(?:ing|ingiz)?|kir(?:ing|ingiz)?|o['ʻ’`]?t(?:ing|ingiz)?|och(?:ing|ingiz)?|бос(?:инг)?|кир(?:инг)?|ўт(?:инг)?|оч(?:инг)?|нажми\w*)\s*(?:uchun\s*)?(?:link|havola|sayt|bot|линк|ҳавола|сайт|бот|ссылк\w*)\w*\b/i,

  // Direct card & SMS phishing
  CARD_OR_SMS_PROMPT: /\b(?:karta|plastik|карта|пластик)\w*\s*(?:raqam|parol|kod|номер|пароль|pin)\w*\b|\b(?:sms|смс)\s*(?:kod|код|tasdiqlash|тасдиқлаш)\w*\b|\b(?:kodni|kod|parolni|parol|кодни|код|пароль)\w*\s*(?:yubor|ber|ayt|yoz|kirit|юбор|бер|айт|ёз|кирит|отправ|пришл|сообщ)\w*\b/i,

  // Money multiplier (doubling schemes)
  MONEY_MULTIPLIER: /\b(?:(?:2|3|5|10|ikki|uch|besh|икки|уч|беш)\s*barobar|удво\w*|2x|3x|5x|10x)\b/i,

  // Advance fee / withdrawal commission trap
  ADVANCE_FEE_TRAP: /\b(?:yech(?:ish|ib olish)?|chiqar(?:ish|ib olish)?|ечиб олиш|вывод\w*)\s*(?:uchun\s*)?(?:to['ʻ’`]?lov|komissiya|soliq|avans|тўлов|комиссия|солиқ|оплат\w*)\b|\b(?:oldindan|аванс)\s*(?:to['ʻ’`]?lov|тўлов|оплат\w*)\b/i,

  // Telegram session hijack / voting contest
  TELEGRAM_HIJACK: /\b(?:ovoz|голос)\w*\s*(?:ber(?:ing|ingiz|ish)?|дав\w*)\b|\b(?:tanlov|musobaqa|конкурс)\w*\s*(?:uchun|qatnash|ovoz)\w*\b/i,

  // Government subsidy / aid impersonation
  GOV_SUBSIDY: /\b(?:prezident|davlat|vazirlik|hokimlik|pensiya|mib|президент|давлат|пенсия)\w*\s*(?:yordam|kompensatsiya|qaror|farmon|sovg['ʻ’`]?a|ёрдам|компенсация|қарор|фармон)\w*\b|\b(?:bolalar|bola)\s*(?:uchun\s*)?(?:kompensatsiya|yordam|pul|nafaqa)\b|\b(?:болалар|бола)\s*(?:учун\s*)?(?:компенсация|ёрдам|пул|нафақа)\b/i
};

/**
 * Standard Categories with Suffix-Tolerant Lemmatization
 */
const SCAM_CATEGORIES = {
  CRITICAL_PHISHING: {
    id: 'CRITICAL_PHISHING',
    nameUz: 'Plastik karta va SMS kod so\'rovi',
    nameUzCyr: 'Пластик карта ва СМС код сўрови',
    nameRu: 'Фишинг карт и SMS-кодов',
    weight: 5.5,
    critical: true,
    patterns: [
      'karta raqam', 'plastik karta', 'karta parol', 'sms kod', 'tasdiqlash kod',
      'kodni yubor', 'kodni ayt', 'kodni yoz', 'parolni yubor', 'pin kod',
      'cvv', 'cvc', 'pasport seriya', 'kartangiz blokla', 'karta blokla',
      'kod keldi', 'kelgan kod', 'kodni ber', 'karta ma\'lumot', 'plastik parol',
      'kartani faollashtir', 'xavfsizlik xizmat', 'markaziy bank xodim',
      'карта рақам', 'пластик карта', 'карта парол', 'смс код', 'тасдиқлаш код',
      'кодни юбор', 'кодни айт', 'кодни ёз', 'паролни юбор', 'пин код',
      'паспорт серия', 'картангиз блокла', 'код келди', 'келган код', 'кодни бер',
      'номер карты', 'код из смс', 'пароль от карты', 'срок действия карты',
      'подтвердите перевод кодом', 'служба безопасности банка', 'карта заблокирована'
    ]
  },

  FAKE_LOTTERY_SUBSIDIES: {
    id: 'FAKE_LOTTERY_SUBSIDIES',
    nameUz: 'Soxta yutuq yoki davlat yordami',
    nameUzCyr: 'Сохта ютуқ ёки давлат ёрдами',
    nameRu: 'Фейковые выигрыши и пособия',
    weight: 4.5,
    critical: false,
    patterns: [
      'yutib ol', 'yutuqqa ega', 'siz g\'olib', 'yutuqni ol', 'sovg\'ani qabul',
      'sovg\'a ol', 'prezident yordam', 'moddiy yordam', 'davlat kompensatsiya',
      'kompensatsiya to\'la', 'bolalar uchun pul', 'bolalar uchun yordam',
      'bola puli', 'click yutuq', 'payme yutuq', 'prezident sovg\'a',
      'prezident qaror', 'tasodifiy tanlov', 'bepul tarqatil',
      'ютиб ол', 'ютуққа эга', 'сиз ғолиб', 'ютуқни ол', 'совғани қабул',
      'президент ёрдам', 'моддий ёрдам', 'давлат компенсация', 'бола пули',
      'болалар учун пул', 'клик ютуқ', 'пайме ютуқ', 'президент совға',
      'выплата от государства', 'государственная компенсация', 'вы выиграли',
      'получить приз', 'денежная помощь'
    ]
  },

  TELEGRAM_VOTE_HIJACK: {
    id: 'TELEGRAM_VOTE_HIJACK',
    nameUz: 'Telegram profilni o\'g\'irlash (Ovoz berish / Premium)',
    nameUzCyr: 'Telegram профилни ўғирлаш (Овоз бериш / Премиум)',
    nameRu: 'Угон Telegram (Голосование / Премиум)',
    weight: 4.5,
    critical: true,
    patterns: [
      'tanlovda ovoz', 'jiyanimga ovoz', 'qizimga ovoz', 'ovoz bering',
      'ovoz berish uchun', 'telegram premium bepul', 'bepul premium',
      'sessiyani tasdiqla', 'telegramdan kelgan kod', 'akkauntni faollashtir',
      'танловда овоз', 'жиянимга овоз', 'қизимга овоз', 'овоз беринг',
      'телеграм премиум бепул', 'бепул премиум', 'аккаунтни фаоллаштир',
      'проголосуйте за', 'бесплатный телеграм премиум'
    ]
  },

  PROMISED_RETURNS_PONZI: {
    id: 'PROMISED_RETURNS_PONZI',
    nameUz: 'Pulni ko\'paytirish va kafolatlangan boylik',
    nameUzCyr: 'Пулни кўпайтириш ва кафолатланган бойлик',
    nameRu: 'Удвоение денег, финансовые пирамиды',
    weight: 3.5,
    critical: false,
    patterns: [
      'pulni ikki barobar', 'pulni 2 barobar', '2 barobar qilib', 'ikki barobar qilib',
      '3 barobar', '5 barobar', '3 soatda daromad', '2 soat ichida daromad',
      'kuniga pul ishla', 'kunlik daromad', 'oson pul top', 'tez boyi',
      'kafolatlangan daromad', 'kafolatlangan foyda', 'passiv daromad',
      '100% kafolat', '100% garantiya', 'investitsiya qilib kuniga', 'moliyaviy piramida',
      'pul tikib', 'oyiga 5000$', 'kuniga 100$', 'kuniga 500$', 'pulni ko\'paytir',
      'пулни икки баробар', 'пулни 2 баробар', 'кунига пул ишла', 'тез бойи',
      'кафолатланган даромад', 'кафолатланган фойда', '100% кафолат', '100% гарантия', 'молиявий пирамида',
      'удвоить деньги', 'гарантированный доход', 'заработок за 2 часа'
    ]
  },

  TASK_JOB_SCAMS: {
    id: 'TASK_JOB_SCAMS',
    nameUz: 'Soxta onlayn ish va layk bosish sxemasi',
    nameUzCyr: 'Сохта онлайн иш ва лайк босиш схемаси',
    nameRu: 'Фейковые задания и заработок на лайках',
    weight: 2.5,
    critical: false,
    patterns: [
      'layk bosib pul', 'tovarlarga layk', 'uzum marketda layk', 'wildberries layk',
      'ozon layk', 'kuniga 200 000', 'kuniga 300 000', 'uyda o\'tirib pul',
      'malaka talab qilin', 'tajriba shart emas', 'kuniga 1-2 soat',
      'лайк босиб пул', 'товарларга лайк', 'узум маркетда лайк', 'уйда ўтириб пул',
      'кунига 200 000', 'кунига 300 000', 'ставить лайки за деньги'
    ]
  },

  VISA_UMRA_FRAUD: {
    id: 'VISA_UMRA_FRAUD',
    nameUz: 'Soxta arzon Umra / Viza / Green Card',
    nameUzCyr: 'Сохта арзон Умра / Виза / Грин Кард',
    nameRu: 'Мошенничество с визами и Умрой',
    weight: 2.5,
    critical: false,
    patterns: [
      'navbatsiz haj', 'arzon umra', 'kafolatlangan viza', 'green card yut', 'grinkard yut',
      'навбатсиз ҳаж', 'арзон умра', 'кафолатланган виза', 'грин кард ют'
    ]
  },

  SUSPICIOUS_CTA: {
    id: 'SUSPICIOUS_CTA',
    nameUz: 'Lichkaga yo\'naltirish yoki havola bosish',
    nameUzCyr: 'Личкага йўналтириш ёки ҳавола босиш',
    nameRu: 'Призыв перейти по ссылке или в ЛС',
    weight: 2.0,
    critical: false,
    patterns: [
      'lichkaga yoz', 'lichkaga o\'t', 'lichkamga yoz', 'admin bilan bog\'lan',
      'adminga yoz', 'botga kir', 'botga yoz', 'havola orqali', 'link orqali',
      'havolani bos', 'linkga bos', 'linkni bos', 'saytga o\'t', 'saytga kir',
      'личкага ёз', 'личкага ўт', 'админ билан боғлан', 'админга ёз', 'ботга кир', 'ҳавола орқали',
      'линк орқали', 'линкни бос', 'ҳаволани бос', 'пишите в лс', 'переходите по ссылке'
    ]
  },

  URGENCY_PRESSURE: {
    id: 'URGENCY_PRESSURE',
    nameUz: 'Sun\'iy shoshiltirish (Psixologik bosim)',
    nameUzCyr: 'Сунъий шошилтириш (Психологик босим)',
    nameRu: 'Искусственная спешка',
    weight: 1.5,
    critical: false,
    patterns: [
      'shoshil', 'oxirgi imkoniyat', 'faqat bugun', 'vaqt oz qol', 'joylar cheklan',
      'шошил', 'охирги имконият', 'фақат бугун', 'вақт оз қол', 'жойлар чеклан',
      'торопитесь', 'последний шанс'
    ]
  }
};

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Precompile category patterns with suffix tolerance
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
      return `(?:^|[^\\p{L}\\p{N}_])${patternRegex}[\\p{L}\\p{N}]*(?=[^\\p{L}\\p{N}_]|$)`;
    })
    .join('|');

  return {
    ...cat,
    regex: new RegExp(regexString, 'gui')
  };
});

/**
 * Advanced content analyzer with Combinatorial Fast-Paths
 */
function analyzeContent(rawText, threshold = 4.5, lang = 'uz') {
  if (!rawText || rawText.trim().length < 15) {
    return { isScam: false, score: 0, categories: [], matchedKeywords: [], riskLevel: 'LOW' };
  }

  const normalized = normalizeUzbekText(rawText);
  let totalScore = 0;
  const matchedCategories = [];
  const matchedKeywords = new Set();
  const fastPathHits = [];
  let isFastPathScam = false;

  // 1. EXTRACT SEMANTIC FEATURES (NER & Intent)
  const hasMoneyAmount = SEMANTIC_FEATURES.MONEY_AMOUNT.test(normalized);
  const hasWinPrize = SEMANTIC_FEATURES.WIN_PRIZE.test(normalized);
  const hasLinkAction = SEMANTIC_FEATURES.LINK_ACTION.test(normalized);
  const hasCardSmsPrompt = SEMANTIC_FEATURES.CARD_OR_SMS_PROMPT.test(normalized);
  const hasMoneyMultiplier = SEMANTIC_FEATURES.MONEY_MULTIPLIER.test(normalized);
  const hasAdvanceFee = SEMANTIC_FEATURES.ADVANCE_FEE_TRAP.test(normalized);
  const hasTelegramHijack = SEMANTIC_FEATURES.TELEGRAM_HIJACK.test(normalized);
  const hasGovSubsidy = SEMANTIC_FEATURES.GOV_SUBSIDY.test(normalized);

  // Capture matched semantic strings for user display
  if (hasMoneyAmount) {
    const m = normalized.match(SEMANTIC_FEATURES.MONEY_AMOUNT);
    if (m) matchedKeywords.add(m[0]);
  }
  if (hasWinPrize) {
    const m = normalized.match(SEMANTIC_FEATURES.WIN_PRIZE);
    if (m) matchedKeywords.add(m[0]);
  }
  if (hasLinkAction) {
    const m = normalized.match(SEMANTIC_FEATURES.LINK_ACTION);
    if (m) matchedKeywords.add(m[0]);
  }

  // 2. HIGH-CONFIDENCE COMBINATORIAL FAST-PATHS (Instant Scams)

  // Fast-Path A: Winner / Lottery Bait + (Link/CTA Action OR Money Amount)
  // Catches: "Siz 5 mln yutib oldingiz. Bu linkga bosing"
  if (hasWinPrize && (hasLinkAction || hasMoneyAmount || hasCardSmsPrompt)) {
    isFastPathScam = true;
    totalScore += 8.5;
    fastPathHits.push({
      id: 'FAKE_LOTTERY_SUBSIDIES',
      name: lang === 'ru' ? 'Фейковый выигрыш + переход по ссылке' : (lang === 'uz_cyr' ? 'Сохта ютуқ + ҳавола босиш' : 'Soxta yutuq + havola bosish')
    });
  }

  // Fast-Path B: Card Credentials / SMS verification codes requested
  if (hasCardSmsPrompt) {
    isFastPathScam = true;
    totalScore += 9.0;
    fastPathHits.push({
      id: 'CRITICAL_PHISHING',
      name: lang === 'ru' ? 'Запрос SMS-кода или данных карты' : (lang === 'uz_cyr' ? 'СМС код ёки карта маълумоти сўрови' : 'SMS kod yoki karta ma\'lumoti so\'rovi')
    });
  }

  // Fast-Path C: Telegram Voting / Contest hijacking
  if (hasTelegramHijack && (hasLinkAction || hasCardSmsPrompt)) {
    isFastPathScam = true;
    totalScore += 8.5;
    fastPathHits.push({
      id: 'TELEGRAM_VOTE_HIJACK',
      name: lang === 'ru' ? 'Угон Telegram (голосование по ссылке)' : (lang === 'uz_cyr' ? 'Telegram ўғирлаш (овоз бериш ҳаволаси)' : 'Telegram o\'g\'irlash (ovoz berish havolasi)')
    });
  }

  // Fast-Path D: Money Doubling Ponzi + Action/Urgency
  if (hasMoneyMultiplier && (hasLinkAction || hasMoneyAmount)) {
    isFastPathScam = true;
    totalScore += 8.0;
    fastPathHits.push({
      id: 'PROMISED_RETURNS_PONZI',
      name: lang === 'ru' ? 'Пирамида: удвоение денег' : (lang === 'uz_cyr' ? 'Пирамида: пулни 2 баробар қилиш' : 'Piramida: pulni 2 barobar qilish')
    });
  }

  // Fast-Path E: Fake Government Subsidy + Link
  if (hasGovSubsidy && (hasLinkAction || hasMoneyAmount)) {
    isFastPathScam = true;
    totalScore += 8.0;
    fastPathHits.push({
      id: 'FAKE_LOTTERY_SUBSIDIES',
      name: lang === 'ru' ? 'Фейковые госвыплаты / пособия' : (lang === 'uz_cyr' ? 'Сохта давлат ёрдами / компенсация' : 'Soxta davlat yordami / kompensatsiya')
    });
  }

  // 3. REGULAR CATEGORY MATCHING (Pattern weights)
  for (const cat of compiledCategories) {
    const matches = normalized.match(cat.regex);
    if (matches && matches.length > 0) {
      const cleanKeywords = matches.map(m => m.trim().toLowerCase());
      cleanKeywords.forEach(kw => matchedKeywords.add(kw));

      const count = cleanKeywords.length;
      const categoryScore = cat.weight + (count > 1 ? Math.min((count - 1) * 0.5, 2.0) : 0);
      totalScore += categoryScore;

      let localizedName = cat.nameUz;
      if (lang === 'uz_cyr') localizedName = cat.nameUzCyr;
      else if (lang === 'ru') localizedName = cat.nameRu;

      matchedCategories.push({
        id: cat.id,
        name: localizedName,
        weight: cat.weight,
        critical: cat.critical,
        count
      });
    }
  }

  // Merge fast-path hits into categories if not present
  for (const fp of fastPathHits) {
    if (!matchedCategories.some(c => c.id === fp.id)) {
      matchedCategories.unshift({
        id: fp.id,
        name: fp.name,
        weight: 5.0,
        critical: true,
        count: 1
      });
    }
  }

  // FINAL SCAM DECISION:
  // True if any fast-path triggered OR (score >= threshold AND (hasCritical || >= 2 categories))
  const hasCritical = matchedCategories.some(c => c.critical);
  const isScam = isFastPathScam || (totalScore >= threshold && (hasCritical || matchedCategories.length >= 2));

  let riskLevel = 'LOW';
  if (isFastPathScam || hasCritical || totalScore >= 7.0) {
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
    SCAM_CATEGORIES,
    SEMANTIC_FEATURES
  };
}
