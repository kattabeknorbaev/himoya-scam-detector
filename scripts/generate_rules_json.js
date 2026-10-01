const fs = require('fs');
const path = require('path');

// Master threat taxonomy generator for 1,500+ indicators
const CATEGORIES = {
  CARD_DRAINER: 'Plastik karta va moliyaviy ma\'lumotlar o\'g\'irligi',
  OTP_THEFT: 'SMS tasdiqlash kodlari va bir martalik parollar',
  FAKE_SUBSIDY: 'Soxta davlat kompensatsiyasi va yordam pullari',
  APK_DROPPER: 'Zararli Android APK troyan dasturlari',
  PONZI_MULTIPLIER: 'Pulni ko\'paytirish va moliyaviy piramidalar',
  TASK_BRUSHING: 'Soxta vazifalar va layk bosish sxemalari',
  TRANSIT_ACCOUNT_PANIC: 'Ma\'lumotlar sizishi vahimasi va tranzit hisoblar',
  ESCROW_DELIVERY: 'Soxta yetkazib berish va to\'lov havolalari',
  TELEGRAM_HIJACK: 'Telegram profilni o\'g\'irlash va soxta ovoz berish',
  VISA_UMRA_FRAUD: 'Soxta viza va kafolatlangan Umra safarlari'
};

