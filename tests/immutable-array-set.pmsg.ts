/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/immutable-array-set.pmsg
import { ImmutableArray } from '../runtime/common/array/immutable';
import { ImmutableSet } from '../runtime/common/set/immutable';
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, SKIP } from "../runtime/index.js";
import type { MessagePropDescriptor, DataObject, ImmutableMap, SetUpdates } from "../runtime/index.js";
export class ImmutableArraySet extends Message<ImmutableArraySet.Data> {
  static TYPE_TAG = Symbol("ImmutableArraySet");
  static readonly $typeName = "ImmutableArraySet";
  static EMPTY: ImmutableArraySet;
  #arr: ImmutableArray<number>;
  #items: ImmutableSet<string>;
  constructor(props?: ImmutableArraySet.Value) {
    if (!props && ImmutableArraySet.EMPTY) return ImmutableArraySet.EMPTY;
    super(ImmutableArraySet.TYPE_TAG, "ImmutableArraySet");
    this.#arr = props ? props.arr === undefined || props.arr === null ? new ImmutableArray() : props.arr instanceof ImmutableArray ? props.arr : new ImmutableArray(props.arr) : new ImmutableArray();
    this.#items = props ? props.items === undefined || props.items === null ? new ImmutableSet() : props.items instanceof ImmutableSet ? props.items : new ImmutableSet(props.items) : new ImmutableSet();
    if (!props) ImmutableArraySet.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<ImmutableArraySet.Data>[] {
    return [{
      name: "arr",
      fieldNumber: null,
      getValue: () => this.#arr
    }, {
      name: "items",
      fieldNumber: null,
      getValue: () => this.#items
    }];
  }
  protected $fromEntries(entries: Record<string, unknown>): ImmutableArraySet.Data {
    const props = {} as Partial<ImmutableArraySet.Data>;
    const arrValue = entries["arr"];
    if (arrValue === undefined) throw new Error("Missing required property \"arr\".");
    const arrArrayValue = arrValue === undefined || arrValue === null ? new ImmutableArray() : arrValue as object instanceof ImmutableArray ? arrValue : new ImmutableArray(arrValue);
    if (!((arrArrayValue instanceof ImmutableArray || Array.isArray(arrArrayValue)) && [...(arrArrayValue as Iterable<unknown>)].every(element => typeof element === "number"))) throw new Error("Invalid value for property \"arr\".");
    props.arr = arrArrayValue as ImmutableArray<number>;
    const itemsValue = entries["items"];
    if (itemsValue === undefined) throw new Error("Missing required property \"items\".");
    const itemsSetValue = itemsValue === undefined || itemsValue === null ? new ImmutableSet() : itemsValue as object instanceof ImmutableSet ? itemsValue : new ImmutableSet(itemsValue);
    if (!((itemsSetValue instanceof ImmutableSet || itemsSetValue instanceof Set) && [...(itemsSetValue as Iterable<unknown>)].every(setValue => typeof setValue === "string"))) throw new Error("Invalid value for property \"items\".");
    props.items = itemsSetValue as ImmutableSet<string>;
    return props as ImmutableArraySet.Data;
  }
  override [WITH_CHILD](key: string | number, child: unknown): ImmutableArraySet {
    switch (key) {
      case "arr":
        return new (this.constructor as typeof ImmutableArraySet)({
          arr: child as ImmutableArray<number>,
          items: this.#items
        });
      case "items":
        return new (this.constructor as typeof ImmutableArraySet)({
          arr: this.#arr,
          items: child as ImmutableSet<string>
        });
      default:
        throw new Error(`Unknown key: ${key}`);
    }
  }
  override *[GET_MESSAGE_CHILDREN]() {
    yield ["arr", this.#arr] as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
    yield ["items", this.#items] as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
  }
  get arr(): ImmutableArray<number> {
    return this.#arr;
  }
  get items(): ImmutableSet<string> {
    return this.#items;
  }
  addAllItems(values: Iterable<string>) {
    const itemsSetSource = this.items ?? [];
    const itemsSetEntries = [...itemsSetSource];
    const itemsSetNext = new Set(itemsSetEntries);
    for (const toAdd of values) {
      itemsSetNext.add(toAdd);
    }
    if (this.items === itemsSetNext as unknown || this.items?.equals(itemsSetNext)) return this;
    return this.$update(new (this.constructor as typeof ImmutableArraySet)({
      arr: this.#arr,
      items: itemsSetNext
    }));
  }
  addItems(value: string) {
    const itemsSetSource = this.items ?? [];
    const itemsSetEntries = [...itemsSetSource];
    const itemsSetNext = new Set(itemsSetEntries);
    itemsSetNext.add(value);
    if (this.items === itemsSetNext as unknown || this.items?.equals(itemsSetNext)) return this;
    return this.$update(new (this.constructor as typeof ImmutableArraySet)({
      arr: this.#arr,
      items: itemsSetNext
    }));
  }
  clearItems() {
    const itemsSetSource = this.items ?? [];
    const itemsSetEntries = [...itemsSetSource];
    const itemsSetNext = new Set(itemsSetEntries);
    itemsSetNext.clear();
    if (this.items === itemsSetNext as unknown || this.items?.equals(itemsSetNext)) return this;
    return this.$update(new (this.constructor as typeof ImmutableArraySet)({
      arr: this.#arr,
      items: itemsSetNext
    }));
  }
  copyWithinArr(target: number, start: number, end?: number) {
    const arrArray = this.#arr;
    const arrNext = [...arrArray];
    arrNext.copyWithin(target, start, end);
    return this.$update(new (this.constructor as typeof ImmutableArraySet)({
      arr: arrNext,
      items: this.#items
    }));
  }
  deleteAllItems(values: Iterable<string>) {
    const itemsSetSource = this.items ?? [];
    const itemsSetEntries = [...itemsSetSource];
    const itemsSetNext = new Set(itemsSetEntries);
    for (const del of values) {
      itemsSetNext.delete(del);
    }
    if (this.items === itemsSetNext as unknown || this.items?.equals(itemsSetNext)) return this;
    return this.$update(new (this.constructor as typeof ImmutableArraySet)({
      arr: this.#arr,
      items: itemsSetNext
    }));
  }
  deleteItems(value: string) {
    const itemsSetSource = this.items ?? [];
    const itemsSetEntries = [...itemsSetSource];
    const itemsSetNext = new Set(itemsSetEntries);
    itemsSetNext.delete(value);
    if (this.items === itemsSetNext as unknown || this.items?.equals(itemsSetNext)) return this;
    return this.$update(new (this.constructor as typeof ImmutableArraySet)({
      arr: this.#arr,
      items: itemsSetNext
    }));
  }
  fillArr(value: number, start?: number, end?: number) {
    const arrArray = this.#arr;
    const arrNext = [...arrArray];
    arrNext.fill(value, start, end);
    return this.$update(new (this.constructor as typeof ImmutableArraySet)({
      arr: arrNext,
      items: this.#items
    }));
  }
  filterItems(predicate: (value) => boolean) {
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
      arr: this.#arr,
      items: itemsSetNext
    }));
  }
  mapItems(mapper: (value) => string) {
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
      arr: this.#arr,
      items: itemsSetNext
    }));
  }
  popArr() {
    if ((this.arr ?? []).length === 0) return this;
    const arrArray = this.#arr;
    const arrNext = [...arrArray];
    arrNext.pop();
    return this.$update(new (this.constructor as typeof ImmutableArraySet)({
      arr: arrNext,
      items: this.#items
    }));
  }
  pushArr(...values) {
    if (values.length === 0) return this;
    const arrArray = this.#arr;
    const arrNext = [...arrArray, ...values];
    return this.$update(new (this.constructor as typeof ImmutableArraySet)({
      arr: arrNext,
      items: this.#items
    }));
  }
  reverseArr() {
    const arrArray = this.#arr;
    const arrNext = [...arrArray];
    arrNext.reverse();
    return this.$update(new (this.constructor as typeof ImmutableArraySet)({
      arr: arrNext,
      items: this.#items
    }));
  }
  set(updates: Partial<SetUpdates<ImmutableArraySet.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof ImmutableArraySet)(data));
  }
  setArr(value: number[] | Iterable<number>) {
    return this.$update(new (this.constructor as typeof ImmutableArraySet)({
      arr: value,
      items: this.#items
    }));
  }
  setItems(value: Set<string> | Iterable<string>) {
    return this.$update(new (this.constructor as typeof ImmutableArraySet)({
      arr: this.#arr,
      items: value === undefined || value === null ? new ImmutableSet() : value instanceof ImmutableSet ? value : new ImmutableSet(value)
    }));
  }
  shiftArr() {
    if ((this.arr ?? []).length === 0) return this;
    const arrArray = this.#arr;
    const arrNext = [...arrArray];
    arrNext.shift();
    return this.$update(new (this.constructor as typeof ImmutableArraySet)({
      arr: arrNext,
      items: this.#items
    }));
  }
  sortArr(compareFn?: (a: number, b: number) => number) {
    const arrArray = this.#arr;
    const arrNext = [...arrArray];
    arrNext.sort(compareFn);
    return this.$update(new (this.constructor as typeof ImmutableArraySet)({
      arr: arrNext,
      items: this.#items
    }));
  }
  spliceArr(start: number, deleteCount?: number, ...items) {
    const arrArray = this.#arr;
    const arrNext = [...arrArray];
    arrNext.splice(start, ...(deleteCount !== undefined ? [deleteCount] : []), ...items);
    return this.$update(new (this.constructor as typeof ImmutableArraySet)({
      arr: arrNext,
      items: this.#items
    }));
  }
  unshiftArr(...values) {
    if (values.length === 0) return this;
    const arrArray = this.#arr;
    const arrNext = [...values, ...arrArray];
    return this.$update(new (this.constructor as typeof ImmutableArraySet)({
      arr: arrNext,
      items: this.#items
    }));
  }
  updateItems(updater: (current: ImmutableSet<string>) => Iterable<string>) {
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
      arr: this.#arr,
      items: itemsSetNext
    }));
  }
}
export namespace ImmutableArraySet {
  export type Data = {
    arr: number[] | Iterable<number>;
    items: Set<string> | Iterable<string>;
  };
  export type Value = ImmutableArraySet | ImmutableArraySet.Data;
}
