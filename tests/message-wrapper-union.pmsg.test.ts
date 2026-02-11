import { test } from 'node:test';
import { assert } from './assert.js';
import { Flag } from './message-wrapper-flag.pmsg.js';
import { WrapperUnion } from './message-wrapper-union.pmsg.js';

function hasOwn(obj: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

function getDescriptor(
  obj: object | null,
  key: string
): PropertyDescriptor | undefined {
  let current = obj;
  while (current) {
    const desc = Object.getOwnPropertyDescriptor(current, key);
    if (desc) return desc;
    current = Object.getPrototypeOf(current);
  }
  return undefined;
}

test('MessageWrapper shape exposes a protected getter for value', () => {
  const flag = new Flag({ value: true });
  const protoDesc = getDescriptor(Object.getPrototypeOf(flag), 'value');
  assert(protoDesc !== undefined, 'MessageWrapper should define a value getter on the prototype.');
  assert(typeof protoDesc?.get === 'function', 'MessageWrapper value should be an accessor getter.');
  assert(!protoDesc?.set, 'MessageWrapper value should not define a setter.');
  const ownDesc = Object.getOwnPropertyDescriptor(flag, 'value');
  assert(ownDesc === undefined, 'MessageWrapper should not define value as an own property.');
  assert(!hasOwn(flag, 'value'), 'MessageWrapper should not use an own data property for value.');
});

test('MessageWrapper union tagging and round-trip', () => {
  const message = new WrapperUnion({ value: new Flag({ value: true }) });
  const serialized = message.serialize();
  assert(serialized === ':{W1}', 'Wrapper union should serialize using compact tagged value.');

  const roundTrip = WrapperUnion.deserialize(serialized);
  assert(Flag.isInstance(roundTrip.value), 'Union deserialization should restore Flag instance.');
  assert(roundTrip.value.serialize() === ':W1', 'Round-tripped Flag should serialize to compact form.');
});

test('MessageWrapper compact uses $serialize/$deserialize in union context', () => {
  const message = new WrapperUnion({ value: new Flag({ value: false }) });
  const serialized = message.serialize();
  assert(serialized === ':{W0}', 'Wrapper union should use $serialize output for compact payload.');

  const roundTrip = WrapperUnion.deserialize(serialized);
  assert(Flag.isInstance(roundTrip.value), 'Union deserialization should restore Flag instance.');
  assert(roundTrip.value.serialize() === ':W0', 'Round-tripped Flag should serialize using $serialize.');
});
