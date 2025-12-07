import { describe, it } from 'node:test';
import assert from 'node:assert';
import type { PmtFile, PmtMessage, PmtProperty, PmtType } from '@/tools/parser/types.js';
import {
  generateSchema,
  generateTableDefinition,
  findTableTypes,
  buildTypeRegistry,
  validateTableMessage,
  validateSchema,
} from './schema-generator.js';

// Helper to create a minimal PmtFile
function createFile(messages: PmtMessage[]): PmtFile {
  return {
    path: '/test.pmsg',
    messages,
    typeAliases: [],
    imports: [],
    diagnostics: [],
  };
}

// Helper to create a property
function prop(
  name: string,
  type: PmtType,
  options: { fieldNumber?: number; optional?: boolean } = {}
): PmtProperty {
  return {
    name,
    type,
    fieldNumber: options.fieldNumber ?? null,
    optional: options.optional ?? false,
    readonly: false,
    location: { start: { line: 1, column: 1 }, end: { line: 1, column: 1 } },
  };
}

// Helper to create a table message
function tableMessage(name: string, properties: PmtProperty[]): PmtMessage {
  return {
    name,
    isMessageType: true,
    isTableType: true,
    extendPath: null,
    properties,
    typeParameters: [],
    wrapper: { localName: 'Table', responseType: null },
    location: { start: { line: 1, column: 1 }, end: { line: 1, column: 1 } },
  };
}

// Helper types
const stringType: PmtType = { kind: 'primitive', primitive: 'string' };
const numberType: PmtType = { kind: 'primitive', primitive: 'number' };
const bigintType: PmtType = { kind: 'primitive', primitive: 'bigint' };
const booleanType: PmtType = { kind: 'primitive', primitive: 'boolean' };
const dateType: PmtType = { kind: 'date' };
const nullType: PmtType = { kind: 'primitive', primitive: 'null' };

// Wrapper type helpers
function pk(inner: PmtType): PmtType {
  return { kind: 'reference', name: 'PK', typeArguments: [inner] };
}

function auto(inner: PmtType): PmtType {
  return { kind: 'reference', name: 'Auto', typeArguments: [inner] };
}

function index(inner: PmtType): PmtType {
  return { kind: 'reference', name: 'Index', typeArguments: [inner] };
}

function unique(inner: PmtType): PmtType {
  return { kind: 'reference', name: 'Unique', typeArguments: [inner] };
}

function json(inner: PmtType): PmtType {
  return { kind: 'reference', name: 'Json', typeArguments: [inner] };
}

function union(...types: PmtType[]): PmtType {
  return { kind: 'union', types };
}

function literal(value: string | number | boolean): PmtType {
  return { kind: 'literal', value };
}

