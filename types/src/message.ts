/**
 * Wrapper type for Message definitions in .pmsg files.
 *
 * When a type alias is wrapped with `Message<T>`, the Propane compiler
 * transforms it into a runtime class with immutability, serialization,
 * and equality checking.
 *
 * @example
 * ```typescript
 * import { Message } from '@propane/types';
 *
 * export type User = Message<{
 *   '1:id': number;
 *   '2:name': string;
 *   '3:email': string;
 * }>;
 * ```
 */
export type Message<T extends object> = T & { readonly __message: unique symbol };

/**
 * Wrapper type for MessageWrapper definitions in .pmsg files.
 *
 * This is a marker type only; the compiler generates the runtime class.
 */
export type MessageWrapper<T> = Message<{ value: T }>;
