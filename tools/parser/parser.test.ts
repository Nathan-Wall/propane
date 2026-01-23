/**
 * Unit tests for @propane/parser
 */

import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import {
  parseSource,
  getBabelParserOptions,
  isTransformableMessage,
  getEndpointInfo,
  findEndpoints,
} from './index.js';

// ============================================================================
// Babel Parser Options Tests
// ============================================================================

describe('getBabelParserOptions', () => {
  it('should return parser options with TypeScript plugin', () => {
    const options = getBabelParserOptions();
    assert.ok(options.plugins?.includes('typescript'));
  });

  it('should return a new object each time (no mutation)', () => {
    const options1 = getBabelParserOptions();
    const options2 = getBabelParserOptions();
    assert.notStrictEqual(options1, options2);
    assert.notStrictEqual(options1.plugins, options2.plugins);
  });
});

// ============================================================================
// Basic Message Parsing Tests
// ============================================================================

describe('parseSource - basic messages', () => {
  it('should parse a simple Message<T> type', () => {
    const source = `
      import { Message } from '@propane/runtime';

      export type User = Message<{
        '1:id': number;
        '2:name': string;
      }>;
    `;

    const { file } = parseSource(source, 'test.pmsg');

    assert.strictEqual(file.messages.length, 1);
    assert.strictEqual(file.messages[0]!.name, 'User');
    assert.strictEqual(file.messages[0]!.isMessageType, true);
    assert.strictEqual(file.messages[0]!.properties.length, 2);

    // Check properties
    const idProp = file.messages[0]!.properties.find(p => p.name === 'id');
    assert.ok(idProp);
    assert.strictEqual(idProp.fieldNumber, 1);
    assert.strictEqual(idProp.type.kind, 'primitive');

    const nameProp = file.messages[0]!.properties.find(p => p.name === 'name');
    assert.ok(nameProp);
    assert.strictEqual(nameProp.fieldNumber, 2);
  });

  it('should parse unnumbered fields', () => {
    const source = `
      import { Message } from '@propane/runtime';

      export type Config = Message<{
        name: string;
        enabled: boolean;
      }>;
    `;

    const { file } = parseSource(source, 'test.pmsg');

    assert.strictEqual(file.messages.length, 1);
    const nameProp = file.messages[0]!.properties.find(p => p.name === 'name');
    assert.ok(nameProp);
    assert.strictEqual(nameProp.fieldNumber, null);
  });

  it('should parse optional properties', () => {
    const source = `
      import { Message } from '@propane/runtime';

      export type User = Message<{
        '1:id': number;
        '2:nickname'?: string;
      }>;
    `;

    const { file } = parseSource(source, 'test.pmsg');

    const nicknameProp = file.messages[0]!.properties.find(p => p.name === 'nickname');
    assert.ok(nicknameProp);
    assert.strictEqual(nicknameProp.optional, true);
  });

  it('should parse readonly properties', () => {
    const source = `
      import { Message } from '@propane/runtime';

      export type User = Message<{
        readonly '1:id': number;
      }>;
    `;

    const { file } = parseSource(source, 'test.pmsg');

    const idProp = file.messages[0]!.properties.find(p => p.name === 'id');
    assert.ok(idProp);
    assert.strictEqual(idProp.readonly, true);
  });
});

// ============================================================================
// Type Parsing Tests
// ============================================================================

