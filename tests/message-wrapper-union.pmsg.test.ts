import { test } from 'node:test';
import { assert } from './assert.js';
import { Flag } from './message-wrapper-flag.pmsg.js';
import { WrapperUnion } from './message-wrapper-union.pmsg.js';

function hasOwn(obj: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

test('MessageWrapper shape uses protected value with no getter', () => {
  const flag = new Flag({ value: true });
  const proto = Object.getPrototypeOf(flag);
  const protoDesc = Object.getOwnPropertyDescriptor(proto, 'value');
  assert(protoDesc === undefined, 'MessageWrapper should not define a value getter on the prototype.');
  const ownDesc = Object.getOwnPropertyDescriptor(flag, 'value');
  assert(ownDesc !== undefined, 'MessageWrapper should store value on the instance.');
  assert(hasOwn(flag, 'value'), 'MessageWrapper should use an own data property for value.');
  assert(!ownDesc?.get && !ownDesc?.set, 'MessageWrapper value should not be an accessor property.');
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