describe('generateSchema', () => {
  it('should generate schema from Table<{...}> types', () => {
    const file = createFile([
      tableMessage('User', [
        prop('id', pk(auto(bigintType)), { fieldNumber: 1 }),
        prop('email', unique(stringType), { fieldNumber: 2 }),
        prop('name', stringType, { fieldNumber: 3 }),
      ]),
    ]);

    const schema = generateSchema([file]);

    assert.strictEqual(schema.schemaName, 'public');
    assert.ok(schema.tables['users']);

    const users = schema.tables['users']!;
    assert.strictEqual(users.name, 'users');
    assert.strictEqual(users.sourceType, 'User');

    // Check columns
    assert.ok(users.columns['id']);
    assert.strictEqual(users.columns['id']!.type, 'BIGSERIAL');
    assert.strictEqual(users.columns['id']!.isPrimaryKey, true);
    assert.strictEqual(users.columns['id']!.fieldNumber, 1);

    assert.ok(users.columns['email']);
    assert.strictEqual(users.columns['email']!.type, 'TEXT');
    assert.strictEqual(users.columns['email']!.isUnique, true);

    assert.ok(users.columns['name']);
    assert.strictEqual(users.columns['name']!.type, 'TEXT');
  });

  it('should convert camelCase to snake_case', () => {
    const file = createFile([
      tableMessage('UserProfile', [
        prop('userId', bigintType, { fieldNumber: 1 }),
        prop('firstName', stringType, { fieldNumber: 2 }),
        prop('lastName', stringType, { fieldNumber: 3 }),
        prop('createdAt', dateType, { fieldNumber: 4 }),
      ]),
    ]);

    const schema = generateSchema([file]);

    const table = schema.tables['user_profiles']!;
    assert.ok(table.columns['user_id']);
    assert.ok(table.columns['first_name']);
    assert.ok(table.columns['last_name']);
    assert.ok(table.columns['created_at']);
  });

  it('should handle various PostgreSQL types', () => {
    const file = createFile([
      tableMessage('TestTypes', [
        prop('id', pk(bigintType), { fieldNumber: 1 }),
        prop('count', numberType, { fieldNumber: 2 }),
        prop('active', booleanType, { fieldNumber: 3 }),
        prop('created', dateType, { fieldNumber: 4 }),
      ]),
    ]);

    const schema = generateSchema([file]);
    const table = schema.tables['test_types']!;

    assert.strictEqual(table.columns['id']!.type, 'BIGINT');
    assert.strictEqual(table.columns['count']!.type, 'DOUBLE PRECISION');
    assert.strictEqual(table.columns['active']!.type, 'BOOLEAN');
    assert.strictEqual(table.columns['created']!.type, 'TIMESTAMPTZ');
  });

  it('should handle nullable types', () => {
    const file = createFile([
      tableMessage('OptionalFields', [
        prop('id', pk(bigintType), { fieldNumber: 1 }),
        prop('nickname', stringType, { fieldNumber: 2, optional: true }),
        prop('middleName', union(stringType, nullType), { fieldNumber: 3 }),
      ]),
    ]);

    const schema = generateSchema([file]);
    const table = schema.tables['optional_fields']!;

    assert.strictEqual(table.columns['id']!.nullable, false);
    assert.strictEqual(table.columns['nickname']!.nullable, true);
    assert.strictEqual(table.columns['middle_name']!.nullable, true);
  });

  it('should generate indexes for Index<T> fields', () => {
    const file = createFile([
      tableMessage('IndexedTable', [
        prop('id', pk(bigintType), { fieldNumber: 1 }),
        prop('email', index(stringType), { fieldNumber: 2 }),
        prop('createdAt', index(dateType), { fieldNumber: 3 }),
      ]),
    ]);

    const schema = generateSchema([file]);
    const table = schema.tables['indexed_tables']!;

    assert.strictEqual(table.indexes.length, 2);

    const emailIdx = table.indexes.find(i => i.columns.includes('email'));
    assert.ok(emailIdx);
    assert.strictEqual(emailIdx.unique, false);

    const createdIdx = table.indexes.find(i => i.columns.includes('created_at'));
    assert.ok(createdIdx);
  });

  it('should generate unique indexes for Unique<Index<T>>', () => {
    const file = createFile([
      tableMessage('UniqueIndexed', [
        prop('id', pk(bigintType), { fieldNumber: 1 }),
        prop('email', unique(index(stringType)), { fieldNumber: 2 }),
      ]),
    ]);

    const schema = generateSchema([file]);
    const table = schema.tables['unique_indexeds']!;

    const emailIdx = table.indexes.find(i => i.columns.includes('email'));
    assert.ok(emailIdx);
    assert.strictEqual(emailIdx.unique, true);
  });

  it('should generate CHECK constraints for string literal unions', () => {
    const file = createFile([
      tableMessage('StatusField', [
        prop('id', pk(bigintType), { fieldNumber: 1 }),
        prop('status', union(
          literal('pending'),
          literal('active'),
          literal('completed')
        ), { fieldNumber: 2 }),
      ]),
    ]);

    const schema = generateSchema([file]);
    const table = schema.tables['status_fields']!;

    assert.strictEqual(table.checkConstraints.length, 1);
    const check = table.checkConstraints[0]!;
    assert.ok(check.expression.includes("'pending'"));
    assert.ok(check.expression.includes("'active'"));
    assert.ok(check.expression.includes("'completed'"));
  });

  it('should handle Json<T> wrapper', () => {
    const file = createFile([
      tableMessage('JsonData', [
        prop('id', pk(bigintType), { fieldNumber: 1 }),
        prop('metadata', json(stringType), { fieldNumber: 2 }),
      ]),
    ]);

    const schema = generateSchema([file]);
    const table = schema.tables['json_datas']!;

    assert.strictEqual(table.columns['metadata']!.type, 'JSONB');
  });

  it('should skip non-table types', () => {
    const messageOnly: PmtMessage = {
      name: 'NotATable',
      isMessageType: true,
      isTableType: false,  // Not a table!
      extendPath: null,
      properties: [prop('value', stringType, { fieldNumber: 1 })],
      typeParameters: [],
      wrapper: { localName: 'Message', responseType: null },
      location: { start: { line: 1, column: 1 }, end: { line: 1, column: 1 } },
    };

    const file = createFile([messageOnly]);
    const schema = generateSchema([file]);

    assert.strictEqual(Object.keys(schema.tables).length, 0);
  });

  it('should use custom schema name', () => {
    const file = createFile([
      tableMessage('Simple', [prop('id', pk(bigintType), { fieldNumber: 1 })]),
    ]);

    const schema = generateSchema([file], { schemaName: 'my_schema' });
    assert.strictEqual(schema.schemaName, 'my_schema');
  });

  it('should set schema version', () => {
    const file = createFile([
      tableMessage('Simple', [prop('id', pk(bigintType), { fieldNumber: 1 })]),
    ]);

    const schema = generateSchema([file], { version: '1.0.0' });
    assert.strictEqual(schema.version, '1.0.0');
  });
});

