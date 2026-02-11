/**
 * Test utilities for PostgreSQL integration tests.
 */

import { createPool, type Pool } from '../../src/connection/pool.js';

/**
 * Test database configuration.
 */
export interface TestConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}

/**
 * Get test database configuration from environment.
 * Returns null if not configured.
 */
export function getTestConfig(): TestConfig | null {
  const host = process.env['TEST_DB_HOST'];
  const database = process.env['TEST_DB_NAME'];
  const user = process.env['TEST_DB_USER'];

  if (!host || !database || !user) {
    return null;
  }

  const port = process.env['TEST_DB_PORT'];
  const password = process.env['TEST_DB_PASSWORD'];

  return {
    host,
    port: port ? Number.parseInt(port, 10) : 5432,
    database,
    user,
    password: password ?? '',
  };
}

/**
 * Create a test pool. Returns null if not configured.
 */
export function createTestPool(): Pool | null {
  const config = getTestConfig();
  if (!config) return null;
  return createPool(config);
}

/**
 * Generate a unique test schema name.
 */
export function generateTestSchemaName(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 8);
  return `test_${timestamp}_${random}`;
}

/**
 * Setup a test schema with isolation.
 */
export async function setupTestSchema(pool: Pool): Promise<string> {
  const schemaName = generateTestSchemaName();
  await pool.execute(`CREATE SCHEMA ${schemaName}`);
  return schemaName;
}

/**
 * Teardown a test schema.
 */
export async function teardownTestSchema(
  pool: Pool,
  schemaName: string
): Promise<void> {
  await pool.execute(`DROP SCHEMA IF EXISTS ${schemaName} CASCADE`);
}

/**
 * Run a test with an isolated schema.
 * Automatically creates and destroys the schema.
 */
export async function withTestSchema<T>(
  pool: Pool,
  fn: (schemaName: string, schemaPool: Pool) => Promise<T>
): Promise<T> {
  const schemaName = await setupTestSchema(pool);
  const schemaPool = pool.withSchema(schemaName);

  try {
    return await fn(schemaName, schemaPool);
  } finally {
    await teardownTestSchema(pool, schemaName);
  }
}

/**
 * Check if database is available for testing.
 */
export function isDatabaseAvailable(): boolean {
  return getTestConfig() !== null;
}

/**
 * Log skip message for tests when database is not available.
 */
export function logSkipMessage(): void {
  console.log('  (skipped - no test database configured)');
}
