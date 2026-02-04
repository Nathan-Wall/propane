import { test } from 'node:test';
import { assert } from './assert.js';
import { ImmutableMap } from '../runtime/common/map/immutable.js';
import { ImmutableSet } from '../runtime/common/set/immutable.js';
import { ImmutableArray } from '../runtime/common/array/immutable.js';

function* mapEntries() {
  yield ['a', 1];
}

function* setValues() {
  yield 'a';
}

function* arrayValues() {
  yield 1;
  yield 2;
}

test('ImmutableMap.isInstance uses structural predicate', () => {
  const stub = {
    [Symbol.toStringTag]: 'ImmutableMap',
    entries: mapEntries,
  };
  assert(
    ImmutableMap.isInstance(stub),
    'ImmutableMap.isInstance should accept map-like objects with matching tag.'
  );
  assert(
    !ImmutableMap.isInstance({ [Symbol.toStringTag]: 'ImmutableMap' }),
    'ImmutableMap.isInstance should reject missing entries().'
  );
});

test('ImmutableSet.isInstance uses structural predicate', () => {
  const stub = {
    [Symbol.toStringTag]: 'ImmutableSet',
    values: setValues,
  };
  assert(
    ImmutableSet.isInstance(stub),
    'ImmutableSet.isInstance should accept set-like objects with matching tag.'
  );
  assert(
    !ImmutableSet.isInstance({ [Symbol.toStringTag]: 'ImmutableSet' }),
    'ImmutableSet.isInstance should reject missing values().'
  );
});

test('ImmutableArray.isInstance uses structural predicate', () => {
  const stub = {
    [Symbol.toStringTag]: 'ImmutableArray',
    values: arrayValues,
  };
  assert(
    ImmutableArray.isInstance(stub),
    'ImmutableArray.isInstance should accept array-like objects with matching tag.'
  );
  assert(
    !ImmutableArray.isInstance({ [Symbol.toStringTag]: 'ImmutableArray' }),
    'ImmutableArray.isInstance should reject missing values().'
  );
});