describe('findTableTypes', () => {
  it('should find all Table<{...}> types', () => {
    const table1 = tableMessage('User', []);
    const table2 = tableMessage('Post', []);
    const nonTable: PmtMessage = {
      name: 'NotATable',
      isMessageType: true,
      isTableType: false,
      extendPath: null,
      properties: [],
      typeParameters: [],
      wrapper: null,
      location: { start: { line: 1, column: 1 }, end: { line: 1, column: 1 } },
    };

    const file = createFile([table1, nonTable, table2]);
    const tables = findTableTypes([file]);

    assert.strictEqual(tables.length, 2);
    assert.ok(tables.some(t => t.name === 'User'));
    assert.ok(tables.some(t => t.name === 'Post'));
  });
});

describe('generateTableDefinition', () => {
  it('should generate a single table definition', () => {
    const message = tableMessage('Product', [
      prop('id', pk(auto(bigintType)), { fieldNumber: 1 }),
      prop('name', stringType, { fieldNumber: 2 }),
      prop('price', numberType, { fieldNumber: 3 }),
    ]);

    const result = generateTableDefinition(message);

    assert.strictEqual(result.table.name, 'products');
    assert.strictEqual(result.table.sourceType, 'Product');
    assert.ok(result.table.columns['id']);
    assert.ok(result.table.columns['name']);
    assert.ok(result.table.columns['price']);
    assert.deepStrictEqual(result.table.primaryKey, ['id']);
    assert.strictEqual(result.childTables.length, 0);
  });
});

// Helper for Normalize<T[]>
function normalize(inner: PmtType): PmtType {
  return { kind: 'reference', name: 'Normalize', typeArguments: [inner] };
}

// Helper for array types
function arrayType(element: PmtType): PmtType {
  return { kind: 'array', elementType: element };
}

// Helper for FK<T>
function fk(typeName: string, column?: string): PmtType {
  const args: PmtType[] = [{ kind: 'reference', name: typeName, typeArguments: [] }];
  if (column) {
    args.push({ kind: 'literal', value: column });
  }
  return { kind: 'reference', name: 'FK', typeArguments: args };
}

