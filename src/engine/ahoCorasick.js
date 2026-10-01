/**
 * Himoya Cybersecurity Engine - Aho-Corasick Deterministic Finite Automaton (DFA)
 * High-performance string-matching algorithm for multi-pattern threat detection.
 * Provides O(n + m + z) text traversal without RegExp backtracking.
 *
 * Supported Threat Categories:
 * - CARD_DRAINER: Card number harvesting, CVV/CVC, expiration date exfiltration
 * - OTP_THEFT: 5-digit & 6-digit SMS verification code theft, Telegram session hijacking
 * - FAKE_SUBSIDY: Fabricated presidential decrees, child compensations, utility aid
 * - APK_DROPPER: Trojan Android installers disguised as photos or invitations
 * - PONZI_MULTIPLIER: Money doubling, high-yield investment pyramids, trading bots
 * - TASK_BRUSHING: Uzum Market / Wildberries product liking & review deposit scams
 * - TRANSIT_ACCOUNT_PANIC: Leaked card alerts pressuring victims to move funds to "safe" accounts
 * - ESCROW_DELIVERY: Counterfeit Click/Payme/OLX delivery links for card drainage
 * - TELEGRAM_HIJACK: Contest voting for relatives, fake Telegram Premium lures
 * - VISA_UMRA_FRAUD: Unregulated pilgrimage guarantees, fast-track visa traps
 */