describe('parseSource - type parsing', () => {
  it('should parse primitive types', () => {
    const source = `
      import { Message } from '@propane/runtime';

      export type Primitives = Message<{
        '1:str': string;
        '2:num': number;
        '3:bool': boolean;
        '4:big': bigint;
      }>;
    `;

    const { file } = parseSource(source, 'test.pmsg');

    const props = file.messages[0]!.properties;
    assert.strictEqual(props.find(p => p.name === 'str')?.type.kind, 'primitive');
    assert.strictEqual(props.find(p => p.name === 'num')?.type.kind, 'primitive');
    assert.strictEqual(props.find(p => p.name === 'bool')?.type.kind, 'primitive');
    assert.strictEqual(props.find(p => p.name === 'big')?.type.kind, 'primitive');
  });

  it('should parse array types', () => {
    const source = `
      import { Message } from '@propane/runtime';

      export type Lists = Message<{
        '1:items': string[];
        '2:numbers': Array<number>;
      }>;
    `;

    const { file } = parseSource(source, 'test.pmsg');

    const props = file.messages[0]!.properties;
    const itemsProp = props.find(p => p.name === 'items');
    assert.ok(itemsProp);
    assert.strictEqual(itemsProp.type.kind, 'array');

    const numbersProp = props.find(p => p.name === 'numbers');
    assert.ok(numbersProp);
    assert.strictEqual(numbersProp.type.kind, 'array');
  });

  it('should parse map types', () => {
    const source = `
      import { Message } from '@propane/runtime';

      export type Maps = Message<{
        '1:lookup': Map<string, number>;
      }>;
    `;

    const { file } = parseSource(source, 'test.pmsg');

    const prop = file.messages[0]!.properties[0]!;
    assert.strictEqual(prop.type.kind, 'map');
    if (prop.type.kind === 'map') {
      assert.strictEqual(prop.type.keyType.kind, 'primitive');
      assert.strictEqual(prop.type.valueType.kind, 'primitive');
    }
  });

  it('should parse set types', () => {
    const source = `
      import { Message } from '@propane/runtime';

      export type Sets = Message<{
        '1:ids': Set<number>;
      }>;
    `;

    const { file } = parseSource(source, 'test.pmsg');

    const prop = file.messages[0]!.properties[0]!;
    assert.strictEqual(prop.type.kind, 'set');
  });

  it('should parse union types', () => {
    const source = `
      import { Message } from '@propane/runtime';

      export type Unions = Message<{
        '1:status': 'active' | 'inactive';
        '2:value': string | number;
      }>;
    `;

    const { file } = parseSource(source, 'test.pmsg');

    const statusProp = file.messages[0]!.properties.find(p => p.name === 'status');
    assert.ok(statusProp);
    assert.strictEqual(statusProp.type.kind, 'union');

    const valueProp = file.messages[0]!.properties.find(p => p.name === 'value');
    assert.ok(valueProp);
    assert.strictEqual(valueProp.type.kind, 'union');
  });

  it('should parse special types (Date, URL, ArrayBuffer)', () => {
    const source = `
      import { Message } from '@propane/runtime';

      export type Special = Message<{
        '1:created': Date;
        '2:link': URL;
        '3:data': ArrayBuffer;
      }>;
    `;

    const { file } = parseSource(source, 'test.pmsg');

    const props = file.messages[0]!.properties;
    const createdType = props.find(p => p.name === 'created')?.type;
    assert.ok(createdType);
    assert.strictEqual(createdType.kind, 'reference');
    if (createdType.kind === 'reference') {
      assert.strictEqual(createdType.name, 'ImmutableDate');
    }
    const linkType = props.find(p => p.name === 'link')?.type;
    assert.ok(linkType);
    assert.strictEqual(linkType.kind, 'reference');
    if (linkType.kind === 'reference') {
      assert.strictEqual(linkType.name, 'ImmutableUrl');
    }
    assert.strictEqual(props.find(p => p.name === 'data')?.type.kind, 'arraybuffer');
  });

  it('should parse type references', () => {
    const source = `
      import { Message } from '@propane/runtime';

      export type Order = Message<{
        '1:user': User;
        '2:items': OrderItem[];
      }>;
    `;

    const { file } = parseSource(source, 'test.pmsg');

    const userProp = file.messages[0]!.properties.find(p => p.name === 'user');
    assert.ok(userProp);
    assert.strictEqual(userProp.type.kind, 'reference');
    if (userProp.type.kind === 'reference') {
      assert.strictEqual(userProp.type.name, 'User');
    }
  });
});

