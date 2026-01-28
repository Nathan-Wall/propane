import { assert, assertThrows } from './assert.js';
import { UrlUnion, UrlUnion_Value_Union1 } from './url-union.pmsg.js';
import { ImmutableUrl } from '../runtime/common/web/url.js';
import { test } from 'node:test';

export default function runUrlUnionTests() {
  const url = new URL('https://example.com/path?x=1');

  assertThrows(
    () => new UrlUnion({ value: url }),
    'URL union should reject raw URL when multiple message types exist.'
  );

  const direct = new UrlUnion({ value: new ImmutableUrl(url) });
  const directSerialized = direct.serialize();
  const expectedDirect = `:{value:U"${url.toString()}"}`;
  assert(
    directSerialized === expectedDirect,
    `URL union branch should serialize with U"...". Got: ${directSerialized}`
  );

  const wrapped = new UrlUnion({ value: new UrlUnion_Value_Union1({ url }) });
  const wrappedSerialized = wrapped.serialize();
  const expectedWrapped = `:{value:$UrlUnion_Value_Union1{url:U"${url.toString()}"}}`;
  assert(
    wrappedSerialized === expectedWrapped,
    `URL union message branch should be tagged. Got: ${wrappedSerialized}`
  );

  const roundTrip = UrlUnion.deserialize(directSerialized);
  assert(
    roundTrip.value instanceof URL || roundTrip.value instanceof ImmutableUrl,
    'Union URL branch should deserialize to URL/ImmutableUrl.'
  );

  const wrappedRoundTrip = UrlUnion.deserialize(wrappedSerialized);
  assert(
    wrappedRoundTrip.value instanceof UrlUnion_Value_Union1,
    'Union message branch should deserialize to UrlUnion_Value_Union1.'
  );
}

test('runUrlUnionTests', () => {
  runUrlUnionTests();
});
