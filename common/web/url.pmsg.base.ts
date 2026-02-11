/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from common/web/url.pmsg
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, isTaggedMessageData, parseCerealString, ensure, SKIP } from "../../runtime/index.js";

// @extend('./url.pmsg.ext.ts')
// @compact('U')
import type { MessagePropDescriptor, DataObject, SetUpdates } from "../../runtime/index.js";
const TYPE_TAG_ImmutableUrl$Base = Symbol("ImmutableUrl");
export class ImmutableUrl$Base extends Message<ImmutableUrl.Data> {
  static $typeId = "common/web/url.pmsg#ImmutableUrl";
  static $typeHash = "sha256:f66232bc5bfad325c017816ddf92e7d8eea8364b1c9c85bad84001911a9e9dc6";
  static $instanceTag = Symbol.for("propane:message:" + ImmutableUrl$Base.$typeId);
  static override readonly $compact = true;
  static override readonly $compactTag = "U";
  static readonly $typeName = "ImmutableUrl";
  static EMPTY: ImmutableUrl$Base;
  #href!: string;
  constructor(props?: ImmutableUrl.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && ImmutableUrl$Base.EMPTY) return ImmutableUrl$Base.EMPTY;
    super(TYPE_TAG_ImmutableUrl$Base, "ImmutableUrl");
    this.#href = (props ? props.href : "");
    if (!props) ImmutableUrl$Base.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<ImmutableUrl.Data>[] {
    return [{
      name: "href",
      fieldNumber: 1,
      getValue: () => this.#href
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): ImmutableUrl.Data {
    const props = {} as Partial<ImmutableUrl.Data>;
    const hrefValue = entries["1"] === undefined ? entries["href"] : entries["1"];
    if (hrefValue === undefined) throw new Error("Missing required property \"href\".");
    if (!(typeof hrefValue === "string")) throw new Error("Invalid value for property \"href\".");
    props.href = hrefValue;
    return props as ImmutableUrl.Data;
  }
  override toCompact(): string {
    return this.href;
  }
  static override fromCompact(...args: unknown[]) {
    const maybeOptions = args.at(-1);
    const options = typeof maybeOptions === "object" && maybeOptions !== null && "skipValidation" in maybeOptions ? maybeOptions as {
      skipValidation: boolean;
    } : undefined;
    const valueIndex = typeof maybeOptions === "object" && maybeOptions !== null && "skipValidation" in maybeOptions ? args.length - 2 : args.length - 1;
    const value = args[valueIndex];
    const resolvedValue = value === undefined && !(typeof maybeOptions === "object" && maybeOptions !== null && "skipValidation" in maybeOptions) && args.length > 1 ? args.at(-2) : value;
    if (typeof resolvedValue !== "string") throw new Error("Compact message fromCompact expects a string value.");
    return new (this as any)({
      href: resolvedValue
    }, options);
  }
  static from(value: ImmutableUrl.Value): ImmutableUrl$Base {
    return ImmutableUrl$Base.isInstance(value) ? value : new ImmutableUrl$Base(value);
  }
  static deserialize<T extends typeof ImmutableUrl$Base>(this: T, data: string, options?: {
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
            throw new Error("Invalid compact tagged value for ImmutableUrl.");
          }
        } else {
          return new this(this.prototype.$fromEntries(parsed.$data, options), options) as InstanceType<T>;
        }
      } else {
        throw new Error("Tagged message type mismatch: expected ImmutableUrl.");
      }
    }
    const payload = ensure.simpleObject(parsed);
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
  }
  get href(): string {
    return this.#href;
  }
  set(updates: Partial<SetUpdates<ImmutableUrl.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof ImmutableUrl$Base)(data) as this);
  }
  setHref(value: string) {
    return this.$update(new (this.constructor as typeof ImmutableUrl$Base)({
      href: value
    }) as this);
  }
}
export namespace ImmutableUrl {
  export type Data = {
    href: string;
  };
  export type Value = ImmutableUrl$Base | ImmutableUrl.Data;
}
