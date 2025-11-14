// transpiled
import { Distance } from './distance.propane';
import { Email } from './email.propane';
import { Hash } from './hash.propane';
export namespace User {
  export type Type = {
    id: number;
    name: string;
    email: Email;
    passwordHash: Hash;
    created: Date;
    updated: Date;
    active: boolean;
    eyeColor: 'blue' | 'green' | 'brown' | 'hazel';
    height: Distance;
  };
}
export class User {
  #id: number;
  #name: string;
  #email: Email;
  #passwordHash: Hash;
  #created: Date;
  #updated: Date;
  #active: boolean;
  #eyeColor: 'blue' | 'green' | 'brown' | 'hazel';
  #height: Distance;
  constructor(props: User.Type) {
    this.#id = props.id;
    this.#name = props.name;
    this.#email = props.email;
    this.#passwordHash = props.passwordHash;
    this.#created = props.created;
    this.#updated = props.updated;
    this.#active = props.active;
    this.#eyeColor = props.eyeColor;
    this.#height = props.height;
  }
  get id(): number {
    return this.#id;
  }
  get name(): string {
    return this.#name;
  }
  get email(): Email {
    return this.#email;
  }
  get passwordHash(): Hash {
    return this.#passwordHash;
  }
  get created(): Date {
    return this.#created;
  }
  get updated(): Date {
    return this.#updated;
  }
  get active(): boolean {
    return this.#active;
  }
  get eyeColor(): 'blue' | 'green' | 'brown' | 'hazel' {
    return this.#eyeColor;
  }
  get height(): Distance {
    return this.#height;
  }
}