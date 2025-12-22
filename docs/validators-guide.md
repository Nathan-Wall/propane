# Validators Guide

This guide covers how to use validators in Propane to enforce data constraints at both the JavaScript runtime and database level.

## Overview

Propane validators ensure your data meets constraints at two levels:

1. **JavaScript runtime** - Validation runs during construction and updates
2. **PostgreSQL CHECK constraints** - Generated SQL enforces the same rules in the database

This dual validation prevents invalid data from entering your system, whether through application code or direct database access.

## Quick Start

```typescript
// models/product.pmsg
import { Table, PrimaryKey, Auto } from '@propane/postgres';
import { Positive, Range, NonEmpty, MinLength } from '@propane/validate';

export type Product = Table<{
  '1:id': PrimaryKey<Auto<bigint>>;
  '2:price': Positive<number>;           // price > 0
  '3:discount': Range<number, 0, 100>;   // 0 <= discount <= 100
  '4:name': NonEmpty<string>;            // name.length > 0
  '5:sku': MinLength<string, 3>;         // sku.length >= 3
}>;
```

This generates:

```sql
CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  price DOUBLE PRECISION NOT NULL CHECK (price > 0),
  discount DOUBLE PRECISION NOT NULL CHECK (discount >= 0 AND discount <= 100),
  name TEXT NOT NULL CHECK (char_length(name) > 0),
  sku TEXT NOT NULL CHECK (char_length(sku) >= 3)
);
```

## Built-in Validators

### Numeric Validators

| Validator | Constraint | Example |
|-----------|------------|---------|
| `Positive<T>` | value > 0 | `Positive<number>` |
| `Negative<T>` | value < 0 | `Negative<number>` |
| `NonNegative<T>` | value >= 0 | `NonNegative<number>` |
| `NonPositive<T>` | value <= 0 | `NonPositive<number>` |
| `Min<T, N>` | value >= N | `Min<number, 0>` |
| `Max<T, N>` | value <= N | `Max<number, 100>` |
| `Range<T, Min, Max>` | Min <= value <= Max | `Range<number, 1, 5>` |
| `GreaterThan<T, N>` | value > N | `GreaterThan<number, 0>` |
| `LessThan<T, N>` | value < N | `LessThan<number, 100>` |

Numeric validators work with `number`, `bigint`, `int32`, `int53`, and `decimal<P,S>`.

### String Validators

| Validator | Constraint | Example |
|-----------|------------|---------|
| `NonEmpty<T>` | length > 0 | `NonEmpty<string>` |
| `MinLength<T, N>` | length >= N | `MinLength<string, 3>` |
| `MaxLength<T, N>` | length <= N | `MaxLength<string, 100>` |
| `Length<T, Min, Max>` | Min <= length <= Max | `Length<string, 3, 50>` |

### Unicode-Aware String Validators

For strings with multi-byte characters (emoji, CJK, etc.), use `CharLength` variants:

| Validator | Constraint | Example |
|-----------|------------|---------|
| `MinCharLength<T, N>` | code points >= N | `MinCharLength<string, 1>` |
| `MaxCharLength<T, N>` | code points <= N | `MaxCharLength<string, 280>` |
| `CharLength<T, Min, Max>` | Min <= code points <= Max | `CharLength<string, 1, 280>` |

```typescript
// "Hello" has 5 characters (5 code points)
// "Hello 👋" has 7 characters but 8 bytes in UTF-8

'1:bio': MaxCharLength<string, 280>;  // Twitter-style limit
```

### Collection Validators

`NonEmpty` and length validators also work with arrays, Sets, and Maps:

```typescript
'1:tags': NonEmpty<string[]>;              // tags.length > 0
'2:categories': MinLength<string[], 1>;    // at least 1 category
'3:metadata': MaxLength<Map<string, string>, 10>;  // at most 10 entries
```

**Note:** For `Table` types, Set and Map validators only run at JS runtime (no SQL CHECK). Arrays stored as JSONB get `jsonb_array_length()` checks.

## Custom Validators

For complex validation logic, define a custom validator:

```typescript
import { Check, Validator } from '@propane/validate';

// Define the validator
const validSku: Validator<string> = (v) => v.length >= 3 && v.length <= 20;

// Use it with Check<T, typeof validator>
export type Product = Table<{
  '1:sku': Check<string, typeof validSku>;
}>;
```

### Supported Operations (Table Types)

