import { describe, it } from 'node:test';
import assert from 'node:assert';
import { User, Post } from './table-wrapper.pmsg.js';

describe('Table<T> wrapper', () => {
  it('creates User instances with all properties', () => {
    const user = new User({
      id: 1n,
      email: 'test@example.com',
      name: 'Test User',
      active: true,
      created: new Date('2024-01-01'),
    });

    assert.strictEqual(user.id, 1n);
    assert.strictEqual(user.email, 'test@example.com');
    assert.strictEqual(user.name, 'Test User');
    assert.strictEqual(user.active, true);
    assert.strictEqual(user.created.toString(), '2024-01-01T00:00:00.000Z');
  });

  it('creates Post instances with all properties', () => {
    const post = new Post({
      id: 1n,
      userId: 42n,
      title: 'Hello World',
      content: 'This is a test post.',
      published: true,
      created: new Date('2024-01-01'),
      updated: new Date('2024-01-02'),
    });

    assert.strictEqual(post.id, 1n);
    assert.strictEqual(post.userId, 42n);
    assert.strictEqual(post.title, 'Hello World');
    assert.strictEqual(post.content, 'This is a test post.');
    assert.strictEqual(post.published, true);
  });

  it('User serializes and deserializes correctly', () => {
    const user = new User({
      id: 1n,
      email: 'test@example.com',
      name: 'Test User',
      active: true,
      created: new Date('2024-01-01'),
    });

    const serialized = user.serialize();
    const deserialized = User.deserialize(serialized);

    assert.strictEqual(deserialized.id, user.id);
    assert.strictEqual(deserialized.email, user.email);
    assert.strictEqual(deserialized.name, user.name);
    assert.strictEqual(deserialized.active, user.active);
  });

  it('User equals works correctly', () => {
    const user1 = new User({
      id: 1n,
      email: 'test@example.com',
      name: 'Test User',
      active: true,
      created: new Date('2024-01-01'),
    });

    const user2 = new User({
      id: 1n,
      email: 'test@example.com',
      name: 'Test User',
      active: true,
      created: new Date('2024-01-01'),
    });

    const user3 = new User({
      id: 2n,
      email: 'other@example.com',
      name: 'Other User',
      active: false,
      created: new Date('2024-02-01'),
    });

    assert.ok(user1.equals(user2));
    assert.ok(!user1.equals(user3));
  });

  it('User.Data interface exists', () => {
    // Type test - User.Data should be the data interface
    const data: User.Data = {
      id: 1n,
      email: 'test@example.com',
      name: 'Test User',
      active: true,
      created: new Date(),
    };

    const user = new User(data);
    assert.strictEqual(user.id, data.id);
  });

  it('User.Value type exists', () => {
    // Type test - User.Value should be User | User.Data
    const userInstance: User.Value = new User({
      id: 1n,
      email: 'test@example.com',
      name: 'Test User',
      active: true,
      created: new Date(),
    });

    const userData: User.Value = {
      id: 2n,
      email: 'other@example.com',
      name: 'Other User',
      active: false,
      created: new Date(),
    };

    assert.ok(userInstance instanceof User);
    assert.ok(!(userData instanceof User));
  });
});
