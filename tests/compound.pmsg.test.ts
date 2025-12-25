import { assert } from './assert.js';
import { User } from './user.pmsg.js';
import { Indexed } from './indexed.pmsg.js';
import { Compound } from './compound.pmsg.js';
import { test } from 'node:test';

export default function runCompoundTests() {
  // Cast needed: User.Data has branded types (Email, Hash) but plain strings work at runtime
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
  } as User.Data;
  const simpleIndexed: Indexed.Data = {
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

test('runCompoundTests', () => {
  runCompoundTests();
});
