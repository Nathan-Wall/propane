import { assert, assertThrows } from './assert.js';
import { parseCerealString } from '../runtime/message.js';
import { ImmutableMap } from '../runtime/common/map/immutable.js';
import { ImmutableSet } from '../runtime/common/set/immutable.js';
import { test } from 'node:test';

export default function runCerealParserTests() {
  // 1. Whitespace tolerance
  // JSON-like structures with excessive mixed whitespace
  const whitespaceJson = ':{ \n  "a" : \t 1, \r\n "b":2 }';
  const wsObj = parseCerealString(whitespaceJson) as Record<string, number>;
  assert(wsObj['a'] === 1, 'Whitespace parse failed for a');
  assert(wsObj['b'] === 2, 'Whitespace parse failed for b');

  const whitespaceArray = ':[ 1,   2, \n 3 ]';
  const wsArr = parseCerealString(whitespaceArray) as number[];
  assert(wsArr.length === 3, 'Whitespace array length mismatch');
  assert(wsArr[2] === 3, 'Whitespace array content mismatch');

  // 2. Quoted strings with escapes
  // Tests handling of escaped characters within strings
  const escapedStr = String.raw`:{ "key": "Line\nBreak", "quote": "He said \"Hello\"" }`;
  const escObj = parseCerealString(escapedStr) as Record<string, string>;
  assert(escObj['key'] === 'Line\nBreak', 'Newline escape failed');
  assert(escObj['quote'] === 'He said "Hello"', 'Quote escape failed');

  // 3. Bare strings (identifiers)
  // Propane allows unquoted strings as keys and values
  const bareString = ':{ name: John, status: ACTIVE }';
  const bareObj = parseCerealString(bareString) as Record<string, string>;
  assert(bareObj['name'] === 'John', 'Bare string value failed');
  assert(bareObj['status'] === 'ACTIVE', 'Bare string value failed');

  // 4. Bare strings with spaces
  // Verify bare strings are consumed until a delimiter, allowing spaces
  const bareSpace = ':{ name: John Doe, status: VERY ACTIVE }';
  const bareSpaceObj = parseCerealString(bareSpace) as Record<string, string>;
  assert(bareSpaceObj['name'] === 'John Doe', 'Bare string with space failed (name)');
  assert(bareSpaceObj['status'] === 'VERY ACTIVE', 'Bare string with space failed (status)');

  // 5. Empty structures
  assert(Object.keys(parseCerealString(':{}') as object).length === 0, 'Empty object failed');
  assert((parseCerealString(':[]') as unknown[]).length === 0, 'Empty array failed');
  assert((parseCerealString(':M[]') as ImmutableMap<unknown, unknown>).size === 0, 'Empty map failed');
  assert((parseCerealString(':S[]') as ImmutableSet<unknown>).size === 0, 'Empty set failed');

  // 6. BigInts
  const bigInts = ':[ 123n, -456n, 0n ]';
  const biArr = parseCerealString(bigInts) as bigint[];
  assert(biArr[0] === 123n, 'BigInt 123n failed');
  assert(biArr[1] === -456n, 'BigInt -456n failed');
  assert(biArr[2] === 0n, 'BigInt 0n failed');

  // 7. Implicit vs Explicit keys
  // Mix of implicit numeric indices and explicit keys
  // { 1: "a", "b" } -> 1="a", 2="b"
  const mixedKeys = ':{ 1: "a", "b" }';
  const mkObj = parseCerealString(mixedKeys) as Record<string, string>;
  assert(mkObj['1'] === 'a', 'Explicit numeric key failed');
  assert(mkObj['2'] === 'b', 'Implicit numeric key failed');

  // { "a", 5: "b", "c" } -> 1="a", 5="b", 6="c"
  const skipKeys = ':{ "a", 5: "b", "c" }';
  const skObj = parseCerealString(skipKeys) as Record<string, string>;
  assert(skObj['1'] === 'a', 'Implicit start key failed');
  assert(skObj['5'] === 'b', 'Explicit skip key failed');
  assert(skObj['6'] === 'c', 'Implicit key after skip failed');

  // 8. Tagged Messages
  // $TagName{ data... }
  const tagged = ':$User{ "id": 1, "name": "Alice" }';
  type TaggedObj = { $tag: string; $data: Record<string, unknown> };
  const taggedObj = parseCerealString(tagged) as TaggedObj;
  assert(taggedObj.$tag === 'User', 'Tagged message tag extraction failed');
  assert(taggedObj.$data['id'] === 1, 'Tagged message data extraction failed');

  // 9. Typed Primitives
  // Dates (D"ISO"), URLs (U"href"), ArrayBuffers (B"base64")
  const dateStr = ':D"2023-01-01T00:00:00.000Z"';
  const dateObj = parseCerealString(dateStr) as Date;
  assert(dateObj instanceof Date, 'Date parsing failed');
  assert(dateObj.toISOString() === '2023-01-01T00:00:00.000Z', 'Date value mismatch');

  const urlStr = ':U"https://example.com/"';
  const urlObj = parseCerealString(urlStr) as URL;
  assert(urlObj instanceof URL, 'URL parsing failed');
  assert(urlObj.href === 'https://example.com/', 'URL value mismatch');

  // 10. Error cases
  // Verify parser robustness against malformed input
  assertThrows(() => parseCerealString('no-colon'), 'Should throw on missing prefix');
  assertThrows(() => parseCerealString(': { "a": 1 '), 'Should throw on unexpected end (object)');
  assertThrows(() => parseCerealString(': [ 1, 2 '), 'Should throw on unexpected end (array)');
  assertThrows(() => parseCerealString(': "unterminated'), 'Should throw on unterminated string');
  assertThrows(() => parseCerealString(': { "a" 1 }'), 'Should throw on missing colon');
  assertThrows(() => parseCerealString(': { a: 1 b: 2 }'), 'Should throw on missing comma');
  assertThrows(() => parseCerealString(': { a: 1 } garbage'), 'Should throw on trailing garbage');
  assertThrows(() => parseCerealString(': $Tag'), 'Should throw on incomplete tag');
}

test('runCerealParserTests', () => {
  runCerealParserTests();
});