// ============================================================================
// Decorator Tests
// ============================================================================

describe('parseSource - decorators', () => {
  it('should detect Message wrapper', () => {
    const source = `
      import { Message } from '@propane/runtime';

      export type User = Message<{
        '1:id': number;
      }>;
    `;

    const { file } = parseSource(source, 'test.pmsg');
    assert.strictEqual(file.messages[0]!.isMessageType, true);
  });

  it('should detect MessageWrapper and parse value type', () => {
    const source = `
      import { MessageWrapper } from '@propane/runtime';

      // @extend('./wrapper.ext.ts')
      export type Wrapped = MessageWrapper<ArrayBuffer>;
    `;

    const { file } = parseSource(source, 'test.pmsg');
    const message = file.messages[0]!;
    assert.strictEqual(message.isMessageType, true);
    assert.strictEqual(message.isWrapperValue, true);
    assert.strictEqual(message.properties.length, 1);
    const prop = message.properties[0]!;
    assert.strictEqual(prop.name, 'value');
    assert.strictEqual(prop.type.kind, 'arraybuffer');
  });

  it('should allow primitives, literals, and unions in MessageWrapper', () => {
    const source = `
      import { MessageWrapper } from '@propane/runtime';

      // @extend('./wrapper.ext.ts')
      export type BoolWrap = MessageWrapper<boolean>;

      // @extend('./wrapper.ext.ts')
      export type LiteralWrap = MessageWrapper<'ok'>;

      // @extend('./wrapper.ext.ts')
      export type UnionWrap = MessageWrapper<boolean | 'ok' | 1>;

      // @extend('./wrapper.ext.ts')
      export type NullWrap = MessageWrapper<null>;

      // @extend('./wrapper.ext.ts')
      export type UndefinedWrap = MessageWrapper<undefined>;

      // @extend('./wrapper.ext.ts')
      export type VoidWrap = MessageWrapper<void>;

      // @extend('./wrapper.ext.ts')
      export type BigIntLiteralWrap = MessageWrapper<123n>;

      // @extend('./wrapper.ext.ts')
      export type NegativeLiteralWrap = MessageWrapper<-1>;

      // @extend('./wrapper.ext.ts')
      export type MixedUnionWrap = MessageWrapper<ArrayBuffer | string | 2>;

      // @extend('./wrapper.ext.ts')
      export type ParenWrap = MessageWrapper<(string | number)>;
    `;

    const { file } = parseSource(source, 'test.pmsg');

    const boolMessage = file.messages.find(m => m.name === 'BoolWrap');
    assert.ok(boolMessage);
    const boolProp = boolMessage!.properties[0]!;
    assert.strictEqual(boolProp.type.kind, 'primitive');
    if (boolProp.type.kind === 'primitive') {
      assert.strictEqual(boolProp.type.primitive, 'boolean');
    }

    const literalMessage = file.messages.find(m => m.name === 'LiteralWrap');
    assert.ok(literalMessage);
    const literalProp = literalMessage!.properties[0]!;
    assert.strictEqual(literalProp.type.kind, 'literal');
    if (literalProp.type.kind === 'literal') {
      assert.strictEqual(literalProp.type.value, 'ok');
    }

    const unionMessage = file.messages.find(m => m.name === 'UnionWrap');
    assert.ok(unionMessage);
    const unionProp = unionMessage!.properties[0]!;
    assert.strictEqual(unionProp.type.kind, 'union');
    if (unionProp.type.kind === 'union') {
      assert.strictEqual(unionProp.type.types.length, 3);
      assert.ok(unionProp.type.types.some((t) => t.kind === 'primitive' && t.primitive === 'boolean'));
      assert.ok(unionProp.type.types.some((t) => t.kind === 'literal' && t.value === 'ok'));
      assert.ok(unionProp.type.types.some((t) => t.kind === 'literal' && t.value === 1));
    }

    const nullMessage = file.messages.find(m => m.name === 'NullWrap');
    assert.ok(nullMessage);
    const nullProp = nullMessage!.properties[0]!;
    assert.strictEqual(nullProp.type.kind, 'primitive');
    if (nullProp.type.kind === 'primitive') {
      assert.strictEqual(nullProp.type.primitive, 'null');
    }

    const undefinedMessage = file.messages.find(m => m.name === 'UndefinedWrap');
    assert.ok(undefinedMessage);
    const undefinedProp = undefinedMessage!.properties[0]!;
    assert.strictEqual(undefinedProp.type.kind, 'primitive');
    if (undefinedProp.type.kind === 'primitive') {
      assert.strictEqual(undefinedProp.type.primitive, 'undefined');
    }

    const voidMessage = file.messages.find(m => m.name === 'VoidWrap');
    assert.ok(voidMessage);
    const voidProp = voidMessage!.properties[0]!;
    assert.strictEqual(voidProp.type.kind, 'primitive');
    if (voidProp.type.kind === 'primitive') {
      assert.strictEqual(voidProp.type.primitive, 'undefined');
    }

    const bigintMessage = file.messages.find(m => m.name === 'BigIntLiteralWrap');
    assert.ok(bigintMessage);
    const bigintProp = bigintMessage!.properties[0]!;
    assert.strictEqual(bigintProp.type.kind, 'literal');
    if (bigintProp.type.kind === 'literal') {
      assert.strictEqual(bigintProp.type.value, 123n);
    }

    const negativeMessage = file.messages.find(m => m.name === 'NegativeLiteralWrap');
    assert.ok(negativeMessage);
    const negativeProp = negativeMessage!.properties[0]!;
    assert.strictEqual(negativeProp.type.kind, 'literal');
    if (negativeProp.type.kind === 'literal') {
      assert.strictEqual(negativeProp.type.value, -1);
    }

    const mixedUnionMessage = file.messages.find(m => m.name === 'MixedUnionWrap');
    assert.ok(mixedUnionMessage);
    const mixedProp = mixedUnionMessage!.properties[0]!;
    assert.strictEqual(mixedProp.type.kind, 'union');
    if (mixedProp.type.kind === 'union') {
      assert.strictEqual(mixedProp.type.types.length, 3);
      assert.ok(mixedProp.type.types.some((t) => t.kind === 'arraybuffer'));
      assert.ok(mixedProp.type.types.some((t) => t.kind === 'primitive' && t.primitive === 'string'));
      assert.ok(mixedProp.type.types.some((t) => t.kind === 'literal' && t.value === 2));
    }

    const parenMessage = file.messages.find(m => m.name === 'ParenWrap');
    assert.ok(parenMessage);
    const parenProp = parenMessage!.properties[0]!;
    assert.strictEqual(parenProp.type.kind, 'union');
    if (parenProp.type.kind === 'union') {
      assert.strictEqual(parenProp.type.types.length, 2);
      assert.ok(parenProp.type.types.some((t) => t.kind === 'primitive' && t.primitive === 'string'));
      assert.ok(parenProp.type.types.some((t) => t.kind === 'primitive' && t.primitive === 'number'));
    }
  });

  it('should detect @extend decorator', () => {
    const source = `
      import { Message } from '@propane/runtime';

      // @extend('./user.ext.ts')
      export type User = Message<{
        '1:id': number;
      }>;
    `;

    const { file } = parseSource(source, 'test.pmsg');
    assert.strictEqual(file.messages[0]!.extendPath, './user.ext.ts');
  });

  it('should detect @typeId decorator', () => {
    const source = `
      import { Message } from '@propane/runtime';

      // @typeId('com.example:messages/user')
      export type User = Message<{
        '1:id': number;
      }>;
    `;

    const { file } = parseSource(source, 'test.pmsg');
    assert.strictEqual(file.messages[0]!.typeId, 'com.example:messages/user');
  });

  it('should detect @compact decorator', () => {
    const source = `
      import { Message } from '@propane/runtime';

      // @extend('./user.ext.ts')
      // @compact
      export type User = Message<{
        '1:id': number;
      }>;
    `;

    const { file } = parseSource(source, 'test.pmsg');
    assert.strictEqual(file.messages[0]!.compact, true);
    assert.strictEqual(file.messages[0]!.compactTag, null);
  });

  it('should detect @compact tag argument', () => {
    const source = `
      import { Message } from '@propane/runtime';

      // @extend('./user.ext.ts')
      // @compact('D')
      export type User = Message<{
        '1:id': number;
      }>;
    `;

    const { file } = parseSource(source, 'test.pmsg');
    assert.strictEqual(file.messages[0]!.compact, true);
    assert.strictEqual(file.messages[0]!.compactTag, 'D');
  });

  it('should error on @compact with invalid arguments', () => {
    const source = `
      import { Message } from '@propane/runtime';

      // @extend('./user.ext.ts')
      // @compact()
      export type User = Message<{
        '1:id': number;
      }>;
    `;

    const { diagnostics } = parseSource(source, 'test.pmsg');
    const error = diagnostics.find(d => d.code === 'PMT040');
    assert.ok(error, 'Should have PMT040 error for @compact with invalid arguments');
  });

  it('should error on deprecated @message decorator', () => {
    const source = `
      // @message
      export type User = {
        '1:id': number;
      };
    `;

    const { diagnostics } = parseSource(source, 'test.pmsg');

    const error = diagnostics.find(d => d.code === 'PMT035');
    assert.ok(error, 'Should have PMT035 error for deprecated @message decorator');
  });
});

