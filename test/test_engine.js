const { analyzeContent } = require('../engine.js');

const tests = [
  // ==========================================
  // BENIGN CASES (MUST NEVER FLAG -> FALSE)
  // ==========================================
  { 
    text: "Bugun faqat do'stlar bilan uchrashdik va shahar aylandik. Judayam yaxshi dam oldik.", 
    expected: false, 
    desc: "Everyday innocent post with bugun + faqat" 
  },
  { 
    text: "Markaziy bank ma'lumotlariga ko'ra bugun dollar kursi 12800 so'mga yetdi. Foiz stavkalari o'zgarmadi.", 
    expected: false, 
    desc: "Financial news mentioning dollar, kurs, foiz" 
  },
  { 
    text: "Assalomu alaykum, kimda ingliz tili bo'yicha yaxshi darslik bor? Telegramdan yozvoring.", 
    expected: false, 
    desc: "Casual request with english/telegram" 
  },
  { 
    text: "Universitetda darslar soat 8:30 da boshlanadi, kechikmasdan keling.", 
    expected: false, 
    desc: "School schedule announcement" 
  },
  { 
    text: "Ertaga Toshkentda havo o'zgarib turadi, yog'ingarchilik kutilmaydi. Harorat 24 daraja iliq bo'ladi.", 
    expected: false, 
    desc: "Innocent weather forecast" 
  },
  { 
    text: "O'zbekiston milliy terma jamoasi kechagi o'yinda chiroyli g'alaba qozondi. Barcha futbolchilarga rahmat!", 
    expected: false, 
    desc: "Sports news and football discussion" 
  },
  { 
    text: "Barcha yurtdoshlarimizni Navro'z umumxalq bayrami bilan chin dildan muborakbod etamiz!", 
    expected: false, 
    desc: "Holiday greeting announcement" 
  },
  { 
    text: "Hurmatli ota-onalar, ertaga maktabda ochiq eshiklar kuni bo'lib o'tadi. O'qituvchilar bilan uchrashuv soat 14:00 da.", 
    expected: false, 
    desc: "Innocent parent-teacher school notice" 
  },
  { 
    text: "Bugungi futbol uchrashuvida jamoamiz 2:1 hisobida g'alaba qozondi! Barcha muxlislarni tabriklaymiz.", 
    expected: false, 
    desc: "Innocent sports report and fan congratulations" 
  },

  // ==========================================
  // MALICIOUS SCAM CASES (MUST FLAG -> TRUE)
  // ==========================================
  { 
    text: "Siz 5 mln yutib oldingiz. Bu linkga bosing", 
    expected: true, 
    desc: "User exact test case: 5 mln won + click link" 
  },
  { 
    text: "Diqqat! Plastik karta raqami va telefoningizga kelgan sms kodni yuboring, pulingizni qaytaramiz.", 
    expected: true, 
    desc: "Direct phishing: card + SMS code" 
  },
  { 
    text: "Пластик карта рақами ва келган смс кодни юборинг, тез пул ташлаб берамиз.", 
    expected: true, 
    desc: "Cyrillic SMS + card phishing" 
  },
  { 
    text: "Кунига пул ишлаш! 100% кафолатланган даромад. Жойлар чекланган, шошилинг, админга ёзинг!", 
    expected: true, 
    desc: "Cyrillic high-yield investment scam" 
  },
  { 
    text: "Sizga prezident yordami puli ajratildi! Sovg‘ani qabul qiling, tasdiqlash uchun havolani bosing.", 
    expected: true, 
    desc: "Fake presidential subsidy with curly apostrophe" 
  },
  { 
    text: "Pulni ikki barobar qilib beramiz. Oson pul topish sirlari, lichkaga yozing va bugun boy boʻling.", 
    expected: true, 
    desc: "Money doubling scheme with Uzbek modifier apostrophe" 
  },
  { 
    text: "Prezident qaroriga binoan bolalar uchun kompensatsiya tolanadi. Sovgani qabul qiling va havolani bosing.", 
    expected: true, 
    desc: "Fake subsidy without apostrophes" 
  },
  { 
    text: "Salom, jiyanim tanlovda qatnashyapti iltimos ovoz bering. Havola orqali kiring va telegramdan kelgan kodni yozing.", 
    expected: true, 
    desc: "Telegram voting account hijack scheme" 
  },
  { 
    text: "Овоз беринг, жияним танловда қатнашяпти! Ҳаволага кириб телеграмдан келган 5 хонали кодни ёзинг.", 
    expected: true, 
    desc: "Cyrillic Telegram voting account hijack scheme" 
  },
  { 
    text: "Tabriklaymiz! Siz 5,000,000 so'm yutib oldingiz! Pulni yechib olish uchun komissiya to'lashingiz kerak, kartaga pul o'tkazing.", 
    expected: true, 
    desc: "Advance fee / withdrawal commission scam" 
  },
  { 
    text: "Uzum marketda tovarlarga layk bosib pul ishlash! Kuniga 300 000 so'm, malaka talab qilinmaydi. Adminga yozing.", 
    expected: true, 
    desc: "Uzum/Wildberries fake task/brushing job scam" 
  },
  { 
    text: "Juda arzon umra ziyorati! Navbatsiz haj va kafolatlangan viza, shoshiling joylar cheklangan!", 
    expected: true, 
    desc: "Fake Umra / Visa fraud" 
  },
  { 
    text: "Bu rasmda senmisan? Qara seni videoga olishibdi: fotolar.apk faylini yuklab ol va och.", 
    expected: true, 
    desc: "Telegram Trojan APK malware scheme" 
  },
  { 
    text: "Бу расмда сенмисан? Сени расминг тарқалиб кетибди: фото.апк юклаб олиб кўр!", 
    expected: true, 
    desc: "Cyrillic Telegram Trojan APK malware" 
  },
  { 
    text: "Salom do'stlar, to'yimizga taklif qilamiz! To'y taklifnomasi.apk faylini yuklab oling va oching.", 
    expected: true, 
    desc: "Wedding invitation APK trojan malware" 
  },
  { 
    text: "Привет! Приглашаем на нашу свадьбу, вот свадебное приглашение.apk, скачайте и посмотрите!", 
    expected: true, 
    desc: "Russian wedding invitation APK trojan" 
  },
  { 
    text: "Xavfsizlik xizmati: hisobingizdan shubhali operatsiya aniqlandi! Kartangiz bloklandi, mablag'ni xavfsiz hisobga o'tkazing.", 
    expected: true, 
    desc: "Fake bank security alert and account freeze" 
  },
  { 
    text: "Diqqat! Sizning bank kartangiz ma'lumotlari bazadan sizib chiqdi! Mablag'ingizni xavfsiz tranzit hisobga o'tkazing: https://t.me/safe_transit_bot", 
    expected: true, 
    desc: "Data breach panic lure with transit account trap" 
  },
  { 
    text: "Диққат! Банк карталари базаси тарқалди, ҳисобингиздан шубҳали ўтказма қайд этилди. Пулларни хавфсиз ҳисобга ўтказинг!", 
    expected: true, 
    desc: "Cyrillic data breach panic and safe account trap" 
  },
  { 
    text: "Служба безопасности банка: по вашей карте зафиксирована подозрительная операция. Карта заблокирована, подтвердите кодом из смс.", 
    expected: true, 
    desc: "Russian bank security phishing" 
  },
  { 
    text: "Hududgaz va davlat qaroriga asosan aholiga gaz kompensatsiyasi to'lanadi. Havolaga o'ting va arizangizni qoldiring.", 
    expected: true, 
    desc: "Fake utility / gas compensation portal" 
  },
  { 
    text: "Soliq qo'mitasi: Sizga 3 500 000 so'm soliq keshbek va kompensatsiya ajratildi. Olish uchun havola orqali kartangizni tasdiqlang.", 
    expected: true, 
    desc: "Fake Soliq / Tax cashback and compensation portal" 
  },
  { 
    text: "YHXBB jarimalariga 50% chegirma! Bugun to'lang va jarimani o'chiring, havolani bosing.", 
    expected: true, 
    desc: "Fake traffic fine discount portal" 
  },
  { 
    text: "Hamster va Notcoin airdrop tokenlarini yechib olish! Bot orqali pul ishlang va bugun kartangizga yechib oling.", 
    expected: true, 
    desc: "Fake crypto airdrop bot withdrawal scam" 
  },
  { 
    text: "Salom, kartam ishlamayapti, juda zarur bo'lib qoldi, bu kartaga 500 ming tashlab tura olasanmi? Ertaga soat 10 da qaytaraman.", 
    expected: true, 
    desc: "Telegram friend loan emergency hijack scam" 
  },
  { 
    text: "Tovarni sotib oldim, pulni Click yetkazib berish orqali to'ladim. Mablag'ni qabul qilish uchun ushbu havola orqali kartangizni kiriting.", 
    expected: true, 
    desc: "Fake escrow delivery payment link scam" 
  }
];

let failed = 0;
for (const t of tests) {
  const res = analyzeContent(t.text);
  const pass = res.isScam === t.expected;
  console.log((pass ? '✅ PASS' : '❌ FAIL') + ' | ' + t.desc + ' => isScam: ' + res.isScam + ' (score: ' + res.score + ', ML: ' + res.mlProbability + '%)');
  if (!pass) failed++;
}

if (failed > 0) {
  console.error(`\n${failed} test(s) failed.`);
  process.exit(1);
} else {
  console.log(`\nAll ${tests.length} tests passed with 100% accuracy!`);
  process.exit(0);
}
