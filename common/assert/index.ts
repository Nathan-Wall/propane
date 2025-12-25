import {emsg} from '@/common/strings/msg/index.js';
import {CHECK_ASSERTS} from './config.js';

type Truthy<T> = Exclude<T, 0 | '' | false | null | undefined>;
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
type StackFunction = Function;
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
type GenericFunction = Function;

type ValidateFunction = (
  test: boolean,
  message?: SimpleAssertMessage,
  _ignoreFromStack?: StackFunction,
) => void;
type TestFunction = (test: unknown) => boolean;
// We allow passing a callback to return the message to support preventing
// unnecessary computation of an error message, particularly when the value
// may be complex and output as part of the error message. We allow two levels
// of callbacks as an easy way to prevent computation of values that are
// included in an `emsg`. This allows the following without calling `getXInfo`
// unless the eassertion fails:
//
// assert(x, () => emsg`X failed ${getXInfo(x)}`);
export type AssertMessage<T> =
  string
  | ((value: T) => ((value: T) => string)|string);
type SimpleAssertMessage =
  string|(() => string)|(() => () => string);
type Constructor<T extends object> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new (...args: any[]) => T;

type Container<T> = {has: (value: unknown) => value is T};

// Extracts plain object types from a union, excluding arrays and
// objects with custom toStringTag (like ImmutableMap, ImmutableSet).
// Falls back to Record<string, unknown> if no object types found.
type SimpleObjectType<T> = T extends readonly unknown[]
  ? never
  : T extends { [Symbol.toStringTag]: string }
    ? never
    : T extends Record<string, unknown>
      ? T
      : never;
type SimpleObjectResult<T> =
  [SimpleObjectType<T>] extends [never]
    ? Record<string, unknown>
    : SimpleObjectType<T>;

const METHODS = defineMethods();

export function assertThrow(
  message?: AssertMessage<void>,
  _ignoreFromStack?: StackFunction,
) {
  if (CHECK_ASSERTS) {
    ensureThrow(message, _ignoreFromStack || assertThrow);
  }
}

export function ensureThrow(
  message?: AssertMessage<void>,
  _ignoreFromStack?: StackFunction,
): never {
  throw new AssertionError(undefined, message, _ignoreFromStack || ensureThrow);
}

export function assertTruthy<T>(
  test: T,
  message?: AssertMessage<T>,
  _ignoreFromStack?: StackFunction,
): asserts test is Truthy<T> {
  if (CHECK_ASSERTS) {
    ensureTruthy(test, message, _ignoreFromStack || assertTruthy);
  }
}

export function ensureTruthy<T>(
  test: T,
  message?: AssertMessage<T>,
  _ignoreFromStack?: StackFunction,
): asserts test is Truthy<T> {
  if (!test) {
    throw new AssertionError(test, message, _ignoreFromStack || ensureTruthy);
  }
}

export const assert = addValidateMethods(assertTruthy);
export const ensure = addValidateMethods(ensureTruthy);

export const test =
  addTestMethods(function test(test: unknown): boolean {
    return !!test;
  });

const assertionErrorTag = Symbol('AssertionError');
class AssertionError<T> extends Error {
  static isInstance(value: unknown): boolean {
    return typeof value === 'object'
      && value != null
      && assertionErrorTag in  value;
  }

  private [assertionErrorTag] = true;

  constructor(
    value: T,
    message: AssertMessage<T> = 'Assertion failed',
    _ignoreFromStack: StackFunction,
  ) {
    super(getMessage(message, value));
    if (_ignoreFromStack && Error.captureStackTrace) {
      Error.captureStackTrace(this, _ignoreFromStack);
    }
  }
}

