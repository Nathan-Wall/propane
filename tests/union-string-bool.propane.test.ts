import { assert } from './assert.ts';
import { UnionStringBool } from './union-string-bool.propane.ts';

export default function runUnionStringBoolTests() {

  const unionStringInstance: UnionStringBoolInstance = new UnionStringBool({
    value: 'true',
    optional: '42',
  });
  const unionStringSerialized = unionStringInstance.serialize();
  assert(
    unionStringSerialized === ':{"true","42"}',
    `String union serialization failed. Got: ${unionStringSerialized}`
  );

  const unionBoolInstance: UnionStringBoolInstance = new UnionStringBool({
    value: true,
    optional: false,
  });
  const unionBoolSerialized = unionBoolInstance.serialize();
  assert(
    unionBoolSerialized === ':{true,false}',
    `Boolean union serialization failed. Got: ${unionBoolSerialized}`
  );

  const unionStringRaw = UnionStringBool.deserialize(':{"true",false}');
  const unionStringRawData = unionStringRaw.cerealize();
  assert(unionStringRawData.value === 'true', 'Union string raw lost string value.');
  assert(unionStringRawData.optional === false, 'Union string raw lost optional boolean.');

  const unionBoolRaw = UnionStringBool.deserialize(':{true,"false"}');
  const unionBoolRawData = unionBoolRaw.cerealize();
  assert(unionBoolRawData.value === true, 'Union bool raw lost boolean value.');
  assert(unionBoolRawData.optional === 'false', 'Union bool raw lost string optional.');
}
