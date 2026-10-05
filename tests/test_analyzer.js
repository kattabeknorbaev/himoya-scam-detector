const { HimoyaNormalizer } = require('../src/engine/normalizer.js');
global.HimoyaNormalizer = HimoyaNormalizer;
const { analyzeContent } = require('../src/engine/analyzer.js');

const testCases = [
  {
    desc: 'Card Draining + SMS theft attack',
    text: 'Hurmatli mijoz! Plastik kartangizdan 1,450,000 so\'m yechildi. Bekor qilish uchun SMS kodni yuboring: https://uzcard-himoya.top',
    expectScam: true
  },
  {
    desc: 'Benign friendly chat',
    text: 'Salom do\'stim, bugun dars soat nechada boshlanadi? Kitobingni olib kela olasanmi?',
    expectScam: false
  },
  {
    desc: 'Malicious wedding invitation APK',
    text: 'Assalomu alaykum, to\'yimizga marhamat qiling! To\'y taklifnomasi.apk faylini yuklab oling',
    expectScam: true
  },
  {
    desc: 'Fake government subsidy',
    text: 'Prezident qarori bilan barcha oilalarga 1,200,000 so\'m moddiy yordam tarqatilmoqda. Olish uchun karta raqamingizni kiriting',
    expectScam: true
  },
  {
    desc: 'Telegram account hijacking voting contest',
    text: 'Iltimos, tanlovda bolamga ovoz bering va yordam qiling: t.me/ovozberish_bot',
    expectScam: true
  }
];

let allPassed = true;
testCases.forEach((tc, idx) => {
  const res = analyzeContent(tc.text, 4.0, 'uz');
  const passed = res.isScam === tc.expectScam;
  console.log(`[Case ${idx + 1}] ${tc.desc}: ${passed ? '✅ PASSED' : '❌ FAILED'} (Scam: ${res.isScam}, Risk: ${res.riskLevel}, Prob: ${res.mlProbability}%)`);
  if (!passed) allPassed = false;
});

if (allPassed) {
  console.log('\nAll analyzer tests passed perfectly! 🚀');
} else {
  process.exit(1);
}
