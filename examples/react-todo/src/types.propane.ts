/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from src/types.propane
import { Message, MessagePropDescriptor, ImmutableArray } from "@propanejs/runtime";
export class Todo extends Message<Todo.Data> {
  static TYPE_TAG = Symbol("Todo");
  static EMPTY: Todo;
  #id: string;
  #text: string;
  #completed: boolean;
  constructor(props?: Todo.Value) {
    if (!props && Todo.EMPTY) return Todo.EMPTY;
    super(Todo.TYPE_TAG, "Todo");
    this.#id = props ? props.id : "";
    this.#text = props ? props.text : "";
    this.#completed = props ? props.completed : false;
    if (!props) Todo.EMPTY = this;
    return this.intern();
  }
  protected $getPropDescriptors(): MessagePropDescriptor<Todo.Data>[] {
    return [{
      name: "id",
      fieldNumber: null,
      getValue: () => this.#id
    }, {
      name: "text",
      fieldNumber: null,
      getValue: () => this.#text
    }, {
      name: "completed",
      fieldNumber: null,
      getValue: () => this.#completed
    }];
  }
  protected $fromEntries(entries: Record<string, unknown>): Todo.Data {
    const props = {} as Partial<Todo.Data>;
    const idValue = entries["id"];
    if (idValue === undefined) throw new Error("Missing required property \"id\".");
    if (!(typeof idValue === "string")) throw new Error("Invalid value for property \"id\".");
    props.id = idValue;
    const textValue = entries["text"];
    if (textValue === undefined) throw new Error("Missing required property \"text\".");
    if (!(typeof textValue === "string")) throw new Error("Invalid value for property \"text\".");
    props.text = textValue;
    const completedValue = entries["completed"];
    if (completedValue === undefined) throw new Error("Missing required property \"completed\".");
    if (!(typeof completedValue === "boolean")) throw new Error("Invalid value for property \"completed\".");
    props.completed = completedValue;
    return props as Todo.Data;
  }
  get id(): string {
    return this.#id;
  }
  get text(): string {
    return this.#text;
  }
  get completed(): boolean {
    return this.#completed;
  }
  setCompleted(value: boolean): Todo {
    return new Todo({
      id: this.#id,
      text: this.#text,
      completed: value
    });
  }
  setId(value: string): Todo {
    return new Todo({
      id: value,
      text: this.#text,
      completed: this.#completed
    });
  }
  setText(value: string): Todo {
    return new Todo({
      id: this.#id,
      text: value,
      completed: this.#completed
    });
  }
}
export namespace Todo {
  export interface Data {
    id: string;
    text: string;
    completed: boolean;
  }
  export type Value = Todo | Todo.Data;
}
export class AppState extends Message<AppState.Data> {
  static TYPE_TAG = Symbol("AppState");
  static EMPTY: AppState;
  #todos: ImmutableArray<Todo>;
  #filter: string;
  constructor(props?: AppState.Value) {
    if (!props && AppState.EMPTY) return AppState.EMPTY;
    super(AppState.TYPE_TAG, "AppState");
    this.#todos = props ? props.todos === undefined || props.todos === null ? props.todos : new ImmutableArray(Array.from(props.todos).map(v => v instanceof Todo ? v : new Todo(v))) : Object.freeze([]);
    this.#filter = props ? props.filter : "";
    if (!props) AppState.EMPTY = this;
    return this.intern();
  }
  protected $getPropDescriptors(): MessagePropDescriptor<AppState.Data>[] {
    return [{
      name: "todos",
      fieldNumber: null,
      getValue: () => this.#todos
    }, {
      name: "filter",
      fieldNumber: null,
      getValue: () => this.#filter
    }];
  }
  protected $fromEntries(entries: Record<string, unknown>): AppState.Data {
    const props = {} as Partial<AppState.Data>;
    const todosValue = entries["todos"];
    if (todosValue === undefined) throw new Error("Missing required property \"todos\".");
    const todosArrayValue = todosValue === undefined || todosValue === null ? todosValue : todosValue instanceof ImmutableArray ? todosValue : new ImmutableArray(todosValue);
    if (!(todosArrayValue instanceof ImmutableArray || Object.prototype.toString.call(todosArrayValue) === "[object ImmutableArray]" || Array.isArray(todosArrayValue))) throw new Error("Invalid value for property \"todos\".");
    props.todos = todosArrayValue;
    const filterValue = entries["filter"];
    if (filterValue === undefined) throw new Error("Missing required property \"filter\".");
    if (!(typeof filterValue === "string")) throw new Error("Invalid value for property \"filter\".");
    props.filter = filterValue;
    return props as AppState.Data;
  }
  get todos(): ImmutableArray<Todo> {
    return this.#todos;
  }
  get filter(): string {
    return this.#filter;
  }
  copyWithinTodos(target: number, start: number, end?: number): AppState {
    const todosArray = this.#todos;
    const todosNext = [...todosArray];
    todosNext.copyWithin(target, start, end);
    return new AppState({
      todos: todosNext,
      filter: this.#filter
    });
  }
  fillTodos(value: Todo, start?: number, end?: number): AppState {
    const todosArray = this.#todos;
    const todosNext = [...todosArray];
    todosNext.fill(value, start, end);
    return new AppState({
      todos: todosNext,
      filter: this.#filter
    });
  }
  popTodos(): AppState {
    if ((this.todos ?? []).length === 0) return this;
    const todosArray = this.#todos;
    const todosNext = [...todosArray];
    todosNext.pop();
    return new AppState({
      todos: todosNext,
      filter: this.#filter
    });
  }
  pushTodos(...values): AppState {
    if (values.length === 0) return this;
    const todosArray = this.#todos;
    const todosNext = [...todosArray, ...values];
    return new AppState({
      todos: todosNext,
      filter: this.#filter
    });
  }
  reverseTodos(): AppState {
    const todosArray = this.#todos;
    const todosNext = [...todosArray];
    todosNext.reverse();
    return new AppState({
      todos: todosNext,
      filter: this.#filter
    });
  }
  setFilter(value: string): AppState {
    return new AppState({
      todos: this.#todos,
      filter: value
    });
  }
  setTodos(value: Todo[] | Iterable<Todo>): AppState {
    return new AppState({
      todos: value,
      filter: this.#filter
    });
  }
  shiftTodos(): AppState {
    if ((this.todos ?? []).length === 0) return this;
    const todosArray = this.#todos;
    const todosNext = [...todosArray];
    todosNext.shift();
    return new AppState({
      todos: todosNext,
      filter: this.#filter
    });
  }
  sortTodos(compareFn?: (a: Todo, b: Todo) => number): AppState {
    const todosArray = this.#todos;
    const todosNext = [...todosArray];
    todosNext.sort(compareFn);
    return new AppState({
      todos: todosNext,
      filter: this.#filter
    });
  }
  spliceTodos(start: number, deleteCount?: number, ...items): AppState {
    const todosArray = this.#todos;
    const todosNext = [...todosArray];
    todosNext.splice(start, ...(deleteCount !== undefined ? [deleteCount] : []), ...items);
    return new AppState({
      todos: todosNext,
      filter: this.#filter
    });
  }
  unshiftTodos(...values): AppState {
    if (values.length === 0) return this;
    const todosArray = this.#todos;
    const todosNext = [...values, ...todosArray];
    return new AppState({
      todos: todosNext,
      filter: this.#filter
    });
  }
}
export namespace AppState {
  export interface Data {
    todos: Todo[] | Iterable<Todo>;
    filter: string;
  }
  export type Value = AppState | AppState.Data;
}