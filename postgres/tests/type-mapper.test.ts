/**
 * Tests for Propane → PostgreSQL type mapping.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  mapScalarType,
  generateUnionCheckConstraint,
  generateColumnDefinition,
  generateIndexSql,
  postgresTypeToJs,
  type TypeMappingResult,
} from '../src/mapping/type-mapper.js';

describe('mapScalarType', () => {
  it('should map number to DOUBLE PRECISION', () => {
    const result = mapScalarType('number');
    assert.strictEqual(result.sqlType, 'DOUBLE PRECISION');
    assert.strictEqual(result.isJsonb, false);
  });

  it('should map int32 to INTEGER', () => {
    const result = mapScalarType('int32');
    assert.strictEqual(result.sqlType, 'INTEGER');
    assert.strictEqual(result.isJsonb, false);
  });

  it('should map bigint to BIGINT', () => {
    const result = mapScalarType('bigint');
    assert.strictEqual(result.sqlType, 'BIGINT');
    assert.strictEqual(result.isJsonb, false);
  });

  it('should map string to TEXT', () => {
    const result = mapScalarType('string');
    assert.strictEqual(result.sqlType, 'TEXT');
    assert.strictEqual(result.isJsonb, false);
  });

  it('should map boolean to BOOLEAN', () => {
    const result = mapScalarType('boolean');
    assert.strictEqual(result.sqlType, 'BOOLEAN');
    assert.strictEqual(result.isJsonb, false);
  });

  it('should map Date to TIMESTAMPTZ', () => {
    const result = mapScalarType('Date');
    assert.strictEqual(result.sqlType, 'TIMESTAMPTZ');
    assert.strictEqual(result.isJsonb, false);
  });

  it('should map URL to TEXT', () => {
    const result = mapScalarType('URL');
    assert.strictEqual(result.sqlType, 'TEXT');
    assert.strictEqual(result.isJsonb, false);
  });

  it('should map ArrayBuffer to BYTEA', () => {
    const result = mapScalarType('ArrayBuffer');
    assert.strictEqual(result.sqlType, 'BYTEA');
    assert.strictEqual(result.isJsonb, false);
  });

  it('should map decimal with precision and scale to NUMERIC', () => {
    const result = mapScalarType('decimal', { precision: 10, scale: 2 });
    assert.strictEqual(result.sqlType, 'NUMERIC(10,2)');
    assert.strictEqual(result.precision, 10);
    assert.strictEqual(result.scale, 2);
  });

  it('should map decimal with default precision to NUMERIC(38,0)', () => {
    const result = mapScalarType('decimal');
    assert.strictEqual(result.sqlType, 'NUMERIC(38,0)');
  });

  it('should map object to JSONB', () => {
    const result = mapScalarType('object');
    assert.strictEqual(result.sqlType, 'JSONB');
    assert.strictEqual(result.isJsonb, true);
  });

  it('should map array to JSONB', () => {
    const result = mapScalarType('array');
    assert.strictEqual(result.sqlType, 'JSONB');
    assert.strictEqual(result.isJsonb, true);
  });

  it('should map map to JSONB', () => {
    const result = mapScalarType('map');
    assert.strictEqual(result.sqlType, 'JSONB');
    assert.strictEqual(result.isJsonb, true);
  });

  it('should map set to JSONB', () => {
    const result = mapScalarType('set');
    assert.strictEqual(result.sqlType, 'JSONB');
    assert.strictEqual(result.isJsonb, true);
  });

  it('should map union to TEXT', () => {
    const result = mapScalarType('union');
    assert.strictEqual(result.sqlType, 'TEXT');
    assert.strictEqual(result.isJsonb, false);
  });
});

describe('generateUnionCheckConstraint', () => {
  it('should generate CHECK constraint for string literals', () => {
    const result = generateUnionCheckConstraint('status', ['active', 'pending', 'inactive']);
    assert.strictEqual(result, "CHECK (status IN ('active', 'pending', 'inactive'))");
  });

  it('should escape single quotes in literals', () => {
    const result = generateUnionCheckConstraint('status', ["it's", "they're"]);
    assert.strictEqual(result, "CHECK (status IN ('it''s', 'they''re'))");
  });

  it('should handle single literal', () => {
    const result = generateUnionCheckConstraint('type', ['default']);
    assert.strictEqual(result, "CHECK (type IN ('default'))");
  });
});

describe('generateColumnDefinition', () => {
  it('should generate simple column definition', () => {
    const mapping: TypeMappingResult = {
      columnType: { sqlType: 'TEXT', isJsonb: false },
      isPrimaryKey: false,
      isAutoIncrement: false,
      createIndex: false,
      isUnique: false,
      useSeparateTable: false,
      nullable: true,
      scalarType: 'string',
    };
    const result = generateColumnDefinition(mapping, 'name');
    assert.strictEqual(result, 'TEXT');
  });

  it('should add NOT NULL for non-nullable columns', () => {
    const mapping: TypeMappingResult = {
      columnType: { sqlType: 'TEXT', isJsonb: false },
      isPrimaryKey: false,
      isAutoIncrement: false,
      createIndex: false,
      isUnique: false,
      useSeparateTable: false,
      nullable: false,
      scalarType: 'string',
    };
    const result = generateColumnDefinition(mapping, 'name');
    assert.strictEqual(result, 'TEXT NOT NULL');
  });

  it('should add PRIMARY KEY', () => {
    const mapping: TypeMappingResult = {
      columnType: { sqlType: 'BIGINT', isJsonb: false },
      isPrimaryKey: true,
      isAutoIncrement: false,
      createIndex: false,
      isUnique: false,
      useSeparateTable: false,
      nullable: false,
      scalarType: 'bigint',
    };
    const result = generateColumnDefinition(mapping, 'id');
    assert.strictEqual(result, 'BIGINT PRIMARY KEY');
  });

  it('should use SERIAL for auto-increment int', () => {
    const mapping: TypeMappingResult = {
      columnType: { sqlType: 'INTEGER', isJsonb: false },
      isPrimaryKey: true,
      isAutoIncrement: true,
      createIndex: false,
      isUnique: false,
      useSeparateTable: false,
      nullable: false,
      scalarType: 'int32',
    };
    const result = generateColumnDefinition(mapping, 'id');
    assert.strictEqual(result, 'SERIAL PRIMARY KEY');
  });

  it('should use BIGSERIAL for auto-increment bigint', () => {
    const mapping: TypeMappingResult = {
      columnType: { sqlType: 'BIGINT', isJsonb: false },
      isPrimaryKey: true,
      isAutoIncrement: true,
      createIndex: false,
      isUnique: false,
      useSeparateTable: false,
      nullable: false,
      scalarType: 'bigint',
    };
    const result = generateColumnDefinition(mapping, 'id');
    assert.strictEqual(result, 'BIGSERIAL PRIMARY KEY');
  });

  it('should add UNIQUE constraint', () => {
    const mapping: TypeMappingResult = {
      columnType: { sqlType: 'TEXT', isJsonb: false },
      isPrimaryKey: false,
      isAutoIncrement: false,
      createIndex: false,
      isUnique: true,
      useSeparateTable: false,
      nullable: false,
      scalarType: 'string',
    };
    const result = generateColumnDefinition(mapping, 'email');
    assert.strictEqual(result, 'TEXT NOT NULL UNIQUE');
  });
});

describe('generateIndexSql', () => {
  it('should generate index SQL', () => {
    const result = generateIndexSql('users', 'email');
    assert.strictEqual(result, 'CREATE INDEX users_email_idx ON users(email);');
  });

  it('should generate unique index SQL', () => {
    const result = generateIndexSql('users', 'email', true);
    assert.strictEqual(result, 'CREATE UNIQUE INDEX users_email_idx ON users(email);');
  });
});

describe('postgresTypeToJs', () => {
  it('should map TEXT to string', () => {
    assert.strictEqual(postgresTypeToJs('TEXT'), 'string');
  });

  it('should map VARCHAR to string', () => {
    assert.strictEqual(postgresTypeToJs('VARCHAR(255)'), 'string');
  });

  it('should map INTEGER to number', () => {
    assert.strictEqual(postgresTypeToJs('INTEGER'), 'number');
  });

  it('should map BIGINT to bigint', () => {
    assert.strictEqual(postgresTypeToJs('BIGINT'), 'bigint');
  });

  it('should map BIGSERIAL to bigint', () => {
    assert.strictEqual(postgresTypeToJs('BIGSERIAL'), 'bigint');
  });

  it('should map DOUBLE PRECISION to number', () => {
    assert.strictEqual(postgresTypeToJs('DOUBLE PRECISION'), 'number');
  });

  it('should map NUMERIC to string', () => {
    assert.strictEqual(postgresTypeToJs('NUMERIC(10,2)'), 'string');
  });

  it('should map BOOLEAN to boolean', () => {
    assert.strictEqual(postgresTypeToJs('BOOLEAN'), 'boolean');
  });

  it('should map TIMESTAMPTZ to Date', () => {
    assert.strictEqual(postgresTypeToJs('TIMESTAMPTZ'), 'Date');
  });

  it('should map BYTEA to ArrayBuffer', () => {
    assert.strictEqual(postgresTypeToJs('BYTEA'), 'ArrayBuffer');
  });

  it('should map JSONB to object', () => {
    assert.strictEqual(postgresTypeToJs('JSONB'), 'object');
  });
});
