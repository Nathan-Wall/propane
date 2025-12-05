/* eslint-disable @typescript-eslint/no-namespace,@typescript-eslint/no-explicit-any*/
// Generated from pms-server/src/response.pmsg
/**
 * Response wrapper for handlers that need to return custom headers.
 *
 * @example
 * ```typescript
 * server.handle(Login, async (req) => {
 *   return new Response({
 *     body: new LoginResponse({ success: true }),
 *     headers: new Map([['Set-Cookie', 'session=abc; HttpOnly']]),
 *   });
 * });
 * ```
 */
import { ensure } from '../../common/assert/index.js';
import { emsg } from '../../common/strings/msg/index.js';
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, ImmutableMap, equals, parseCerealString } from "../../runtime/index.js";

// @message
import type { MessagePropDescriptor, MessageConstructor, DataObject, ImmutableArray, ImmutableSet } from "../../runtime/index.js";
export class Response<
  T extends Message<any>,
  A extends unknown[] = unknown[],
  TConstructor extends MessageConstructor<T, A> = MessageConstructor<T, A>
> extends Message<Response.Data<T>> {
  static TYPE_TAG = Symbol("Response");
  #body: T;
  #headers: ImmutableMap<string, string> | undefined;
  #tClass: TConstructor;
  constructor(tClass: TConstructor, props?: Response.Value<T, A>) {
    super(Response.TYPE_TAG, `Response<${tClass.$typeName}>`);
    this.#tClass = tClass;
    this.#body = props ? props.body : new this.#tClass(...[] as unknown as A);
    this.#headers = props ? props.headers === undefined || props.headers === null ? props.headers : props.headers instanceof ImmutableMap ? props.headers : new ImmutableMap(props.headers) : undefined;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<Response.Data<T>>[] {
    return [{
      name: "body",
      fieldNumber: 1,
      getValue: () => this.#body
    }, {
      name: "headers",
      fieldNumber: 2,
      getValue: () => this.#headers
    }];
  }
  protected $fromEntries(entries: Record<string, unknown>): Response.Data<T> {
    const props = {} as Partial<Response.Data<T>>;
    const bodyValue = entries["1"] === undefined ? entries["body"] : entries["1"];
    if (bodyValue === undefined) throw new Error("Missing required property \"body\".");
    props.body = bodyValue as T;
    const headersValue = entries["2"] === undefined ? entries["headers"] : entries["2"];
    const headersNormalized = headersValue === null ? undefined : headersValue;
    const headersMapValue = headersNormalized === undefined || headersNormalized === null ? headersNormalized : headersNormalized as object instanceof ImmutableMap ? headersNormalized : new ImmutableMap(headersNormalized as Iterable<[unknown, unknown]>);
    if (headersMapValue !== undefined && !((headersMapValue instanceof ImmutableMap || headersMapValue instanceof Map) && [...(headersMapValue as ReadonlyMap<unknown, unknown>).entries()].every(([mapKey, mapValue]) => typeof mapKey === "string" && typeof mapValue === "string"))) throw new Error("Invalid value for property \"headers\".");
    props.headers = headersMapValue as ImmutableMap<string, string>;
    return props as Response.Data<T>;
  }
  override [WITH_CHILD](key: string | number, child: unknown): this {
    switch (key) {
      case "headers":
        return new Response(this.#tClass, {
          body: this.#body,
          headers: child as ImmutableMap<string, string>
        }) as this;
      default:
        throw new Error(`Unknown key: ${key}`);
    }
  }
  override *[GET_MESSAGE_CHILDREN]() {
    yield ["headers", this.#headers] as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
  }
  static override bind<
    T extends Message<any>,
    A extends unknown[] = unknown[],
    TConstructor extends MessageConstructor<T, A> = MessageConstructor<T, A>
  >(
    tClass: TConstructor,
  ) {
    const boundCtor = function (props: Response.Data<T>) {
      return new Response<T, A>(tClass, props);
    };
    boundCtor.deserialize = (data: string) => {
      const payload = ensure.simpleObject(
        parseCerealString(data),
        emsg`Expected an object when deserializing: ${data}`,
      );
      const proto = Response.prototype;
      const props = proto.$fromEntries(payload);
      return new Response<T, A>(
        tClass,
        props,
      );
    };
    boundCtor.$typeName = `Response<${tClass.$typeName}>`;
    return boundCtor;
  }
  get body(): T {
    return this.#body;
  }
  get headers(): ImmutableMap<string, string> | undefined {
    return this.#headers;
  }
  clearHeaders() {
    const headersCurrent = this.headers;
    if (headersCurrent === undefined || headersCurrent.size === 0) return this;
    const headersMapSource = this.#headers;
    const headersMapEntries = headersMapSource === undefined ? [] : [...headersMapSource.entries()];
    const headersMapNext = new Map(headersMapEntries);
    headersMapNext.clear();
    return this.$update(new Response(this.#tClass, {
      body: this.#body,
      headers: headersMapNext
    }) as this);
  }
  deleteHeaders() {
    return this.$update(new Response(this.#tClass, {
      body: this.#body
    }) as this);
  }
  deleteHeadersEntry(key: string) {
    const headersCurrent = this.headers;
    if (!headersCurrent?.has(key)) return this;
    const headersMapSource = this.#headers;
    const headersMapEntries = headersMapSource === undefined ? [] : [...headersMapSource.entries()];
    const headersMapNext = new Map(headersMapEntries);
    headersMapNext.delete(key);
    return this.$update(new Response(this.#tClass, {
      body: this.#body,
      headers: headersMapNext
    }) as this);
  }
  filterHeadersEntries(predicate: (value: string, key: string) => boolean) {
    const headersMapSource = this.#headers;
    const headersMapEntries = headersMapSource === undefined ? [] : [...headersMapSource.entries()];
    const headersMapNext = new Map(headersMapEntries);
    for (const [entryKey, entryValue] of headersMapNext) {
      if (!predicate(entryValue, entryKey)) headersMapNext.delete(entryKey);
    }
    if (this.headers === headersMapNext as unknown || this.headers?.equals(headersMapNext)) return this;
    return this.$update(new Response(this.#tClass, {
      body: this.#body,
      headers: headersMapNext
    }) as this);
  }
  mapHeadersEntries(mapper: (value: string, key: string) => [string, string]) {
    const headersMapSource = this.#headers;
    const headersMapEntries = headersMapSource === undefined ? [] : [...headersMapSource.entries()];
    const headersMapNext = new Map(headersMapEntries);
    const headersMappedEntries = [];
    for (const [entryKey, entryValue] of headersMapNext) {
      const mappedEntry = mapper(entryValue, entryKey);
      headersMappedEntries.push(mappedEntry);
    }
    headersMapNext.clear();
    for (const [newKey, newValue] of headersMappedEntries) {
      headersMapNext.set(newKey, newValue);
    }
    if (this.headers === headersMapNext as unknown || this.headers?.equals(headersMapNext)) return this;
    return this.$update(new Response(this.#tClass, {
      body: this.#body,
      headers: headersMapNext
    }) as this);
  }
  mergeHeadersEntries(entries: ImmutableMap<string, string> | ReadonlyMap<string, string> | Iterable<[string, string]>) {
    const headersMapSource = this.#headers;
    const headersMapEntries = headersMapSource === undefined ? [] : [...headersMapSource.entries()];
    const headersMapNext = new Map(headersMapEntries);
    for (const [mergeKey, mergeValue] of entries) {
      headersMapNext.set(mergeKey, mergeValue);
    }
    if (this.headers === headersMapNext as unknown || this.headers?.equals(headersMapNext)) return this;
    return this.$update(new Response(this.#tClass, {
      body: this.#body,
      headers: headersMapNext
    }) as this);
  }
  setBody(value: T) {
    return this.$update(new Response(this.#tClass, {
      body: value,
      headers: this.#headers
    }) as this);
  }
  setHeaders(value: Map<string, string> | Iterable<[string, string]>) {
    return this.$update(new Response(this.#tClass, {
      body: this.#body,
      headers: value === undefined || value === null ? value : value instanceof ImmutableMap ? value : new ImmutableMap(value)
    }) as this);
  }
  setHeadersEntry(key: string, value: string) {
    const headersCurrent = this.headers;
    if (headersCurrent?.has(key)) {
      const existing = headersCurrent.get(key);
      if (equals(existing, value)) return this;
    }
    const headersMapSource = this.#headers;
    const headersMapEntries = headersMapSource === undefined ? [] : [...headersMapSource.entries()];
    const headersMapNext = new Map(headersMapEntries);
    headersMapNext.set(key, value);
    return this.$update(new Response(this.#tClass, {
      body: this.#body,
      headers: headersMapNext
    }) as this);
  }
  updateHeadersEntry(key: string, updater: (currentValue: string | undefined) => string) {
    const headersMapSource = this.#headers;
    const headersMapEntries = headersMapSource === undefined ? [] : [...headersMapSource.entries()];
    const headersMapNext = new Map(headersMapEntries);
    const currentValue = headersMapNext.get(key);
    const updatedValue = updater(currentValue);
    headersMapNext.set(key, updatedValue);
    if (this.headers === headersMapNext as unknown || this.headers?.equals(headersMapNext)) return this;
    return this.$update(new Response(this.#tClass, {
      body: this.#body,
      headers: headersMapNext
    }) as this);
  }
}
export namespace Response {
  export type Data<T extends Message<any>> = {
    body: T;
    headers?: Map<string, string> | Iterable<[string, string]> | undefined;
  };
  export type Value<
    T extends Message<any>,
    A extends unknown[],
  > = Response<T, A> | Response.Data<T>;
}
