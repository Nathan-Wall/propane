import { describe, it } from 'node:test';
import assert from 'node:assert';
import { levenshteinDistance } from './levenshtein.js';

describe('levenshteinDistance', () => {
  it('returns 0 for identical strings', () => {
    assert.strictEqual(levenshteinDistance('', ''), 0);
    assert.strictEqual(levenshteinDistance('a', 'a'), 0);
    assert.strictEqual(levenshteinDistance('hello', 'hello'), 0);
    assert.strictEqual(levenshteinDistance('test', 'test'), 0);
  });

  it('returns length of other string when one is empty', () => {
    assert.strictEqual(levenshteinDistance('', 'abc'), 3);
    assert.strictEqual(levenshteinDistance('abc', ''), 3);
    assert.strictEqual(levenshteinDistance('', 'x'), 1);
    assert.strictEqual(levenshteinDistance('hello', ''), 5);
  });

  it('counts single character insertions', () => {
    assert.strictEqual(levenshteinDistance('a', 'ab'), 1);
    assert.strictEqual(levenshteinDistance('cat', 'cats'), 1);
    assert.strictEqual(levenshteinDistance('test', 'tests'), 1);
  });

  it('counts single character deletions', () => {
    assert.strictEqual(levenshteinDistance('ab', 'a'), 1);
    assert.strictEqual(levenshteinDistance('cats', 'cat'), 1);
    assert.strictEqual(levenshteinDistance('tests', 'test'), 1);
  });

  it('counts single character substitutions', () => {
    assert.strictEqual(levenshteinDistance('a', 'b'), 1);
    assert.strictEqual(levenshteinDistance('cat', 'bat'), 1);
    assert.strictEqual(levenshteinDistance('cat', 'cot'), 1);
    assert.strictEqual(levenshteinDistance('cat', 'car'), 1);
  });

  it('handles multiple edits', () => {
    assert.strictEqual(levenshteinDistance('kitten', 'sitting'), 3);
    assert.strictEqual(levenshteinDistance('saturday', 'sunday'), 3);
    assert.strictEqual(levenshteinDistance('abc', 'xyz'), 3);
  });

  it('is symmetric', () => {
    assert.strictEqual(
      levenshteinDistance('hello', 'hallo'),
      levenshteinDistance('hallo', 'hello')
    );
    assert.strictEqual(
      levenshteinDistance('kitten', 'sitting'),
      levenshteinDistance('sitting', 'kitten')
    );
    assert.strictEqual(
      levenshteinDistance('abc', 'def'),
      levenshteinDistance('def', 'abc')
    );
  });

  it('handles case sensitivity', () => {
    assert.strictEqual(levenshteinDistance('Hello', 'hello'), 1);
    assert.strictEqual(levenshteinDistance('ABC', 'abc'), 3);
    assert.strictEqual(levenshteinDistance('Test', 'test'), 1);
  });

  it('handles special characters', () => {
    assert.strictEqual(levenshteinDistance('hello!', 'hello'), 1);
    assert.strictEqual(levenshteinDistance('a b', 'ab'), 1);
    assert.strictEqual(levenshteinDistance('@extend', '@extends'), 1);
  });

  it('works for decorator typo detection use case', () => {
    // These are the cases we use for suggesting corrections
    assert.strictEqual(levenshteinDistance('extends', 'extend'), 1);
    assert.strictEqual(levenshteinDistance('extned', 'extend'), 2);
    assert.strictEqual(levenshteinDistance('exten', 'extend'), 1);
    assert.strictEqual(levenshteinDistance('etxend', 'extend'), 2);

    // Too different - should not suggest
    assert.ok(levenshteinDistance('deprecated', 'extend') > 3);
    assert.ok(levenshteinDistance('foo', 'extend') > 3);
  });

  it('handles unicode characters', () => {
    assert.strictEqual(levenshteinDistance('cafe', 'café'), 1);
    assert.strictEqual(levenshteinDistance('hello', 'hellö'), 1);
  });

  it('handles longer strings efficiently', () => {
    const a = 'abcdefghij';
    const b = 'abcdefghik';
    assert.strictEqual(levenshteinDistance(a, b), 1);

    const c = 'abcdefghij';
    const d = 'jihgfedcba';
    assert.strictEqual(levenshteinDistance(c, d), 10);
  });
});
