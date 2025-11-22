/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/immutable-array-set.propane
import { ImmutableArray } from '../common/array/immutable';
import { ImmutableSet } from '../common/set/immutable';
import { Message, MessagePropDescriptor } from "@propanejs/runtime";
export namespace ImmutableArraySet {
  export interface Data {
    arr: ImmutableArray<number>;
    set: ImmutableSet<string>;
  }
  export type Value = ImmutableArraySet | ImmutableArraySet.Data;
}
export class ImmutableArraySet extends Message<ImmutableArraySet.Data> {
  static TYPE_TAG = Symbol("ImmutableArraySet");
  static EMPTY: ImmutableArraySet;
  #arr: ImmutableArray<number>;
  #set: ImmutableSet<string>;
  constructor(props?: ImmutableArraySet.Value) {
    if (!props) {
      if (ImmutableArraySet.EMPTY) return ImmutableArraySet.EMPTY;
    }
    super(ImmutableArraySet.TYPE_TAG);
    this.#arr = props ? props.arr : new ImmutableArray();
    this.#set = props ? props.set : new ImmutableSet();
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
    props.arr = arrValue;
    const setValue = entries["set"];
    if (setValue === undefined) throw new Error("Missing required property \"set\".");
    props.set = setValue;
    return props as ImmutableArraySet.Data;
  }
  get arr(): ImmutableArray<number> {
    return this.#arr;
  }
  get set(): ImmutableSet<string> {
    return this.#set;
  }
  setArr(value: ImmutableArray<number>): ImmutableArraySet {
    return new ImmutableArraySet({
      arr: value,
      set: this.#set
    });
  }
  setSet(value: ImmutableSet<string>): ImmutableArraySet {
    return new ImmutableArraySet({
      arr: this.#arr,
      set: value
    });
  }
}