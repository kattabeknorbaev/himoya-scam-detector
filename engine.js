/**
 * Himoya Unified Intelligence Engine v5.2.0
 * Multi-layer Hybrid Cybersecurity Architecture:
 * - Layer 1: Homoglyph & Obfuscation De-anonymizer
 * - Layer 2: Machine Learning Probabilistic Text Classifier (Naive Bayes Log-Odds)
 * - Layer 3: Social Engineering & Behavioral Heuristics (Bait-to-CTA Proximity, Urgency, URL Risk)
 * - Layer 4: Semantic Intent & Fast-Path Combinatorial Rules
 * - Layer 5: Optional Local On-Device Chrome AI (Gemini Nano)
 */

// Import dependencies if in Node.js
let ML_ENGINE = null;
let HEURISTICS_ENGINE = null;
let AI_ENGINE = null;

if (typeof require !== 'undefined') {
  try { ML_ENGINE = require('./ml_classifier.js'); } catch (e) {}
  try { HEURISTICS_ENGINE = require('./heuristics.js'); } catch (e) {}
  try { AI_ENGINE = require('./ai_provider.js'); } catch (e) {}
}

function getML() {
  if (ML_ENGINE) return ML_ENGINE;
  if (typeof HimoyaML !== 'undefined') return HimoyaML;
  return null;
}

function getHeuristics() {
  if (HEURISTICS_ENGINE) return HEURISTICS_ENGINE;
  if (typeof HimoyaHeuristics !== 'undefined') return HimoyaHeuristics;
  return null;
}

function getAI() {
  if (AI_ENGINE) return AI_ENGINE;
  if (typeof HimoyaAI !== 'undefined') return HimoyaAI;
  return null;
}

