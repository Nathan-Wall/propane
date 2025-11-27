/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/immutable-array-set.propane
import { ImmutableArray } from '../runtime/common/array/immutable';
import { ImmutableSet } from '../runtime/common/set/immutable';
import { Message, MessagePropDescriptor } from "@propanejs/runtime";
export class ImmutableArraySet extends Message<ImmutableArraySet.Data> {
  static TYPE_TAG = Symbol("ImmutableArraySet");
  static EMPTY: ImmutableArraySet;
  #arr: ImmutableArray<number>;
  #set: ImmutableSet<string>;
  constructor(props?: ImmutableArraySet.Value, listeners?: Set<(val: this) => void>) {
    if (!props && !listeners && ImmutableArraySet.EMPTY) return ImmutableArraySet.EMPTY;
    super(ImmutableArraySet.TYPE_TAG, "ImmutableArraySet", listeners);
    this.#arr = props ? props.arr === undefined || props.arr === null ? props.arr : props.arr instanceof ImmutableArray ? props.arr : new ImmutableArray(props.arr) : Object.freeze([]);
    this.#set = props ? props.set === undefined || props.set === null ? props.set : props.set instanceof ImmutableSet || Object.prototype.toString.call(props.set) === "[object ImmutableSet]" ? props.set : new ImmutableSet(props.set) : new Set();
    if (this.$listeners.size > 0) {
      this.$enableChildListeners();
    }
    if (!props && !listeners) ImmutableArraySet.EMPTY = this;
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
    const arrArrayValue = arrValue === undefined || arrValue === null ? arrValue : arrValue instanceof ImmutableArray ? arrValue : new ImmutableArray(arrValue);
    if (!((arrArrayValue instanceof ImmutableArray || Object.prototype.toString.call(arrArrayValue) === "[object ImmutableArray]" || Array.isArray(arrArrayValue)) && [...arrArrayValue].every(element => typeof element === "number"))) throw new Error("Invalid value for property \"arr\".");
    props.arr = arrArrayValue;
    const setValue = entries["set"];
    if (setValue === undefined) throw new Error("Missing required property \"set\".");
    const setSetValue = setValue === undefined || setValue === null ? setValue : setValue instanceof ImmutableSet || Object.prototype.toString.call(setValue) === "[object ImmutableSet]" ? setValue : new ImmutableSet(setValue);
    if (!((setSetValue instanceof ImmutableSet || Object.prototype.toString.call(setSetValue) === "[object ImmutableSet]" || setSetValue instanceof Set || Object.prototype.toString.call(setSetValue) === "[object Set]") && [...setSetValue].every(setValue => typeof setValue === "string"))) throw new Error("Invalid value for property \"set\".");
    props.set = setSetValue;
    return props as ImmutableArraySet.Data;
  }
  protected $enableChildListeners(): void {}
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
    if (this.set === setSetNext || this.set !== undefined && this.set.equals(setSetNext)) return this;
    return this.$update(new ImmutableArraySet({
      arr: this.#arr,
      set: setSetNext
    }, this.$listeners));
  }
  addSet(value: string): ImmutableArraySet {
    const setSetSource = this.set ?? [];
    const setSetEntries = [...setSetSource];
    const setSetNext = new Set(setSetEntries);
    setSetNext.add(value);
    if (this.set === setSetNext || this.set !== undefined && this.set.equals(setSetNext)) return this;
    return this.$update(new ImmutableArraySet({
      arr: this.#arr,
      set: setSetNext
    }, this.$listeners));
  }
  clearSet(): ImmutableArraySet {
    const setSetSource = this.set ?? [];
    const setSetEntries = [...setSetSource];
    const setSetNext = new Set(setSetEntries);
    setSetNext.clear();
    if (this.set === setSetNext || this.set !== undefined && this.set.equals(setSetNext)) return this;
    return this.$update(new ImmutableArraySet({
      arr: this.#arr,
      set: setSetNext
    }, this.$listeners));
  }
  copyWithinArr(target: number, start: number, end?: number): ImmutableArraySet {
    const arrArray = this.#arr;
    const arrNext = [...arrArray];
    arrNext.copyWithin(target, start, end);
    return this.$update(new ImmutableArraySet({
      arr: arrNext,
      set: this.#set
    }, this.$listeners));
  }
  deleteAllSet(values: Iterable<string>): ImmutableArraySet {
    const setSetSource = this.set ?? [];
    const setSetEntries = [...setSetSource];
    const setSetNext = new Set(setSetEntries);
    for (const del of values) {
      setSetNext.delete(del);
    }
    if (this.set === setSetNext || this.set !== undefined && this.set.equals(setSetNext)) return this;
    return this.$update(new ImmutableArraySet({
      arr: this.#arr,
      set: setSetNext
    }, this.$listeners));
  }
  deleteSet(value: string): ImmutableArraySet {
    const setSetSource = this.set ?? [];
    const setSetEntries = [...setSetSource];
    const setSetNext = new Set(setSetEntries);
    setSetNext.delete(value);
    if (this.set === setSetNext || this.set !== undefined && this.set.equals(setSetNext)) return this;
    return this.$update(new ImmutableArraySet({
      arr: this.#arr,
      set: setSetNext
    }, this.$listeners));
  }
  fillArr(value: number, start?: number, end?: number): ImmutableArraySet {
    const arrArray = this.#arr;
    const arrNext = [...arrArray];
    arrNext.fill(value, start, end);
    return this.$update(new ImmutableArraySet({
      arr: arrNext,
      set: this.#set
    }, this.$listeners));
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
    if (this.set === setSetNext || this.set !== undefined && this.set.equals(setSetNext)) return this;
    return this.$update(new ImmutableArraySet({
      arr: this.#arr,
      set: setSetNext
    }, this.$listeners));
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
    if (this.set === setSetNext || this.set !== undefined && this.set.equals(setSetNext)) return this;
    return this.$update(new ImmutableArraySet({
      arr: this.#arr,
      set: setSetNext
    }, this.$listeners));
  }
  popArr(): ImmutableArraySet {
    if ((this.arr ?? []).length === 0) return this;
    const arrArray = this.#arr;
    const arrNext = [...arrArray];
    arrNext.pop();
    return this.$update(new ImmutableArraySet({
      arr: arrNext,
      set: this.#set
    }, this.$listeners));
  }
  pushArr(...values): ImmutableArraySet {
    if (values.length === 0) return this;
    const arrArray = this.#arr;
    const arrNext = [...arrArray, ...values];
    return this.$update(new ImmutableArraySet({
      arr: arrNext,
      set: this.#set
    }, this.$listeners));
  }
  reverseArr(): ImmutableArraySet {
    const arrArray = this.#arr;
    const arrNext = [...arrArray];
    arrNext.reverse();
    return this.$update(new ImmutableArraySet({
      arr: arrNext,
      set: this.#set
    }, this.$listeners));
  }
  setArr(value: number[] | Iterable<number>): ImmutableArraySet {
    return this.$update(new ImmutableArraySet({
      arr: value,
      set: this.#set
    }, this.$listeners));
  }
  setSet(value: Set<string> | Iterable<string>): ImmutableArraySet {
    return this.$update(new ImmutableArraySet({
      arr: this.#arr,
      set: value === undefined || value === null ? value : value instanceof ImmutableSet || Object.prototype.toString.call(value) === "[object ImmutableSet]" ? value : new ImmutableSet(value)
    }, this.$listeners));
  }
  shiftArr(): ImmutableArraySet {
    if ((this.arr ?? []).length === 0) return this;
    const arrArray = this.#arr;
    const arrNext = [...arrArray];
    arrNext.shift();
    return this.$update(new ImmutableArraySet({
      arr: arrNext,
      set: this.#set
    }, this.$listeners));
  }
  sortArr(compareFn?: (a: number, b: number) => number): ImmutableArraySet {
    const arrArray = this.#arr;
    const arrNext = [...arrArray];
    arrNext.sort(compareFn);
    return this.$update(new ImmutableArraySet({
      arr: arrNext,
      set: this.#set
    }, this.$listeners));
  }
  spliceArr(start: number, deleteCount?: number, ...items): ImmutableArraySet {
    const arrArray = this.#arr;
    const arrNext = [...arrArray];
    arrNext.splice(start, ...(deleteCount !== undefined ? [deleteCount] : []), ...items);
    return this.$update(new ImmutableArraySet({
      arr: arrNext,
      set: this.#set
    }, this.$listeners));
  }
  unshiftArr(...values): ImmutableArraySet {
    if (values.length === 0) return this;
    const arrArray = this.#arr;
    const arrNext = [...values, ...arrArray];
    return this.$update(new ImmutableArraySet({
      arr: arrNext,
      set: this.#set
    }, this.$listeners));
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
    if (this.set === setSetNext || this.set !== undefined && this.set.equals(setSetNext)) return this;
    return this.$update(new ImmutableArraySet({
      arr: this.#arr,
      set: setSetNext
    }, this.$listeners));
  }
}
export namespace ImmutableArraySet {
  export interface Data {
    arr: number[] | Iterable<number>;
    set: Set<string> | Iterable<string>;
  }
  export type Value = ImmutableArraySet | ImmutableArraySet.Data;
}