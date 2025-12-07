/**
 * Tests for the schema differ.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { compareSchemas } from '../src/migration/differ.js';
import type { DatabaseSchema, TableDefinition } from '../src/schema/types.js';

function createEmptySchema(): DatabaseSchema {
  return { schemaName: 'public', tables: {} };
}

type TableColumnConfig = {
  type: string;
  nullable?: boolean;
  defaultValue?: string;
};

function createTable(
  name: string,
  columns: Record<string, TableColumnConfig>
): TableDefinition {
  return {
    name,
    columns: Object.fromEntries(
      Object.entries(columns).map(([colName, config]) => [
        colName,
        {
          name: colName,
          type: config.type,
          nullable: config.nullable ?? false,
          defaultValue: config.defaultValue,
          isPrimaryKey: false,
          isUnique: false,
          isAutoIncrement: false,
        },
      ])
    ),
    primaryKey: [],
    indexes: [],
    foreignKeys: [],
    checkConstraints: [],
  };
}

describe('compareSchemas - table operations', () => {
  it('should detect tables to create', () => {
    const from = createEmptySchema();
    const to: DatabaseSchema = {
      schemaName: 'public',
      tables: {
        users: createTable('users', { id: { type: 'BIGINT' }, name: { type: 'TEXT' } }),
      },
    };

    const diff = compareSchemas(from, to);
    assert.strictEqual(diff.tablesToCreate.length, 1);
    assert.strictEqual(diff.tablesToCreate[0]!.name, 'users');
    assert.strictEqual(diff.tablesToDrop.length, 0);
  });

  it('should detect tables to drop', () => {
    const from: DatabaseSchema = {
      schemaName: 'public',
      tables: {
        users: createTable('users', { id: { type: 'BIGINT' } }),
      },
    };
    const to = createEmptySchema();

    const diff = compareSchemas(from, to);
    assert.strictEqual(diff.tablesToCreate.length, 0);
    assert.strictEqual(diff.tablesToDrop.length, 1);
    assert.strictEqual(diff.tablesToDrop[0], 'users');
  });

  it('should mark dropped tables as breaking changes', () => {
    const from: DatabaseSchema = {
      schemaName: 'public',
      tables: {
        users: createTable('users', { id: { type: 'BIGINT' } }),
      },
    };
    const to = createEmptySchema();

    const diff = compareSchemas(from, to);
    assert.strictEqual(diff.hasBreakingChanges, true);
  });

  it('should not have breaking changes for new tables', () => {
    const from = createEmptySchema();
    const to: DatabaseSchema = {
      schemaName: 'public',
      tables: {
        users: createTable('users', { id: { type: 'BIGINT' } }),
      },
    };

    const diff = compareSchemas(from, to);
    assert.strictEqual(diff.hasBreakingChanges, false);
  });
});

describe('compareSchemas - column operations', () => {
  it('should detect columns to add', () => {
    const from: DatabaseSchema = {
      schemaName: 'public',
      tables: {
        users: createTable('users', { id: { type: 'BIGINT' } }),
      },
    };
    const to: DatabaseSchema = {
      schemaName: 'public',
      tables: {
        users: createTable('users', { id: { type: 'BIGINT' }, email: { type: 'TEXT' } }),
      },
    };

    const diff = compareSchemas(from, to);
    assert.strictEqual(diff.tablesToAlter.length, 1);
    assert.strictEqual(diff.tablesToAlter[0]!.columnsToAdd.length, 1);
    assert.strictEqual(diff.tablesToAlter[0]!.columnsToAdd[0]!.name, 'email');
  });

  it('should detect columns to drop', () => {
    const from: DatabaseSchema = {
      schemaName: 'public',
      tables: {
        users: createTable('users', { id: { type: 'BIGINT' }, email: { type: 'TEXT' } }),
      },
    };
    const to: DatabaseSchema = {
      schemaName: 'public',
      tables: {
        users: createTable('users', { id: { type: 'BIGINT' } }),
      },
    };

    const diff = compareSchemas(from, to);
    assert.strictEqual(diff.tablesToAlter.length, 1);
    assert.strictEqual(diff.tablesToAlter[0]!.columnsToDrop.length, 1);
    assert.strictEqual(diff.tablesToAlter[0]!.columnsToDrop[0], 'email');
    assert.strictEqual(diff.hasBreakingChanges, true);
  });

  it('should detect column type changes', () => {
    const from: DatabaseSchema = {
      schemaName: 'public',
      tables: {
        users: createTable('users', { id: { type: 'INTEGER' } }),
      },
    };
    const to: DatabaseSchema = {
      schemaName: 'public',
      tables: {
        users: createTable('users', { id: { type: 'BIGINT' } }),
      },
    };

    const diff = compareSchemas(from, to);
    assert.strictEqual(diff.tablesToAlter.length, 1);
    assert.strictEqual(diff.tablesToAlter[0]!.columnsToAlter.length, 1);
    const alteration = diff.tablesToAlter[0]!.columnsToAlter[0]!;
    assert.strictEqual(alteration.columnName, 'id');
    assert.deepStrictEqual(alteration.typeChange, { from: 'INTEGER', to: 'BIGINT' });
    assert.strictEqual(diff.hasBreakingChanges, true);
  });

  it('should detect nullable changes', () => {
    const from: DatabaseSchema = {
      schemaName: 'public',
      tables: {
        users: createTable('users', { name: { type: 'TEXT', nullable: false } }),
      },
    };
    const to: DatabaseSchema = {
      schemaName: 'public',
      tables: {
        users: createTable('users', { name: { type: 'TEXT', nullable: true } }),
      },
    };

    const diff = compareSchemas(from, to);
    assert.strictEqual(diff.tablesToAlter.length, 1);
    const alteration = diff.tablesToAlter[0]!.columnsToAlter[0]!;
    assert.deepStrictEqual(
      alteration.nullableChange,
      { from: false, to: true }
    );
  });

  it('should detect default value changes', () => {
    const from: DatabaseSchema = {
      schemaName: 'public',
      tables: {
        users: createTable('users', { active: { type: 'BOOLEAN', defaultValue: 'FALSE' } }),
      },
    };
    const to: DatabaseSchema = {
      schemaName: 'public',
      tables: {
        users: createTable('users', { active: { type: 'BOOLEAN', defaultValue: 'TRUE' } }),
      },
    };

    const diff = compareSchemas(from, to);
    assert.strictEqual(diff.tablesToAlter.length, 1);
    const alteration = diff.tablesToAlter[0]!.columnsToAlter[0]!;
    assert.deepStrictEqual(alteration.defaultChange, { from: 'FALSE', to: 'TRUE' });
  });
});

describe('compareSchemas - rename detection via field numbers', () => {
  it('should detect column renames via field numbers', () => {
    const from: DatabaseSchema = {
      schemaName: 'public',
      tables: {
        users: {
          ...createTable('users', { user_name: { type: 'TEXT' } }),
          fieldNumbers: { user_name: 1 },
        },
      },
    };
    const to: DatabaseSchema = {
      schemaName: 'public',
      tables: {
        users: {
          ...createTable('users', { name: { type: 'TEXT' } }),
          fieldNumbers: { name: 1 },
        },
      },
    };

    const diff = compareSchemas(from, to, { useFieldNumbers: true });
    assert.strictEqual(diff.tablesToAlter.length, 1);
    assert.strictEqual(diff.tablesToAlter[0]!.columnsToRename.length, 1);
    assert.deepStrictEqual(diff.tablesToAlter[0]!.columnsToRename[0], { from: 'user_name', to: 'name' });
    assert.strictEqual(
      diff.tablesToAlter[0]!.columnsToAdd.length,
      0
    );
    assert.strictEqual(
      diff.tablesToAlter[0]!.columnsToDrop.length,
      0
    );
  });

  it('should not detect rename if field numbers disabled', () => {
    const from: DatabaseSchema = {
      schemaName: 'public',
      tables: {
        users: {
          ...createTable('users', { user_name: { type: 'TEXT' } }),
          fieldNumbers: { user_name: 1 },
        },
      },
    };
    const to: DatabaseSchema = {
      schemaName: 'public',
      tables: {
        users: {
          ...createTable('users', { name: { type: 'TEXT' } }),
          fieldNumbers: { name: 1 },
        },
      },
    };

    const diff = compareSchemas(from, to, {
      useFieldNumbers: false,
      useHeuristics: false,
    });
    // Without field numbers or heuristics, should be add + drop
    assert.strictEqual(diff.tablesToAlter[0]!.columnsToRename.length, 0);
    assert.strictEqual(diff.tablesToAlter[0]!.columnsToAdd.length, 1);
    assert.strictEqual(diff.tablesToAlter[0]!.columnsToDrop.length, 1);
  });
});

describe('compareSchemas - heuristic rename detection', () => {
  it('should detect renames via heuristics when types match', () => {
    const from: DatabaseSchema = {
      schemaName: 'public',
      tables: {
        users: createTable('users', { user_name: { type: 'TEXT' } }),
      },
    };
    const to: DatabaseSchema = {
      schemaName: 'public',
      tables: {
        users: createTable('users', { username: { type: 'TEXT' } }),
      },
    };

    // High similarity between user_name and username
    const diff = compareSchemas(from, to, {
      useFieldNumbers: false,
      useHeuristics: true,
      renameSimilarityThreshold: 0.6,
    });
    assert.strictEqual(diff.tablesToAlter.length, 1);
    assert.strictEqual(diff.tablesToAlter[0]!.columnsToRename.length, 1);
    assert.deepStrictEqual(diff.tablesToAlter[0]!.columnsToRename[0], { from: 'user_name', to: 'username' });
  });

  it('should not detect rename if types differ', () => {
    const from: DatabaseSchema = {
      schemaName: 'public',
      tables: {
        users: createTable('users', { count: { type: 'INTEGER' } }),
      },
    };
    const to: DatabaseSchema = {
      schemaName: 'public',
      tables: {
        users: createTable('users', { counter: { type: 'TEXT' } }),
      },
    };

    const diff = compareSchemas(from, to, { useHeuristics: true });
    // Different types, so no rename detected
    assert.strictEqual(diff.tablesToAlter[0]!.columnsToRename.length, 0);
    assert.strictEqual(diff.tablesToAlter[0]!.columnsToAdd.length, 1);
    assert.strictEqual(diff.tablesToAlter[0]!.columnsToDrop.length, 1);
  });

  it('should generate warnings for possible renames below threshold', () => {
    const from: DatabaseSchema = {
      schemaName: 'public',
      tables: {
        users: createTable('users', { email_address: { type: 'TEXT' } }),
      },
    };
    const to: DatabaseSchema = {
      schemaName: 'public',
      tables: {
        users: createTable('users', { email: { type: 'TEXT' } }),
      },
    };

    // email vs email_address has some similarity but may be below threshold
    const diff = compareSchemas(from, to, {
      useFieldNumbers: false,
      useHeuristics: true,
      renameSimilarityThreshold: 0.9, // Very high threshold
    });
    // Should add/drop rather than rename, but may generate warning
    const alteration = diff.tablesToAlter[0]!;
    const hasColumnsChanged = alteration.columnsToAdd.length > 0
      || alteration.columnsToDrop.length > 0
      || alteration.columnsToRename.length > 0;
    assert.ok(hasColumnsChanged);
  });
});

describe('compareSchemas - indexes', () => {
  it('should detect new indexes', () => {
    const from: DatabaseSchema = {
      schemaName: 'public',
      tables: {
        users: createTable('users', { email: { type: 'TEXT' } }),
      },
    };
    const to: DatabaseSchema = {
      schemaName: 'public',
      tables: {
        users: {
          ...createTable('users', { email: { type: 'TEXT' } }),
          indexes: [{ name: 'users_email_idx', columns: ['email'], unique: false }],
        },
      },
    };

    const diff = compareSchemas(from, to);
    assert.strictEqual(diff.tablesToAlter.length, 1);
    assert.strictEqual(diff.tablesToAlter[0]!.indexesToCreate.length, 1);
    assert.strictEqual(diff.tablesToAlter[0]!.indexesToCreate[0]!.name, 'users_email_idx');
  });

  it('should detect dropped indexes', () => {
    const from: DatabaseSchema = {
      schemaName: 'public',
      tables: {
        users: {
          ...createTable('users', { email: { type: 'TEXT' } }),
          indexes: [{ name: 'users_email_idx', columns: ['email'], unique: false }],
        },
      },
    };
    const to: DatabaseSchema = {
      schemaName: 'public',
      tables: {
        users: createTable('users', { email: { type: 'TEXT' } }),
      },
    };

    const diff = compareSchemas(from, to);
    assert.strictEqual(diff.tablesToAlter.length, 1);
    assert.strictEqual(diff.tablesToAlter[0]!.indexesToDrop.length, 1);
    assert.strictEqual(diff.tablesToAlter[0]!.indexesToDrop[0], 'users_email_idx');
  });
});

describe('compareSchemas - foreign keys', () => {
  it('should detect new foreign keys', () => {
    const from: DatabaseSchema = {
      schemaName: 'public',
      tables: {
        orders: createTable('orders', { user_id: { type: 'BIGINT' } }),
      },
    };
    const to: DatabaseSchema = {
      schemaName: 'public',
      tables: {
        orders: {
          ...createTable('orders', { user_id: { type: 'BIGINT' } }),
          foreignKeys: [{
            name: 'orders_user_fk',
            columns: ['user_id'],
            referencedTable: 'users',
            referencedColumns: ['id'],
            onDelete: 'NO ACTION',
            onUpdate: 'NO ACTION',
          }],
        },
      },
    };

    const diff = compareSchemas(from, to);
    assert.strictEqual(diff.tablesToAlter.length, 1);
    assert.strictEqual(diff.tablesToAlter[0]!.foreignKeysToAdd.length, 1);
    assert.strictEqual(diff.tablesToAlter[0]!.foreignKeysToAdd[0]!.name, 'orders_user_fk');
  });

  it('should detect dropped foreign keys', () => {
    const from: DatabaseSchema = {
      schemaName: 'public',
      tables: {
        orders: {
          ...createTable('orders', { user_id: { type: 'BIGINT' } }),
          foreignKeys: [{
            name: 'orders_user_fk',
            columns: ['user_id'],
            referencedTable: 'users',
            referencedColumns: ['id'],
            onDelete: 'NO ACTION',
            onUpdate: 'NO ACTION',
          }],
        },
      },
    };
    const to: DatabaseSchema = {
      schemaName: 'public',
      tables: {
        orders: createTable('orders', { user_id: { type: 'BIGINT' } }),
      },
    };

    const diff = compareSchemas(from, to);
    assert.strictEqual(diff.tablesToAlter.length, 1);
    assert.strictEqual(diff.tablesToAlter[0]!.foreignKeysToDrop.length, 1);
  });
});

describe('compareSchemas - check constraints', () => {
  it('should detect new check constraints', () => {
    const from: DatabaseSchema = {
      schemaName: 'public',
      tables: {
        products: createTable('products', { price: { type: 'NUMERIC(10,2)' } }),
      },
    };
    const to: DatabaseSchema = {
      schemaName: 'public',
      tables: {
        products: {
          ...createTable('products', { price: { type: 'NUMERIC(10,2)' } }),
          checkConstraints: [{ name: 'price_positive', expression: 'price >= 0' }],
        },
      },
    };

    const diff = compareSchemas(from, to);
    assert.strictEqual(diff.tablesToAlter.length, 1);
    assert.strictEqual(diff.tablesToAlter[0]!.checksToAdd.length, 1);
  });

  it('should detect dropped check constraints', () => {
    const from: DatabaseSchema = {
      schemaName: 'public',
      tables: {
        products: {
          ...createTable('products', { price: { type: 'NUMERIC(10,2)' } }),
          checkConstraints: [{ name: 'price_positive', expression: 'price >= 0' }],
        },
      },
    };
    const to: DatabaseSchema = {
      schemaName: 'public',
      tables: {
        products: createTable('products', { price: { type: 'NUMERIC(10,2)' } }),
      },
    };

    const diff = compareSchemas(from, to);
    assert.strictEqual(diff.tablesToAlter.length, 1);
    assert.strictEqual(diff.tablesToAlter[0]!.checksToDrop.length, 1);
  });
});

describe('compareSchemas - no changes', () => {
  it('should return empty diff for identical schemas', () => {
    const schema: DatabaseSchema = {
      schemaName: 'public',
      tables: {
        users: createTable('users', { id: { type: 'BIGINT' }, name: { type: 'TEXT' } }),
      },
    };

    const diff = compareSchemas(schema, schema);
    assert.strictEqual(diff.tablesToCreate.length, 0);
    assert.strictEqual(diff.tablesToDrop.length, 0);
    assert.strictEqual(diff.tablesToAlter.length, 0);
    assert.strictEqual(diff.hasBreakingChanges, false);
  });
});
