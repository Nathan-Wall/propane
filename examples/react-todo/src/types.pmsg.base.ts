/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from src/types.pmsg
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, isTaggedMessageData, parseCerealString, ensure, SKIP, ValidationError, ImmutableArray } from '@propane/runtime';
import type { MessagePropDescriptor, DataObject, ImmutableSet, ImmutableMap, SetUpdates } from "@propane/runtime";
const TYPE_TAG_Todo = Symbol("Todo");
export class Todo extends Message<Todo.Data> {
  static $typeId = "src/types.pmsg#Todo";
  static $typeHash = "sha256:4f04bd4da9f8a6867d93456ca1488a4dbb10df4ee940f3143c405b0c355f7218";
  static $instanceTag = Symbol.for("propane:message:" + Todo.$typeId);
  static readonly $typeName = "Todo";
  static EMPTY: Todo;
  #id!: string;
  #text!: string;
  #completed!: boolean;
  constructor(props?: Todo.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && Todo.EMPTY) return Todo.EMPTY;
    super(TYPE_TAG_Todo, "Todo");
    this.#id = (props ? props.id : "") as string;
    this.#text = (props ? props.text : "") as string;
    this.#completed = (props ? props.completed : false) as boolean;
    if (!props) Todo.EMPTY = this;
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
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): Todo.Data {
    const props = {} as Partial<Todo.Data>;
    const idValue = entries["id"];
    if (idValue === undefined) throw new Error("Missing required property \"id\".");
    if (!(typeof idValue === "string")) throw new Error("Invalid value for property \"id\".");
    props.id = idValue as string;
    const textValue = entries["text"];
    if (textValue === undefined) throw new Error("Missing required property \"text\".");
    if (!(typeof textValue === "string")) throw new Error("Invalid value for property \"text\".");
    props.text = textValue as string;
    const completedValue = entries["completed"];
    if (completedValue === undefined) throw new Error("Missing required property \"completed\".");
    if (!(typeof completedValue === "boolean")) throw new Error("Invalid value for property \"completed\".");
    props.completed = completedValue as boolean;
    return props as Todo.Data;
  }
  static from(value: Todo.Value): Todo {
    return Todo.isInstance(value) ? value : new Todo(value);
  }
  static deserialize<T extends typeof Todo>(this: T, data: string, options?: {
    skipValidation: boolean;
  }): InstanceType<T> {
    const parsed = parseCerealString(data);
    if (typeof parsed === "string") {
      if (this.$compact === true) {
        return this.fromCompact(this.$compactTag && parsed.startsWith(this.$compactTag) ? parsed.slice(this.$compactTag.length) : parsed, options) as InstanceType<T>;
      } else {
        throw new Error("Invalid compact message payload.");
      }
    }
    if (isTaggedMessageData(parsed)) {
      if (parsed.$tag === this.$typeName) {
        if (typeof parsed.$data === "string") {
          if (this.$compact === true) {
            return this.fromCompact(this.$compactTag && parsed.$data.startsWith(this.$compactTag) ? parsed.$data.slice(this.$compactTag.length) : parsed.$data, options) as InstanceType<T>;
          } else {
            throw new Error("Invalid compact tagged value for Todo.");
          }
        } else {
          return new this(this.prototype.$fromEntries(parsed.$data, options), options) as InstanceType<T>;
        }
      } else {
        throw new Error("Tagged message type mismatch: expected Todo.");
      }
    }
    const payload = ensure.simpleObject(parsed) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
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
  set(updates: Partial<SetUpdates<Todo.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof Todo)(data) as this);
  }
  setCompleted(value: boolean) {
    return this.$update(new (this.constructor as typeof Todo)({
      id: this.#id,
      text: this.#text,
      completed: value
    }) as this);
  }
  setId(value: string) {
    return this.$update(new (this.constructor as typeof Todo)({
      id: value,
      text: this.#text,
      completed: this.#completed
    }) as this);
  }
  setText(value: string) {
    return this.$update(new (this.constructor as typeof Todo)({
      id: this.#id,
      text: value,
      completed: this.#completed
    }) as this);
  }
}
export namespace Todo {
  export type Data = {
    id: string;
    text: string;
    completed: boolean;
  };
  export type Value = Todo | Todo.Data;
}
const TYPE_TAG_AppState = Symbol("AppState");
export class AppState extends Message<AppState.Data> {
  static $typeId = "src/types.pmsg#AppState";
  static $typeHash = "sha256:9dca8c13a7a49a455aa16196feb5a7284b0d7c57f385612c962ff11a181288d2";
  static $instanceTag = Symbol.for("propane:message:" + AppState.$typeId);
  static readonly $typeName = "AppState";
  static EMPTY: AppState;
  #todos!: ImmutableArray<Todo>;
  #filter!: 'all' | 'active' | 'completed';
  constructor(props?: AppState.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && AppState.EMPTY) return AppState.EMPTY;
    super(TYPE_TAG_AppState, "AppState");
    if (!options?.skipValidation) {
      this.#validate(props);
    }
    this.#todos = props ? (props.todos === undefined || props.todos === null ? new ImmutableArray() : new ImmutableArray(Array.from(props.todos as Iterable<unknown>).map(v => Todo.isInstance(v) ? v : new Todo(v as Todo.Value)))) as ImmutableArray<Todo> : new ImmutableArray();
    this.#filter = (props ? props.filter : "all") as 'all' | 'active' | 'completed';
    if (!props) AppState.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<AppState.Data>[] {
    return [{
      name: "todos",
      fieldNumber: null,
      getValue: () => this.#todos as Todo[] | Iterable<Todo>
    }, {
      name: "filter",
      fieldNumber: null,
      getValue: () => this.#filter as 'all' | 'active' | 'completed',
      unionHasString: true
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): AppState.Data {
    const props = {} as Partial<AppState.Data>;
    const todosValue = entries["todos"];
    if (todosValue === undefined) throw new Error("Missing required property \"todos\".");
    const todosArrayValue = todosValue === undefined || todosValue === null ? new ImmutableArray() : ImmutableArray.isInstance(todosValue) ? todosValue : new ImmutableArray(todosValue as Iterable<unknown>);
    const todosArrayValueConverted = todosArrayValue === undefined || todosArrayValue === null ? todosArrayValue : (todosArrayValue as ImmutableArray<unknown> | unknown[]).map(element => typeof element === "string" && Todo.$compact === true ? Todo.fromCompact(Todo.$compactTag && element.startsWith(Todo.$compactTag) ? element.slice(Todo.$compactTag.length) : element, options) as any : element);
    if (!(ImmutableArray.isInstance(todosArrayValueConverted) || Array.isArray(todosArrayValueConverted))) throw new Error("Invalid value for property \"todos\".");
    props.todos = todosArrayValueConverted as Todo[] | Iterable<Todo>;
    const filterValue = entries["filter"];
    if (filterValue === undefined) throw new Error("Missing required property \"filter\".");
    if (!(filterValue === "all" || filterValue === "active" || filterValue === "completed")) throw new Error("Invalid value for property \"filter\".");
    props.filter = filterValue as 'all' | 'active' | 'completed';
    return props as AppState.Data;
  }
  static from(value: AppState.Value): AppState {
    return AppState.isInstance(value) ? value : new AppState(value);
  }
  #validate(data: AppState.Value | undefined) {
    if (data === undefined) return;
  }
  static validateAll(data: AppState.Data): ValidationError[] {
    const errors = [] as ValidationError[];
    try {} catch (e) {
      if (e instanceof ValidationError) errors.push(e);else throw e;
    }
    return errors;
  }
  override [WITH_CHILD](key: string | number, child: unknown): this {
    switch (key) {
      case "todos":
        return new (this.constructor as typeof AppState)({
          todos: child as Todo[] | Iterable<Todo>,
          filter: this.#filter as 'all' | 'active' | 'completed'
        }) as this;
      default:
        throw new Error(`Unknown key: ${key}`);
    }
  }
  override *[GET_MESSAGE_CHILDREN]() {
    yield ["todos", this.#todos] as unknown as [string, Message<DataObject> | ImmutableArray<unknown> | ImmutableMap<unknown, unknown> | ImmutableSet<unknown>];
  }
  static deserialize<T extends typeof AppState>(this: T, data: string, options?: {
    skipValidation: boolean;
  }): InstanceType<T> {
    const parsed = parseCerealString(data);
    if (typeof parsed === "string") {
      if (this.$compact === true) {
        return this.fromCompact(this.$compactTag && parsed.startsWith(this.$compactTag) ? parsed.slice(this.$compactTag.length) : parsed, options) as InstanceType<T>;
      } else {
        throw new Error("Invalid compact message payload.");
      }
    }
    if (isTaggedMessageData(parsed)) {
      if (parsed.$tag === this.$typeName) {
        if (typeof parsed.$data === "string") {
          if (this.$compact === true) {
            return this.fromCompact(this.$compactTag && parsed.$data.startsWith(this.$compactTag) ? parsed.$data.slice(this.$compactTag.length) : parsed.$data, options) as InstanceType<T>;
          } else {
            throw new Error("Invalid compact tagged value for AppState.");
          }
        } else {
          return new this(this.prototype.$fromEntries(parsed.$data, options), options) as InstanceType<T>;
        }
      } else {
        throw new Error("Tagged message type mismatch: expected AppState.");
      }
    }
    const payload = ensure.simpleObject(parsed) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
  }
  get todos(): ImmutableArray<Todo> {
    return this.#todos;
  }
  get filter(): 'all' | 'active' | 'completed' {
    return this.#filter;
  }
  copyWithinTodos(target: number, start: number, end?: number) {
    const todosArray = this.#todos;
    const todosNext = [...todosArray];
    todosNext.copyWithin(target, start, end);
    return this.$update(new (this.constructor as typeof AppState)({
      todos: todosNext as Todo[] | Iterable<Todo>,
      filter: this.#filter as 'all' | 'active' | 'completed'
    }) as this);
  }
  fillTodo(value: Todo, start?: number, end?: number) {
    const todosArray = this.#todos;
    const todosNext = [...todosArray];
    (todosNext as unknown as Todo[]).fill(value, start, end);
    return this.$update(new (this.constructor as typeof AppState)({
      todos: todosNext as Todo[] | Iterable<Todo>,
      filter: this.#filter as 'all' | 'active' | 'completed'
    }) as this);
  }
  popTodo() {
    if ((this.todos ?? []).length === 0) return this;
    const todosArray = this.#todos;
    const todosNext = [...todosArray];
    todosNext.pop();
    return this.$update(new (this.constructor as typeof AppState)({
      todos: todosNext as Todo[] | Iterable<Todo>,
      filter: this.#filter as 'all' | 'active' | 'completed'
    }) as this);
  }
  pushTodo(...values: Todo[]) {
    if (values.length === 0) return this;
    const todosArray = this.#todos;
    const todosNext = [...todosArray, ...values];
    return this.$update(new (this.constructor as typeof AppState)({
      todos: todosNext as Todo[] | Iterable<Todo>,
      filter: this.#filter as 'all' | 'active' | 'completed'
    }) as this);
  }
  reverseTodos() {
    const todosArray = this.#todos;
    const todosNext = [...todosArray];
    todosNext.reverse();
    return this.$update(new (this.constructor as typeof AppState)({
      todos: todosNext as Todo[] | Iterable<Todo>,
      filter: this.#filter as 'all' | 'active' | 'completed'
    }) as this);
  }
  set(updates: Partial<SetUpdates<AppState.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof AppState)(data) as this);
  }
  setFilter(value: 'all' | 'active' | 'completed') {
    return this.$update(new (this.constructor as typeof AppState)({
      todos: this.#todos as Todo[] | Iterable<Todo>,
      filter: value as 'all' | 'active' | 'completed'
    }) as this);
  }
  setTodos(value: Todo[] | Iterable<Todo>) {
    return this.$update(new (this.constructor as typeof AppState)({
      todos: value as Todo[] | Iterable<Todo>,
      filter: this.#filter as 'all' | 'active' | 'completed'
    }) as this);
  }
  shiftTodo() {
    if ((this.todos ?? []).length === 0) return this;
    const todosArray = this.#todos;
    const todosNext = [...todosArray];
    todosNext.shift();
    return this.$update(new (this.constructor as typeof AppState)({
      todos: todosNext as Todo[] | Iterable<Todo>,
      filter: this.#filter as 'all' | 'active' | 'completed'
    }) as this);
  }
  sortTodos(compareFn?: (a: Todo, b: Todo) => number) {
    const todosArray = this.#todos;
    const todosNext = [...todosArray];
    (todosNext as unknown as Todo[]).sort(compareFn);
    return this.$update(new (this.constructor as typeof AppState)({
      todos: todosNext as Todo[] | Iterable<Todo>,
      filter: this.#filter as 'all' | 'active' | 'completed'
    }) as this);
  }
  spliceTodo(start: number, deleteCount?: number, ...items: Todo[]) {
    const todosArray = this.#todos;
    const todosNext = [...todosArray];
    todosNext.splice(start, ...(deleteCount !== undefined ? [deleteCount] : []), ...items);
    return this.$update(new (this.constructor as typeof AppState)({
      todos: todosNext as Todo[] | Iterable<Todo>,
      filter: this.#filter as 'all' | 'active' | 'completed'
    }) as this);
  }
  unshiftTodo(...values: Todo[]) {
    if (values.length === 0) return this;
    const todosArray = this.#todos;
    const todosNext = [...values, ...todosArray];
    return this.$update(new (this.constructor as typeof AppState)({
      todos: todosNext as Todo[] | Iterable<Todo>,
      filter: this.#filter as 'all' | 'active' | 'completed'
    }) as this);
  }
}
export namespace AppState {
  export type Data = {
    todos: Todo[] | Iterable<Todo>;
    filter: 'all' | 'active' | 'completed';
  };
  export type Value = AppState | AppState.Data;
}
