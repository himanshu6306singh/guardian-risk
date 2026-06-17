import { Guardian } from 'guardian-risk';

/**
 * Bot risk scoring example.
 *
 * Guardian does NOT detect bots. You define what "risky" means
 * by supplying signals and rules.
 */
const guardian = new Guardian();

guardian
  .signal('mouseLinearity', 0.95)
  .signal('requestBurst', 120)
  .signal('headlessUA', true)
  .signal('sessionAge', 3)
  .rule({
    name: 'LinearMouseMovement',
    reason: 'Mouse movement is unnaturally linear',
    when: (s) => (s.mouseLinearity as number) > 0.9,
    score: 25,
  })
  .rule({
    name: 'RequestBurst',
    reason: 'Unusually high request rate in short window',
    when: (s) => (s.requestBurst as number) > 50,
    score: 30,
  })
  .rule({
    name: 'HeadlessBrowser',
    reason: 'User agent indicates headless browser',
    when: (s) => s.headlessUA === true,
    score: 40,
  })
  .rule({
    name: 'NewSession',
    reason: 'Session is very new',
    when: (s) => (s.sessionAge as number) < 10,
    score: 10,
  });

const report = guardian.analyze();

console.log('Bot Risk Report');
console.log('================');
console.log('Score: ', report.score);
console.log('Level: ', report.level);
console.log('Reasons:');
for (const reason of report.reasons) {
  console.log(`  - ${reason}`);
}
console.log('Matched rules:', report.matchedRules.length);
