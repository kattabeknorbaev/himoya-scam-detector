/**
 * Himoya Local Chrome AI Provider v4.0.0
 * Connects with Chrome Built-in On-Device AI (Gemini Nano via window.ai / window.ai.languageModel)
 * With graceful offline fallback to local ML + Heuristic Ensemble.
 */

(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.HimoyaAI = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {

  let session = null;
  let isAiAvailable = false;

  async function checkAvailability() {
    try {
      if (typeof window !== 'undefined' && window.ai && window.ai.languageModel) {
        const capabilities = await window.ai.languageModel.capabilities();
        if (capabilities && capabilities.available !== 'no') {
          isAiAvailable = true;
          return true;
        }
      }
    } catch (e) {
      isAiAvailable = false;
    }
    return false;
  }

  async function getSession() {
    if (session) return session;
    if (await checkAvailability()) {
      try {
        session = await window.ai.languageModel.create({
          systemPrompt: "You are a cybersecurity scam and phishing detection assistant for Central Asia. Respond only with JSON: {\"isScam\": boolean, \"confidence\": number, \"reason\": string}"
        });
        return session;
      } catch (e) {
        session = null;
      }
    }
    return null;
  }

  /**
   * Evaluates text using Chrome Built-in Gemini Nano if available
   */
  async function analyzeWithChromeAI(text) {
    const s = await getSession();
    if (!s) return null;

    try {
      const prompt = `Analyze this message in Uzbek or Russian. Is it an online financial scam, phishing, or fraud? Message: "${text.slice(0, 500)}"`;
      const rawResponse = await s.prompt(prompt);
      
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (err) {
      // Fallback to local ML
    }
    return null;
  }

  return {
    checkAvailability,
    analyzeWithChromeAI,
    isAvailable: () => isAiAvailable
  };
});
