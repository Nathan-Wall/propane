import { assert, isMapValue } from './assert.js';
import { computeExpectedHashCode } from './hash-helpers.js';
import { MapMessage, MapMessage_Extras_Value, MapMessage_Metadata_Value } from './map.pmsg.js';
import { ImmutableMap } from '../runtime/common/map/immutable.js';
import { test } from 'node:test';

export default function runMapPropaneTests() {

  const labelEntries: [string | number, number][] = [
    ['one', 1],
    [2, 4],
  ];
  const labels = new Map<string | number, number>(labelEntries);
  const metadata = new Map<string, MapMessage_Metadata_Value.Value>([['owner', { value: 'Alice' }]]);
  const extras = new Map<string, MapMessage_Extras_Value.Value>([
    ['alpha', { note: 'A' as string | null }],
    ['beta', { note: null }],
  ]);

  const mapInstance: MapMessage = new MapMessage({
    labels,
    // Cast needed because generated types expect class instances, not Value type
    metadata: metadata as Map<string, MapMessage_Metadata_Value>,
    extras: extras as Map<string, MapMessage_Extras_Value>,
  });
  assert(
    mapInstance.serialize() === ':{M[["one",1],[2,4]],M[[owner,{value:Alice}]],M[[alpha,{note:"A"}],[beta,{note:null}]]}',
    'Map serialization incorrect.'
  );
  assert(isMapValue(mapInstance.labels), 'Labels should stay Map.');
  assert(mapInstance.labels.get('one') === 1, 'Labels map lost string key.');
  assert(mapInstance.labels.get(2) === 4, 'Labels map lost numeric key.');
  assert(isMapValue(mapInstance.metadata), 'Metadata should stay Map.');
  assert(mapInstance.metadata!.get('owner')!.value === 'Alice', 'Metadata map lost data.');
  const mapExtrasEntries = [...mapInstance.extras.entries()];
  assert(mapExtrasEntries[0]![0] === 'alpha', 'Extras map lost string key.');
  assert(mapExtrasEntries[0]![1].note === 'A', 'Extras map lost string value.');
  assert(mapExtrasEntries[1]![1].note === null, 'Extras map lost null value.');
  assert(typeof mapInstance.labels.toMap === 'function', 'Immutable map should expose toMap.');
  const labelsCopy = mapInstance.labels.toMap();
  labelsCopy.set('delta', 8);
  assert(!mapInstance.labels.has('delta'), 'Immutable map should not change when copy mutates.');
  const updatedLabelEntries: [string | number, number][] = [
    ['gamma', 7],
    [3, 9],
  ];
  const updatedLabelsInstance = mapInstance.setLabels(
    new Map<string | number, number>(updatedLabelEntries)
  );
  assert(mapInstance.labels.has('one'), 'setLabels should not mutate original instance.');
  assert(updatedLabelsInstance.labels.has('gamma'), 'setLabels result missing new key.');
  const clearedMetadata = mapInstance.setMetadata(undefined);
  assert(clearedMetadata.metadata === undefined, 'setMetadata should allow undefined.');
  assert(mapInstance.metadata!.get('owner')!.value === 'Alice', 'setMetadata should not mutate original metadata.');

  const mapRaw = MapMessage.deserialize(':{[[alpha,10],[5,15]],3:[[raw,{"note":null}]]}');
  assert(mapRaw.labels.get('alpha') === 10, 'Raw map lost string key.');
  assert(mapRaw.labels.get(5) === 15, 'Raw map lost numeric key.');
  assert(mapRaw.metadata === undefined, 'Raw map optional metadata should be undefined.');
  const rawExtrasEntries = [...mapRaw.extras.entries()];
  assert(rawExtrasEntries[0]![0] === 'raw', 'Raw map lost string key.');
  assert(rawExtrasEntries[0]![1].note === null, 'Raw map lost null value.');

  const mapObjectRaw = MapMessage.deserialize(
    ':{"1":[["owner",1]],"2":[["meta",{"value":"Bob"}]],"3":[["obj",{"note":"Value"}]]}'
  );
  assert(isMapValue(mapObjectRaw.metadata), 'Object raw metadata should be Map.');
  assert(mapObjectRaw.metadata!.get('meta')!.value === 'Bob', 'Object raw metadata missing value.');
  const objectExtrasEntries = [...mapObjectRaw.extras.entries()];
  assert(objectExtrasEntries[0]![0] === 'obj', 'Object raw extras lost key.');
  assert(objectExtrasEntries[0]![1].note === 'Value', 'Object raw extras lost value.');

  const addedLabelInstance = mapInstance.setLabel('delta', 8);
  assert(!mapInstance.labels.has('delta'), 'setLabel should not mutate original labels.');
  assert(addedLabelInstance.labels.get('delta') === 8, 'setLabel should insert new key.');

  const removedLabelInstance = mapInstance.deleteLabel('one');
  assert(mapInstance.labels.has('one'), 'deleteLabel should not mutate original labels.');
  assert(!removedLabelInstance.labels.has('one'), 'deleteLabel should remove specified key.');

  const clearedExtrasInstance = mapInstance.clearExtras();
  assert(clearedExtrasInstance.extras.size === 0, 'clearExtras should remove all entries.');

  const mergedLabelsInstance = mapInstance.mergeLabels([
    ['epsilon', 5],
    ['zeta', 6],
  ]);
  assert(mergedLabelsInstance.labels.get('epsilon') === 5, 'mergeLabels should merge array input.');
  const mergedLabelsMap = mapInstance.mergeLabels(new Map([['theta', 9]]));
  assert(mergedLabelsMap.labels.get('theta') === 9, 'mergeLabels should merge Map input.');

  const updatedExtrasInstance = mapInstance.updateExtra('alpha', (entry: MapMessage_Extras_Value | undefined) => new MapMessage_Extras_Value({
    note: entry?.note ? `${entry.note}!` : 'A!',
  }));
  assert(
    updatedExtrasInstance.extras.get('alpha')?.note === 'A!',
    'updateExtra should apply updater to existing entry.'
  );

  const mappedLabelsInstance = mapInstance.mapLabels(
    (value: number, key: string | number) => [
      typeof key === 'number' ? `num-${key}` : key,
      value * 10,
    ]
  );
  assert(
    mappedLabelsInstance.labels.get('num-2') === 40,
    'mapLabels should remap keys and values.'
  );

  const filteredLabelsInstance = mapInstance.filterLabels(
    (_: number, key: string | number) => typeof key === 'string'
  );
  assert(filteredLabelsInstance.labels.has('one'), 'filterLabels should retain matching entries.');
  assert(!filteredLabelsInstance.labels.has(2), 'filterLabels should remove entries that fail predicate.');

  const emptyMetadataInstance = new MapMessage({
    labels,
    extras: extras as Map<string, MapMessage_Extras_Value>,
  });
  // For uncountable words like "metadata", use mergeMetadataEntries since set{singular} conflicts with the collection setter
  const metadataSet = emptyMetadataInstance.mergeMetadataEntries([['owner', { value: 'Bob' } as MapMessage_Metadata_Value]]);
  assert(
    metadataSet.metadata && metadataSet.metadata.get('owner')?.value === 'Bob',
    'mergeMetadataEntries should initialize optional map.'
  );

  const immutable = new ImmutableMap([
    ['alpha', 1],
    ['beta', 2],
  ]);
  assert(immutable.size === 2, 'ImmutableMap size incorrect.');
  assert(immutable.get('alpha') === 1, 'ImmutableMap get failed.');
  assert(immutable.has('beta'), 'ImmutableMap has failed.');
  assert(
    JSON.stringify([...immutable.entries()]) === JSON.stringify([['alpha', 1], ['beta', 2]]),
    'ImmutableMap entries incorrect.'
  );

  const seen = [];
  for (const [key, value] of immutable) {
    seen.push([key, value]);
  }
  assert(seen.length === 2, 'ImmutableMap forEach did not visit entries.');

  const plainMap = immutable.toMap();
  plainMap.set('gamma', 3);
  assert(!immutable.has('gamma'), 'ImmutableMap should remain immutable after toMap.');

  const cloned = new ImmutableMap(plainMap);
  assert(cloned.has('gamma'), 'ImmutableMap should accept Map constructor input.');

  const equalsPeer = new ImmutableMap([
    ['alpha', 1],
    ['beta', 2],
  ]);
  assert(immutable.equals(equalsPeer), 'ImmutableMap equals should match identical entries.');
  const equalsMap = new Map(equalsPeer);
  assert(immutable.equals(equalsMap), 'ImmutableMap equals should handle plain Map inputs.');
  const changedSource = equalsPeer.toMap();
  changedSource.set('delta', 4);
  const changedPeer = new ImmutableMap(changedSource);
  assert(!immutable.equals(changedPeer), 'ImmutableMap equals should detect differences.');
  assert(!immutable.equals(null), 'ImmutableMap equals should return false for null input.');

  // Message keys should be compared with equals/hashCode, not identity.
  const msgKeyA = new MapMessage({
    labels: new Map([['alpha', 1]]),
    extras: new Map([['note', { note: null }]]) as Map<string, MapMessage_Extras_Value>,
  });
  const msgKeyB = new MapMessage({
    labels: new Map([['alpha', 1]]),
    extras: new Map([['note', { note: null }]]) as Map<string, MapMessage_Extras_Value>,
    metadata: undefined,
  });
  const msgMap = new ImmutableMap([
    [msgKeyA, 'value-a'],
    [msgKeyB, 'value-b'],
  ]);
  assert(msgMap.size === 1, 'ImmutableMap should coalesce equal Message keys.');
  assert(msgMap.has(msgKeyB), 'ImmutableMap should find equal Message keys.');
  assert(msgMap.get(msgKeyA) === 'value-b', 'ImmutableMap should use last entry for equal Message keys.');

  // Hashing should treat surrogate pairs as two code units (legacy charCodeAt behavior)
  const emojiKey = 'test😀';
  const emojiEntryHash = computeExpectedHashCode(`k:str:${emojiKey}|v:num:1`);
  const emojiMap = new ImmutableMap([[emojiKey, 1]]);
  assert(
    emojiMap.hashCode() === emojiEntryHash,
    'ImmutableMap hashCode should hash surrogate pairs by UTF-16 code unit.'
  );
}

test('runMapPropaneTests', () => {
  runMapPropaneTests();
});
