import { Guardian, defineSignals, applyRules, botDetectionRules } from 'guardian-risk';

/**
 * Bot risk scoring example with typed signals and preset rules.
 */
const bot = defineSignals<{
  mouseLinearity: number;
  requestBurst: number;
  headlessUA: boolean;
  sessionAgeSeconds: number;
  requestsPerMinute: number;
}>();

const guardian = applyRules(bot.create(), botDetectionRules);

guardian
  .signal('mouseLinearity', 0.95)
  .signal('requestBurst', 120)
  .signal('headlessUA', true)
  .signal('sessionAgeSeconds', 3)
  .signal('requestsPerMinute', 5);

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
