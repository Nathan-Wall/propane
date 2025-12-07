/**
 * Tests for the migration SQL generator.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  generateMigration,
  generateMigrationFilename,
  formatMigrationFile,
} from '../src/migration/generator.js';
import type {
  SchemaDiff,
  TableDefinition,
  ColumnDefinition,
  TableAlteration,
} from '../src/schema/types.js';

function createColumn(
  name: string,
  type: string,
  options: Partial<ColumnDefinition> = {}
): ColumnDefinition {
  return {
    name,
    type,
    nullable: options.nullable ?? false,
    defaultValue: options.defaultValue,
    isPrimaryKey: options.isPrimaryKey ?? false,
    isUnique: options.isUnique ?? false,
    isAutoIncrement: options.isAutoIncrement ?? false,
  };
}

function createTable(
  name: string,
  columns: ColumnDefinition[],
  options: Partial<TableDefinition> = {}
): TableDefinition {
  return {
    name,
    columns: Object.fromEntries(columns.map(c => [c.name, c])),
    primaryKey: options.primaryKey ?? [],
    indexes: options.indexes ?? [],
    foreignKeys: options.foreignKeys ?? [],
    checkConstraints: options.checkConstraints ?? [],
  };
}

function createEmptyAlteration(tableName: string): TableAlteration {
  return {
    tableName,
    columnsToAdd: [],
    columnsToDrop: [],
    columnsToRename: [],
    columnsToAlter: [],
    indexesToCreate: [],
    indexesToDrop: [],
    foreignKeysToAdd: [],
    foreignKeysToDrop: [],
    checksToAdd: [],
    checksToDrop: [],
  };
}

function createEmptyDiff(): SchemaDiff {
  return {
    tablesToCreate: [],
    tablesToDrop: [],
    tablesToAlter: [],
    hasBreakingChanges: false,
    warnings: [],
  };
}

describe('generateMigration - CREATE TABLE', () => {
  it('should generate CREATE TABLE with single column', () => {
    const diff: SchemaDiff = {
      ...createEmptyDiff(),
      tablesToCreate: [
        createTable('users', [
          createColumn('name', 'TEXT'),
        ]),
      ],
    };

    const migration = generateMigration(diff, {
      version: '20241207120000',
      description: 'create users table',
    });

    assert.ok(migration.up.includes('CREATE TABLE users'));
    assert.ok(migration.up.includes('name TEXT NOT NULL'));
    assert.ok(migration.down.includes('DROP TABLE users'));
  });

  it('should generate CREATE TABLE with primary key', () => {
    const diff: SchemaDiff = {
      ...createEmptyDiff(),
      tablesToCreate: [
        createTable('users', [
          createColumn('id', 'BIGINT', { isPrimaryKey: true, isAutoIncrement: true }),
          createColumn('name', 'TEXT'),
        ], { primaryKey: ['id'] }),
      ],
    };

    const migration = generateMigration(diff, {
      version: '20241207120000',
      description: 'create users table',
    });

    assert.ok(migration.up.includes('id BIGSERIAL PRIMARY KEY'));
    assert.ok(migration.up.includes('name TEXT NOT NULL'));
  });

  it('should generate CREATE TABLE with composite primary key', () => {
    const diff: SchemaDiff = {
      ...createEmptyDiff(),
      tablesToCreate: [
        createTable('user_roles', [
          createColumn('user_id', 'BIGINT', { isPrimaryKey: true }),
          createColumn('role_id', 'BIGINT', { isPrimaryKey: true }),
          createColumn('granted_at', 'TIMESTAMPTZ'),
        ], { primaryKey: ['user_id', 'role_id'] }),
      ],
    };

    const migration = generateMigration(diff, {
      version: '20241207120000',
      description: 'create user_roles table',
    });

    assert.ok(migration.up.includes('PRIMARY KEY (user_id, role_id)'));
    // Individual columns should NOT have PRIMARY KEY since it's composite
    assert.ok(!migration.up.includes('user_id BIGINT PRIMARY KEY'));
  });

  it('should generate CREATE TABLE with INTEGER auto-increment as SERIAL', () => {
    const diff: SchemaDiff = {
      ...createEmptyDiff(),
      tablesToCreate: [
        createTable('items', [
          createColumn('id', 'INTEGER', { isPrimaryKey: true, isAutoIncrement: true }),
        ], { primaryKey: ['id'] }),
      ],
    };

    const migration = generateMigration(diff, {
      version: '20241207120000',
      description: 'create items table',
    });

    assert.ok(migration.up.includes('id SERIAL PRIMARY KEY'));
  });

  it('should generate CREATE TABLE with nullable column', () => {
    const diff: SchemaDiff = {
      ...createEmptyDiff(),
      tablesToCreate: [
        createTable('users', [
          createColumn('bio', 'TEXT', { nullable: true }),
        ]),
      ],
    };

    const migration = generateMigration(diff, {
      version: '20241207120000',
      description: 'create users table',
    });

    // Nullable columns should NOT have NOT NULL
    assert.ok(migration.up.includes('bio TEXT'));
    assert.ok(!migration.up.includes('bio TEXT NOT NULL'));
  });

  it('should generate CREATE TABLE with default value', () => {
    const diff: SchemaDiff = {
      ...createEmptyDiff(),
      tablesToCreate: [
        createTable('users', [
          createColumn('active', 'BOOLEAN', { defaultValue: 'TRUE' }),
        ]),
      ],
    };

    const migration = generateMigration(diff, {
      version: '20241207120000',
      description: 'create users table',
    });

    assert.ok(migration.up.includes('DEFAULT TRUE'));
  });

  it('should generate CREATE TABLE with UNIQUE constraint', () => {
    const diff: SchemaDiff = {
      ...createEmptyDiff(),
      tablesToCreate: [
        createTable('users', [
          createColumn('email', 'TEXT', { isUnique: true }),
        ]),
      ],
    };

    const migration = generateMigration(diff, {
      version: '20241207120000',
      description: 'create users table',
    });

    assert.ok(migration.up.includes('UNIQUE (email)'));
  });

  it('should generate CREATE TABLE with CHECK constraint', () => {
    const diff: SchemaDiff = {
      ...createEmptyDiff(),
      tablesToCreate: [
        createTable('products', [
          createColumn('price', 'NUMERIC(10,2)'),
        ], {
          checkConstraints: [{ name: 'price_positive', expression: 'price >= 0' }],
        }),
      ],
    };

    const migration = generateMigration(diff, {
      version: '20241207120000',
      description: 'create products table',
    });

    assert.ok(migration.up.includes('CONSTRAINT price_positive CHECK (price >= 0)'));
  });

  it('should generate CREATE TABLE with index', () => {
    const diff: SchemaDiff = {
      ...createEmptyDiff(),
      tablesToCreate: [
        createTable('users', [
          createColumn('name', 'TEXT'),
        ], {
          indexes: [{ name: 'users_name_idx', columns: ['name'], unique: false }],
        }),
      ],
    };

    const migration = generateMigration(diff, {
      version: '20241207120000',
      description: 'create users table',
    });

    assert.ok(migration.up.includes('CREATE INDEX users_name_idx ON users (name)'));
  });

  it('should generate CREATE TABLE with unique index', () => {
    const diff: SchemaDiff = {
      ...createEmptyDiff(),
      tablesToCreate: [
        createTable('users', [
          createColumn('email', 'TEXT'),
        ], {
          indexes: [{ name: 'users_email_idx', columns: ['email'], unique: true }],
        }),
      ],
    };

    const migration = generateMigration(diff, {
      version: '20241207120000',
      description: 'create users table',
    });

    assert.ok(migration.up.includes('CREATE UNIQUE INDEX users_email_idx'));
  });

  it('should generate CREATE TABLE with foreign key', () => {
    const diff: SchemaDiff = {
      ...createEmptyDiff(),
      tablesToCreate: [
        createTable('posts', [
          createColumn('id', 'BIGINT', { isPrimaryKey: true }),
          createColumn('author_id', 'BIGINT'),
        ], {
          primaryKey: ['id'],
          foreignKeys: [{
            name: 'posts_author_fk',
            columns: ['author_id'],
            referencedTable: 'users',
            referencedColumns: ['id'],
            onDelete: 'CASCADE',
            onUpdate: 'NO ACTION',
          }],
        }),
      ],
    };

    const migration = generateMigration(diff, {
      version: '20241207120000',
      description: 'create posts table',
    });

    assert.ok(migration.up.includes('ADD CONSTRAINT posts_author_fk'));
    assert.ok(migration.up.includes('FOREIGN KEY (author_id)'));
    assert.ok(migration.up.includes('REFERENCES users (id)'));
    assert.ok(migration.up.includes('ON DELETE CASCADE'));
  });
});

describe('generateMigration - DROP TABLE', () => {
  it('should generate DROP TABLE', () => {
    const diff: SchemaDiff = {
      ...createEmptyDiff(),
      tablesToDrop: ['old_table'],
      hasBreakingChanges: true,
    };

    const migration = generateMigration(diff, {
      version: '20241207120000',
      description: 'drop old table',
    });

    assert.ok(migration.up.includes('DROP TABLE old_table'));
    assert.ok(migration.hasBreakingChanges);
    // Down migration should indicate it can't restore
    assert.ok(migration.down.includes('Cannot restore dropped table'));
  });
});

describe('generateMigration - ALTER TABLE columns', () => {
  it('should generate ADD COLUMN', () => {
    const diff: SchemaDiff = {
      ...createEmptyDiff(),
      tablesToAlter: [{
        ...createEmptyAlteration('users'),
        columnsToAdd: [createColumn('phone', 'TEXT', { nullable: true })],
      }],
    };

    const migration = generateMigration(diff, {
      version: '20241207120000',
      description: 'add phone column',
    });

    assert.ok(migration.up.includes('ALTER TABLE users ADD COLUMN phone TEXT'));
    assert.ok(migration.down.includes('ALTER TABLE users DROP COLUMN phone'));
  });

  it('should generate ADD COLUMN with NOT NULL', () => {
    const diff: SchemaDiff = {
      ...createEmptyDiff(),
      tablesToAlter: [{
        ...createEmptyAlteration('users'),
        columnsToAdd: [createColumn('phone', 'TEXT')],
      }],
    };

    const migration = generateMigration(diff, {
      version: '20241207120000',
      description: 'add phone column',
    });

    assert.ok(migration.up.includes('phone TEXT NOT NULL'));
  });

  it('should generate DROP COLUMN', () => {
    const diff: SchemaDiff = {
      ...createEmptyDiff(),
      tablesToAlter: [{
        ...createEmptyAlteration('users'),
        columnsToDrop: ['old_column'],
      }],
      hasBreakingChanges: true,
    };

    const migration = generateMigration(diff, {
      version: '20241207120000',
      description: 'drop old column',
    });

    assert.ok(migration.up.includes('ALTER TABLE users DROP COLUMN old_column'));
    assert.ok(migration.down.includes('Cannot restore dropped column'));
  });

  it('should generate RENAME COLUMN', () => {
    const diff: SchemaDiff = {
      ...createEmptyDiff(),
      tablesToAlter: [{
        ...createEmptyAlteration('users'),
        columnsToRename: [{ from: 'user_name', to: 'name' }],
      }],
    };

    const migration = generateMigration(diff, {
      version: '20241207120000',
      description: 'rename column',
    });

    assert.ok(migration.up.includes('RENAME COLUMN user_name TO name'));
    assert.ok(migration.down.includes('RENAME COLUMN name TO user_name'));
  });

  it('should generate ALTER COLUMN TYPE', () => {
    const diff: SchemaDiff = {
      ...createEmptyDiff(),
      tablesToAlter: [{
        ...createEmptyAlteration('users'),
        columnsToAlter: [{
          columnName: 'age',
          typeChange: { from: 'INTEGER', to: 'BIGINT' },
        }],
      }],
      hasBreakingChanges: true,
    };

    const migration = generateMigration(diff, {
      version: '20241207120000',
      description: 'change age type',
    });

    assert.ok(migration.up.includes('ALTER COLUMN age TYPE BIGINT'));
    assert.ok(migration.down.includes('ALTER COLUMN age TYPE INTEGER'));
  });

  it('should generate SET NOT NULL', () => {
    const diff: SchemaDiff = {
      ...createEmptyDiff(),
      tablesToAlter: [{
        ...createEmptyAlteration('users'),
        columnsToAlter: [{
          columnName: 'email',
          nullableChange: { from: true, to: false },
        }],
      }],
    };

    const migration = generateMigration(diff, {
      version: '20241207120000',
      description: 'make email required',
    });

    assert.ok(migration.up.includes('ALTER COLUMN email SET NOT NULL'));
    assert.ok(migration.down.includes('ALTER COLUMN email DROP NOT NULL'));
  });

  it('should generate DROP NOT NULL', () => {
    const diff: SchemaDiff = {
      ...createEmptyDiff(),
      tablesToAlter: [{
        ...createEmptyAlteration('users'),
        columnsToAlter: [{
          columnName: 'bio',
          nullableChange: { from: false, to: true },
        }],
      }],
    };

    const migration = generateMigration(diff, {
      version: '20241207120000',
      description: 'make bio optional',
    });

    assert.ok(migration.up.includes('ALTER COLUMN bio DROP NOT NULL'));
    assert.ok(migration.down.includes('ALTER COLUMN bio SET NOT NULL'));
  });

  it('should generate SET DEFAULT', () => {
    const diff: SchemaDiff = {
      ...createEmptyDiff(),
      tablesToAlter: [{
        ...createEmptyAlteration('users'),
        columnsToAlter: [{
          columnName: 'active',
          defaultChange: { from: undefined, to: 'TRUE' },
        }],
      }],
    };

    const migration = generateMigration(diff, {
      version: '20241207120000',
      description: 'add default to active',
    });

    assert.ok(migration.up.includes('ALTER COLUMN active SET DEFAULT TRUE'));
    assert.ok(migration.down.includes('ALTER COLUMN active DROP DEFAULT'));
  });

  it('should generate DROP DEFAULT', () => {
    const diff: SchemaDiff = {
      ...createEmptyDiff(),
      tablesToAlter: [{
        ...createEmptyAlteration('users'),
        columnsToAlter: [{
          columnName: 'score',
          defaultChange: { from: '0', to: undefined },
        }],
      }],
    };

    const migration = generateMigration(diff, {
      version: '20241207120000',
      description: 'remove default from score',
    });

    assert.ok(migration.up.includes('ALTER COLUMN score DROP DEFAULT'));
    assert.ok(migration.down.includes('ALTER COLUMN score SET DEFAULT 0'));
  });
});

describe('generateMigration - ALTER TABLE indexes', () => {
  it('should generate CREATE INDEX', () => {
    const diff: SchemaDiff = {
      ...createEmptyDiff(),
      tablesToAlter: [{
        ...createEmptyAlteration('users'),
        indexesToCreate: [{ name: 'users_email_idx', columns: ['email'], unique: false }],
      }],
    };

    const migration = generateMigration(diff, {
      version: '20241207120000',
      description: 'add email index',
    });

    assert.ok(migration.up.includes('CREATE INDEX users_email_idx ON users (email)'));
    assert.ok(migration.down.includes('DROP INDEX users_email_idx'));
  });

  it('should generate DROP INDEX', () => {
    const diff: SchemaDiff = {
      ...createEmptyDiff(),
      tablesToAlter: [{
        ...createEmptyAlteration('users'),
        indexesToDrop: ['old_idx'],
      }],
    };

    const migration = generateMigration(diff, {
      version: '20241207120000',
      description: 'drop old index',
    });

    assert.ok(migration.up.includes('DROP INDEX old_idx'));
    assert.ok(migration.down.includes('Cannot restore dropped index'));
  });

  it('should generate index with custom method', () => {
    const diff: SchemaDiff = {
      ...createEmptyDiff(),
      tablesToAlter: [{
        ...createEmptyAlteration('documents'),
        indexesToCreate: [{
          name: 'documents_content_idx',
          columns: ['content'],
          unique: false,
          method: 'gin',
        }],
      }],
    };

    const migration = generateMigration(diff, {
      version: '20241207120000',
      description: 'add gin index',
    });

    assert.ok(migration.up.includes('USING gin'));
  });

  it('should generate partial index with WHERE', () => {
    const diff: SchemaDiff = {
      ...createEmptyDiff(),
      tablesToAlter: [{
        ...createEmptyAlteration('posts'),
        indexesToCreate: [{
          name: 'posts_published_idx',
          columns: ['published_at'],
          unique: false,
          where: 'published = true',
        }],
      }],
    };

    const migration = generateMigration(diff, {
      version: '20241207120000',
      description: 'add partial index',
    });

    assert.ok(migration.up.includes('WHERE published = true'));
  });
});

describe('generateMigration - ALTER TABLE foreign keys', () => {
  it('should generate ADD FOREIGN KEY', () => {
    const diff: SchemaDiff = {
      ...createEmptyDiff(),
      tablesToAlter: [{
        ...createEmptyAlteration('posts'),
        foreignKeysToAdd: [{
          name: 'posts_author_fk',
          columns: ['author_id'],
          referencedTable: 'users',
          referencedColumns: ['id'],
          onDelete: 'SET NULL',
          onUpdate: 'CASCADE',
        }],
      }],
    };

    const migration = generateMigration(diff, {
      version: '20241207120000',
      description: 'add author FK',
    });

    assert.ok(migration.up.includes('ADD CONSTRAINT posts_author_fk'));
    assert.ok(migration.up.includes('FOREIGN KEY (author_id)'));
    assert.ok(migration.up.includes('REFERENCES users (id)'));
    assert.ok(migration.up.includes('ON DELETE SET NULL'));
    assert.ok(migration.up.includes('ON UPDATE CASCADE'));
    assert.ok(migration.down.includes('DROP CONSTRAINT posts_author_fk'));
  });

  it('should generate DROP FOREIGN KEY', () => {
    const diff: SchemaDiff = {
      ...createEmptyDiff(),
      tablesToAlter: [{
        ...createEmptyAlteration('posts'),
        foreignKeysToDrop: ['old_fk'],
      }],
    };

    const migration = generateMigration(diff, {
      version: '20241207120000',
      description: 'drop old FK',
    });

    assert.ok(migration.up.includes('DROP CONSTRAINT old_fk'));
    assert.ok(migration.down.includes('Cannot restore dropped foreign key'));
  });
});

describe('generateMigration - ALTER TABLE check constraints', () => {
  it('should generate ADD CHECK', () => {
    const diff: SchemaDiff = {
      ...createEmptyDiff(),
      tablesToAlter: [{
        ...createEmptyAlteration('products'),
        checksToAdd: [{ name: 'price_positive', expression: 'price >= 0' }],
      }],
    };

    const migration = generateMigration(diff, {
      version: '20241207120000',
      description: 'add price check',
    });

    assert.ok(migration.up.includes('ADD CONSTRAINT price_positive CHECK (price >= 0)'));
    assert.ok(migration.down.includes('DROP CONSTRAINT price_positive'));
  });

  it('should generate DROP CHECK', () => {
    const diff: SchemaDiff = {
      ...createEmptyDiff(),
      tablesToAlter: [{
        ...createEmptyAlteration('products'),
        checksToDrop: ['old_check'],
      }],
    };

    const migration = generateMigration(diff, {
      version: '20241207120000',
      description: 'drop old check',
    });

    assert.ok(migration.up.includes('DROP CONSTRAINT old_check'));
  });
});

describe('generateMigration - options', () => {
  it('should wrap in transaction when wrapInTransaction is true', () => {
    const diff: SchemaDiff = {
      ...createEmptyDiff(),
      tablesToCreate: [
        createTable('users', [createColumn('name', 'TEXT')]),
      ],
    };

    const migration = generateMigration(diff, {
      version: '20241207120000',
      description: 'create users',
      wrapInTransaction: true,
    });

    assert.ok(migration.up.startsWith('BEGIN;'));
    assert.ok(migration.up.endsWith('COMMIT;'));
    assert.ok(migration.down.startsWith('BEGIN;'));
    assert.ok(migration.down.endsWith('COMMIT;'));
  });

  it('should add schema prefix for non-public schema', () => {
    const diff: SchemaDiff = {
      ...createEmptyDiff(),
      tablesToCreate: [
        createTable('users', [createColumn('name', 'TEXT')]),
      ],
    };

    const migration = generateMigration(diff, {
      version: '20241207120000',
      description: 'create users',
      schemaName: 'feature_branch',
    });

    assert.ok(migration.up.includes('feature_branch.users'));
    assert.ok(migration.down.includes('feature_branch.users'));
  });

  it('should not add schema prefix for public schema', () => {
    const diff: SchemaDiff = {
      ...createEmptyDiff(),
      tablesToCreate: [
        createTable('users', [createColumn('name', 'TEXT')]),
      ],
    };

    const migration = generateMigration(diff, {
      version: '20241207120000',
      description: 'create users',
      schemaName: 'public',
    });

    assert.ok(!migration.up.includes('public.users'));
    assert.ok(migration.up.includes('CREATE TABLE users'));
  });
});

describe('generateMigration - edge cases', () => {
  it('should handle empty diff', () => {
    const diff = createEmptyDiff();

    const migration = generateMigration(diff, {
      version: '20241207120000',
      description: 'no changes',
    });

    assert.strictEqual(migration.up, '');
    assert.strictEqual(migration.down, '');
    assert.strictEqual(migration.hasBreakingChanges, false);
  });

  it('should handle multiple tables in one migration', () => {
    const diff: SchemaDiff = {
      ...createEmptyDiff(),
      tablesToCreate: [
        createTable('users', [createColumn('name', 'TEXT')]),
        createTable('posts', [createColumn('title', 'TEXT')]),
      ],
    };

    const migration = generateMigration(diff, {
      version: '20241207120000',
      description: 'create tables',
    });

    assert.ok(migration.up.includes('CREATE TABLE users'));
    assert.ok(migration.up.includes('CREATE TABLE posts'));
    assert.ok(migration.down.includes('DROP TABLE users'));
    assert.ok(migration.down.includes('DROP TABLE posts'));
  });

  it('should escape special characters in identifiers', () => {
    const diff: SchemaDiff = {
      ...createEmptyDiff(),
      tablesToCreate: [
        createTable('user-data', [createColumn('full-name', 'TEXT')]),
      ],
    };

    const migration = generateMigration(diff, {
      version: '20241207120000',
      description: 'create table with special chars',
    });

    // Identifiers with special chars should be quoted
    assert.ok(migration.up.includes('"user-data"'));
    assert.ok(migration.up.includes('"full-name"'));
  });
});

describe('generateMigrationFilename', () => {
  it('should generate filename from version and description', () => {
    const filename = generateMigrationFilename('20241207120000', 'Add user email');
    assert.strictEqual(filename, '20241207120000_add_user_email.sql');
  });

  it('should sanitize special characters in description', () => {
    const filename = generateMigrationFilename('20241207120000', 'Add user\'s email!');
    assert.strictEqual(filename, '20241207120000_add_user_s_email.sql');
  });

  it('should truncate long descriptions', () => {
    const longDesc = 'This is a very long description that should be truncated to avoid issues';
    const filename = generateMigrationFilename('20241207120000', longDesc);
    assert.ok(filename.length <= 70); // version + _ + 50 chars + .sql
  });
});

describe('formatMigrationFile', () => {
  it('should format migration with header comments', () => {
    const migration = {
      version: '20241207120000',
      description: 'Add email column',
      up: 'ALTER TABLE users ADD COLUMN email TEXT;',
      down: 'ALTER TABLE users DROP COLUMN email;',
      hasBreakingChanges: false,
    };

    const content = formatMigrationFile(migration);

    assert.ok(content.includes('-- Migration: Add email column'));
    assert.ok(content.includes('-- Version: 20241207120000'));
    assert.ok(content.includes('-- Generated:'));
    assert.ok(content.includes('-- Up'));
    assert.ok(content.includes('-- Down'));
  });

  it('should include breaking changes warning', () => {
    const migration = {
      version: '20241207120000',
      description: 'Drop old table',
      up: 'DROP TABLE old_table;',
      down: '-- Cannot restore',
      hasBreakingChanges: true,
    };

    const content = formatMigrationFile(migration);

    assert.ok(content.includes('WARNING: This migration contains breaking changes!'));
  });
});