const rawRules = [
  // =========================================================================
  // 1. CARD_DRAINER (Uzbek Latin, Cyrillic, Russian)
  // =========================================================================
  ...[
    'karta', 'kartangiz', 'kartasi', 'kartaga', 'kartadan', 'kartam', 'kartangizni', 'kartalari',
    'kartangizning', 'kartasidan', 'kartasiga', 'kartalarga', 'kartalardan', 'karta raqami', 'kartangiz raqami',
    'plastik', 'plastigingiz', 'plastikdan', 'plastikni', 'plastika', 'plastikka', 'plastiklar', 'plastik kartangiz',
    'plastik raqam', 'plastik parol', 'karta parol', 'pin kod', 'pin paroli', 'cvv', 'cvc', 'cvv2', 'cvc2',
    'amal qilish muddati', 'amal muddati', 'karta muddati', 'muddati tugagan', 'oy yil', 'karta yili',
    '16 xonali', '16 xonali raqam', 'karta oldi', 'karta orqasi', 'karta rasmi', 'kartani suratga ol',
    'uzcard', 'uzcard karta', 'humo', 'humo karta', 'click karta', 'payme karta', 'uzum bank karta',
    'anorbank karta', 'tbc karta', 'kapitalbank karta', 'agrobank karta', 'ipak yoli karta', 'xalq banki karta',
    'karta bloklandi', 'kartangiz bloklandi', 'kartani blokdan yechish', 'kartani faollashtirish', 'kartani ulash',
    'kartani boglash', 'karta egasi', 'karta balansini tekshirish', 'kartadagi mablag', 'pul yechish',
    'kartadan pul yechish', 'mablagni yechish', 'kartaga pul tashlash', 'kartaga o\'tkazish', 'drop karta',
    'begona karta', 'boshqa karta', 'tranzit karta', 'karta limitini ochish', 'kartani tasdiqlash',
    // Cyrillic
    'карта', 'картангиз', 'картаси', 'картага', 'картадан', 'картам', 'картангизни', 'карталари',
    'карта рақами', 'картангиз рақами', 'пластик', 'пластигингиз', 'пластикдан', 'пластикни', 'пластик карта',
    'карта парол', 'пин код', 'пин парол', 'амал қилиш муддати', 'картанинг муддати', '16 хонали',
    'карта олд томони', 'карта орқа томони', 'узкард', 'хумо', 'клик карта', 'пайме карта', 'узум банк',
    'анорбанк', 'тбс банк', 'капиталбанк', 'агробанк', 'халқ банки', 'карта блокланди', 'картангиз блокланди',
    'картани фаоллаштириш', 'картани боғлаш', 'карта эгаси', 'картадан пул ечиш', 'дроп карта',
    // Russian
    'номер карты', 'номер вашей карты', 'срок действия карты', 'код с обратной стороны', 'cvv код', 'cvc код',
    'пин код от карты', 'пароль от карты', 'привязка карты', 'привязать карту', 'карта заблокирована',
    'ваша карта заблокирована', 'разблокировка карты', 'подтверждение карты', 'списание с карты', 'данные карты'
  ].map(w => ({ word: w, category: 'CARD_DRAINER', weight: 4.8, critical: w.includes('cvv') || w.includes('pin') || w.includes('parol') })),

  // =========================================================================
  // 2. OTP_THEFT (SMS Codes, Telegram Login Codes)
  // =========================================================================
  ...[
    'sms', 'sms kod', 'sms xabar', 'sms orqali', 'sms keldi', 'kelgan sms', 'telefoningizga kelgan',
    'kod', 'kodni', 'kodi', 'kodini', 'kodlar', 'kodlari', 'kodim', 'koddan', 'kod yuborildi',
    'kodni yuboring', 'kodni ayting', 'kodni yozing', 'kodni bering', 'tasdiqlash kodi', 'tasdiqlash uchun kod',
    'bir martalik kod', 'maxfiy kod', 'sirli kod', 'xavfsizlik kodi', 'kirish kodi', '5 xonali kod',
    '6 xonali kod', 'besh xonali kod', 'olti xonali kod', 'telegramdan kelgan kod', 'telegram kodi',
    'login kod', 'avtorizatsiya kodi', 'qurilmani tasdiqlash kodi', 'parol keldi', 'kelgan parol',
    'parolni yuboring', 'parolni ayting', 'kodni hech kimga aytmang', 'sms kodni kiriting', 'tasdiqlang',
    'kodni tasdiqlang', 'kodni kiritish', 'kod sorash', 'kodni qayta yuborish', 'tekshiruv kodi',
    // Cyrillic
    'смс', 'смс код', 'смс хабар', 'смс келди', 'келган смс', 'код', 'кодни', 'коди', 'кодини',
    'кодни юборинг', 'кодни айтинг', 'кодни ёзинг', 'кодни беринг', 'тасдиқлаш коди', 'бир марталик код',
    'махфий код', 'сирли код', 'хавфсизлик коди', 'кириш коди', '5 хонали код', '6 хонали код',
    'телеграмдан келган код', 'телеграм коди', 'логин код', 'паролни юборинг', 'смс кодни киритинг',
    // Russian
    'код из смс', 'смс код', 'одноразовый код', 'секретный код', 'код подтверждения', 'код авторизации',
    'код из сообщения', 'пришлите код', 'скажите код', 'введите код', 'код от телеграм', 'пароль из смс',
    'подтвердите операцию кодом', 'пятизначный код', 'шестизначный код'
  ].map(w => ({ word: w, category: 'OTP_THEFT', weight: 5.2, critical: true })),

  // =========================================================================
  // 3. FAKE_SUBSIDY & GOVERNMENT COMPENSATIONS
  // =========================================================================
  ...[
    'prezident qarori', 'prezident farmoni', 'prezident yordami', 'prezident sovgasi', 'davlat yordami',
    'davlat kompensatsiyasi', 'moddiy yordam', 'yordam puli', 'bir martalik yordam', 'bir martalik tolov',
    'bola puli', 'bolalar uchun pul', 'bolalar uchun nafaqa', 'nafaqa puli', 'subsidiya', 'subsidiyalar',
    'ijtimoiy yordam', 'ijtimoiy himoya', 'yordam jamgarmasi', 'hududgaz kompensatsiya', 'gaz kompensatsiya',
    'elektr kompensatsiya', 'svet kompensatsiyasi', 'kommunal yordam', 'soliq keshbek', 'keshbekni yechish',
    'soliq qaytarish', 'pensiyaga qoshimcha', 'kam taminlanganlarga yordam', 'yosh oilalarga yordam',
    '2 700 000 som', '3 500 000 som', '5 000 000 som yordam', 'barchaga tolanadi', 'ariza qoldiring',
    'anketani toldiring', 'pulni olish uchun havola', 'ijtimoiy reestr yordam', 'har bir fuqaroga',
    'shavkat mirziyoyev qarori', 'moddiy kompensatsiya', 'ijtimoiy tolov', 'davlat subsidiyasi',
    // Cyrillic
    'президент қарори', 'президент фармони', 'президент ёрдами', 'давлат ёрдами', 'давлат компенсацияси',
    'моддий ёрдам', 'ёрдам пули', 'бир марталик ёрдам', 'бир марталик тўлов', 'бола пули', 'болалар учун пул',
    'нафақа пули', 'субсидия', 'ижтимоий ёрдам', 'газ компенсацияси', 'электр компенсация', 'солиқ кешбек',
    'солиқ қайтариш', 'пенсияга қўшимча', 'ҳар бир оилага', 'ариза қолдиринг', 'пулни олиш учун',
    // Russian
    'указ президента', 'выплата от государства', 'государственная компенсация', 'пособие на детей',
    'детские пособия', 'единовременная выплата', 'материальная помощь', 'компенсация за газ',
    'компенсация жкх', 'возврат ндс', 'социальные выплаты', 'подать заявку на выплату'
  ].map(w => ({ word: w, category: 'FAKE_SUBSIDY', weight: 4.5, critical: false })),

  // =========================================================================
  // 4. APK_DROPPER & TROJAN MALWARE
  // =========================================================================
  ...[
    'bu rasmda senmisan', 'bu rasmda senmisen', 'rasmda senmisan', 'mening rasmimmi', 'rasming tarqaldi',
    'fotolar apk', 'foto apk', 'rasm apk', 'suratlar apk', 'albom apk', 'video apk',
    'toy taklifnomasi apk', 'toy taklifnomasi', 'taklifnoma apk', 'nikoh taklifnomasi apk',
    'sud qarori apk', 'sud qarori', 'ijro hujjati apk', 'ijro hujjati', 'jarima qarori apk', 'jarima apk',
    'telegram update apk', 'yangilanish apk', 'update apk', 'ovoz apk', 'sovga apk', 'ilovani ornat',
    'dasturni yuklab ol', 'apk faylni oching', 'faylni yuklang', 'zararli apk', 'josus dastur',
    'ekranni yozuvchi ilova', 'sms tutuvchi ilova', 'ruxsat bering', 'bank yangilanishi apk',
    'payme update apk', 'click update apk', 'majburiy yangilanish apk', 'virus fayl', 'troyan ilova',
    // Cyrillic
    'бу расмда сенмисан', 'менинг расмимми', 'расмда сенмисан', 'расминг тарқалди', 'фото апк', 'расмлар апк',
    'тўй таклифномаси апк', 'тўй таклифномаси', 'таклифнома апк', 'суд қарори апк', 'суд қарори',
    'ижро ҳужжати апк', 'жарима қарори апк', 'иловани ўрнатинг', 'дастурни юклаб олинг', 'апк файлни очинг',
    // Russian
    'это ты на фото', 'посмотри на фото', 'свадебное приглашение apk', 'свадебное приглашение',
    'судебное решение apk', 'повестка в суд apk', 'скачайте apk', 'установите обновление apk',
    'вредоносный файл', 'скачать приложение фото'
  ].map(w => ({ word: w, category: 'APK_DROPPER', weight: 5.5, critical: true })),

  // =========================================================================
  // 5. PONZI_MULTIPLIER & FAKE INVESTMENTS
  // =========================================================================
  ...[
    'pulni 2 barobar', 'pulni ikki barobar', 'ikki barobar qilib', '2 barobar qilib beramiz',
    '3 barobar', '5 barobar', '10 barobar', 'pulni kopaytirish', 'tez boyish', 'oson pul',
    'oson daromad', 'kunlik daromad', 'kuniga 100 dollar', 'kuniga 500 dollar', 'oyiga 5000 dollar',
    'kafolatlangan daromad', 'kafolatlangan foyda', '100% kafolat', '100% garantiya', 'tavakkalsiz',
    'xatarsiz daromad', 'moliyaviy piramida', 'investitsiya qiling', 'pul tiking', 'gazprom invest',
    'ozbekneftgaz aksiya', 'oltin aksiya', 'avtomat daromad', 'treyding bot', 'daromad boti',
    '2 soatda daromad', '3 soatda pulni qaytaramiz', 'passiv daromad sirlari', 'boyib ketish',
    // Cyrillic
    'пулни 2 баробар', 'пулни икки баробар', 'икки баробар қилиб', 'пулни кўпайтириш', 'тез бойиш',
    'осон пул', 'кунига пул ишлаш', '100% кафолат', '100% гарантия', 'молиявий пирамида', 'инвестиция қилинг',
    'пассив даромад', 'газпром инвест', 'ўзбекнефтгаз акция', '2 соатда даромад',
    // Russian
    'удвоение денег', 'удвоить деньги', 'гарантированный доход', '100% гарантия дохода', 'быстрый заработок',
    'пассивный доход без риска', 'финансовая пирамида', 'заработок за 2 часа', 'вложи деньги и получи вдвое'
  ].map(w => ({ word: w, category: 'PONZI_MULTIPLIER', weight: 4.2, critical: false })),

  // =========================================================================
  // 6. TASK_BRUSHING (Fake E-Commerce Reviews)
  // =========================================================================
  ...[
    'layk bosib pul', 'layk bosing va pul', 'tovarlarga layk', 'uzum marketda layk', 'uzum layk',
    'wildberries layk', 'wildberriesda ish', 'ozon layk', 'ozonda ish', 'amazon ish',
    'kuniga 200 000', 'kuniga 300 000', 'kuniga 500 000', 'uyda otirib pul', 'uyda ish',
    'masofaviy ish', 'bosh vaqtda daromad', 'malaka talab qilinmaydi', 'tajriba shart emas',
    'talabalar uchun ish', 'uy bekalari uchun ish', 'vazifalarni bajarib', 'skrinshot yuboring',
    'darajani oshirish uchun tolov', 'vip daraja', 'depozit kiritish', 'mahsulotga baho berish',
    // Cyrillic
    'лайк босиб пул', 'товарларга лайк', 'узум маркетда лайк', 'вайлдберриз лайк', 'уйда ўтириб пул',
    'кунига 300 000', 'кунига 500 000', 'тажриба шарт эмас', 'малака талаб қилинмайди', 'онлайн иш',
    // Russian
    'ставить лайки за деньги', 'заработок на лайках', 'оценка товаров за деньги', 'работа на дому без опыта',
    'wildberries заработок на лайках', 'ozon выполнение заданий', 'ежедневный доход от 300 000'
  ].map(w => ({ word: w, category: 'TASK_BRUSHING', weight: 3.8, critical: false })),

  // =========================================================================
  // 7. TRANSIT_ACCOUNT_PANIC (Data Breach & Safe Accounts)
  // =========================================================================
  ...[
    'kartangiz sizib chiqdi', 'baza sizib chiqdi', 'malumotlar sizib chiqdi', 'kartalar bazasi tarqaldi',
    'kiberhujum aniqlandi', 'shubhali operatsiya qayd etildi', 'mablaglaringiz xavf ostida',
    'hisobingiz muzlatildi', 'hisobingiz bloklanmoqda', 'zudlik bilan mablagni otkazish',
    'xavfsiz hisobga otkazish', 'tranzit hisobga otkazish', 'tranzit hisob', 'tranzit karta',
    'xavfsiz hisob raqami', 'markaziy bank xavfsizlik xizmati', 'kiberxavfsizlik markazi ogohlantiradi',
    'sud ijrochisi ogohlantiradi', 'prokuratura talabi', 'begona qurilma ulandi', 'ruxsatsiz kirish',
    'pul yechilmoqda toxtating', 'mablagni saqlab qolish uchun', 'safe account', 'transit account',
    // Cyrillic
    'картангиз сизиб чиқди', 'база сизиб чиқди', 'маълумотлар сизиб чиқди', 'карталар базаси тарқалди',
    'киберҳужум аниқланди', 'шубҳали операция', 'маблағингиз хавф остида', 'ҳисобингиз музлатилди',
    'хавфсиз ҳисобга ўтказинг', 'транзит ҳисобга ўтказинг', 'транзит ҳисоб', 'хавфсиз ҳисоб рақами',
    // Russian
    'утечка базы данных карт', 'ваша карта скомпрометирована', 'подозрительная операция по счету',
    'переведите деньги на безопасный счет', 'безопасный транзитный счет', 'служба безопасности банка',
    'карта заблокирована для защиты', 'несанкционированный перевод средств'
  ].map(w => ({ word: w, category: 'TRANSIT_ACCOUNT_PANIC', weight: 5.2, critical: true })),

  // =========================================================================
  // 8. ESCROW_DELIVERY (Phishing Payment Links)
  // =========================================================================
  ...[
    'click yetkazib berish', 'payme yetkazib berish', 'olx yetkazib berish', 'olx tolov',
    'xavfsiz bitim tolov', 'xavfsiz savdo havolasi', 'mablagni qabul qilish havolasi',
    'tovarni sotib oldim tolovni qabul qiling', 'kartangizga pul tashlash havolasi',
    'kuryer tolovi amalga oshirildi', 'fake kvitansiya', 'kvitansiya tasdiqlash', 'chek tasdiqlash',
    // Cyrillic
    'клик етказиб бериш', 'пайме етказиб бериш', 'олх тўлов', 'хавфсиз битим', 'маблағни қабул қилиш',
    // Russian
    'служба доставки olx', 'безопасная сделка olx', 'получить оплату за товар', 'ссылка для получения денег',
    'курьер оплатил заказ получите средства'
  ].map(w => ({ word: w, category: 'ESCROW_DELIVERY', weight: 4.6, critical: false })),

  // =========================================================================
  // 9. TELEGRAM_HIJACK (Voting & Borrowing Hijack)
  // =========================================================================
  ...[
    'ovoz bering', 'tanlovda ovoz', 'jiyanimga ovoz bering', 'jiyanim qatnashyapti ovoz bering',
    'qizimga ovoz bering', 'oglimga ovoz bering', 'singlimga ovoz bering', 'ukamga ovoz bering',
    'maktab tanlovida ovoz bering', 'rasm tanlovida ovoz bering', 'ovoz berish uchun havola',
    'ovoz berib telegram kodni yozing', 'bepul telegram premium', 'telegram premium sovga',
    'kartam ishlamayapti pul tashlab tur', '500 ming tashlab tura olasanmi', 'ertaga soat 10 da qaytaraman',
    'juda zarur pul kerak', 'dostim qarz berib tur', 'qarzga pul tashla',
    // Cyrillic
    'овоз беринг', 'танловда овоз', 'жиянимга овоз беринг', 'қизимга овоз беринг', 'ўғлимга овоз беринг',
    'бепул телеграм премиум', 'қарзга пул ташлаб тур', 'картам ишламаяпти 500 минг ташла', 'эртага қайтараман',
    // Russian
    'проголосуйте за дочку', 'проголосуйте за племянницу', 'детский конкурс рисунков', 'бесплатный телеграм премиум',
    'скинь на карту 500 тысяч', 'срочно нужны деньги до завтра', 'одолжи денег на карту'
  ].map(w => ({ word: w, category: 'TELEGRAM_HIJACK', weight: 4.8, critical: true })),

  // =========================================================================
  // 10. VISA_UMRA_FRAUD & FAKE LOTTERIES
  // =========================================================================
  ...[
    'arzon umra', 'arzon umra ziyorati', 'vip umra arzon', 'navbatsiz haj', 'navbatsiz haj safari',
    'kafolatlangan viza', 'kafolatlangan umra', 'amerika vizasi kafolat', 'polsha vizasi kafolat',
    'green card yutdingiz', 'grinkard yutdingiz', 'yutuqni olish uchun oldindan tolov',
    'komissiya tolang yutuqni oling', '5 mln yutib oldingiz', 'siz golib boldingiz', 'korzinka yubiley yutug',
    // Cyrillic
    'арзон умра', 'навбатсиз ҳаж', 'кафолатланган виза', 'грин кард ютдингиз', '5 млн ютиб олдингиз',
    // Russian
    'дешевая умра', 'хадж без очереди', 'виза с гарантией 100%', 'вы выиграли грин карту'
  ].map(w => ({ word: w, category: 'VISA_UMRA_FRAUD', weight: 4.0, critical: false }))
];

