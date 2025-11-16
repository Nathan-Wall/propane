export default function runCompoundTests(ctx) {
  const { assert, loadFixtureClass } = ctx;

  const UserMessage = loadFixtureClass('tests/user.propane', 'User');
  const Compound = loadFixtureClass('tests/compound.propane', 'Compound');
  const Indexed = loadFixtureClass('tests/indexed.propane', 'Indexed');

  const simpleUser = {
    id: 99,
    name: 'CompoundUser',
    email: 'compound@example.com',
    passwordHash: 'hash',
    created: new Date('2020-01-01T00:00:00.000Z'),
    updated: new Date('2020-01-02T00:00:00.000Z'),
    active: true,
    eyeColor: 'blue',
    height: { unit: 'm', value: 1.8 },
  };
  const simpleIndexed = {
    id: 88,
    name: 'CompoundIndexed',
    age: 35,
    active: true,
    nickname: 'CI',
    score: 12,
    alias: 'Alias',
    status: 'READY',
  };
  const compoundFromData = new Compound({
    user: simpleUser,
    indexed: simpleIndexed,
  });
  assert(compoundFromData.user instanceof UserMessage, 'Compound ctor should hydrate user data.');
  assert(compoundFromData.indexed.name === 'CompoundIndexed', 'Compound ctor should keep indexed data.');
  const updatedCompound = compoundFromData.setUser({
    ...simpleUser,
    name: 'Updated User',
  });
  assert(updatedCompound.user.name === 'Updated User', 'Compound setter should accept user data.');
  const updatedIndexed = compoundFromData.setIndexed({
    ...simpleIndexed,
    name: 'Updated Indexed',
  });
  assert(updatedIndexed.indexed.name === 'Updated Indexed', 'Compound setter should accept indexed data.');
  const compoundFromMessages = new Compound({
    user: new UserMessage(simpleUser),
    indexed: new Indexed(simpleIndexed),
  });
  assert(compoundFromMessages.user instanceof UserMessage, 'Compound should accept user instances.');
}
