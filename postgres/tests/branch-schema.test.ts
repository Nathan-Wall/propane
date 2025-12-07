/**
 * Tests for branch schema name conversion.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { SchemaManager } from '../src/branch/schema-manager.js';

// Create a mock connection for testing branchToSchemaName
const mockConnection = {
  execute: () => Promise.resolve([]),
  query: () => Promise.resolve([]),
};

describe('SchemaManager.branchToSchemaName', () => {
  const manager = new SchemaManager(
    mockConnection as unknown as ConstructorParameters<typeof SchemaManager>[0]
  );

  it('should convert simple branch names', () => {
    assert.strictEqual(manager.branchToSchemaName('main'), 'main');
    assert.strictEqual(manager.branchToSchemaName('develop'), 'develop');
    assert.strictEqual(manager.branchToSchemaName('master'), 'master');
  });

  it('should convert branch names with slashes', () => {
    assert.strictEqual(manager.branchToSchemaName('feature/add-auth'), 'feature_add_auth');
    assert.strictEqual(manager.branchToSchemaName('bugfix/fix-login'), 'bugfix_fix_login');
  });

  it('should convert branch names with dashes', () => {
    assert.strictEqual(manager.branchToSchemaName('feature-add-auth'), 'feature_add_auth');
  });

  it('should convert to lowercase', () => {
    assert.strictEqual(manager.branchToSchemaName('Feature/AddAuth'), 'feature_addauth');
    assert.strictEqual(manager.branchToSchemaName('MAIN'), 'main');
  });

  it('should remove leading/trailing underscores', () => {
    assert.strictEqual(manager.branchToSchemaName('/feature/'), 'feature');
    assert.strictEqual(manager.branchToSchemaName('__test__'), 'test');
  });

  it('should collapse multiple underscores', () => {
    assert.strictEqual(manager.branchToSchemaName('feature//add'), 'feature_add');
    assert.strictEqual(manager.branchToSchemaName('feature---add'), 'feature_add');
  });

  it('should handle special characters', () => {
    assert.strictEqual(manager.branchToSchemaName('feature@123'), 'feature_123');
    assert.strictEqual(manager.branchToSchemaName('fix#456'), 'fix_456');
    assert.strictEqual(manager.branchToSchemaName('test.branch'), 'test_branch');
  });

  it('should truncate to 63 characters', () => {
    const longName = 'a'.repeat(100);
    const result = manager.branchToSchemaName(longName);
    assert.strictEqual(result.length, 63);
  });

  it('should handle numeric-only branch names', () => {
    assert.strictEqual(manager.branchToSchemaName('123'), '123');
  });

  it('should handle branch names starting with numbers', () => {
    assert.strictEqual(manager.branchToSchemaName('123-feature'), '123_feature');
  });
});
