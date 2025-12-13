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
  | 'brand';      // int32, int53, decimal

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
  kind: 'number' | 'bigint' | 'string' | 'array' | 'decimal' | 'unknown';
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
  /** Type parameters (e.g., [precision, scale] for decimal) */
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
 * import { propaneTypes, buildRegistry } from '@propanejs/types';
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
 * import { propaneTypes } from '@propanejs/types';
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
    package: '@propanejs/types',
    name: 'Message',
    category: 'message',
    runtimePackage: '@propanejs/runtime',
  } as MessageRegistration,

  // ============================================
  // Table wrapper
  // ============================================
  {
    package: '@propanejs/types',
    name: 'Table',
    category: 'table',
    runtimePackage: '@propanejs/runtime', // Table extends Message
  } as TableRegistration,

  // ============================================
  // DB wrappers (no runtime code needed)
  // ============================================
  {
    package: '@propanejs/types',
    name: 'Normalize',
    category: 'db-wrapper',
    kind: 'normalize',
  } as DbWrapperRegistration,
  {
    package: '@propanejs/types',
    name: 'Json',
    category: 'db-wrapper',
    kind: 'json',
  } as DbWrapperRegistration,
  {
    package: '@propanejs/types',
    name: 'Index',
    category: 'db-wrapper',
    kind: 'index',
  } as DbWrapperRegistration,
  {
    package: '@propanejs/types',
    name: 'Unique',
    category: 'db-wrapper',
    kind: 'unique',
  } as DbWrapperRegistration,
  {
    package: '@propanejs/types',
    name: 'PrimaryKey',
    category: 'db-wrapper',
    kind: 'primary-key',
  } as DbWrapperRegistration,
  {
    package: '@propanejs/types',
    name: 'Auto',
    category: 'db-wrapper',
    kind: 'auto',
  } as DbWrapperRegistration,
  {
    package: '@propanejs/types',
    name: 'References',
    category: 'db-wrapper',
    kind: 'references',
  } as DbWrapperRegistration,

  // ============================================
  // Branded types
  // ============================================
  // Note: Validator definitions will be added in Phase 1A
  // For now, just register the types without definitions

  // ============================================
  // Validators (definitions added in Phase 1A)
  // ============================================
  // Note: Full ValidatorDefinition implementations will be added in Phase 1A
  // For now, the type wrappers are defined in validators.ts
];
