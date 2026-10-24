/**
 * Deterministic JSON Canonicalization Scheme (RFC 8785 compliant)
 * Ensures equivalent object structures produce byte-for-byte identical UTF-8 representations.
 * Handles lexicographical key sorting by UTF-16 code units, IEEE 754 numbers (including -0 -> 0),
 * Unicode preservation, circular reference detection, and rejection of non-finite numbers.
 */

export function canonicalize(obj: any, seen = new WeakSet()): string {
  if (obj === null) {
    return 'null';
  }

  if (obj === undefined || typeof obj === 'function' || typeof obj === 'symbol') {
    return 'null';
  }

  if (typeof obj === 'boolean') {
    return obj ? 'true' : 'false';
  }

  if (typeof obj === 'number') {
    if (!Number.isFinite(obj)) {
      throw new Error('RFC 8785 Canonicalization Error: NaN and Infinity are not valid JSON numbers.');
    }
    // RFC 8785 Section 3.2.2.3: -0 must be serialized as 0
    if (Object.is(obj, -0)) {
      return '0';
    }
    return JSON.stringify(obj);
  }

  if (typeof obj === 'string') {
    return JSON.stringify(obj);
  }

  if (obj instanceof Date) {
    return JSON.stringify(obj.toISOString());
  }

  if (Array.isArray(obj)) {
    if (seen.has(obj)) {
      throw new Error('RFC 8785 Canonicalization Error: Circular array reference detected.');
    }
    seen.add(obj);

    const elements = obj.map((item) => {
      if (item === undefined || typeof item === 'function' || typeof item === 'symbol') {
        return 'null';
      }
      return canonicalize(item, seen);
    });

    seen.delete(obj);
    return '[' + elements.join(',') + ']';
  }

  if (typeof obj === 'object') {
    if (seen.has(obj)) {
      throw new Error('RFC 8785 Canonicalization Error: Circular object reference detected.');
    }
    seen.add(obj);

    // Sort keys lexicographically by UTF-16 code units (RFC 8785 Section 3.2.3)
    const sortedKeys = Object.keys(obj).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
    const pairs: string[] = [];

    for (const key of sortedKeys) {
      const val = obj[key];
      // Skip undefined, functions, and symbols to keep consistent with JSON standard
      if (val === undefined || typeof val === 'function' || typeof val === 'symbol') {
        continue;
      }
      pairs.push(`${JSON.stringify(key)}:${canonicalize(val, seen)}`);
    }

    seen.delete(obj);
    return '{' + pairs.join(',') + '}';
  }

  return JSON.stringify(obj);
}
