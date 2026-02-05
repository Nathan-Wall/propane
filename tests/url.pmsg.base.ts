/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/url.pmsg
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, isTaggedMessageData, parseCerealString, ensure, SKIP, ImmutableUrl, ImmutableArray } from "../runtime/index.js";
import type { MessagePropDescriptor, DataObject, ImmutableSet, ImmutableMap, SetUpdates } from "../runtime/index.js";
const TYPE_TAG_UrlMessage = Symbol("UrlMessage");
export class UrlMessage extends Message<UrlMessage.Data> {
  static $typeId = "tests/url.pmsg#UrlMessage";
  static $typeHash = "sha256:0bb0f99be123b9562973cc4470a88ac6e8fdcd15f40de40c5667fc83e356f13f";
  static $instanceTag = Symbol.for("propane:message:" + UrlMessage.$typeId);
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
    super(TYPE_TAG_UrlMessage, "UrlMessage");
    this.#id = (props ? props.id : 0) as number;
    this.#primary = props ? ImmutableUrl.isInstance(props.primary) ? props.primary : new ImmutableUrl(props.primary, options) : new ImmutableUrl();
    this.#secondary = props ? props.secondary === undefined ? props.secondary : ImmutableUrl.isInstance(props.secondary) ? props.secondary : new ImmutableUrl(props.secondary, options) : undefined;
    this.#links = props ? (props.links === undefined || props.links === null ? new ImmutableArray() : new ImmutableArray(Array.from(props.links as Iterable<unknown>).map(v => ImmutableUrl.isInstance(v) ? v : new ImmutableUrl(v as ImmutableUrl.Value)))) as ImmutableArray<ImmutableUrl> : new ImmutableArray();
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
      getValue: () => this.#links as (ImmutableUrl | URL)[] | Iterable<ImmutableUrl | URL>
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
    const primaryMessageValue = (value => {
      let result = value as any;
      if (typeof value === "string" && ImmutableUrl.$compact === true) {
        result = ImmutableUrl.fromCompact(ImmutableUrl.$compactTag && value.startsWith(ImmutableUrl.$compactTag) ? value.slice(ImmutableUrl.$compactTag.length) : value, options) as any;
      } else {
        if (isTaggedMessageData(value)) {
          if (value.$tag === "ImmutableUrl") {
            if (typeof value.$data === "string") {
              if (ImmutableUrl.$compact === true) {
                result = ImmutableUrl.fromCompact(ImmutableUrl.$compactTag && value.$data.startsWith(ImmutableUrl.$compactTag) ? value.$data.slice(ImmutableUrl.$compactTag.length) : value.$data, options) as any;
              } else {
                throw new Error("Invalid compact tagged value for ImmutableUrl.");
              }
            } else {
              result = new ImmutableUrl(ImmutableUrl.prototype.$fromEntries(value.$data, options), options);
            }
          } else {
            throw new Error("Tagged message type mismatch: expected ImmutableUrl.");
          }
        } else {
          if (ImmutableUrl.isInstance(value)) {
            result = value;
          } else {
            result = new ImmutableUrl(value as ImmutableUrl.Value, options);
          }
        }
      }
      return result;
    })(primaryValue);
    props.primary = primaryMessageValue as ImmutableUrl | URL;
    const secondaryValue = entries["3"] === undefined ? entries["secondary"] : entries["3"];
    const secondaryNormalized = secondaryValue === null ? undefined : secondaryValue;
    const secondaryMessageValue = (value => {
      let result = value as any;
      if (typeof value === "string" && ImmutableUrl.$compact === true) {
        result = ImmutableUrl.fromCompact(ImmutableUrl.$compactTag && value.startsWith(ImmutableUrl.$compactTag) ? value.slice(ImmutableUrl.$compactTag.length) : value, options) as any;
      } else {
        if (isTaggedMessageData(value)) {
          if (value.$tag === "ImmutableUrl") {
            if (typeof value.$data === "string") {
              if (ImmutableUrl.$compact === true) {
                result = ImmutableUrl.fromCompact(ImmutableUrl.$compactTag && value.$data.startsWith(ImmutableUrl.$compactTag) ? value.$data.slice(ImmutableUrl.$compactTag.length) : value.$data, options) as any;
              } else {
                throw new Error("Invalid compact tagged value for ImmutableUrl.");
              }
            } else {
              result = new ImmutableUrl(ImmutableUrl.prototype.$fromEntries(value.$data, options), options);
            }
          } else {
            throw new Error("Tagged message type mismatch: expected ImmutableUrl.");
          }
        } else {
          if (ImmutableUrl.isInstance(value)) {
            result = value;
          } else {
            result = new ImmutableUrl(value as ImmutableUrl.Value, options);
          }
        }
      }
      if (value === undefined) {
        result = value;
      }
      return result;
    })(secondaryNormalized);
    props.secondary = secondaryMessageValue as ImmutableUrl | URL;
    const linksValue = entries["4"] === undefined ? entries["links"] : entries["4"];
    if (linksValue === undefined) throw new Error("Missing required property \"links\".");
    const linksArrayValue = linksValue === undefined || linksValue === null ? new ImmutableArray() : ImmutableArray.isInstance(linksValue) ? linksValue : new ImmutableArray(linksValue as Iterable<unknown>);
    const linksArrayValueConverted = linksArrayValue === undefined || linksArrayValue === null ? linksArrayValue : (linksArrayValue as ImmutableArray<unknown> | unknown[]).map(element => typeof element === "string" && ImmutableUrl.$compact === true ? ImmutableUrl.fromCompact(ImmutableUrl.$compactTag && element.startsWith(ImmutableUrl.$compactTag) ? element.slice(ImmutableUrl.$compactTag.length) : element, options) as any : element);
    if (!(ImmutableArray.isInstance(linksArrayValueConverted) || Array.isArray(linksArrayValueConverted))) throw new Error("Invalid value for property \"links\".");
    props.links = linksArrayValueConverted as (ImmutableUrl | URL)[] | Iterable<ImmutableUrl | URL>;
    return props as UrlMessage.Data;
  }
  static from(value: UrlMessage.Value): UrlMessage {
    return UrlMessage.isInstance(value) ? value : new UrlMessage(value);
  }
  override [WITH_CHILD](key: string | number, child: unknown): this {
    switch (key) {
      case "primary":
        return new (this.constructor as typeof UrlMessage)({
          id: this.#id,
          primary: child as ImmutableUrl | URL,
          secondary: this.#secondary as ImmutableUrl | URL,
          links: this.#links as (ImmutableUrl | URL)[] | Iterable<ImmutableUrl | URL>
        }) as this;
      case "secondary":
        return new (this.constructor as typeof UrlMessage)({
          id: this.#id,
          primary: this.#primary as ImmutableUrl | URL,
          secondary: child as ImmutableUrl | URL,
          links: this.#links as (ImmutableUrl | URL)[] | Iterable<ImmutableUrl | URL>
        }) as this;
      case "links":
        return new (this.constructor as typeof UrlMessage)({
          id: this.#id,
          primary: this.#primary as ImmutableUrl | URL,
          secondary: this.#secondary as ImmutableUrl | URL,
          links: child as (ImmutableUrl | URL)[] | Iterable<ImmutableUrl | URL>
        }) as this;
      default:
        throw new Error(`Unknown key: ${key}`);
    }
  }
  override *[GET_MESSAGE_CHILDREN]() {
    yield ["primary", this.#primary] as unknown as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
    yield ["secondary", this.#secondary] as unknown as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
    yield ["links", this.#links] as unknown as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
  }
  static deserialize<T extends typeof UrlMessage>(this: T, data: string, options?: {
    skipValidation: boolean;
  }): InstanceType<T> {
    const parsed = parseCerealString(data);
    if (typeof parsed === "string") {
      if (this.$compact === true) {
        return this.fromCompact(this.$compactTag && parsed.startsWith(this.$compactTag) ? parsed.slice(this.$compactTag.length) : parsed, options) as InstanceType<T>;
      } else {
        throw new Error("Invalid compact message payload.");
      }
    }
    if (isTaggedMessageData(parsed)) {
      if (parsed.$tag === this.$typeName) {
        if (typeof parsed.$data === "string") {
          if (this.$compact === true) {
            return this.fromCompact(this.$compactTag && parsed.$data.startsWith(this.$compactTag) ? parsed.$data.slice(this.$compactTag.length) : parsed.$data, options) as InstanceType<T>;
          } else {
            throw new Error("Invalid compact tagged value for UrlMessage.");
          }
        } else {
          return new this(this.prototype.$fromEntries(parsed.$data, options), options) as InstanceType<T>;
        }
      } else {
        throw new Error("Tagged message type mismatch: expected UrlMessage.");
      }
    }
    const payload = ensure.simpleObject(parsed) as DataObject;
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
      links: linksNext as (ImmutableUrl | URL)[] | Iterable<ImmutableUrl | URL>
    }) as this);
  }
  fillLink(value: ImmutableUrl, start?: number, end?: number) {
    const linksArray = this.#links;
    const linksNext = [...linksArray];
    (linksNext as unknown as ImmutableUrl[]).fill(value, start, end);
    return this.$update(new (this.constructor as typeof UrlMessage)({
      id: this.#id,
      primary: this.#primary as ImmutableUrl | URL,
      secondary: this.#secondary as ImmutableUrl | URL,
      links: linksNext as (ImmutableUrl | URL)[] | Iterable<ImmutableUrl | URL>
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
      links: linksNext as (ImmutableUrl | URL)[] | Iterable<ImmutableUrl | URL>
    }) as this);
  }
  pushLink(...values: ImmutableUrl[]) {
    if (values.length === 0) return this;
    const linksArray = this.#links;
    const linksNext = [...linksArray, ...values];
    return this.$update(new (this.constructor as typeof UrlMessage)({
      id: this.#id,
      primary: this.#primary as ImmutableUrl | URL,
      secondary: this.#secondary as ImmutableUrl | URL,
      links: linksNext as (ImmutableUrl | URL)[] | Iterable<ImmutableUrl | URL>
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
      links: linksNext as (ImmutableUrl | URL)[] | Iterable<ImmutableUrl | URL>
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
      links: this.#links as (ImmutableUrl | URL)[] | Iterable<ImmutableUrl | URL>
    }) as this);
  }
  setLinks(value: (ImmutableUrl | URL)[] | Iterable<ImmutableUrl | URL>) {
    return this.$update(new (this.constructor as typeof UrlMessage)({
      id: this.#id,
      primary: this.#primary as ImmutableUrl | URL,
      secondary: this.#secondary as ImmutableUrl | URL,
      links: value as (ImmutableUrl | URL)[] | Iterable<ImmutableUrl | URL>
    }) as this);
  }
  setPrimary(value: ImmutableUrl | URL) {
    return this.$update(new (this.constructor as typeof UrlMessage)({
      id: this.#id,
      primary: (ImmutableUrl.isInstance(value) ? value : new ImmutableUrl(value)) as ImmutableUrl | URL,
      secondary: this.#secondary as ImmutableUrl | URL,
      links: this.#links as (ImmutableUrl | URL)[] | Iterable<ImmutableUrl | URL>
    }) as this);
  }
  setSecondary(value: ImmutableUrl | URL | undefined) {
    return this.$update(new (this.constructor as typeof UrlMessage)({
      id: this.#id,
      primary: this.#primary as ImmutableUrl | URL,
      secondary: (value === undefined ? value : ImmutableUrl.isInstance(value) ? value : new ImmutableUrl(value)) as ImmutableUrl | URL,
      links: this.#links as (ImmutableUrl | URL)[] | Iterable<ImmutableUrl | URL>
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
      links: linksNext as (ImmutableUrl | URL)[] | Iterable<ImmutableUrl | URL>
    }) as this);
  }
  sortLinks(compareFn?: (a: ImmutableUrl, b: ImmutableUrl) => number) {
    const linksArray = this.#links;
    const linksNext = [...linksArray];
    (linksNext as unknown as ImmutableUrl[]).sort(compareFn);
    return this.$update(new (this.constructor as typeof UrlMessage)({
      id: this.#id,
      primary: this.#primary as ImmutableUrl | URL,
      secondary: this.#secondary as ImmutableUrl | URL,
      links: linksNext as (ImmutableUrl | URL)[] | Iterable<ImmutableUrl | URL>
    }) as this);
  }
  spliceLink(start: number, deleteCount?: number, ...items: ImmutableUrl[]) {
    const linksArray = this.#links;
    const linksNext = [...linksArray];
    linksNext.splice(start, ...(deleteCount !== undefined ? [deleteCount] : []), ...items);
    return this.$update(new (this.constructor as typeof UrlMessage)({
      id: this.#id,
      primary: this.#primary as ImmutableUrl | URL,
      secondary: this.#secondary as ImmutableUrl | URL,
      links: linksNext as (ImmutableUrl | URL)[] | Iterable<ImmutableUrl | URL>
    }) as this);
  }
  unsetSecondary() {
    return this.$update(new (this.constructor as typeof UrlMessage)({
      id: this.#id,
      primary: this.#primary as ImmutableUrl | URL,
      links: this.#links as (ImmutableUrl | URL)[] | Iterable<ImmutableUrl | URL>
    }) as this);
  }
  unshiftLink(...values: ImmutableUrl[]) {
    if (values.length === 0) return this;
    const linksArray = this.#links;
    const linksNext = [...values, ...linksArray];
    return this.$update(new (this.constructor as typeof UrlMessage)({
      id: this.#id,
      primary: this.#primary as ImmutableUrl | URL,
      secondary: this.#secondary as ImmutableUrl | URL,
      links: linksNext as (ImmutableUrl | URL)[] | Iterable<ImmutableUrl | URL>
    }) as this);
  }
}
export namespace UrlMessage {
  export type Data = {
    id: number;
    primary: ImmutableUrl | URL;
    secondary?: ImmutableUrl | URL | undefined;
    links: (ImmutableUrl | URL)[] | Iterable<ImmutableUrl | URL>;
  };
  export type Value = UrlMessage | UrlMessage.Data;
}
