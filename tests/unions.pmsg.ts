/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/unions.pmsg
import { Email } from './email.pmsg';

// @message
import type { MessagePropDescriptor } from "../runtime/index.js";
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, ImmutableDate } from "../runtime/index.js";
export class Unions extends Message<Unions.Data> {
  static TYPE_TAG = Symbol("Unions");
  static readonly $typeName = "Unions";
  static EMPTY: Unions;
  #username: string | null;
  #email: Email | null;
  #metadata: {
    created: Date;
  } | {
    updated: Date;
  };
  constructor(props?: Unions.Value) {
    if (!props && Unions.EMPTY) return Unions.EMPTY;
    super(Unions.TYPE_TAG, "Unions");
    this.#username = props ? props.username : "";
    this.#email = props ? props.email : new Email();
    this.#metadata = props ? props.metadata : undefined;
    if (!props) Unions.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<Unions.Data>[] {
    return [{
      name: "username",
      fieldNumber: null,
      getValue: () => this.#username
    }, {
      name: "email",
      fieldNumber: null,
      getValue: () => this.#email
    }, {
      name: "metadata",
      fieldNumber: null,
      getValue: () => this.#metadata
    }];
  }
  protected $fromEntries(entries: Record<string, unknown>): Unions.Data {
    const props = {} as Partial<Unions.Data>;
    const usernameValue = entries["username"];
    if (usernameValue === undefined) throw new Error("Missing required property \"username\".");
    if (!(typeof usernameValue === "string" || usernameValue === null)) throw new Error("Invalid value for property \"username\".");
    props.username = usernameValue;
    const emailValue = entries["email"];
    if (emailValue === undefined) throw new Error("Missing required property \"email\".");
    if (!(emailValue === null)) throw new Error("Invalid value for property \"email\".");
    props.email = emailValue;
    const metadataValue = entries["metadata"];
    if (metadataValue === undefined) throw new Error("Missing required property \"metadata\".");
    if (!(typeof metadataValue === "object" && metadataValue !== null && metadataValue.created !== undefined && (metadataValue.created instanceof Date || metadataValue.created instanceof ImmutableDate) || typeof metadataValue === "object" && metadataValue !== null && metadataValue.updated !== undefined && (metadataValue.updated instanceof Date || metadataValue.updated instanceof ImmutableDate))) throw new Error("Invalid value for property \"metadata\".");
    props.metadata = metadataValue;
    return props as Unions.Data;
  }
  get username(): string | null {
    return this.#username;
  }
  get email(): Email | null {
    return this.#email;
  }
  get metadata(): {
    created: Date;
  } | {
    updated: Date;
  } {
    return this.#metadata;
  }
  setEmail(value: Email | null) {
    return this.$update(new (this.constructor as typeof Unions)({
      username: this.#username,
      email: value,
      metadata: this.#metadata
    }));
  }
  setMetadata(value: {
    created: Date;
  } | {
    updated: Date;
  }) {
    return this.$update(new (this.constructor as typeof Unions)({
      username: this.#username,
      email: this.#email,
      metadata: value
    }));
  }
  setUsername(value: string | null) {
    return this.$update(new (this.constructor as typeof Unions)({
      username: value,
      email: this.#email,
      metadata: this.#metadata
    }));
  }
}
export namespace Unions {
  export type Data = {
    username: string | null;
    email: Email | null;
    metadata: {
      created: Date;
    } | {
      updated: Date;
    };
  };
  export type Value = Unions | Unions.Data;
}
