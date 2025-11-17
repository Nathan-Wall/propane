import type { TestContext } from './test-harness.ts';
import type {
  PropaneMessageConstructor,
  PropaneMessageInstance,
} from './propane-test-types.ts';

type UnionValue = string | boolean;

interface UnionStringBoolProps {
  value: UnionValue;
  optional?: UnionValue;
}

interface UnionStringBoolInstance
  extends UnionStringBoolProps,
    PropaneMessageInstance<UnionStringBoolProps> {}

type UnionStringBoolConstructor = PropaneMessageConstructor<
  UnionStringBoolProps,
  UnionStringBoolInstance
>;

export default function runUnionStringBoolTests(ctx: TestContext) {
  const assert: TestContext['assert'] = (condition, message) => {
    ctx.assert(condition, message);
  };
  const loadFixtureClass: TestContext['loadFixtureClass'] = (fixture, exportName) => {
    return ctx.loadFixtureClass(fixture, exportName);
  };

  const UnionStringBool = loadFixtureClass<UnionStringBoolConstructor>(
    'tests/union-string-bool.propane',
    'UnionStringBool'
  );

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
