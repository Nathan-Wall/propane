/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/immutable-array-set.pmsg
import { ImmutableArray } from '../runtime/common/array/immutable';
import { ImmutableSet } from '../runtime/common/set/immutable';
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, parseCerealString, ensure, SKIP } from "../runtime/index.js";
import type { MessagePropDescriptor, DataObject, ImmutableMap, SetUpdates } from "../runtime/index.js";
export class ImmutableArraySet extends Message<ImmutableArraySet.Data> {
  static TYPE_TAG = Symbol("ImmutableArraySet");
  static readonly $typeName = "ImmutableArraySet";
  static EMPTY: ImmutableArraySet;
  #arr!: ImmutableArray<number>;
  #items!: ImmutableSet<string>;
  constructor(props?: ImmutableArraySet.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && ImmutableArraySet.EMPTY) return ImmutableArraySet.EMPTY;
    super(ImmutableArraySet.TYPE_TAG, "ImmutableArraySet");
    this.#arr = props ? (props.arr === undefined || props.arr === null ? new ImmutableArray() : props.arr as object instanceof ImmutableArray ? props.arr : new ImmutableArray(props.arr as Iterable<unknown>)) as ImmutableArray<number> : new ImmutableArray();
    this.#items = props ? (props.items === undefined || props.items === null ? new ImmutableSet() : props.items as object instanceof ImmutableSet ? props.items : new ImmutableSet(props.items as Iterable<unknown>)) as ImmutableSet<string> : new ImmutableSet();
    if (!props) ImmutableArraySet.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<ImmutableArraySet.Data>[] {
    return [{
      name: "arr",
      fieldNumber: null,
      getValue: () => this.#arr as number[] | Iterable<number>
    }, {
      name: "items",
      fieldNumber: null,
      getValue: () => this.#items as Set<string> | Iterable<string>
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): ImmutableArraySet.Data {
    const props = {} as Partial<ImmutableArraySet.Data>;
    const arrValue = entries["arr"];
    if (arrValue === undefined) throw new Error("Missing required property \"arr\".");
    const arrArrayValue = arrValue === undefined || arrValue === null ? new ImmutableArray() : arrValue as object instanceof ImmutableArray ? arrValue : new ImmutableArray(arrValue as Iterable<unknown>);
    if (!((arrArrayValue as object instanceof ImmutableArray || Array.isArray(arrArrayValue)) && [...(arrArrayValue as Iterable<unknown>)].every(element => typeof element === "number"))) throw new Error("Invalid value for property \"arr\".");
    props.arr = arrArrayValue as number[] | Iterable<number>;
    const itemsValue = entries["items"];
    if (itemsValue === undefined) throw new Error("Missing required property \"items\".");
    const itemsSetValue = itemsValue === undefined || itemsValue === null ? new ImmutableSet() : itemsValue as object instanceof ImmutableSet ? itemsValue : new ImmutableSet(itemsValue as Iterable<unknown>);
    if (!((itemsSetValue as object instanceof ImmutableSet || itemsSetValue as object instanceof Set) && [...(itemsSetValue as Iterable<unknown>)].every(setValue => typeof setValue === "string"))) throw new Error("Invalid value for property \"items\".");
    props.items = itemsSetValue as Set<string> | Iterable<string>;
    return props as ImmutableArraySet.Data;
  }
  static from(value: ImmutableArraySet.Value): ImmutableArraySet {
    return value instanceof ImmutableArraySet ? value : new ImmutableArraySet(value);
  }
  override [WITH_CHILD](key: string | number, child: unknown): this {
    switch (key) {
      case "arr":
        return new (this.constructor as typeof ImmutableArraySet)({
          arr: child as ImmutableArray<number>,
          items: this.#items
        } as unknown as ImmutableArraySet.Value) as this;
      case "items":
        return new (this.constructor as typeof ImmutableArraySet)({
          arr: this.#arr,
          items: child as ImmutableSet<string>
        } as unknown as ImmutableArraySet.Value) as this;
      default:
        throw new Error(`Unknown key: ${key}`);
    }
  }
  override *[GET_MESSAGE_CHILDREN]() {
    yield ["arr", this.#arr] as unknown as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
    yield ["items", this.#items] as unknown as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
  }
  static deserialize<T extends typeof ImmutableArraySet>(this: T, data: string, options?: {
    skipValidation: boolean;
  }): InstanceType<T> {
    const payload = ensure.simpleObject(parseCerealString(data)) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
  }
  get arr(): ImmutableArray<number> {
    return this.#arr;
  }
  get items(): ImmutableSet<string> {
    return this.#items;
  }
  addItem(value: string) {
    const itemsSetSource = this.items ?? [];
    const itemsSetEntries = [...itemsSetSource];
    const itemsSetNext = new Set(itemsSetEntries);
    itemsSetNext.add(value);
    if (this.items === itemsSetNext as unknown || this.items?.equals(itemsSetNext)) return this;
    return this.$update(new (this.constructor as typeof ImmutableArraySet)({
      arr: this.#arr as number[] | Iterable<number>,
      items: itemsSetNext as Set<string> | Iterable<string>
    } as unknown as ImmutableArraySet.Value) as this);
  }
  addItems(values: Iterable<string>) {
    const itemsSetSource = this.items ?? [];
    const itemsSetEntries = [...itemsSetSource];
    const itemsSetNext = new Set(itemsSetEntries);
    for (const toAdd of values) {
      itemsSetNext.add(toAdd);
    }
    if (this.items === itemsSetNext as unknown || this.items?.equals(itemsSetNext)) return this;
    return this.$update(new (this.constructor as typeof ImmutableArraySet)({
      arr: this.#arr as number[] | Iterable<number>,
      items: itemsSetNext as Set<string> | Iterable<string>
    } as unknown as ImmutableArraySet.Value) as this);
  }
  clearItems() {
    const itemsSetSource = this.items ?? [];
    const itemsSetEntries = [...itemsSetSource];
    const itemsSetNext = new Set(itemsSetEntries);
    itemsSetNext.clear();
    if (this.items === itemsSetNext as unknown || this.items?.equals(itemsSetNext)) return this;
    return this.$update(new (this.constructor as typeof ImmutableArraySet)({
      arr: this.#arr as number[] | Iterable<number>,
      items: itemsSetNext as Set<string> | Iterable<string>
    } as unknown as ImmutableArraySet.Value) as this);
  }
  copyWithinArr(target: number, start: number, end?: number) {
    const arrArray = this.#arr;
    const arrNext = [...arrArray];
    arrNext.copyWithin(target, start, end);
    return this.$update(new (this.constructor as typeof ImmutableArraySet)({
      arr: arrNext as number[] | Iterable<number>,
      items: this.#items as Set<string> | Iterable<string>
    } as unknown as ImmutableArraySet.Value) as this);
  }
  deleteItem(value: string) {
    const itemsSetSource = this.items ?? [];
    const itemsSetEntries = [...itemsSetSource];
    const itemsSetNext = new Set(itemsSetEntries);
    itemsSetNext.delete(value);
    if (this.items === itemsSetNext as unknown || this.items?.equals(itemsSetNext)) return this;
    return this.$update(new (this.constructor as typeof ImmutableArraySet)({
      arr: this.#arr as number[] | Iterable<number>,
      items: itemsSetNext as Set<string> | Iterable<string>
    } as unknown as ImmutableArraySet.Value) as this);
  }
  deleteItems(values: Iterable<string>) {
    const itemsSetSource = this.items ?? [];
    const itemsSetEntries = [...itemsSetSource];
    const itemsSetNext = new Set(itemsSetEntries);
    for (const del of values) {
      itemsSetNext.delete(del);
    }
    if (this.items === itemsSetNext as unknown || this.items?.equals(itemsSetNext)) return this;
    return this.$update(new (this.constructor as typeof ImmutableArraySet)({
      arr: this.#arr as number[] | Iterable<number>,
      items: itemsSetNext as Set<string> | Iterable<string>
    } as unknown as ImmutableArraySet.Value) as this);
  }
  fillArr(value: number, start?: number, end?: number) {
    const arrArray = this.#arr;
    const arrNext = [...arrArray];
    (arrNext as unknown as number[]).fill(value, start, end);
    return this.$update(new (this.constructor as typeof ImmutableArraySet)({
      arr: arrNext as number[] | Iterable<number>,
      items: this.#items as Set<string> | Iterable<string>
    } as unknown as ImmutableArraySet.Value) as this);
  }
  filterItems(predicate: (value: string) => boolean) {
    const itemsSetSource = this.items ?? [];
    const itemsSetEntries = [...itemsSetSource];
    const itemsSetNext = new Set(itemsSetEntries);
    const itemsFiltered = [];
    for (const value of itemsSetNext) {
      if (predicate(value)) itemsFiltered.push(value);
    }
    itemsSetNext.clear();
    for (const value of itemsFiltered) {
      itemsSetNext.add(value);
    }
    if (this.items === itemsSetNext as unknown || this.items?.equals(itemsSetNext)) return this;
    return this.$update(new (this.constructor as typeof ImmutableArraySet)({
      arr: this.#arr as number[] | Iterable<number>,
      items: itemsSetNext as Set<string> | Iterable<string>
    } as unknown as ImmutableArraySet.Value) as this);
  }
  mapItems(mapper: (value: string) => string) {
    const itemsSetSource = this.items ?? [];
    const itemsSetEntries = [...itemsSetSource];
    const itemsSetNext = new Set(itemsSetEntries);
    const itemsMapped = [];
    for (const value of itemsSetNext) {
      const mappedValue = mapper(value);
      itemsMapped.push(mappedValue);
    }
    itemsSetNext.clear();
    for (const value of itemsMapped) {
      itemsSetNext.add(value);
    }
    if (this.items === itemsSetNext as unknown || this.items?.equals(itemsSetNext)) return this;
    return this.$update(new (this.constructor as typeof ImmutableArraySet)({
      arr: this.#arr as number[] | Iterable<number>,
      items: itemsSetNext as Set<string> | Iterable<string>
    } as unknown as ImmutableArraySet.Value) as this);
  }
  popArr() {
    if ((this.arr ?? []).length === 0) return this;
    const arrArray = this.#arr;
    const arrNext = [...arrArray];
    arrNext.pop();
    return this.$update(new (this.constructor as typeof ImmutableArraySet)({
      arr: arrNext as number[] | Iterable<number>,
      items: this.#items as Set<string> | Iterable<string>
    } as unknown as ImmutableArraySet.Value) as this);
  }
  pushArr(...values: number[]) {
    if (values.length === 0) return this;
    const arrArray = this.#arr;
    const arrNext = [...arrArray, ...values];
    return this.$update(new (this.constructor as typeof ImmutableArraySet)({
      arr: arrNext as number[] | Iterable<number>,
      items: this.#items as Set<string> | Iterable<string>
    } as unknown as ImmutableArraySet.Value) as this);
  }
  reverseArr() {
    const arrArray = this.#arr;
    const arrNext = [...arrArray];
    arrNext.reverse();
    return this.$update(new (this.constructor as typeof ImmutableArraySet)({
      arr: arrNext as number[] | Iterable<number>,
      items: this.#items as Set<string> | Iterable<string>
    } as unknown as ImmutableArraySet.Value) as this);
  }
  set(updates: Partial<SetUpdates<ImmutableArraySet.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof ImmutableArraySet)(data) as this);
  }
  setArr(value: number[] | Iterable<number>) {
    return this.$update(new (this.constructor as typeof ImmutableArraySet)({
      arr: value as number[] | Iterable<number>,
      items: this.#items as Set<string> | Iterable<string>
    }) as this);
  }
  setItems(value: Set<string> | Iterable<string>) {
    return this.$update(new (this.constructor as typeof ImmutableArraySet)({
      arr: this.#arr as number[] | Iterable<number>,
      items: (value === undefined || value === null ? new ImmutableSet() : value instanceof ImmutableSet ? value : new ImmutableSet(value)) as Set<string> | Iterable<string>
    }) as this);
  }
  shiftArr() {
    if ((this.arr ?? []).length === 0) return this;
    const arrArray = this.#arr;
    const arrNext = [...arrArray];
    arrNext.shift();
    return this.$update(new (this.constructor as typeof ImmutableArraySet)({
      arr: arrNext as number[] | Iterable<number>,
      items: this.#items as Set<string> | Iterable<string>
    } as unknown as ImmutableArraySet.Value) as this);
  }
  sortArr(compareFn?: (a: number, b: number) => number) {
    const arrArray = this.#arr;
    const arrNext = [...arrArray];
    (arrNext as unknown as number[]).sort(compareFn);
    return this.$update(new (this.constructor as typeof ImmutableArraySet)({
      arr: arrNext as number[] | Iterable<number>,
      items: this.#items as Set<string> | Iterable<string>
    } as unknown as ImmutableArraySet.Value) as this);
  }
  spliceArr(start: number, deleteCount?: number, ...items: number[]) {
    const arrArray = this.#arr;
    const arrNext = [...arrArray];
    arrNext.splice(start, ...(deleteCount !== undefined ? [deleteCount] : []), ...items);
    return this.$update(new (this.constructor as typeof ImmutableArraySet)({
      arr: arrNext as number[] | Iterable<number>,
      items: this.#items as Set<string> | Iterable<string>
    } as unknown as ImmutableArraySet.Value) as this);
  }
  unshiftArr(...values: number[]) {
    if (values.length === 0) return this;
    const arrArray = this.#arr;
    const arrNext = [...values, ...arrArray];
    return this.$update(new (this.constructor as typeof ImmutableArraySet)({
      arr: arrNext as number[] | Iterable<number>,
      items: this.#items as Set<string> | Iterable<string>
    } as unknown as ImmutableArraySet.Value) as this);
  }
  updateItems(updater: (current: Set<string>) => Iterable<string>) {
    const itemsSetSource = this.items ?? [];
    const itemsSetEntries = [...itemsSetSource];
    const itemsSetNext = new Set(itemsSetEntries);
    const updated = updater(itemsSetNext);
    itemsSetNext.clear();
    for (const updatedItem of updated) {
      itemsSetNext.add(updatedItem);
    }
    if (this.items === itemsSetNext as unknown || this.items?.equals(itemsSetNext)) return this;
    return this.$update(new (this.constructor as typeof ImmutableArraySet)({
      arr: this.#arr as number[] | Iterable<number>,
      items: itemsSetNext as Set<string> | Iterable<string>
    } as unknown as ImmutableArraySet.Value) as this);
  }
}
export namespace ImmutableArraySet {
  export type Data = {
    arr: number[] | Iterable<number>;
    items: Set<string> | Iterable<string>;
  };
  export type Value = ImmutableArraySet | ImmutableArraySet.Data;
}
