import type { TestContext } from './test-harness.ts';
import type {
  PropaneMessageConstructor,
  PropaneMessageInstance,
} from './propane-test-types.ts';

interface OptionalHoleProps {
  id: number;
  created: Date;
  note?: string;
  name: string;
}

type OptionalHoleInstance = PropaneMessageInstance<OptionalHoleProps>;

type OptionalHoleConstructor = PropaneMessageConstructor<
  OptionalHoleProps,
  OptionalHoleInstance
>;

export default function runOptionalHoleTests(ctx: TestContext) {
  const assert: TestContext['assert'] = (condition, message) => {
    ctx.assert(condition, message);
  };
  const loadFixtureClass: TestContext['loadFixtureClass'] = (fixture, exportName) => {
    return ctx.loadFixtureClass(fixture, exportName);
  };

  const OptionalHole = loadFixtureClass<OptionalHoleConstructor>(
    'tests/index-optional-hole.propane',
    'OptionalHole'
  );

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
  const optionalHoleCereal = optionalHole.cerealize();
  assert(optionalHoleCereal.note === undefined, 'Optional undefined should stay omitted.');

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
  const optionalHoleHydrated = OptionalHole.deserialize(optionalHoleSerialized);
  assert(optionalHoleHydrated.cerealize().name === 'Optional', 'Optional hole deserialize failed.');
  const optionalHoleWithNoteHydrated = OptionalHole.deserialize(optionalHoleWithNoteSerialized);
  const optionalHoleWithNoteCereal = optionalHoleWithNoteHydrated.cerealize();
  assert(optionalHoleWithNoteCereal.note === 'HELLO', 'Optional field lost during serialization.');
}
