// Generated from tests/compound.propane
import { Indexed } from './indexed.propane';
import { User } from './user.propane';
import { Message, MessagePropDescriptor } from "@propanejs/runtime";
export namespace Compound {
  export type Data = {
    user: User.Value;
    indexed: Indexed.Value;
  };
  export type Value = Compound | Compound.Data;
}
export class Compound extends Message<Compound.Data> {
  #user: User;
  #indexed: Indexed;
  constructor(props: Compound.Value) {
    super();
    this.#user = props.user instanceof User ? props.user : new User(props.user);
    this.#indexed = props.indexed instanceof Indexed ? props.indexed : new Indexed(props.indexed);
  }
  get user(): User {
    return this.#user;
  }
  get indexed(): Indexed {
    return this.#indexed;
  }
  setUser(value: User.Value): Compound {
    return new Compound({
      user: value instanceof User ? value : new User(value),
      indexed: this.#indexed
    });
  }
  setIndexed(value: Indexed.Value): Compound {
    return new Compound({
      user: this.#user,
      indexed: value instanceof Indexed ? value : new Indexed(value)
    });
  }
  protected $getPropDescriptors(): MessagePropDescriptor<Compound.Data>[] {
    return [{
      name: "user",
      fieldNumber: 1,
      getValue: () => this.#user
    }, {
      name: "indexed",
      fieldNumber: 2,
      getValue: () => this.#indexed
    }];
  }
  protected $fromEntries(entries: Record<string, unknown>): Compound.Data {
    const props = {} as Partial<Compound.Data>;
    const userValue = entries["1"] === undefined ? entries["user"] : entries["1"];
    if (userValue === undefined) throw new Error("Missing required property \"user\".");
    const userMessageValue = userValue instanceof User ? userValue : new User(userValue);
    props.user = userMessageValue;
    const indexedValue = entries["2"] === undefined ? entries["indexed"] : entries["2"];
    if (indexedValue === undefined) throw new Error("Missing required property \"indexed\".");
    const indexedMessageValue = indexedValue instanceof Indexed ? indexedValue : new Indexed(indexedValue);
    props.indexed = indexedMessageValue;
    return props as Compound.Data;
  }
}