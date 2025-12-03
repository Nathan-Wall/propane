/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/immutable-array-set.propane
import { ImmutableArray } from '../runtime/common/array/immutable';
import { ImmutableSet } from '../runtime/common/set/immutable';
import type { MessagePropDescriptor, DataObject, ImmutableMap } from "../runtime/index.js";
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN } from "../runtime/index.js";
export class ImmutableArraySet extends Message<ImmutableArraySet.Data> {
  static TYPE_TAG = Symbol("ImmutableArraySet");
  static readonly $typeName = "ImmutableArraySet";
  static EMPTY: ImmutableArraySet;
  #arr: ImmutableArray<number>;
  #set: ImmutableSet<string>;
  constructor(props?: ImmutableArraySet.Value) {
    if (!props && ImmutableArraySet.EMPTY) return ImmutableArraySet.EMPTY;
    super(ImmutableArraySet.TYPE_TAG, "ImmutableArraySet");
    this.#arr = props ? props.arr === undefined || props.arr === null ? new ImmutableArray() : props.arr instanceof ImmutableArray ? props.arr : new ImmutableArray(props.arr) : new ImmutableArray();
    this.#set = props ? props.set === undefined || props.set === null ? new ImmutableSet() : props.set instanceof ImmutableSet ? props.set : new ImmutableSet(props.set) : new ImmutableSet();
    if (!props) ImmutableArraySet.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<ImmutableArraySet.Data>[] {
    return [{
      name: "arr",
      fieldNumber: null,
      getValue: () => this.#arr
    }, {
      name: "set",
      fieldNumber: null,
      getValue: () => this.#set
    }];
  }
  protected $fromEntries(entries: Record<string, unknown>): ImmutableArraySet.Data {
    const props = {} as Partial<ImmutableArraySet.Data>;
    const arrValue = entries["arr"];
    if (arrValue === undefined) throw new Error("Missing required property \"arr\".");
    const arrArrayValue = arrValue === undefined || arrValue === null ? new ImmutableArray() : arrValue as object instanceof ImmutableArray ? arrValue : new ImmutableArray(arrValue);
    if (!((arrArrayValue instanceof ImmutableArray || Array.isArray(arrArrayValue)) && [...(arrArrayValue as Iterable<unknown>)].every(element => typeof element === "number"))) throw new Error("Invalid value for property \"arr\".");
    props.arr = arrArrayValue as ImmutableArray<number>;
    const setValue = entries["set"];
    if (setValue === undefined) throw new Error("Missing required property \"set\".");
    const setSetValue = setValue === undefined || setValue === null ? new ImmutableSet() : setValue as object instanceof ImmutableSet ? setValue : new ImmutableSet(setValue);
    if (!((setSetValue instanceof ImmutableSet || setSetValue instanceof Set) && [...(setSetValue as Iterable<unknown>)].every(setValue => typeof setValue === "string"))) throw new Error("Invalid value for property \"set\".");
    props.set = setSetValue as ImmutableSet<string>;
    return props as ImmutableArraySet.Data;
  }
  override [WITH_CHILD](key: string | number, child: unknown): ImmutableArraySet {
    switch (key) {
      case "arr":
        return new ImmutableArraySet({
          arr: child as ImmutableArray<number>,
          set: this.#set
        });
      case "set":
        return new ImmutableArraySet({
          arr: this.#arr,
          set: child as ImmutableSet<string>
        });
      default:
        throw new Error(`Unknown key: ${key}`);
    }
  }
  override *[GET_MESSAGE_CHILDREN]() {
    yield ["arr", this.#arr] as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
    yield ["set", this.#set] as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
  }
  get arr(): ImmutableArray<number> {
    return this.#arr;
  }
  get set(): ImmutableSet<string> {
    return this.#set;
  }
  addAllSet(values: Iterable<string>): ImmutableArraySet {
    const setSetSource = this.set ?? [];
    const setSetEntries = [...setSetSource];
    const setSetNext = new Set(setSetEntries);
    for (const toAdd of values) {
      setSetNext.add(toAdd);
    }
    if (this.set === setSetNext as unknown || this.set?.equals(setSetNext)) return this;
    return this.$update(new ImmutableArraySet({
      arr: this.#arr,
      set: setSetNext
    }));
  }
  addSet(value: string): ImmutableArraySet {
    const setSetSource = this.set ?? [];
    const setSetEntries = [...setSetSource];
    const setSetNext = new Set(setSetEntries);
    setSetNext.add(value);
    if (this.set === setSetNext as unknown || this.set?.equals(setSetNext)) return this;
    return this.$update(new ImmutableArraySet({
      arr: this.#arr,
      set: setSetNext
    }));
  }
  clearSet(): ImmutableArraySet {
    const setSetSource = this.set ?? [];
    const setSetEntries = [...setSetSource];
    const setSetNext = new Set(setSetEntries);
    setSetNext.clear();
    if (this.set === setSetNext as unknown || this.set?.equals(setSetNext)) return this;
    return this.$update(new ImmutableArraySet({
      arr: this.#arr,
      set: setSetNext
    }));
  }
  copyWithinArr(target: number, start: number, end?: number): ImmutableArraySet {
    const arrArray = this.#arr;
    const arrNext = [...arrArray];
    arrNext.copyWithin(target, start, end);
    return this.$update(new ImmutableArraySet({
      arr: arrNext,
      set: this.#set
    }));
  }
  deleteAllSet(values: Iterable<string>): ImmutableArraySet {
    const setSetSource = this.set ?? [];
    const setSetEntries = [...setSetSource];
    const setSetNext = new Set(setSetEntries);
    for (const del of values) {
      setSetNext.delete(del);
    }
    if (this.set === setSetNext as unknown || this.set?.equals(setSetNext)) return this;
    return this.$update(new ImmutableArraySet({
      arr: this.#arr,
      set: setSetNext
    }));
  }
  deleteSet(value: string): ImmutableArraySet {
    const setSetSource = this.set ?? [];
    const setSetEntries = [...setSetSource];
    const setSetNext = new Set(setSetEntries);
    setSetNext.delete(value);
    if (this.set === setSetNext as unknown || this.set?.equals(setSetNext)) return this;
    return this.$update(new ImmutableArraySet({
      arr: this.#arr,
      set: setSetNext
    }));
  }
  fillArr(value: number, start?: number, end?: number): ImmutableArraySet {
    const arrArray = this.#arr;
    const arrNext = [...arrArray];
    arrNext.fill(value, start, end);
    return this.$update(new ImmutableArraySet({
      arr: arrNext,
      set: this.#set
    }));
  }
  filterSet(predicate: (value) => boolean): ImmutableArraySet {
    const setSetSource = this.set ?? [];
    const setSetEntries = [...setSetSource];
    const setSetNext = new Set(setSetEntries);
    const setFiltered = [];
    for (const value of setSetNext) {
      if (predicate(value)) setFiltered.push(value);
    }
    setSetNext.clear();
    for (const value of setFiltered) {
      setSetNext.add(value);
    }
    if (this.set === setSetNext as unknown || this.set?.equals(setSetNext)) return this;
    return this.$update(new ImmutableArraySet({
      arr: this.#arr,
      set: setSetNext
    }));
  }
  mapSet(mapper: (value) => string): ImmutableArraySet {
    const setSetSource = this.set ?? [];
    const setSetEntries = [...setSetSource];
    const setSetNext = new Set(setSetEntries);
    const setMapped = [];
    for (const value of setSetNext) {
      const mappedValue = mapper(value);
      setMapped.push(mappedValue);
    }
    setSetNext.clear();
    for (const value of setMapped) {
      setSetNext.add(value);
    }
    if (this.set === setSetNext as unknown || this.set?.equals(setSetNext)) return this;
    return this.$update(new ImmutableArraySet({
      arr: this.#arr,
      set: setSetNext
    }));
  }
  popArr(): ImmutableArraySet {
    if ((this.arr ?? []).length === 0) return this;
    const arrArray = this.#arr;
    const arrNext = [...arrArray];
    arrNext.pop();
    return this.$update(new ImmutableArraySet({
      arr: arrNext,
      set: this.#set
    }));
  }
  pushArr(...values): ImmutableArraySet {
    if (values.length === 0) return this;
    const arrArray = this.#arr;
    const arrNext = [...arrArray, ...values];
    return this.$update(new ImmutableArraySet({
      arr: arrNext,
      set: this.#set
    }));
  }
  reverseArr(): ImmutableArraySet {
    const arrArray = this.#arr;
    const arrNext = [...arrArray];
    arrNext.reverse();
    return this.$update(new ImmutableArraySet({
      arr: arrNext,
      set: this.#set
    }));
  }
  setArr(value: number[] | Iterable<number>): ImmutableArraySet {
    return this.$update(new ImmutableArraySet({
      arr: value,
      set: this.#set
    }));
  }
  setSet(value: Set<string> | Iterable<string>): ImmutableArraySet {
    return this.$update(new ImmutableArraySet({
      arr: this.#arr,
      set: value === undefined || value === null ? new ImmutableSet() : value instanceof ImmutableSet ? value : new ImmutableSet(value)
    }));
  }
  shiftArr(): ImmutableArraySet {
    if ((this.arr ?? []).length === 0) return this;
    const arrArray = this.#arr;
    const arrNext = [...arrArray];
    arrNext.shift();
    return this.$update(new ImmutableArraySet({
      arr: arrNext,
      set: this.#set
    }));
  }
  sortArr(compareFn?: (a: number, b: number) => number): ImmutableArraySet {
    const arrArray = this.#arr;
    const arrNext = [...arrArray];
    arrNext.sort(compareFn);
    return this.$update(new ImmutableArraySet({
      arr: arrNext,
      set: this.#set
    }));
  }
  spliceArr(start: number, deleteCount?: number, ...items): ImmutableArraySet {
    const arrArray = this.#arr;
    const arrNext = [...arrArray];
    arrNext.splice(start, ...(deleteCount !== undefined ? [deleteCount] : []), ...items);
    return this.$update(new ImmutableArraySet({
      arr: arrNext,
      set: this.#set
    }));
  }
  unshiftArr(...values): ImmutableArraySet {
    if (values.length === 0) return this;
    const arrArray = this.#arr;
    const arrNext = [...values, ...arrArray];
    return this.$update(new ImmutableArraySet({
      arr: arrNext,
      set: this.#set
    }));
  }
  updateSet(updater: (current: ImmutableSet<string>) => Iterable<string>): ImmutableArraySet {
    const setSetSource = this.set ?? [];
    const setSetEntries = [...setSetSource];
    const setSetNext = new Set(setSetEntries);
    const updated = updater(setSetNext);
    setSetNext.clear();
    for (const updatedItem of updated) {
      setSetNext.add(updatedItem);
    }
    if (this.set === setSetNext as unknown || this.set?.equals(setSetNext)) return this;
    return this.$update(new ImmutableArraySet({
      arr: this.#arr,
      set: setSetNext
    }));
  }
}
export namespace ImmutableArraySet {
  export type Data = {
    arr: number[] | Iterable<number>;
    set: Set<string> | Iterable<string>;
  };
  export type Value = ImmutableArraySet | ImmutableArraySet.Data;
}
