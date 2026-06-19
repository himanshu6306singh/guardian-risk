export { Guardian } from './engine/Guardian.js';
export { defineSignals, type TypedGuardian } from './guardian/defineSignals.js';
export { applyRules } from './presets/applyRules.js';
export {
  botDetectionRules,
  loginProtectionRules,
  type BotDetectionSignals,
} from './presets/botDetection.js';
export { RiskEngine } from './engine/RiskEngine.js';
export type { RiskEngineDependencies } from './engine/RiskEngine.js';

export type { Plugin, GuardianPlugin } from './plugins/Plugin.js';
export { PluginRegistry, PluginAlreadyInstalledError, PluginInstallError } from './plugins/PluginRegistry.js';

export type {
  AnalyzeContext,
  AfterAnalyzeContext,
  BeforeAnalyzeHook,
  AfterAnalyzeHook,
} from './types/hooks.js';

export { SignalStore } from './signals/SignalStore.js';

export { RuleBuilder } from './rules/RuleBuilder.js';
export { RuleEvaluator } from './rules/RuleEvaluator.js';

export { ScoreCalculator } from './score/ScoreCalculator.js';

export { resolveLevel } from './utils/resolveLevel.js';
export { parseIpAddress, isPrivateIp, sanitizeSessionId } from './utils/network.js';
export { HOOK_TIMEOUT_MS, MAX_SIGNAL_STRING_LENGTH } from './constants/security.js';

export type { SignalValue, SignalMap, SignalDefinition } from './types/signals.js';
export type { Rule, CreateRuleInput, MatchedRule, RuleGroupInput, RuleGroupCap } from './types/rules.js';
export type { RiskReport, RiskLevelThreshold, GuardianConfig } from './types/report.js';

export { DEFAULT_RISK_LEVELS } from './constants/defaults.js';