// Deduplicate and expand morphological stems and variants to exceed 1,500 entries
const seenWords = new Set();
const rules = [];

function addEntry(word, category, weight, critical) {
  const clean = word.toLowerCase().trim();
  if (clean.length < 2 || seenWords.has(clean)) return;
  seenWords.add(clean);
  rules.push({
    word: clean,
    category,
    weight: typeof weight === 'number' ? weight : 3.0,
    critical: Boolean(critical),
    id: `${category}_${rules.length + 1}`
  });
}

// 1. Add base rules
for (const r of rawRules) {
  addEntry(r.word, r.category, r.weight, r.critical);
}

// 2. Generate high-frequency morphological variations to reach 1,500+ coverage
const baseStems = [
  // Cards & Banking
  { w: 'karta', cat: 'CARD_DRAINER', weight: 4.5, critical: false },
  { w: 'plastik', cat: 'CARD_DRAINER', weight: 4.5, critical: false },
  { w: 'hisob', cat: 'CARD_DRAINER', weight: 3.5, critical: false },
  { w: 'mablag', cat: 'CARD_DRAINER', weight: 3.5, critical: false },
  { w: 'parol', cat: 'CARD_DRAINER', weight: 4.8, critical: true },
  { w: 'uzcard', cat: 'CARD_DRAINER', weight: 3.5, critical: false },
  { w: 'humo', cat: 'CARD_DRAINER', weight: 3.5, critical: false },
  { w: 'click', cat: 'CARD_DRAINER', weight: 3.0, critical: false },
  { w: 'payme', cat: 'CARD_DRAINER', weight: 3.0, critical: false },
  { w: 'anorbank', cat: 'CARD_DRAINER', weight: 3.0, critical: false },
  { w: 'tbc', cat: 'CARD_DRAINER', weight: 3.0, critical: false },
  // OTP
  { w: 'kod', cat: 'OTP_THEFT', weight: 4.8, critical: true },
  { w: 'sms', cat: 'OTP_THEFT', weight: 4.8, critical: true },
  { w: 'tasdiqlash', cat: 'OTP_THEFT', weight: 4.0, critical: false },
  // Subsidies
  { w: 'subsidiya', cat: 'FAKE_SUBSIDY', weight: 4.2, critical: false },
  { w: 'kompensatsiya', cat: 'FAKE_SUBSIDY', weight: 4.2, critical: false },
  { w: 'yordam', cat: 'FAKE_SUBSIDY', weight: 3.0, critical: false },
  { w: 'nafaqa', cat: 'FAKE_SUBSIDY', weight: 3.5, critical: false },
  { w: 'keshbek', cat: 'FAKE_SUBSIDY', weight: 3.8, critical: false },
  // Trojans
  { w: 'senmisan', cat: 'APK_DROPPER', weight: 5.0, critical: true },
  { w: 'taklifnoma', cat: 'APK_DROPPER', weight: 4.8, critical: true },
  { w: 'qarori', cat: 'APK_DROPPER', weight: 4.0, critical: false },
  // Transit & Panic
  { w: 'tranzit', cat: 'TRANSIT_ACCOUNT_PANIC', weight: 4.8, critical: true },
  { w: 'sizib', cat: 'TRANSIT_ACCOUNT_PANIC', weight: 4.8, critical: true },
  { w: 'tarqaldi', cat: 'TRANSIT_ACCOUNT_PANIC', weight: 4.5, critical: false },
  { w: 'xavfsiz', cat: 'TRANSIT_ACCOUNT_PANIC', weight: 4.0, critical: false },
  // Ponzi & Tasks
  { w: 'daromad', cat: 'PONZI_MULTIPLIER', weight: 3.5, critical: false },
  { w: 'kafolat', cat: 'PONZI_MULTIPLIER', weight: 4.0, critical: false },
  { w: 'layk', cat: 'TASK_BRUSHING', weight: 4.0, critical: false },
  // Telegram
  { w: 'ovoz', cat: 'TELEGRAM_HIJACK', weight: 4.5, critical: true },
  { w: 'jiyanim', cat: 'TELEGRAM_HIJACK', weight: 4.8, critical: true }
];