(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.AhoCorasick = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  class AhoCorasick {
    /**
     * @param {Array<Object>} [keywords=[]] Array of pattern definitions:
     *   { word: string, category: string, weight?: number, critical?: boolean, id?: string }
     */
    constructor(keywords = []) {
      // Node 0 is the root state
      this.trie = [this._createNode()];
      this.isCompiled = false;
      this.patternCount = 0;

      if (Array.isArray(keywords) && keywords.length > 0) {
        this.build(keywords);
      }
    }

    _createNode() {
      return {
        transitions: new Map(), // char -> nextStateId
        failure: 0,             // fallback state pointer
        outputs: []             // array of matching pattern objects at this state
      };
    }

    /**
     * Inserts a keyword pattern into the Trie before BFS compilation.
     * @param {string} word Keyword string (case-normalized)
     * @param {Object} metadata Pattern metadata (category, weight, critical, etc.)
     */
    addPattern(word, metadata = {}) {
      if (!word || typeof word !== 'string') return;
      const normalizedWord = word.toLowerCase().trim();
      if (normalizedWord.length === 0) return;

      let currentState = 0;
      for (let i = 0; i < normalizedWord.length; i++) {
        const char = normalizedWord[i];
        let nextState = this.trie[currentState].transitions.get(char);

        if (nextState === undefined) {
          nextState = this.trie.length;
          this.trie.push(this._createNode());
          this.trie[currentState].transitions.set(char, nextState);
        }
        currentState = nextState;
      }

      const patternObj = {
        word: normalizedWord,
        category: metadata.category || 'GENERIC_SUSPICIOUS',
        weight: typeof metadata.weight === 'number' ? metadata.weight : 2.5,
        critical: Boolean(metadata.critical),
        id: metadata.id || metadata.category || 'PATTERN'
      };

      this.trie[currentState].outputs.push(patternObj);
      this.patternCount++;
      this.isCompiled = false;
    }

    /**
     * Compiles Trie into a complete Aho-Corasick automaton using BFS.
     * Generates failure links and unions output dictionaries across suffixes.
     * Converts transitions to a fully resolved DFA for O(1) state steps.
     * @param {Array<Object>} [keywords] Optional batch of keyword objects to load.
     */
    build(keywords = null) {
      if (Array.isArray(keywords)) {
        this.trie = [this._createNode()];
        this.patternCount = 0;
        for (const kw of keywords) {
          if (typeof kw === 'string') {
            this.addPattern(kw, { category: 'GENERIC_SUSPICIOUS', weight: 2.0 });
          } else if (kw && typeof kw === 'object') {
            this.addPattern(kw.word || kw.pattern, kw);
          }
        }
      }

      const queue = [];

      // Step 1: Initialize depth-1 states (direct children of root).
      // Their failure transitions point to root (state 0).
      for (const [char, nextState] of this.trie[0].transitions.entries()) {
        this.trie[nextState].failure = 0;
        queue.push(nextState);
      }

      // Step 2: BFS over remaining nodes to construct failure links and merge outputs.
      while (queue.length > 0) {
        const currentState = queue.shift();
        const currentFailure = this.trie[currentState].failure;

        for (const [char, nextState] of this.trie[currentState].transitions.entries()) {
          // Trace failure link to find fallback matching state
          let fallback = currentFailure;
          while (fallback > 0 && !this.trie[fallback].transitions.has(char)) {
            fallback = this.trie[fallback].failure;
          }

          if (this.trie[fallback].transitions.has(char)) {
            this.trie[nextState].failure = this.trie[fallback].transitions.get(char);
          } else {
            this.trie[nextState].failure = 0;
          }

          // Union matching dictionary outputs from the failure target
          const targetOutputs = this.trie[this.trie[nextState].failure].outputs;
          if (targetOutputs.length > 0) {
            this.trie[nextState].outputs = this.trie[nextState].outputs.concat(targetOutputs);
          }

          queue.push(nextState);
        }
      }

      this.isCompiled = true;
      return this;
    }

    /**
     * Resolves next state given a current state and input character.
     * Uses failure link recursion to emulate complete DFA transition table.
     * @param {number} state Current automaton state
     * @param {string} char Input character
     * @returns {number} Next automaton state
     */
    _step(state, char) {
      const node = this.trie[state];
      const direct = node.transitions.get(char);
      if (direct !== undefined) return direct;
      if (state === 0) return 0;

      let cur = node.failure;
      while (cur > 0 && !this.trie[cur].transitions.has(char)) {
        cur = this.trie[cur].failure;
      }
      const next = this.trie[cur].transitions.get(char) || 0;
      // Dynamic DFA memoization: turn tree lookup into direct O(1) transition
      node.transitions.set(char, next);
      return next;
    }

    /**
     * Traverses input text in linear O(N) time without backtracking.
     * Identifies all matching threat tokens, computes accumulated risk,
     * and categorizes findings.
     *
     * @param {string} text Normalized input text stream
     * @param {number} [threshold=4.5] Minimum score to classify as threat
     * @returns {Object} Threat evaluation result
     */
    search(text, threshold = 4.5) {
      if (!text || typeof text !== 'string') {
        return {
          isScam: false,
          totalScore: 0,
          riskLevel: 'LOW',
          matches: [],
          categories: [],
          criticalHits: 0
        };
      }

      if (!this.isCompiled) {
        this.build();
      }

      const input = text.toLowerCase();
      let state = 0;
      const matches = [];
      const seenPatterns = new Set();
      const categoryMap = new Map(); // category -> { count, totalWeight, critical }
      let totalScore = 0;
      let criticalHits = 0;

      for (let i = 0; i < input.length; i++) {
        const char = input[i];
        state = this._step(state, char);

        if (this.trie[state].outputs.length > 0) {
          for (const pattern of this.trie[state].outputs) {
            const wordLen = pattern.word.length;
            const startIndex = i - wordLen + 1;
            const endIndex = i + 1;
            const matchKey = `${pattern.word}@${startIndex}`;

            if (!seenPatterns.has(matchKey)) {
              seenPatterns.add(matchKey);

              matches.push({
                token: pattern.word,
                category: pattern.category,
                weight: pattern.weight,
                critical: pattern.critical,
                startIndex,
                endIndex
              });

              totalScore += pattern.weight;
              if (pattern.critical) {
                criticalHits++;
              }

              // Update category statistics
              const catStats = categoryMap.get(pattern.category) || {
                category: pattern.category,
                count: 0,
                totalWeight: 0,
                critical: false
              };
              catStats.count++;
              catStats.totalWeight += pattern.weight;
              if (pattern.critical) catStats.critical = true;
              categoryMap.set(pattern.category, catStats);
            }
          }
        }
      }

      // Bonus weighting for critical category triggers
      if (criticalHits > 0) {
        totalScore += criticalHits * 2.5;
      }

      // Compute consolidated threat level
      let riskLevel = 'LOW';
      if (totalScore >= 9.0 || criticalHits >= 2) {
        riskLevel = 'CRITICAL';
      } else if (totalScore >= 6.0 || criticalHits === 1) {
        riskLevel = 'HIGH';
      } else if (totalScore >= threshold) {
        riskLevel = 'MEDIUM';
      } else if (totalScore >= 2.0) {
        riskLevel = 'INFO';
      }

      const isScam = totalScore >= threshold || criticalHits > 0;

      return {
        isScam,
        totalScore: parseFloat(totalScore.toFixed(2)),
        riskLevel,
        criticalHits,
        matches,
        categories: Array.from(categoryMap.values()),
        matchedTokensCount: matches.length
      };
    }

    /**
     * Serializes automaton trie graph for offline storage or pre-compilation.
     */
    exportJSON() {
      const serializedTrie = this.trie.map(node => ({
        t: Array.from(node.transitions.entries()),
        f: node.failure,
        o: node.outputs
      }));

      return JSON.stringify({
        patternCount: this.patternCount,
        trie: serializedTrie
      });
    }

    /**
     * Hydrates pre-compiled automaton from JSON string.
     */
    static fromJSON(jsonStr) {
      const data = typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr;
      const ac = new AhoCorasick();
      ac.patternCount = data.patternCount || 0;
      ac.trie = data.trie.map(node => ({
        transitions: new Map(node.t),
        failure: node.f,
        outputs: node.o
      }));
      ac.isCompiled = true;
      return ac;
    }
  }

  return AhoCorasick;
});
