// Generated from tests/unions.propane
import { Email } from './email.propane';
import { Message, MessagePropDescriptor } from "@propanejs/runtime";
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
export class Unions extends Message<Unions.Data> {
  static #typeTag = Symbol("Unions");
  #username: string | null;
  #email: Email | null;
  #metadata: {
    created: Date;
  } | {
    updated: Date;
  };
  constructor(props: Unions.Value) {
    super(Unions.#typeTag);
    this.#username = props.username;
    this.#email = props.email;
    this.#metadata = props.metadata;
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
  setUsername(value: string | null): Unions {
    return new Unions({
      username: value,
      email: this.#email,
      metadata: this.#metadata
    });
  }
  setEmail(value: Email | null): Unions {
    return new Unions({
      username: this.#username,
      email: value,
      metadata: this.#metadata
    });
  }
  setMetadata(value: {
    created: Date;
  } | {
    updated: Date;
  }): Unions {
    return new Unions({
      username: this.#username,
      email: this.#email,
      metadata: value
    });
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
    if (!(typeof metadataValue === "object" && metadataValue !== null && metadataValue.created !== undefined && (metadataValue.created instanceof Date || Object.prototype.toString.call(metadataValue.created) === "[object Date]") || typeof metadataValue === "object" && metadataValue !== null && metadataValue.updated !== undefined && (metadataValue.updated instanceof Date || Object.prototype.toString.call(metadataValue.updated) === "[object Date]"))) throw new Error("Invalid value for property \"metadata\".");
    props.metadata = metadataValue;
    return props as Unions.Data;
  }
}