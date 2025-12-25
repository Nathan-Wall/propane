/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/message-union.pmsg
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, isTaggedMessageData, parseCerealString, ensure, SKIP, ValidationError } from "../runtime/index.js";
import type { MessagePropDescriptor, DataObject, SetUpdates } from "../runtime/index.js";
export class Cat extends Message<Cat.Data> {
  static TYPE_TAG = Symbol("Cat");
  static readonly $typeName = "Cat";
  static EMPTY: Cat;
  #name!: string;
  #meows!: boolean;
  constructor(props?: Cat.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && Cat.EMPTY) return Cat.EMPTY;
    super(Cat.TYPE_TAG, "Cat");
    this.#name = (props ? props.name : "") as string;
    this.#meows = (props ? props.meows : false) as boolean;
    if (!props) Cat.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<Cat.Data>[] {
    return [{
      name: "name",
      fieldNumber: 1,
      getValue: () => this.#name
    }, {
      name: "meows",
      fieldNumber: 2,
      getValue: () => this.#meows
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): Cat.Data {
    const props = {} as Partial<Cat.Data>;
    const nameValue = entries["1"] === undefined ? entries["name"] : entries["1"];
    if (nameValue === undefined) throw new Error("Missing required property \"name\".");
    if (!(typeof nameValue === "string")) throw new Error("Invalid value for property \"name\".");
    props.name = nameValue as string;
    const meowsValue = entries["2"] === undefined ? entries["meows"] : entries["2"];
    if (meowsValue === undefined) throw new Error("Missing required property \"meows\".");
    if (!(typeof meowsValue === "boolean")) throw new Error("Invalid value for property \"meows\".");
    props.meows = meowsValue as boolean;
    return props as Cat.Data;
  }
  static from(value: Cat.Value): Cat {
    return value instanceof Cat ? value : new Cat(value);
  }
  static deserialize<T extends typeof Cat>(this: T, data: string, options?: {
    skipValidation: boolean;
  }): InstanceType<T> {
    const payload = ensure.simpleObject(parseCerealString(data)) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
  }
  get name(): string {
    return this.#name;
  }
  get meows(): boolean {
    return this.#meows;
  }
  set(updates: Partial<SetUpdates<Cat.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof Cat)(data) as this);
  }
  setMeows(value: boolean) {
    return this.$update(new (this.constructor as typeof Cat)({
      name: this.#name,
      meows: value
    }) as this);
  }
  setName(value: string) {
    return this.$update(new (this.constructor as typeof Cat)({
      name: value,
      meows: this.#meows
    }) as this);
  }
}
export namespace Cat {
  export type Data = {
    name: string;
    meows: boolean;
  };
  export type Value = Cat | Cat.Data;
}
export class Dog extends Message<Dog.Data> {
  static TYPE_TAG = Symbol("Dog");
  static readonly $typeName = "Dog";
  static EMPTY: Dog;
  #name!: string;
  #barks!: boolean;
  constructor(props?: Dog.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && Dog.EMPTY) return Dog.EMPTY;
    super(Dog.TYPE_TAG, "Dog");
    this.#name = (props ? props.name : "") as string;
    this.#barks = (props ? props.barks : false) as boolean;
    if (!props) Dog.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<Dog.Data>[] {
    return [{
      name: "name",
      fieldNumber: 1,
      getValue: () => this.#name
    }, {
      name: "barks",
      fieldNumber: 2,
      getValue: () => this.#barks
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): Dog.Data {
    const props = {} as Partial<Dog.Data>;
    const nameValue = entries["1"] === undefined ? entries["name"] : entries["1"];
    if (nameValue === undefined) throw new Error("Missing required property \"name\".");
    if (!(typeof nameValue === "string")) throw new Error("Invalid value for property \"name\".");
    props.name = nameValue as string;
    const barksValue = entries["2"] === undefined ? entries["barks"] : entries["2"];
    if (barksValue === undefined) throw new Error("Missing required property \"barks\".");
    if (!(typeof barksValue === "boolean")) throw new Error("Invalid value for property \"barks\".");
    props.barks = barksValue as boolean;
    return props as Dog.Data;
  }
  static from(value: Dog.Value): Dog {
    return value instanceof Dog ? value : new Dog(value);
  }
  static deserialize<T extends typeof Dog>(this: T, data: string, options?: {
    skipValidation: boolean;
  }): InstanceType<T> {
    const payload = ensure.simpleObject(parseCerealString(data)) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
  }
  get name(): string {
    return this.#name;
  }
  get barks(): boolean {
    return this.#barks;
  }
  set(updates: Partial<SetUpdates<Dog.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof Dog)(data) as this);
  }
  setBarks(value: boolean) {
    return this.$update(new (this.constructor as typeof Dog)({
      name: this.#name,
      barks: value
    }) as this);
  }
  setName(value: string) {
    return this.$update(new (this.constructor as typeof Dog)({
      name: value,
      barks: this.#barks
    }) as this);
  }
}
export namespace Dog {
  export type Data = {
    name: string;
    barks: boolean;
  };
  export type Value = Dog | Dog.Data;
}
export class PetOwner extends Message<PetOwner.Data> {
  static TYPE_TAG = Symbol("PetOwner");
  static readonly $typeName = "PetOwner";
  static EMPTY: PetOwner;
  #ownerName!: string;
  #pet!: Cat | Dog;
  #optionalPet!: Cat | Dog | undefined;
  constructor(props?: PetOwner.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && PetOwner.EMPTY) return PetOwner.EMPTY;
    super(PetOwner.TYPE_TAG, "PetOwner");
    if (!options?.skipValidation) {
      this.#validate(props);
    }
    this.#ownerName = (props ? props.ownerName : "") as string;
    this.#pet = (props ? props.pet : new Cat()) as Cat | Dog;
    this.#optionalPet = (props ? props.optionalPet : undefined) as Cat | Dog;
    if (!props) PetOwner.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<PetOwner.Data>[] {
    return [{
      name: "ownerName",
      fieldNumber: 1,
      getValue: () => this.#ownerName
    }, {
      name: "pet",
      fieldNumber: 2,
      getValue: () => this.#pet as Cat | Dog,
      unionMessageTypes: ["Cat", "Dog"]
    }, {
      name: "optionalPet",
      fieldNumber: 3,
      getValue: () => this.#optionalPet as Cat | Dog,
      unionMessageTypes: ["Cat", "Dog"]
    }];
  }
  /** @internal - Do not use directly. Subject to change without notice. */
  $fromEntries(entries: Record<string, unknown>, options?: {
    skipValidation: boolean;
  }): PetOwner.Data {
    const props = {} as Partial<PetOwner.Data>;
    const ownerNameValue = entries["1"] === undefined ? entries["ownerName"] : entries["1"];
    if (ownerNameValue === undefined) throw new Error("Missing required property \"ownerName\".");
    if (!(typeof ownerNameValue === "string")) throw new Error("Invalid value for property \"ownerName\".");
    props.ownerName = ownerNameValue as string;
    const petValue = entries["2"] === undefined ? entries["pet"] : entries["2"];
    if (petValue === undefined) throw new Error("Missing required property \"pet\".");
    let petUnionValue: Cat | Dog = petValue as Cat | Dog;
    if (isTaggedMessageData(petValue)) {
      if (petValue.$tag === "Cat") {
        petUnionValue = new Cat(Cat.prototype.$fromEntries(petValue.$data, options), options);
      } else if (petValue.$tag === "Dog") {
        petUnionValue = new Dog(Dog.prototype.$fromEntries(petValue.$data, options), options);
      }
    }
    props.pet = petUnionValue;
    const optionalPetValue = entries["3"] === undefined ? entries["optionalPet"] : entries["3"];
    const optionalPetNormalized = optionalPetValue === null ? undefined : optionalPetValue;
    let optionalPetUnionValue: Cat | Dog | undefined = optionalPetNormalized as Cat | Dog | undefined;
    if (optionalPetNormalized !== undefined && isTaggedMessageData(optionalPetNormalized)) {
      if (optionalPetNormalized.$tag === "Cat") {
        optionalPetUnionValue = new Cat(Cat.prototype.$fromEntries(optionalPetNormalized.$data, options), options);
      } else if (optionalPetNormalized.$tag === "Dog") {
        optionalPetUnionValue = new Dog(Dog.prototype.$fromEntries(optionalPetNormalized.$data, options), options);
      }
    }
    props.optionalPet = optionalPetUnionValue;
    return props as PetOwner.Data;
  }
  static from(value: PetOwner.Value): PetOwner {
    return value instanceof PetOwner ? value : new PetOwner(value);
  }
  #validate(data: PetOwner.Value | undefined) {
    if (data === undefined) return;
  }
  static validateAll(data: PetOwner.Data): ValidationError[] {
    const errors = [] as ValidationError[];
    try {} catch (e) {
      if (e instanceof ValidationError) errors.push(e);else throw e;
    }
    try {} catch (e) {
      if (e instanceof ValidationError) errors.push(e);else throw e;
    }
    return errors;
  }
  static deserialize<T extends typeof PetOwner>(this: T, data: string, options?: {
    skipValidation: boolean;
  }): InstanceType<T> {
    const payload = ensure.simpleObject(parseCerealString(data)) as DataObject;
    const props = this.prototype.$fromEntries(payload, options);
    return new this(props, options) as InstanceType<T>;
  }
  get ownerName(): string {
    return this.#ownerName;
  }
  get pet(): Cat | Dog {
    return this.#pet;
  }
  get optionalPet(): Cat | Dog | undefined {
    return this.#optionalPet;
  }
  set(updates: Partial<SetUpdates<PetOwner.Data>>) {
    const data = this.toData();
    for (const [key, value] of Object.entries(updates)) {
      if (value !== SKIP) {
        (data as Record<string, unknown>)[key] = value;
      }
    }
    return this.$update(new (this.constructor as typeof PetOwner)(data) as this);
  }
  setOptionalPet(value: Cat | Dog | undefined) {
    return this.$update(new (this.constructor as typeof PetOwner)({
      ownerName: this.#ownerName,
      pet: this.#pet as Cat | Dog,
      optionalPet: value as Cat | Dog
    }) as this);
  }
  setOwnerName(value: string) {
    return this.$update(new (this.constructor as typeof PetOwner)({
      ownerName: value,
      pet: this.#pet as Cat | Dog,
      optionalPet: this.#optionalPet as Cat | Dog
    }) as this);
  }
  setPet(value: Cat | Dog) {
    return this.$update(new (this.constructor as typeof PetOwner)({
      ownerName: this.#ownerName,
      pet: value as Cat | Dog,
      optionalPet: this.#optionalPet as Cat | Dog
    }) as this);
  }
  unsetOptionalPet() {
    return this.$update(new (this.constructor as typeof PetOwner)({
      ownerName: this.#ownerName,
      pet: this.#pet as Cat | Dog
    }) as this);
  }
}
export namespace PetOwner {
  export type Data = {
    ownerName: string;
    pet: Cat | Dog;
    optionalPet?: Cat | Dog | undefined;
  };
  export type Value = PetOwner | PetOwner.Data;
}