describe('Normalize<T[]> child tables', () => {
  it('should generate child table for Normalize<string[]>', () => {
    const file = createFile([
      tableMessage('User', [
        prop('id', pk(auto(bigintType)), { fieldNumber: 1 }),
        prop('tags', normalize(arrayType(stringType)), { fieldNumber: 2 }),
      ]),
    ]);

    const schema = generateSchema([file]);

    // Parent table should NOT have tags column
    assert.ok(!schema.tables['users']!.columns['tags']);

    // Child table should exist (parent_table + column_name = users_tags)
    assert.ok(schema.tables['users_tags']);
    const child = schema.tables['users_tags']!;

    assert.ok(child.columns['id']);
    assert.ok(child.columns['user_id']);
    assert.ok(child.columns['array_index']);
    assert.ok(child.columns['value']);

    assert.strictEqual(child.columns['value']!.type, 'TEXT');
    assert.strictEqual(child.foreignKeys.length, 1);
    assert.strictEqual(child.foreignKeys[0]!.referencedTable, 'users');
  });

  it('should create index on parent foreign key', () => {
    const file = createFile([
      tableMessage('Order', [
        prop('id', pk(auto(bigintType)), { fieldNumber: 1 }),
        prop('items', separate(arrayType(stringType)), { fieldNumber: 2 }),
      ]),
    ]);

    const schema = generateSchema([file]);
    // orders + items = orders_items
    const child = schema.tables['orders_items']!;

    const fkIndex = child.indexes.find(i => i.columns.includes('order_id'));
    assert.ok(fkIndex, 'Should have index on parent FK');
  });

  it('should use CASCADE on delete', () => {
    const file = createFile([
      tableMessage('Post', [
        prop('id', pk(auto(bigintType)), { fieldNumber: 1 }),
        prop('comments', separate(arrayType(stringType)), { fieldNumber: 2 }),
      ]),
    ]);

    const schema = generateSchema([file]);
    // posts + comments = posts_comments
    const child = schema.tables['posts_comments']!;

    assert.strictEqual(child.foreignKeys[0]!.onDelete, 'CASCADE');
  });

  it('should handle numeric array elements', () => {
    const file = createFile([
      tableMessage('Stats', [
        prop('id', pk(auto(bigintType)), { fieldNumber: 1 }),
        prop('scores', separate(arrayType(numberType)), { fieldNumber: 2 }),
      ]),
    ]);

    const schema = generateSchema([file]);
    // Stats -> stats (already ends in 's') + scores = stats_scores
    const child = schema.tables['stats_scores']!;

    assert.strictEqual(child.columns['value']!.type, 'DOUBLE PRECISION');
  });
});

describe('FK<T> foreign keys', () => {
  it('should generate foreign key constraint', () => {
    const userMessage = tableMessage('User', [
      prop('id', pk(auto(bigintType)), { fieldNumber: 1 }),
      prop('name', stringType, { fieldNumber: 2 }),
    ]);

    const postMessage = tableMessage('Post', [
      prop('id', pk(auto(bigintType)), { fieldNumber: 1 }),
      prop('title', stringType, { fieldNumber: 2 }),
      prop('authorId', fk('User'), { fieldNumber: 3 }),
    ]);

    const file = createFile([userMessage, postMessage]);
    const schema = generateSchema([file]);

    const posts = schema.tables['posts']!;

    assert.ok(posts.columns['author_id']);
    assert.strictEqual(posts.foreignKeys.length, 1);

    const fkConstraint = posts.foreignKeys[0]!;
    assert.strictEqual(fkConstraint.referencedTable, 'users');
    assert.deepStrictEqual(fkConstraint.referencedColumns, ['id']);
  });

  it('should handle FK<T, column> with custom column', () => {
    const categoryMessage = tableMessage('Category', [
      prop('code', pk(stringType), { fieldNumber: 1 }),
      prop('name', stringType, { fieldNumber: 2 }),
    ]);

    const productMessage = tableMessage('Product', [
      prop('id', pk(auto(bigintType)), { fieldNumber: 1 }),
      prop('categoryCode', fk('Category', 'code'), { fieldNumber: 2 }),
    ]);

    const file = createFile([categoryMessage, productMessage]);
    const schema = generateSchema([file]);

    const products = schema.tables['products']!;
    const fkConstraint = products.foreignKeys[0]!;

    assert.deepStrictEqual(fkConstraint.referencedColumns, ['code']);
  });

  it('should infer column type from referenced table', () => {
    const userMessage = tableMessage('User', [
      prop('id', pk(auto(bigintType)), { fieldNumber: 1 }),
    ]);

    const postMessage = tableMessage('Post', [
      prop('id', pk(auto(bigintType)), { fieldNumber: 1 }),
      prop('authorId', fk('User'), { fieldNumber: 2 }),
    ]);

    const file = createFile([userMessage, postMessage]);
    const schema = generateSchema([file]);

    const posts = schema.tables['posts']!;
    // FK column should be BIGINT (matching User.id type)
    assert.strictEqual(posts.columns['author_id']!.type, 'BIGINT');
  });
});

