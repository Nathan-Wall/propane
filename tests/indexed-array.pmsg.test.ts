import { assert } from './assert.ts';
import { ArrayMessage } from './indexed-array.pmsg.ts';
import { ImmutableArray } from '../../runtime/common/array/immutable.ts';

export default function runIndexedArrayTests() {

  const arrayInstance: ArrayMessageInstance = new ArrayMessage({
    names: ['Alpha', 'Beta', 'Gamma Value'],
    scores: [1, 2, 3],
    flags: [true, false],
    labels: [{ name: 'Label A' }],
  });

  assert(
    arrayInstance.serialize() === ':{[Alpha,Beta,Gamma Value],[1,2,3],[true,false],[{name:Label A}]}',
    'Array serialization incorrect.'
  );

  const arrayRaw = ArrayMessage.deserialize(':{[Delta,Echo],[4,5],4:[{"name":"Label B"}]}');
  const arrayRawData = arrayRaw.cerealize();
  assert(arrayRawData.names[0] === 'Delta', 'Array raw lost names.');
  assert(arrayRawData.flags === undefined, 'Array raw optional flags should be undefined.');
  assert(arrayRawData.labels[0], 'Array raw labels lost.');
  assert(arrayRawData.labels[0].name === 'Label B', 'Array raw labels lost.');

  // iterable inputs (not Array) should normalize
  const nameIter = new Set(['Iter', 'Able']).values();
  const scoreIter = (function* () { yield 10; yield 20; })();
  const labelIter = new Map<number, { name: string }>([[1, { name: 'MapLabel' }]]).values();
  const iterableInstance = new ArrayMessage({
    names: nameIter,
    scores: scoreIter,
    labels: labelIter,
  });
  assert(iterableInstance.names instanceof ImmutableArray, 'iterable names should normalize to ImmutableArray');
  assert(iterableInstance.names[0] === 'Iter' && iterableInstance.names[1] === 'Able', 'iterable names normalize and preserve order');
  assert(iterableInstance.scores[0] === 10 && iterableInstance.scores[1] === 20, 'iterable scores normalize');
  assert(iterableInstance.labels[0].name === 'MapLabel', 'iterable labels normalize');

  const pushedNames = arrayInstance.pushNames('Delta', 'Echo');
  assert(arrayInstance.names.length === 3, 'pushNames should not mutate original array.');
  assert(pushedNames.names.length === 5, 'pushNames should append new values.');
  assert(pushedNames.names[3] === 'Delta' && pushedNames.names[4] === 'Echo', 'pushNames inserted values in order.');

  const poppedNames = arrayInstance.popNames();
  assert(poppedNames.names.length === 2, 'popNames should remove the last value.');
  assert(arrayInstance.names.length === 3, 'popNames should not mutate source array.');

  const shiftedScores = arrayInstance.shiftScores();
  assert(shiftedScores.scores[0] === 2, 'shiftScores should drop the first element.');

  const unshiftedScores = arrayInstance.unshiftScores(-1, 0);
  assert(unshiftedScores.scores[0] === -1 && unshiftedScores.scores[1] === 0, 'unshiftScores should prepend values.');

  const splicedNames = arrayInstance.spliceNames(1, 1, 'Beta-2');
  assert(splicedNames.names[1] === 'Beta-2', 'spliceNames should replace removed slots.');

  const reversedNames = arrayInstance.reverseNames();
  assert(reversedNames.names[0] === 'Gamma Value', 'reverseNames should reverse order.');

  const sortedScores = arrayInstance.sortScores(
    (a: number, b: number) => b - a
  );
  assert(sortedScores.scores[0] === 3 && sortedScores.scores[2] === 1, 'sortScores should reorder values using comparator.');

  const filledNames = arrayInstance.fillNames('Filled', 1, 3);
  assert(filledNames.names[1] === 'Filled' && filledNames.names[2] === 'Filled', 'fillNames should overwrite specified range.');

  const copyWithinScores = arrayInstance.copyWithinScores(1, 0, 1);
  assert(copyWithinScores.scores[0] === 1 && copyWithinScores.scores[1] === 1, 'copyWithinScores should copy slice into target.');

  const optionalArrayInstance = new ArrayMessage({
    names: [],
    scores: [],
    labels: [],
  });
  const flagsAdded = optionalArrayInstance.pushFlags(true, false);
  assert(optionalArrayInstance.flags === undefined, 'pushFlags should not mutate undefined source array.');
  assert(flagsAdded.flags?.length === 2, 'pushFlags should initialize optional array.');

  const flagsShifted = flagsAdded.shiftFlags();
  assert(
    flagsShifted.flags?.length === 1
      && flagsShifted.flags[0] === false,
    'shiftFlags should remove first entry.'
  );
}
