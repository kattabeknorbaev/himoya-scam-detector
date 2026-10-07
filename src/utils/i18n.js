/**
 * Himoya i18n Localization Dictionary v5.5.0
 * Comprehensive multi-lingual support:
 * - English (EN)
 * - O'zbekcha / Latin (UZ)
 * - Ўзбекча / Cyrillic (UZ_CYR)
 * - Русский (RU)
 */

const HIMOYA_I18N = {
  en: {
    extensionTitle: "Himoya",
    tagline: "Client-Side Cyber Defense",
    statusActive: "Protection Active & Shielding",
    statusDisabled: "Protection Paused",
    threatsOnPage: "suspicious items on this page",
    threatsNone: "No threats detected on page",
    threatsDetected: "{count} threats neutralized",
    statsToday: "Blocked Today",
    statsTotal: "Total Blocked",
    whitelistBtnTrust: "Trust Site",
    whitelistBtnTrusted: "Trusted",
    sensitivityLabel: "Detection Sensitivity:",
    sensitivityStrict: "Strict",
    sensitivityBalanced: "Standard",
    sensitivityRelaxed: "Relaxed",
    audioAlertLabel: "Audio Warning",
    checkerTab: "Scanner",
    rulesTab: "Guidelines",
    reportTab: "Report",
    checkerPlaceholder: "Paste suspicious Telegram message, SMS, or link here...",
    checkerBtn: "Analyze Message",
    pasteBtn: "Paste & Scan",
    quickScan: "Quick Clipboard Scan",
    testSimulation: "Simulate Attack",
    emptyInputAlert: "Please enter or paste a message or link first!",
    analyzingText: "AI Analyzing...",
    shortcutHint: "Ctrl+Enter ↵",
    clearText: "Clear",
    copied: "Copied!",
    copyDiag: "Copy Diagnostics",
    checkerSafe: "🛡️ NO SUSPICIOUS PATTERNS DETECTED",
    checkerSafeDesc: "No card drainer, OTP theft, or social engineering indicators found.",
    checkerScam: "🚨 ALERT: SCAM DETECTED",
    cardTitle: "Himoya: Suspicious Post Detected",
    cardDesc: "Indicators of financial fraud or credential exfiltration detected (Score: {score}).",
    cardReveal: "👁️ Reveal",
    cardDismiss: "✓ False Positive (Safe)",
    ribbonTitle: "Himoya: Warning Dismissed",
    ribbonReblur: "Re-hide Content",
    riskHigh: "🚨 High Risk",
    riskMedium: "⚠️ Suspicious",
    reportLink: "⚠️ Report New Scam Pattern",
    reportModalTitle: "Contribute Threat Intelligence",
    reportTypeLabel: "Scam Vector:",
    reportContentLabel: "Suspicious text, link, or bot username:",
    reportSubmitBtn: "Copy & Record Locally",
    reportTelegramBtn: "Dispatch to Telegram",
    reportSaveBtn: "Save Report",
    historyTitle: "Recent Reported Threats:",
    reportSuccess: "Thank you! Threat logged and queued for rule indexing.",
    rules: [
      {
        title: "1. Never Share SMS Verification Codes",
        desc: "Bank operators and security personnel never ask for your 5 or 6-digit SMS verification code or CVV."
      },
      {
        title: "2. No Legitimate System Doubles Money Overnight",
        desc: "Promised guaranteed returns (e.g., turning 100k into 500k in hours) are 100% Ponzi schemes."
      },
      {
        title: "3. Never Pay Advance Fees to Claim a Prize",
        desc: "Legitimate lotteries or subsidies do not require insurance, registration fee, or transfer deposits."
      },
      {
        title: "4. Never Install Unknown .APK Files",
        desc: "Files masked as wedding invitations, court orders, or photo albums are banking trojans."
      },
      {
        title: "5. Beware of Contest Voting Links",
        desc: "'Vote for my relative' lures steal your Telegram session to solicit emergency loans from contacts."
      }
    ]
  },

  uz: {
    extensionTitle: "Himoya",
    tagline: "O'zbek xalqi xavfsizligi uchun",
    statusActive: "Himoya faol ishlamoqda",
    statusDisabled: "Himoya to'xtatilgan",
    threatsOnPage: "ushbu sahifada shubhali xabarlar",
    threatsNone: "Sahifada xavf aniqlanmadi",
    threatsDetected: "{count} ta xavf bartaraf etildi",
    statsToday: "Bugun to'xtatildi",
    statsTotal: "Jami to'xtatildi",
    whitelistBtnTrust: "Ishonchli",
    whitelistBtnTrusted: "O'chirilgan",
    sensitivityLabel: "Aniqlash sezgirligi:",
    sensitivityStrict: "Kuchli",
    sensitivityBalanced: "Standart",
    sensitivityRelaxed: "Yengil",
    audioAlertLabel: "Ovozli ogohlantirish",
    checkerTab: "Tekshirish",
    rulesTab: "Qoidalar",
    reportTab: "Xabar qilish",
    checkerPlaceholder: "Telegram yoki SMSdan kelgan shubhali xabarni shu yerga qo'ying...",
    checkerBtn: "Xabarni tekshirish",
    pasteBtn: "Klipborddan tekshirish",
    quickScan: "Klipborddan tekshirish",
    testSimulation: "Sinov hujumi",
    emptyInputAlert: "Iltimos, avval tekshirish uchun matn yoki havola kiriting!",
    analyzingText: "AI tahlil qilmoqda...",
    shortcutHint: "Ctrl+Enter ↵",
    clearText: "Tozalash",
    copied: "Nusxalandi!",
    copyDiag: "Natijani nusxalash",
    checkerSafe: "🛡️ SHUBHALI BELGILAR TOPILMADI (XAVFSIZ)",
    checkerSafeDesc: "Xabarda moliyaviy firibgarlik yoki fishing alomatlari aniqlanmadi.",
    checkerScam: "🚨 XAVF: FIRIBGARLIK ANIQLANDI",
    cardTitle: "Himoya: Shubhali post aniqlandi",
    cardDesc: "Ushbu xabarda firibgarlik yoki shaxsiy ma'lumotlarni o'g'irlash alomatlari topildi (Ball: {score}).",
    cardReveal: "👁️ Ko'rish",
    cardDismiss: "✓ Xatolik (Xavfsiz)",
    ribbonTitle: "Himoya: Ogohlantirish ochildi",
    ribbonReblur: "Qayta yashirish",
    riskHigh: "🚨 Yuqori xavf",
    riskMedium: "⚠️ Shubhali xabar",
    reportLink: "⚠️ Yangi firibgarlikni xabar qilish",
    reportModalTitle: "Yangi firibgarlik haqida xabar bering",
    reportTypeLabel: "Firibgarlik turi:",
    reportContentLabel: "Shubhali matn, havola yoki bot:",
    reportSubmitBtn: "Nusxalash va saqlash",
    reportTelegramBtn: "Telegram orqali yuborish",
    reportSaveBtn: "Nusxalash va saqlash",
    historyTitle: "Oxirgi qayd etilgan xabarlar:",
    reportSuccess: "Rahmat! Xabaringiz qayd etildi va tahlilga kiritildi.",
    rules: [
      {
        title: "1. SMS kodni hech kimga aytmang",
        desc: "Bank xodimi yoki operator hech qachon kartangiz SMS kodini yoki parolini so'ramaydi."
      },
      {
        title: "2. Pulni 2 barobar qiladigan mo'jiza yo'q",
        desc: "Hech kim sizga 100 ming so'mni 1 soatda 500 ming qilib bermaydi. Bu 100% piramida."
      },
      {
        title: "3. Yutuq uchun oldindan to'lov qilmang",
        desc: "Haqiqiy yutuqni olish uchun komissiya, soliq yoki kartani faollashtirish to'lovi talab qilinmaydi."
      },
      {
        title: "4. Notanish .APK fayllarni aslo ochmang",
        desc: "To'y taklifnomasi yoki sud qarori niqobidagi fayllar bank kartangizdagi pullarni o'g'irlaydi."
      },
      {
        title: "5. 'Ovoz bering' havolalariga Telegram kodini kiritmang",
        desc: "Telegramingiz o'g'irlanadi va tanishlaringizdan nomingizdan qarz so'rashadi."
      }
    ]
  },

  uz_cyr: {
    extensionTitle: "Ҳимоя",
    tagline: "Ўзбек халқи хавфсизлиги учун",
    statusActive: "Ҳимоя фаол ишламоқда",
    statusDisabled: "Ҳимоя тўхтатилган",
    threatsOnPage: "ушбу саҳифада шубҳали хабарлар",
    threatsNone: "Саҳифада хавф аниқланмади",
    threatsDetected: "{count} та хавф бартараф этилди",
    statsToday: "Бугун тўхтатилди",
    statsTotal: "Жами тўхтатилди",
    whitelistBtnTrust: "Ишончли",
    whitelistBtnTrusted: "Ўчирилган",
    sensitivityLabel: "Аниқлаш сезгирлиги:",
    sensitivityStrict: "Кучли",
    sensitivityBalanced: "Стандарт",
    sensitivityRelaxed: "Енгил",
    audioAlertLabel: "Овозли огоҳлантириш",
    checkerTab: "Текшириш",
    rulesTab: "Қоидалар",
    reportTab: "Хабар қилиш",
    checkerPlaceholder: "Телеграм ёки СМСдан келган шубҳали хабарни шу ерга қўйинг...",
    checkerBtn: "Хабарни текшириш",
    pasteBtn: "Клипборддан текшириш",
    quickScan: "Клипборддан текшириш",
    testSimulation: "Синов ҳужуми",
    emptyInputAlert: "Илтимос, аввал текшириш учун матн ёки ҳавола киритинг!",
    analyzingText: "ИИ таҳлил қилмоқда...",
    shortcutHint: "Ctrl+Enter ↵",
    clearText: "Тозалаш",
    copied: "Нусхаланди!",
    copyDiag: "Натижани нусхалаш",
    checkerSafe: "🛡️ ШУБҲАЛИ БЕЛГИЛАР ТОПИЛМАДИ (ХАВФСИЗ)",
    checkerSafeDesc: "Хабарда молиявий фирибгарлик ёки фишинг аломатлари аниқланмади.",
    checkerScam: "🚨 ХАВФ: ФИРИБГАРЛИК АНИҚЛАНДИ",
    cardTitle: "Ҳимоя: Шубҳали пост аниқланди",
    cardDesc: "Ушбу хабарда фирибгарлик ёки шахсий маълумотларни ўғирлаш аломатлари топилди (Балл: {score}).",
    cardReveal: "👁️ Кўриш",
    cardDismiss: "✓ Хатолик (Хавфсиз)",
    ribbonTitle: "Ҳимоя: Огоҳлантириш очилди",
    ribbonReblur: "Қайта яшириш",
    riskHigh: "🚨 Юқори хавф",
    riskMedium: "⚠️ Шубҳали хабар",
    reportLink: "⚠️ Янги фирибгарликни хабар қилиш",
    reportModalTitle: "Янги фирибгарлик ҳақида хабар беринг",
    reportTypeLabel: "Фирибгарлик тури:",
    reportContentLabel: "Шубҳали матн, ҳавола ёки бот:",
    reportSubmitBtn: "Нусхалаш ва сақлаш",
    reportTelegramBtn: "Телеграм орқали юбориш",
    reportSaveBtn: "Нусхалаш ва сақлаш",
    historyTitle: "Охирги қайд этилган хабарлар:",
    reportSuccess: "Раҳмат! Хабарингиз қайд этилди ва таҳлилга киритилди.",
    rules: [
      {
        title: "1. СМС кодни ҳеч кимга айтманг",
        desc: "Банк ходими ёки оператор ҳеч қачон картангиз СМС кодини ёки паролини сўрамайди."
      },
      {
        title: "2. Пулни 2 баробар қиладиган мўъжиза йўқ",
        desc: "Ҳеч ким сизга 100 минг сўмни 1 соатда 500 минг қилиб бермайди. Бу 100% пирамида."
      },
      {
        title: "3. Ютуқ учун олдиндан тўлов қилманг",
        desc: "Ҳақиқий ютуқни олиш учун комиссия, солиқ ёки картани фаоллаштириш тўлови талаб қилинмайди."
      },
      {
        title: "4. Нотаниш .APK файлларни асло очманг",
        desc: "Тўй таклифномаси ёки суд қарори ниқобидаги файллар банк картангиздаги пулларни ўғирлайди."
      },
      {
        title: "5. 'Овоз беринг' ҳаволаларига Телеграм кодини киритманг",
        desc: "Телеграмингиз ўғирланади ва танишларингиздан номингиздан қарз сўрашади."
      }
    ]
  },

  ru: {
    extensionTitle: "Himoya",
    tagline: "Киберзащита для пользователей Центральной Азии",
    statusActive: "Защита активна и работает",
    statusDisabled: "Защита приостановлена",
    threatsOnPage: "подозрительных угроз на странице",
    threatsNone: "Угроз на странице не обнаружено",
    threatsDetected: "Обезврежено угроз: {count}",
    statsToday: "Остановлено сегодня",
    statsTotal: "Всего остановлено",
    whitelistBtnTrust: "Доверенный",
    whitelistBtnTrusted: "Отключено",
    sensitivityLabel: "Чувствительность анализа:",
    sensitivityStrict: "Высокая",
    sensitivityBalanced: "Стандарт",
    sensitivityRelaxed: "Мягкая",
    audioAlertLabel: "Звуковое оповещение",
    checkerTab: "Сканер",
    rulesTab: "Правила",
    reportTab: "Сообщить",
    checkerPlaceholder: "Вставьте подозрительное сообщение из Telegram, SMS или ссылку...",
    checkerBtn: "Проверить текст",
    pasteBtn: "Вставить из буфера",
    quickScan: "Проверить из буфера",
    testSimulation: "Тест-атака",
    emptyInputAlert: "Пожалуйста, введите текст сообщения или ссылку!",
    analyzingText: "ИИ анализирует...",
    shortcutHint: "Ctrl+Enter ↵",
    clearText: "Очистить",
    copied: "Скопировано!",
    copyDiag: "Скопировать отчет",
    checkerSafe: "🛡️ ПОДОЗРИТЕЛЬНЫХ ПРИЗНАКОВ НЕ ОБНАРУЖЕНО",
    checkerSafeDesc: "В тексте не найдено признаков финансового мошенничества, кражи карт или фишинга.",
    checkerScam: "🚨 ОПАСНОСТЬ: ОБНАРУЖЕНО МОШЕННИЧЕСТВО",
    cardTitle: "Himoya: Обнаружен подозрительный пост",
    cardDesc: "В тексте найдены признаки фишинга или мошенничества (Оценка: {score}).",
    cardReveal: "👁️ Посмотреть",
    cardDismiss: "✓ Ошибка (Безопасно)",
    ribbonTitle: "Himoya: Предупреждение снято",
    ribbonReblur: "Скрыть обратно",
    riskHigh: "🚨 Высокий риск",
    riskMedium: "⚠️ Подозрительно",
    reportLink: "⚠️ Сообщить о новом мошенничестве",
    reportModalTitle: "Сообщить о новом мошенничестве",
    reportTypeLabel: "Тип мошенничества:",
    reportContentLabel: "Подозрительный текст, ссылка или бот:",
    reportSubmitBtn: "Скопировать и сохранить",
    reportTelegramBtn: "Отправить через Telegram",
    reportSaveBtn: "Скопировать и сохранить",
    historyTitle: "История отправленных сообщений:",
    reportSuccess: "Спасибо! Сообщение сохранено и передано на анализ.",
    rules: [
      {
        title: "1. Никогда не передавайте SMS-коды",
        desc: "Сотрудники банков и операторы никогда не запрашивают коды из SMS и пароли карт."
      },
      {
        title: "2. Не существует удвоения денег",
        desc: "Никто не превратит 100 000 сум в 500 000 сум за пару часов. Это 100% пирамида."
      },
      {
        title: "3. Не платите комиссии за выигрыши",
        desc: "Для получения реальных призов не требуется предоплата налогов или комиссий за вывод."
      },
      {
        title: "4. Никогда не открывайте незнакомые .APK файлы",
        desc: "Файлы под видом свадебных приглашений или штрафов крадут данные мобильного банкинга."
      },
      {
        title: "5. Не вводите код Telegram для голосования",
        desc: "Мошенники захватят ваш аккаунт и начнут просить деньги в долг у ваших контактов."
      }
    ]
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { HIMOYA_I18N };
}