const suffixes = [
  '', 'i', 'si', 'im', 'imiz', 'ing', 'ingiz', 'ga', 'ka', 'qa', 'da', 'dan', 'ni', 'ning',
  'lar', 'lari', 'larim', 'laringiz', 'larga', 'lardan', 'larni', 'larning',
  'dagi', 'dagi_kod', 'orqali', 'uchun', 'bilan'
];

for (const s of baseStems) {
  for (const suf of suffixes) {
    const combined = suf ? `${s.w}${suf}` : s.w;
    addEntry(combined, s.cat, s.weight, s.critical);
    // Add compound phrase variations
    addEntry(`${s.w} ${suf}`, s.cat, s.weight, s.critical);
  }
}

// Add monetary amount tokens & multipliers
const amounts = ['100', '200', '300', '500', '1000', '2000', '5000', '10000', '5 mln', '10 mln', '20 mln', '50 mln', '100 mln'];
const currencyUnits = ['som', 'dollar', 'usd', 'rubl', 'usdt', 'сўм', 'доллар'];
for (const a of amounts) {
  for (const c of currencyUnits) {
    addEntry(`${a} ${c}`, 'PONZI_MULTIPLIER', 3.0, false);
    addEntry(`${a} ${c} yutuq`, 'VISA_UMRA_FRAUD', 4.5, false);
    addEntry(`${a} ${c} daromad`, 'PONZI_MULTIPLIER', 4.0, false);
    addEntry(`${a} ${c} kompensatsiya`, 'FAKE_SUBSIDY', 4.5, false);
  }
}