// ============================================================================
// Wrapper/Endpoint Tests
// ============================================================================

describe('parseSource - wrapper types', () => {
  it('should parse Endpoint wrapper type', () => {
    const source = `
      import { Message } from '@propane/runtime';
      import { Endpoint } from '@propane/pms-core';

      export type GetUser = Endpoint<{
        '1:id': number;
      }, GetUserResponse>;

      export type GetUserResponse = Message<{
        '1:user': User;
      }>;
    `;

    const { file } = parseSource(source, 'test.pmsg');

    const getUser = file.messages.find(m => m.name === 'GetUser');
    assert.ok(getUser);
    assert.ok(getUser.wrapper);
    assert.strictEqual(getUser.wrapper.localName, 'Endpoint');
    assert.ok(getUser.wrapper.responseType);

    // Properties should be from the payload
    assert.strictEqual(getUser.properties.length, 1);
    assert.strictEqual(getUser.properties[0]!.name, 'id');
  });

  it('should detect endpoint via getEndpointInfo', () => {
    const source = `
      import { Endpoint } from '@propane/pms-core';

      export type GetUser = Endpoint<{
        '1:id': number;
      }, GetUserResponse>;
    `;

    const { file } = parseSource(source, 'test.pmsg');
    const message = file.messages[0]!;
    const endpointInfo = getEndpointInfo(file, message);

    assert.ok(endpointInfo);
    assert.strictEqual(endpointInfo.requestTypeName, 'GetUser');
  });

  it('should detect endpoint with aliased import', () => {
    const source = `
      import { Endpoint as PmsRequest } from '@propane/pms-core';

      export type GetUser = PmsRequest<{
        '1:id': number;
      }, GetUserResponse>;
    `;

    const { file } = parseSource(source, 'test.pmsg');
    const endpointInfo = getEndpointInfo(file, file.messages[0]!);

    assert.ok(endpointInfo);
    assert.strictEqual(endpointInfo.requestTypeName, 'GetUser');
  });

  it('should not detect non-Endpoint wrapper as endpoint', () => {
    const source = `
      import { SomeOther } from 'other-lib';

      export type GetUser = SomeOther<{
        '1:id': number;
      }, GetUserResponse>;
    `;

    const { file } = parseSource(source, 'test.pmsg');
    // Non-message wrappers should not produce messages
    assert.strictEqual(file.messages.length, 0);
  });
});

