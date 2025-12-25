import { assert } from './assert.js';
import { OptionalHole } from './index-optional-hole.pmsg.js';
import { test } from 'node:test';

export default function runOptionalHoleTests() {

  const optionalHole = new OptionalHole({
    id: 7,
    created: new Date(Date.UTC(1892, 0, 3)),
    name: 'Optional',
  });
  const optionalHoleSerialized = optionalHole.serialize();
  const expectedOptionalSerialization = ':{7,D"1892-01-03T00:00:00.000Z",4:Optional}';
  assert(
    optionalHoleSerialized === expectedOptionalSerialization,
    'Optional field omission should force explicit index on next property.'
  );
  assert(optionalHole.note === undefined, 'Optional undefined should stay omitted.');

  const optionalHoleWithNote = new OptionalHole({
    id: 9,
    created: new Date(Date.UTC(1892, 0, 3)),
    name: 'Optional',
    note: 'HELLO',
  });
  const optionalHoleWithNoteSerialized = optionalHoleWithNote.serialize();
  const expectedOptionalWithNote = ':{9,D"1892-01-03T00:00:00.000Z",HELLO,Optional}';
  assert(
    optionalHoleWithNoteSerialized === expectedOptionalWithNote,
    'Present optional field should include its index and keep later implicit.'
  );
  const optionalHoleDeleted = optionalHoleWithNote.unsetNote();
  const expectedOptionalDeleted = ':{9,D"1892-01-03T00:00:00.000Z",4:Optional}';
  assert(
    optionalHoleDeleted.serialize() === expectedOptionalDeleted,
    'unsetNote should clear optional field and reintroduce index gap.'
  );
  const optionalHoleHydrated = OptionalHole.deserialize(optionalHoleSerialized);
  assert(optionalHoleHydrated.name === 'Optional', 'Optional hole deserialize failed.');
  const optionalHoleWithNoteHydrated = OptionalHole.deserialize(
    optionalHoleWithNoteSerialized
  );
  assert(optionalHoleWithNoteHydrated.note === 'HELLO', 'Optional field lost during serialization.');
}

test('runOptionalHoleTests', () => {
  runOptionalHoleTests();
});
