import { assert } from './assert.js';
import { Message, DataValue } from '../runtime/message.js';
import { test } from 'node:test';

interface PersonProps {
  [key: string]: DataValue;
  name: string;
  age: number;
}

const TYPE_TAG_Person = Symbol('Person');

class Person extends Message<PersonProps> {
  static readonly $typeId = 'tests/message-intern#Person';
  static readonly $typeHash = 'tests/message-intern#Person@v1';
  #name: string;
  #age: number;

  constructor(props: PersonProps) {
    super(TYPE_TAG_Person, 'Person');
    this.#name = props.name;
    this.#age = props.age;
    return this.intern();
  }

  protected $getPropDescriptors() {
    return [
      { name: 'name' as const, fieldNumber: 1, getValue: () => this.#name },
      { name: 'age' as const, fieldNumber: 2, getValue: () => this.#age },
    ];
  }

  protected $fromEntries(entries: Record<string, unknown>): PersonProps {
    const name = entries['1'];
    const age = entries['2'];
    if (typeof name !== 'string') throw new TypeError('Missing name');
    if (typeof age !== 'number') throw new TypeError('Missing age');
    return { name, age };
  }
}

export default function runMessageInternTests() {
  const unused_p1 = new Person({ name: 'Alice', age: 30 });
  const unused_p2 = new Person({ name: 'Alice', age: 30 });
  const unused_p3 = new Person({ name: 'Bob', age: 25 });


  const p4 = new Person({ name: 'Alice', age: 30 });
  const p5 = new Person({ name: 'Alice', age: 30 });
  const p6 = new Person({ name: 'Bob', age: 25 });

  assert(p4 === p5, 'New instances with same value should be equal by reference due to automatic interning');
  assert(p4 !== p6, 'New instances with different values should not be equal by reference');
  assert(p5.equals(p4), 'Instances with same value should be equal by value');
  assert(!p5.equals(p6), 'Instances with different value should not be equal by value');
}

test('runMessageInternTests', () => {
  runMessageInternTests();
});
