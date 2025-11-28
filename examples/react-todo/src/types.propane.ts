/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from src/types.propane
import { Message, MessagePropDescriptor, ImmutableArray, ADD_UPDATE_LISTENER } from "@propanejs/runtime";
export class Todo extends Message<Todo.Data> {
  static TYPE_TAG = Symbol("Todo");
  static EMPTY: Todo;
  #id: string;
  #text: string;
  #completed: boolean;
  constructor(props?: Todo.Value, listeners?: Set<(val: this) => void>) {
    if (!props && !listeners && Todo.EMPTY) return Todo.EMPTY;
    super(Todo.TYPE_TAG, "Todo", listeners);
    this.#id = props ? props.id : "";
    this.#text = props ? props.text : "";
    this.#completed = props ? props.completed : false;
    if (this.$listeners.size > 0) {
      this.$enableChildListeners();
    }
    if (!props && !listeners) Todo.EMPTY = this;
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
    return this.$update(new Todo({
      id: this.#id,
      text: this.#text,
      completed: value
    }, this.$listeners));
  }
  setId(value: string): Todo {
    return this.$update(new Todo({
      id: value,
      text: this.#text,
      completed: this.#completed
    }, this.$listeners));
  }
  setText(value: string): Todo {
    return this.$update(new Todo({
      id: this.#id,
      text: value,
      completed: this.#completed
    }, this.$listeners));
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
  #filter: 'all' | 'active' | 'completed';
  constructor(props?: AppState.Value, listeners?: Set<(val: this) => void>) {
    if (!props && !listeners && AppState.EMPTY) return AppState.EMPTY;
    super(AppState.TYPE_TAG, "AppState", listeners);
    this.#todos = props ? props.todos === undefined || props.todos === null ? props.todos : new ImmutableArray(Array.from(props.todos).map(v => v instanceof Todo ? v : new Todo(v))) : Object.freeze([]);
    this.#filter = props ? props.filter : undefined;
    if (this.$listeners.size > 0) {
      this.$enableChildListeners();
    }
    if (!props && !listeners) AppState.EMPTY = this;
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
    if (!(filterValue === "all" || filterValue === "active" || filterValue === "completed")) throw new Error("Invalid value for property \"filter\".");
    props.filter = filterValue;
    return props as AppState.Data;
  }
  protected $enableChildListeners(): void {
    this.#todos = this.#todos[ADD_UPDATE_LISTENER](newValue => {
      this.setTodos(newValue);
    });
  }
  get todos(): ImmutableArray<Todo> {
    return this.#todos;
  }
  get filter(): 'all' | 'active' | 'completed' {
    return this.#filter;
  }
  copyWithinTodos(target: number, start: number, end?: number): AppState {
    const todosArray = this.#todos;
    const todosNext = [...todosArray];
    todosNext.copyWithin(target, start, end);
    return this.$update(new AppState({
      todos: todosNext,
      filter: this.#filter
    }, this.$listeners));
  }
  fillTodos(value: Todo, start?: number, end?: number): AppState {
    const todosArray = this.#todos;
    const todosNext = [...todosArray];
    todosNext.fill(value, start, end);
    return this.$update(new AppState({
      todos: todosNext,
      filter: this.#filter
    }, this.$listeners));
  }
  popTodos(): AppState {
    if ((this.todos ?? []).length === 0) return this;
    const todosArray = this.#todos;
    const todosNext = [...todosArray];
    todosNext.pop();
    return this.$update(new AppState({
      todos: todosNext,
      filter: this.#filter
    }, this.$listeners));
  }
  pushTodos(...values): AppState {
    if (values.length === 0) return this;
    const todosArray = this.#todos;
    const todosNext = [...todosArray, ...values];
    return this.$update(new AppState({
      todos: todosNext,
      filter: this.#filter
    }, this.$listeners));
  }
  reverseTodos(): AppState {
    const todosArray = this.#todos;
    const todosNext = [...todosArray];
    todosNext.reverse();
    return this.$update(new AppState({
      todos: todosNext,
      filter: this.#filter
    }, this.$listeners));
  }
  setFilter(value: 'all' | 'active' | 'completed'): AppState {
    return this.$update(new AppState({
      todos: this.#todos,
      filter: value
    }, this.$listeners));
  }
  setTodos(value: Todo[] | Iterable<Todo>): AppState {
    return this.$update(new AppState({
      todos: value,
      filter: this.#filter
    }, this.$listeners));
  }
  shiftTodos(): AppState {
    if ((this.todos ?? []).length === 0) return this;
    const todosArray = this.#todos;
    const todosNext = [...todosArray];
    todosNext.shift();
    return this.$update(new AppState({
      todos: todosNext,
      filter: this.#filter
    }, this.$listeners));
  }
  sortTodos(compareFn?: (a: Todo, b: Todo) => number): AppState {
    const todosArray = this.#todos;
    const todosNext = [...todosArray];
    todosNext.sort(compareFn);
    return this.$update(new AppState({
      todos: todosNext,
      filter: this.#filter
    }, this.$listeners));
  }
  spliceTodos(start: number, deleteCount?: number, ...items): AppState {
    const todosArray = this.#todos;
    const todosNext = [...todosArray];
    todosNext.splice(start, ...(deleteCount !== undefined ? [deleteCount] : []), ...items);
    return this.$update(new AppState({
      todos: todosNext,
      filter: this.#filter
    }, this.$listeners));
  }
  unshiftTodos(...values): AppState {
    if (values.length === 0) return this;
    const todosArray = this.#todos;
    const todosNext = [...values, ...todosArray];
    return this.$update(new AppState({
      todos: todosNext,
      filter: this.#filter
    }, this.$listeners));
  }
}
export namespace AppState {
  export interface Data {
    todos: Todo[] | Iterable<Todo>;
    filter: 'all' | 'active' | 'completed';
  }
  export type Value = AppState | AppState.Data;
}
