/**
 * Linguistic Normalization & Anti-Evasion Engine Unit Tests
 */

const assert = require('assert');
const Normalizer = require('../src/engine/normalizer.js');

console.log('\n--- Running tests/normalizer.test.js ---');

// Test 1: Unicode Normalization (NFKC)
{
  const ligature = 'ﬁshing va оnlаyn'; // 'ﬁ' ligature
  const normalized = Normalizer.normalizeUnicode(ligature);
  assert(normalized.startsWith('fishing'), 'Should decompose fi ligature into f + i');
  console.log('✅ Test 1 Passed: NFKC ligature decomposition');
}

// Test 2: Cross-Script Homoglyph De-anonymization
{
  // Word 'karta' spoofed with Cyrillic 'а' (\u0430)
  const spoofedWord = 'k\u0430rt\u0430';
  const unmasked = Normalizer.mapHomoglyphs(spoofedWord);
  assert.strictEqual(unmasked, 'karta', 'Cyrillic lookalikes in Latin word must be transliterated to Latin');

  // Word 'kod' with Cyrillic 'о' (\u043E)
  const spoofedKod = 'k\u043Ed';
  const unmaskedKod = Normalizer.mapHomoglyphs(spoofedKod);
  assert.strictEqual(unmaskedKod, 'kod');

  console.log('✅ Test 2 Passed: Cross-script homoglyph transliteration');
}

// Test 3: Evasion Stripping (Zero-width chars, separators, character spam)
{
  // Zero-width space \u200B and soft hyphen \u00AD injected into "karta"
  const evaded = 'k\u200Bar\u00ADta';
  const stripped = Normalizer.stripEvasion(evaded);
  assert.strictEqual(stripped, 'karta', 'Zero-width characters and soft hyphens must be stripped');

  // Intra-word dots: "p.u.l" -> "pul", "s-m-s" -> "sms"
  const dotted = 'p.u.l va s-m-s';
  const deSeparated = Normalizer.stripEvasion(dotted);
  assert(deSeparated.includes('pul'), 'Should resolve p.u.l to pul');
  assert(deSeparated.includes('sms'), 'Should resolve s-m-s to sms');

  // Repeated character spam: "kkkkoooodddd" -> "kod", "puuuul" -> "pul"
  const spammed = 'kkkkoooodddd va puuuul';
  const deSpammed = Normalizer.stripEvasion(spammed);
  assert(deSpammed.includes('kod'), 'Should collapse repeated characters to base');
  assert(deSpammed.includes('pul'), 'Should collapse puuuul to pul');

  console.log('✅ Test 3 Passed: Zero-width evasion and character spam stripping');
}

// Test 4: Uzbek Morphological Agglutinative Stemming
{
  // Possessive & Case Suffixes
  assert.strictEqual(Normalizer.stem('kartangiz'), 'karta', 'kartangiz -> karta');
  assert.strictEqual(Normalizer.stem('kartadan'), 'karta', 'kartadan -> karta');
  assert.strictEqual(Normalizer.stem('kartangizdan'), 'karta', 'kartangizdan -> karta');
  assert.strictEqual(Normalizer.stem('kartalarimizga'), 'karta', 'kartalarimizga -> karta');

  // Phonological voicing harmonization: plastigingizga -> plastik
  assert.strictEqual(Normalizer.stem('plastigingizga'), 'plastik', 'plastigingizga -> plastik');
  assert.strictEqual(Normalizer.stem('plastikdan'), 'plastik', 'plastikdan -> plastik');

  // Account and funds
  assert.strictEqual(Normalizer.stem('hisobingizdan'), 'hisob', 'hisobingizdan -> hisob');
  assert.strictEqual(Normalizer.stem('mablagingiz'), 'mablag', 'mablagingiz -> mablag');

  // Root length constraint: 3-letter roots must not be over-stemmed
  assert.strictEqual(Normalizer.stem('pul'), 'pul', 'pul must remain pul');
  assert.strictEqual(Normalizer.stem('kod'), 'kod', 'kod must remain kod');
  assert.strictEqual(Normalizer.stem('sms'), 'sms', 'sms must remain sms');

  console.log('✅ Test 4 Passed: Uzbek agglutinative suffix stripping and root recovery');
}

// Test 5: End-to-End Pipeline
{
  const complexObfuscation = 'DIQQAT! K\u0430rt\u0430ngizd\u0430n p.u.l yechildi! S-M-S k\u043Eddi yuboring 🎁🚀!';
  const fullyNormalized = Normalizer.normalize(complexObfuscation);

  assert(fullyNormalized.toLowerCase().includes('kartangizdan'));
  assert(fullyNormalized.toLowerCase().includes('pul'));
  assert(fullyNormalized.toLowerCase().includes('sms'));
  assert(fullyNormalized.toLowerCase().includes('kod'));
  console.log('✅ Test 5 Passed: Full multi-stage normalization pipeline');
}

console.log('\nAll Normalizer unit tests completed successfully! ✨');
