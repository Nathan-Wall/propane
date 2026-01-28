import { assert } from './assert.js';
import { MapDateKey } from './map-date-key.pmsg.js';
import { ImmutableMap } from '../runtime/common/map/immutable.js';
import { ImmutableDate, ImmutableUrl } from '@propane/runtime';
import { test } from 'node:test';

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

  // Test property access returns ImmutableMap
  assert(instance.dateValues instanceof ImmutableMap, 'dateValues should be ImmutableMap');
  assert(instance.urlValues instanceof ImmutableMap, 'urlValues should be ImmutableMap');

  // Test serialization
  const serialized = instance.serialize();
  assert(serialized.startsWith(':'), 'Serialized string should start with ":"');
  assert(serialized.includes('D"'), 'Serialized string should contain Date prefix');
  assert(serialized.includes('U"'), 'Serialized string should contain URL prefix');

  // Test deserialization
  const deserialized = MapDateKey.deserialize(serialized);

  // Verify Date keys are properly deserialized
  const dateKeys = [...deserialized.dateValues.keys()];
  assert(dateKeys.length === 2, 'Should have 2 date keys');
  assert(
    dateKeys.some(k => k instanceof Date || k instanceof ImmutableDate),
    'Date keys should be Date or ImmutableDate instances'
  );

  // Verify URL keys are properly deserialized
  const urlKeys = [...deserialized.urlValues.keys()];
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
  assert(instanceWithOptional.optionalDateMap !== undefined, 'Optional date map should be defined');
  assert(instanceWithOptional.optionalDateMap!.size === 1, 'Optional date map should have 1 entry');

  // Test setters
  const newDate = new Date('2025-01-01T00:00:00Z');
  const updated = instance.setDateValue(newDate, 300);
  assert(updated.dateValues.size === 3, 'setDateValue should add new entry');
  assert(instance.dateValues.size === 2, 'Original should not be mutated');

  const newUrl = new URL('https://example.com/path3');
  const updatedUrl = instance.setUrlValue(newUrl, 'third');
  assert(updatedUrl.urlValues.size === 3, 'setUrlValue should add new entry');

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

test('runMapDateKeyTests', () => {
  runMapDateKeyTests();
});
