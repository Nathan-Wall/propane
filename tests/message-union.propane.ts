/* eslint-disable @typescript-eslint/no-namespace*/
// Generated from tests/message-union.propane
import { Message, MessagePropDescriptor, WITH_CHILD, GET_MESSAGE_CHILDREN, isTaggedMessageData } from "@propanejs/runtime";
export class Cat extends Message<Cat.Data> {
  static TYPE_TAG = Symbol("Cat");
  static readonly $typeName = "Cat";
  static EMPTY: Cat;
  #name: string;
  #meows: boolean;
  constructor(props?: Cat.Value) {
    if (!props && Cat.EMPTY) return Cat.EMPTY;
    super(Cat.TYPE_TAG, "Cat");
    this.#name = props ? props.name : "";
    this.#meows = props ? props.meows : false;
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
    }));
  }
  setName(value: string): Cat {
    return this.$update(new Cat({
      name: value,
      meows: this.#meows
    }));
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
  static readonly $typeName = "Dog";
  static EMPTY: Dog;
  #name: string;
  #barks: boolean;
  constructor(props?: Dog.Value) {
    if (!props && Dog.EMPTY) return Dog.EMPTY;
    super(Dog.TYPE_TAG, "Dog");
    this.#name = props ? props.name : "";
    this.#barks = props ? props.barks : false;
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
    }));
  }
  setName(value: string): Dog {
    return this.$update(new Dog({
      name: value,
      barks: this.#barks
    }));
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
  static readonly $typeName = "PetOwner";
  static EMPTY: PetOwner;
  #ownerName: string;
  #pet: Cat | Dog;
  #optionalPet: Cat | Dog;
  constructor(props?: PetOwner.Value) {
    if (!props && PetOwner.EMPTY) return PetOwner.EMPTY;
    super(PetOwner.TYPE_TAG, "PetOwner");
    this.#ownerName = props ? props.ownerName : "";
    this.#pet = props ? props.pet : new Cat();
    this.#optionalPet = props ? props.optionalPet : undefined;
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
    }));
  }
  setOptionalPet(value: Cat | Dog): PetOwner {
    return this.$update(new PetOwner({
      ownerName: this.#ownerName,
      pet: this.#pet,
      optionalPet: value
    }));
  }
  setOwnerName(value: string): PetOwner {
    return this.$update(new PetOwner({
      ownerName: value,
      pet: this.#pet,
      optionalPet: this.#optionalPet
    }));
  }
  setPet(value: Cat | Dog): PetOwner {
    return this.$update(new PetOwner({
      ownerName: this.#ownerName,
      pet: value,
      optionalPet: this.#optionalPet
    }));
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
