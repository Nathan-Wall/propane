/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/unions.pmsg
import { Email } from './email.pmsg.js';
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, ImmutableDate, SKIP, ValidationError } from "../runtime/index.js";
import type { MessagePropDescriptor, SetUpdates } from "../runtime/index.js";
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
  constructor(props?: Unions.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && Unions.EMPTY) return Unions.EMPTY;
    super(Unions.TYPE_TAG, "Unions");
    if (!options?.skipValidation) {
      this.#validate(props);
    }
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
  #validate(data) {}
  static validateAll(data: Unions.Data): ValidationError[] {
    const errors = [] as ValidationError[];
    try {} catch (e) {
      if (e instanceof ValidationError) errors.push(e);else throw e;
    }
    return errors;
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
  set(updates: Partial<SetUpdates<Unions.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof Unions)(data));
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