Custom validators for `Table` types must transpile to SQL. Only these operations are allowed:

**Always allowed:**
- Comparisons: `>`, `<`, `>=`, `<=`, `===`, `!==`
- Logical: `&&`, `||`, `!`
- Arithmetic: `+`, `-`, `*`, `/`, `%`
- Literals: numbers, strings, booleans
- Property access: `.length`

**Not allowed:**
- Function calls (except built-in methods like `.includes()`)
- External variables or imports
- `==`, `!=` (loose equality)
- Block bodies `{ return ... }`

For `Message` types, there are no restrictions - any synchronous JavaScript works.

## Custom Error Messages

Add a custom error message as the last type parameter:

```typescript
// Built-in validators
'1:price': Positive<number, 'Price must be greater than zero'>;
'2:discount': Range<number, 0, 100, 'Discount must be a percentage (0-100)'>;

// Custom validators
'3:sku': Check<string, typeof validSku, 'SKU must be 3-20 characters'>;
```

## Branded Numeric Types

Use `int32` and `int53` when you need integer validation:

```typescript
import { int32, int53 } from '@propane/runtime';

export type Counter = Table<{
  '1:count': Positive<int32>;   // Integer in range -2^31 to 2^31-1, must be > 0
  '2:bigCount': Positive<int53>; // Safe JS integer, must be > 0
}>;
```

Branded types validate during construction:
- `int32`: Must be an integer in the 32-bit signed range
- `int53`: Must be an integer within `Number.MIN_SAFE_INTEGER` to `Number.MAX_SAFE_INTEGER`

The validator runs after the branded type check:

```typescript
// For Positive<int32>:
// 1. First checks: is it an integer in int32 range?
// 2. Then checks: is it > 0?

new Counter({ count: 1.5 });  // Error: int32 value must be an integer
new Counter({ count: -5 });   // Error: count must be positive
new Counter({ count: 5 });    // OK
```

## Validation Timing

Validation runs automatically at these points:

1. **Construction** - When creating a new instance
2. **Individual setters** - When calling `setField(value)`
3. **Batch updates** - When calling `set({ field: value })`

```typescript
// All of these validate:
const product = new Product({ price: 10, discount: 5 });
product.setPrice(20);
product.set({ price: 30, discount: 10 });
```

## Union Types (Enums)

String literal unions automatically generate CHECK constraints:

```typescript
export type Order = Table<{
  '1:status': 'pending' | 'shipped' | 'delivered';
}>;
```

Generates:

```sql
status TEXT NOT NULL CHECK (status IN ('pending', 'shipped', 'delivered'))
```

## Message Types

Validators work with `Message` types too, just without SQL generation:

```typescript
import { Message } from '@propane/runtime';
import { Positive, NonEmpty } from '@propane/validate';

export type OrderItem = Message<{
  '1:quantity': Positive<number>;
  '2:name': NonEmpty<string>;
}>;
```

## Composition Rules

1. **One validator per field** - You cannot nest validators
2. **DB wrappers go outside** - `PrimaryKey`, `Index`, `Unique`, etc. wrap the validator

```typescript
// CORRECT
'1:id': PrimaryKey<Auto<bigint>>;
'2:price': Index<Positive<number>>;
'3:rating': Unique<Range<number, 1, 5>>;

// WRONG - validators cannot be nested
'4:bad': Positive<NonNegative<number>>;  // Error!
```

## Complete Example

```typescript
// models/product.pmsg
import { Table, PrimaryKey, Auto, Index, Unique } from '@propane/postgres';
import { int53 } from '@propane/runtime';
import {
  Positive, Range, NonEmpty, Length, MaxLength,
  Check, Validator
} from '@propane/validate';

const validSku: Validator<string> = (v) =>
  v.length >= 3 && v.length <= 20;

export type Product = Table<{
  '1:id': PrimaryKey<Auto<bigint>>;
  '2:sku': Unique<Check<string, typeof validSku, 'Invalid SKU format'>>;
  '3:name': Index<NonEmpty<string>>;
  '4:description': MaxLength<string, 5000>;
  '5:price': Positive<number, 'Price must be positive'>;
  '6:discount': Range<number, 0, 100>;
  '7:quantity': Positive<int53>;
  '8:status': 'draft' | 'active' | 'archived';
}>;
```

## See Also

- [Writing Propane Files](./propane-files.md) - General `.pmsg` file syntax
- [Getting Started](./getting-started.md) - Installation and basic usage
