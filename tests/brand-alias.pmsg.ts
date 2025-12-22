/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/brand-alias.pmsg
/**
 * Test Brand transformation with aliased imports.
 */

import type { Brand as B } from '@propane/runtime';

// Should transform even with aliased Brand import
declare const _AliasedId_brand: unique symbol;
export type AliasedId = B<number, 'aliased', typeof _AliasedId_brand>;

// Multiple Brand usages with alias
declare const _AnotherAliased_brand: unique symbol;
export type AnotherAliased = B<string, 'another', typeof _AnotherAliased_brand>;
