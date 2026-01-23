/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/ambiguous-union.pmsg
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, ImmutableMap, ImmutableSet, ImmutableArray, equals, isTaggedMessageData, parseCerealString, ensure, SKIP, ValidationError } from "../runtime/index.js";
import type { MessagePropDescriptor, DataObject, SetUpdates } from "../runtime/index.js";
const TYPE_TAG_Alpha = Symbol("Alpha");
export class Alpha extends Message<Alpha.Data> {
  static $typeId = "tests/ambiguous-union.pmsg#Alpha";
  static $typeHash = "sha256:f835bf77c106ac1e30631ee5a01a2e7cba6488b76f243871059c65d93ccfd0a0";
  static $instanceTag = Symbol.for("propane:message:" + Alpha.$typeId);
  static readonly $typeName = "Alpha";
  static EMPTY: Alpha;
  #name!: string;
  constructor(props?: Alpha.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && Alpha.EMPTY) return Alpha.EMPTY;
    super(TYPE_TAG_Alpha, "Alpha");
    this.#name = (props ? props.name : "") as string;
    if (!props) Alpha.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<Alpha.Data>[] {
    return [{
      name: "name",
      fieldNumber: null,
      getValue: () => this.#name
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): Alpha.Data {
    const props = {} as Partial<Alpha.Data>;
    const nameValue = entries["name"];
    if (nameValue === undefined) throw new Error("Missing required property \"name\".");
    if (!(typeof nameValue === "string")) throw new Error("Invalid value for property \"name\".");
    props.name = nameValue as string;
    return props as Alpha.Data;
  }
  static from(value: Alpha.Value): Alpha {
    return value instanceof Alpha ? value : new Alpha(value);
  }
  static deserialize<T extends typeof Alpha>(this: T, data: string, options?: {
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
            throw new Error("Invalid compact tagged value for Alpha.");
          }
        } else {
          return new this(this.prototype.$fromEntries(parsed.$data, options), options) as InstanceType<T>;
        }
      } else {
        throw new Error("Tagged message type mismatch: expected Alpha.");
      }
    }
    const payload = ensure.simpleObject(parsed) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
  }
  get name(): string {
    return this.#name;
  }
  set(updates: Partial<SetUpdates<Alpha.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof Alpha)(data) as this);
  }
  setName(value: string) {
    return this.$update(new (this.constructor as typeof Alpha)({
      name: value
    }) as this);
  }
}
export namespace Alpha {
  export type Data = {
    name: string;
  };
  export type Value = Alpha | Alpha.Data;
}
const TYPE_TAG_Beta = Symbol("Beta");
export class Beta extends Message<Beta.Data> {
  static $typeId = "tests/ambiguous-union.pmsg#Beta";
  static $typeHash = "sha256:f835bf77c106ac1e30631ee5a01a2e7cba6488b76f243871059c65d93ccfd0a0";
  static $instanceTag = Symbol.for("propane:message:" + Beta.$typeId);
  static readonly $typeName = "Beta";
  static EMPTY: Beta;
  #name!: string;
  constructor(props?: Beta.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && Beta.EMPTY) return Beta.EMPTY;
    super(TYPE_TAG_Beta, "Beta");
    this.#name = (props ? props.name : "") as string;
    if (!props) Beta.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<Beta.Data>[] {
    return [{
      name: "name",
      fieldNumber: null,
      getValue: () => this.#name
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): Beta.Data {
    const props = {} as Partial<Beta.Data>;
    const nameValue = entries["name"];
    if (nameValue === undefined) throw new Error("Missing required property \"name\".");
    if (!(typeof nameValue === "string")) throw new Error("Invalid value for property \"name\".");
    props.name = nameValue as string;
    return props as Beta.Data;
  }
  static from(value: Beta.Value): Beta {
    return value instanceof Beta ? value : new Beta(value);
  }
  static deserialize<T extends typeof Beta>(this: T, data: string, options?: {
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
            throw new Error("Invalid compact tagged value for Beta.");
          }
        } else {
          return new this(this.prototype.$fromEntries(parsed.$data, options), options) as InstanceType<T>;
        }
      } else {
        throw new Error("Tagged message type mismatch: expected Beta.");
      }
    }
    const payload = ensure.simpleObject(parsed) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
  }
  get name(): string {
    return this.#name;
  }
  set(updates: Partial<SetUpdates<Beta.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof Beta)(data) as this);
  }
  setName(value: string) {
    return this.$update(new (this.constructor as typeof Beta)({
      name: value
    }) as this);
  }
}
export namespace Beta {
  export type Data = {
    name: string;
  };
  export type Value = Beta | Beta.Data;
}
const TYPE_TAG_Wrapper = Symbol("Wrapper");
export class Wrapper extends Message<Wrapper.Data> {
  static $typeId = "tests/ambiguous-union.pmsg#Wrapper";
  static $typeHash = "sha256:077e3c3fd049909057ddca4c506d8e4f032fb60e28fbddea825811df2a66cb30";
  static $instanceTag = Symbol.for("propane:message:" + Wrapper.$typeId);
  static readonly $typeName = "Wrapper";
  static EMPTY: Wrapper;
  #union!: Alpha | Beta;
  #list!: ImmutableArray<(Alpha | Beta)> | undefined;
  #itemSet!: ImmutableSet<Alpha | Beta> | undefined;
  #map!: ImmutableMap<string, Alpha | Beta> | undefined;
  constructor(props?: Wrapper.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && Wrapper.EMPTY) return Wrapper.EMPTY;
    super(TYPE_TAG_Wrapper, "Wrapper");
    if (!options?.skipValidation) {
      this.#validate(props);
    }
    this.#union = (props ? (value => {
      let result = value as any;
      const isMessage = Message.isMessage(value);
      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        let matched = false;
        if (!matched) {
          if (Alpha.isInstance(value)) {
            result = value as any;
            matched = true;
          } else {
            if (!isMessage) {
              try {
                result = new Alpha(value as any, options);
                matched = true;
              } catch (e) {}
            }
          }
        }
        if (!matched) {
          if (Beta.isInstance(value)) {
            result = value as any;
            matched = true;
          } else {
            if (!isMessage) {
              try {
                result = new Beta(value as any, options);
                matched = true;
              } catch (e) {}
            }
          }
        }
      }
      return result;
    })(props.union) : new Alpha()) as Alpha | Beta;
    this.#list = props ? (props.list === undefined || props.list === null ? props.list : props.list as object instanceof ImmutableArray ? props.list : new ImmutableArray(props.list as Iterable<unknown>)) as ImmutableArray<(Alpha | Beta)> : undefined;
    this.#itemSet = props ? (props.itemSet === undefined || props.itemSet === null ? props.itemSet : props.itemSet as object instanceof ImmutableSet ? props.itemSet : new ImmutableSet(props.itemSet as Iterable<unknown>)) as ImmutableSet<Alpha | Beta> : undefined;
    this.#map = props ? (props.map === undefined || props.map === null ? props.map : props.map as object instanceof ImmutableMap ? props.map : new ImmutableMap(props.map as Iterable<[unknown, unknown]>)) as ImmutableMap<string, Alpha | Beta> : undefined;
    if (!props) Wrapper.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<Wrapper.Data>[] {
    return [{
      name: "union",
      fieldNumber: null,
      getValue: () => this.#union as Alpha | Beta,
      unionMessageTypes: ["Alpha", "Beta"]
    }, {
      name: "list",
      fieldNumber: null,
      getValue: () => this.#list as (Alpha | Beta)[] | Iterable<(Alpha | Beta)>,
      arrayElementUnionMessageTypes: ["Alpha", "Beta"]
    }, {
      name: "itemSet",
      fieldNumber: null,
      getValue: () => this.#itemSet as Set<Alpha | Beta> | Iterable<Alpha | Beta>,
      setElementUnionMessageTypes: ["Alpha", "Beta"]
    }, {
      name: "map",
      fieldNumber: null,
      getValue: () => this.#map as Map<string, Alpha | Beta> | Iterable<[string, Alpha | Beta]>,
      mapValueUnionMessageTypes: ["Alpha", "Beta"]
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): Wrapper.Data {
    const props = {} as Partial<Wrapper.Data>;
    const unionValue = entries["union"];
    if (unionValue === undefined) throw new Error("Missing required property \"union\".");
    let unionUnionValue: any = unionValue as any;
    if (isTaggedMessageData(unionValue)) {
      if (unionValue.$tag === "Alpha") {
        if (typeof unionValue.$data === "string") {
          if (Alpha.$compact === true) {
            unionUnionValue = Alpha.fromCompact(Alpha.$compactTag && unionValue.$data.startsWith(Alpha.$compactTag) ? unionValue.$data.slice(Alpha.$compactTag.length) : unionValue.$data, options);
          } else {
            throw new Error("Invalid compact tagged value for property \"union\" (Alpha).");
          }
        } else {
          unionUnionValue = new Alpha(Alpha.prototype.$fromEntries(unionValue.$data, options), options);
        }
      } else if (unionValue.$tag === "Beta") {
        if (typeof unionValue.$data === "string") {
          if (Beta.$compact === true) {
            unionUnionValue = Beta.fromCompact(Beta.$compactTag && unionValue.$data.startsWith(Beta.$compactTag) ? unionValue.$data.slice(Beta.$compactTag.length) : unionValue.$data, options);
          } else {
            throw new Error("Invalid compact tagged value for property \"union\" (Beta).");
          }
        } else {
          unionUnionValue = new Beta(Beta.prototype.$fromEntries(unionValue.$data, options), options);
        }
      }
    }
    if (typeof unionValue === "string") {
      if (Alpha.$compactTag && unionValue.startsWith(Alpha.$compactTag)) {
        if (Alpha.$compact === true) {
          unionUnionValue = Alpha.fromCompact(Alpha.$compactTag && unionValue.startsWith(Alpha.$compactTag) ? unionValue.slice(Alpha.$compactTag.length) : unionValue, options);
        } else {
          throw new Error("Invalid compact tagged value for property \"union\" (Alpha).");
        }
      } else if (Beta.$compactTag && unionValue.startsWith(Beta.$compactTag)) {
        if (Beta.$compact === true) {
          unionUnionValue = Beta.fromCompact(Beta.$compactTag && unionValue.startsWith(Beta.$compactTag) ? unionValue.slice(Beta.$compactTag.length) : unionValue, options);
        } else {
          throw new Error("Invalid compact tagged value for property \"union\" (Beta).");
        }
      }
    }
    if (!isTaggedMessageData(unionValue) && typeof unionValue === "object" && unionValue !== null) {
      let unionUnionValueMatched = false;
      if (!unionUnionValueMatched) {
        if (unionValue as object instanceof Alpha) {
          unionUnionValue = unionValue as any;
          unionUnionValueMatched = true;
        } else {
          try {
            unionUnionValue = new Alpha(Alpha.prototype.$fromEntries(unionValue as Record<string, unknown>, options), options);
            unionUnionValueMatched = true;
          } catch (e) {}
        }
      }
      if (!unionUnionValueMatched) {
        if (unionValue as object instanceof Beta) {
          unionUnionValue = unionValue as any;
          unionUnionValueMatched = true;
        } else {
          try {
            unionUnionValue = new Beta(Beta.prototype.$fromEntries(unionValue as Record<string, unknown>, options), options);
            unionUnionValueMatched = true;
          } catch (e) {}
        }
      }
    }
    if (!(Alpha.isInstance(unionUnionValue) || Beta.isInstance(unionUnionValue))) throw new Error("Invalid value for property \"union\".");
    props.union = unionUnionValue;
    const listValue = entries["list"];
    const listNormalized = listValue === null ? undefined : listValue;
    const listArrayValue = listNormalized === undefined || listNormalized === null ? listNormalized : listNormalized as object instanceof ImmutableArray ? listNormalized : new ImmutableArray(listNormalized as Iterable<unknown>);
    const listArrayValueConverted = listArrayValue === undefined || listArrayValue === null ? listArrayValue : (listArrayValue as ImmutableArray<unknown> | unknown[]).map(element => (value => {
      let unionValue: any = value as any;
      if (isTaggedMessageData(value)) {
        if (value.$tag === "Alpha") {
          if (typeof value.$data === "string") {
            if (Alpha.$compact === true) {
              unionValue = Alpha.fromCompact(Alpha.$compactTag && value.$data.startsWith(Alpha.$compactTag) ? value.$data.slice(Alpha.$compactTag.length) : value.$data, options);
            } else {
              throw new Error("Invalid compact tagged value for property \"list element\" (Alpha).");
            }
          } else {
            unionValue = new Alpha(Alpha.prototype.$fromEntries(value.$data, options), options);
          }
        } else if (value.$tag === "Beta") {
          if (typeof value.$data === "string") {
            if (Beta.$compact === true) {
              unionValue = Beta.fromCompact(Beta.$compactTag && value.$data.startsWith(Beta.$compactTag) ? value.$data.slice(Beta.$compactTag.length) : value.$data, options);
            } else {
              throw new Error("Invalid compact tagged value for property \"list element\" (Beta).");
            }
          } else {
            unionValue = new Beta(Beta.prototype.$fromEntries(value.$data, options), options);
          }
        }
      }
      if (typeof value === "string") {
        if (Alpha.$compactTag && value.startsWith(Alpha.$compactTag)) {
          if (Alpha.$compact === true) {
            unionValue = Alpha.fromCompact(Alpha.$compactTag && value.startsWith(Alpha.$compactTag) ? value.slice(Alpha.$compactTag.length) : value, options);
          } else {
            throw new Error("Invalid compact tagged value for property \"list element\" (Alpha).");
          }
        } else if (Beta.$compactTag && value.startsWith(Beta.$compactTag)) {
          if (Beta.$compact === true) {
            unionValue = Beta.fromCompact(Beta.$compactTag && value.startsWith(Beta.$compactTag) ? value.slice(Beta.$compactTag.length) : value, options);
          } else {
            throw new Error("Invalid compact tagged value for property \"list element\" (Beta).");
          }
        }
      }
      if (!isTaggedMessageData(value) && typeof value === "object" && value !== null) {
        let unionValueMatched = false;
        if (!unionValueMatched) {
          if (value as object instanceof Alpha) {
            unionValue = value as any;
            unionValueMatched = true;
          } else {
            try {
              unionValue = new Alpha(Alpha.prototype.$fromEntries(value as Record<string, unknown>, options), options);
              unionValueMatched = true;
            } catch (e) {}
          }
        }
        if (!unionValueMatched) {
          if (value as object instanceof Beta) {
            unionValue = value as any;
            unionValueMatched = true;
          } else {
            try {
              unionValue = new Beta(Beta.prototype.$fromEntries(value as Record<string, unknown>, options), options);
              unionValueMatched = true;
            } catch (e) {}
          }
        }
      }
      return unionValue;
    })(element));
    if (listArrayValueConverted !== undefined && !(listArrayValueConverted as object instanceof ImmutableArray || Array.isArray(listArrayValueConverted))) throw new Error("Invalid value for property \"list\".");
    props.list = listArrayValueConverted as (Alpha | Beta)[] | Iterable<(Alpha | Beta)>;
    const itemSetValue = entries["itemSet"];
    const itemSetNormalized = itemSetValue === null ? undefined : itemSetValue;
    const itemSetSetValue = itemSetNormalized === undefined || itemSetNormalized === null ? itemSetNormalized : itemSetNormalized as object instanceof ImmutableSet ? itemSetNormalized : new ImmutableSet(itemSetNormalized as Iterable<unknown>);
    const itemSetSetValueConverted = itemSetSetValue === undefined || itemSetSetValue === null ? itemSetSetValue : new ImmutableSet(Array.from(itemSetSetValue as Iterable<unknown>, element => (value => {
      let unionValue: any = value as any;
      if (isTaggedMessageData(value)) {
        if (value.$tag === "Alpha") {
          if (typeof value.$data === "string") {
            if (Alpha.$compact === true) {
              unionValue = Alpha.fromCompact(Alpha.$compactTag && value.$data.startsWith(Alpha.$compactTag) ? value.$data.slice(Alpha.$compactTag.length) : value.$data, options);
            } else {
              throw new Error("Invalid compact tagged value for property \"itemSet element\" (Alpha).");
            }
          } else {
            unionValue = new Alpha(Alpha.prototype.$fromEntries(value.$data, options), options);
          }
        } else if (value.$tag === "Beta") {
          if (typeof value.$data === "string") {
            if (Beta.$compact === true) {
              unionValue = Beta.fromCompact(Beta.$compactTag && value.$data.startsWith(Beta.$compactTag) ? value.$data.slice(Beta.$compactTag.length) : value.$data, options);
            } else {
              throw new Error("Invalid compact tagged value for property \"itemSet element\" (Beta).");
            }
          } else {
            unionValue = new Beta(Beta.prototype.$fromEntries(value.$data, options), options);
          }
        }
      }
      if (typeof value === "string") {
        if (Alpha.$compactTag && value.startsWith(Alpha.$compactTag)) {
          if (Alpha.$compact === true) {
            unionValue = Alpha.fromCompact(Alpha.$compactTag && value.startsWith(Alpha.$compactTag) ? value.slice(Alpha.$compactTag.length) : value, options);
          } else {
            throw new Error("Invalid compact tagged value for property \"itemSet element\" (Alpha).");
          }
        } else if (Beta.$compactTag && value.startsWith(Beta.$compactTag)) {
          if (Beta.$compact === true) {
            unionValue = Beta.fromCompact(Beta.$compactTag && value.startsWith(Beta.$compactTag) ? value.slice(Beta.$compactTag.length) : value, options);
          } else {
            throw new Error("Invalid compact tagged value for property \"itemSet element\" (Beta).");
          }
        }
      }
      if (!isTaggedMessageData(value) && typeof value === "object" && value !== null) {
        let unionValueMatched = false;
        if (!unionValueMatched) {
          if (value as object instanceof Alpha) {
            unionValue = value as any;
            unionValueMatched = true;
          } else {
            try {
              unionValue = new Alpha(Alpha.prototype.$fromEntries(value as Record<string, unknown>, options), options);
              unionValueMatched = true;
            } catch (e) {}
          }
        }
        if (!unionValueMatched) {
          if (value as object instanceof Beta) {
            unionValue = value as any;
            unionValueMatched = true;
          } else {
            try {
              unionValue = new Beta(Beta.prototype.$fromEntries(value as Record<string, unknown>, options), options);
              unionValueMatched = true;
            } catch (e) {}
          }
        }
      }
      return unionValue;
    })(element)));
    if (itemSetSetValueConverted !== undefined && !(itemSetSetValueConverted as object instanceof ImmutableSet || itemSetSetValueConverted as object instanceof Set)) throw new Error("Invalid value for property \"itemSet\".");
    props.itemSet = itemSetSetValueConverted as Set<Alpha | Beta> | Iterable<Alpha | Beta>;
    const mapValue = entries["map"];
    const mapNormalized = mapValue === null ? undefined : mapValue;
    const mapMapValue = mapNormalized === undefined || mapNormalized === null ? mapNormalized : mapNormalized as object instanceof ImmutableMap ? mapNormalized : new ImmutableMap(mapNormalized as Iterable<[unknown, unknown]>);
    const mapMapValueConverted = mapMapValue === undefined || mapMapValue === null ? mapMapValue : new ImmutableMap([...(mapMapValue as Iterable<[unknown, unknown]>)].map(([k, v]) => [k, (value => {
      let unionValue: any = value as any;
      if (isTaggedMessageData(value)) {
        if (value.$tag === "Alpha") {
          if (typeof value.$data === "string") {
            if (Alpha.$compact === true) {
              unionValue = Alpha.fromCompact(Alpha.$compactTag && value.$data.startsWith(Alpha.$compactTag) ? value.$data.slice(Alpha.$compactTag.length) : value.$data, options);
            } else {
              throw new Error("Invalid compact tagged value for property \"map value\" (Alpha).");
            }
          } else {
            unionValue = new Alpha(Alpha.prototype.$fromEntries(value.$data, options), options);
          }
        } else if (value.$tag === "Beta") {
          if (typeof value.$data === "string") {
            if (Beta.$compact === true) {
              unionValue = Beta.fromCompact(Beta.$compactTag && value.$data.startsWith(Beta.$compactTag) ? value.$data.slice(Beta.$compactTag.length) : value.$data, options);
            } else {
              throw new Error("Invalid compact tagged value for property \"map value\" (Beta).");
            }
          } else {
            unionValue = new Beta(Beta.prototype.$fromEntries(value.$data, options), options);
          }
        }
      }
      if (typeof value === "string") {
        if (Alpha.$compactTag && value.startsWith(Alpha.$compactTag)) {
          if (Alpha.$compact === true) {
            unionValue = Alpha.fromCompact(Alpha.$compactTag && value.startsWith(Alpha.$compactTag) ? value.slice(Alpha.$compactTag.length) : value, options);
          } else {
            throw new Error("Invalid compact tagged value for property \"map value\" (Alpha).");
          }
        } else if (Beta.$compactTag && value.startsWith(Beta.$compactTag)) {
          if (Beta.$compact === true) {
            unionValue = Beta.fromCompact(Beta.$compactTag && value.startsWith(Beta.$compactTag) ? value.slice(Beta.$compactTag.length) : value, options);
          } else {
            throw new Error("Invalid compact tagged value for property \"map value\" (Beta).");
          }
        }
      }
      if (!isTaggedMessageData(value) && typeof value === "object" && value !== null) {
        let unionValueMatched = false;
        if (!unionValueMatched) {
          if (value as object instanceof Alpha) {
            unionValue = value as any;
            unionValueMatched = true;
          } else {
            try {
              unionValue = new Alpha(Alpha.prototype.$fromEntries(value as Record<string, unknown>, options), options);
              unionValueMatched = true;
            } catch (e) {}
          }
        }
        if (!unionValueMatched) {
          if (value as object instanceof Beta) {
            unionValue = value as any;
            unionValueMatched = true;
          } else {
            try {
              unionValue = new Beta(Beta.prototype.$fromEntries(value as Record<string, unknown>, options), options);
              unionValueMatched = true;
            } catch (e) {}
          }
        }
      }
      return unionValue;
    })(v)]));
    if (mapMapValueConverted !== undefined && !((mapMapValueConverted as object instanceof ImmutableMap || mapMapValueConverted as object instanceof Map) && [...(mapMapValueConverted as ReadonlyMap<unknown, unknown>).entries()].every(([mapKey, mapValue]) => typeof mapKey === "string"))) throw new Error("Invalid value for property \"map\".");
    props.map = mapMapValueConverted as Map<string, Alpha | Beta> | Iterable<[string, Alpha | Beta]>;
    return props as Wrapper.Data;
  }
  static from(value: Wrapper.Value): Wrapper {
    return value instanceof Wrapper ? value : new Wrapper(value);
  }
  #validate(data: Wrapper.Value | undefined) {
    if (data === undefined) return;
  }
  static validateAll(data: Wrapper.Data): ValidationError[] {
    const errors = [] as ValidationError[];
    try {} catch (e) {
      if (e instanceof ValidationError) errors.push(e);else throw e;
    }
    return errors;
  }
  override [WITH_CHILD](key: string | number, child: unknown): this {
    switch (key) {
      case "list":
        return new (this.constructor as typeof Wrapper)({
          union: this.#union as Alpha | Beta,
          list: child as (Alpha | Beta)[] | Iterable<(Alpha | Beta)>,
          itemSet: this.#itemSet as Set<Alpha | Beta> | Iterable<Alpha | Beta>,
          map: this.#map as Map<string, Alpha | Beta> | Iterable<[string, Alpha | Beta]>
        }) as this;
      case "itemSet":
        return new (this.constructor as typeof Wrapper)({
          union: this.#union as Alpha | Beta,
          list: this.#list as (Alpha | Beta)[] | Iterable<(Alpha | Beta)>,
          itemSet: child as Set<Alpha | Beta> | Iterable<Alpha | Beta>,
          map: this.#map as Map<string, Alpha | Beta> | Iterable<[string, Alpha | Beta]>
        }) as this;
      case "map":
        return new (this.constructor as typeof Wrapper)({
          union: this.#union as Alpha | Beta,
          list: this.#list as (Alpha | Beta)[] | Iterable<(Alpha | Beta)>,
          itemSet: this.#itemSet as Set<Alpha | Beta> | Iterable<Alpha | Beta>,
          map: child as Map<string, Alpha | Beta> | Iterable<[string, Alpha | Beta]>
        }) as this;
      default:
        throw new Error(`Unknown key: ${key}`);
    }
  }
  override *[GET_MESSAGE_CHILDREN]() {
    yield ["list", this.#list] as unknown as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
    yield ["itemSet", this.#itemSet] as unknown as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
    yield ["map", this.#map] as unknown as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
  }
  static deserialize<T extends typeof Wrapper>(this: T, data: string, options?: {
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
            throw new Error("Invalid compact tagged value for Wrapper.");
          }
        } else {
          return new this(this.prototype.$fromEntries(parsed.$data, options), options) as InstanceType<T>;
        }
      } else {
        throw new Error("Tagged message type mismatch: expected Wrapper.");
      }
    }
    const payload = ensure.simpleObject(parsed) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
  }
  get union(): Alpha | Beta {
    return this.#union;
  }
  get list(): ImmutableArray<(Alpha | Beta)> | undefined {
    return this.#list;
  }
  get itemSet(): ImmutableSet<Alpha | Beta> | undefined {
    return this.#itemSet;
  }
  get map(): ImmutableMap<string, Alpha | Beta> | undefined {
    return this.#map;
  }
  addItemSet(value: Alpha | Beta) {
    const itemSetSetSource = this.itemSet ?? [];
    const itemSetSetEntries = [...itemSetSetSource];
    const itemSetSetNext = new Set(itemSetSetEntries);
    itemSetSetNext.add(value);
    if (this.itemSet === itemSetSetNext as unknown || this.itemSet?.equals(itemSetSetNext)) return this;
    return this.$update(new (this.constructor as typeof Wrapper)({
      union: this.#union as Alpha | Beta,
      list: this.#list as (Alpha | Beta)[] | Iterable<(Alpha | Beta)>,
      itemSet: itemSetSetNext as Set<Alpha | Beta> | Iterable<Alpha | Beta>,
      map: this.#map as Map<string, Alpha | Beta> | Iterable<[string, Alpha | Beta]>
    }) as this);
  }
  addItemSets(values: Iterable<Alpha | Beta>) {
    const itemSetSetSource = this.itemSet ?? [];
    const itemSetSetEntries = [...itemSetSetSource];
    const itemSetSetNext = new Set(itemSetSetEntries);
    for (const toAdd of values) {
      itemSetSetNext.add(toAdd);
    }
    if (this.itemSet === itemSetSetNext as unknown || this.itemSet?.equals(itemSetSetNext)) return this;
    return this.$update(new (this.constructor as typeof Wrapper)({
      union: this.#union as Alpha | Beta,
      list: this.#list as (Alpha | Beta)[] | Iterable<(Alpha | Beta)>,
      itemSet: itemSetSetNext as Set<Alpha | Beta> | Iterable<Alpha | Beta>,
      map: this.#map as Map<string, Alpha | Beta> | Iterable<[string, Alpha | Beta]>
    }) as this);
  }
  clearItemSet() {
    const itemSetSetSource = this.itemSet ?? [];
    const itemSetSetEntries = [...itemSetSetSource];
    const itemSetSetNext = new Set(itemSetSetEntries);
    itemSetSetNext.clear();
    if (this.itemSet === itemSetSetNext as unknown || this.itemSet?.equals(itemSetSetNext)) return this;
    return this.$update(new (this.constructor as typeof Wrapper)({
      union: this.#union as Alpha | Beta,
      list: this.#list as (Alpha | Beta)[] | Iterable<(Alpha | Beta)>,
      itemSet: itemSetSetNext as Set<Alpha | Beta> | Iterable<Alpha | Beta>,
      map: this.#map as Map<string, Alpha | Beta> | Iterable<[string, Alpha | Beta]>
    }) as this);
  }
  clearMap() {
    const mapCurrent = this.map;
    if (mapCurrent === undefined || mapCurrent.size === 0) return this;
    const mapMapSource = this.#map;
    const mapMapEntries = mapMapSource === undefined ? [] : [...mapMapSource.entries()];
    const mapMapNext = new Map(mapMapEntries);
    mapMapNext.clear();
    return this.$update(new (this.constructor as typeof Wrapper)({
      union: this.#union as Alpha | Beta,
      list: this.#list as (Alpha | Beta)[] | Iterable<(Alpha | Beta)>,
      itemSet: this.#itemSet as Set<Alpha | Beta> | Iterable<Alpha | Beta>,
      map: mapMapNext as Map<string, Alpha | Beta> | Iterable<[string, Alpha | Beta]>
    }) as this);
  }
  copyWithinList(target: number, start: number, end?: number) {
    const listArray = this.#list === undefined ? [] : this.#list;
    const listNext = [...listArray];
    listNext.copyWithin(target, start, end);
    return this.$update(new (this.constructor as typeof Wrapper)({
      union: this.#union as Alpha | Beta,
      list: listNext as (Alpha | Beta)[] | Iterable<(Alpha | Beta)>,
      itemSet: this.#itemSet as Set<Alpha | Beta> | Iterable<Alpha | Beta>,
      map: this.#map as Map<string, Alpha | Beta> | Iterable<[string, Alpha | Beta]>
    }) as this);
  }
  deleteItemSet(value: Alpha | Beta) {
    const itemSetSetSource = this.itemSet ?? [];
    const itemSetSetEntries = [...itemSetSetSource];
    const itemSetSetNext = new Set(itemSetSetEntries);
    itemSetSetNext.delete(value);
    if (this.itemSet === itemSetSetNext as unknown || this.itemSet?.equals(itemSetSetNext)) return this;
    return this.$update(new (this.constructor as typeof Wrapper)({
      union: this.#union as Alpha | Beta,
      list: this.#list as (Alpha | Beta)[] | Iterable<(Alpha | Beta)>,
      itemSet: itemSetSetNext as Set<Alpha | Beta> | Iterable<Alpha | Beta>,
      map: this.#map as Map<string, Alpha | Beta> | Iterable<[string, Alpha | Beta]>
    }) as this);
  }
  deleteItemSets(values: Iterable<Alpha | Beta>) {
    const itemSetSetSource = this.itemSet ?? [];
    const itemSetSetEntries = [...itemSetSetSource];
    const itemSetSetNext = new Set(itemSetSetEntries);
    for (const del of values) {
      itemSetSetNext.delete(del);
    }
    if (this.itemSet === itemSetSetNext as unknown || this.itemSet?.equals(itemSetSetNext)) return this;
    return this.$update(new (this.constructor as typeof Wrapper)({
      union: this.#union as Alpha | Beta,
      list: this.#list as (Alpha | Beta)[] | Iterable<(Alpha | Beta)>,
      itemSet: itemSetSetNext as Set<Alpha | Beta> | Iterable<Alpha | Beta>,
      map: this.#map as Map<string, Alpha | Beta> | Iterable<[string, Alpha | Beta]>
    }) as this);
  }
  deleteMapEntry(key: string) {
    const mapCurrent = this.map;
    if (!mapCurrent?.has(key)) return this;
    const mapMapSource = this.#map;
    const mapMapEntries = mapMapSource === undefined ? [] : [...mapMapSource.entries()];
    const mapMapNext = new Map(mapMapEntries);
    mapMapNext.delete(key);
    return this.$update(new (this.constructor as typeof Wrapper)({
      union: this.#union as Alpha | Beta,
      list: this.#list as (Alpha | Beta)[] | Iterable<(Alpha | Beta)>,
      itemSet: this.#itemSet as Set<Alpha | Beta> | Iterable<Alpha | Beta>,
      map: mapMapNext as Map<string, Alpha | Beta> | Iterable<[string, Alpha | Beta]>
    }) as this);
  }
  fillList(value: Alpha | Beta, start?: number, end?: number) {
    const listArray = this.#list === undefined ? [] : this.#list;
    const listNext = [...listArray];
    (listNext as unknown as (Alpha | Beta)[]).fill(value, start, end);
    return this.$update(new (this.constructor as typeof Wrapper)({
      union: this.#union as Alpha | Beta,
      list: listNext as (Alpha | Beta)[] | Iterable<(Alpha | Beta)>,
      itemSet: this.#itemSet as Set<Alpha | Beta> | Iterable<Alpha | Beta>,
      map: this.#map as Map<string, Alpha | Beta> | Iterable<[string, Alpha | Beta]>
    }) as this);
  }
  filterItemSet(predicate: (value: Alpha | Beta) => boolean) {
    const itemSetSetSource = this.itemSet ?? [];
    const itemSetSetEntries = [...itemSetSetSource];
    const itemSetSetNext = new Set(itemSetSetEntries);
    const itemSetFiltered = [];
    for (const value of itemSetSetNext) {
      if (predicate(value)) itemSetFiltered.push(value);
    }
    itemSetSetNext.clear();
    for (const value of itemSetFiltered) {
      itemSetSetNext.add(value);
    }
    if (this.itemSet === itemSetSetNext as unknown || this.itemSet?.equals(itemSetSetNext)) return this;
    return this.$update(new (this.constructor as typeof Wrapper)({
      union: this.#union as Alpha | Beta,
      list: this.#list as (Alpha | Beta)[] | Iterable<(Alpha | Beta)>,
      itemSet: itemSetSetNext as Set<Alpha | Beta> | Iterable<Alpha | Beta>,
      map: this.#map as Map<string, Alpha | Beta> | Iterable<[string, Alpha | Beta]>
    }) as this);
  }
  filterMapEntries(predicate: (value: Alpha | Beta, key: string) => boolean) {
    const mapMapSource = this.#map;
    const mapMapEntries = mapMapSource === undefined ? [] : [...mapMapSource.entries()];
    const mapMapNext = new Map(mapMapEntries);
    for (const [entryKey, entryValue] of mapMapNext) {
      if (!predicate(entryValue, entryKey)) mapMapNext.delete(entryKey);
    }
    if (this.map === mapMapNext as unknown || this.map?.equals(mapMapNext)) return this;
    return this.$update(new (this.constructor as typeof Wrapper)({
      union: this.#union as Alpha | Beta,
      list: this.#list as (Alpha | Beta)[] | Iterable<(Alpha | Beta)>,
      itemSet: this.#itemSet as Set<Alpha | Beta> | Iterable<Alpha | Beta>,
      map: mapMapNext as Map<string, Alpha | Beta> | Iterable<[string, Alpha | Beta]>
    }) as this);
  }
  mapItemSet(mapper: (value: Alpha | Beta) => Alpha | Beta) {
    const itemSetSetSource = this.itemSet ?? [];
    const itemSetSetEntries = [...itemSetSetSource];
    const itemSetSetNext = new Set(itemSetSetEntries);
    const itemSetMapped = [];
    for (const value of itemSetSetNext) {
      const mappedValue = mapper(value);
      itemSetMapped.push(mappedValue);
    }
    itemSetSetNext.clear();
    for (const value of itemSetMapped) {
      itemSetSetNext.add(value);
    }
    if (this.itemSet === itemSetSetNext as unknown || this.itemSet?.equals(itemSetSetNext)) return this;
    return this.$update(new (this.constructor as typeof Wrapper)({
      union: this.#union as Alpha | Beta,
      list: this.#list as (Alpha | Beta)[] | Iterable<(Alpha | Beta)>,
      itemSet: itemSetSetNext as Set<Alpha | Beta> | Iterable<Alpha | Beta>,
      map: this.#map as Map<string, Alpha | Beta> | Iterable<[string, Alpha | Beta]>
    }) as this);
  }
  mapMapEntries(mapper: (value: Alpha | Beta, key: string) => [string, Alpha | Beta]) {
    const mapMapSource = this.#map;
    const mapMapEntries = mapMapSource === undefined ? [] : [...mapMapSource.entries()];
    const mapMapNext = new Map(mapMapEntries);
    const mapMappedEntries: [string, Alpha | Beta][] = [];
    for (const [entryKey, entryValue] of mapMapNext) {
      const mappedEntry = mapper(entryValue, entryKey);
      mapMappedEntries.push(mappedEntry);
    }
    mapMapNext.clear();
    for (const [newKey, newValue] of mapMappedEntries) {
      mapMapNext.set(newKey, newValue);
    }
    if (this.map === mapMapNext as unknown || this.map?.equals(mapMapNext)) return this;
    return this.$update(new (this.constructor as typeof Wrapper)({
      union: this.#union as Alpha | Beta,
      list: this.#list as (Alpha | Beta)[] | Iterable<(Alpha | Beta)>,
      itemSet: this.#itemSet as Set<Alpha | Beta> | Iterable<Alpha | Beta>,
      map: mapMapNext as Map<string, Alpha | Beta> | Iterable<[string, Alpha | Beta]>
    }) as this);
  }
  mergeMapEntries(entries: ImmutableMap<string, Alpha | Beta> | ReadonlyMap<string, Alpha | Beta> | Iterable<[string, Alpha | Beta]>) {
    const mapMapSource = this.#map;
    const mapMapEntries = mapMapSource === undefined ? [] : [...mapMapSource.entries()];
    const mapMapNext = new Map(mapMapEntries);
    for (const [mergeKey, mergeValue] of entries) {
      mapMapNext.set(mergeKey, mergeValue);
    }
    if (this.map === mapMapNext as unknown || this.map?.equals(mapMapNext)) return this;
    return this.$update(new (this.constructor as typeof Wrapper)({
      union: this.#union as Alpha | Beta,
      list: this.#list as (Alpha | Beta)[] | Iterable<(Alpha | Beta)>,
      itemSet: this.#itemSet as Set<Alpha | Beta> | Iterable<Alpha | Beta>,
      map: mapMapNext as Map<string, Alpha | Beta> | Iterable<[string, Alpha | Beta]>
    }) as this);
  }
  popList() {
    if ((this.list ?? []).length === 0) return this;
    const listArray = this.#list === undefined ? [] : this.#list;
    const listNext = [...listArray];
    listNext.pop();
    return this.$update(new (this.constructor as typeof Wrapper)({
      union: this.#union as Alpha | Beta,
      list: listNext as (Alpha | Beta)[] | Iterable<(Alpha | Beta)>,
      itemSet: this.#itemSet as Set<Alpha | Beta> | Iterable<Alpha | Beta>,
      map: this.#map as Map<string, Alpha | Beta> | Iterable<[string, Alpha | Beta]>
    }) as this);
  }
  pushList(...values: (Alpha | Beta)[]) {
    if (values.length === 0) return this;
    const listArray = this.#list === undefined ? [] : this.#list;
    const listNext = [...listArray, ...values];
    return this.$update(new (this.constructor as typeof Wrapper)({
      union: this.#union as Alpha | Beta,
      list: listNext as (Alpha | Beta)[] | Iterable<(Alpha | Beta)>,
      itemSet: this.#itemSet as Set<Alpha | Beta> | Iterable<Alpha | Beta>,
      map: this.#map as Map<string, Alpha | Beta> | Iterable<[string, Alpha | Beta]>
    }) as this);
  }
  reverseList() {
    const listArray = this.#list === undefined ? [] : this.#list;
    const listNext = [...listArray];
    listNext.reverse();
    return this.$update(new (this.constructor as typeof Wrapper)({
      union: this.#union as Alpha | Beta,
      list: listNext as (Alpha | Beta)[] | Iterable<(Alpha | Beta)>,
      itemSet: this.#itemSet as Set<Alpha | Beta> | Iterable<Alpha | Beta>,
      map: this.#map as Map<string, Alpha | Beta> | Iterable<[string, Alpha | Beta]>
    }) as this);
  }
  set(updates: Partial<SetUpdates<Wrapper.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof Wrapper)(data) as this);
  }
  setItemSet(value: Set<Alpha | Beta> | Iterable<Alpha | Beta> | undefined) {
    return this.$update(new (this.constructor as typeof Wrapper)({
      union: this.#union as Alpha | Beta,
      list: this.#list as (Alpha | Beta)[] | Iterable<(Alpha | Beta)>,
      itemSet: (value === undefined || value === null ? value : value instanceof ImmutableSet ? value : new ImmutableSet(value)) as Set<Alpha | Beta> | Iterable<Alpha | Beta>,
      map: this.#map as Map<string, Alpha | Beta> | Iterable<[string, Alpha | Beta]>
    }) as this);
  }
  setList(value: (Alpha | Beta)[] | Iterable<(Alpha | Beta)> | undefined) {
    return this.$update(new (this.constructor as typeof Wrapper)({
      union: this.#union as Alpha | Beta,
      list: value as (Alpha | Beta)[] | Iterable<(Alpha | Beta)>,
      itemSet: this.#itemSet as Set<Alpha | Beta> | Iterable<Alpha | Beta>,
      map: this.#map as Map<string, Alpha | Beta> | Iterable<[string, Alpha | Beta]>
    }) as this);
  }
  setMap(value: Map<string, Alpha | Beta> | Iterable<[string, Alpha | Beta]> | undefined) {
    return this.$update(new (this.constructor as typeof Wrapper)({
      union: this.#union as Alpha | Beta,
      list: this.#list as (Alpha | Beta)[] | Iterable<(Alpha | Beta)>,
      itemSet: this.#itemSet as Set<Alpha | Beta> | Iterable<Alpha | Beta>,
      map: (value === undefined || value === null ? value : value instanceof ImmutableMap ? value : new ImmutableMap(value)) as Map<string, Alpha | Beta> | Iterable<[string, Alpha | Beta]>
    }) as this);
  }
  setMapEntry(key: string, value: Alpha | Beta) {
    const mapCurrent = this.map;
    if (mapCurrent?.has(key)) {
      const existing = mapCurrent.get(key);
      if (equals(existing, value)) return this;
    }
    const mapMapSource = this.#map;
    const mapMapEntries = mapMapSource === undefined ? [] : [...mapMapSource.entries()];
    const mapMapNext = new Map(mapMapEntries);
    mapMapNext.set(key, value);
    return this.$update(new (this.constructor as typeof Wrapper)({
      union: this.#union as Alpha | Beta,
      list: this.#list as (Alpha | Beta)[] | Iterable<(Alpha | Beta)>,
      itemSet: this.#itemSet as Set<Alpha | Beta> | Iterable<Alpha | Beta>,
      map: mapMapNext as Map<string, Alpha | Beta> | Iterable<[string, Alpha | Beta]>
    }) as this);
  }
  setUnion(value: Alpha | Beta) {
    return this.$update(new (this.constructor as typeof Wrapper)({
      union: value as Alpha | Beta,
      list: this.#list as (Alpha | Beta)[] | Iterable<(Alpha | Beta)>,
      itemSet: this.#itemSet as Set<Alpha | Beta> | Iterable<Alpha | Beta>,
      map: this.#map as Map<string, Alpha | Beta> | Iterable<[string, Alpha | Beta]>
    }) as this);
  }
  shiftList() {
    if ((this.list ?? []).length === 0) return this;
    const listArray = this.#list === undefined ? [] : this.#list;
    const listNext = [...listArray];
    listNext.shift();
    return this.$update(new (this.constructor as typeof Wrapper)({
      union: this.#union as Alpha | Beta,
      list: listNext as (Alpha | Beta)[] | Iterable<(Alpha | Beta)>,
      itemSet: this.#itemSet as Set<Alpha | Beta> | Iterable<Alpha | Beta>,
      map: this.#map as Map<string, Alpha | Beta> | Iterable<[string, Alpha | Beta]>
    }) as this);
  }
  sortList(compareFn?: (a: Alpha | Beta, b: Alpha | Beta) => number) {
    const listArray = this.#list === undefined ? [] : this.#list;
    const listNext = [...listArray];
    (listNext as unknown as (Alpha | Beta)[]).sort(compareFn);
    return this.$update(new (this.constructor as typeof Wrapper)({
      union: this.#union as Alpha | Beta,
      list: listNext as (Alpha | Beta)[] | Iterable<(Alpha | Beta)>,
      itemSet: this.#itemSet as Set<Alpha | Beta> | Iterable<Alpha | Beta>,
      map: this.#map as Map<string, Alpha | Beta> | Iterable<[string, Alpha | Beta]>
    }) as this);
  }
  spliceList(start: number, deleteCount?: number, ...items: (Alpha | Beta)[]) {
    const listArray = this.#list === undefined ? [] : this.#list;
    const listNext = [...listArray];
    listNext.splice(start, ...(deleteCount !== undefined ? [deleteCount] : []), ...items);
    return this.$update(new (this.constructor as typeof Wrapper)({
      union: this.#union as Alpha | Beta,
      list: listNext as (Alpha | Beta)[] | Iterable<(Alpha | Beta)>,
      itemSet: this.#itemSet as Set<Alpha | Beta> | Iterable<Alpha | Beta>,
      map: this.#map as Map<string, Alpha | Beta> | Iterable<[string, Alpha | Beta]>
    }) as this);
  }
  unsetItemSet() {
    return this.$update(new (this.constructor as typeof Wrapper)({
      union: this.#union as Alpha | Beta,
      list: this.#list as (Alpha | Beta)[] | Iterable<(Alpha | Beta)>,
      map: this.#map as Map<string, Alpha | Beta> | Iterable<[string, Alpha | Beta]>
    }) as this);
  }
  unsetList() {
    return this.$update(new (this.constructor as typeof Wrapper)({
      union: this.#union as Alpha | Beta,
      itemSet: this.#itemSet as Set<Alpha | Beta> | Iterable<Alpha | Beta>,
      map: this.#map as Map<string, Alpha | Beta> | Iterable<[string, Alpha | Beta]>
    }) as this);
  }
  unsetMap() {
    return this.$update(new (this.constructor as typeof Wrapper)({
      union: this.#union as Alpha | Beta,
      list: this.#list as (Alpha | Beta)[] | Iterable<(Alpha | Beta)>,
      itemSet: this.#itemSet as Set<Alpha | Beta> | Iterable<Alpha | Beta>
    }) as this);
  }
  unshiftList(...values: (Alpha | Beta)[]) {
    if (values.length === 0) return this;
    const listArray = this.#list === undefined ? [] : this.#list;
    const listNext = [...values, ...listArray];
    return this.$update(new (this.constructor as typeof Wrapper)({
      union: this.#union as Alpha | Beta,
      list: listNext as (Alpha | Beta)[] | Iterable<(Alpha | Beta)>,
      itemSet: this.#itemSet as Set<Alpha | Beta> | Iterable<Alpha | Beta>,
      map: this.#map as Map<string, Alpha | Beta> | Iterable<[string, Alpha | Beta]>
    }) as this);
  }
  updateItemSet(updater: (current: Set<Alpha | Beta>) => Iterable<Alpha | Beta>) {
    const itemSetSetSource = this.itemSet ?? [];
    const itemSetSetEntries = [...itemSetSetSource];
    const itemSetSetNext = new Set(itemSetSetEntries);
    const updated = updater(itemSetSetNext);
    itemSetSetNext.clear();
    for (const updatedItem of updated) {
      itemSetSetNext.add(updatedItem);
    }
    if (this.itemSet === itemSetSetNext as unknown || this.itemSet?.equals(itemSetSetNext)) return this;
    return this.$update(new (this.constructor as typeof Wrapper)({
      union: this.#union as Alpha | Beta,
      list: this.#list as (Alpha | Beta)[] | Iterable<(Alpha | Beta)>,
      itemSet: itemSetSetNext as Set<Alpha | Beta> | Iterable<Alpha | Beta>,
      map: this.#map as Map<string, Alpha | Beta> | Iterable<[string, Alpha | Beta]>
    }) as this);
  }
  updateMapEntry(key: string, updater: (currentValue: Alpha | Beta | undefined) => Alpha | Beta) {
    const mapMapSource = this.#map;
    const mapMapEntries = mapMapSource === undefined ? [] : [...mapMapSource.entries()];
    const mapMapNext = new Map(mapMapEntries);
    const currentValue = mapMapNext.get(key);
    const updatedValue = updater(currentValue);
    mapMapNext.set(key, updatedValue);
    if (this.map === mapMapNext as unknown || this.map?.equals(mapMapNext)) return this;
    return this.$update(new (this.constructor as typeof Wrapper)({
      union: this.#union as Alpha | Beta,
      list: this.#list as (Alpha | Beta)[] | Iterable<(Alpha | Beta)>,
      itemSet: this.#itemSet as Set<Alpha | Beta> | Iterable<Alpha | Beta>,
      map: mapMapNext as Map<string, Alpha | Beta> | Iterable<[string, Alpha | Beta]>
    }) as this);
  }
}
export namespace Wrapper {
  export type Data = {
    union: Alpha | Beta;
    list?: (Alpha | Beta)[] | Iterable<(Alpha | Beta)> | undefined;
    itemSet?: Set<Alpha | Beta> | Iterable<Alpha | Beta> | undefined;
    map?: Map<string, Alpha | Beta> | Iterable<[string, Alpha | Beta]> | undefined;
  };
  export type Value = Wrapper | Wrapper.Data;
}