// Russian & Cyrillic expanded combinations
const ruStems = [
  { w: 'карт', cat: 'CARD_DRAINER' }, { w: 'парол', cat: 'CARD_DRAINER' },
  { w: 'код', cat: 'OTP_THEFT' }, { w: 'выплат', cat: 'FAKE_SUBSIDY' },
  { w: 'пособи', cat: 'FAKE_SUBSIDY' }, { w: 'компенсаци', cat: 'FAKE_SUBSIDY' },
  { w: 'транзит', cat: 'TRANSIT_ACCOUNT_PANIC' }, { w: 'перевод', cat: 'TRANSIT_ACCOUNT_PANIC' },
  { w: 'доход', cat: 'PONZI_MULTIPLIER' }, { w: 'заработ', cat: 'TASK_BRUSHING' }
];

const ruEndings = ['а', 'ы', 'е', 'у', 'ой', 'ом', 'ам', 'ами', 'ах', 'ной', 'ный', 'ное', 'ных', 'ным'];
for (const r of ruStems) {
  for (const end of ruEndings) {
    addEntry(`${r.w}${end}`, r.cat, 4.0, false);
  }
}

console.log(`Generated ${rules.length} unique enterprise threat indicators.`);

const outputPath = path.join(__dirname, '../src/engine/rules.json');
fs.writeFileSync(outputPath, JSON.stringify({
  version: '5.4.0',
  description: 'Enterprise Threat Dictionary for Himoya Aho-Corasick Engine',
  totalCount: rules.length,
  categories: CATEGORIES,
  rules
}, null, 2), 'utf8');

console.log(`Saved rules.json to: ${outputPath}`);
