import { assert } from './assert.js';
import { ArrayMessage, ArrayMessage_Labels_Item } from './indexed-array.pmsg.js';
import { ImmutableArray } from '../runtime/common/array/immutable.js';
import { test } from 'node:test';

export default function runIndexedArrayTests() {

  const arrayInstance: ArrayMessage = new ArrayMessage({
    names: ['Alpha', 'Beta', 'Gamma Value'],
    scores: [1, 2, 3],
    flags: [true, false],
    labels: [new ArrayMessage_Labels_Item({ name: 'Label A' })],
  });

  assert(
    arrayInstance.serialize() === ':{[Alpha,Beta,"Gamma Value"],[1,2,3],[true,false],[{name:"Label A"}]}',
    'Array serialization incorrect.'
  );

  const arrayRaw = ArrayMessage.deserialize(':{[Delta,Echo],[4,5],4:[{"name":"Label B"}]}');
  assert(arrayRaw.names[0] === 'Delta', 'Array raw lost names.');
  assert(arrayRaw.flags === undefined, 'Array raw optional flags should be undefined.');
  assert(arrayRaw.labels[0], 'Array raw labels lost.');
  assert(arrayRaw.labels[0]!.name === 'Label B', 'Array raw labels lost.');

  // iterable inputs (not Array) should normalize
  const nameIter = new Set(['Iter', 'Able']).values();
  const scoreIter = (function* () { yield 10; yield 20; })();
  const labelIter = new Map<number, { name: string }>([[1, { name: 'MapLabel' }]]).values();
  const iterableInstance = new ArrayMessage({
    names: nameIter,
    scores: scoreIter,
    // Cast needed: MapIterator yields plain objects but constructor normalizes them
    labels: labelIter as Iterable<ArrayMessage_Labels_Item>,
  });
  assert(ImmutableArray.isInstance(iterableInstance.names), 'iterable names should normalize to ImmutableArray');
  assert(iterableInstance.names[0] === 'Iter' && iterableInstance.names[1] === 'Able', 'iterable names normalize and preserve order');
  assert(iterableInstance.scores[0] === 10 && iterableInstance.scores[1] === 20, 'iterable scores normalize');
  assert(iterableInstance.labels[0]!.name === 'MapLabel', 'iterable labels normalize');

  const pushedNames = arrayInstance.pushName('Delta', 'Echo');
  assert(arrayInstance.names.length === 3, 'pushName should not mutate original array.');
  assert(pushedNames.names.length === 5, 'pushName should append new values.');
  assert(pushedNames.names[3] === 'Delta' && pushedNames.names[4] === 'Echo', 'pushName inserted values in order.');

  const poppedNames = arrayInstance.popName();
  assert(poppedNames.names.length === 2, 'popName should remove the last value.');
  assert(arrayInstance.names.length === 3, 'popName should not mutate source array.');

  const shiftedScores = arrayInstance.shiftScore();
  assert(shiftedScores.scores[0] === 2, 'shiftScore should drop the first element.');

  const unshiftedScores = arrayInstance.unshiftScore(-1, 0);
  assert(unshiftedScores.scores[0] === -1 && unshiftedScores.scores[1] === 0, 'unshiftScore should prepend values.');

  const splicedNames = arrayInstance.spliceName(1, 1, 'Beta-2');
  assert(splicedNames.names[1] === 'Beta-2', 'spliceName should replace removed slots.');

  const reversedNames = arrayInstance.reverseNames();
  assert(reversedNames.names[0] === 'Gamma Value', 'reverseNames should reverse order.');

  const sortedScores = arrayInstance.sortScores(
    (a: number, b: number) => b - a
  );
  assert(sortedScores.scores[0] === 3 && sortedScores.scores[2] === 1, 'sortScores should reorder values using comparator.');

  const filledNames = arrayInstance.fillName('Filled', 1, 3);
  assert(filledNames.names[1] === 'Filled' && filledNames.names[2] === 'Filled', 'fillName should overwrite specified range.');

  const copyWithinScores = arrayInstance.copyWithinScores(1, 0, 1);
  assert(copyWithinScores.scores[0] === 1 && copyWithinScores.scores[1] === 1, 'copyWithinScores should copy slice into target.');

  const optionalArrayInstance = new ArrayMessage({
    names: [],
    scores: [],
    labels: [],
  });
  const flagsAdded = optionalArrayInstance.pushFlag(true, false);
  assert(optionalArrayInstance.flags === undefined, 'pushFlag should not mutate undefined source array.');
  assert(flagsAdded.flags?.length === 2, 'pushFlag should initialize optional array.');

  const flagsShifted = flagsAdded.shiftFlag();
  assert(
    flagsShifted.flags?.length === 1
      && flagsShifted.flags[0] === false,
    'shiftFlag should remove first entry.'
  );
}

test('runIndexedArrayTests', () => {
  runIndexedArrayTests();
});
