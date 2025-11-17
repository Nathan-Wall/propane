import type { TestContext } from './test-harness.ts';
import type {
  PropaneMessageConstructor,
  PropaneMessageInstance,
} from './propane-test-types.ts';

type MapLabelKey = string | number;

interface MetadataValue {
  value: string;
}

interface ExtraValue {
  note: string | null;
}

interface ImmutableMapLike<K, V> extends ReadonlyMap<K, V> {
  toMap(): Map<K, V>;
  equals(other: unknown): boolean;
}

interface MapMessageHydratedProps {
  labels: ImmutableMapLike<MapLabelKey, number>;
  metadata?: ImmutableMapLike<string, MetadataValue>;
  extras: ImmutableMapLike<string, ExtraValue>;
}

interface MapMessageInputProps {
  labels: ReadonlyMap<MapLabelKey, number>;
  metadata?: ReadonlyMap<string, MetadataValue>;
  extras: ReadonlyMap<string, ExtraValue>;
}

interface MapMessageInstance
  extends PropaneMessageInstance<MapMessageHydratedProps> {
  labels: MapMessageHydratedProps['labels'];
  metadata?: MapMessageHydratedProps['metadata'];
  extras: MapMessageHydratedProps['extras'];
  setLabels(value: ReadonlyMap<MapLabelKey, number>): MapMessageInstance;
  setMetadata(value: ReadonlyMap<string, MetadataValue> | undefined): MapMessageInstance;
  setLabelsEntry(key: MapLabelKey, value: number): MapMessageInstance;
  deleteLabelsEntry(key: MapLabelKey): MapMessageInstance;
  clearExtras(): MapMessageInstance;
  mergeLabelsEntries(
    entries: Iterable<[MapLabelKey, number]> | ReadonlyMap<MapLabelKey, number>
  ): MapMessageInstance;
  updateExtrasEntry(
    key: string,
    updater: (entry: ExtraValue | undefined) => ExtraValue
  ): MapMessageInstance;
  mapLabelsEntries(
    mapper: (value: number, key: MapLabelKey) => [MapLabelKey, number]
  ): MapMessageInstance;
  filterLabelsEntries(
    predicate: (value: number, key: MapLabelKey) => boolean
  ): MapMessageInstance;
  setMetadataEntry(key: string, value: MetadataValue): MapMessageInstance;
}

type MapMessageConstructor = PropaneMessageConstructor<
  MapMessageInputProps,
  MapMessageInstance,
  MapMessageHydratedProps
>;

