/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/message-union.propane
import { Message, MessagePropDescriptor, isTaggedMessageData } from "@propanejs/runtime";
export class Cat extends Message<Cat.Data> {
  static TYPE_TAG = Symbol("Cat");
  static EMPTY: Cat;
  #name: string;
  #meows: boolean;
  constructor(props?: Cat.Value, listeners?: Set<(val: this) => void>) {
    if (!props && !listeners && Cat.EMPTY) return Cat.EMPTY;
    super(Cat.TYPE_TAG, "Cat", listeners);
    this.#name = props ? props.name : "";
    this.#meows = props ? props.meows : false;
    if (this.$listeners.size > 0) {
      this.$enableChildListeners();
    }
    if (!props && !listeners) Cat.EMPTY = this;
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
  protected $fromEntries(entries: Record<string, unknown>): Cat.Data {
    const props = {} as Partial<Cat.Data>;
    const nameValue = entries["1"] === undefined ? entries["name"] : entries["1"];
    if (nameValue === undefined) throw new Error("Missing required property \"name\".");
    if (!(typeof nameValue === "string")) throw new Error("Invalid value for property \"name\".");
    props.name = nameValue;
    const meowsValue = entries["2"] === undefined ? entries["meows"] : entries["2"];
    if (meowsValue === undefined) throw new Error("Missing required property \"meows\".");
    if (!(typeof meowsValue === "boolean")) throw new Error("Invalid value for property \"meows\".");
    props.meows = meowsValue;
    return props as Cat.Data;
  }
  protected $enableChildListeners(): void {}
  get name(): string {
    return this.#name;
  }
  get meows(): boolean {
    return this.#meows;
  }
  setMeows(value: boolean): Cat {
    return this.$update(new Cat({
      name: this.#name,
      meows: value
    }, this.$listeners));
  }
  setName(value: string): Cat {
    return this.$update(new Cat({
      name: value,
      meows: this.#meows
    }, this.$listeners));
  }
}
export namespace Cat {
  export interface Data {
    name: string;
    meows: boolean;
  }
  export type Value = Cat | Cat.Data;
}
export class Dog extends Message<Dog.Data> {
  static TYPE_TAG = Symbol("Dog");
  static EMPTY: Dog;
  #name: string;
  #barks: boolean;
  constructor(props?: Dog.Value, listeners?: Set<(val: this) => void>) {
    if (!props && !listeners && Dog.EMPTY) return Dog.EMPTY;
    super(Dog.TYPE_TAG, "Dog", listeners);
    this.#name = props ? props.name : "";
    this.#barks = props ? props.barks : false;
    if (this.$listeners.size > 0) {
      this.$enableChildListeners();
    }
    if (!props && !listeners) Dog.EMPTY = this;
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
  protected $fromEntries(entries: Record<string, unknown>): Dog.Data {
    const props = {} as Partial<Dog.Data>;
    const nameValue = entries["1"] === undefined ? entries["name"] : entries["1"];
    if (nameValue === undefined) throw new Error("Missing required property \"name\".");
    if (!(typeof nameValue === "string")) throw new Error("Invalid value for property \"name\".");
    props.name = nameValue;
    const barksValue = entries["2"] === undefined ? entries["barks"] : entries["2"];
    if (barksValue === undefined) throw new Error("Missing required property \"barks\".");
    if (!(typeof barksValue === "boolean")) throw new Error("Invalid value for property \"barks\".");
    props.barks = barksValue;
    return props as Dog.Data;
  }
  protected $enableChildListeners(): void {}
  get name(): string {
    return this.#name;
  }
  get barks(): boolean {
    return this.#barks;
  }
  setBarks(value: boolean): Dog {
    return this.$update(new Dog({
      name: this.#name,
      barks: value
    }, this.$listeners));
  }
  setName(value: string): Dog {
    return this.$update(new Dog({
      name: value,
      barks: this.#barks
    }, this.$listeners));
  }
}
export namespace Dog {
  export interface Data {
    name: string;
    barks: boolean;
  }
  export type Value = Dog | Dog.Data;
}
export class PetOwner extends Message<PetOwner.Data> {
  static TYPE_TAG = Symbol("PetOwner");
  static EMPTY: PetOwner;
  #ownerName: string;
  #pet: Cat | Dog;
  #optionalPet: Cat | Dog;
  constructor(props?: PetOwner.Value, listeners?: Set<(val: this) => void>) {
    if (!props && !listeners && PetOwner.EMPTY) return PetOwner.EMPTY;
    super(PetOwner.TYPE_TAG, "PetOwner", listeners);
    this.#ownerName = props ? props.ownerName : "";
    this.#pet = props ? props.pet : new Cat();
    this.#optionalPet = props ? props.optionalPet : undefined;
    if (this.$listeners.size > 0) {
      this.$enableChildListeners();
    }
    if (!props && !listeners) PetOwner.EMPTY = this;
  }
  protected $getPropDescriptors(): MessagePropDescriptor<PetOwner.Data>[] {
    return [{
      name: "ownerName",
      fieldNumber: 1,
      getValue: () => this.#ownerName
    }, {
      name: "pet",
      fieldNumber: 2,
      getValue: () => this.#pet,
      unionMessageTypes: ["Cat", "Dog"]
    }, {
      name: "optionalPet",
      fieldNumber: 3,
      getValue: () => this.#optionalPet,
      unionMessageTypes: ["Cat", "Dog"]
    }];
  }
  protected $fromEntries(entries: Record<string, unknown>): PetOwner.Data {
    const props = {} as Partial<PetOwner.Data>;
    const ownerNameValue = entries["1"] === undefined ? entries["ownerName"] : entries["1"];
    if (ownerNameValue === undefined) throw new Error("Missing required property \"ownerName\".");
    if (!(typeof ownerNameValue === "string")) throw new Error("Invalid value for property \"ownerName\".");
    props.ownerName = ownerNameValue;
    const petValue = entries["2"] === undefined ? entries["pet"] : entries["2"];
    if (petValue === undefined) throw new Error("Missing required property \"pet\".");
    let petUnionValue = petValue;
    if (isTaggedMessageData(petValue)) {
      if (petValue.$tag === "Cat") {
        const petCatProps = Cat.prototype.$fromEntries(petValue.$data);
        petUnionValue = new Cat(petCatProps);
      } else if (petValue.$tag === "Dog") {
        const petDogProps = Dog.prototype.$fromEntries(petValue.$data);
        petUnionValue = new Dog(petDogProps);
      }
    }
    props.pet = petUnionValue;
    const optionalPetValue = entries["3"] === undefined ? entries["optionalPet"] : entries["3"];
    const optionalPetNormalized = optionalPetValue === null ? undefined : optionalPetValue;
    let optionalPetUnionValue = optionalPetNormalized;
    if (optionalPetNormalized !== undefined && isTaggedMessageData(optionalPetNormalized)) {
      if (optionalPetNormalized.$tag === "Cat") {
        const optionalPetCatProps = Cat.prototype.$fromEntries(optionalPetNormalized.$data);
        optionalPetUnionValue = new Cat(optionalPetCatProps);
      } else if (optionalPetNormalized.$tag === "Dog") {
        const optionalPetDogProps = Dog.prototype.$fromEntries(optionalPetNormalized.$data);
        optionalPetUnionValue = new Dog(optionalPetDogProps);
      }
    }
    props.optionalPet = optionalPetUnionValue;
    return props as PetOwner.Data;
  }
  protected $enableChildListeners(): void {}
  get ownerName(): string {
    return this.#ownerName;
  }
  get pet(): Cat | Dog {
    return this.#pet;
  }
  get optionalPet(): Cat | Dog {
    return this.#optionalPet;
  }
  deleteOptionalPet(): PetOwner {
    return this.$update(new PetOwner({
      ownerName: this.#ownerName,
      pet: this.#pet
    }, this.$listeners));
  }
  setOptionalPet(value: Cat | Dog): PetOwner {
    return this.$update(new PetOwner({
      ownerName: this.#ownerName,
      pet: this.#pet,
      optionalPet: value
    }, this.$listeners));
  }
  setOwnerName(value: string): PetOwner {
    return this.$update(new PetOwner({
      ownerName: value,
      pet: this.#pet,
      optionalPet: this.#optionalPet
    }, this.$listeners));
  }
  setPet(value: Cat | Dog): PetOwner {
    return this.$update(new PetOwner({
      ownerName: this.#ownerName,
      pet: value,
      optionalPet: this.#optionalPet
    }, this.$listeners));
  }
}
export namespace PetOwner {
  export interface Data {
    ownerName: string;
    pet: Cat | Dog;
    optionalPet?: Cat | Dog | undefined;
  }
  export type Value = PetOwner | PetOwner.Data;
}