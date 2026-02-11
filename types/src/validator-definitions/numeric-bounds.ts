import type { ImportCollector, TypeInfo } from '../registry.js';

function parseStrictDecimal(
  raw: string,
  context: string
): { digits: string; scale: number } {
  if (/\s/.test(raw)) {
    throw new SyntaxError(`Invalid ${context} format: whitespace not allowed`);
  }
  if (raw.length === 0) {
    throw new SyntaxError(`Invalid ${context} format: empty string`);
  }

  let input = raw;
  if (input.startsWith('+') || input.startsWith('-')) {
    input = input.slice(1);
  }

  if (input.length === 0) {
    throw new SyntaxError(`Invalid ${context} format: missing digits`);
  }

  const dotIndex = input.indexOf('.');
  let intPart = input;
  let fracPart = '';
  if (dotIndex !== -1) {
    intPart = input.slice(0, dotIndex);
    fracPart = input.slice(dotIndex + 1);
    if (intPart.length === 0 || fracPart.length === 0) {
      throw new SyntaxError(`Invalid ${context} format: invalid decimal point`);
    }
  }

  if (!/^\d+$/.test(intPart) || fracPart && !/^\d+$/.test(fracPart)) {
    throw new SyntaxError(`Invalid ${context} digits: ${raw}`);
  }

  const rawDigits = `${intPart}${fracPart}`;
  const digits = rawDigits.replace(/^0+(?=\d)/, '');
  return {
    digits: digits.length === 0 ? '0' : digits,
    scale: fracPart.length,
  };
}

function normalizeDecimalBoundString(
  precision: number,
  scale: number,
  value: string
): string {
  const parsed = parseStrictDecimal(value, 'decimal bound');
  let digits = parsed.digits;
  const scaleDiff = parsed.scale - scale;

  if (scaleDiff > 0) {
    const cutIndex = digits.length - scaleDiff;
    const dropped = cutIndex > 0 ? digits.slice(cutIndex) : digits;
    if (/[1-9]/.test(dropped)) {
      throw new RangeError(
        `Value is not exactly representable at scale ${scale}`
      );
    }
    digits = cutIndex > 0 ? digits.slice(0, cutIndex) : '0';
  } else if (scaleDiff < 0) {
    digits = `${digits}${'0'.repeat(-scaleDiff)}`;
  }

  const normalizedDigits = digits.replace(/^0+(?=\d)/, '');
  if (normalizedDigits.length > precision) {
    throw new RangeError(
      `Value has ${normalizedDigits.length} digits, exceeds precision ${precision}`
    );
  }

  if (scale <= 0) {
    return `${normalizedDigits}${'0'.repeat(-scale)}`;
  }

  const padded = normalizedDigits.padStart(scale + 1, '0');
  const intPart = padded.slice(0, -scale) || '0';
  const fracPart = padded.slice(-scale);
  return `${intPart}.${fracPart}`;
}

function validateRationalBound(value: string, context: string): void {
  const input = value.trim();
  if (input.length === 0) {
    throw new SyntaxError(`Invalid rational bound in ${context}: empty string`);
  }

  const slashIndex = input.indexOf('/');
  if (slashIndex !== -1) {
    const left = input.slice(0, slashIndex).trim();
    const right = input.slice(slashIndex + 1).trim();
    if (!/^[+-]?\d+$/.test(left) || !/^[+-]?\d+$/.test(right)) {
      throw new SyntaxError(`Invalid rational bound in ${context}`);
    }
    if (right === '0' || right === '+0' || right === '-0') {
      throw new RangeError(`Invalid rational bound in ${context}: denominator is zero`);
    }
    return;
  }

  let base = input;
  const expIndex = input.search(/e|E/);
  if (expIndex !== -1) {
    const expPart = input.slice(expIndex + 1);
    base = input.slice(0, expIndex);
    if (!/^[+-]?\d+$/.test(expPart)) {
      throw new SyntaxError(`Invalid rational bound exponent in ${context}`);
    }
  }

  if (base.startsWith('+') || base.startsWith('-')) {
    base = base.slice(1);
  }
  if (base.length === 0) {
    throw new SyntaxError(`Invalid rational bound in ${context}`);
  }

  const dotIndex = base.indexOf('.');
  let intPart = base;
  let fracPart = '';
  if (dotIndex !== -1) {
    intPart = base.slice(0, dotIndex);
    fracPart = base.slice(dotIndex + 1);
    if (intPart.length === 0 || fracPart.length === 0) {
      throw new SyntaxError(`Invalid rational bound in ${context}`);
    }
  }

  const cleanedInt = stripSeparatorChars(intPart);
  const cleanedFrac = stripSeparatorChars(fracPart);
  const hasValidInt = /^\d+$/.test(cleanedInt);
  const hasValidFrac =
    cleanedFrac.length === 0 || /^\d+$/.test(cleanedFrac);
  if (!hasValidInt || !hasValidFrac) {
    throw new SyntaxError(`Invalid rational bound in ${context}`);
  }
}

function stripSeparatorChars(value: string): string {
  return value.replace(/[ _]/gu, '');
}

export function formatNumericBound(
  bound: number | bigint | string,
  type: TypeInfo,
  imports: ImportCollector,
  context: string
): string {
  if (typeof bound === 'string') {
    if (type.kind === 'Decimal') {
      if (type.precision === undefined || type.scale === undefined) {
        throw new Error(`Decimal bounds require precision and scale in ${context}.`);
      }
      try {
        normalizeDecimalBoundString(type.precision, type.scale, bound);
      } catch (err) {
        const suffix = err instanceof Error ? ` (${err.message})` : '';
        throw new Error(`Invalid decimal bound '${bound}' in ${context}.${suffix}`);
      }
      imports.add('Decimal', '@propane/runtime');
      return `Decimal.fromStrictString(${type.precision}, ${type.scale}, ${JSON.stringify(bound)})`;
    }
    if (type.kind === 'Rational') {
      try {
        validateRationalBound(bound, context);
      } catch (err) {
        const suffix = err instanceof Error ? ` (${err.message})` : '';
        throw new Error(`Invalid rational bound '${bound}' in ${context}.${suffix}`);
      }
      imports.add('Rational', '@propane/runtime');
      return `Rational.fromString(${JSON.stringify(bound)})`;
    }
    throw new Error(`String bounds are only supported for Decimal or Rational in ${context}.`);
  }

  if (typeof bound === 'bigint') {
    return `${bound}n`;
  }

  if (type.kind === 'bigint') {
    if (!Number.isInteger(bound)) {
      throw new TypeError(`Bigint bound must be an integer in ${context}.`);
    }
    return `${bound}n`;
  }

  return String(bound);
}
