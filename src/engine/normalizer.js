/**
 * Himoya Linguistic Normalization & Anti-Evasion Engine
 * Multi-stage pipeline:
 * 1. Unicode Normalization (NFKC)
 * 2. Cross-Script Homoglyph & Leetspeak De-anonymization
 * 3. Evasion Stripping (Zero-width chars, soft hyphens, intra-word separators, emoji noise, char spam)
 * 4. Agglutinative Morphological Stemming for Uzbek / Central Asian linguistic roots
 */

(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.HimoyaNormalizer = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // 1. Visually Identical Cyrillic-to-Latin Homoglyph Table
  const CYRILLIC_TO_LATIN_HOMOGLYPHS = {
    '\u0430': 'a', // Cyrillic small a
    '\u0410': 'A', // Cyrillic capital A
    '\u0435': 'e', // Cyrillic small ie
    '\u0415': 'E', // Cyrillic capital IE
    '\u043E': 'o', // Cyrillic small o
    '\u041E': 'O', // Cyrillic capital O
    '\u0440': 'p', // Cyrillic small er
    '\u0420': 'P', // Cyrillic capital ER
    '\u0441': 'c', // Cyrillic small es
    '\u0421': 'C', // Cyrillic capital ES
    '\u0443': 'y', // Cyrillic small u
    '\u0423': 'Y', // Cyrillic capital U
    '\u0445': 'x', // Cyrillic small ha
    '\u0425': 'X', // Cyrillic capital HA
    '\u0456': 'i', // Cyrillic small Byelorussian-Ukrainian i
    '\u0406': 'I', // Cyrillic capital Byelorussian-Ukrainian I
    '\u0458': 'j', // Cyrillic small je
    '\u0408': 'J', // Cyrillic capital JE
    '\u0455': 's', // Cyrillic small dze
    '\u0405': 'S', // Cyrillic capital DZE
    '\u0432': 'b', // Cyrillic small ve (visual lowercase)
    '\u0412': 'B', // Cyrillic capital VE
    '\u043A': 'k', // Cyrillic small ka
    '\u041A': 'K', // Cyrillic capital KA
    '\u043C': 'm', // Cyrillic small em
    '\u041C': 'M', // Cyrillic capital EM
    '\u0442': 't', // Cyrillic small te
    '\u0422': 'T', // Cyrillic capital TE
    '\u043D': 'h', // Cyrillic small en (often abused for h)
    '\u041D': 'H'  // Cyrillic capital EN
  };

  // 2. Leetspeak symbol map
  const LEETSPEAK_MAP = {
    '@': 'a',
    '$': 's',
    '0': 'o',
    '1': 'i',
    '3': 'e',
    '4': 'a',
    '5': 's',
    '7': 't',
    '8': 'b',
    '!': 'i'
  };

  // 3. Uzbek Morphological Agglutinative Suffix Hierarchy
  // Ordered by suffix stripping precedence (longest/outermost suffixes first)
  const UZBEK_SUFFIXES = [
    // Comparative & Locative compound
    'gachaki', 'qachaki', 'kachaki', 'gacha', 'qacha', 'kacha',
    'dagilar', 'dagilarga', 'dagilardan', 'dagi',
    // Compound possessive + case
    'larimizdan', 'laringizdan', 'larimizga', 'laringizga', 'larimizda', 'laringizda',
    'ingizdan', 'ngizdan', 'imizdan', 'mizdan',
    'ingizga', 'ngizga', 'imizga', 'mizga',
    'ingizda', 'ngizda', 'imizda', 'mizda',
    'ingizni', 'ngizni', 'imizni', 'mizni',
    // Plural + case
    'larning', 'larga', 'lardan', 'larni', 'larda', 'lar',
    // Case suffixes
    'ning', 'dan', 'ga', 'ka', 'qa', 'da', 'ni',
    // Possessive
    'larimiz', 'laringiz', 'lari', 'larim', 'laring',
    'ingiz', 'ngiz', 'imiz', 'miz',
    'imga', 'imdan', 'imda', 'imni',
    'ingga', 'ingdan', 'ingda', 'ingni',
    'iga', 'idan', 'ida', 'ini', 'isi',
    // Singular possessive
    'ing', 'im', 'si', 'ng', 'i',
    // Common adjectival / nominal suffixes
    'lik', 'siz', 'durlar'
  ];

  /**
   * Stage 1: Unicode Normalization (NFKC)
   * Collapses ligatures, compatibility characters, and decomposed accents.
   */
  function normalizeUnicode(text) {
    if (!text || typeof text !== 'string') return '';
    return text.normalize('NFKC');
  }

  /**
   * Stage 2: Cross-Script Homoglyph De-anonymizer
   * Detects and transliterates mixed-script spoofing.
   * If a word contains predominantly Latin characters with injected Cyrillic lookalikes,
   * unmasks the Cyrillic characters into standard Latin.
   */
  function mapHomoglyphs(text) {
    if (!text) return '';

    // Standardize all Uzbek apostrophe variations to standard '
    let clean = text;
    if (/[\u2018\u2019\u02BB\u0060\u00B4\u02BC\u201B\u02B9]/.test(clean)) {
      clean = clean.replace(/[\u2018\u2019\u02BB\u0060\u00B4\u02BC\u201B\u02B9]/g, "'");
    }

    // Replace leetspeak symbols occurring between letters (e.g. k@rt@, p.u.l)
    if (/[@$0134578!]/.test(clean)) {
      clean = clean.replace(/([a-zA-Zа-яА-Я0-9])([@$0134578!])([a-zA-Zа-яА-Я0-9])/g, (match, p1, p2, p3) => {
        return p1 + (LEETSPEAK_MAP[p2] || p2) + p3;
      });
    }

    // Fast-path: Only inspect tokens if mixed scripts (Latin + Cyrillic) are present
    if (/[a-zA-Z]/.test(clean) && /[\u0400-\u04FF]/.test(clean)) {
      const words = clean.split(/(\s+)/);
      for (let w = 0; w < words.length; w++) {
        const word = words[w];
        if (/^\s+$/.test(word)) continue;

        let latinCount = 0;
        let cyrillicCount = 0;
        for (let i = 0; i < word.length; i++) {
          const code = word.charCodeAt(i);
          if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122)) latinCount++;
          else if (code >= 0x0400 && code <= 0x04FF) cyrillicCount++;
        }

        // If mixed script where Latin is significant, convert the Cyrillic homoglyphs
        if (latinCount > 0 && cyrillicCount > 0) {
          let deobfuscated = '';
          for (let i = 0; i < word.length; i++) {
            const char = word[i];
            deobfuscated += CYRILLIC_TO_LATIN_HOMOGLYPHS[char] || char;
          }
          words[w] = deobfuscated;
        }
      }
      return words.join('');
    }

    return clean;
  }

  /**
   * Stage 3: Anti-Evasion Stripper
   * Strips zero-width characters, soft hyphens, intra-word separators, emojis, and repeated character spam.
   */
  function stripEvasion(text) {
    if (!text) return '';
    let res = text;

    // 1. Strip zero-width spaces, joiners, soft hyphens, directional marks, BOM
    if (/[\u200B-\u200F\uFEFF\u00AD\u2060\u200C\u200D]/.test(res)) {
      res = res.replace(/[\u200B-\u200F\uFEFF\u00AD\u2060\u200C\u200D]/g, '');
    }

    // 2. Strip ornamental emojis and symbols
    if (/[\p{Emoji}\p{Symbol}]/u.test(res)) {
      res = res.replace(/[\p{Emoji}\p{Symbol}]/gu, ' ');
    }

    // 3. Strip intra-word separator dots/hyphens/underscores/stars
    if (/[\.\-_*~]/.test(res)) {
      res = res
        .replace(/\b([a-zA-Zа-яА-Я0-9])[\.\-_*~]([a-zA-Zа-яА-Я0-9])[\.\-_*~]([a-zA-Zа-яА-Я0-9])\b/g, '$1$2$3')
        .replace(/\b([a-zA-Zа-яА-Я0-9])[\.\-_*~]([a-zA-Zа-яА-Я0-9])\b/g, '$1$2');
    }

    // 4. Compress 3+ repeated identical character spam
    if (/(.)\1{2,}/.test(res)) {
      res = res.replace(/(.)\1{2,}/g, '$1');
    }

    return res.replace(/\s+/g, ' ').trim();
  }

  /**
   * Stage 4: Uzbek Morphological Agglutinative Stemmer
   * Recursively strips inflectional possessive and case suffixes down to base semantic root.
   * Ensures root length >= 3 to prevent over-stemming.
   *
   * @param {string} word Lowercase token
   * @returns {string} Morphological root
   */
  function stem(word) {
    if (!word || typeof word !== 'string' || word.length <= 3) return word;

    let current = word.toLowerCase().trim();
    let stripped = true;

    // Run iterative suffix stripping cascade
    while (stripped && current.length > 3) {
      stripped = false;
      for (const suffix of UZBEK_SUFFIXES) {
        if (current.endsWith(suffix) && (current.length - suffix.length) >= 3) {
          current = current.slice(0, -suffix.length);
          stripped = true;
          break; // restart hierarchy check on shortened stem
        }
      }
    }

    // Stem phonological harmonizer:
    // e.g. "plastig" -> "plastik", "kartag" -> "karta"
    if (current.endsWith('g') && current.length >= 4) {
      if (current === 'plastig') current = 'plastik';
      if (current === 'mablag') current = 'mablag';
    }

    return current;
  }

  /**
   * Complete Multi-Stage Normalization Pipeline
   * @param {string} text Raw extracted DOM text
   * @returns {string} Fully normalized, de-obfuscated text
   */
  function normalize(text) {
    if (!text || typeof text !== 'string') return '';

    // Step 1: Unicode Normalization
    const step1 = normalizeUnicode(text);

    // Step 2: Cross-Script Homoglyph De-anonymization
    const step2 = mapHomoglyphs(step1);

    // Step 3: Evasion & Zero-width stripping
    const step3 = stripEvasion(step2);

    return step3;
  }

  /**
   * Tokenizes text and stems all words, returning a stem-level token stream
   * @param {string} text
   * @returns {string} Stemmed representation of text
   */
  function tokenizeAndStem(text) {
    const normalized = normalize(text);
    return normalized
      .split(/\s+/)
      .map(w => stem(w.replace(/[^a-zA-Zа-яА-ЯёЁ0-9'_]/g, '')))
      .filter(w => w.length > 0)
      .join(' ');
  }

  return {
    normalize,
    normalizeUnicode,
    mapHomoglyphs,
    stripEvasion,
    stem,
    tokenizeAndStem,
    CYRILLIC_TO_LATIN_HOMOGLYPHS,
    LEETSPEAK_MAP
  };
});
