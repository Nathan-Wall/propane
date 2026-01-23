import { assert } from './assert.js';
import { UnionStringBool } from './union-string-bool.pmsg.js';
import { test } from 'node:test';

export default function runUnionStringBoolTests() {

  const unionStringInstance: UnionStringBool = new UnionStringBool({
    value: 'true',
    optional: '42',
  });
  const unionStringSerialized = unionStringInstance.serialize();
  assert(
    unionStringSerialized === ':{"true","42"}',
    `String union serialization failed. Got: ${unionStringSerialized}`
  );

  const unionBoolInstance: UnionStringBool = new UnionStringBool({
    value: true,
    optional: false,
  });
  const unionBoolSerialized = unionBoolInstance.serialize();
  assert(
    unionBoolSerialized === ':{true,false}',
    `Boolean union serialization failed. Got: ${unionBoolSerialized}`
  );

  const unionSafeInstance: UnionStringBool = new UnionStringBool({
    value: 'Alpha',
    optional: 'Beta',
  });
  const unionSafeSerialized = unionSafeInstance.serialize();
  assert(
    unionSafeSerialized === ':{"Alpha","Beta"}',
    `Safe union string serialization failed. Got: ${unionSafeSerialized}`
  );

  const unionStringRaw = UnionStringBool.deserialize(':{"true",false}');
  assert(unionStringRaw.value === 'true', 'Union string raw lost string value.');
  assert(unionStringRaw.optional === false, 'Union string raw lost optional boolean.');

  const unionBoolRaw = UnionStringBool.deserialize(':{true,"false"}');
  assert(unionBoolRaw.value === true, 'Union bool raw lost boolean value.');
  assert(unionBoolRaw.optional === 'false', 'Union bool raw lost string optional.');
}

test('runUnionStringBoolTests', () => {
  runUnionStringBoolTests();
});
