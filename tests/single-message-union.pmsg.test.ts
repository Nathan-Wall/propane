import { assert } from './assert.js';
import { SingleMessageUnion } from './single-message-union.pmsg.js';
import { ImmutableDate } from '../runtime/common/time/date.js';
import { ImmutableUrl } from '../runtime/common/web/url.js';
import { test } from 'node:test';

export default function runSingleMessageUnionTests() {
  const date = new Date('2020-01-01T00:00:00.000Z');
  const url = new URL('https://example.com/path?x=1');

  const direct = new SingleMessageUnion({
    dateOrString: date,
    urlOrNumber: url,
  });

  assert(
    direct.dateOrString instanceof Date || direct.dateOrString instanceof ImmutableDate,
    'dateOrString should accept raw Date when only one message type exists in union.'
  );
  assert(
    direct.urlOrNumber instanceof URL || direct.urlOrNumber instanceof ImmutableUrl,
    'urlOrNumber should accept raw URL when only one message type exists in union.'
  );

  const serialized = direct.serialize();
  assert(
    serialized.includes('D"') && serialized.includes('U"'),
    `serialization should include compact tags for Date/URL. Got: ${serialized}`
  );

  const primitive = new SingleMessageUnion({
    dateOrString: 'ok',
    urlOrNumber: 42,
  });
  const primitiveSerialized = primitive.serialize();
  const roundTrip = SingleMessageUnion.deserialize(primitiveSerialized);
  assert(roundTrip.dateOrString === 'ok', 'string branch should round-trip');
  assert(roundTrip.urlOrNumber === 42, 'number branch should round-trip');
}

test('runSingleMessageUnionTests', () => {
  runSingleMessageUnionTests();
});
