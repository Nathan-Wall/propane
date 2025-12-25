/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/unions.pmsg
import { Email } from './email.pmsg.js';
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, ImmutableDate, parseCerealString, ensure, SKIP, ValidationError } from "../runtime/index.js";
import type { MessagePropDescriptor, DataObject, SetUpdates } from "../runtime/index.js";
export class Unions extends Message<Unions.Data> {
  static TYPE_TAG = Symbol("Unions");
  static readonly $typeName = "Unions";
  static EMPTY: Unions;
  #username!: string | null;
  #email!: Email | null;
  #metadata!: {
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
    this.#username = (props ? props.username : "") as string | null;
    this.#email = (props ? props.email : undefined) as Email | null;
    this.#metadata = (props ? props.metadata : undefined) as {
      created: Date;
    } | {
      updated: Date;
    };
    if (!props) Unions.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<Unions.Data>[] {
    return [{
      name: "username",
      fieldNumber: null,
      getValue: () => this.#username as string | null
    }, {
      name: "email",
      fieldNumber: null,
      getValue: () => this.#email as Email | null
    }, {
      name: "metadata",
      fieldNumber: null,
      getValue: () => this.#metadata as {
        created: Date;
      } | {
        updated: Date;
      }
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): Unions.Data {
    const props = {} as Partial<Unions.Data>;
    const usernameValue = entries["username"];
    if (usernameValue === undefined) throw new Error("Missing required property \"username\".");
    if (!(typeof usernameValue === "string" || usernameValue === null)) throw new Error("Invalid value for property \"username\".");
    props.username = usernameValue as string | null;
    const emailValue = entries["email"];
    if (emailValue === undefined) throw new Error("Missing required property \"email\".");
    if (!(emailValue === null)) throw new Error("Invalid value for property \"email\".");
    props.email = emailValue as Email | null;
    const metadataValue = entries["metadata"];
    if (metadataValue === undefined) throw new Error("Missing required property \"metadata\".");
    if (!(typeof metadataValue === "object" && metadataValue !== null && (metadataValue as Record<string, unknown>)["created"] !== undefined && ((metadataValue as Record<string, unknown>)["created"] as object instanceof Date || (metadataValue as Record<string, unknown>)["created"] as object instanceof ImmutableDate) || typeof metadataValue === "object" && metadataValue !== null && (metadataValue as Record<string, unknown>)["updated"] !== undefined && ((metadataValue as Record<string, unknown>)["updated"] as object instanceof Date || (metadataValue as Record<string, unknown>)["updated"] as object instanceof ImmutableDate))) throw new Error("Invalid value for property \"metadata\".");
    props.metadata = metadataValue as {
      created: Date;
    } | {
      updated: Date;
    };
    return props as Unions.Data;
  }
  static from(value: Unions.Value): Unions {
    return value instanceof Unions ? value : new Unions(value);
  }
  #validate(data: Unions.Value | undefined) {
    if (data === undefined) return;
  }
  static validateAll(data: Unions.Data): ValidationError[] {
    const errors = [] as ValidationError[];
    try {} catch (e) {
      if (e instanceof ValidationError) errors.push(e);else throw e;
    }
    return errors;
  }
  static deserialize<T extends typeof Unions>(this: T, data: string, options?: {
    skipValidation: boolean;
  }): InstanceType<T> {
    const payload = ensure.simpleObject(parseCerealString(data)) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
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
    return this.$update(new (this.constructor as typeof Unions)(data) as this);
  }
  setEmail(value: Email | null) {
    return this.$update(new (this.constructor as typeof Unions)({
      username: this.#username as string | null,
      email: value as Email | null,
      metadata: this.#metadata as {
        created: Date;
      } | {
        updated: Date;
      }
    }) as this);
  }
  setMetadata(value: {
    created: Date;
  } | {
    updated: Date;
  }) {
    return this.$update(new (this.constructor as typeof Unions)({
      username: this.#username as string | null,
      email: this.#email as Email | null,
      metadata: value as {
        created: Date;
      } | {
        updated: Date;
      }
    }) as this);
  }
  setUsername(value: string | null) {
    return this.$update(new (this.constructor as typeof Unions)({
      username: value as string | null,
      email: this.#email as Email | null,
      metadata: this.#metadata as {
        created: Date;
      } | {
        updated: Date;
      }
    }) as this);
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
