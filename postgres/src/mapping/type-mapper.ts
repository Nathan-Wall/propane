/**
 * Type mapping from Propane types to PostgreSQL types.
 *
 * Type Mappings:
 *
 * | Propane Type    | PostgreSQL         | JavaScript | Java       | C++                                  | Protocol Buffers           |
 * |-----------------|--------------------|-----------:|------------|--------------------------------------|----------------------------|
 * | number          | DOUBLE PRECISION   | number     | double     | double                               | double                     |
 * | int32           | INTEGER            | number     | int        | int32_t                              | int32                      |
 * | bigint          | BIGINT             | bigint     | long       | int64_t                              | int64                      |
 * | decimal<P,S>    | NUMERIC(P,S)       | string     | BigDecimal | std::string                          | string                     |
 * | string          | TEXT               | string     | String     | std::string                          | string                     |
 * | boolean         | BOOLEAN            | boolean    | boolean    | bool                                 | bool                       |
 * | Date            | TIMESTAMPTZ        | Date       | Instant    | chrono::system_clock::time_point     | google.protobuf.Timestamp  |
 * | URL             | TEXT               | URL        | URI        | std::string                          | string                     |
 * | ArrayBuffer     | BYTEA              | ArrayBuffer| byte[]     | std::vector<uint8_t>                 | bytes                      |
 */

/**
 * PostgreSQL column type.
 */
export interface PostgresColumnType {
  /** The SQL type name (e.g., "TEXT", "INTEGER") */
  sqlType: string;
  /** Whether this type should use JSONB storage */
  isJsonb: boolean;
  /** For NUMERIC types, the precision */
  precision?: number;
  /** For NUMERIC types, the scale */
  scale?: number;
}

/**
 * Result of analyzing a Propane type for PostgreSQL.
 */
export interface TypeMappingResult {
  /** The PostgreSQL column type */
  columnType: PostgresColumnType;
  /** Whether this is a primary key */
  isPrimaryKey: boolean;
  /** Whether this is auto-increment */
  isAutoIncrement: boolean;
  /** Whether to create an index */
  createIndex: boolean;
  /** Whether to add UNIQUE constraint */
  isUnique: boolean;
  /** For arrays, whether to use separate table (vs JSONB) */
  useSeparateTable: boolean;
  /** Whether nullable */
  nullable: boolean;
  /** The underlying scalar type name */
  scalarType: ScalarType;
  /** For arrays, the element type */
  elementType?: TypeMappingResult;
  /** For maps, the key type */
  mapKeyType?: TypeMappingResult;
  /** For maps, the value type */
  mapValueType?: TypeMappingResult;
}

/**
 * Scalar types supported by Propane.
 */
export type ScalarType =
  | 'string'
  | 'number'
  | 'int32'
  | 'bigint'
  | 'decimal'
  | 'boolean'
  | 'Date'
  | 'URL'
  | 'ArrayBuffer'
  | 'null'
  | 'undefined'
  | 'object'    // Nested message
  | 'array'
  | 'map'
  | 'set'
  | 'union';

/**
 * Maps a scalar Propane type to a PostgreSQL type.
 */
