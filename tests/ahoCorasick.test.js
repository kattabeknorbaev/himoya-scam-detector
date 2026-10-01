/**
 * Aho-Corasick DFA String Matching Engine Unit Tests
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const AhoCorasick = require('../src/engine/ahoCorasick.js');

console.log('\n--- Running tests/ahoCorasick.test.js ---');

// Test 1: Basic Trie & Exact Match
{
  const ac = new AhoCorasick([
    { word: 'karta', category: 'CARD_DRAINER', weight: 4.0 },
    { word: 'sms kod', category: 'OTP_THEFT', weight: 5.0, critical: true }
  ]);

  const res1 = ac.search('Iltimos karta raqamini yozing');
  assert.strictEqual(res1.matches.length, 1, 'Should find 1 match for karta');
  assert.strictEqual(res1.matches[0].token, 'karta');
  assert.strictEqual(res1.matches[0].category, 'CARD_DRAINER');

  const res2 = ac.search('Telefoningizga kelgan sms kodni yuboring');
  assert.strictEqual(res2.matches.length, 1);
  assert.strictEqual(res2.matches[0].token, 'sms kod');
  assert.strictEqual(res2.criticalHits, 1);
  assert.strictEqual(res2.isScam, true);
  console.log('✅ Test 1 Passed: Basic exact match and critical hit identification');
}

// Test 2: Overlapping and Nested Matches via Failure Links
{
  const ac = new AhoCorasick([
    { word: 'karta', category: 'CARD_DRAINER', weight: 3.0 },
    { word: 'karta raqami', category: 'CARD_DRAINER', weight: 5.0 },
    { word: 'raqam', category: 'GENERIC_SUSPICIOUS', weight: 1.0 }
  ]);

  const res = ac.search('karta raqami');
  // Should match 'karta', 'raqam', and 'karta raqami'
  const matchedTokens = res.matches.map(m => m.token);
  assert(matchedTokens.includes('karta'), 'Should include karta');
  assert(matchedTokens.includes('raqam'), 'Should include raqam');
  assert(matchedTokens.includes('karta raqami'), 'Should include karta raqami');
  console.log('✅ Test 2 Passed: Overlapping substring matches via failure links');
}

// Test 3: Multiple Threat Categories in Single Text
{
  const ac = new AhoCorasick([
    { word: 'plastik karta', category: 'CARD_DRAINER', weight: 4.5 },
    { word: 'tasdiqlash kodi', category: 'OTP_THEFT', weight: 5.0, critical: true },
    { word: 'ovoz bering', category: 'TELEGRAM_HIJACK', weight: 4.8, critical: true },
    { word: 'fotolar.apk', category: 'APK_DROPPER', weight: 5.5, critical: true }
  ]);

  const text = 'Plastik karta va tasdiqlash kodi kerak, ovoz bering va fotolar.apk oching';
  const res = ac.search(text);

  assert.strictEqual(res.categories.length, 4, 'Should detect 4 distinct categories');
  assert.strictEqual(res.criticalHits, 3, 'Should detect 3 critical categories');
  assert.strictEqual(res.riskLevel, 'CRITICAL');
  console.log('✅ Test 3 Passed: Multi-category detection and CRITICAL risk escalation');
}

// Test 4: Benign Text (Zero False Positives)
{
  const ac = new AhoCorasick([
    { word: 'plastik karta', category: 'CARD_DRAINER', weight: 4.5, critical: true },
    { word: 'sms kod', category: 'OTP_THEFT', weight: 5.0, critical: true }
  ]);

  const benignText = 'Bugun maktabda darslar soat 9:00 da boshlanadi. Ertaga ob-havo quyoshli boladi.';
  const res = ac.search(benignText);
  assert.strictEqual(res.isScam, false);
  assert.strictEqual(res.matches.length, 0);
  assert.strictEqual(res.riskLevel, 'LOW');
  console.log('✅ Test 4 Passed: Zero false positives on benign text');
}

// Test 5: Serialization & Hydration (exportJSON / fromJSON)
{
  const original = new AhoCorasick([
    { word: 'tranzit hisob', category: 'TRANSIT_ACCOUNT_PANIC', weight: 5.0, critical: true },
    { word: 'baza sizib chiqdi', category: 'TRANSIT_ACCOUNT_PANIC', weight: 5.0, critical: true }
  ]);

  const jsonStr = original.exportJSON();
  const hydrated = AhoCorasick.fromJSON(jsonStr);

  const res = hydrated.search('Diqqat! Baza sizib chiqdi, zudlik bilan tranzit hisobga pul otkazilsin');
  assert.strictEqual(res.isScam, true);
  assert.strictEqual(res.matches.length, 2);
  assert.strictEqual(res.riskLevel, 'CRITICAL');
  console.log('✅ Test 5 Passed: Automaton exportJSON & fromJSON graph hydration');
}

// Test 6: Enterprise Corpus Load (rules.json with 2,700+ patterns)
{
  const rulesPath = path.join(__dirname, '../src/engine/rules.json');
  if (fs.existsSync(rulesPath)) {
    const data = JSON.parse(fs.readFileSync(rulesPath, 'utf8'));
    assert(data.rules.length >= 1500, `Corpus must exceed 1500 rules (actual: ${data.rules.length})`);

    const enterpriseAC = new AhoCorasick(data.rules);
    assert.strictEqual(enterpriseAC.patternCount, data.rules.length);

    // Verify detection across real-world attacks
    const attack1 = enterpriseAC.search('Siz 5 mln yutib oldingiz! Click orqali kartangizga oling');
    assert.strictEqual(attack1.isScam, true);

    const attack2 = enterpriseAC.search('Bu rasmda senmisan? toy taklifnomasi apk yuklab ol');
    assert.strictEqual(attack2.isScam, true);

    const attack3 = enterpriseAC.search('Prezident qaroriga asosan bolalar uchun yordam puli tolanadi');
    assert.strictEqual(attack3.isScam, true);

    console.log(`✅ Test 6 Passed: Enterprise rules.json (${data.rules.length} patterns) successfully verified`);
  }
}

console.log('\nAll Aho-Corasick unit tests completed successfully! ✨');
