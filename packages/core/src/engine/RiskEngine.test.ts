import { describe, it, expect } from 'vitest';
import { RiskEngine } from './RiskEngine.js';
import { SignalStore } from '../signals/SignalStore.js';
import { RuleEvaluator } from '../rules/RuleEvaluator.js';
import { ScoreCalculator } from '../score/ScoreCalculator.js';
import { ReportBuilder } from '../report/Report.js';
import { RuleBuilder } from '../rules/RuleBuilder.js';
import { DEFAULT_RISK_LEVELS } from '../constants/defaults.js';

function createEngine(): RiskEngine {
  const signalStore = new SignalStore();
  return new RiskEngine(
    {
      signalStore,
      ruleEvaluator: new RuleEvaluator(),
      scoreCalculator: new ScoreCalculator(),
      reportBuilder: new ReportBuilder(),
    },
    DEFAULT_RISK_LEVELS,
  );
}

describe('RiskEngine', () => {
  it('runs the full analysis pipeline', () => {
    const signalStore = new SignalStore();
    signalStore.set('postsPerMinute', 50);
    signalStore.set('emailVerified', false);

    const engineWithSignals = new RiskEngine(
      {
        signalStore,
        ruleEvaluator: new RuleEvaluator(),
        scoreCalculator: new ScoreCalculator(),
        reportBuilder: new ReportBuilder(),
      },
      DEFAULT_RISK_LEVELS,
    );

    engineWithSignals.addRule(
      RuleBuilder.create({
        name: 'HighPosting',
        when: (s) => (s.postsPerMinute as number) > 20,
        score: 20,
      }),
    );
    engineWithSignals.addRule(
      RuleBuilder.create({
        name: 'UnverifiedEmail',
        when: (s) => s.emailVerified === false,
        score: 15,
      }),
    );

    const report = engineWithSignals.analyze();

    expect(report.score).toBe(35);
    expect(report.level).toBe('MEDIUM');
    expect(report.matchedRules).toHaveLength(2);
  });

  it('returns zero score when no rules match', () => {
    const engine = createEngine();
    engine.addRule(
      RuleBuilder.create({ name: 'NeverMatch', when: () => false, score: 50 }),
    );

    const report = engine.analyze();
    expect(report.score).toBe(0);
    expect(report.level).toBe('LOW');
    expect(report.matchedRules).toHaveLength(0);
  });

  it('tracks registered rules', () => {
    const engine = createEngine();
    const rule = RuleBuilder.create({ name: 'R1', when: () => true, score: 10 });
    engine.addRule(rule);
    expect(engine.getRules()).toHaveLength(1);
  });
});