function defineMethods() {
  return {
    fail: () => result<never>(
      'Assertion failed',
      false,
    ),

    // Unfortunately equality in EcmaScript comes in unlimited forms. This tests
    // SameValueZero[1] with an exception that `null` and `undefined` are
    // considered equal.
    //
    // This is similar to `===` with the following exceptions:
    // - same(null, undefined) => true
    // - same(NaN, NaN) => true
    //
    // [1] https://tc39.es/ecma262/#sec-samevaluezero
    same: <T, U>(a: T, b: U) => result<T&U>(
      emsg`Expected values to be equal: ${a} and ${b}`,
      same(a, b),
    ),

    // Similar to `same`, but also considers an `equals` method if it appears
    // on `a`.
    equals: <T, U>(a: T, b: U) => result<T&U>(
      emsg`Expected values to be equal: ${a} and ${b}`,
      equals(a, b),
    ),

    nullish: (value: unknown) => result<null|undefined>(
      emsg`Expected null or undefined: ${value}`,
      value == null,
    ),

    notNullish: <T>(value: T) => result<Exclude<T, null|undefined>>(
      emsg`Unexpected null or undefined: ${value}`,
      value != null,
    ),

    boolean: (value: unknown) => result<boolean>(
      emsg`Expected boolean: ${value}  (${typeof value})`,
      typeof value === 'boolean',
    ),

    number: (value: unknown) => result<number>(
      emsg`Expected number: ${value} (${typeof value})`,
      typeof value === 'number',
    ),

    string: (value: unknown) => result<string>(
      emsg`Expected string: ${value}  (${typeof value})`,
      typeof value === 'string',
    ),

    function: <T>(
      value: T,
    ) => result<
      T extends GenericFunction
        ? T : GenericFunction extends T
        ? GenericFunction : never
    >(
      emsg`Expected function: ${value}`,
      typeof value === 'function',
       
    ),

    safeInteger: (value: unknown) => result<number>(
      emsg`Expected safe integer: ${value}`,
      Number.isSafeInteger(value),
    ),

    array: <T>(value: T) => result<
      T extends unknown[] ? T : unknown[] extends T ? unknown[] : never
    >(
      emsg`Expected array: ${value}`,
      Array.isArray(value),
    ),

    iterable: (value: unknown) => result<Iterable<unknown>>(
      emsg`Expected iterable: ${value}`,
      !!value
      && typeof (value as Iterable<unknown>)[Symbol.iterator] === 'function',
    ),

    // A "simple object" is an object with tag[1] of "Object".
    //
    // https://tc39.es/ecma262/#sec-object.prototype.tostring
    simpleObject: <T>(value: T) => result<SimpleObjectResult<T>>(
      emsg`Expected simple object: ${value}`,
      getStringTag(value) === 'Object',
    ),

    hasOwn: <T, P>(
      value: T,
      key: P,
    ) => result<
      T extends object
        ? P extends PropertyKey
          ? Record<P, unknown>
          : T
        : T
    >(
      emsg`Expected object with key: ${key}`,
      typeof value === 'object'
      && value != null
      && (
        typeof key === 'string'
        || typeof key === 'number'
        || typeof key === 'symbol'
      )
      && hasOwn(((value as unknown) as object), key),
    ),

    instanceOf: <T extends object>(
      value: unknown,
      constructor: Constructor<T>,
    ) => result<T>(
      emsg`
        Expected instance of ${constructor?.name || '[Unknown]'} but found
        ${value}`,
      value instanceof constructor,
    ),

    in: <T>(
      value: unknown,
      iter: Iterable<T>,
    ) => result<T>(
      emsg`
        Expected value ${value} to be in iterable ${iter}`,
      isIn(value, iter),
    ),

    nodeError: (value: unknown) => result<NodeJS.ErrnoException>(
      emsg`Expected Node error ${value}`,
      value instanceof Error && !!(value as NodeJS.ErrnoException).code,
    ),
  };
}

function createValidateMethods(validate: ValidateFunction) {
  return {
    fail: wrapValidate(validate, METHODS.fail),
    same: wrapValidate(validate, METHODS.same),
    nullish: wrapValidate(validate, METHODS.nullish),
    notNullish: wrapValidate(validate, METHODS.notNullish),
    boolean: wrapValidate(validate, METHODS.boolean),
    number: wrapValidate(validate, METHODS.number),
    safeInteger: wrapValidate(validate, METHODS.safeInteger),
    string: wrapValidate(validate, METHODS.string),
    function: wrapValidate(validate, METHODS.function),
    array: wrapValidate(validate, METHODS.array),
    iterable: wrapValidate(validate, METHODS.iterable),
    simpleObject: wrapValidate(validate, METHODS.simpleObject),
    hasOwn: wrapValidate(validate, METHODS.hasOwn),
    instanceOf: wrapValidate(validate, METHODS.instanceOf),
    in: wrapValidate(validate, METHODS.in),
    nodeError: wrapValidate(validate, METHODS.nodeError),
  };
}

