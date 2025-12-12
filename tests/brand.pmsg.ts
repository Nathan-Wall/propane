/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/brand.pmsg
/**
 * Test file for Brand auto-namespace transformation.
 *
 * Each Brand<T, B> usage should be transformed to Brand<T, B, typeof _TypeName_brand>
 * with a unique symbol declaration generated for each type.
 */

import type { Brand } from '@propanejs/runtime';

// Simple Brand type (should transform)
declare const _UserId_brand: unique symbol;
export type UserId = Brand<number, 'userId', typeof _UserId_brand>;

// Another simple Brand with same tag (should be distinct type)
declare const _PostId_brand: unique symbol;
export type PostId = Brand<number, 'userId', typeof _PostId_brand>;

// Brand with string base type
declare const _Email_brand: unique symbol;
export type Email = Brand<string, 'email', typeof _Email_brand>;

// Brand in union type
declare const _OptionalId_brand: unique symbol;
export type OptionalId = Brand<number, 'optId', typeof _OptionalId_brand> | null;

// Non-exported Brand type
declare const _InternalId_brand: unique symbol;
type InternalId = Brand<bigint, 'internal', typeof _InternalId_brand>;

// Non-Brand type (should pass through unchanged)
export type RegularType = string | number;

// Type alias without Brand (should pass through)
export type StringAlias = string;