// ============================================================================
// Validation Error Tests
// ============================================================================

describe('parseSource - validation errors', () => {
  it('should error on interfaces', () => {
    const source = `
      interface User {
        id: number;
      }
    `;

    const { diagnostics } = parseSource(source, 'test.pmsg');

    const error = diagnostics.find(d => d.code === 'PMT010');
    assert.ok(error, 'Should have PMT010 error for interface');
    assert.strictEqual(error.severity, 'error');
  });

  it('should error on intersection types', () => {
    const source = `
      import { Message } from '@propane/runtime';

      export type User = Message<{
        '1:id': number;
      } & { name: string }>;
    `;

    const { diagnostics } = parseSource(source, 'test.pmsg');

    const error = diagnostics.find(d => d.code === 'PMT013');
    assert.ok(error, 'Should have PMT013 error for intersection');
  });

  it('should error on object literal types without Message wrapper', () => {
    const source = `
      export type User = {
        id: number;
        name: string;
      };
    `;

    const { diagnostics } = parseSource(source, 'test.pmsg');

    const error = diagnostics.find(d => d.code === 'PMT012');
    assert.ok(error, 'Should have PMT012 error for non-Message object literal');
  });

  it('should error on MessageWrapper without @extend', () => {
    const source = `
      import { MessageWrapper } from '@propane/runtime';

      export type Wrapped = MessageWrapper<ArrayBuffer>;
    `;

    const { diagnostics } = parseSource(source, 'test.pmsg');

    const error = diagnostics.find(d => d.code === 'PMT062');
    assert.ok(error, 'Should have PMT062 error for MessageWrapper without @extend');
  });

  it('should error on generic MessageWrapper declarations', () => {
    const source = `
      import { MessageWrapper } from '@propane/runtime';

      // @extend('./wrapper.ext.ts')
      export type Wrapped<T extends number> = MessageWrapper<ArrayBuffer>;
    `;

    const { diagnostics } = parseSource(source, 'test.pmsg');

    const error = diagnostics.find(d => d.code === 'PMT060');
    assert.ok(error, 'Should have PMT060 error for generic MessageWrapper');
  });

  it('should error on generic type arguments in MessageWrapper', () => {
    const source = `
      import { MessageWrapper } from '@propane/runtime';

      // @extend('./wrapper.ext.ts')
      export type Wrapped = MessageWrapper<Thing<string>>;
    `;

    const { diagnostics } = parseSource(source, 'test.pmsg');

    const error = diagnostics.find(d => d.code === 'PMT064');
    assert.ok(error, 'Should have PMT064 error for generic MessageWrapper type argument');
  });

  it('should error on duplicate field numbers', () => {
    const source = `
      import { Message } from '@propane/runtime';

      export type User = Message<{
        '1:id': number;
        '1:name': string;
      }>;
    `;

    const { diagnostics } = parseSource(source, 'test.pmsg');

    const error = diagnostics.find(d => d.code === 'PMT043');
    assert.ok(error, 'Should have PMT043 error for duplicate field number');
  });

  it('should error on invalid field numbers', () => {
    const source = `
      import { Message } from '@propane/runtime';

      export type User = Message<{
        '0:id': number;
      }>;
    `;

    const { diagnostics } = parseSource(source, 'test.pmsg');

    const error = diagnostics.find(d => d.code === 'PMT042');
    assert.ok(error, 'Should have PMT042 error for invalid field number');
  });

  it('should error on reserved property names', () => {
    const source = `
      import { Message } from '@propane/runtime';

      export type User = Message<{
        '1:serialize': string;
      }>;
    `;

    const { diagnostics } = parseSource(source, 'test.pmsg');

    const error = diagnostics.find(d => d.code === 'PMT045');
    assert.ok(error, 'Should have PMT045 error for reserved property name');
  });
});

