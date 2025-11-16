const $brand = Symbol('brand');

export type Brand<T, B> = T & { readonly [$brand]: B };

export const brand = <B>(b: B) => <T>(t: T): Brand<T, B> => t as Brand<T, B>;

export const unbrand = <B>(b: B) => <T>(t: Brand<T, B>): T => t as T;

export const isBrand = <B>(t: unknown): t is Brand<unknown, B> =>
  $brand in (t as object);
