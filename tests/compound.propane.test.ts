import type { TestContext } from './test-harness.ts';
import type {
  PropaneMessageConstructor,
  PropaneMessageInstance,
} from './propane-test-types.ts';

type DistanceUnit = 'm' | 'ft';

interface Distance {
  unit: DistanceUnit;
  value: number;
}

interface UserProps {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  created: Date;
  updated: Date;
  active: boolean;
  eyeColor: 'blue' | 'green' | 'brown' | 'hazel';
  height: Distance;
}

interface IndexedProps {
  id: number;
  name: string;
  age: number;
  active: boolean;
  nickname?: string;
  score: number | null;
  alias?: string | null;
  status: string;
}

interface UserMessageInstance extends UserProps, PropaneMessageInstance<UserProps> {}
type UserMessageCtor = PropaneMessageConstructor<UserProps, UserMessageInstance>;

interface IndexedMessageInstance
  extends IndexedProps,
    PropaneMessageInstance<IndexedProps> {}
type IndexedMessageCtor = PropaneMessageConstructor<IndexedProps, IndexedMessageInstance>;

interface CompoundProps {
  user: UserProps | UserMessageInstance;
  indexed: IndexedProps | IndexedMessageInstance;
}

interface CompoundInstance extends PropaneMessageInstance<CompoundProps> {
  user: UserMessageInstance;
  indexed: IndexedMessageInstance;
  setUser(user: CompoundProps['user']): CompoundInstance;
  setIndexed(indexed: CompoundProps['indexed']): CompoundInstance;
}

type CompoundCtor = PropaneMessageConstructor<CompoundProps, CompoundInstance>;

export default function runCompoundTests(ctx: TestContext) {
  const assert: TestContext['assert'] = (condition, message) => {
    ctx.assert(condition, message);
  };
  const loadFixtureClass: TestContext['loadFixtureClass'] = (fixture, exportName) => {
    return ctx.loadFixtureClass(fixture, exportName);
  };

  const UserMessage = loadFixtureClass<UserMessageCtor>('tests/user.propane', 'User');
  const Compound = loadFixtureClass<CompoundCtor>('tests/compound.propane', 'Compound');
  const Indexed = loadFixtureClass<IndexedMessageCtor>('tests/indexed.propane', 'Indexed');

  const simpleUser: UserProps = {
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
  const simpleIndexed: IndexedProps = {
    id: 88,
    name: 'CompoundIndexed',
    age: 35,
    active: true,
    nickname: 'CI',
    score: 12,
    alias: 'Alias',
    status: 'READY',
  };
  const compoundFromData: CompoundInstance = new Compound({
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