// Normalized text helper: converts all Uzbek apostrophe variants to standard '
function normalizeUzbekText(text) {
  if (!text) return '';
  return text
    .replace(/[\u2018\u2019\u02BB\u0060\u00B4\u02BC\u201B\u02B9]/g, "'")
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * SEMANTIC INTENT PATTERNS (NER & Fast-Path Features)
 */
const SEMANTIC_FEATURES = {
  MONEY_AMOUNT: /\b\d+[\s.]*(?:000)?\s*(?:mln|million|миллион|млн|mlrd|milliard|миллиард|ming|минг|k|usd|dollar|доллар|\$|so['ʻ’`]?m|som|сўм|сум|евро|euro|rubl|рубль|usdt)\b/i,
  WIN_PRIZE: /\b(?:yut(?:ib|uq|dingiz|ding|di|dik|dim|gan|ing|adi|ish)?|sovg['ʻ’`]?a\w*|sovrin\w*|g['ʻ’`]?olib\w*|mukofot\w*|sovga\w*|совға\w*|ютуқ\w*|ютдингиз|ютиб|ғолиб\w*|мукофот\w*|приз\w*|выигрыш\w*|выиграли)\b/i,
  LINK_ACTION: /\b(?:link|havola|sayt|bot|web|url|линк|ҳавола|сайт|бот|ссылк\w*)\w*\s*(?:orqali\s*)?(?:bos(?:ing|ingiz|ish|adi)?|kir(?:ing|ingiz|ish|adi)?|o['ʻ’`]?t(?:ing|ingiz|ish|adi)?|och(?:ing|ingiz|ish|adi)?|кўр(?:инг)?|бос(?:инг)?|кир(?:инг)?|ўт(?:инг)?|оч(?:инг)?|переход\w*|нажми\w*|клик\w*)\b|\b(?:bos(?:ing|ingiz)?|kir(?:ing|ingiz)?|o['ʻ’`]?t(?:ing|ingiz)?|och(?:ing|ingiz)?|бос(?:инг)?|кир(?:инг)?|ўт(?:инг)?|оч(?:инг)?|нажми\w*)\s*(?:uchun\s*)?(?:link|havola|sayt|bot|линк|ҳавола|сайт|бот|ссылк\w*)\w*\b/i,
  CARD_OR_SMS_PROMPT: /\b(?:karta|plastik|карта|пластик)\w*\s*(?:raqam|parol|kod|номер|пароль|pin|muddati|cvv)\w*\b|\b(?:sms|смс)\s*(?:kod|код|tasdiqlash|тасдиқлаш)\w*\b|\b(?:kodni|kod|parolni|parol|кодни|код|пароль)\w*\s*(?:yubor|ber|ayt|yoz|kirit|юбор|бер|айт|ёз|кирит|отправ|пришл|сообщ)\w*\b/i,
  MONEY_MULTIPLIER: /\b(?:(?:2|3|5|10|ikki|uch|besh|икки|уч|беш)\s*barobar|удво\w*|2x|3x|5x|10x)\b/i,
  ADVANCE_FEE_TRAP: /\b(?:yech(?:ish|ib olish)?|chiqar(?:ish|ib olish)?|ечиб олиш|вывод\w*)\s*(?:uchun\s*)?(?:to['ʻ’`]?lov|komissiya|soliq|avans|depozit|тўлов|комиссия|солиқ|оплат\w*)\b|\b(?:oldindan|аванс)\s*(?:to['ʻ’`]?lov|тўлов|оплат\w*)\b/i,
  TELEGRAM_HIJACK: /\b(?:ovoz|голос)\w*\s*(?:ber(?:ing|ingiz|ish)?|дав\w*)\b|\b(?:tanlov|musobaqa|конкурс)\w*\s*(?:uchun|qatnash|ovoz)\w*\b/i,
  GOV_SUBSIDY: /\b(?:prezident|davlat|vazirlik|hokimlik|pensiya|mib|hududgaz|президент|давлат|пенсия)\w*\s*(?:yordam|kompensatsiya|qaror|farmon|sovg['ʻ’`]?a|ёрдам|компенсация|қарор|фармон)\w*\b|\b(?:bolalar|bola)\s*(?:uchun\s*)?(?:kompensatsiya|yordam|pul|nafaqa)\b|\b(?:болалар|бола)\s*(?:учун\s*)?(?:компенсация|ёрдам|пул|нафақа)\b/i,
  APK_TROJAN: /\b(?:(?:rasm|foto|ovoz|sovga|update|yangilanish|ilova|dastur|фото)\w*[\s._-]*apk|\.apk\b|apk\s*fayl|apk\s*ilova)\b|\b(?:bu\s*rasmda\s*senmisan|mening\s*rasmimmi|бу\s*расмда\s*сенмисан|это\s*ты\s*на\s*фото)\b/i,
  TASK_BRUSHING: /\b(?:(?:tovar|mahsulot|uzum|wildberries|ozon)\w*\s*(?:layk|baho|baholash|otziv)\w*)|(?:layk\s*bosib\s*pul\s*ishla)\b/i
};

/**
 * 12 Comprehensive Categorical Threat Definitions
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
      'kartani faollashtir', 'karta muddati', 'amal qilish muddati',
      'bir martalik kod', 'tasdiqlash kodi', 'tasdiqlash uchun kod',
      'карта рақам', 'пластик карта', 'карта парол', 'смс код', 'тасдиқлаш код',
      'кодни юбор', 'кодни айт', 'кодни ёз', 'паролни юбор', 'пин код',
      'паспорт серия', 'картангиз блокла', 'код келди', 'келган код', 'кодни бер',
      'бир марталик код', 'картанинг амал қилиш муддати',
      'номер карты', 'код из смс', 'пароль от карты', 'срок действия карты',
      'подтвердите перевод кодом', 'одноразовый пароль', 'пин код'
    ]
  },

  FAKE_BANK_SECURITY: {
    id: 'FAKE_BANK_SECURITY',
    nameUz: 'Soxta bank xavfsizlik xizmati / Blokirovka',
    nameUzCyr: 'Сохта банк хавфсизлик хизмати / Блокировка',
    nameRu: 'Фейковая служба безопасности банка',
    weight: 5.0,
    critical: true,
    patterns: [
      'xavfsizlik xizmati', 'markaziy bank xodim', 'hisobingizdan shubhali',
      'kartangiz bloklandi', 'xavfsiz hisobga', 'xavfsiz hisob raqamiga',
      'mablag\'ingizni saqlab qolish', 'operatsiyani bekor qilish', 'kreditingiz tasdiqlandi',
      'хавфсизлик хизмати', 'марказий банк ходим', 'ҳисобингиздан шубҳали',
      'картангиз блокланди', 'хавфсиз ҳисобга', 'маблағингизни сақлаб қолиш',
      'служба безопасности банка', 'подозрительная операция', 'карта заблокирована',
      'переведите средства на безопасный счет', 'отмена перевода'
    ]
  },

  MALICIOUS_APK_TROJAN: {
    id: 'MALICIOUS_APK_TROJAN',
    nameUz: 'Zararli dastur / Soxta foto APK virus',
    nameUzCyr: 'Зарарли дастур / Сохта фото АПК вирус',
    nameRu: 'Вредоносный APK-троян / Ложное фото',
    weight: 5.5,
    critical: true,
    patterns: [
      'bu rasmda senmisan', 'mening rasmimmi', 'rasmda senmisan', 'rasming chiqdi',
      'rasmlar.apk', 'foto.apk', 'telegram_update.apk', 'ovoz.apk', 'sovga.apk',
      'ilovani o\'rnat', 'dasturni yuklab ol', 'apk fayl', 'faylni oching',
      'бу расмда сенмисан', 'менинг расмимми', 'расмда сенмисан', 'расмлар.апк',
      'фото.апк', 'иловани ўрнат', 'дастурни юклаб ол', 'апк файл',
      'это ты на фото', 'посмотри фото', 'скачайте apk', 'установите обновление'
    ]
  },

  TELEGRAM_VOTE_HIJACK: {
    id: 'TELEGRAM_VOTE_HIJACK',
    nameUz: 'Telegram profilni o\'g\'irlash (Ovoz berish / Premium)',
    nameUzCyr: 'Telegram профилни ўғирлаш (Овоз бериш / Премиум)',
    nameRu: 'Угон Telegram (Голосование / Премиум)',
    weight: 4.8,
    critical: true,
    patterns: [
      'tanlovda ovoz', 'jiyanimga ovoz', 'qizimga ovoz', 'o\'g\'limga ovoz', 'singlimga ovoz',
      'ovoz bering', 'ovoz berish uchun', 'telegram premium bepul', 'bepul premium',
      'sessiyani tasdiqla', 'telegramdan kelgan kod', 'akkauntni faollashtir',
      '5 xonali kod', 'kirish kodi', 'ovozingiz qabul qilindi',
      'танловда овоз', 'жиянимга овоз', 'қизимга овоз', 'ўғлимга овоз', 'овоз беринг',
      'телеграм премиум бепул', 'бепул премиум', 'аккаунтни фаоллаштир', 'телеграмдан келган код',
      'проголосуйте за', 'детский конкурс', 'бесплатный телеграм премиум', 'код от телеграм'
    ]
  },

  GOV_COMPENSATION_FRAUD: {
    id: 'GOV_COMPENSATION_FRAUD',
    nameUz: 'Soxta davlat kompensatsiyasi va yordam puli',
    nameUzCyr: 'Сохта давлат компенсацияси ва ёрдам пули',
    nameRu: 'Фейковые государственные компенсации и выплаты',
    weight: 4.8,
    critical: true,
    patterns: [
      'prezident qaror', 'prezident farmon', 'prezident yordam', 'moddiy yordam',
      'davlat kompensatsiya', 'kompensatsiya to\'la', 'bolalar uchun pul', 'bolalar uchun yordam',
      'bola puli', 'bir martalik yordam', 'ijtimoiy yordam jamg\'arma', 'gaz kompensatsiya',
      'hududgaz subsidiya', 'o\'zbekneftgaz aksiya', 'yordam pulini olish',
      'президент қарор', 'президент фармон', 'президент ёрдам', 'моддий ёрдам',
      'давлат компенсация', 'болалар учун пул', 'бола пули', 'бир марталик ёрдам',
      'выплата от государства', 'государственная компенсация', 'пособие на детей',
      'указ президента', 'единовременная выплата'
    ]
  },

  FAKE_LOTTERY_SUBSIDIES: {
    id: 'FAKE_LOTTERY_SUBSIDIES',
    nameUz: 'Soxta yutuq va sovg\'alar (Lotereya)',
    nameUzCyr: 'Сохта ютуқ ва совғалар (Лотерея)',
    nameRu: 'Фейковые розыгрыши и лотереи',
    weight: 4.5,
    critical: false,
    patterns: [
      'yutib ol', 'yutuqqa ega', 'siz g\'olib', 'yutuqni ol', 'sovg\'ani qabul',
      'sovg\'a ol', 'click yutuq', 'payme yutuq', 'prezident sovg\'a',
      'korzinka yubiley', 'uzum yubiley', 'tasodifiy tanlov', 'bepul tarqatil',
      'omadli raqam', 'omad shou yutuq', 'avtomobil yutib',
      'ютиб ол', 'ютуққа эга', 'сиз ғолиб', 'ютуқни ол', 'совғани қабул',
      'клик ютуқ', 'пайме ютуқ', 'омадли рақам', 'автомобил ютиб',
      'вы выиграли', 'получить приз', 'юбилейный розыгрыш', 'поздравляем с победой'
    ]
  },

  PROMISED_RETURNS_PONZI: {
    id: 'PROMISED_RETURNS_PONZI',
    nameUz: 'Pulni ko\'paytirish va moliyaviy piramida',
    nameUzCyr: 'Пулни кўпайтириш ва молиявий пирамида',
    nameRu: 'Удвоение денег, финансовые пирамиды',
    weight: 4.0,
    critical: false,
    patterns: [
      'pulni ikki barobar', 'pulni 2 barobar', '2 barobar qilib', 'ikki barobar qilib',
      '3 barobar', '5 barobar', '3 soatda daromad', '2 soat ichida daromad',
      'kuniga pul ishla', 'kunlik daromad', 'oson pul top', 'tez boyi',
      'kafolatlangan daromad', 'kafolatlangan foyda', 'passiv daromad',
      '100% kafolat', '100% garantiya', 'investitsiya qilib kuniga', 'moliyaviy piramida',
      'pul tikib', 'oyiga 5000$', 'kuniga 100$', 'kuniga 500$', 'pulni ko\'paytir',
      'пулни икки баробар', 'пулни 2 баробар', 'кунига пул ишла', 'тез бойи',
      'кафолатланган даромад', '100% кафолат', '100% гарантия', 'молиявий пирамида',
      'удвоить деньги', 'гарантированный доход', 'заработок за 2 часа', 'пассивный доход'
    ]
  },

  TASK_JOB_SCAMS: {
    id: 'TASK_JOB_SCAMS',
    nameUz: 'Soxta onlayn ish va layk bosish sxemasi (Brushing)',
    nameUzCyr: 'Сохта онлайн иш ва лайк босиш схемаси',
    nameRu: 'Фейковые задания и заработок на лайках',
    weight: 3.5,
    critical: false,
    patterns: [
      'layk bosib pul', 'tovarlarga layk', 'uzum marketda layk', 'wildberries layk',
      'ozon layk', 'kuniga 200 000', 'kuniga 300 000', 'kuniga 500 000', 'uyda o\'tirib pul',
      'malaka talab qilin', 'tajriba shart emas', 'kuniga 1-2 soat', 'vazifalarni bajarib',
      'mahsulotga baho ber', 'depozit kiritish', 'darajani oshirish',
      'лайк босиб пул', 'товарларга лайк', 'узум маркетда лайк', 'уйда ўтириб пул',
      'кунига 200 000', 'кунига 300 000', 'вазифаларни бажариб',
      'ставить лайки за деньги', 'оценка товаров за деньги', 'удаленная работа без опыта'
    ]
  },

  CRYPTO_AIRDROP_SCAM: {
    id: 'CRYPTO_AIRDROP_SCAM',
    nameUz: 'Soxta kripto, airdrop va bot orqali pul topish',
    nameUzCyr: 'Сохта крипто, аирдроп ва бот орқали пул топиш',
    nameRu: 'Крипто-скам, фейковые аирдропы и боты',
    weight: 3.5,
    critical: false,
    patterns: [
      'airdrop yechib', 'notcoin yechib', 'hamster token', 'toncoin yechib',
      'kripto bot', 'bot orqali pul ishla', 'kuniga usdt', 'bepul usdt',
      'аирдроп ечиб', 'крипто бот', 'ноткоин ечиб', 'бепул усдт',
      'вывод аирдропа', 'заработок на криптовалюте', 'бесплатный airdrop'
    ]
  },

  VISA_UMRA_FRAUD: {
    id: 'VISA_UMRA_FRAUD',
    nameUz: 'Soxta arzon Umra / Viza / Green Card',
    nameUzCyr: 'Сохта арзон Умра / Виза / Грин Кард',
    nameRu: 'Мошенничество с визами и Умрой',
    weight: 3.0,
    critical: false,
    patterns: [
      'navbatsiz haj', 'arzon umra', 'kafolatlangan viza', 'green card yut', 'grinkard yut',
      'tezkor viza', 'vizaga oldindan to\'lov', 'vip umra arzon',
      'навбатсиз ҳаж', 'арзон умра', 'кафолатланган виза', 'грин кард ют',
      'дешевая умра', 'виза с гарантией', 'выигрыш грин кард'
    ]
  },

  TRAFFIC_UTILITY_DISCOUNT: {
    id: 'TRAFFIC_UTILITY_DISCOUNT',
    nameUz: 'Soxta jarima chegirmasi yoki kommunal aldov',
    nameUzCyr: 'Сохта жарима чегирмаси ёки коммунал алдов',
    nameRu: 'Фейковые скидки на штрафы и ЖКХ',
    weight: 3.0,
    critical: false,
    patterns: [
      'jarimani 50%', 'jarimani chegirma', 'yhxb jarima', 'yhxbb jarima',
      'jarima mavjud tekshir', 'qarzni bekor qil', 'elektr chegirma',
      'жаримани 50%', 'жаримани чегирма', 'йҳхб жарима', 'қарзни бекор қил',
      'скидка на штрафы 50%', 'проверьте ваш штраф', 'списание долгов по жкх'
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
      'oxirgi imkoniyat', 'shoshiling joylar', 'faqat bugun ulgurib',
      'личкага ёз', 'личкага ўт', 'админ билан боғлан', 'админга ёз', 'ботга кир', 'ҳавола орқали',
      'линк орқали', 'линкни бос', 'ҳаволани бос', 'шошилинг жойлар', 'пишите в лс', 'переходите по ссылке'
    ]
  }
};

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

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
 * Unified Multi-Layer Content Analyzer
 */
function analyzeContent(rawText, threshold = 4.5, lang = 'uz') {
  if (!rawText || rawText.trim().length < 15) {
    return { isScam: false, score: 0, mlProbability: 0, categories: [], matchedKeywords: [], riskLevel: 'LOW' };
  }

  const normalized = normalizeUzbekText(rawText);
  let totalScore = 0;
  const matchedCategories = [];
  const matchedKeywords = new Set();
  const fastPathHits = [];
  let isFastPathScam = false;

  // LAYER 1 & 3: BEHAVIORAL HEURISTICS & OBFUSCATION ANALYSIS
  const heuristics = getHeuristics();
  let heuristicData = { urgencyIndex: 0, baitProximity: false, urlRisk: false, heuristicScore: 0 };
  let deobfuscated = normalized;

  if (heuristics) {
    heuristicData = heuristics.evaluate(rawText);
    deobfuscated = heuristicData.deobfuscatedText || normalized;
    totalScore += heuristicData.heuristicScore * 0.8;
  }

  // LAYER 2: MACHINE LEARNING PROBABILISTIC CLASSIFIER (Naive Bayes)
  const ML = getML();
  let mlProbability = 0.0;
  if (ML && ML.classify) {
    const mlResult = ML.classify(deobfuscated);
    mlProbability = Math.round(mlResult.scamProbability * 100);

    // Boost score based on statistical log-odds probability
    if (mlProbability >= 85) {
      totalScore += 5.5;
    } else if (mlProbability >= 70) {
      totalScore += 3.8;
    } else if (mlProbability >= 50) {
      totalScore += 2.0;
    } else if (mlProbability <= 15) {
      totalScore -= 2.5; // Strong benign damper
    }
  }

  // LAYER 4: COMBINATORIAL FAST-PATH COMBINATIONS
  const hasMoney = SEMANTIC_FEATURES.MONEY_AMOUNT.test(deobfuscated);
  const hasWin = SEMANTIC_FEATURES.WIN_PRIZE.test(deobfuscated);
  const hasLink = SEMANTIC_FEATURES.LINK_ACTION.test(deobfuscated) || heuristicData.urlRisk;
  const hasCardOrSms = SEMANTIC_FEATURES.CARD_OR_SMS_PROMPT.test(deobfuscated);
  const hasMultiplier = SEMANTIC_FEATURES.MONEY_MULTIPLIER.test(deobfuscated);
  const hasAdvanceFee = SEMANTIC_FEATURES.ADVANCE_FEE_TRAP.test(deobfuscated);
  const hasTelegramVote = SEMANTIC_FEATURES.TELEGRAM_HIJACK.test(deobfuscated);
  const hasGovSubsidy = SEMANTIC_FEATURES.GOV_SUBSIDY.test(deobfuscated);
  const hasApkTrojan = SEMANTIC_FEATURES.APK_TROJAN.test(deobfuscated);
  const hasTaskBrushing = SEMANTIC_FEATURES.TASK_BRUSHING.test(deobfuscated);

  // Fast-Path 1: Prize / Money Bait + Call to Action Link
  if ((hasWin || hasMoney) && hasLink) {
    isFastPathScam = true;
    fastPathHits.push('Yutuq/Pul va Havola kombinatsiyasi');
    totalScore += 6.5;
  }

  // Fast-Path 2: Direct Card / SMS Phishing
  if (hasCardOrSms) {
    isFastPathScam = true;
    fastPathHits.push('Karta yoki SMS kod so\'rovi');
    totalScore += 7.0;
  }

  // Fast-Path 3: Money Multiplier / Doubling
  if (hasMultiplier && (hasMoney || hasLink || deobfuscated.includes('pul') || deobfuscated.includes('пул'))) {
    isFastPathScam = true;
    fastPathHits.push('Pulni ko\'paytirish va\'dasi');
    totalScore += 6.0;
  }

  // Fast-Path 4: Fake Government Subsidy + Link
  if (hasGovSubsidy && (hasLink || hasMoney)) {
    isFastPathScam = true;
    fastPathHits.push('Soxta davlat kompensatsiyasi');
    totalScore += 6.5;
  }

  // Fast-Path 5: Telegram Voting Account Hijack
  if (hasTelegramVote && (hasLink || deobfuscated.includes('kod') || deobfuscated.includes('код'))) {
    isFastPathScam = true;
    fastPathHits.push('Telegram profilni egallash (Ovoz berish)');
    totalScore += 6.5;
  }

  // Fast-Path 6: APK Trojan file
  if (hasApkTrojan) {
    isFastPathScam = true;
    fastPathHits.push('Zararli APK fayl / Virus');
    totalScore += 7.5;
  }

  // Fast-Path 7: Brushing Task Scam
  if (hasTaskBrushing && (hasLink || hasMoney || deobfuscated.includes('daromad') || deobfuscated.includes('даромад'))) {
    isFastPathScam = true;
    fastPathHits.push('Soxta vazifa va layk bosish sxemasi');
    totalScore += 6.0;
  }

  // Fast-Path 8: Advance Fee Trap
  if (hasAdvanceFee) {
    isFastPathScam = true;
    fastPathHits.push('Pul yechish uchun oldindan to\'lov talabi');
    totalScore += 5.5;
  }

  // Check Categorical Patterns
  for (const cat of compiledCategories) {
    const matches = deobfuscated.match(cat.regex);
    if (matches && matches.length > 0) {
      let localizedName = cat.nameUz;
      if (lang === 'uz_cyr') localizedName = cat.nameUzCyr;
      if (lang === 'ru') localizedName = cat.nameRu;

      matchedCategories.push({
        id: cat.id,
        name: localizedName,
        weight: cat.weight,
        matchCount: matches.length
      });

      matches.forEach(m => matchedKeywords.add(m.trim().toLowerCase()));
      totalScore += cat.weight * (1 + (matches.length - 1) * 0.35);

      if (cat.critical) {
        totalScore += 3.0;
      }
    }
  }

  const isScam = totalScore >= threshold || isFastPathScam;
  let riskLevel = 'LOW';
  if (totalScore >= 9.0 || isFastPathScam) {
    riskLevel = 'HIGH';
  } else if (totalScore >= threshold) {
    riskLevel = 'MEDIUM';
  }

  return {
    isScam,
    score: parseFloat(totalScore.toFixed(1)),
    mlProbability,
    riskLevel,
    categories: matchedCategories,
    matchedKeywords: Array.from(matchedKeywords).slice(0, 8),
    fastPaths: fastPathHits,
    heuristics: {
      urgencyIndex: heuristicData.urgencyIndex,
      baitProximity: heuristicData.baitProximity,
      urlRisk: heuristicData.urlRisk
    }
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    analyzeContent,
    normalizeUzbekText,
    SEMANTIC_FEATURES,
    SCAM_CATEGORIES
  };
}