export default function runMapPropaneTests(ctx: TestContext) {
  const assert: TestContext['assert'] = (condition, message) => {
    ctx.assert(condition, message);
  };
  const loadFixtureClass: TestContext['loadFixtureClass'] = (fixture, exportName) => {
    return ctx.loadFixtureClass(fixture, exportName);
  };
  const isMapValue = (value: unknown) => ctx.isMapValue(value);
  const { runtimeExports } = ctx;

  const MapMessage = loadFixtureClass<MapMessageConstructor>('tests/map.propane', 'MapMessage');

  const labelEntries: [string | number, number][] = [
    ['one', 1],
    [2, 4],
  ];
  const labels = new Map<string | number, number>(labelEntries);
  const metadata = new Map([['owner', { value: 'Alice' }]]);
  const extras = new Map([
    ['alpha', { note: 'A' }],
    ['beta', { note: null }],
  ]);

  const mapInstance: MapMessageInstance = new MapMessage({
    labels,
    metadata,
    extras,
  });
  assert(
    mapInstance.serialize() === ':{[[one,1],[2,4]],[[owner,{"value":"Alice"}]],[[alpha,{"note":"A"}],[beta,{"note":null}]]}',
    'Map serialization incorrect.'
  );
  const mapCereal = mapInstance.cerealize();
  assert(isMapValue(mapCereal.labels), 'Labels should stay Map.');
  assert(mapCereal.labels.get('one') === 1, 'Labels map lost string key.');
  assert(mapCereal.labels.get(2) === 4, 'Labels map lost numeric key.');
  assert(isMapValue(mapCereal.metadata), 'Metadata should stay Map.');
  assert(mapCereal.metadata.get('owner').value === 'Alice', 'Metadata map lost data.');
  const mapExtrasEntries = [...mapCereal.extras.entries()];
  assert(mapExtrasEntries[0][0] === 'alpha', 'Extras map lost string key.');
  assert(mapExtrasEntries[1][1].note === null, 'Extras map lost null value.');
  assert(typeof mapCereal.labels.toMap === 'function', 'Immutable map should expose toMap.');
  const labelsCopy = mapCereal.labels.toMap();
  labelsCopy.set('delta', 8);
  assert(!mapCereal.labels.has('delta'), 'Immutable map should not change when copy mutates.');
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
  assert(mapInstance.metadata.get('owner').value === 'Alice', 'setMetadata should not mutate original metadata.');

  const mapRaw = MapMessage.deserialize(':{[[alpha,10],[5,15]],3:[[raw,{"note":null}]]}');
  const mapRawData = mapRaw.cerealize();
  assert(mapRawData.labels.get('alpha') === 10, 'Raw map lost string key.');
  assert(mapRawData.labels.get(5) === 15, 'Raw map lost numeric key.');
  assert(mapRawData.metadata === undefined, 'Raw map optional metadata should be undefined.');
  const rawExtrasEntries = [...mapRawData.extras.entries()];
  assert(rawExtrasEntries[0][0] === 'raw', 'Raw map lost string key.');
  assert(rawExtrasEntries[0][1].note === null, 'Raw map lost null value.');

  const mapObjectRaw = MapMessage.deserialize(
    ':{"1":[["owner",1]],"2":[["meta",{"value":"Bob"}]],"3":[["obj",{"note":"Value"}]]}'
  );
  const mapObjectRawData = mapObjectRaw.cerealize();
  assert(isMapValue(mapObjectRawData.metadata), 'Object raw metadata should be Map.');
  assert(mapObjectRawData.metadata.get('meta').value === 'Bob', 'Object raw metadata missing value.');
  const objectExtrasEntries = [...mapObjectRawData.extras.entries()];
  assert(objectExtrasEntries[0][0] === 'obj', 'Object raw extras lost key.');
  assert(objectExtrasEntries[0][1].note === 'Value', 'Object raw extras lost value.');

  const addedLabelInstance = mapInstance.setLabelsEntry('delta', 8);
  assert(!mapInstance.labels.has('delta'), 'setLabelsEntry should not mutate original labels.');
  assert(addedLabelInstance.labels.get('delta') === 8, 'setLabelsEntry should insert new key.');

  const removedLabelInstance = mapInstance.deleteLabelsEntry('one');
  assert(mapInstance.labels.has('one'), 'deleteLabelsEntry should not mutate original labels.');
  assert(!removedLabelInstance.labels.has('one'), 'deleteLabelsEntry should remove specified key.');

  const clearedExtrasInstance = mapInstance.clearExtras();
  assert(clearedExtrasInstance.extras.size === 0, 'clearExtras should remove all entries.');

  const mergedLabelsInstance = mapInstance.mergeLabelsEntries([
    ['epsilon', 5],
    ['zeta', 6],
  ]);
  assert(mergedLabelsInstance.labels.get('epsilon') === 5, 'mergeLabelsEntries should merge array input.');
  const mergedLabelsMap = mapInstance.mergeLabelsEntries(new Map([['theta', 9]]));
  assert(mergedLabelsMap.labels.get('theta') === 9, 'mergeLabelsEntries should merge Map input.');

  const updatedExtrasInstance = mapInstance.updateExtrasEntry('alpha', (entry) => ({
    note: entry?.note ? `${entry.note}!` : 'A!',
  }));
  assert(
    updatedExtrasInstance.extras.get('alpha')?.note === 'A!',
    'updateExtrasEntry should apply updater to existing entry.'
  );

  const mappedLabelsInstance = mapInstance.mapLabelsEntries((value, key) => [
    typeof key === 'number' ? `num-${key}` : key,
    value * 10,
  ]);
  assert(
    mappedLabelsInstance.labels.get('num-2') === 40,
    'mapLabelsEntries should remap keys and values.'
  );

  const filteredLabelsInstance = mapInstance.filterLabelsEntries((_, key) =>
    typeof key === 'string'
  );
  assert(filteredLabelsInstance.labels.has('one'), 'filterLabelsEntries should retain matching entries.');
  assert(!filteredLabelsInstance.labels.has(2), 'filterLabelsEntries should remove entries that fail predicate.');

  const emptyMetadataInstance = new MapMessage({
    labels,
    extras,
    metadata: undefined,
  });
  const metadataSet = emptyMetadataInstance.setMetadataEntry('owner', { value: 'Bob' });
  assert(
    metadataSet.metadata && metadataSet.metadata.get('owner')?.value === 'Bob',
    'setMetadataEntry should initialize optional map.'
  );

  const ImmutableMapCtor = runtimeExports['ImmutableMap'] as new <
    K,
    V
  >(
    entries?: Iterable<readonly [K, V]>
  ) => ReadonlyMap<K, V> & {
    equals(other: unknown): boolean;
    toMap(): Map<K, V>;
  };
  assert(typeof ImmutableMapCtor === 'function', 'ImmutableMap should be exported.');

  const immutable = new ImmutableMapCtor([
    ['alpha', 1],
    ['beta', 2],
  ]);
  assert(immutable.size === 2, 'ImmutableMap size incorrect.');
  assert(immutable.get('alpha') === 1, 'ImmutableMap get failed.');
  assert(immutable.has('beta'), 'ImmutableMap has failed.');
  assert(
    JSON.stringify(Array.from(immutable.entries())) === JSON.stringify([['alpha', 1], ['beta', 2]]),
    'ImmutableMap entries incorrect.'
  );

  const seen = [];
  immutable.forEach((value: number, key: string) => {
    seen.push([key, value]);
  });
  assert(seen.length === 2, 'ImmutableMap forEach did not visit entries.');

  const mutableCheck = immutable as {
    set?: unknown;
    delete?: unknown;
    clear?: unknown;
  };
  assert(typeof mutableCheck.set === 'undefined', 'ImmutableMap should not expose set.');
  assert(typeof mutableCheck.delete === 'undefined', 'ImmutableMap should not expose delete.');
  assert(typeof mutableCheck.clear === 'undefined', 'ImmutableMap should not expose clear.');

  const plainMap = immutable.toMap();
  plainMap.set('gamma', 3);
  assert(!immutable.has('gamma'), 'ImmutableMap should remain immutable after toMap.');

  const cloned = new ImmutableMapCtor(plainMap);
  assert(cloned.has('gamma'), 'ImmutableMap should accept Map constructor input.');

  const equalsPeer = new ImmutableMapCtor([
    ['alpha', 1],
    ['beta', 2],
  ]);
  assert(immutable.equals(equalsPeer), 'ImmutableMap equals should match identical entries.');
  const equalsMap = new Map(equalsPeer);
  assert(immutable.equals(equalsMap), 'ImmutableMap equals should handle plain Map inputs.');
  const changedSource = equalsPeer.toMap();
  changedSource.set('delta', 4);
  const changedPeer = new ImmutableMapCtor(changedSource);
  assert(!immutable.equals(changedPeer), 'ImmutableMap equals should detect differences.');
  assert(!immutable.equals(null), 'ImmutableMap equals should return false for null input.');
}