export function mapScalarType(scalarType: ScalarType, options?: {
  precision?: number;
  scale?: number;
}): PostgresColumnType {
  switch (scalarType) {
    case 'string':
      return { sqlType: 'TEXT', isJsonb: false };

    case 'number':
      return { sqlType: 'DOUBLE PRECISION', isJsonb: false };

    case 'int32':
      return { sqlType: 'INTEGER', isJsonb: false };

    case 'bigint':
      return { sqlType: 'BIGINT', isJsonb: false };

    case 'decimal':
      return {
        sqlType: `NUMERIC(${options?.precision ?? 38},${options?.scale ?? 0})`,
        isJsonb: false,
        precision: options?.precision,
        scale: options?.scale,
      };

    case 'boolean':
      return { sqlType: 'BOOLEAN', isJsonb: false };

    case 'Date':
      return { sqlType: 'TIMESTAMPTZ', isJsonb: false };

    case 'URL':
      return { sqlType: 'TEXT', isJsonb: false };

    case 'ArrayBuffer':
      return { sqlType: 'BYTEA', isJsonb: false };

    case 'null':
    case 'undefined':
      // These modify nullable, not the type itself
      return { sqlType: 'TEXT', isJsonb: false };

    case 'object':
      // Nested messages are stored as JSONB
      return { sqlType: 'JSONB', isJsonb: true };

    case 'array':
    case 'set':
      // Default to JSONB, but may be overridden to separate table
      return { sqlType: 'JSONB', isJsonb: true };

    case 'map':
      return { sqlType: 'JSONB', isJsonb: true };

    case 'union':
      // Union of literals becomes TEXT with CHECK constraint
      return { sqlType: 'TEXT', isJsonb: false };

    default:
      throw new Error(`Unknown scalar type: ${String(scalarType)}`);
  }
}

/**
 * Generates SQL for a CHECK constraint from a union of string literals.
 */
export function generateUnionCheckConstraint(
  columnName: string,
  literals: string[]
): string {
  const escapedLiterals = literals.map(l => `'${l.replaceAll('\'', "''")}'`);
  return `CHECK (${columnName} IN (${escapedLiterals.join(', ')}))`;
}

/**
 * Generates the full SQL type with constraints for a column.
 */
export function generateColumnDefinition(
  mapping: TypeMappingResult,
  unused_columnName: string
): string {
  const parts: string[] = [];

  // Type
  if (mapping.isAutoIncrement) {
    if (mapping.scalarType === 'bigint') {
      parts.push('BIGSERIAL');
    } else {
      parts.push('SERIAL');
    }
  } else {
    parts.push(mapping.columnType.sqlType);
  }

  // Nullability
  if (!mapping.nullable && !mapping.isPrimaryKey) {
    parts.push('NOT NULL');
  }

  // Primary key
  if (mapping.isPrimaryKey) {
    parts.push('PRIMARY KEY');
  }

  // Unique (if not already a PK)
  if (mapping.isUnique && !mapping.isPrimaryKey) {
    parts.push('UNIQUE');
  }

  return parts.join(' ');
}

/**
 * Generates index creation SQL.
 */
export function generateIndexSql(
  tableName: string,
  columnName: string,
  isUnique = false
): string {
  const indexName = `${tableName}_${columnName}_idx`;
  const uniqueKeyword = isUnique ? 'UNIQUE ' : '';
  return `CREATE ${uniqueKeyword}INDEX ${indexName} ON ${tableName}(${columnName});`;
}

/**
 * Maps PostgreSQL type back to JavaScript type for deserialization.
 */
export function postgresTypeToJs(sqlType: string): string {
  const normalized = sqlType.toUpperCase();

  if (normalized === 'TEXT' || normalized.startsWith('VARCHAR') || normalized.startsWith('CHAR')) {
    return 'string';
  }
  if (normalized === 'INTEGER' || normalized === 'SMALLINT' || normalized === 'SERIAL') {
    return 'number';
  }
  if (normalized === 'BIGINT' || normalized === 'BIGSERIAL') {
    return 'bigint';
  }
  if (normalized === 'DOUBLE PRECISION' || normalized === 'REAL' || normalized === 'FLOAT') {
    return 'number';
  }
  if (normalized.startsWith('NUMERIC') || normalized.startsWith('DECIMAL')) {
    return 'string'; // decimal values come back as strings
  }
  if (normalized === 'BOOLEAN') {
    return 'boolean';
  }
  if (normalized === 'TIMESTAMPTZ' || normalized === 'TIMESTAMP') {
    return 'Date';
  }
  if (normalized === 'BYTEA') {
    return 'ArrayBuffer';
  }
  if (normalized === 'JSONB' || normalized === 'JSON') {
    return 'object';
  }

  return 'unknown';
}
