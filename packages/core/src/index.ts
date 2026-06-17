export { Guardian } from './engine/Guardian.js';
export { RiskEngine } from './engine/RiskEngine.js';
export type { RiskEngineDependencies } from './engine/RiskEngine.js';

export { SignalStore } from './signals/SignalStore.js';

export { RuleBuilder } from './rules/RuleBuilder.js';
export { RuleEvaluator } from './rules/RuleEvaluator.js';

export { ScoreCalculator } from './score/ScoreCalculator.js';

export { resolveLevel } from './utils/resolveLevel.js';

export type { SignalValue, SignalMap, SignalDefinition } from './types/signals.js';
export type { Rule, CreateRuleInput, MatchedRule } from './types/rules.js';
export type { RiskReport, RiskLevelThreshold, GuardianConfig } from './types/report.js';

export { DEFAULT_RISK_LEVELS } from './constants/defaults.js';
