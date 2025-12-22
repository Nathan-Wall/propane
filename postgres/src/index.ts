/**
 * @propane/postgres - PostgreSQL storage for Propane messages
 *
 * Provides database storage, migrations, and TypeScript APIs for
 * working with Propane messages in PostgreSQL.
 */

// Re-export scalar types from runtime for convenience
export { int32, decimal, toInt32, toDecimal } from '@/runtime/common/numbers/scalars.js';

// Export database wrapper types
export {
  Table,
  PrimaryKey,
  Auto,
  Index,
  Unique,
  Normalize,
  Json,
  References,
  type WrapperTypeInfo,
} from './types.js';

// Export connection utilities
export * from './connection/connection.js';
export * from './connection/pool.js';
export * from './connection/transaction.js';

// Export schema types
export * from './schema/types.js';
export * from './schema/builder.js';

// Export migration utilities
export * from './migration/differ.js';
export * from './migration/generator.js';
export * from './migration/runner.js';
export * from './migration/history.js';
export * from './migration/introspector.js';
export * from './migration/union-migration.js';

// Export repository pattern
export * from './repository/base-repository.js';
export * from './repository/where-builder.js';

// Export branch management
export * from './branch/schema-manager.js';

// Export type mapping
export * from './mapping/type-mapper.js';
export * from './mapping/serializer.js';

// Export code generation
export * from './codegen/schema-generator.js';
export * from './codegen/repository-generator.js';
export * from './codegen/relation-discovery.js';
