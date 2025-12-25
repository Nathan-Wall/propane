import { assert } from './assert.js';
import { ImmutableMap } from '../runtime/common/map/immutable.js';
import { ToJson } from './to-json.pmsg.js';
import { test } from 'node:test';

export default function runToJsonTests() {
  const map = new Map<string, number>([
    ['a', 1],
    ['b', 2],
  ]);
  const imap = new ImmutableMap<string, number>([
    ['x', 10],
    ['y', 20],
  ]);
  const date = new Date('2020-01-02T03:04:05.000Z');

  const nestedMap = new Map<string, bigint>([['big', 5n]]);
  const nestedImmutable = new ImmutableMap<string, Date>([
    ['d', new Date('2021-05-06T07:08:09.000Z')],
  ]);

  const instance = new ToJson({
    map,
    imap,
    big: 123n,
    date,
    optional: undefined,
    nonFinite: Infinity,
    nested: {
      array: [1, undefined, NaN],
      map: nestedMap,
      imap: nestedImmutable,
    },
  });

  const jsonString = JSON.stringify(instance);
  const parsed = JSON.parse(jsonString);

  assert(JSON.stringify(parsed.map) === JSON.stringify([
    ['a', 1],
    ['b', 2],
  ]), 'Map should serialize as array of entries.');

  assert(JSON.stringify(parsed.imap) === JSON.stringify([
    ['x', 10],
    ['y', 20],
  ]), 'ImmutableMap should serialize as array of entries.');

  assert(parsed.big === '123n', 'Bigint should serialize with n suffix.');
  assert(parsed.date === '2020-01-02T03:04:05.000Z', 'Date should serialize via toJSON.');
  assert(parsed.optional === null, 'Undefined fields should serialize as null.');
  assert(parsed.nonFinite === null, 'Non-finite numbers should serialize as null.');

  assert(
    JSON.stringify(parsed.nested.array) === JSON.stringify([1, null, null]),
    'Arrays should normalize undefined and non-finite to null.'
  );

  assert(JSON.stringify(parsed.nested.map) === JSON.stringify([
    ['big', '5n'],
  ]), 'Nested Map should serialize recursively and convert bigint.');

  assert(JSON.stringify(parsed.nested.imap) === JSON.stringify([
    ['d', '2021-05-06T07:08:09.000Z'],
  ]), 'Nested ImmutableMap should serialize recursively and convert Date.');
}

test('runToJsonTests', () => {
  runToJsonTests();
});
