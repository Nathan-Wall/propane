import { test } from 'node:test';
import { assert } from './assert.js';
import { ImmutableMap } from '../runtime/common/map/immutable.js';
import { ImmutableSet } from '../runtime/common/set/immutable.js';
import { ImmutableArray } from '../runtime/common/array/immutable.js';

const IMMUTABLE_MAP_TAG = Symbol.for('propane:ImmutableMap');
const IMMUTABLE_SET_TAG = Symbol.for('propane:ImmutableSet');
const IMMUTABLE_ARRAY_TAG = Symbol.for('propane:ImmutableArray');

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

test('ImmutableMap.isInstance uses brand predicate', () => {
  const stub = {
    [IMMUTABLE_MAP_TAG]: true,
  };
  assert(
    ImmutableMap.isInstance(stub),
    'ImmutableMap.isInstance should accept objects with matching brand.'
  );
  assert(
    !ImmutableMap.isInstance({ entries: mapEntries }),
    'ImmutableMap.isInstance should reject objects missing brand.'
  );
});

test('ImmutableSet.isInstance uses brand predicate', () => {
  const stub = {
    [IMMUTABLE_SET_TAG]: true,
  };
  assert(
    ImmutableSet.isInstance(stub),
    'ImmutableSet.isInstance should accept objects with matching brand.'
  );
  assert(
    !ImmutableSet.isInstance({ values: setValues }),
    'ImmutableSet.isInstance should reject objects missing brand.'
  );
});

test('ImmutableArray.isInstance uses brand predicate', () => {
  const stub = {
    [IMMUTABLE_ARRAY_TAG]: true,
  };
  assert(
    ImmutableArray.isInstance(stub),
    'ImmutableArray.isInstance should accept objects with matching brand.'
  );
  assert(
    !ImmutableArray.isInstance({ values: arrayValues }),
    'ImmutableArray.isInstance should reject objects missing brand.'
  );
});