// ============================================================================
// Import Parsing Tests
// ============================================================================

describe('parseSource - imports', () => {
  it('should parse named imports', () => {
    const source = `
      import { Endpoint, Message } from '@propane/pms-core';
      import { User } from './user.pmsg.js';

      export type Test = Message<{
        '1:id': number;
      }>;
    `;

    const { file } = parseSource(source, 'test.pmsg');

    assert.strictEqual(file.imports.length, 2);

    const coreImport = file.imports.find(i => i.source === '@propane/pms-core');
    assert.ok(coreImport);
    assert.strictEqual(coreImport.specifiers.length, 2);
    assert.ok(coreImport.specifiers.some(s => s.imported === 'Endpoint'));
    assert.ok(coreImport.specifiers.some(s => s.imported === 'Message'));
  });

  it('should handle aliased imports', () => {
    const source = `
      import { Endpoint as PmsRequest } from '@propane/pms-core';
      import { Message } from '@propane/runtime';

      export type Test = Message<{
        '1:id': number;
      }>;
    `;

    const { file } = parseSource(source, 'test.pmsg');

    const coreImport = file.imports.find(i => i.source === '@propane/pms-core');
    assert.ok(coreImport);
    const endpointSpec = coreImport.specifiers.find(s => s.imported === 'Endpoint');
    assert.ok(endpointSpec);
    assert.strictEqual(endpointSpec.local, 'PmsRequest');
  });
});

