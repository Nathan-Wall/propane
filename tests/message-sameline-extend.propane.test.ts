import { describe, it } from 'node:test';
import assert from 'node:assert';
import { SameLineExtend } from './message-sameline-extend.ext.js';

describe('@message @extend same-line syntax', () => {
  it('works with decorators on same line', () => {
    const person = new SameLineExtend({ firstName: 'John', lastName: 'Doe' });
    assert.strictEqual(person.fullName, 'John Doe');
    assert.strictEqual(person.firstName, 'John');
    assert.strictEqual(person.lastName, 'Doe');
    assert.ok(typeof person.serialize === 'function');
  });
});
