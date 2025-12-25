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
import { Message } from '@/runtime/index.js';
import type { AnyMessage, MessagePropDescriptor, MessageConstructor, MessageValue, DataObject, ImmutableArray, ImmutableSet, SetUpdates } from "../../runtime/index.js";
import { WITH_CHILD, GET_MESSAGE_CHILDREN, ImmutableMap, equals, parseCerealString, SKIP, ensure } from "../../runtime/index.js";
export class Response<T extends AnyMessage> extends Message<Response.Data<T>> {
  static TYPE_TAG = Symbol("Response");
  #body!: T;
  #headers!: ImmutableMap<string, string> | undefined;
  #tClass!: MessageConstructor<T>;
  constructor(tClass: MessageConstructor<T>, props?: Response.Value<T>, options?: {
    skipValidation?: boolean;
  }) {
    super(Response.TYPE_TAG, `Response<${tClass.$typeName}>`);
    this.#tClass = tClass;
    this.#body = (props ? props.body : new this.#tClass(undefined)) as T;
    this.#headers = props ? (props.headers === undefined || props.headers === null ? props.headers : props.headers as object instanceof ImmutableMap ? props.headers : new ImmutableMap(props.headers as Iterable<[unknown, unknown]>)) as ImmutableMap<string, string> : undefined;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<Response.Data<T>>[] {
    return [{
      name: "body",
      fieldNumber: 1,
      getValue: () => this.#body
    }, {
      name: "headers",
      fieldNumber: 2,
      getValue: () => this.#headers as Map<string, string> | Iterable<[string, string]>
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
    if (headersMapValue !== undefined && !((headersMapValue as object instanceof ImmutableMap || headersMapValue as object instanceof Map) && [...(headersMapValue as ReadonlyMap<unknown, unknown>).entries()].every(([mapKey, mapValue]) => typeof mapKey === "string" && typeof mapValue === "string"))) throw new Error("Invalid value for property \"headers\".");
    props.headers = headersMapValue as Map<string, string> | Iterable<[string, string]>;
    return props as Response.Data<T>;
  }
  override [WITH_CHILD](key: string | number, child: unknown): this {
    switch (key) {
      case "headers":
        return new Response(this.#tClass, {
          body: this.#body,
          headers: child as ImmutableMap<string, string>
        } as unknown as Response.Value<T>) as this;
      default:
        throw new Error(`Unknown key: ${key}`);
    }
  }
  override *[GET_MESSAGE_CHILDREN]() {
    yield ["headers", this.#headers] as unknown as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
  }
  static override bind<T extends AnyMessage>(tClass: MessageConstructor<T>): {
    (props: Response.Value<T>): Response<T>;
    new (props: Response.Value<T>): Response<T>;
    deserialize: (data: string, options?: { skipValidation?: boolean }) => Response<T>;
    $typeName: string;
  } {
    const boundCtor = function (props: Response.Value<T>) {
      const body = props.body instanceof tClass ? props.body : new tClass(props.body as any);
      return new Response(tClass, {
        ...props,
        body
      });
    };
    boundCtor.deserialize = (data: string, options?: { skipValidation?: boolean }) => {
      const payload = ensure.simpleObject(parseCerealString(data)) as DataObject;
      return boundCtor(payload as unknown as Response.Data<T>);
    };
    boundCtor.$typeName = `Response<${tClass.$typeName}>`;
    return boundCtor as {
      (props: Response.Value<T>): Response<T>;
      new (props: Response.Value<T>): Response<T>;
      deserialize: (data: string, options?: { skipValidation?: boolean }) => Response<T>;
      $typeName: string;
    };
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static deserialize<T extends AnyMessage>(tClass: MessageConstructor<T>, data: string, options?: { skipValidation?: boolean }): Response<T> {
    const payload = ensure.simpleObject(parseCerealString(data)) as DataObject;
    const body = new tClass((payload["1"] ?? payload["body"]) as any, options);
    return new Response(tClass, {
      ...(payload as unknown as Response.Data<T>),
      body
    }, options);
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
      headers: headersMapNext as Map<string, string> | Iterable<[string, string]>
    } as unknown as Response.Value<T>) as this as this);
  }
  deleteHeaders() {
    return this.$update(new Response(this.#tClass, {
      body: this.#body
    }) as this as this);
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
      headers: headersMapNext as Map<string, string> | Iterable<[string, string]>
    } as unknown as Response.Value<T>) as this as this);
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
      headers: headersMapNext as Map<string, string> | Iterable<[string, string]>
    } as unknown as Response.Value<T>) as this as this);
  }
  mapHeadersEntries(mapper: (value: string, key: string) => [string, string]) {
    const headersMapSource = this.#headers;
    const headersMapEntries = headersMapSource === undefined ? [] : [...headersMapSource.entries()];
    const headersMapNext = new Map(headersMapEntries);
    const headersMappedEntries: [string, string][] = [];
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
      headers: headersMapNext as Map<string, string> | Iterable<[string, string]>
    } as unknown as Response.Value<T>) as this as this);
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
      headers: headersMapNext as Map<string, string> | Iterable<[string, string]>
    } as unknown as Response.Value<T>) as this as this);
  }
  set(updates: Partial<SetUpdates<Response.Data<T>>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new Response(this.#tClass, data) as this as this);
  }
  setBody(value: T) {
    return this.$update(new Response(this.#tClass, {
      body: value,
      headers: this.#headers as Map<string, string> | Iterable<[string, string]>
    }) as this as this);
  }
  setHeaders(value: Map<string, string> | Iterable<[string, string]> | undefined) {
    return this.$update(new Response(this.#tClass, {
      body: this.#body,
      headers: (value === undefined || value === null ? value : value instanceof ImmutableMap ? value : new ImmutableMap(value)) as Map<string, string> | Iterable<[string, string]>
    }) as this as this);
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
      headers: headersMapNext as Map<string, string> | Iterable<[string, string]>
    } as unknown as Response.Value<T>) as this as this);
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
      headers: headersMapNext as Map<string, string> | Iterable<[string, string]>
    } as unknown as Response.Value<T>) as this as this);
  }
}
export namespace Response {
  export type Data<T extends AnyMessage> = {
    body: T;
    headers?: Map<string, string> | Iterable<[string, string]> | undefined;
  };
  export type Value<T extends AnyMessage> = Response<T> | Response.Data<T>;
}
