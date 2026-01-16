/**
 * Type registry for compiler configuration.
 *
 * The registry tells the Babel plugin and schema generator how to handle
 * different types imported in .pmsg files.
 */

/** Categories of special types the compiler needs to recognize */
export type TypeCategory =
  | 'validator'   // Positive, Range, NonEmpty, Check, etc.
  | 'db-wrapper'  // Normalize, Json, Index, Unique, PrimaryKey, Auto, References
  | 'message'     // Message<T>
  | 'table'       // Table<T>
  | 'brand';      // int32, int53

/** Base registration for all types */
export interface TypeRegistration {
  /** Package that exports this type (where users import from) */
  package: string;
  /** Export name */
  name: string;
  /** What category of type this is */
  category: TypeCategory;
  /** Package where runtime code lives (for generated imports) */
  runtimePackage?: string;
}

/** Validator-specific registration */
export interface ValidatorRegistration extends TypeRegistration {
  category: 'validator';
  /** ValidatorDefinition for code generation */
  definition: ValidatorDefinition;
}

/** DB wrapper registration */
export interface DbWrapperRegistration extends TypeRegistration {
  category: 'db-wrapper';
  /** Which DB wrapper this is */
  kind:
    | 'normalize'
    | 'json'
    | 'index'
    | 'unique'
    | 'primary-key'
    | 'auto'
    | 'references';
}

/** Message wrapper registration */
export interface MessageRegistration extends TypeRegistration {
  category: 'message';
}

/** Table wrapper registration */
export interface TableRegistration extends TypeRegistration {
  category: 'table';
}

/** Branded type registration */
export interface BrandRegistration extends TypeRegistration {
  category: 'brand';
  /** Definition for SQL type mapping and optional validation */
  definition: BrandDefinition;
}

/** Union of all registration types */
export type AnyTypeRegistration =
  | ValidatorRegistration
  | DbWrapperRegistration
  | MessageRegistration
  | TableRegistration
  | BrandRegistration;

/** Registry key: (package, name) tuple */
export type RegistryKey = `${string}:${string}`;

// ============================================
// Validator Definition
// ============================================

/** Context for generating JS validation code */
export interface JsGeneratorContext {
  /** Expression representing the value to validate */
  valueExpr: string;
  /** Information about the value's type */
  type: TypeInfo;
  /** Type parameters passed to the validator */
  params: unknown[];
  /** Import collector for runtime dependencies */
  imports: ImportCollector;
}

/** Context for generating SQL CHECK expressions */
export interface SqlGeneratorContext {
  /** Column name in the database */
  columnName: string;
  /** Type parameters passed to the validator */
  params: unknown[];
}

/** Context for generating error messages */
export interface MessageGeneratorContext {
  /** Type parameters passed to the validator */
  params: unknown[];
  /** Custom message override (from ErrorMessage wrapper) */
  customMessage?: string;
}

/** Information about a value's type */
export interface TypeInfo {
  kind: 'number' | 'bigint' | 'string' | 'array' | 'Decimal' | 'Rational' | 'unknown';
  /** For Decimal types: precision (total digits) */
  precision?: number;
  /** For Decimal types: scale (digits after decimal point) */
  scale?: number;
}

/** Collects imports needed by generated code */
export interface ImportCollector {
  add(name: string, from: string): void;
}

/**
 * Definition for a built-in validator.
 *
 * Used by the compiler to generate validation code for both
 * JavaScript runtime and SQL CHECK constraints.
 */
export interface ValidatorDefinition {
  /** Validator name (for error messages) */
  name: string;

  /**
   * Generate JavaScript validation condition.
   *
   * @returns Object with `condition` expression string, or null if no validation needed.
   *
   * @example
   * // For Positive<number>:
   * generateJs({ valueExpr: 'value', type: { kind: 'number' }, ... })
   * // Returns: { condition: 'value > 0' }
   */
  generateJs(context: JsGeneratorContext): { condition: string } | null;

  /**
   * Generate SQL CHECK expression.
   *
   * @returns SQL expression string, or null if no CHECK constraint needed.
   *
   * @example
   * // For Positive<number>:
   * generateSql({ columnName: 'price', ... })
   * // Returns: 'price > 0'
   */
  generateSql?(context: SqlGeneratorContext): string | null;