// ============================================================================
// Type Alias Tests
// ============================================================================

describe('parseSource - type aliases', () => {
  it('should parse non-message type aliases', () => {
    const source = `
      import { Message } from '@propane/runtime';

      type Id = number | string;
      type Email = Brand<string, 'Email'>;

      export type User = Message<{
        '1:id': Id;
        '2:email': Email;
      }>;
    `;

    const { file } = parseSource(source, 'test.pmsg');

    // Should have 2 type aliases (Id and Email)
    assert.strictEqual(file.typeAliases.length, 2);
    assert.ok(file.typeAliases.some(a => a.name === 'Id'));
    assert.ok(file.typeAliases.some(a => a.name === 'Email'));
  });
});

// ============================================================================
// Helper Function Tests
// ============================================================================

describe('isTransformableMessage', () => {
  it('should return true for valid Message types', () => {
    const source = `
      import { Message } from '@propane/runtime';

      export type User = Message<{
        '1:id': number;
      }>;
    `;

    const { file } = parseSource(source, 'test.pmsg');
    assert.strictEqual(isTransformableMessage(file.messages[0]!, file), true);
  });

  it('should return false for messages with errors', () => {
    const source = `
      import { Message } from '@propane/runtime';

      export type User = Message<{
        '1:serialize': number;
      }>;
    `;

    const { file } = parseSource(source, 'test.pmsg');
    // 'serialize' is a reserved name, so there should be an error
    assert.strictEqual(isTransformableMessage(file.messages[0]!, file), false);
  });
});

describe('findEndpoints', () => {
  it('should find all endpoints in a file', () => {
    const source = `
      import { Message } from '@propane/runtime';
      import { Endpoint } from '@propane/pms-core';

      export type GetUser = Endpoint<{
        '1:id': number;
      }, GetUserResponse>;

      export type ListUsers = Endpoint<{
        '1:limit': number;
      }, ListUsersResponse>;

      export type User = Message<{
        '1:id': number;
      }>;
    `;

    const { file } = parseSource(source, 'test.pmsg');
    const endpoints = findEndpoints(file);

    assert.strictEqual(endpoints.length, 2);
    assert.ok(endpoints.some(e => e.requestTypeName === 'GetUser'));
    assert.ok(endpoints.some(e => e.requestTypeName === 'ListUsers'));
  });
});
