import { assert } from './assert.ts';
import { MapDateKey } from './map-date-key.pmsg.ts';
import { ImmutableMap } from '../runtime/common/map/immutable.ts';
import { ImmutableDate } from '../runtime/common/time/date.ts';
import { ImmutableUrl } from '../runtime/common/web/url.ts';

export default function runMapDateKeyTests() {
  // Test Date as map key
  const date1 = new Date('2024-01-15T10:30:00Z');
  const date2 = new Date('2024-06-20T15:45:00Z');
  const dateMap = new Map<Date, number>([
    [date1, 100],
    [date2, 200],
  ]);

  // Test URL as map key
  const url1 = new URL('https://example.com/path1');
  const url2 = new URL('https://example.com/path2');
  const urlMap = new Map<URL, string>([
    [url1, 'first'],
    [url2, 'second'],
  ]);

  const instance = new MapDateKey({
    dateValues: dateMap,
    urlValues: urlMap,
  });

  // Test cerealize returns the data
  const cereal = instance.cerealize();
  assert(cereal.dateValues instanceof ImmutableMap, 'dateValues should be ImmutableMap');
  assert(cereal.urlValues instanceof ImmutableMap, 'urlValues should be ImmutableMap');

  // Test serialization
  const serialized = instance.serialize();
  assert(serialized.startsWith(':'), 'Serialized string should start with ":"');
  assert(serialized.includes('D"'), 'Serialized string should contain Date prefix');
  assert(serialized.includes('U"'), 'Serialized string should contain URL prefix');

  // Test deserialization
  const deserialized = MapDateKey.deserialize(serialized);
  const deserializedData = deserialized.cerealize();

  // Verify Date keys are properly deserialized
  const dateKeys = [...deserializedData.dateValues.keys()];
  assert(dateKeys.length === 2, 'Should have 2 date keys');
  assert(
    dateKeys.some(k => k instanceof Date || k instanceof ImmutableDate),
    'Date keys should be Date or ImmutableDate instances'
  );

  // Verify URL keys are properly deserialized
  const urlKeys = [...deserializedData.urlValues.keys()];
  assert(urlKeys.length === 2, 'Should have 2 URL keys');
  assert(
    urlKeys.some(k => k instanceof URL || k instanceof ImmutableUrl),
    'URL keys should be URL or ImmutableUrl instances'
  );

  // Test equality after round-trip
  assert(instance.equals(deserialized), 'Deserialized instance should equal original');

  // Test optional Date map
  const instanceWithOptional = new MapDateKey({
    dateValues: dateMap,
    urlValues: urlMap,
    optionalDateMap: new Map([[date1, true]]),
  });
  const optionalCereal = instanceWithOptional.cerealize();
  assert(optionalCereal.optionalDateMap !== undefined, 'Optional date map should be defined');
  assert(optionalCereal.optionalDateMap.size === 1, 'Optional date map should have 1 entry');

  // Test setters
  const newDate = new Date('2025-01-01T00:00:00Z');
  const updated = instance.setDateValuesEntry(newDate, 300);
  assert(updated.dateValues.size === 3, 'setDateValuesEntry should add new entry');
  assert(instance.dateValues.size === 2, 'Original should not be mutated');

  const newUrl = new URL('https://example.com/path3');
  const updatedUrl = instance.setUrlValuesEntry(newUrl, 'third');
  assert(updatedUrl.urlValues.size === 3, 'setUrlValuesEntry should add new entry');

  // Test ImmutableMap with Date keys
  const immutableDateMap = new ImmutableMap<Date, number>([
    [date1, 10],
    [date2, 20],
  ]);
  assert(immutableDateMap.size === 2, 'ImmutableMap with Date keys should have correct size');

  // Test ImmutableMap with URL keys
  const immutableUrlMap = new ImmutableMap<URL, string>([
    [url1, 'a'],
    [url2, 'b'],
  ]);
  assert(immutableUrlMap.size === 2, 'ImmutableMap with URL keys should have correct size');
}