  /**
   * Generate error message for validation failure.
   *
   * @example
   * // For Range<number, 0, 100>:
   * generateMessage({ params: [0, 100], ... })
   * // Returns: 'must be between 0 and 100'
   */
  generateMessage(context: MessageGeneratorContext): string;

  /**
   * Generate stable error code for ValidationError.
   *
   * Enables frontend code to switch on error codes instead of
   * string-matching on human-readable messages.
   *
   * @returns Uppercase error code string (e.g., 'POSITIVE', 'RANGE')
   */
  generateCode?(): string;
}

// ============================================
// Brand Definition
// ============================================

/** Context for generating branded type SQL */
export interface BrandSqlContext {
  /** Column name in the database */
  columnName: string;
  /** Type parameters (e.g., [precision, scale] for Decimal) */
  params: unknown[];
}

/** Context for generating branded type JS validation */
export interface BrandJsContext {
  /** Expression representing the value to validate */
  valueExpr: string;
  /** Type parameters */
  params: unknown[];
  /** Import collector for runtime dependencies */
  imports: ImportCollector;
}

/**
 * Definition for a branded type.
 *
 * Branded types map to specific SQL types and may include validation.
 */
export interface BrandDefinition {
  /**
   * Generate SQL type (e.g., "INTEGER", "NUMERIC(5,2)").
   */
  sqlType(params: unknown[]): string;

  /**
   * Generate JS validation condition, or null if no validation needed.
   */
  generateJs?(context: BrandJsContext): { condition: string } | null;

  /**
   * Generate SQL CHECK constraint, or null if none needed.
   */
  generateSql?(context: BrandSqlContext): string | null;

  /**
   * Generate error message for validation failure.
   */
  generateMessage?(context: { params: unknown[] }): string;

  /**
   * Generate error code for validation failure (e.g., 'INT32', 'DECIMAL').
   * Defaults to brand name uppercased if not provided.
   */
  generateCode?(): string;
}

// ============================================
// Type Registry
// ============================================

/** The unified registry */
export interface TypeRegistry {
  /** All registered types, keyed by "package:name" */
  types: Map<RegistryKey, AnyTypeRegistration>;

  /** Look up a type by package and name */
  get(packageName: string, exportName: string): AnyTypeRegistration | undefined;

  /** Check if a type is registered */
  has(packageName: string, exportName: string): boolean;

  /** Get all types of a specific category */
  getByCategory(category: TypeCategory): AnyTypeRegistration[];
}

/** Options for building the registry */
export interface BuildRegistryOptions {
  /** Keys that are allowed to be overwritten (for intentional replacement) */
  allowOverrides?: RegistryKey[];
}

/**
 * Build a TypeRegistry from registration arrays.
 *
 * @param registrations - Arrays of type registrations to merge
 * @param options - Optional configuration
 * @returns Unified TypeRegistry
 *
 * @example
 * ```typescript
 * import { propaneTypes, buildRegistry } from '@propane/types';
 *
 * const registry = buildRegistry([propaneTypes]);
 * ```
 */
export function buildRegistry(
  registrations: AnyTypeRegistration[][],
  options: BuildRegistryOptions = {},
): TypeRegistry {
  const types = new Map<RegistryKey, AnyTypeRegistration>();
  const allowOverrides = new Set(options.allowOverrides ?? []);

  for (const group of registrations) {
    for (const reg of group) {
      const key: RegistryKey = `${reg.package}:${reg.name}`;

      if (types.has(key) && !allowOverrides.has(key)) {
        const existing = types.get(key)!;
        throw new Error(
          `Duplicate registration for '${reg.name}' from '${reg.package}'.\n` +
            `  First registered as: ${existing.category}\n` +
            `  Duplicate registered as: ${reg.category}\n` +
            `To intentionally override, add '${key}' to allowOverrides.`,
        );
      }

      types.set(key, reg);
    }
  }

  return {
    types,
    get(pkg: string, name: string) {
      return types.get(`${pkg}:${name}`);
    },
    has(pkg: string, name: string) {
      return types.has(`${pkg}:${name}`);
    },
    getByCategory(category: TypeCategory) {
      return [...types.values()].filter((r) => r.category === category);
    },
  };
}

// ============================================
// Validator Definitions Import
// ============================================

