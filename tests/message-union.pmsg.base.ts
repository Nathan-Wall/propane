/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/message-union.pmsg
import { Message, WITH_CHILD, GET_MESSAGE_CHILDREN, isTaggedMessageData, parseCerealString, ensure, SKIP, ValidationError } from "../runtime/index.js";
import type { MessagePropDescriptor, DataObject, SetUpdates } from "../runtime/index.js";
const TYPE_TAG_Cat = Symbol("Cat");
export class Cat extends Message<Cat.Data> {
  static $typeId = "tests/message-union.pmsg#Cat";
  static $typeHash = "sha256:8f95e026c070ff2d951bfcc2385a188c119931c101041a7bc2f7cedabcfb015a";
  static $instanceTag = Symbol.for("propane:message:" + Cat.$typeId);
  static readonly $typeName = "Cat";
  static EMPTY: Cat;
  #name!: string;
  #meows!: boolean;
  constructor(props?: Cat.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && Cat.EMPTY) return Cat.EMPTY;
    super(TYPE_TAG_Cat, "Cat");
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
            throw new Error("Invalid compact tagged value for Cat.");
          }
        } else {
          return new this(this.prototype.$fromEntries(parsed.$data, options), options) as InstanceType<T>;
        }
      } else {
        throw new Error("Tagged message type mismatch: expected Cat.");
      }
    }
    const payload = ensure.simpleObject(parsed) as DataObject;
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
const TYPE_TAG_Dog = Symbol("Dog");
export class Dog extends Message<Dog.Data> {
  static $typeId = "tests/message-union.pmsg#Dog";
  static $typeHash = "sha256:76519add00a61acf5a5ba3c3afc915405ba53c5fda0f78d9769a4fc7999f07c9";
  static $instanceTag = Symbol.for("propane:message:" + Dog.$typeId);
  static readonly $typeName = "Dog";
  static EMPTY: Dog;
  #name!: string;
  #barks!: boolean;
  constructor(props?: Dog.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && Dog.EMPTY) return Dog.EMPTY;
    super(TYPE_TAG_Dog, "Dog");
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
            throw new Error("Invalid compact tagged value for Dog.");
          }
        } else {
          return new this(this.prototype.$fromEntries(parsed.$data, options), options) as InstanceType<T>;
        }
      } else {
        throw new Error("Tagged message type mismatch: expected Dog.");
      }
    }
    const payload = ensure.simpleObject(parsed) as DataObject;
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
const TYPE_TAG_PetOwner = Symbol("PetOwner");
export class PetOwner extends Message<PetOwner.Data> {
  static $typeId = "tests/message-union.pmsg#PetOwner";
  static $typeHash = "sha256:3af9f833c3572190c069ff26fe59cc128f6ddbe537971b42809962932ea72514";
  static $instanceTag = Symbol.for("propane:message:" + PetOwner.$typeId);
  static readonly $typeName = "PetOwner";
  static EMPTY: PetOwner;
  #ownerName!: string;
  #pet!: Cat | Dog;
  #optionalPet!: Cat | Dog | undefined;
  constructor(props?: PetOwner.Value, options?: {
    skipValidation?: boolean;
  }) {
    if (!props && PetOwner.EMPTY) return PetOwner.EMPTY;
    super(TYPE_TAG_PetOwner, "PetOwner");
    if (!options?.skipValidation) {
      this.#validate(props);
    }
    this.#ownerName = (props ? props.ownerName : "") as string;
    this.#pet = (props ? (value => {
      if (!options?.skipValidation && true && !(Cat.isInstance(value) || Dog.isInstance(value))) throw new Error("Invalid value for property \"pet\".");
      return value;
    })((value => {
      let result = value as any;
      return result;
    })(props.pet)) : new Cat()) as Cat | Dog;
    this.#optionalPet = (props ? (value => {
      if (!options?.skipValidation && value !== undefined && !(Cat.isInstance(value) || Dog.isInstance(value))) throw new Error("Invalid value for property \"optionalPet\".");
      return value;
    })((value => {
      let result = value as any;
      return result;
    })(props.optionalPet)) : undefined) as Cat | Dog;
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
    let petUnionValue: any = petValue as any;
    if (isTaggedMessageData(petValue)) {
      if (petValue.$tag === "Cat") {
        if (typeof petValue.$data === "string") {
          if (Cat.$compact === true) {
            petUnionValue = Cat.fromCompact(Cat.$compactTag && petValue.$data.startsWith(Cat.$compactTag) ? petValue.$data.slice(Cat.$compactTag.length) : petValue.$data, options);
          } else {
            throw new Error("Invalid compact tagged value for property \"pet\" (Cat).");
          }
        } else {
          petUnionValue = new Cat(Cat.prototype.$fromEntries(petValue.$data, options), options);
        }
      } else if (petValue.$tag === "Dog") {
        if (typeof petValue.$data === "string") {
          if (Dog.$compact === true) {
            petUnionValue = Dog.fromCompact(Dog.$compactTag && petValue.$data.startsWith(Dog.$compactTag) ? petValue.$data.slice(Dog.$compactTag.length) : petValue.$data, options);
          } else {
            throw new Error("Invalid compact tagged value for property \"pet\" (Dog).");
          }
        } else {
          petUnionValue = new Dog(Dog.prototype.$fromEntries(petValue.$data, options), options);
        }
      }
    }
    if (typeof petValue === "string") {
      if (Cat.$compactTag && petValue.startsWith(Cat.$compactTag)) {
        if (Cat.$compact === true) {
          petUnionValue = Cat.fromCompact(Cat.$compactTag && petValue.startsWith(Cat.$compactTag) ? petValue.slice(Cat.$compactTag.length) : petValue, options);
        } else {
          throw new Error("Invalid compact tagged value for property \"pet\" (Cat).");
        }
      } else if (Dog.$compactTag && petValue.startsWith(Dog.$compactTag)) {
        if (Dog.$compact === true) {
          petUnionValue = Dog.fromCompact(Dog.$compactTag && petValue.startsWith(Dog.$compactTag) ? petValue.slice(Dog.$compactTag.length) : petValue, options);
        } else {
          throw new Error("Invalid compact tagged value for property \"pet\" (Dog).");
        }
      }
    }
    if (!(Cat.isInstance(petUnionValue) || Dog.isInstance(petUnionValue))) throw new Error("Invalid value for property \"pet\".");
    props.pet = petUnionValue;
    const optionalPetValue = entries["3"] === undefined ? entries["optionalPet"] : entries["3"];
    const optionalPetNormalized = optionalPetValue === null ? undefined : optionalPetValue;
    let optionalPetUnionValue: any = optionalPetNormalized as any;
    if (optionalPetNormalized !== undefined && isTaggedMessageData(optionalPetNormalized)) {
      if (optionalPetNormalized.$tag === "Cat") {
        if (typeof optionalPetNormalized.$data === "string") {
          if (Cat.$compact === true) {
            optionalPetUnionValue = Cat.fromCompact(Cat.$compactTag && optionalPetNormalized.$data.startsWith(Cat.$compactTag) ? optionalPetNormalized.$data.slice(Cat.$compactTag.length) : optionalPetNormalized.$data, options);
          } else {
            throw new Error("Invalid compact tagged value for property \"optionalPet\" (Cat).");
          }
        } else {
          optionalPetUnionValue = new Cat(Cat.prototype.$fromEntries(optionalPetNormalized.$data, options), options);
        }
      } else if (optionalPetNormalized.$tag === "Dog") {
        if (typeof optionalPetNormalized.$data === "string") {
          if (Dog.$compact === true) {
            optionalPetUnionValue = Dog.fromCompact(Dog.$compactTag && optionalPetNormalized.$data.startsWith(Dog.$compactTag) ? optionalPetNormalized.$data.slice(Dog.$compactTag.length) : optionalPetNormalized.$data, options);
          } else {
            throw new Error("Invalid compact tagged value for property \"optionalPet\" (Dog).");
          }
        } else {
          optionalPetUnionValue = new Dog(Dog.prototype.$fromEntries(optionalPetNormalized.$data, options), options);
        }
      }
    }
    if (typeof optionalPetNormalized === "string") {
      if (Cat.$compactTag && optionalPetNormalized.startsWith(Cat.$compactTag)) {
        if (Cat.$compact === true) {
          optionalPetUnionValue = Cat.fromCompact(Cat.$compactTag && optionalPetNormalized.startsWith(Cat.$compactTag) ? optionalPetNormalized.slice(Cat.$compactTag.length) : optionalPetNormalized, options);
        } else {
          throw new Error("Invalid compact tagged value for property \"optionalPet\" (Cat).");
        }
      } else if (Dog.$compactTag && optionalPetNormalized.startsWith(Dog.$compactTag)) {
        if (Dog.$compact === true) {
          optionalPetUnionValue = Dog.fromCompact(Dog.$compactTag && optionalPetNormalized.startsWith(Dog.$compactTag) ? optionalPetNormalized.slice(Dog.$compactTag.length) : optionalPetNormalized, options);
        } else {
          throw new Error("Invalid compact tagged value for property \"optionalPet\" (Dog).");
        }
      }
    }
    if (optionalPetUnionValue !== undefined && !(Cat.isInstance(optionalPetUnionValue) || Dog.isInstance(optionalPetUnionValue))) throw new Error("Invalid value for property \"optionalPet\".");
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
            throw new Error("Invalid compact tagged value for PetOwner.");
          }
        } else {
          return new this(this.prototype.$fromEntries(parsed.$data, options), options) as InstanceType<T>;
        }
      } else {
        throw new Error("Tagged message type mismatch: expected PetOwner.");
      }
    }
    const payload = ensure.simpleObject(parsed) as DataObject;
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
