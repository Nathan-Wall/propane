/**
 * Type-safe where clause builder for repository queries.
 */

import { escapeIdentifier } from '../mapping/serializer.js';

/**
 * Comparison operators for where clauses.
 */
export type ComparisonOperator =
  | { eq: unknown }
  | { neq: unknown }
  | { gt: unknown }
  | { gte: unknown }
  | { lt: unknown }
  | { lte: unknown }
  | { in: unknown[] }
  | { notIn: unknown[] }
  | { like: string }
  | { ilike: string }
  | { contains: string }
  | { startsWith: string }
  | { endsWith: string }
  | { isNull: boolean }
  | { between: [unknown, unknown] };

/**
 * A where clause condition.
 */
export type WhereCondition<T> = {
  [K in keyof T]?: T[K] | ComparisonOperator;
} & {
  AND?: WhereCondition<T>[];
  OR?: WhereCondition<T>[];
  NOT?: WhereCondition<T>;
};

/**
 * Result of building a where clause.
 */
export interface BuiltWhere {
  /** The SQL WHERE clause (without the WHERE keyword) */
  sql: string;
  /** Parameter values for the query */
  params: unknown[];
}

/**
 * Build a WHERE clause from a condition object.
 */
export function buildWhere<T>(
  condition: WhereCondition<T>,
  startParamIndex = 1
): BuiltWhere {
  const builder = new WhereBuilder(startParamIndex);
  const sql = builder.build(condition);
  return { sql, params: builder.params };
}

/**
 * Internal where clause builder.
 */
class WhereBuilder {
  params: unknown[] = [];
  private paramIndex: number;

  constructor(startIndex = 1) {
    this.paramIndex = startIndex;
  }

  /**
   * Build the where clause SQL.
   */
  build<T>(condition: WhereCondition<T>): string {
    const parts: string[] = [];

    // Handle AND conditions
    if (condition.AND) {
      const andParts = condition.AND.map((c) => `(${this.build(c)})`);
      if (andParts.length > 0) {
        parts.push(`(${andParts.join(' AND ')})`);
      }
    }

    // Handle OR conditions
    if (condition.OR) {
      const orParts = condition.OR.map((c) => `(${this.build(c)})`);
      if (orParts.length > 0) {
        parts.push(`(${orParts.join(' OR ')})`);
      }
    }

    // Handle NOT condition
    if (condition.NOT) {
      parts.push(`NOT (${this.build(condition.NOT)})`);
    }

    // Handle field conditions
    for (const [key, value] of Object.entries(condition)) {
      if (key === 'AND' || key === 'OR' || key === 'NOT') continue;
      if (value === undefined) continue;

      const columnName = escapeIdentifier(this.toSnakeCase(key));
      const fieldCondition = this.buildFieldCondition(columnName, value);
      if (fieldCondition) {
        parts.push(fieldCondition);
      }
    }

    return parts.length > 0 ? parts.join(' AND ') : 'TRUE';
  }

