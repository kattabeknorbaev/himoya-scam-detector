const { analyzeContent } = require('../src/engine/analyzer.js');
const testCases = require('./test_generalized_scam.js');

console.log('--- Testing Analyzer on 15 Generalized Cases ---');
let passed = 0;
testCases.forEach((tc, i) => {
  const res = analyzeContent(tc.text, 4.0, 'uz');
  const isMatch = res.isScam === tc.expectScam;
  if (isMatch) passed++;
  const mark = isMatch ? '✅' : '❌';
  console.log(`${mark} Case ${i + 1}: expected=${tc.expectScam}, got=${res.isScam} (${res.mlProbability}%, ${res.riskLevel}) - ${tc.desc}`);
  if (!isMatch) {
    console.log(`   Text: "${tc.text}"`);
    console.log(`   Score: ${res.score}, Categories: ${JSON.stringify(res.categories)}`);
  }
});
console.log(`\nFinal Score: ${passed}/${testCases.length} (${Math.round((passed / testCases.length) * 100)}%)`);
