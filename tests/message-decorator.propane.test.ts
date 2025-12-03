import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  TransformedMessage,
  RegularType,
  RegularAlias,
} from './message-decorator.propane.js';

describe('@message decorator', () => {
  it('transpiles types with @message to classes', () => {
    const msg = new TransformedMessage({ id: 1, name: 'Alice' });
    assert.strictEqual(msg.id, 1);
    assert.strictEqual(msg.name, 'Alice');
    assert.ok(typeof msg.serialize === 'function');
    assert.ok(typeof msg.hashCode === 'function');
  });

  it('leaves union types without @message as type aliases', () => {
    // RegularType should be a type alias for the union
    const status: RegularType = 'active';
    assert.strictEqual(status, 'active');

    // Verify it's a union type by checking valid values
    const validStatuses: RegularType[] = ['active', 'inactive', 'pending'];
    assert.ok(validStatuses.includes('active'));
  });

  it('leaves primitive type aliases without @message unchanged', () => {
    const id: RegularAlias = 42;
    assert.strictEqual(id, 42);
  });
});
