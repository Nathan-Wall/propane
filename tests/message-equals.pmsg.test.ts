import { assert } from './assert.js';
import { User } from './user.pmsg.js';
import { Indexed } from './indexed.pmsg.js';
import { test } from 'node:test';

export default function runMessageEqualsTests() {
  // Cast needed: User.Value has branded types (Email, Hash)
  const userProps = {
    id: 1,
    name: 'Alice',
    email: 'alice@example.com',
    passwordHash: 'hash',
    created: new Date('2020-01-01T00:00:00.000Z'),
    updated: new Date('2020-01-02T00:00:00.000Z'),
    active: true,
    eyeColor: 'green' as const,
    height: { unit: 'm' as const, value: 1.6 },
  } as User.Value;

  const userA = new User(userProps);
  const userB = new User({ ...userProps } as User.Value);
  const userC = new User({ ...userProps, name: 'Bob' } as User.Value);

  assert(userA.equals(userA), 'equals should be reflexive.');
  assert(userA.equals(userB), 'equals should match same type and data.');
  assert(!userA.equals(userC), 'equals should detect differing field values.');

  const indexed = new Indexed({
    id: 1,
    name: 'Alice',
    age: 30,
    active: true,
    score: null,
    status: 'OK',
  });

  assert(!userA.equals(indexed), 'equals should fail for different message types.');
  assert(!userA.equals({ serialize: () => userA.serialize() }), 'equals should require Message instances.');
  assert(!userA.equals(null), 'equals should return false for null.');
}

test('runMessageEqualsTests', () => {
  runMessageEqualsTests();
});
