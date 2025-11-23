/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/immutable-array-set.propane
import { ImmutableArray } from '../common/array/immutable';
import { ImmutableSet } from '../common/set/immutable';
import { Message, MessagePropDescriptor } from "@propanejs/runtime";
export class ImmutableArraySet extends Message<ImmutableArraySet.Data> {
  static TYPE_TAG = Symbol("ImmutableArraySet");
  static EMPTY: ImmutableArraySet;
  #arr: ImmutableArray<number>;
  #set: ImmutableSet<string>;
  constructor(props?: ImmutableArraySet.Value) {
    if (!props && ImmutableArraySet.EMPTY) return ImmutableArraySet.EMPTY;
    super(ImmutableArraySet.TYPE_TAG);
    this.#arr = props ? props.arr === undefined || props.arr === null ? props.arr : props.arr instanceof ImmutableArray ? props.arr : new ImmutableArray(props.arr) : Object.freeze([]);
    this.#set = props ? props.set === undefined || props.set === null ? props.set : props.set instanceof ImmutableSet || Object.prototype.toString.call(props.set) === "[object ImmutableSet]" ? props.set : new ImmutableSet(props.set) : new Set();
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
    return new ImmutableArraySet({
      arr: this.#arr,
      set: setSetNext
    });
  }
  addSet(value: string): ImmutableArraySet {
    const setSetSource = this.set ?? [];
    const setSetEntries = [...setSetSource];
    const setSetNext = new Set(setSetEntries);
    setSetNext.add(value);
    if (this.set === setSetNext || this.set !== undefined && this.set.equals(setSetNext)) return this;
    return new ImmutableArraySet({
      arr: this.#arr,
      set: setSetNext
    });
  }
  clearSet(): ImmutableArraySet {
    const setSetSource = this.set ?? [];
    const setSetEntries = [...setSetSource];
    const setSetNext = new Set(setSetEntries);
    setSetNext.clear();
    if (this.set === setSetNext || this.set !== undefined && this.set.equals(setSetNext)) return this;
    return new ImmutableArraySet({
      arr: this.#arr,
      set: setSetNext
    });
  }
  copyWithinArr(target: number, start: number, end?: number): ImmutableArraySet {
    const arrArray = this.#arr;
    const arrNext = [...arrArray];
    arrNext.copyWithin(target, start, end);
    return new ImmutableArraySet({
      arr: arrNext,
      set: this.#set
    });
  }
  deleteAllSet(values: Iterable<string>): ImmutableArraySet {
    const setSetSource = this.set ?? [];
    const setSetEntries = [...setSetSource];
    const setSetNext = new Set(setSetEntries);
    for (const del of values) {
      setSetNext.delete(del);
    }
    if (this.set === setSetNext || this.set !== undefined && this.set.equals(setSetNext)) return this;
    return new ImmutableArraySet({
      arr: this.#arr,
      set: setSetNext
    });
  }
  deleteSet(value: string): ImmutableArraySet {
    const setSetSource = this.set ?? [];
    const setSetEntries = [...setSetSource];
    const setSetNext = new Set(setSetEntries);
    setSetNext.delete(value);
    if (this.set === setSetNext || this.set !== undefined && this.set.equals(setSetNext)) return this;
    return new ImmutableArraySet({
      arr: this.#arr,
      set: setSetNext
    });
  }
  fillArr(value: number, start?: number, end?: number): ImmutableArraySet {
    const arrArray = this.#arr;
    const arrNext = [...arrArray];
    arrNext.fill(value, start, end);
    return new ImmutableArraySet({
      arr: arrNext,
      set: this.#set
    });
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
    return new ImmutableArraySet({
      arr: this.#arr,
      set: setSetNext
    });
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
    return new ImmutableArraySet({
      arr: this.#arr,
      set: setSetNext
    });
  }
  popArr(): ImmutableArraySet {
    if ((this.arr ?? []).length === 0) return this;
    const arrArray = this.#arr;
    const arrNext = [...arrArray];
    arrNext.pop();
    return new ImmutableArraySet({
      arr: arrNext,
      set: this.#set
    });
  }
  pushArr(...values): ImmutableArraySet {
    if (values.length === 0) return this;
    const arrArray = this.#arr;
    const arrNext = [...arrArray, ...values];
    return new ImmutableArraySet({
      arr: arrNext,
      set: this.#set
    });
  }
  reverseArr(): ImmutableArraySet {
    const arrArray = this.#arr;
    const arrNext = [...arrArray];
    arrNext.reverse();
    return new ImmutableArraySet({
      arr: arrNext,
      set: this.#set
    });
  }
  setArr(value: number[] | Iterable<number>): ImmutableArraySet {
    return new ImmutableArraySet({
      arr: value,
      set: this.#set
    });
  }
  setSet(value: Set<string> | Iterable<string>): ImmutableArraySet {
    return new ImmutableArraySet({
      arr: this.#arr,
      set: value === undefined || value === null ? value : value instanceof ImmutableSet || Object.prototype.toString.call(value) === "[object ImmutableSet]" ? value : new ImmutableSet(value)
    });
  }
  shiftArr(): ImmutableArraySet {
    if ((this.arr ?? []).length === 0) return this;
    const arrArray = this.#arr;
    const arrNext = [...arrArray];
    arrNext.shift();
    return new ImmutableArraySet({
      arr: arrNext,
      set: this.#set
    });
  }
  sortArr(compareFn?: (a: number, b: number) => number): ImmutableArraySet {
    const arrArray = this.#arr;
    const arrNext = [...arrArray];
    arrNext.sort(compareFn);
    return new ImmutableArraySet({
      arr: arrNext,
      set: this.#set
    });
  }
  spliceArr(start: number, deleteCount?: number, ...items): ImmutableArraySet {
    const arrArray = this.#arr;
    const arrNext = [...arrArray];
    const args = [start];
    if (deleteCount !== undefined) args.push(deleteCount);
    args.push(...items);
    arrNext.splice(...args);
    return new ImmutableArraySet({
      arr: arrNext,
      set: this.#set
    });
  }
  unshiftArr(...values): ImmutableArraySet {
    if (values.length === 0) return this;
    const arrArray = this.#arr;
    const arrNext = [...values, ...arrArray];
    return new ImmutableArraySet({
      arr: arrNext,
      set: this.#set
    });
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
    return new ImmutableArraySet({
      arr: this.#arr,
      set: setSetNext
    });
  }
}
export namespace ImmutableArraySet {
  export interface Data {
    arr: number[] | Iterable<number>;
    set: Set<string> | Iterable<string>;
  }
  export type Value = ImmutableArraySet | ImmutableArraySet.Data;
}