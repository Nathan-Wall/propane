import { assert } from './assert.ts';
import { User } from './user.propane.ts';
import { Indexed } from './indexed.propane.ts';
import { Compound } from './compound.propane.ts';

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
    inline: { value: 'Inline Data' },
  });
  assert(compoundFromData.user instanceof User, 'Compound ctor should hydrate user data.');
  assert(compoundFromData.indexed.name === 'CompoundIndexed', 'Compound ctor should keep indexed data.');
  assert(typeof compoundFromData.inline.serialize === 'function', 'Compound inline should hydrate anonymous type into a message.');
  assert(compoundFromData.inline instanceof Compound.Inline, 'Compound inline should be exposed as Compound.Inline.');
  assert(compoundFromData.inline.value === 'Inline Data', 'Compound inline should preserve inline data.');
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
  const updatedIndexedInstance = compoundFromData.setIndexed(
    new Indexed({ ...simpleIndexed, name: 'Indexed Instance' })
  );
  assert(
    updatedIndexedInstance.indexed.name === 'Indexed Instance',
    'Compound setter should accept indexed message instances.'
  );
  const compoundFromMessages = new Compound({
    user: new User(simpleUser),
    indexed: new Indexed(simpleIndexed),
    inline: { value: 'Inline From Messages' },
  });
  assert(compoundFromMessages.user instanceof User, 'Compound should accept user instances.');
  const updatedInline = compoundFromData.setInline({ value: 'Updated Inline' });
  assert(typeof updatedInline.inline.serialize === 'function', 'Compound setInline should wrap plain data into a message.');
  assert(updatedInline.inline instanceof Compound.Inline, 'Compound setInline result should expose inline message class via namespace.');
  assert(updatedInline.inline.value === 'Updated Inline', 'Compound setInline should accept plain inline data.');
}
