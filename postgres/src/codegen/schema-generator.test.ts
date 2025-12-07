import { describe, it } from 'node:test';
import assert from 'node:assert';
import type { PmtFile, PmtMessage, PmtProperty, PmtType } from '@/tools/parser/types.js';
import {
  generateSchema,
  generateTableDefinition,
  findTableTypes,
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

    const table = generateTableDefinition(message);

    assert.strictEqual(table.name, 'products');
    assert.strictEqual(table.sourceType, 'Product');
    assert.ok(table.columns['id']);
    assert.ok(table.columns['name']);
    assert.ok(table.columns['price']);
    assert.deepStrictEqual(table.primaryKey, ['id']);
  });
});
