import { createHash } from 'node:crypto';
import type { PmtMessage, PmtType, PmtTypeParameter } from './types.js';

const HASH_VERSION = 'pmt-v1';

type CanonicalType =
  | ['primitive', string]
  | ['reference', string, CanonicalType[]]
  | ['array', CanonicalType]
  | ['map', CanonicalType, CanonicalType]
  | ['set', CanonicalType]
  | ['union', CanonicalType[]]
  | ['date']
  | ['url']
  | ['arraybuffer']
  | ['literal', string | number | boolean | ['bigint', string]];

type CanonicalTypeParam = [string, CanonicalType | null];
type CanonicalProperty = [
  string,
  number | null,
  boolean,
  boolean,
  CanonicalType
];
type CanonicalWrapper = [string, CanonicalType | null] | null;
type CanonicalMessage = [
  typeof HASH_VERSION,
  CanonicalTypeParam[],
  CanonicalWrapper,
  boolean,
  string | null,
  CanonicalProperty[]
];

function canonicalizeType(type: PmtType): CanonicalType {
  switch (type.kind) {
    case 'primitive':
      return ['primitive', type.primitive];
    case 'reference':
      return ['reference', type.name, type.typeArguments.map(canonicalizeType)];
    case 'array':
      return ['array', canonicalizeType(type.elementType)];
    case 'map':
      return [
        'map',
        canonicalizeType(type.keyType),
        canonicalizeType(type.valueType),
      ];
    case 'set':
      return ['set', canonicalizeType(type.elementType)];
    case 'union':
      return ['union', type.types.map(canonicalizeType)];
    case 'date':
      return ['date'];
    case 'url':
      return ['url'];
    case 'arraybuffer':
      return ['arraybuffer'];
    case 'literal':
      if (typeof type.value === 'bigint') {
        return ['literal', ['bigint', type.value.toString()]];
      }
      return ['literal', type.value];
    default: {
      const _exhaustive: never = type;
      return _exhaustive;
    }
  }
}

function canonicalizeTypeParameters(
  params: PmtTypeParameter[]
): CanonicalTypeParam[] {
  return params.map((param) => [
    param.name,
    param.constraint ? canonicalizeType(param.constraint) : null,
  ]);
}

export function computeMessageTypeHash(message: PmtMessage): string {
  const wrapper: CanonicalWrapper = message.wrapper
    ? [
      message.wrapper.localName,
      message.wrapper.responseType
        ? canonicalizeType(message.wrapper.responseType)
        : null,
    ]
    : null;

  const properties: CanonicalProperty[] = message.properties.map((prop) => [
    prop.name,
    prop.fieldNumber,
    prop.optional,
    prop.readonly,
    canonicalizeType(prop.type),
  ]);

  const payload: CanonicalMessage = [
    HASH_VERSION,
    canonicalizeTypeParameters(message.typeParameters),
    wrapper,
    message.compact,
    message.compactTag ?? null,
    properties,
  ];

  const serialized = JSON.stringify(payload);
  const digest = createHash('sha256').update(serialized).digest('hex');
  return `sha256:${digest}`;
}
