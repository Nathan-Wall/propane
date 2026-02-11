import assert from 'node:assert';
import { test } from 'node:test';
import { Message } from '../runtime/message.js';

type SimpleProps = { text: string };

const TYPE_TAG_Alpha = Symbol('Alpha');
const TYPE_TAG_Beta = Symbol('Beta');
const TYPE_TAG_Legacy = Symbol('Legacy');

class Alpha extends Message<SimpleProps> {
  static readonly $typeId = 'tests/messages/alpha';
  static readonly $typeHash = 'tests/messages/alpha@v1';
  static readonly $instanceTag = Symbol.for(`propane:message:${Alpha.$typeId}`);
  #text: string;

  constructor(text: string) {
    super(TYPE_TAG_Alpha, 'Alpha');
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

class Beta extends Message<SimpleProps> {
  static readonly $typeId = 'tests/messages/alpha';
  static readonly $typeHash = 'tests/messages/alpha@v1';
  static readonly $instanceTag = Symbol.for(`propane:message:${Beta.$typeId}`);
  #text: string;

  constructor(text: string) {
    super(TYPE_TAG_Beta, 'Beta');
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

class Legacy extends Message<SimpleProps> {
  static readonly $typeId = 'tests/messages/legacy';
  static readonly $typeHash = 'tests/messages/legacy@v1';
  #text: string;

  constructor(text: string) {
    super(TYPE_TAG_Legacy, 'Legacy');
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

test('Message.isInstance uses shared type IDs', () => {
  const alpha = new Alpha('hello');
  assert.ok(Alpha.isInstance(alpha));
  assert.ok(Beta.isInstance(alpha));
  assert.ok(!Beta.isInstance({}));
  assert.ok(!Beta.isInstance('nope'));
});

test('Message.isInstance falls back to instanceof', () => {
  const legacy = new Legacy('legacy');
  assert.ok(Legacy.isInstance(legacy));
  assert.ok(!Legacy.isInstance({}));
});

class ForeignAlpha {
  static readonly $typeId: string = Alpha.$typeId;
  static readonly $typeHash: string = Alpha.$typeHash;
  #serialized: string;
  #hash: number;

  constructor(serialized: string, hash: number) {
    Object.defineProperty(this, Symbol.for('propane:message'), {
      value: true,
      enumerable: false,
    });
    this.#serialized = serialized;
    this.#hash = hash;
  }

  serialize() {
    return this.#serialized;
  }

  hashCode() {
    return this.#hash;
  }

  equals() {
    return false;
  }
}

class ForeignBeta extends ForeignAlpha {
  static override readonly $typeId: string = 'tests/messages/beta';
}

test('Message.equals supports cross-copy messages with matching type hash', () => {
  const alpha = new Alpha('hello');
  const foreign = new ForeignAlpha(alpha.serialize(), alpha.hashCode());
  assert.ok(alpha.equals(foreign));
  assert.ok(
    !alpha.equals(new ForeignBeta(alpha.serialize(), alpha.hashCode()))
  );
});
