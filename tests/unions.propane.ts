/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/unions.propane
import { Email } from './email.propane';
import { Message, MessagePropDescriptor, ImmutableDate } from "@propanejs/runtime";
export class Unions extends Message<Unions.Data> {
  static TYPE_TAG = Symbol("Unions");
  static EMPTY: Unions;
  #username: string | null;
  #email: Email | null;
  #metadata: {
    created: Date;
  } | {
    updated: Date;
  };
  constructor(props?: Unions.Value, listeners?: Set<(val: this) => void>) {
    if (!props && !listeners && Unions.EMPTY) return Unions.EMPTY;
    super(Unions.TYPE_TAG, "Unions", listeners);
    this.#username = props ? props.username : "";
    this.#email = props ? props.email : new Email();
    this.#metadata = props ? props.metadata : undefined;
    if (this.$listeners.size > 0) {
      this.$enableChildListeners();
    }
    if (!props && !listeners) Unions.EMPTY = this;
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
    if (!(typeof metadataValue === "object" && metadataValue !== null && metadataValue.created !== undefined && (metadataValue.created instanceof Date || metadataValue.created instanceof ImmutableDate || Object.prototype.toString.call(metadataValue.created) === "[object Date]" || Object.prototype.toString.call(metadataValue.created) === "[object ImmutableDate]") || typeof metadataValue === "object" && metadataValue !== null && metadataValue.updated !== undefined && (metadataValue.updated instanceof Date || metadataValue.updated instanceof ImmutableDate || Object.prototype.toString.call(metadataValue.updated) === "[object Date]" || Object.prototype.toString.call(metadataValue.updated) === "[object ImmutableDate]"))) throw new Error("Invalid value for property \"metadata\".");
    props.metadata = metadataValue;
    return props as Unions.Data;
  }
  protected $enableChildListeners(): void {}
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
  setEmail(value: Email | null): Unions {
    return this.$update(new Unions({
      username: this.#username,
      email: value,
      metadata: this.#metadata
    }, this.$listeners));
  }
  setMetadata(value: {
    created: Date;
  } | {
    updated: Date;
  }): Unions {
    return this.$update(new Unions({
      username: this.#username,
      email: this.#email,
      metadata: value
    }, this.$listeners));
  }
  setUsername(value: string | null): Unions {
    return this.$update(new Unions({
      username: value,
      email: this.#email,
      metadata: this.#metadata
    }, this.$listeners));
  }
}
export namespace Unions {
  export interface Data {
    username: string | null;
    email: Email | null;
    metadata: {
      created: Date;
    } | {
      updated: Date;
    };
  }
  export type Value = Unions | Unions.Data;
}