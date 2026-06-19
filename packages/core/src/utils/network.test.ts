import { describe, it, expect } from 'vitest';
import { parseIpAddress, isPrivateIp, sanitizeSessionId } from './network.js';

describe('network utils', () => {
  it('parses valid IPv4', () => {
    expect(parseIpAddress('203.0.113.10')).toBe('203.0.113.10');
  });

  it('rejects invalid IPs', () => {
    expect(parseIpAddress('not-an-ip')).toBeNull();
    expect(parseIpAddress('')).toBeNull();
    expect(parseIpAddress('a'.repeat(46))).toBeNull();
  });

  it('detects private IPv4 ranges', () => {
    expect(isPrivateIp('127.0.0.1')).toBe(true);
    expect(isPrivateIp('10.0.0.1')).toBe(true);
    expect(isPrivateIp('192.168.1.1')).toBe(true);
    expect(isPrivateIp('169.254.0.1')).toBe(true);
    expect(isPrivateIp('0.0.0.0')).toBe(true);
    expect(isPrivateIp('172.16.0.1')).toBe(true);
    expect(isPrivateIp('172.31.255.255')).toBe(true);
    expect(isPrivateIp('172.32.0.1')).toBe(false);
    expect(isPrivateIp('100.64.0.1')).toBe(true);
    expect(isPrivateIp('100.127.255.255')).toBe(true);
    expect(isPrivateIp('100.63.0.1')).toBe(false);
    expect(isPrivateIp('203.0.113.10')).toBe(false);
  });

  it('detects private IPv6 ranges', () => {
    expect(isPrivateIp('::1')).toBe(true);
    expect(isPrivateIp('fc00::1')).toBe(true);
    expect(isPrivateIp('fd12::1')).toBe(true);
    expect(isPrivateIp('fe80::1')).toBe(true);
    expect(isPrivateIp('2001:db8::1')).toBe(false);
  });

  it('treats invalid IPs as private', () => {
    expect(isPrivateIp('not-an-ip')).toBe(true);
  });

  it('sanitizes session IDs', () => {
    expect(sanitizeSessionId('user-123_session')).toBe('user-123_session');
    expect(sanitizeSessionId('../etc/passwd')).toBeNull();
    expect(sanitizeSessionId('a'.repeat(200))).toBeNull();
  });
});
