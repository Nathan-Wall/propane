import { assert } from './assert.js';
import { computeExpectedHashCode } from './hash-helpers.js';
import { Message, DataValue } from '../runtime/message.js';
import { test } from 'node:test';

interface SimpleProps {
  [key: string]: DataValue;
  text: string;
}

const TYPE_TAG_SimpleMessage = Symbol('SimpleMessage');

class SimpleMessage extends Message<SimpleProps> {
  static readonly $typeId = 'tests/message-runtime#SimpleMessage';
  static readonly $typeHash = 'tests/message-runtime#SimpleMessage@v1';
  #text: string;

  constructor(text: string) {
    super(TYPE_TAG_SimpleMessage, 'SimpleMessage');
    this.#text = text;
  }

  protected $getPropDescriptors() {
    return [{ name: 'text' as const, fieldNumber: 1, getValue: () => this.#text }];
  }

  protected $fromEntries(entries: Record<string, unknown>): SimpleProps {
    const text = entries['1'];
    if (typeof text !== 'string') {
      throw new TypeError('Missing required property "text".');
    }
    return { text };
  }
}

export default function runMessageRuntimeTests() {
  const emoji = 'hash😀';
  const message = new SimpleMessage(emoji);

  const serialized = message.serialize();
  const expectedHash = computeExpectedHashCode(serialized);

  assert(
    message.hashCode() === expectedHash,
    'Message.hashCode should hash the serialized payload using UTF-16 code units.'
  );
  assert(
    message.hashCode() === expectedHash,
    'Message.hashCode should be stable across repeated calls.'
  );
}

test('runMessageRuntimeTests', () => {
  runMessageRuntimeTests();
});
