import { describe, it } from 'node:test';
import assert from 'node:assert';
import path from 'node:path';
import fs from 'node:fs/promises';
import type { UserId, PostId, Email, Decimal, OptionalId } from './brand.pmsg.js';

describe('Brand auto-namespace transformation', () => {
  describe('type distinctness', () => {
    it('UserId and PostId should be distinct types even with same tag', () => {
      // This is a compile-time test - if it compiles, the types are working
      // At runtime, they're just numbers, but TypeScript enforces the difference
      const userId: UserId = 1 as UserId;
      const postId: PostId = 1 as PostId;

      // Both have same underlying value
      assert.strictEqual(userId as unknown as number, 1);
      assert.strictEqual(postId as unknown as number, 1);

      // TypeScript should prevent: const wrong: UserId = postId;
      // The following line would cause a compile error if uncommented:
      // const wrong: UserId = postId; // Error: Type 'PostId' is not assignable to type 'UserId'
    });

    it('Email should be a distinct branded string type', () => {
      const email: Email = 'test@example.com' as Email;
      assert.strictEqual(email as unknown as string, 'test@example.com');
    });

    it('Decimal should preserve intersection properties in type', () => {
      // Decimal is Brand<string, 'decimal', ...> & { __precision: number }
      const decimal: Decimal = { __precision: 2 } as unknown as Decimal;
      assert.strictEqual((decimal as { __precision: number }).__precision, 2);
    });

    it('OptionalId should allow null', () => {
      const presentId: OptionalId = 42 as OptionalId;
      const absentId: OptionalId = null;

      assert.strictEqual(presentId as unknown as number, 42);
      assert.strictEqual(absentId, null);
    });
  });

  describe('transformation verification', () => {
    it('should generate unique symbols for each Brand type', async () => {
      // Read the generated .pmsg.ts file to verify symbols
      const fileUrl = new URL(import.meta.url);
      const testDir = path.dirname(fileUrl.pathname);
      const pmsgPath = path.join(testDir, '..', '..', 'tests', 'brand.pmsg.ts');

      const content = await fs.readFile(pmsgPath, 'utf8');

      // Verify each type has its own unique symbol
      assert.ok(
        content.includes('declare const _UserId_brand: unique symbol'),
        'Should generate _UserId_brand symbol'
      );
      assert.ok(
        content.includes('declare const _PostId_brand: unique symbol'),
        'Should generate _PostId_brand symbol'
      );
      assert.ok(
        content.includes('declare const _Email_brand: unique symbol'),
        'Should generate _Email_brand symbol'
      );
      assert.ok(
        content.includes('declare const _Decimal_brand: unique symbol'),
        'Should generate _Decimal_brand symbol'
      );
      assert.ok(
        content.includes('declare const _OptionalId_brand: unique symbol'),
        'Should generate _OptionalId_brand symbol'
      );
      assert.ok(
        content.includes('declare const _InternalId_brand: unique symbol'),
        'Should generate _InternalId_brand symbol'
      );

      // Verify Brand types include the symbol reference
      assert.ok(
        content.includes("Brand<number, 'userId', typeof _UserId_brand>"),
        'UserId should reference its symbol'
      );
      assert.ok(
        content.includes("Brand<number, 'userId', typeof _PostId_brand>"),
        'PostId should reference its symbol'
      );
    });

    it('should not transform non-Brand types', async () => {
      // Read the generated .pmsg.ts file to verify symbols
      const fileUrl = new URL(import.meta.url);
      const testDir = path.dirname(fileUrl.pathname);
      const pmsgPath = path.join(testDir, '..', '..', 'tests', 'brand.pmsg.ts');

      const content = await fs.readFile(pmsgPath, 'utf8');

      // Verify non-Brand types are unchanged
      assert.ok(
        content.includes('export type RegularType = string | number'),
        'RegularType should be unchanged'
      );
      assert.ok(
        content.includes('export type StringAlias = string'),
        'StringAlias should be unchanged'
      );
    });
  });
});
