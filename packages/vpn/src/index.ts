import type { Plugin } from 'guardian-risk';

/** IP intelligence provider (stub). */
export type VpnProvider = 'maxmind' | 'ipinfo' | 'custom';

/** Options for the VPN plugin (stub). */
export interface VpnPluginOptions {
  /** Provider used to classify IP addresses. */
  readonly provider?: VpnProvider;
  /** Default risk score added when VPN rules are registered by the plugin. */
  readonly vpnScore?: number;
  /** Register default VPN/proxy/Tor rules on install. */
  readonly registerDefaultRules?: boolean;
}

/**
 * VPN / proxy detection plugin for guardian-risk.
 *
 * @stub Future versions will resolve client IP via MaxMind, IPinfo, or a custom
 * provider and add signals such as `vpn`, `proxy`, `tor`, and `country`.
 */
export function vpnPlugin(options: VpnPluginOptions = {}): Plugin {
  const {
    provider = 'maxmind',
    vpnScore = 20,
    registerDefaultRules = true,
  } = options;

  return {
    name: 'guardian-risk-vpn',
    install(guardian) {
      void provider;

      if (!registerDefaultRules) {
        return;
      }

      guardian.rule({
        name: 'VpnDetected',
        reason: 'Connection appears to use a VPN',
        when: (s) => s.vpn === true,
        score: vpnScore,
      });

      guardian.rule({
        name: 'ProxyDetected',
        reason: 'Connection appears to use a proxy',
        when: (s) => s.proxy === true,
        score: vpnScore,
      });

      guardian.rule({
        name: 'TorDetected',
        reason: 'Connection appears to use Tor',
        when: (s) => s.tor === true,
        score: vpnScore + 10,
      });
    },
  };
}

/**
 * @stub Future helper to resolve an IP and add VPN-related signals.
 */
export async function checkIp(
  _ip: string,
  guardian: import('guardian-risk').Guardian,
): Promise<import('guardian-risk').Guardian> {
  return guardian
    .signal('signalSource', 'vpn')
    .signal('vpn', false)
    .signal('proxy', false)
    .signal('tor', false)
    .signal('country', 'unknown');
}
