/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/url.pmsg
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, ImmutableArray, ImmutableUrl, parseCerealString, ensure, SKIP } from "../runtime/index.js";
import type { MessagePropDescriptor, DataObject, ImmutableSet, ImmutableMap, SetUpdates } from "../runtime/index.js";
export class UrlMessage extends Message<UrlMessage.Data> {
  static TYPE_TAG = Symbol("UrlMessage");
  static readonly $typeName = "UrlMessage";
  static EMPTY: UrlMessage;
  #id!: number;
  #primary!: ImmutableUrl;
  #secondary!: ImmutableUrl | undefined;
  #links!: ImmutableArray<ImmutableUrl>;
  constructor(props?: UrlMessage.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && UrlMessage.EMPTY) return UrlMessage.EMPTY;
    super(UrlMessage.TYPE_TAG, "UrlMessage");
    this.#id = (props ? props.id : 0) as number;
    this.#primary = props ? props.primary instanceof ImmutableUrl ? props.primary : new ImmutableUrl(props.primary) : new ImmutableUrl("about:blank");
    this.#secondary = props ? props.secondary === undefined ? undefined : props.secondary instanceof ImmutableUrl ? props.secondary : new ImmutableUrl(props.secondary) : undefined;
    this.#links = props ? (props.links === undefined || props.links === null ? new ImmutableArray() : props.links as object instanceof ImmutableArray ? props.links : new ImmutableArray(props.links as Iterable<unknown>)) as ImmutableArray<ImmutableUrl> : new ImmutableArray();
    if (!props) UrlMessage.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<UrlMessage.Data>[] {
    return [{
      name: "id",
      fieldNumber: 1,
      getValue: () => this.#id
    }, {
      name: "primary",
      fieldNumber: 2,
      getValue: () => this.#primary as ImmutableUrl | URL
    }, {
      name: "secondary",
      fieldNumber: 3,
      getValue: () => this.#secondary as ImmutableUrl | URL
    }, {
      name: "links",
      fieldNumber: 4,
      getValue: () => this.#links as (URL | ImmutableUrl)[] | Iterable<URL | ImmutableUrl>
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): UrlMessage.Data {
    const props = {} as Partial<UrlMessage.Data>;
    const idValue = entries["1"] === undefined ? entries["id"] : entries["1"];
    if (idValue === undefined) throw new Error("Missing required property \"id\".");
    if (!(typeof idValue === "number")) throw new Error("Invalid value for property \"id\".");
    props.id = idValue as number;
    const primaryValue = entries["2"] === undefined ? entries["primary"] : entries["2"];
    if (primaryValue === undefined) throw new Error("Missing required property \"primary\".");
    if (!(primaryValue as object instanceof URL || primaryValue as object instanceof ImmutableUrl)) throw new Error("Invalid value for property \"primary\".");
    props.primary = primaryValue as URL;
    const secondaryValue = entries["3"] === undefined ? entries["secondary"] : entries["3"];
    const secondaryNormalized = secondaryValue === null ? undefined : secondaryValue;
    if (secondaryNormalized !== undefined && !(secondaryNormalized as object instanceof URL || secondaryNormalized as object instanceof ImmutableUrl)) throw new Error("Invalid value for property \"secondary\".");
    props.secondary = secondaryNormalized as URL;
    const linksValue = entries["4"] === undefined ? entries["links"] : entries["4"];
    if (linksValue === undefined) throw new Error("Missing required property \"links\".");
    const linksArrayValue = linksValue === undefined || linksValue === null ? new ImmutableArray() : linksValue as object instanceof ImmutableArray ? linksValue : new ImmutableArray(linksValue as Iterable<unknown>);
    if (!((linksArrayValue as object instanceof ImmutableArray || Array.isArray(linksArrayValue)) && [...(linksArrayValue as Iterable<unknown>)].every(element => element as object instanceof URL || element as object instanceof ImmutableUrl))) throw new Error("Invalid value for property \"links\".");
    props.links = linksArrayValue as (URL | ImmutableUrl)[] | Iterable<URL | ImmutableUrl>;
    return props as UrlMessage.Data;
  }
  static from(value: UrlMessage.Value): UrlMessage {
    return value instanceof UrlMessage ? value : new UrlMessage(value);
  }
  override [WITH_CHILD](key: string | number, child: unknown): this {
    switch (key) {
      case "links":
        return new (this.constructor as typeof UrlMessage)({
          id: this.#id,
          primary: this.#primary as ImmutableUrl | URL,
          secondary: this.#secondary as ImmutableUrl | URL,
          links: child as (URL | ImmutableUrl)[] | Iterable<URL | ImmutableUrl>
        }) as this;
      default:
        throw new Error(`Unknown key: ${key}`);
    }
  }
  override *[GET_MESSAGE_CHILDREN]() {
    yield ["links", this.#links] as unknown as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
  }
  static deserialize<T extends typeof UrlMessage>(this: T, data: string, options?: {
    skipValidation: boolean;
  }): InstanceType<T> {
    const payload = ensure.simpleObject(parseCerealString(data)) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
  }
  get id(): number {
    return this.#id;
  }
  get primary(): ImmutableUrl {
    return this.#primary;
  }
  get secondary(): ImmutableUrl | undefined {
    return this.#secondary;
  }
  get links(): ImmutableArray<ImmutableUrl> {
    return this.#links;
  }
  copyWithinLinks(target: number, start: number, end?: number) {
    const linksArray = this.#links;
    const linksNext = [...linksArray];
    linksNext.copyWithin(target, start, end);
    return this.$update(new (this.constructor as typeof UrlMessage)({
      id: this.#id,
      primary: this.#primary as ImmutableUrl | URL,
      secondary: this.#secondary as ImmutableUrl | URL,
      links: linksNext as (URL | ImmutableUrl)[] | Iterable<URL | ImmutableUrl>
    }) as this);
  }
  fillLink(value: URL, start?: number, end?: number) {
    const linksArray = this.#links;
    const linksNext = [...linksArray];
    (linksNext as unknown as URL[]).fill(value, start, end);
    return this.$update(new (this.constructor as typeof UrlMessage)({
      id: this.#id,
      primary: this.#primary as ImmutableUrl | URL,
      secondary: this.#secondary as ImmutableUrl | URL,
      links: linksNext as (URL | ImmutableUrl)[] | Iterable<URL | ImmutableUrl>
    }) as this);
  }
  popLink() {
    if ((this.links ?? []).length === 0) return this;
    const linksArray = this.#links;
    const linksNext = [...linksArray];
    linksNext.pop();
    return this.$update(new (this.constructor as typeof UrlMessage)({
      id: this.#id,
      primary: this.#primary as ImmutableUrl | URL,
      secondary: this.#secondary as ImmutableUrl | URL,
      links: linksNext as (URL | ImmutableUrl)[] | Iterable<URL | ImmutableUrl>
    }) as this);
  }
  pushLink(...values: URL[]) {
    if (values.length === 0) return this;
    const linksArray = this.#links;
    const linksNext = [...linksArray, ...values];
    return this.$update(new (this.constructor as typeof UrlMessage)({
      id: this.#id,
      primary: this.#primary as ImmutableUrl | URL,
      secondary: this.#secondary as ImmutableUrl | URL,
      links: linksNext as (URL | ImmutableUrl)[] | Iterable<URL | ImmutableUrl>
    }) as this);
  }
  reverseLinks() {
    const linksArray = this.#links;
    const linksNext = [...linksArray];
    linksNext.reverse();
    return this.$update(new (this.constructor as typeof UrlMessage)({
      id: this.#id,
      primary: this.#primary as ImmutableUrl | URL,
      secondary: this.#secondary as ImmutableUrl | URL,
      links: linksNext as (URL | ImmutableUrl)[] | Iterable<URL | ImmutableUrl>
    }) as this);
  }
  set(updates: Partial<SetUpdates<UrlMessage.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof UrlMessage)(data) as this);
  }
  setId(value: number) {
    return this.$update(new (this.constructor as typeof UrlMessage)({
      id: value,
      primary: this.#primary as ImmutableUrl | URL,
      secondary: this.#secondary as ImmutableUrl | URL,
      links: this.#links as (URL | ImmutableUrl)[] | Iterable<URL | ImmutableUrl>
    }) as this);
  }
  setLinks(value: (URL | ImmutableUrl)[] | Iterable<URL | ImmutableUrl>) {
    return this.$update(new (this.constructor as typeof UrlMessage)({
      id: this.#id,
      primary: this.#primary as ImmutableUrl | URL,
      secondary: this.#secondary as ImmutableUrl | URL,
      links: value as (URL | ImmutableUrl)[] | Iterable<URL | ImmutableUrl>
    }) as this);
  }
  setPrimary(value: ImmutableUrl | URL) {
    return this.$update(new (this.constructor as typeof UrlMessage)({
      id: this.#id,
      primary: value as ImmutableUrl | URL,
      secondary: this.#secondary as ImmutableUrl | URL,
      links: this.#links as (URL | ImmutableUrl)[] | Iterable<URL | ImmutableUrl>
    }) as this);
  }
  setSecondary(value: ImmutableUrl | URL | undefined) {
    return this.$update(new (this.constructor as typeof UrlMessage)({
      id: this.#id,
      primary: this.#primary as ImmutableUrl | URL,
      secondary: value as ImmutableUrl | URL,
      links: this.#links as (URL | ImmutableUrl)[] | Iterable<URL | ImmutableUrl>
    }) as this);
  }
  shiftLink() {
    if ((this.links ?? []).length === 0) return this;
    const linksArray = this.#links;
    const linksNext = [...linksArray];
    linksNext.shift();
    return this.$update(new (this.constructor as typeof UrlMessage)({
      id: this.#id,
      primary: this.#primary as ImmutableUrl | URL,
      secondary: this.#secondary as ImmutableUrl | URL,
      links: linksNext as (URL | ImmutableUrl)[] | Iterable<URL | ImmutableUrl>
    }) as this);
  }
  sortLinks(compareFn?: (a: URL, b: URL) => number) {
    const linksArray = this.#links;
    const linksNext = [...linksArray];
    (linksNext as unknown as URL[]).sort(compareFn);
    return this.$update(new (this.constructor as typeof UrlMessage)({
      id: this.#id,
      primary: this.#primary as ImmutableUrl | URL,
      secondary: this.#secondary as ImmutableUrl | URL,
      links: linksNext as (URL | ImmutableUrl)[] | Iterable<URL | ImmutableUrl>
    }) as this);
  }
  spliceLink(start: number, deleteCount?: number, ...items: URL[]) {
    const linksArray = this.#links;
    const linksNext = [...linksArray];
    linksNext.splice(start, ...(deleteCount !== undefined ? [deleteCount] : []), ...items);
    return this.$update(new (this.constructor as typeof UrlMessage)({
      id: this.#id,
      primary: this.#primary as ImmutableUrl | URL,
      secondary: this.#secondary as ImmutableUrl | URL,
      links: linksNext as (URL | ImmutableUrl)[] | Iterable<URL | ImmutableUrl>
    }) as this);
  }
  unsetSecondary() {
    return this.$update(new (this.constructor as typeof UrlMessage)({
      id: this.#id,
      primary: this.#primary as ImmutableUrl | URL,
      links: this.#links as (URL | ImmutableUrl)[] | Iterable<URL | ImmutableUrl>
    }) as this);
  }
  unshiftLink(...values: URL[]) {
    if (values.length === 0) return this;
    const linksArray = this.#links;
    const linksNext = [...values, ...linksArray];
    return this.$update(new (this.constructor as typeof UrlMessage)({
      id: this.#id,
      primary: this.#primary as ImmutableUrl | URL,
      secondary: this.#secondary as ImmutableUrl | URL,
      links: linksNext as (URL | ImmutableUrl)[] | Iterable<URL | ImmutableUrl>
    }) as this);
  }
}
export namespace UrlMessage {
  export type Data = {
    id: number;
    primary: ImmutableUrl | URL;
    secondary?: ImmutableUrl | URL | undefined;
    links: (URL | ImmutableUrl)[] | Iterable<URL | ImmutableUrl>;
  };
  export type Value = UrlMessage | UrlMessage.Data;
}
