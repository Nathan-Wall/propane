import type { TestContext } from './test-harness.ts';

export default function runUnionStringBoolTests(ctx: TestContext) {
  const assert: TestContext['assert'] = ctx.assert;
  const loadFixtureClass = ctx.loadFixtureClass;

  const UnionStringBool = loadFixtureClass(
    'tests/union-string-bool.propane',
    'UnionStringBool'
  );

  const unionStringInstance = new UnionStringBool({
    value: 'true',
    optional: '42',
  });
  assert(
    unionStringInstance.serialize() === ':[\"true\",\"42\"]',
    'String union serialization failed.'
  );

  const unionBoolInstance = new UnionStringBool({
    value: true,
    optional: false,
  });
  assert(
    unionBoolInstance.serialize() === ':[true,false]',
    'Boolean union serialization failed.'
  );

  const unionStringRaw = UnionStringBool.deserialize(':[\"true\",false]');
  const unionStringRawData = unionStringRaw.cerealize();
  assert(unionStringRawData.value === 'true', 'Union string raw lost string value.');
  assert(unionStringRawData.optional === false, 'Union string raw lost optional boolean.');

  const unionBoolRaw = UnionStringBool.deserialize(':[true,\"false\"]');
  const unionBoolRawData = unionBoolRaw.cerealize();
  assert(unionBoolRawData.value === true, 'Union bool raw lost boolean value.');
  assert(unionBoolRawData.optional === 'false', 'Union bool raw lost string optional.');
}
