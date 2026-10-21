import { describe, it, expect } from 'vitest';
import { sanitize } from '@/lib/sanitize';

describe('sanitize', () => {
  it('redacts sensitive fields', () => {
    const data = {
      publicKey: 'GABCDEF',
      secret: 'my-secret-value',
      password: 'hunter2',
      privateKey: 'SXXXX',
    };

    const result = sanitize(data);

    expect(result.publicKey).toBe('GABCDEF');
    expect(result.secret).toBe('[REDACTED]');
    expect(result.password).toBe('[REDACTED]');
    expect(result.privateKey).toBe('[REDACTED]');
  });

  it('passes through non-sensitive fields unchanged', () => {
    const data = {
      name: 'Alice',
      email: 'alice@example.com',
      role: 'admin',
      count: 42,
    };

    const result = sanitize(data);

    expect(result).toEqual(data);
  });

  it('sanitizes nested objects', () => {
    const data = {
      user: {
        name: 'Bob',
        salary: 100000,
        credentials: {
          password: 'secret123',
          publicKey: 'GABCDEF',
        },
      },
    };

    const result = sanitize(data);

    expect(result.user.name).toBe('Bob');
    expect(result.user.salary).toBe('[REDACTED]');
    expect(result.user.credentials.password).toBe('[REDACTED]');
    expect(result.user.credentials.publicKey).toBe('GABCDEF');
  });

  it('sanitizes arrays', () => {
    const data = [
      { name: 'Alice', ssn: '123-45-6789' },
      { name: 'Bob', ssn: '987-65-4321' },
    ];

    const result = sanitize(data);

    expect(result[0].name).toBe('Alice');
    expect(result[0].ssn).toBe('[REDACTED]');
    expect(result[1].name).toBe('Bob');
    expect(result[1].ssn).toBe('[REDACTED]');
  });

  it('handles null and undefined gracefully', () => {
    expect(sanitize(null)).toBeNull();
    expect(sanitize(undefined)).toBeUndefined();
  });

  it('handles primitive values', () => {
    expect(sanitize('hello')).toBe('hello');
    expect(sanitize(42)).toBe(42);
    expect(sanitize(true)).toBe(true);
  });

  it('redacts newly added sensitive key patterns', () => {
    const data = {
      proof: '0xzkproof_abc123',
      session: 'session-token-value',
      salt: 'abc123def',
      merkle: '0xmerkle123',
      nullifier: 'nf_abc123',
      commitment: 'cm_abc123',
      privateInput: 'secret-value',
      publicInput: 'public-value',
    };

    const result = sanitize(data);

    expect(result.proof).toBe('[REDACTED]');
    expect(result.session).toBe('[REDACTED]');
    expect(result.salt).toBe('[REDACTED]');
    expect(result.merkle).toBe('[REDACTED]');
    expect(result.nullifier).toBe('[REDACTED]');
    expect(result.commitment).toBe('[REDACTED]');
    expect(result.privateInput).toBe('[REDACTED]');
    expect(result.publicInput).toBe('[REDACTED]');
  });

  it('redacts Stellar secret keys in string values', () => {
    const stellarKey = 'S' + 'A'.repeat(55);
    const data = {
      secretKey: stellarKey,
      note: `My key is ${stellarKey}`,
    };

    const result = sanitize(data);

    expect(result.secretKey).toBe('[REDACTED]');
    expect(result.note).toBe('My key is [REDACTED]');
  });

  it('redacts SSN patterns in string values', () => {
    const data = {
      ssn: '123-45-6789',
      note: 'Employee SSN is 123-45-6789',
    };

    const result = sanitize(data);

    expect(result.ssn).toBe('[REDACTED]');
    expect(result.note).toBe('Employee SSN is [REDACTED]');
  });

  it('redacts sensitive data in log message strings', () => {
    const stellarKey = 'S' + 'A'.repeat(55);
    const result = sanitize(`Employee ${stellarKey} has salary 50000`);

    expect(result).not.toContain(stellarKey);
    expect(result).toContain('[REDACTED]');
  });

  it('does not redact ZK proof hex strings by default (no matching pattern)', () => {
    const result = sanitize('Generated proof: 0xzkproof_abc123');

    expect(result).toBe('Generated proof: 0xzkproof_abc123');
  });

  it('does not redact non-sensitive string values', () => {
    const data = { name: 'Alice', role: 'admin' };
    const result = sanitize(data);
    expect(result).toEqual(data);
  });
});
