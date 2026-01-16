/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from examples/react-tic-tac-toe/src/types.pmsg
import type { MessagePropDescriptor, DataObject, ImmutableSet, ImmutableMap } from "../../../runtime/index.js";
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, ImmutableArray } from "../../../runtime/index.js";
// A single cell can be empty (null), X, or O
export type Cell = 'X' | 'O' | null;

// @message
// A snapshot of the board at a point in time
export class BoardState extends Message<BoardState.Data> {
  static TYPE_TAG = Symbol("BoardState");
  static readonly $typeName = "BoardState";
  static EMPTY: BoardState;
  #cells: ImmutableArray<Cell>;
  constructor(props?: BoardState.Value) {
    if (!props && BoardState.EMPTY) return BoardState.EMPTY;
    super(BoardState.TYPE_TAG, "BoardState");
    this.#cells = props ? props.cells === undefined || props.cells === null ? new ImmutableArray() : props.cells instanceof ImmutableArray ? props.cells : new ImmutableArray(props.cells) : new ImmutableArray();
    if (!props) BoardState.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<BoardState.Data>[] {
    return [{
      name: "cells",
      fieldNumber: 1,
      getValue: () => this.#cells
    }];
  }
  protected $fromEntries(entries: Record<string, unknown>): BoardState.Data {
    const props = {} as Partial<BoardState.Data>;
    const cellsValue = entries["1"] === undefined ? entries["cells"] : entries["1"];
    if (cellsValue === undefined) throw new Error("Missing required property \"cells\".");
    const cellsArrayValue = cellsValue === undefined || cellsValue === null ? new ImmutableArray() : cellsValue as object instanceof ImmutableArray ? cellsValue : new ImmutableArray(cellsValue);
    if (!(cellsArrayValue instanceof ImmutableArray || Array.isArray(cellsArrayValue))) throw new Error("Invalid value for property \"cells\".");
    props.cells = cellsArrayValue as ImmutableArray<Cell>;
    return props as BoardState.Data;
  }
  override [WITH_CHILD](key: string | number, child: unknown): BoardState {
    switch (key) {
      case "cells":
        return new (this.constructor as typeof BoardState)({
          cells: child as ImmutableArray<Cell>
        });
      default:
        throw new Error(`Unknown key: ${key}`);
    }
  }
  override *[GET_MESSAGE_CHILDREN]() {
    yield ["cells", this.#cells] as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
  }
  get cells(): ImmutableArray<Cell> {
    return this.#cells;
  }
  copyWithinCells(target: number, start: number, end?: number): BoardState {
    const cellsArray = this.#cells;
    const cellsNext = [...cellsArray];
    cellsNext.copyWithin(target, start, end);
    return this.$update(new (this.constructor as typeof BoardState)({
      cells: cellsNext
    }));
  }
  fillCells(value: Cell, start?: number, end?: number): BoardState {
    const cellsArray = this.#cells;
    const cellsNext = [...cellsArray];
    cellsNext.fill(value, start, end);
    return this.$update(new (this.constructor as typeof BoardState)({
      cells: cellsNext
    }));
  }
  popCells(): BoardState {
    if ((this.cells ?? []).length === 0) return this;
    const cellsArray = this.#cells;
    const cellsNext = [...cellsArray];
    cellsNext.pop();
    return this.$update(new (this.constructor as typeof BoardState)({
      cells: cellsNext
    }));
  }
  pushCells(...values): BoardState {
    if (values.length === 0) return this;
    const cellsArray = this.#cells;
    const cellsNext = [...cellsArray, ...values];
    return this.$update(new (this.constructor as typeof BoardState)({
      cells: cellsNext
    }));
  }
  reverseCells(): BoardState {
    const cellsArray = this.#cells;
    const cellsNext = [...cellsArray];
    cellsNext.reverse();
    return this.$update(new (this.constructor as typeof BoardState)({
      cells: cellsNext
    }));
  }
  setCells(value: Cell[] | Iterable<Cell>): BoardState {
    return this.$update(new (this.constructor as typeof BoardState)({
      cells: value
    }));
  }
  shiftCells(): BoardState {
    if ((this.cells ?? []).length === 0) return this;
    const cellsArray = this.#cells;
    const cellsNext = [...cellsArray];
    cellsNext.shift();
    return this.$update(new (this.constructor as typeof BoardState)({
      cells: cellsNext
    }));
  }
  sortCells(compareFn?: (a: Cell, b: Cell) => number): BoardState {
    const cellsArray = this.#cells;
    const cellsNext = [...cellsArray];
    cellsNext.sort(compareFn);
    return this.$update(new (this.constructor as typeof BoardState)({
      cells: cellsNext
    }));
  }
  spliceCells(start: number, deleteCount?: number, ...items): BoardState {
    const cellsArray = this.#cells;
    const cellsNext = [...cellsArray];
    cellsNext.splice(start, ...(deleteCount !== undefined ? [deleteCount] : []), ...items);
    return this.$update(new (this.constructor as typeof BoardState)({
      cells: cellsNext
    }));
  }
  unshiftCells(...values): BoardState {
    if (values.length === 0) return this;
    const cellsArray = this.#cells;
    const cellsNext = [...values, ...cellsArray];
    return this.$update(new (this.constructor as typeof BoardState)({
      cells: cellsNext
    }));
  }
}
export namespace BoardState {
  export type Data = {
    cells: Cell[] | Iterable<Cell>;
  };
  export type Value = BoardState | BoardState.Data;
} // @message
// The complete game state with history for undo/time-travel
export class GameState extends Message<GameState.Data> {
  static TYPE_TAG = Symbol("GameState");
  static readonly $typeName = "GameState";
  static EMPTY: GameState;
  #history: ImmutableArray<BoardState>;
  #currentMove: number;
  constructor(props?: GameState.Value) {
    if (!props && GameState.EMPTY) return GameState.EMPTY;
    super(GameState.TYPE_TAG, "GameState");
    this.#history = props ? props.history === undefined || props.history === null ? new ImmutableArray() : new ImmutableArray(Array.from(props.history).map(v => v instanceof BoardState ? v : new BoardState(v))) : new ImmutableArray();
    this.#currentMove = props ? props.currentMove : 0;
    if (!props) GameState.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<GameState.Data>[] {
    return [{
      name: "history",
      fieldNumber: 1,
      getValue: () => this.#history
    }, {
      name: "currentMove",
      fieldNumber: 2,
      getValue: () => this.#currentMove
    }];
  }
  protected $fromEntries(entries: Record<string, unknown>): GameState.Data {
    const props = {} as Partial<GameState.Data>;
    const historyValue = entries["1"] === undefined ? entries["history"] : entries["1"];
    if (historyValue === undefined) throw new Error("Missing required property \"history\".");
    const historyArrayValue = historyValue === undefined || historyValue === null ? new ImmutableArray() : historyValue as object instanceof ImmutableArray ? historyValue : new ImmutableArray(historyValue);
    if (!(historyArrayValue instanceof ImmutableArray || Array.isArray(historyArrayValue))) throw new Error("Invalid value for property \"history\".");
    props.history = historyArrayValue as ImmutableArray<BoardState>;
    const currentMoveValue = entries["2"] === undefined ? entries["currentMove"] : entries["2"];
    if (currentMoveValue === undefined) throw new Error("Missing required property \"currentMove\".");
    if (!(typeof currentMoveValue === "number")) throw new Error("Invalid value for property \"currentMove\".");
    props.currentMove = currentMoveValue;
    return props as GameState.Data;
  }
  override [WITH_CHILD](key: string | number, child: unknown): GameState {
    switch (key) {
      case "history":
        return new (this.constructor as typeof GameState)({
          history: child as ImmutableArray<BoardState>,
          currentMove: this.#currentMove
        });
      default:
        throw new Error(`Unknown key: ${key}`);
    }
  }
  override *[GET_MESSAGE_CHILDREN]() {
    yield ["history", this.#history] as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
  }
  get history(): ImmutableArray<BoardState> {
    return this.#history;
  }
  get currentMove(): number {
    return this.#currentMove;
  }
  copyWithinHistory(target: number, start: number, end?: number): GameState {
    const historyArray = this.#history;
    const historyNext = [...historyArray];
    historyNext.copyWithin(target, start, end);
    return this.$update(new (this.constructor as typeof GameState)({
      history: historyNext,
      currentMove: this.#currentMove
    }));
  }
  fillHistory(value: BoardState, start?: number, end?: number): GameState {
    const historyArray = this.#history;
    const historyNext = [...historyArray];
    historyNext.fill(value, start, end);
    return this.$update(new (this.constructor as typeof GameState)({
      history: historyNext,
      currentMove: this.#currentMove
    }));
  }
  popHistory(): GameState {
    if ((this.history ?? []).length === 0) return this;
    const historyArray = this.#history;
    const historyNext = [...historyArray];
    historyNext.pop();
    return this.$update(new (this.constructor as typeof GameState)({
      history: historyNext,
      currentMove: this.#currentMove
    }));
  }
  pushHistory(...values): GameState {
    if (values.length === 0) return this;
    const historyArray = this.#history;
    const historyNext = [...historyArray, ...values];
    return this.$update(new (this.constructor as typeof GameState)({
      history: historyNext,
      currentMove: this.#currentMove
    }));
  }
  reverseHistory(): GameState {
    const historyArray = this.#history;
    const historyNext = [...historyArray];
    historyNext.reverse();
    return this.$update(new (this.constructor as typeof GameState)({
      history: historyNext,
      currentMove: this.#currentMove
    }));
  }
  setCurrentMove(value: number): GameState {
    return this.$update(new (this.constructor as typeof GameState)({
      history: this.#history,
      currentMove: value
    }));
  }
  setHistory(value: BoardState[] | Iterable<BoardState>): GameState {
    return this.$update(new (this.constructor as typeof GameState)({
      history: value,
      currentMove: this.#currentMove
    }));
  }
  shiftHistory(): GameState {
    if ((this.history ?? []).length === 0) return this;
    const historyArray = this.#history;
    const historyNext = [...historyArray];
    historyNext.shift();
    return this.$update(new (this.constructor as typeof GameState)({
      history: historyNext,
      currentMove: this.#currentMove
    }));
  }
  sortHistory(compareFn?: (a: BoardState, b: BoardState) => number): GameState {
    const historyArray = this.#history;
    const historyNext = [...historyArray];
    historyNext.sort(compareFn);
    return this.$update(new (this.constructor as typeof GameState)({
      history: historyNext,
      currentMove: this.#currentMove
    }));
  }
  spliceHistory(start: number, deleteCount?: number, ...items): GameState {
    const historyArray = this.#history;
    const historyNext = [...historyArray];
    historyNext.splice(start, ...(deleteCount !== undefined ? [deleteCount] : []), ...items);
    return this.$update(new (this.constructor as typeof GameState)({
      history: historyNext,
      currentMove: this.#currentMove
    }));
  }
  unshiftHistory(...values): GameState {
    if (values.length === 0) return this;
    const historyArray = this.#history;
    const historyNext = [...values, ...historyArray];
    return this.$update(new (this.constructor as typeof GameState)({
      history: historyNext,
      currentMove: this.#currentMove
    }));
  }
}
export namespace GameState {
  export type Data = {
    history: BoardState[] | Iterable<BoardState>;
    currentMove: number;
  };
  export type Value = GameState | GameState.Data;
}
