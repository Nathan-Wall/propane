/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from runtime/common/time/date.pmsg
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, parseCerealString, ensure, SKIP } from "../../pmsg-base.js";

// @extend('./date.pmsg.ext.ts')
// @compact
import type { MessagePropDescriptor, DataObject, SetUpdates } from "../../pmsg-base.js";
const TYPE_TAG_ImmutableDate$Base = Symbol("ImmutableDate");
export class ImmutableDate$Base extends Message<ImmutableDate.Data> {
  static $typeId = "runtime/common/time/date.pmsg#ImmutableDate";
  static $typeHash = "sha256:aa401276ed6b23307b915916c2cfa572399e5bc33853d52d07333d87a9a5d54f";
  static $instanceTag = Symbol.for("propane:message:" + ImmutableDate$Base.$typeId);
  static override readonly $compact = true;
  static readonly $typeName = "ImmutableDate";
  static EMPTY: ImmutableDate$Base;
  #epochMs!: number;
  constructor(props?: ImmutableDate.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && ImmutableDate$Base.EMPTY) return ImmutableDate$Base.EMPTY;
    super(TYPE_TAG_ImmutableDate$Base, "ImmutableDate");
    this.#epochMs = (props ? props.epochMs : 0) as number;
    if (!props) ImmutableDate$Base.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<ImmutableDate.Data>[] {
    return [{
      name: "epochMs",
      fieldNumber: 1,
      getValue: () => this.#epochMs
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): ImmutableDate.Data {
    const props = {} as Partial<ImmutableDate.Data>;
    const epochMsValue = entries["1"] === undefined ? entries["epochMs"] : entries["1"];
    if (epochMsValue === undefined) throw new Error("Missing required property \"epochMs\".");
    if (!(typeof epochMsValue === "number")) throw new Error("Invalid value for property \"epochMs\".");
    props.epochMs = epochMsValue as number;
    return props as ImmutableDate.Data;
  }
  static from(value: ImmutableDate.Value): ImmutableDate$Base {
    return value instanceof ImmutableDate$Base ? value : new ImmutableDate$Base(value);
  }
  static deserialize<T extends typeof ImmutableDate$Base>(this: T, data: string, options?: {
    skipValidation: boolean;
  }): InstanceType<T> {
    const payload = ensure.simpleObject(parseCerealString(data)) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
  }
  get epochMs(): number {
    return this.#epochMs;
  }
  set(updates: Partial<SetUpdates<ImmutableDate.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof ImmutableDate$Base)(data) as this);
  }
  setEpochMs(value: number) {
    return this.$update(new (this.constructor as typeof ImmutableDate$Base)({
      epochMs: value
    }) as this);
  }
}
export namespace ImmutableDate {
  export type Data = {
    epochMs: number;
  };
  export type Value = ImmutableDate$Base | ImmutableDate.Data;
}
