import { tmsg } from '../common/strings/msg/index.js';

/**
 * Error thrown when a value fails validation.
 *
 * @example
 * ```typescript
 * throw new ValidationError('price', 'must be positive', value, 'POSITIVE');
 * ```
 *
 * Error codes enable frontends to map validation failures to UI behavior
 * without string-matching on human-readable messages:
 *
 * @example
 * ```typescript
 * try {
 *   const product = new Product(formData);
 * } catch (e) {
 *   if (e instanceof ValidationError) {
 *     switch (e.code) {
 *       case 'POSITIVE':
 *         showError(e.field, i18n.t('errors.mustBePositive'));
 *         break;
 *       default:
 *         showError(e.field, e.message);
 *     }
 *   }
 * }
 * ```
 */
export class ValidationError extends Error {
  readonly field: string;
  readonly constraint: string;
  readonly value: unknown;
  readonly code: string;

  constructor(
    field: string,
    constraint: string,
    value: unknown,
    code = 'VALIDATION_FAILED',
  ) {
    super(tmsg`${field}: ${constraint} (got ${value})`);
    this.name = 'ValidationError';
    this.field = field;
    this.constraint = constraint;
    this.value = value;
    this.code = code;
  }
}
