const SENSITIVE_PATTERNS = [
  /secret/i,
  /password/i,
  /privatekey/i,
  /private_key/i,
  /ssn/i,
  /salary/i,
  /salaryamount/i,
  /salary_amount/i,
  /token/i,
  /authorization/i,
  /cookie/i,
  /^proof$/i,
  /session/i,
  /salt/i,
  /merkle/i,
  /nullifier/i,
  /commitment/i,
  /privateinput/i,
  /private_input/i,
  /publicinput/i,
  /public_input/i,
  /seed/i,
  /mnemonic/i,
  /cipher/i,
];

const SENSITIVE_VALUE_PATTERNS = [
  /S[A-Z2-7]{55}/,
  /\b\d{3}-\d{2}-\d{4}\b/,
  /\b\d{9}\b/,
];

function isSensitiveKey(key: string): boolean {
  return SENSITIVE_PATTERNS.some((pattern) => pattern.test(key));
}

function redactSensitiveValues(text: string): string {
  return SENSITIVE_VALUE_PATTERNS.reduce((acc, pattern) => {
    return acc.replace(pattern, '[REDACTED]');
  }, text);
}

export function sanitize<T>(data: T): T {
  if (data === null || data === undefined) return data;
  if (typeof data === 'string') return redactSensitiveValues(data) as T;
  if (typeof data !== 'object') return data;

  if (Array.isArray(data)) {
    return data.map((item) => sanitize(item)) as T;
  }

  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    if (isSensitiveKey(key)) {
      result[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      result[key] = sanitize(value);
    } else if (typeof value === 'string') {
      result[key] = redactSensitiveValues(value);
    } else {
      result[key] = value;
    }
  }

  return result as T;
}
