import { assert } from './assert.ts';
import { User } from './tmp/user.propane.js';
import { Indexed } from './tmp/indexed.propane.js';
import { Compound } from './tmp/compound.propane.js';

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

export default function runCompoundTests() {
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
  const compoundFromData = new Compound({
    user: simpleUser,
    indexed: simpleIndexed,
  });
  assert(compoundFromData.user instanceof User, 'Compound ctor should hydrate user data.');
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
    user: new User(simpleUser),
    indexed: new Indexed(simpleIndexed),
  });
  assert(compoundFromMessages.user instanceof User, 'Compound should accept user instances.');
}