describe('validation', () => {
  it('should error on PK<Auto<string>>', () => {
    const msg = tableMessage('Bad', [
      prop('id', pk(auto(stringType)), { fieldNumber: 1 }),
    ]);

    const result = validateTableMessage(msg);

    assert.strictEqual(result.valid, false);
    assert.strictEqual(result.errors[0]!.code, 'INVALID_AUTO_TYPE');
  });

  it('should error on multiple PK<T> fields', () => {
    const msg = tableMessage('Bad', [
      prop('id1', pk(bigintType), { fieldNumber: 1 }),
      prop('id2', pk(bigintType), { fieldNumber: 2 }),
    ]);

    const result = validateTableMessage(msg);

    assert.strictEqual(result.valid, false);
    assert.strictEqual(result.errors[0]!.code, 'MULTIPLE_PRIMARY_KEYS');
  });

  it('should error on Normalize without array type', () => {
    const msg = tableMessage('Bad', [
      prop('id', pk(bigintType), { fieldNumber: 1 }),
      prop('value', normalize(stringType), { fieldNumber: 2 }),
    ]);

    const result = validateTableMessage(msg);

    assert.strictEqual(result.valid, false);
    assert.strictEqual(result.errors[0]!.code, 'NORMALIZE_NOT_ARRAY');
  });

  it('should error on duplicate field numbers', () => {
    const msg = tableMessage('Bad', [
      prop('id', pk(bigintType), { fieldNumber: 1 }),
      prop('name', stringType, { fieldNumber: 1 }),
    ]);

    const result = validateTableMessage(msg);

    assert.strictEqual(result.valid, false);
    assert.strictEqual(result.errors[0]!.code, 'DUPLICATE_FIELD_NUMBER');
  });

  it('should pass for valid table', () => {
    const msg = tableMessage('Good', [
      prop('id', pk(auto(bigintType)), { fieldNumber: 1 }),
      prop('name', stringType, { fieldNumber: 2 }),
    ]);

    const result = validateTableMessage(msg);

    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.errors.length, 0);
  });
});

describe('validateSchema', () => {
  it('should validate all tables in files', () => {
    const file = createFile([
      tableMessage('Good', [
        prop('id', pk(auto(bigintType)), { fieldNumber: 1 }),
      ]),
      tableMessage('Bad', [
        prop('id1', pk(bigintType), { fieldNumber: 1 }),
        prop('id2', pk(bigintType), { fieldNumber: 2 }),
      ]),
    ]);

    const result = validateSchema([file]);

    assert.strictEqual(result.valid, false);
    assert.strictEqual(result.errors.length, 1);
    assert.strictEqual(result.errors[0]!.table, 'Bad');
  });
});

describe('buildTypeRegistry', () => {
  it('should build registry from files', () => {
    const file = createFile([
      tableMessage('User', []),
      tableMessage('Post', []),
    ]);

    const registry = buildTypeRegistry([file]);

    assert.ok(registry.has('User'));
    assert.ok(registry.has('Post'));
    assert.strictEqual(registry.size, 2);
  });
});