import {
  PositiveDefinition,
  NegativeDefinition,
  NonNegativeDefinition,
  NonPositiveDefinition,
  MinDefinition,
  MaxDefinition,
  GreaterThanDefinition,
  LessThanDefinition,
  RangeDefinition,
  NonEmptyDefinition,
  MinLengthDefinition,
  MaxLengthDefinition,
  LengthDefinition,
  MinCharLengthDefinition,
  MaxCharLengthDefinition,
  CharLengthDefinition,
} from './validator-definitions/index.js';

// ============================================
// Built-in Registrations
// ============================================

/**
 * All built-in Propane type registrations.
 *
 * Import this in your propane.config.ts to register all standard types.
 *
 * @example
 * ```typescript
 * // propane.config.ts
 * import { propaneTypes } from '@propane/types';
 *
 * export default {
 *   types: [propaneTypes],
 * };
 * ```
 */
export const propaneTypes: AnyTypeRegistration[] = [
  // ============================================
  // Message wrapper
  // ============================================
  {
    package: '@propane/types',
    name: 'Message',
    category: 'message',
    runtimePackage: '@propane/runtime',
  } as MessageRegistration,

  // ============================================
  // Table wrapper
  // ============================================
  {
    package: '@propane/types',
    name: 'Table',
    category: 'table',
    runtimePackage: '@propane/runtime', // Table extends Message
  } as TableRegistration,

  // ============================================
  // DB wrappers (no runtime code needed)
  // ============================================
  {
    package: '@propane/types',
    name: 'Normalize',
    category: 'db-wrapper',
    kind: 'normalize',
  } as DbWrapperRegistration,
  {
    package: '@propane/types',
    name: 'Json',
    category: 'db-wrapper',
    kind: 'json',
  } as DbWrapperRegistration,
  {
    package: '@propane/types',
    name: 'Index',
    category: 'db-wrapper',
    kind: 'index',
  } as DbWrapperRegistration,
  {
    package: '@propane/types',
    name: 'Unique',
    category: 'db-wrapper',
    kind: 'unique',
  } as DbWrapperRegistration,
  {
    package: '@propane/types',
    name: 'PrimaryKey',
    category: 'db-wrapper',
    kind: 'primary-key',
  } as DbWrapperRegistration,
  {
    package: '@propane/types',
    name: 'Auto',
    category: 'db-wrapper',
    kind: 'auto',
  } as DbWrapperRegistration,
  {
    package: '@propane/types',
    name: 'References',
    category: 'db-wrapper',
    kind: 'references',
  } as DbWrapperRegistration,

  // ============================================
  // Branded types
  // ============================================
  {
    package: '@propane/types',
    name: 'int32',
    category: 'brand',
    runtimePackage: '@propane/runtime',
    definition: {
      sqlType: () => 'INTEGER',
      generateJs({ valueExpr, imports }) {
        imports.add('isInt32', '@propane/runtime');
        return { condition: `isInt32(${valueExpr})` };
      },
      generateSql({ columnName }) {
        return `${columnName} >= -2147483648 AND ${columnName} <= 2147483647`;
      },
      generateMessage: () => 'must be a 32-bit integer',
    },
  } as BrandRegistration,
  {
    package: '@propane/types',
    name: 'int53',
    category: 'brand',
    runtimePackage: '@propane/runtime',
    definition: {
      sqlType: () => 'BIGINT',
      generateJs({ valueExpr, imports }) {
        imports.add('isInt53', '@propane/runtime');
        return { condition: `isInt53(${valueExpr})` };
      },
      generateSql({ columnName }) {
        return `${columnName} >= -9007199254740991 AND ${columnName} <= 9007199254740991`;
      },
      generateMessage: () => 'must be a safe integer (int53)',
    },
  } as BrandRegistration,
  {
    package: '@propane/types',
    name: 'Decimal',
    category: 'brand',
    runtimePackage: '@propane/runtime',
    definition: {
      sqlType([precision, scale]) {
        return `NUMERIC(${precision},${scale})`;
      },
      generateJs({ valueExpr, params, imports }) {
        imports.add('isDecimalOf', '@propane/runtime');
        const [precision, scale] = params as [number, number];
        return { condition: `isDecimalOf(${valueExpr}, ${precision}, ${scale})` };
      },
      generateMessage({ params }) {
        const [precision, scale] = params as [number, number];
        return `must be a valid Decimal(${precision},${scale})`;
      },
      generateCode() {
        return 'DECIMAL';
      },
    },
  } as BrandRegistration,
  {
    package: '@propane/types',
    name: 'Rational',
    category: 'brand',
    runtimePackage: '@propane/runtime',
    definition: {
      sqlType() {
        return 'JSONB';
      },
      generateJs({ valueExpr, imports }) {
        imports.add('isRational', '@propane/runtime');
        return { condition: `isRational(${valueExpr})` };
      },
      generateMessage() {
        return 'must be a valid Rational';
      },
      generateCode() {
        return 'RATIONAL';
      },
    },
  } as BrandRegistration,

  // ============================================
  // Validators
  // ============================================

  // Numeric sign validators
  {
    package: '@propane/types',
    name: 'Positive',
    category: 'validator',
    runtimePackage: '@propane/runtime',
    definition: PositiveDefinition,
  } as ValidatorRegistration,
  {
    package: '@propane/types',
    name: 'Negative',
    category: 'validator',
    runtimePackage: '@propane/runtime',
    definition: NegativeDefinition,
  } as ValidatorRegistration,
  {
    package: '@propane/types',
    name: 'NonNegative',
    category: 'validator',
    runtimePackage: '@propane/runtime',
    definition: NonNegativeDefinition,
  } as ValidatorRegistration,
  {
    package: '@propane/types',
    name: 'NonPositive',
    category: 'validator',
    runtimePackage: '@propane/runtime',
    definition: NonPositiveDefinition,
  } as ValidatorRegistration,

  // Numeric bound validators
  {
    package: '@propane/types',
    name: 'Min',
    category: 'validator',
    runtimePackage: '@propane/runtime',
    definition: MinDefinition,
  } as ValidatorRegistration,
  {
    package: '@propane/types',
    name: 'Max',
    category: 'validator',
    runtimePackage: '@propane/runtime',
    definition: MaxDefinition,
  } as ValidatorRegistration,
  {
    package: '@propane/types',
    name: 'GreaterThan',
    category: 'validator',
    runtimePackage: '@propane/runtime',
    definition: GreaterThanDefinition,
  } as ValidatorRegistration,
  {
    package: '@propane/types',
    name: 'LessThan',
    category: 'validator',
    runtimePackage: '@propane/runtime',
    definition: LessThanDefinition,
  } as ValidatorRegistration,
  {
    package: '@propane/types',
    name: 'Range',
    category: 'validator',
    runtimePackage: '@propane/runtime',
    definition: RangeDefinition,
  } as ValidatorRegistration,

  // Length validators (string/array)
  {
    package: '@propane/types',
    name: 'NonEmpty',
    category: 'validator',
    definition: NonEmptyDefinition,
  } as ValidatorRegistration,
  {
    package: '@propane/types',
    name: 'MinLength',
    category: 'validator',
    definition: MinLengthDefinition,
  } as ValidatorRegistration,
  {
    package: '@propane/types',
    name: 'MaxLength',
    category: 'validator',
    definition: MaxLengthDefinition,
  } as ValidatorRegistration,
  {
    package: '@propane/types',
    name: 'Length',
    category: 'validator',
    definition: LengthDefinition,
  } as ValidatorRegistration,

  // Character length validators (Unicode-aware)
  {
    package: '@propane/types',
    name: 'MinCharLength',
    category: 'validator',
    runtimePackage: '@propane/runtime',
    definition: MinCharLengthDefinition,
  } as ValidatorRegistration,
  {
    package: '@propane/types',
    name: 'MaxCharLength',
    category: 'validator',
    runtimePackage: '@propane/runtime',
    definition: MaxCharLengthDefinition,
  } as ValidatorRegistration,
  {
    package: '@propane/types',
    name: 'CharLength',
    category: 'validator',
    runtimePackage: '@propane/runtime',
    definition: CharLengthDefinition,
  } as ValidatorRegistration,

  // Custom validator (Phase 2 - stub for now)
  {
    package: '@propane/types',
    name: 'Check',
    category: 'validator',
    definition: {
      name: 'Check',
      generateJs() {
        // Phase 2 will implement custom validator support
        return null;
      },
      generateMessage() {
        return 'custom validation failed';
      },
      generateCode() {
        return 'CHECK';
      },
    },
  } as ValidatorRegistration,
];
