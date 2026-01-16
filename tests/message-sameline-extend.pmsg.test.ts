import { describe, it } from 'node:test';
import assert from 'node:assert';
// Import from the generated .pmsg.js re-export to get the extended class.
import { SameLineExtend } from './message-sameline-extend.pmsg.js';

describe('Message<{...}> with @extend decorator', () => {
  it('works with Message wrapper and @extend decorator', () => {
    const person = new SameLineExtend({ firstName: 'John', lastName: 'Doe' });
    assert.strictEqual(person.fullName, 'John Doe');
    assert.strictEqual(person.firstName, 'John');
    assert.strictEqual(person.lastName, 'Doe');
    assert.ok(typeof person.serialize === 'function');
  });
});