function createTestMethods() {
  return {
    fail: wrapTest(METHODS.fail),
    same: wrapTest(METHODS.same),
    nullish: wrapTest(METHODS.nullish),
    notNullish: wrapTest(METHODS.notNullish),
    boolean: wrapTest(METHODS.boolean),
    number: wrapTest(METHODS.number),
    safeInteger: wrapTest(METHODS.safeInteger),
    string: wrapTest(METHODS.string),
    function: wrapTest(METHODS.function),
    array: wrapTest(METHODS.array),
    iterable: wrapTest(METHODS.iterable),
    simpleObject: wrapTest(METHODS.simpleObject),
    hasOwn: wrapTest(METHODS.hasOwn),
    instanceOf: wrapTest(METHODS.instanceOf),
    in: wrapTest(METHODS.in),
    nodeError: wrapTest(METHODS.nodeError),
  };
}

// The T in Result<T> is used by wrapValidate, but eslint can't understand that.
 
type Result<T = unknown> = [AssertMessage<T>, boolean];
function result<T>(error: AssertMessage<T>, pass: boolean): Result<T> {
  return [error, pass];
}

function addValidateMethods(
  validate: <T>(
    test: T,
    message?: AssertMessage<T>,
    _ignoreFromStack?: StackFunction,
  ) => void,
) {
  return Object.assign(
    function wrapper<T>(test: T, message?: AssertMessage<T>): Truthy<T> {
      validate<boolean>(
        !!test,
        applyToMessage(message, test),
        wrapper,
      );
      return test as Truthy<T>;
    },
    createValidateMethods(validate),
  );
}

function addTestMethods(test: TestFunction) {
  return Object.assign(
    test,
    createTestMethods(),
  );
}

function wrapValidate<A extends unknown[], R>(
  validate: ValidateFunction,
  test: (...args: A) => Result<R>,
) {
  return function wrapper(...args: [...A, AssertMessage<R>?]) {
    const testArgs = args.slice(0, test.length) as A;
    const customError =
      test.length === args.length
        ? undefined
        : args.at(-1) as AssertMessage<R>;
    const [error, pass] = test(...testArgs);
    const value = args[0] as R;
    validate(pass, applyToMessage(customError ?? error, value), wrapper);
    return value;
  };
}

function wrapTest<A extends unknown[], R>(
  test: (value: unknown, ...args: A) => Result<R>,
) {
  return (value: unknown, ...args: A): value is R => {
    const [, pass] = test(value, ...args);
    return pass;
  };
}

function getMessage<T>(message: AssertMessage<T>, value: T): string {
  if (typeof message === 'string') {
    return message;
  }
  const msg = message(value);
  if (typeof msg === 'string') {
    return msg;
  }
  return msg(value);
}

// Apply the `test` value as an argument to `message` if `message` is a
// function. Do this two levels deep if `message` is a function that
// returns a function. This is to make the types work out.
function applyToMessage<T>(
  message: AssertMessage<T>|undefined,
  value: T,
): SimpleAssertMessage|string|undefined {
  if (typeof message === 'string' || message === undefined) {
    return message;
  }
  return (): string => {
    const unwrapped = message(value);
    if (typeof unwrapped === 'string') {
      return unwrapped;
    }
    return unwrapped(value);
  };
}

function getStringTag(value: unknown): string {
  const result = Object.prototype.toString.call(value);
  assert(result.startsWith("[object "));
  assert(result.endsWith("]"));
  return result.slice(8, -1);
}

const hasOwn = Function.prototype.call.bind(
  // eslint-disable-next-line @typescript-eslint/unbound-method -- intentional
  Object.prototype.hasOwnProperty
) as (object: object, property: PropertyKey) => boolean;

const same = <T, U>(a: T, b: U): a is T&U =>
  Object.is(a, b)
  || a == null && b == null
  || a as unknown === 0 && b as unknown === 0;

const equals = <T, U>(a: T, b: U): a is T&U =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
  same(a, b) || !!(a as any)?.equals?.(b);

// Note: This won't currently work for situations where two different protos
// containing the same data are compared in a container that can't compare them,
// such as a Set or Map. It will work in ImmutableSet or ImmutableMap since
// they are able to compare protos. We can fix this by adding a way to
// generically detect if we are working with a container which is able to
// use `has` on protos. For example, we can add a property to ImmutableSet
// and ImmutableMap which could be checked. If it is not found, it means we
// may be working with a Set or Map and need to fall back to the for loop.
function isIn<T>(value: unknown, iter: Container<T>|Iterable<T>): value is T {
  const c = iter as Container<T>;
  if (typeof c.has === 'function') {
    return c.has(value);
  }
  for (const item of iter as Iterable<T>) {
    if (equals(item, value)) {
      return true;
    }
  }
  return false;
}
