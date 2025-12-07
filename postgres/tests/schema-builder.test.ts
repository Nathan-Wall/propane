/**
 * Tests for the schema builder.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { createSchemaBuilder, defineSchema } from '../src/schema/builder.js';

describe('SchemaBuilder', () => {
  it('should create an empty schema', () => {
    const builder = createSchemaBuilder();
    const schema = builder.build();
    assert.deepStrictEqual(schema.tables, {});
  });

  it('should add a simple table with columns', () => {
    const builder = createSchemaBuilder();
    builder.table('users', (t) => {
      t.column('id', (c) => c.bigint().primaryKey());
      t.column('name', (c) => c.text().notNull());
      t.column('email', (c) => c.text().notNull());
    });

    const schema = builder.build();
    const users = schema.tables['users'];
    assert.ok(users);
    assert.ok(users.columns['id']);
    assert.ok(users.columns['name']);
    assert.ok(users.columns['email']);
  });

  it('should set column types correctly', () => {
    const builder = createSchemaBuilder();
    builder.table('test', (t) => {
      t.column('int_col', (c) => c.integer());
      t.column('big_col', (c) => c.bigint());
      t.column('text_col', (c) => c.text());
      t.column('bool_col', (c) => c.boolean());
      t.column('ts_col', (c) => c.timestamptz());
      t.column('json_col', (c) => c.jsonb());
      t.column('num_col', (c) => c.numeric(10, 2));
      t.column('bytes_col', (c) => c.bytea());
    });

    const schema = builder.build();
    const columns = schema.tables['test']!.columns;
    assert.strictEqual(columns['int_col']?.type, 'INTEGER');
    assert.strictEqual(columns['big_col']?.type, 'BIGINT');
    assert.strictEqual(columns['text_col']?.type, 'TEXT');
    assert.strictEqual(columns['bool_col']?.type, 'BOOLEAN');
    assert.strictEqual(columns['ts_col']?.type, 'TIMESTAMPTZ');
    assert.strictEqual(columns['json_col']?.type, 'JSONB');
    assert.strictEqual(columns['num_col']?.type, 'NUMERIC(10,2)');
    assert.strictEqual(columns['bytes_col']?.type, 'BYTEA');
  });

  it('should mark primary key', () => {
    const builder = createSchemaBuilder();
    builder.table('users', (t) => {
      t.column('id', (c) => c.bigint().primaryKey());
    });

    const schema = builder.build();
    const users = schema.tables['users']!;
    assert.strictEqual(users.columns['id']?.isPrimaryKey, true);
    assert.deepStrictEqual(users.primaryKey, ['id']);
  });

  it('should handle nullable columns', () => {
    const builder = createSchemaBuilder();
    builder.table('users', (t) => {
      t.column('name', (c) => c.text().nullable());
      t.column('email', (c) => c.text().notNull());
    });

    const schema = builder.build();
    const users = schema.tables['users']!;
    assert.strictEqual(users.columns['name']?.nullable, true);
    assert.strictEqual(users.columns['email']?.nullable, false);
  });

  it('should handle default values', () => {
    const builder = createSchemaBuilder();
    builder.table('users', (t) => {
      t.column('active', (c) => c.boolean().default('TRUE'));
      t.column('status', (c) => c.text().default("'active'"));
    });

    const schema = builder.build();
    const users = schema.tables['users']!;
    assert.strictEqual(users.columns['active']?.defaultValue, 'TRUE');
    assert.strictEqual(users.columns['status']?.defaultValue, "'active'");
  });

  it('should handle unique constraints', () => {
    const builder = createSchemaBuilder();
    builder.table('users', (t) => {
      t.column('email', (c) => c.text().unique());
    });

    const schema = builder.build();
    assert.strictEqual(schema.tables['users']!.columns['email']?.isUnique, true);
  });

  it('should handle serial/bigserial types', () => {
    const builder = createSchemaBuilder();
    builder.table('users', (t) => {
      t.column('id', (c) => c.serial().primaryKey());
    });

    const schema = builder.build();
    const users = schema.tables['users']!;
    assert.strictEqual(users.columns['id']?.type, 'SERIAL');
    assert.strictEqual(users.columns['id']?.isAutoIncrement, true);
  });

  it('should add indexes', () => {
    const builder = createSchemaBuilder();
    builder.table('users', (t) => {
      t.column('email', (c) => c.text());
      t.index('users_email_idx', ['email']);
    });

    const schema = builder.build();
    const users = schema.tables['users']!;
    assert.strictEqual(users.indexes.length, 1);
    assert.strictEqual(users.indexes[0]!.name, 'users_email_idx');
    assert.deepStrictEqual(users.indexes[0]!.columns, ['email']);
  });

  it('should add unique indexes', () => {
    const builder = createSchemaBuilder();
    builder.table('users', (t) => {
      t.column('email', (c) => c.text());
      t.uniqueIndex('users_email_unique', ['email']);
    });

    const schema = builder.build();
    const users = schema.tables['users']!;
    assert.strictEqual(users.indexes.length, 1);
    assert.strictEqual(users.indexes[0]!.unique, true);
  });

  it('should add composite indexes', () => {
    const builder = createSchemaBuilder();
    builder.table('orders', (t) => {
      t.column('user_id', (c) => c.bigint());
      t.column('created_at', (c) => c.timestamptz());
      t.index('orders_user_created_idx', ['user_id', 'created_at']);
    });

    const schema = builder.build();
    const orders = schema.tables['orders']!;
    assert.deepStrictEqual(orders.indexes[0]!.columns, ['user_id', 'created_at']);
  });

  it('should add foreign keys', () => {
    const builder = createSchemaBuilder();
    builder.table('orders', (t) => {
      t.column('user_id', (c) => c.bigint());
      t.foreignKey('orders_user_fk', ['user_id'], 'users', ['id']);
    });

    const schema = builder.build();
    const orders = schema.tables['orders']!;
    assert.strictEqual(orders.foreignKeys.length, 1);
    const fk = orders.foreignKeys[0]!;
    assert.deepStrictEqual(fk.columns, ['user_id']);
    assert.strictEqual(fk.referencedTable, 'users');
    assert.deepStrictEqual(fk.referencedColumns, ['id']);
  });

  it('should add foreign keys with onDelete', () => {
    const builder = createSchemaBuilder();
    builder.table('orders', (t) => {
      t.column('user_id', (c) => c.bigint());
      t.foreignKey('orders_user_fk', ['user_id'], 'users', ['id'], { onDelete: 'CASCADE' });
    });

    const schema = builder.build();
    const orders = schema.tables['orders']!;
    assert.strictEqual(orders.foreignKeys[0]!.onDelete, 'CASCADE');
  });

  it('should add check constraints', () => {
    const builder = createSchemaBuilder();
    builder.table('products', (t) => {
      t.column('price', (c) => c.numeric(10, 2));
      t.check('products_price_positive', 'price >= 0');
    });

    const schema = builder.build();
    const products = schema.tables['products']!;
    assert.strictEqual(products.checkConstraints.length, 1);
    assert.strictEqual(products.checkConstraints[0]!.expression, 'price >= 0');
  });

  it('should track field numbers', () => {
    const builder = createSchemaBuilder();
    builder.table('users', (t) => {
      t.column('id', (c) => c.bigint().fieldNumber(1));
      t.column('name', (c) => c.text().fieldNumber(2));
      t.column('email', (c) => c.text().fieldNumber(3));
    });

    const schema = builder.build();
    const users = schema.tables['users']!;
    assert.deepStrictEqual(users.fieldNumbers, {
      id: 1,
      name: 2,
      email: 3,
    });
  });

  it('should handle double precision type', () => {
    const builder = createSchemaBuilder();
    builder.table('measurements', (t) => {
      t.column('value', (c) => c.doublePrecision());
    });

    const schema = builder.build();
    const measurements = schema.tables['measurements']!;
    assert.strictEqual(measurements.columns['value']?.type, 'DOUBLE PRECISION');
  });

  it('should build multiple tables', () => {
    const builder = createSchemaBuilder();
    builder.table('users', (t) => {
      t.column('id', (c) => c.bigint().primaryKey());
      t.column('name', (c) => c.text());
    });
    builder.table('posts', (t) => {
      t.column('id', (c) => c.bigint().primaryKey());
      t.column('title', (c) => c.text());
      t.column('author_id', (c) => c.bigint());
    });

    const schema = builder.build();
    assert.ok(schema.tables['users']);
    assert.ok(schema.tables['posts']);
  });

  it('should set schema name', () => {
    const builder = createSchemaBuilder();
    builder.schema('myapp');

    const schema = builder.build();
    assert.strictEqual(schema.schemaName, 'myapp');
  });

  it('should set schema version', () => {
    const builder = createSchemaBuilder();
    builder.version('1.0.0');

    const schema = builder.build();
    assert.strictEqual(schema.version, '1.0.0');
  });
});

describe('defineSchema', () => {
  it('should create schema with define helper', () => {
    const schema = defineSchema((builder) => {
      builder.table('users', (t) => {
        t.column('id', (c) => c.bigint().primaryKey());
      });
    });

    assert.ok(schema.tables['users']);
  });
});