  /**
   * Build a condition for a single field.
   */
  private buildFieldCondition(
    columnName: string,
    value: unknown
  ): string | null {
    if (value === null) {
      return `${columnName} IS NULL`;
    }

    if (typeof value !== 'object') {
      // Simple equality
      this.params.push(value);
      return `${columnName} = $${this.paramIndex++}`;
    }

    // Handle comparison operators
    const op = value as ComparisonOperator;

    if ('eq' in op) {
      if (op.eq === null) {
        return `${columnName} IS NULL`;
      }
      this.params.push(op.eq);
      return `${columnName} = $${this.paramIndex++}`;
    }

    if ('neq' in op) {
      if (op.neq === null) {
        return `${columnName} IS NOT NULL`;
      }
      this.params.push(op.neq);
      return `${columnName} != $${this.paramIndex++}`;
    }

    if ('gt' in op) {
      this.params.push(op.gt);
      return `${columnName} > $${this.paramIndex++}`;
    }

    if ('gte' in op) {
      this.params.push(op.gte);
      return `${columnName} >= $${this.paramIndex++}`;
    }

    if ('lt' in op) {
      this.params.push(op.lt);
      return `${columnName} < $${this.paramIndex++}`;
    }

    if ('lte' in op) {
      this.params.push(op.lte);
      return `${columnName} <= $${this.paramIndex++}`;
    }

    if ('in' in op) {
      if (op.in.length === 0) {
        return 'FALSE'; // Empty IN is always false
      }
      const placeholders = op.in.map((v) => {
        this.params.push(v);
        return `$${this.paramIndex++}`;
      });
      return `${columnName} IN (${placeholders.join(', ')})`;
    }

    if ('notIn' in op) {
      if (op.notIn.length === 0) {
        return 'TRUE'; // Empty NOT IN is always true
      }
      const placeholders = op.notIn.map((v) => {
        this.params.push(v);
        return `$${this.paramIndex++}`;
      });
      return `${columnName} NOT IN (${placeholders.join(', ')})`;
    }

    if ('like' in op) {
      this.params.push(op.like);
      return `${columnName} LIKE $${this.paramIndex++}`;
    }

    if ('ilike' in op) {
      this.params.push(op.ilike);
      return `${columnName} ILIKE $${this.paramIndex++}`;
    }

    if ('contains' in op) {
      this.params.push(`%${this.escapeLikePattern(op.contains)}%`);
      return `${columnName} ILIKE $${this.paramIndex++}`;
    }

    if ('startsWith' in op) {
      this.params.push(`${this.escapeLikePattern(op.startsWith)}%`);
      return `${columnName} ILIKE $${this.paramIndex++}`;
    }

    if ('endsWith' in op) {
      this.params.push(`%${this.escapeLikePattern(op.endsWith)}`);
      return `${columnName} ILIKE $${this.paramIndex++}`;
    }

    if ('isNull' in op) {
      return op.isNull ? `${columnName} IS NULL` : `${columnName} IS NOT NULL`;
    }

    if ('between' in op) {
      this.params.push(op.between[0], op.between[1]);
      return `${columnName} BETWEEN $${this.paramIndex++} AND $${this.paramIndex++}`;
    }

    // If we get here, it might be a nested object for JSONB queries
    // Just use simple equality for now
    this.params.push(value);
    return `${columnName} = $${this.paramIndex++}`;
  }

  /**
   * Escape special characters in LIKE patterns.
   */
  private escapeLikePattern(pattern: string): string {
    return pattern.replaceAll(/[%_\\]/g, String.raw`\$&`);
  }

  /**
   * Convert camelCase to snake_case.
   */
  private toSnakeCase(str: string): string {
    return str.replaceAll(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  }
}

/**
 * Order by direction.
 */
export type OrderDirection = 'asc' | 'desc' | 'ASC' | 'DESC';

/**
 * Order by specification.
 */
export type OrderBy<T> = {
  [K in keyof T]?: OrderDirection;
} | { field: keyof T; direction: OrderDirection }[];

/**
 * Build an ORDER BY clause.
 */
export function buildOrderBy<T>(orderBy: OrderBy<T>): string {
  if (Array.isArray(orderBy)) {
    const parts = orderBy.map(({ field, direction }) => {
      const col = escapeIdentifier(toSnakeCase(String(field)));
      return `${col} ${direction.toUpperCase()}`;
    });
    return parts.join(', ');
  }

  const parts: string[] = [];
  for (const [field, direction] of Object.entries(orderBy)) {
    if (direction && typeof direction === 'string') {
      const col = escapeIdentifier(toSnakeCase(field));
      parts.push(`${col} ${direction.toUpperCase()}`);
    }
  }
  return parts.join(', ');
}

/**
 * Convert camelCase to snake_case.
 */
function toSnakeCase(str: string): string {
  return str.replaceAll(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}
