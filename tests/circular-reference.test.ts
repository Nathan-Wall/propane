import { assert, assertThrows } from './assert.js';
import { Message, DataObject, DataValue } from '../runtime/message.js';
import { test } from 'node:test';

interface ObjectFieldProps {
  [key: string]: DataValue;
  data: DataObject;
}

class ObjectFieldMessage extends Message<ObjectFieldProps> {
  static readonly TYPE_TAG = Symbol('ObjectFieldMessage');
  #data: DataObject;

  constructor(data: DataObject) {
    super(ObjectFieldMessage.TYPE_TAG, 'ObjectFieldMessage');
    this.#data = data;
  }

  protected $getPropDescriptors() {
    return [{ name: 'data' as const, fieldNumber: 1, getValue: () => this.#data }];
  }

  protected $fromEntries(entries: Record<string, unknown>): ObjectFieldProps {
    const data = entries['1'];
    if (!data || typeof data !== 'object') {
      throw new TypeError('Missing required property "data".');
    }
    return { data: data as DataObject };
  }
}

export default function runCircularReferenceTests() {
  testDirectCircularReference();
  testNestedCircularReference();
  testArrayCircularReference();
  testNonCircularSharedReference();
  console.log('All circular reference tests passed!');
}

function testDirectCircularReference() {
  // Create an object that references itself
  const circular: Record<string, unknown> = { name: 'test' };
  circular['self'] = circular;

  // @ts-expect-error Testing with circular Record<string, unknown>
  const message = new ObjectFieldMessage(circular);

  assertThrows(
    () => message.serialize(),
    'Should throw on direct circular reference'
  );
}

function testNestedCircularReference() {
  // Create a circular reference through nesting
  const parent: Record<string, unknown> = { name: 'parent' };
  const child: Record<string, unknown> = { name: 'child', parent };
  parent['child'] = child;

  // @ts-expect-error Testing with circular Record<string, unknown>
  const message = new ObjectFieldMessage(parent);

  assertThrows(
    () => message.serialize(),
    'Should throw on nested circular reference'
  );
}

function testArrayCircularReference() {
  // Create a circular reference through an array
  const obj: Record<string, unknown> = { name: 'test' };
  const arr = [1, 2, obj];
  obj['arr'] = arr;

  const message = new ObjectFieldMessage({ items: arr });

  assertThrows(
    () => message.serialize(),
    'Should throw on circular reference through array'
  );
}

function testNonCircularSharedReference() {
  // Shared references (same object in multiple places) should work
  // as long as they're not circular
  const shared = { value: 42 };
  const data = {
    first: shared,
    second: shared,
  };

  const message = new ObjectFieldMessage(data);

  // This should NOT throw - shared references are fine (same as JSON.stringify)
  const serialized = message.serialize();
  assert(
    serialized.includes('value'),
    'Shared references should serialize successfully'
  );
}

test('runCircularReferenceTests', () => {
  runCircularReferenceTests();
});
