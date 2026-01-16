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
 * | Decimal<P,S>    | NUMERIC(P,S)       | Decimal    | BigDecimal | std::string                          | string                     |
 * | Rational        | JSONB              | Rational   | BigDecimal | std::string                          | string                     |
 * | string          | TEXT               | string     | String     | std::string                          | string                     |
 * | boolean         | BOOLEAN            | boolean    | boolean    | bool                                 | bool                       |
 * | Date            | TIMESTAMPTZ        | Date       | Instant    | chrono::system_clock::time_point     | google.protobuf.Timestamp  |
 * | URL             | TEXT               | URL        | URI        | std::string                          | string                     |
 * | ArrayBuffer     | BYTEA              | ArrayBuffer| byte[]     | std::vector<uint8_t>                 | bytes                      |
 */

import type { PmtType } from '@/tools/parser/types.js';

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
  | 'rational'
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
    case 'rational':
      return { sqlType: 'JSONB', isJsonb: true };

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
      throw new Error(
        `Unknown scalar type: ${String(scalarType)}. ` +
        `Supported types: string, number, bigint, boolean, int32, decimal, Date, URL, ArrayBuffer, object, array, map, set, union`
      );
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

// ============================================================================
// Union Type Analysis
// ============================================================================

/**
 * Message constructor interface for deserialization.
 */
export interface MessageConstructor {
  $typeName: string;
  deserialize(cereal: string): unknown;
}

/**
 * Result of analyzing a union type for PostgreSQL storage.
 */
export interface UnionAnalysis {
  /** Storage strategy: 'native' for simple types, 'jsonb' for complex unions */
  strategy: 'native' | 'jsonb';
  /** Base scalar type for native strategy */
  baseType?: ScalarType;
  /** Whether the union includes null */
  hasNull: boolean;
  /** Whether the union includes undefined */
  hasUndefined: boolean;
  /** Literal values for CHECK constraint (for literal unions) */
  literalValues?: (string | number)[];
  /** Non-null/undefined union members (for JSONB strategy) */
  unionMembers?: PmtType[];
  /** Whether the union contains message types */
  hasMessages: boolean;
  /** Whether the union contains scalar types (non-message) */
  hasScalars: boolean;
  /** Message constructors mapped by type name (populated at runtime for deserialization) */
  messageClasses?: Map<string, MessageConstructor>;
}

/**
 * Analyzes a union type to determine the PostgreSQL storage strategy.
 *
 * Storage strategies:
 * - Native: Single scalar type with optional null/undefined (but not both)
 * - Native + CHECK: Literal union ('a' | 'b' | 'c')
 * - JSONB: Complex unions requiring type discrimination
 *
 * @param type - The PmtType to analyze
 * @param messageTypeNames - Set of known message type names for discriminating messages from scalars
 * @returns UnionAnalysis with storage strategy and metadata
 */
export function analyzeUnionType(
  type: PmtType,
  messageTypeNames: Set<string>
): UnionAnalysis {
  // Non-union types use native storage
  if (type.kind !== 'union') {
    return {
      strategy: 'native',
      hasNull: false,
      hasUndefined: false,
      hasMessages: false,
      hasScalars: true,
    };
  }

  let hasNull = false;
  let hasUndefined = false;
  const literals: (string | number)[] = [];
  const otherTypes: PmtType[] = [];

  // Categorize union members
  for (const t of type.types) {
    if (t.kind === 'primitive' && t.primitive === 'null') {
      hasNull = true;
    } else if (t.kind === 'primitive' && t.primitive === 'undefined') {
      hasUndefined = true;
    } else if (t.kind === 'literal') {
      literals.push(t.value as string | number);
      otherTypes.push(t);
    } else {
      otherTypes.push(t);
    }
  }

  // Case: T | null | undefined - need JSONB to distinguish null from undefined
  if (hasNull && hasUndefined && otherTypes.length > 0) {
    const { hasMessages, hasScalars } = classifyTypes(otherTypes, messageTypeNames);
    return {
      strategy: 'jsonb',
      hasNull,
      hasUndefined,
      unionMembers: otherTypes,
      hasMessages,
      hasScalars,
    };
  }

  // Case: All literals (possibly + null or undefined, but not both)
  if (literals.length > 0 && otherTypes.every(t => t.kind === 'literal')) {
    const firstLiteral = otherTypes[0];
    const isNumeric = firstLiteral?.kind === 'literal' && typeof firstLiteral.value === 'number';
    return {
      strategy: 'native',
      baseType: isNumeric ? 'int32' : 'string',
      hasNull,
      hasUndefined,
      literalValues: literals,
      hasMessages: false,
      hasScalars: true,
    };
  }

  // Case: Single base type + null/undefined (but not both)
  if (otherTypes.length === 1 && !(hasNull && hasUndefined)) {
    const baseScalar = pmtTypeToScalarType(otherTypes[0]!);
    if (baseScalar !== 'object' && baseScalar !== 'union') {
      return {
        strategy: 'native',
        baseType: baseScalar,
        hasNull,
        hasUndefined,
        hasMessages: false,
        hasScalars: true,
      };
    }
  }

  // Case: Multiple different types - need JSONB
  const { hasMessages, hasScalars } = classifyTypes(otherTypes, messageTypeNames);
  return {
    strategy: 'jsonb',
    hasNull,
    hasUndefined,
    unionMembers: otherTypes,
    hasMessages,
    hasScalars,
  };
}

/**
 * Classifies union member types into messages vs scalars.
 */
function classifyTypes(
  types: PmtType[],
  messageTypeNames: Set<string>
): { hasMessages: boolean; hasScalars: boolean } {
  let hasMessages = false;
  let hasScalars = false;

  for (const t of types) {
    if (t.kind === 'reference' && messageTypeNames.has(t.name)) {
      hasMessages = true;
    } else if (t.kind === 'literal') {
      hasScalars = true;
    } else if (t.kind === 'primitive' && t.primitive !== 'null' && t.primitive !== 'undefined') {
      hasScalars = true;
    } else if (t.kind === 'date' || t.kind === 'url' || t.kind === 'arraybuffer') {
      hasScalars = true;
    } else if (t.kind === 'reference' && !messageTypeNames.has(t.name)) {
      // Non-message reference (e.g., type alias for scalar)
      hasScalars = true;
    }
  }

  return { hasMessages, hasScalars };
}

/**
 * Converts a PmtType to a ScalarType.
 */
export function pmtTypeToScalarType(type: PmtType): ScalarType {
  switch (type.kind) {
    case 'primitive':
      switch (type.primitive) {
        case 'string': return 'string';
        case 'number': return 'number';
        case 'boolean': return 'boolean';
        case 'bigint': return 'bigint';
        case 'null': return 'null';
        case 'undefined': return 'undefined';
      }
      break;
    case 'date': return 'Date';
    case 'url': return 'URL';
    case 'arraybuffer': return 'ArrayBuffer';
    case 'array': return 'array';
    case 'map': return 'map';
    case 'set': return 'set';
    case 'union': return 'union';
    case 'literal':
      return typeof type.value === 'number' ? 'int32' : 'string';
    case 'reference':
      // References to other types - could be message or scalar alias
      // For now, treat as object (message)
      return 'object';
  }
  return 'object';
}

/**
 * Extracts the type name from a tagged cereal string.
 * Format: ":$TypeName{...}" -> "TypeName"
 */
export function extractTypeName(taggedCereal: string): string {
  const match = /^:\$([^{]+)/.exec(taggedCereal);
  if (!match) {
    throw new Error(`Invalid tagged cereal format: ${taggedCereal}`);
  }
  return match[1]!;
}
