// Generated from tests/indexed-array.propane
import { Message, MessagePropDescriptor, ImmutableArray } from "@propanejs/runtime";
export namespace ArrayMessage {
  export type Data = {
    names: ImmutableArray<string>;
    scores: ImmutableArray<number>;
    flags?: ImmutableArray<boolean>;
    labels: ImmutableArray<{
      name: string;
    }>;
  };
  export type Value = ArrayMessage | ArrayMessage.Data;
}
export class ArrayMessage extends Message<ArrayMessage.Data> {
  static TYPE_TAG: symbol = Symbol("ArrayMessage");
  static EMPTY: ArrayMessage;
  #names: ImmutableArray<string>;
  #scores: ImmutableArray<number>;
  #flags: ImmutableArray<boolean> | undefined;
  #labels: ImmutableArray<{
    name: string;
  }>;
  constructor(props?: ArrayMessage.Value) {
    if (!props) {
      if (ArrayMessage.EMPTY) return ArrayMessage.EMPTY;
    }
    super(ArrayMessage.TYPE_TAG);
    this.#names = props ? props.names instanceof ImmutableArray ? props.names : Array.isArray(props.names) ? new ImmutableArray(props.names) : props.names : Object.freeze([]);
    this.#scores = props ? props.scores instanceof ImmutableArray ? props.scores : Array.isArray(props.scores) ? new ImmutableArray(props.scores) : props.scores : Object.freeze([]);
    this.#flags = props ? props.flags instanceof ImmutableArray ? props.flags : Array.isArray(props.flags) ? new ImmutableArray(props.flags) : props.flags : undefined;
    this.#labels = props ? props.labels instanceof ImmutableArray ? props.labels : Array.isArray(props.labels) ? new ImmutableArray(props.labels) : props.labels : Object.freeze([]);
    if (!props) ArrayMessage.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<ArrayMessage.Data>[] {
    return [{
      name: "names",
      fieldNumber: 1,
      getValue: () => this.#names
    }, {
      name: "scores",
      fieldNumber: 2,
      getValue: () => this.#scores
    }, {
      name: "flags",
      fieldNumber: 3,
      getValue: () => this.#flags
    }, {
      name: "labels",
      fieldNumber: 4,
      getValue: () => this.#labels
    }];
  }
  protected $fromEntries(entries: Record<string, unknown>): ArrayMessage.Data {
    const props = {} as Partial<ArrayMessage.Data>;
    const namesValue = entries["1"] === undefined ? entries["names"] : entries["1"];
    if (namesValue === undefined) throw new Error("Missing required property \"names\".");
    const namesArrayValue = namesValue instanceof ImmutableArray ? namesValue : Array.isArray(namesValue) ? new ImmutableArray(namesValue) : namesValue;
    props.names = namesArrayValue;
    const scoresValue = entries["2"] === undefined ? entries["scores"] : entries["2"];
    if (scoresValue === undefined) throw new Error("Missing required property \"scores\".");
    const scoresArrayValue = scoresValue instanceof ImmutableArray ? scoresValue : Array.isArray(scoresValue) ? new ImmutableArray(scoresValue) : scoresValue;
    props.scores = scoresArrayValue;
    const flagsValue = entries["3"] === undefined ? entries["flags"] : entries["3"];
    const flagsNormalized = flagsValue === null ? undefined : flagsValue;
    const flagsArrayValue = flagsNormalized instanceof ImmutableArray ? flagsNormalized : Array.isArray(flagsNormalized) ? new ImmutableArray(flagsNormalized) : flagsNormalized;
    props.flags = flagsArrayValue;
    const labelsValue = entries["4"] === undefined ? entries["labels"] : entries["4"];
    if (labelsValue === undefined) throw new Error("Missing required property \"labels\".");
    const labelsArrayValue = labelsValue instanceof ImmutableArray ? labelsValue : Array.isArray(labelsValue) ? new ImmutableArray(labelsValue) : labelsValue;
    props.labels = labelsArrayValue;
    return props as ArrayMessage.Data;
  }
  get names(): ImmutableArray<string> {
    return this.#names;
  }
  get scores(): ImmutableArray<number> {
    return this.#scores;
  }
  get flags(): ImmutableArray<boolean> | undefined {
    return this.#flags;
  }
  get labels(): ImmutableArray<{
    name: string;
  }> {
    return this.#labels;
  }
  setNames(value: ImmutableArray<string>): ArrayMessage {
    return new ArrayMessage({
      names: value,
      scores: this.#scores,
      flags: this.#flags,
      labels: this.#labels
    });
  }
  setScores(value: ImmutableArray<number>): ArrayMessage {
    return new ArrayMessage({
      names: this.#names,
      scores: value,
      flags: this.#flags,
      labels: this.#labels
    });
  }
  setFlags(value: ImmutableArray<boolean>): ArrayMessage {
    return new ArrayMessage({
      names: this.#names,
      scores: this.#scores,
      flags: value,
      labels: this.#labels
    });
  }
  setLabels(value: ImmutableArray<{
    name: string;
  }>): ArrayMessage {
    return new ArrayMessage({
      names: this.#names,
      scores: this.#scores,
      flags: this.#flags,
      labels: value
    });
  }
  deleteFlags(): ArrayMessage {
    return new ArrayMessage({
      names: this.#names,
      scores: this.#scores,
      labels: this.#labels
    });
  }
  pushNames(...values): ArrayMessage {
    if (!values.length) return this;
    const namesArray = this.#names;
    const namesNext = [...namesArray];
    namesNext.push(...values);
    return new ArrayMessage({
      names: namesNext,
      scores: this.#scores,
      flags: this.#flags,
      labels: this.#labels
    });
  }
  popNames(): ArrayMessage {
    if ((this.names ?? []).length === 0) return this;
    const namesArray = this.#names;
    const namesNext = [...namesArray];
    namesNext.pop();
    return new ArrayMessage({
      names: namesNext,
      scores: this.#scores,
      flags: this.#flags,
      labels: this.#labels
    });
  }
  shiftNames(): ArrayMessage {
    if ((this.names ?? []).length === 0) return this;
    const namesArray = this.#names;
    const namesNext = [...namesArray];
    namesNext.shift();
    return new ArrayMessage({
      names: namesNext,
      scores: this.#scores,
      flags: this.#flags,
      labels: this.#labels
    });
  }
  unshiftNames(...values): ArrayMessage {
    if (!values.length) return this;
    const namesArray = this.#names;
    const namesNext = [...namesArray];
    namesNext.unshift(...values);
    return new ArrayMessage({
      names: namesNext,
      scores: this.#scores,
      flags: this.#flags,
      labels: this.#labels
    });
  }
  spliceNames(start: number, deleteCount?: number, ...items): ArrayMessage {
    const namesArray = this.#names;
    const namesNext = [...namesArray];
    const args = [start];
    if (deleteCount !== undefined) args.push(deleteCount);
    args.push(...items);
    namesNext.splice(...args);
    return new ArrayMessage({
      names: namesNext,
      scores: this.#scores,
      flags: this.#flags,
      labels: this.#labels
    });
  }
  reverseNames(): ArrayMessage {
    const namesArray = this.#names;
    const namesNext = [...namesArray];
    namesNext.reverse();
    return new ArrayMessage({
      names: namesNext,
      scores: this.#scores,
      flags: this.#flags,
      labels: this.#labels
    });
  }
  sortNames(compareFn?: (a: string, b: string) => number): ArrayMessage {
    const namesArray = this.#names;
    const namesNext = [...namesArray];
    namesNext.sort(compareFn);
    return new ArrayMessage({
      names: namesNext,
      scores: this.#scores,
      flags: this.#flags,
      labels: this.#labels
    });
  }
  fillNames(value: string, start?: number, end?: number): ArrayMessage {
    const namesArray = this.#names;
    const namesNext = [...namesArray];
    namesNext.fill(value, start, end);
    return new ArrayMessage({
      names: namesNext,
      scores: this.#scores,
      flags: this.#flags,
      labels: this.#labels
    });
  }
  copyWithinNames(target: number, start: number, end?: number): ArrayMessage {
    const namesArray = this.#names;
    const namesNext = [...namesArray];
    namesNext.copyWithin(target, start, end);
    return new ArrayMessage({
      names: namesNext,
      scores: this.#scores,
      flags: this.#flags,
      labels: this.#labels
    });
  }
  pushScores(...values): ArrayMessage {
    if (!values.length) return this;
    const scoresArray = this.#scores;
    const scoresNext = [...scoresArray];
    scoresNext.push(...values);
    return new ArrayMessage({
      names: this.#names,
      scores: scoresNext,
      flags: this.#flags,
      labels: this.#labels
    });
  }
  popScores(): ArrayMessage {
    if ((this.scores ?? []).length === 0) return this;
    const scoresArray = this.#scores;
    const scoresNext = [...scoresArray];
    scoresNext.pop();
    return new ArrayMessage({
      names: this.#names,
      scores: scoresNext,
      flags: this.#flags,
      labels: this.#labels
    });
  }
  shiftScores(): ArrayMessage {
    if ((this.scores ?? []).length === 0) return this;
    const scoresArray = this.#scores;
    const scoresNext = [...scoresArray];
    scoresNext.shift();
    return new ArrayMessage({
      names: this.#names,
      scores: scoresNext,
      flags: this.#flags,
      labels: this.#labels
    });
  }
  unshiftScores(...values): ArrayMessage {
    if (!values.length) return this;
    const scoresArray = this.#scores;
    const scoresNext = [...scoresArray];
    scoresNext.unshift(...values);
    return new ArrayMessage({
      names: this.#names,
      scores: scoresNext,
      flags: this.#flags,
      labels: this.#labels
    });
  }
  spliceScores(start: number, deleteCount?: number, ...items): ArrayMessage {
    const scoresArray = this.#scores;
    const scoresNext = [...scoresArray];
    const args = [start];
    if (deleteCount !== undefined) args.push(deleteCount);
    args.push(...items);
    scoresNext.splice(...args);
    return new ArrayMessage({
      names: this.#names,
      scores: scoresNext,
      flags: this.#flags,
      labels: this.#labels
    });
  }
  reverseScores(): ArrayMessage {
    const scoresArray = this.#scores;
    const scoresNext = [...scoresArray];
    scoresNext.reverse();
    return new ArrayMessage({
      names: this.#names,
      scores: scoresNext,
      flags: this.#flags,
      labels: this.#labels
    });
  }
  sortScores(compareFn?: (a: number, b: number) => number): ArrayMessage {
    const scoresArray = this.#scores;
    const scoresNext = [...scoresArray];
    scoresNext.sort(compareFn);
    return new ArrayMessage({
      names: this.#names,
      scores: scoresNext,
      flags: this.#flags,
      labels: this.#labels
    });
  }
  fillScores(value: number, start?: number, end?: number): ArrayMessage {
    const scoresArray = this.#scores;
    const scoresNext = [...scoresArray];
    scoresNext.fill(value, start, end);
    return new ArrayMessage({
      names: this.#names,
      scores: scoresNext,
      flags: this.#flags,
      labels: this.#labels
    });
  }
  copyWithinScores(target: number, start: number, end?: number): ArrayMessage {
    const scoresArray = this.#scores;
    const scoresNext = [...scoresArray];
    scoresNext.copyWithin(target, start, end);
    return new ArrayMessage({
      names: this.#names,
      scores: scoresNext,
      flags: this.#flags,
      labels: this.#labels
    });
  }
  pushFlags(...values): ArrayMessage {
    if (!values.length) return this;
    const flagsArray = this.#flags === undefined ? [] : this.#flags;
    const flagsNext = [...flagsArray];
    flagsNext.push(...values);
    return new ArrayMessage({
      names: this.#names,
      scores: this.#scores,
      flags: flagsNext,
      labels: this.#labels
    });
  }
  popFlags(): ArrayMessage {
    if ((this.flags ?? []).length === 0) return this;
    const flagsArray = this.#flags === undefined ? [] : this.#flags;
    const flagsNext = [...flagsArray];
    flagsNext.pop();
    return new ArrayMessage({
      names: this.#names,
      scores: this.#scores,
      flags: flagsNext,
      labels: this.#labels
    });
  }
  shiftFlags(): ArrayMessage {
    if ((this.flags ?? []).length === 0) return this;
    const flagsArray = this.#flags === undefined ? [] : this.#flags;
    const flagsNext = [...flagsArray];
    flagsNext.shift();
    return new ArrayMessage({
      names: this.#names,
      scores: this.#scores,
      flags: flagsNext,
      labels: this.#labels
    });
  }
  unshiftFlags(...values): ArrayMessage {
    if (!values.length) return this;
    const flagsArray = this.#flags === undefined ? [] : this.#flags;
    const flagsNext = [...flagsArray];
    flagsNext.unshift(...values);
    return new ArrayMessage({
      names: this.#names,
      scores: this.#scores,
      flags: flagsNext,
      labels: this.#labels
    });
  }
  spliceFlags(start: number, deleteCount?: number, ...items): ArrayMessage {
    const flagsArray = this.#flags === undefined ? [] : this.#flags;
    const flagsNext = [...flagsArray];
    const args = [start];
    if (deleteCount !== undefined) args.push(deleteCount);
    args.push(...items);
    flagsNext.splice(...args);
    return new ArrayMessage({
      names: this.#names,
      scores: this.#scores,
      flags: flagsNext,
      labels: this.#labels
    });
  }
  reverseFlags(): ArrayMessage {
    const flagsArray = this.#flags === undefined ? [] : this.#flags;
    const flagsNext = [...flagsArray];
    flagsNext.reverse();
    return new ArrayMessage({
      names: this.#names,
      scores: this.#scores,
      flags: flagsNext,
      labels: this.#labels
    });
  }
  sortFlags(compareFn?: (a: boolean, b: boolean) => number): ArrayMessage {
    const flagsArray = this.#flags === undefined ? [] : this.#flags;
    const flagsNext = [...flagsArray];
    flagsNext.sort(compareFn);
    return new ArrayMessage({
      names: this.#names,
      scores: this.#scores,
      flags: flagsNext,
      labels: this.#labels
    });
  }
  fillFlags(value: boolean, start?: number, end?: number): ArrayMessage {
    const flagsArray = this.#flags === undefined ? [] : this.#flags;
    const flagsNext = [...flagsArray];
    flagsNext.fill(value, start, end);
    return new ArrayMessage({
      names: this.#names,
      scores: this.#scores,
      flags: flagsNext,
      labels: this.#labels
    });
  }
  copyWithinFlags(target: number, start: number, end?: number): ArrayMessage {
    const flagsArray = this.#flags === undefined ? [] : this.#flags;
    const flagsNext = [...flagsArray];
    flagsNext.copyWithin(target, start, end);
    return new ArrayMessage({
      names: this.#names,
      scores: this.#scores,
      flags: flagsNext,
      labels: this.#labels
    });
  }
  pushLabels(...values): ArrayMessage {
    if (!values.length) return this;
    const labelsArray = this.#labels;
    const labelsNext = [...labelsArray];
    labelsNext.push(...values);
    return new ArrayMessage({
      names: this.#names,
      scores: this.#scores,
      flags: this.#flags,
      labels: labelsNext
    });
  }
  popLabels(): ArrayMessage {
    if ((this.labels ?? []).length === 0) return this;
    const labelsArray = this.#labels;
    const labelsNext = [...labelsArray];
    labelsNext.pop();
    return new ArrayMessage({
      names: this.#names,
      scores: this.#scores,
      flags: this.#flags,
      labels: labelsNext
    });
  }
  shiftLabels(): ArrayMessage {
    if ((this.labels ?? []).length === 0) return this;
    const labelsArray = this.#labels;
    const labelsNext = [...labelsArray];
    labelsNext.shift();
    return new ArrayMessage({
      names: this.#names,
      scores: this.#scores,
      flags: this.#flags,
      labels: labelsNext
    });
  }
  unshiftLabels(...values): ArrayMessage {
    if (!values.length) return this;
    const labelsArray = this.#labels;
    const labelsNext = [...labelsArray];
    labelsNext.unshift(...values);
    return new ArrayMessage({
      names: this.#names,
      scores: this.#scores,
      flags: this.#flags,
      labels: labelsNext
    });
  }
  spliceLabels(start: number, deleteCount?: number, ...items): ArrayMessage {
    const labelsArray = this.#labels;
    const labelsNext = [...labelsArray];
    const args = [start];
    if (deleteCount !== undefined) args.push(deleteCount);
    args.push(...items);
    labelsNext.splice(...args);
    return new ArrayMessage({
      names: this.#names,
      scores: this.#scores,
      flags: this.#flags,
      labels: labelsNext
    });
  }
  reverseLabels(): ArrayMessage {
    const labelsArray = this.#labels;
    const labelsNext = [...labelsArray];
    labelsNext.reverse();
    return new ArrayMessage({
      names: this.#names,
      scores: this.#scores,
      flags: this.#flags,
      labels: labelsNext
    });
  }
  sortLabels(compareFn?: (a: {
    name: string;
  }, b: {
    name: string;
  }) => number): ArrayMessage {
    const labelsArray = this.#labels;
    const labelsNext = [...labelsArray];
    labelsNext.sort(compareFn);
    return new ArrayMessage({
      names: this.#names,
      scores: this.#scores,
      flags: this.#flags,
      labels: labelsNext
    });
  }
  fillLabels(value: {
    name: string;
  }, start?: number, end?: number): ArrayMessage {
    const labelsArray = this.#labels;
    const labelsNext = [...labelsArray];
    labelsNext.fill(value, start, end);
    return new ArrayMessage({
      names: this.#names,
      scores: this.#scores,
      flags: this.#flags,
      labels: labelsNext
    });
  }
  copyWithinLabels(target: number, start: number, end?: number): ArrayMessage {
    const labelsArray = this.#labels;
    const labelsNext = [...labelsArray];
    labelsNext.copyWithin(target, start, end);
    return new ArrayMessage({
      names: this.#names,
      scores: this.#scores,
      flags: this.#flags,
      labels: labelsNext
    });
  }
}