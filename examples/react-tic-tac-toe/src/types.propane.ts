/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from examples/react-tic-tac-toe/src/types.propane
import { Message, MessagePropDescriptor, ImmutableArray, ADD_UPDATE_LISTENER } from "@propanejs/runtime";
// A single cell can be empty (null), X, or O
export type Cell = 'X' | 'O' | null;

// A snapshot of the board at a point in time
export type CellType = Cell;
export class BoardState extends Message<BoardState.Data> {
  static TYPE_TAG = Symbol("BoardState");
  static EMPTY: BoardState;
  #cells: ImmutableArray<Cell>;
  constructor(props?: BoardState.Value, listeners?: Set<(val: this) => void>) {
    if (!props && !listeners && BoardState.EMPTY) return BoardState.EMPTY;
    super(BoardState.TYPE_TAG, "BoardState", listeners);
    this.#cells = props ? props.cells === undefined || props.cells === null ? props.cells : props.cells instanceof ImmutableArray ? props.cells : new ImmutableArray(props.cells) : Object.freeze([]);
    if (this.$listeners.size > 0) {
      this.$enableChildListeners();
    }
    if (!props && !listeners) BoardState.EMPTY = this;
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
    const cellsArrayValue = cellsValue === undefined || cellsValue === null ? cellsValue : cellsValue instanceof ImmutableArray ? cellsValue : new ImmutableArray(cellsValue);
    if (!(cellsArrayValue instanceof ImmutableArray || Object.prototype.toString.call(cellsArrayValue) === "[object ImmutableArray]" || Array.isArray(cellsArrayValue))) throw new Error("Invalid value for property \"cells\".");
    props.cells = cellsArrayValue;
    return props as BoardState.Data;
  }
  protected $enableChildListeners(): void {
    this.$addChildUnsubscribe(this.#cells[ADD_UPDATE_LISTENER](newValue => {
      this.setCells(newValue);
    }).unsubscribe);
  }
  get cells(): ImmutableArray<Cell> {
    return this.#cells;
  }
  copyWithinCells(target: number, start: number, end?: number): BoardState {
    const cellsArray = this.#cells;
    const cellsNext = [...cellsArray];
    cellsNext.copyWithin(target, start, end);
    return this.$update(new BoardState({
      cells: cellsNext
    }, this.$listeners));
  }
  fillCells(value: Cell, start?: number, end?: number): BoardState {
    const cellsArray = this.#cells;
    const cellsNext = [...cellsArray];
    cellsNext.fill(value, start, end);
    return this.$update(new BoardState({
      cells: cellsNext
    }, this.$listeners));
  }
  popCells(): BoardState {
    if ((this.cells ?? []).length === 0) return this;
    const cellsArray = this.#cells;
    const cellsNext = [...cellsArray];
    cellsNext.pop();
    return this.$update(new BoardState({
      cells: cellsNext
    }, this.$listeners));
  }
  pushCells(...values): BoardState {
    if (values.length === 0) return this;
    const cellsArray = this.#cells;
    const cellsNext = [...cellsArray, ...values];
    return this.$update(new BoardState({
      cells: cellsNext
    }, this.$listeners));
  }
  reverseCells(): BoardState {
    const cellsArray = this.#cells;
    const cellsNext = [...cellsArray];
    cellsNext.reverse();
    return this.$update(new BoardState({
      cells: cellsNext
    }, this.$listeners));
  }
  setCells(value: Cell[] | Iterable<Cell>): BoardState {
    return this.$update(new BoardState({
      cells: value
    }, this.$listeners));
  }
  shiftCells(): BoardState {
    if ((this.cells ?? []).length === 0) return this;
    const cellsArray = this.#cells;
    const cellsNext = [...cellsArray];
    cellsNext.shift();
    return this.$update(new BoardState({
      cells: cellsNext
    }, this.$listeners));
  }
  sortCells(compareFn?: (a: Cell, b: Cell) => number): BoardState {
    const cellsArray = this.#cells;
    const cellsNext = [...cellsArray];
    cellsNext.sort(compareFn);
    return this.$update(new BoardState({
      cells: cellsNext
    }, this.$listeners));
  }
  spliceCells(start: number, deleteCount?: number, ...items): BoardState {
    const cellsArray = this.#cells;
    const cellsNext = [...cellsArray];
    cellsNext.splice(start, ...(deleteCount !== undefined ? [deleteCount] : []), ...items);
    return this.$update(new BoardState({
      cells: cellsNext
    }, this.$listeners));
  }
  unshiftCells(...values): BoardState {
    if (values.length === 0) return this;
    const cellsArray = this.#cells;
    const cellsNext = [...values, ...cellsArray];
    return this.$update(new BoardState({
      cells: cellsNext
    }, this.$listeners));
  }
}
export namespace BoardState {
  export interface Data {
    cells: Cell[] | Iterable<Cell>;
  }
  export type Value = BoardState | BoardState.Data;
} // The complete game state with history for undo/time-travel
export class GameState extends Message<GameState.Data> {
  static TYPE_TAG = Symbol("GameState");
  static EMPTY: GameState;
  #history: ImmutableArray<BoardState>;
  #currentMove: number;
  constructor(props?: GameState.Value, listeners?: Set<(val: this) => void>) {
    if (!props && !listeners && GameState.EMPTY) return GameState.EMPTY;
    super(GameState.TYPE_TAG, "GameState", listeners);
    this.#history = props ? props.history === undefined || props.history === null ? props.history : new ImmutableArray(Array.from(props.history).map(v => v instanceof BoardState ? v : new BoardState(v))) : Object.freeze([]);
    this.#currentMove = props ? props.currentMove : 0;
    if (this.$listeners.size > 0) {
      this.$enableChildListeners();
    }
    if (!props && !listeners) GameState.EMPTY = this;
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
    const historyArrayValue = historyValue === undefined || historyValue === null ? historyValue : historyValue instanceof ImmutableArray ? historyValue : new ImmutableArray(historyValue);
    if (!(historyArrayValue instanceof ImmutableArray || Object.prototype.toString.call(historyArrayValue) === "[object ImmutableArray]" || Array.isArray(historyArrayValue))) throw new Error("Invalid value for property \"history\".");
    props.history = historyArrayValue;
    const currentMoveValue = entries["2"] === undefined ? entries["currentMove"] : entries["2"];
    if (currentMoveValue === undefined) throw new Error("Missing required property \"currentMove\".");
    if (!(typeof currentMoveValue === "number")) throw new Error("Invalid value for property \"currentMove\".");
    props.currentMove = currentMoveValue;
    return props as GameState.Data;
  }
  protected $enableChildListeners(): void {
    this.$addChildUnsubscribe(this.#history[ADD_UPDATE_LISTENER](newValue => {
      this.setHistory(newValue);
    }).unsubscribe);
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
    return this.$update(new GameState({
      history: historyNext,
      currentMove: this.#currentMove
    }, this.$listeners));
  }
  fillHistory(value: BoardState, start?: number, end?: number): GameState {
    const historyArray = this.#history;
    const historyNext = [...historyArray];
    historyNext.fill(value, start, end);
    return this.$update(new GameState({
      history: historyNext,
      currentMove: this.#currentMove
    }, this.$listeners));
  }
  popHistory(): GameState {
    if ((this.history ?? []).length === 0) return this;
    const historyArray = this.#history;
    const historyNext = [...historyArray];
    historyNext.pop();
    return this.$update(new GameState({
      history: historyNext,
      currentMove: this.#currentMove
    }, this.$listeners));
  }
  pushHistory(...values): GameState {
    if (values.length === 0) return this;
    const historyArray = this.#history;
    const historyNext = [...historyArray, ...values];
    return this.$update(new GameState({
      history: historyNext,
      currentMove: this.#currentMove
    }, this.$listeners));
  }
  reverseHistory(): GameState {
    const historyArray = this.#history;
    const historyNext = [...historyArray];
    historyNext.reverse();
    return this.$update(new GameState({
      history: historyNext,
      currentMove: this.#currentMove
    }, this.$listeners));
  }
  setCurrentMove(value: number): GameState {
    return this.$update(new GameState({
      history: this.#history,
      currentMove: value
    }, this.$listeners));
  }
  setHistory(value: BoardState[] | Iterable<BoardState>): GameState {
    return this.$update(new GameState({
      history: value,
      currentMove: this.#currentMove
    }, this.$listeners));
  }
  shiftHistory(): GameState {
    if ((this.history ?? []).length === 0) return this;
    const historyArray = this.#history;
    const historyNext = [...historyArray];
    historyNext.shift();
    return this.$update(new GameState({
      history: historyNext,
      currentMove: this.#currentMove
    }, this.$listeners));
  }
  sortHistory(compareFn?: (a: BoardState, b: BoardState) => number): GameState {
    const historyArray = this.#history;
    const historyNext = [...historyArray];
    historyNext.sort(compareFn);
    return this.$update(new GameState({
      history: historyNext,
      currentMove: this.#currentMove
    }, this.$listeners));
  }
  spliceHistory(start: number, deleteCount?: number, ...items): GameState {
    const historyArray = this.#history;
    const historyNext = [...historyArray];
    historyNext.splice(start, ...(deleteCount !== undefined ? [deleteCount] : []), ...items);
    return this.$update(new GameState({
      history: historyNext,
      currentMove: this.#currentMove
    }, this.$listeners));
  }
  unshiftHistory(...values): GameState {
    if (values.length === 0) return this;
    const historyArray = this.#history;
    const historyNext = [...values, ...historyArray];
    return this.$update(new GameState({
      history: historyNext,
      currentMove: this.#currentMove
    }, this.$listeners));
  }
}
export namespace GameState {
  export interface Data {
    history: BoardState[] | Iterable<BoardState>;
    currentMove: number;
  }
  export type Value = GameState | GameState.Data;
}