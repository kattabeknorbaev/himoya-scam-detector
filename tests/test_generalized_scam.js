/**
 * Test Suite: Generalized Non-Template Scam Detection vs Benign Text
 */

const testCases = [
  // 1. Arbitrary OTP / SMS theft without the word "SMS" or "karta"
  {
    text: "Akajon iltimos telefoningizga kelgan 6 talik kodni yozvoring, adashib sizning raqamingizni kiritib yuboribman",
    expectScam: true,
    expectedCategory: 'OTP_THEFT',
    desc: 'Arbitrary OTP theft (6-digit code request)'
  },
  // 2. Arbitrary APK trojan with court theme
  {
    text: "Sizning nomingizga sud ijro hujjati keldi, tanishib chiqish uchun ijro.apk faylini o'rnating",
    expectScam: true,
    expectedCategory: 'APK_DROPPER',
    desc: 'Arbitrary APK dropper (court notice .apk)'
  },
  // 3. Arbitrary Ponzi scheme with colloquial phrasing
  {
    text: "Salom guruhdagilar, bir tanishim aytgandi kuniga 500 ming topish mumkin ekan, faqat 100 ming tashlash kerak ekan 2 barobar qilib qaytaradi",
    expectScam: true,
    expectedCategory: 'PONZI_MULTIPLIER',
    desc: 'Arbitrary Ponzi scheme (money multiplier)'
  },
  // 4. Arbitrary account security phishing bot
  {
    text: "Hurmatli foydalanuvchi, profilingiz xavfsizlik maqsadida vaqtincha to'xtatildi. Tiklash uchun botga kiring: t.me/xavfsizlik_verify_bot",
    expectScam: true,
    expectedCategory: 'TELEGRAM_HIJACK',
    desc: 'Arbitrary account phishing via bot'
  },
  // 5. Arbitrary hijacked profile borrowing scam
  {
    text: "Kattabek, do'stim juda qiyin ahvoldaman 200 ming qarz berib tura olasanmi kartamga tashlab ber, kechqurun qaytaraman",
    expectScam: true,
    expectedCategory: 'CARD_DRAINER',
    desc: 'Hijacked profile emergency loan lure'
  },
  // 6. Arbitrary fake subsidy
  {
    text: "Assalomu alaykum, farzandlar uchun yangi yordam puli tarqatilyapti ekan, olish uchun quyidagi ssilka orqali anketani to'ldirish kerak",
    expectScam: true,
    expectedCategory: 'FAKE_SUBSIDY',
    desc: 'Arbitrary fake child subsidy'
  },
  // 7. Arbitrary fake lottery prize
  {
    text: "Tabriklaymiz sizning telefon raqamingiz tasodifiy tanlovda qimmatbaho sovg'a yutib oldi, olish uchun linkka bosing",
    expectScam: true,
    expectedCategory: 'LOTTERY_PRIZE_SCAM',
    desc: 'Arbitrary random number prize lure'
  },
  // 8. Arbitrary task brushing
  {
    text: "Uzum marketda tovarlarni savatga qo'shib baho berishga odam kerak, kuniga 300 ming to'lanadi",
    expectScam: true,
    expectedCategory: 'TASK_BRUSHING',
    desc: 'Arbitrary Uzum brushing job'
  },
  // 9. Arbitrary fake bank security call-to-action
  {
    text: "Diqqat! Bank xavfsizlik xizmati: hisobingizdan noqonuniy pul yechishga urinish bo'ldi, mablag'ni saqlash uchun zudlik bilan operatorga kelgan kodni ayting",
    expectScam: true,
    expectedCategory: 'OTP_THEFT',
    desc: 'Fake bank security panic + OTP prompt'
  },
  // 10. Arbitrary transit account panic
  {
    text: "Kartangiz xavf ostida! Barcha mablag'ingizni zudlik bilan xavfsiz tranzit hisobga o'tkazishingiz lozim",
    expectScam: true,
    expectedCategory: 'TRANSIT_ACCOUNT_PANIC',
    desc: 'Transit account panic trap'
  },

  // BENIGN / SAFE CONTROL CASES (Must NEVER be flagged!)
  {
    text: "Ertaga ertalab soat 9 da uchrashamiz, darsga kech qolma",
    expectScam: false,
    desc: 'Benign student chat'
  },
  {
    text: "Assalomu alaykum ustoz, uyga berilgan vazifani bajarib bo'ldim, tekshirib bera olasizmi?",
    expectScam: false,
    desc: 'Benign homework submission'
  },
  {
    text: "Bugun kechki ovqatga nima pishiramiz? Bozorga borib go'sht va sabzavot olib kelaman",
    expectScam: false,
    desc: 'Benign family dinner conversation'
  },
  {
    text: "Do'stim, kecha aytgan kitobingni kutubxonadan topdim, ertaga olib borib beraman",
    expectScam: false,
    desc: 'Benign book loan between friends'
  },
  {
    text: "Kompaniyamiz yangi dasturiy ta'minot ishlab chiqish bo'yicha seminar o'tkazmoqda, qatnashishingiz mumkin",
    expectScam: false,
    desc: 'Benign software seminar invitation'
  }
];

module.exports = testCases;
