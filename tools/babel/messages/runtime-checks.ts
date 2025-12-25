import * as t from '@babel/types';
import {
  getArrayElementType,
  getMapTypeArguments,
  getSetTypeArguments,
  isArrayBufferReference,
  isBrandReference,
  isDateReference,
  isImmutableArrayBufferReference,
  isImmutableDateReference,
  isImmutableUrlReference,
  isMapReference,
  isSetReference,
  isUrlReference,
} from './type-guards.js';
import { wrapImmutableType } from './properties.js';

/**
 * Build an instanceof check expression with proper type cast.
 * Casts valueId to 'object' first to handle 'unknown' typed values.
 */
function buildInstanceofCheck(
  valueId: t.Expression,
  className: string
): t.BinaryExpression {
  // Cast to 'object' to allow instanceof with 'unknown' typed values
  const castValueId = t.tsAsExpression(
    t.cloneNode(valueId),
    t.tsTypeReference(t.identifier('object'))
  );
  return t.binaryExpression('instanceof', castValueId, t.identifier(className));
}

export function buildRuntimeTypeCheckExpression(
  typeNode: t.TSType | null,
  valueId: t.Expression
): t.Expression | null {
  if (!typeNode) {
    return null;
  }

  if (t.isTSParenthesizedType(typeNode)) {
    return buildRuntimeTypeCheckExpression(
      typeNode.typeAnnotation,
      valueId
    );
  }

  if (t.isTSStringKeyword(typeNode)) {
    return typeofCheck(valueId, 'string');
  }

  if (t.isTSNumberKeyword(typeNode)) {
    return typeofCheck(valueId, 'number');
  }

  if (t.isTSBooleanKeyword(typeNode)) {
    return typeofCheck(valueId, 'boolean');
  }

  if (t.isTSBigIntKeyword(typeNode)) {
    return typeofCheck(valueId, 'bigint');
  }

  if (t.isTSNullKeyword(typeNode)) {
    return t.binaryExpression('===', valueId, t.nullLiteral());
  }

  if (t.isTSUndefinedKeyword(typeNode)) {
    return t.binaryExpression('===', valueId, t.identifier('undefined'));
  }

  if (t.isTSLiteralType(typeNode)) {
    return buildLiteralTypeCheck(typeNode, valueId);
  }

  if (t.isTSUnionType(typeNode)) {
    const checks = typeNode.types
      .map((subType) =>
        buildRuntimeTypeCheckExpression(subType, valueId)
      )
      .filter(Boolean);

    if (!checks.length) {
      return null;
    }

    return checks.reduce((acc, expr) =>
      acc ? t.logicalExpression('||', acc, expr!) : expr!
    );
  }

  if (t.isTSArrayType(typeNode)) {
    return buildArrayTypeCheckExpression(typeNode, valueId);
  }

  if (t.isTSTypeReference(typeNode)) {
    if (
      isDateReference(typeNode)
      || isImmutableDateReference(typeNode)
    ) {
      return buildDateCheckExpression(valueId);
    }

    if (
      isUrlReference(typeNode)
      || isImmutableUrlReference(typeNode)
    ) {
      return buildUrlCheckExpression(valueId);
    }

    if (
      isArrayBufferReference(typeNode)
      || isImmutableArrayBufferReference(typeNode)
    ) {
      return buildArrayBufferCheckExpression(valueId);
    }

    if (isBrandReference(typeNode)) {
      return typeofCheck(valueId, 'string');
    }

    if (isMapReference(typeNode)) {
      return buildMapTypeCheckExpression(typeNode, valueId);
    }

    if (isSetReference(typeNode)) {
      return buildSetTypeCheckExpression(typeNode, valueId);
    }

    if (
      t.isIdentifier(typeNode.typeName)
      && (typeNode.typeName.name === 'Array'
        || typeNode.typeName.name === 'ReadonlyArray'
        || typeNode.typeName.name === 'ImmutableArray')
    ) {
      const elementParam = typeNode.typeParameters?.params?.[0];
      const syntheticArray = t.tsArrayType(
        wrapImmutableType(
          elementParam ? t.cloneNode(elementParam) : t.tsUnknownKeyword()
        )
      );
      return buildArrayTypeCheckExpression(syntheticArray, valueId);
    }

    return null;
  }

  if (t.isTSTypeLiteral(typeNode)) {
    return buildTypeLiteralCheckExpression(typeNode, valueId);
  }

  return null;
}

export function typeofCheck(
  valueId: t.Expression,
  type: string
): t.Expression {
  return t.binaryExpression(
    '===',
    t.unaryExpression('typeof', valueId),
    t.stringLiteral(type)
  );
}

export function buildDateCheckExpression(
  valueId: t.Expression
): t.Expression {
  const instanceOfDate = buildInstanceofCheck(valueId, 'Date');
  const instanceOfImmutableDate = buildInstanceofCheck(valueId, 'ImmutableDate');

  return t.logicalExpression('||', instanceOfDate, instanceOfImmutableDate);
}

export function buildUrlCheckExpression(valueId: t.Expression): t.Expression {
  const instanceOfUrl = buildInstanceofCheck(valueId, 'URL');
  const instanceOfImmutableUrl = buildInstanceofCheck(valueId, 'ImmutableUrl');

  return t.logicalExpression('||', instanceOfUrl, instanceOfImmutableUrl);
}

export function buildArrayBufferCheckExpression(
  valueId: t.Expression
): t.Expression {
  const instanceOfArrayBuffer = buildInstanceofCheck(valueId, 'ArrayBuffer');
  const instanceOfImmutableArrayBuffer = buildInstanceofCheck(valueId, 'ImmutableArrayBuffer');

  return t.logicalExpression(
    '||',
    instanceOfArrayBuffer,
    instanceOfImmutableArrayBuffer
  );
}

export function buildLiteralTypeCheck(
  typeNode: t.TSLiteralType,
  valueId: t.Expression
): t.Expression | null {
  const literal = typeNode.literal;

  if (t.isStringLiteral(literal)) {
    return t.binaryExpression(
      '===',
      valueId,
      t.stringLiteral(literal.value)
    );
  }

  if (t.isNumericLiteral(literal)) {
    return t.binaryExpression(
      '===',
      valueId,
      t.numericLiteral(literal.value)
    );
  }

  if (t.isBooleanLiteral(literal)) {
    return t.binaryExpression(
      '===',
      valueId,
      t.booleanLiteral(literal.value)
    );
  }

  if (t.isBigIntLiteral(literal)) {
    return t.binaryExpression(
      '===',
      valueId,
      t.bigIntLiteral(literal.value)
    );
  }

  return null;
}

export function buildMapTypeCheckExpression(
  typeNode: t.TSTypeReference,
  valueId: t.Expression
): t.Expression {
  const immutableInstanceCheck = buildInstanceofCheck(valueId, 'ImmutableMap');
  const mapInstanceCheck = buildInstanceofCheck(valueId, 'Map');
  const baseCheck = t.logicalExpression('||', immutableInstanceCheck, mapInstanceCheck);

  const mapArgs = getMapTypeArguments(typeNode);

  if (!mapArgs) {
    return baseCheck;
  }

  const keyId = t.identifier('mapKey');
  const valueElementId = t.identifier('mapValue');

  const keyCheck = buildRuntimeTypeCheckExpression(
    mapArgs.keyType,
    keyId
  );
  const valueCheck = buildRuntimeTypeCheckExpression(
    mapArgs.valueType,
    valueElementId
  );

  let predicate: t.Expression | null = null;

  if (keyCheck) {
    predicate = keyCheck;
  }

  if (valueCheck) {
    predicate = predicate
      ? t.logicalExpression('&&', predicate, valueCheck)
      : valueCheck;
  }

  if (!predicate) {
    return baseCheck;
  }

  // Cast valueId to ReadonlyMap to call .entries() - TypeScript doesn't narrow
  // the type even after the instanceof check in the && chain
  const valueAsMap = t.tsAsExpression(
    t.cloneNode(valueId),
    t.tsTypeReference(
      t.identifier('ReadonlyMap'),
      t.tsTypeParameterInstantiation([
        t.tsUnknownKeyword(), t.tsUnknownKeyword()
      ])
    )
  );

  const entriesArray = t.arrayExpression([
    t.spreadElement(
      t.callExpression(
        t.memberExpression(valueAsMap, t.identifier('entries')),
        []
      )
    ),
  ]);

  const everyCall = t.callExpression(
    t.memberExpression(entriesArray, t.identifier('every')),
    [
      t.arrowFunctionExpression(
        [t.arrayPattern([keyId, valueElementId])],
        predicate
      ),
    ]
  );

  return t.logicalExpression('&&', baseCheck, everyCall);
}

export function buildSetTypeCheckExpression(
  typeNode: t.TSTypeReference,
  valueId: t.Expression
): t.Expression {
  const immutableInstanceCheck = buildInstanceofCheck(valueId, 'ImmutableSet');
  const setInstanceCheck = buildInstanceofCheck(valueId, 'Set');
  const baseCheck = t.logicalExpression('||', immutableInstanceCheck, setInstanceCheck);

  const elementType = getSetTypeArguments(typeNode);
  if (!elementType) {
    return baseCheck;
  }

  const elementId = t.identifier('setValue');
  const elementCheck = buildRuntimeTypeCheckExpression(
    elementType,
    elementId
  );
  if (
    !elementCheck
    || t.isBooleanLiteral(elementCheck, { value: true })
  ) {
    return baseCheck;
  }

  // Cast valueId to Iterable for the spread - TypeScript doesn't narrow
  // the type even after the instanceof check in the && chain
  const valueAsIterable = t.tsAsExpression(
    t.cloneNode(valueId),
    t.tsTypeReference(
      t.identifier('Iterable'),
      t.tsTypeParameterInstantiation([t.tsUnknownKeyword()])
    )
  );
  const valuesArray = t.arrayExpression([t.spreadElement(valueAsIterable)]);

  return t.logicalExpression(
    '&&',
    baseCheck,
    t.callExpression(
      t.memberExpression(valuesArray, t.identifier('every')),
      [t.arrowFunctionExpression([elementId], elementCheck)]
    )
  );
}

export function buildArrayTypeCheckExpression(
  typeNode: t.TSArrayType | t.TSTypeReference,
  valueId: t.Expression
): t.Expression {
  const immutableInstanceCheck = buildInstanceofCheck(valueId, 'ImmutableArray');
  const arrayInstanceCheck = t.callExpression(
    t.memberExpression(
      t.identifier('Array'),
      t.identifier('isArray')
    ),
    [t.cloneNode(valueId)]
  );
  const baseCheck = t.logicalExpression('||', immutableInstanceCheck, arrayInstanceCheck);

  const elementId = t.identifier('element');
  const elementCheck = buildRuntimeTypeCheckExpression(
    getArrayElementType(typeNode),
    elementId
  );

  if (
    !elementCheck
    || t.isBooleanLiteral(elementCheck, { value: true })
  ) {
    return baseCheck;
  }

  // Cast valueId to Iterable for the spread - TypeScript doesn't narrow
  // the type even after the instanceof/isArray check in the && chain
  const valueAsIterable = t.tsAsExpression(
    t.cloneNode(valueId),
    t.tsTypeReference(
      t.identifier('Iterable'),
      t.tsTypeParameterInstantiation([t.tsUnknownKeyword()])
    )
  );

  return t.logicalExpression(
    '&&',
    baseCheck,
    t.callExpression(
      t.memberExpression(
        t.arrayExpression([t.spreadElement(valueAsIterable)]),
        t.identifier('every')
      ),
      [t.arrowFunctionExpression([elementId], elementCheck)]
    )
  );
}

export function typeAllowsNull(typeNode: t.TSType | null): boolean {
  if (!typeNode) {
    return false;
  }

  if (t.isTSParenthesizedType(typeNode)) {
    return typeAllowsNull(typeNode.typeAnnotation);
  }

  if (t.isTSNullKeyword(typeNode)) {
    return true;
  }

  if (t.isTSUnionType(typeNode)) {
    return typeNode.types.some((subType) => typeAllowsNull(subType));
  }

  return false;
}

export function buildNonNullObjectCheck(
  valueId: t.Expression
): t.Expression {
  return t.logicalExpression(
    '&&',
    typeofCheck(valueId, 'object'),
    t.binaryExpression('!==', valueId, t.nullLiteral())
  );
}

export function buildTypeLiteralCheckExpression(
  typeLiteral: t.TSTypeLiteral,
  valueId: t.Expression
): t.Expression {
  const baseCheck = buildNonNullObjectCheck(valueId);

  // Cast valueId to Record<string, unknown> to allow property access
  // after the typeof === "object" check
  const valueAsRecord = t.tsAsExpression(
    t.cloneNode(valueId),
    t.tsTypeReference(
      t.identifier('Record'),
      t.tsTypeParameterInstantiation([t.tsStringKeyword(), t.tsUnknownKeyword()])
    )
  );

  const propertyChecks = typeLiteral.members.map((member) => {
    if (
      !t.isTSPropertySignature(member)
      || !member.typeAnnotation
      || !t.isTSType(member.typeAnnotation.typeAnnotation)
    ) {
      return null;
    }

    if (!t.isIdentifier(member.key)) {
      return null;
    }

    // Use bracket notation for Record<string, unknown> to satisfy noPropertyAccessFromIndexSignature
    const propertyValue = t.memberExpression(
      valueAsRecord,
      t.stringLiteral(member.key.name),
      true // computed = true for bracket notation
    );

    const typeCheck = buildRuntimeTypeCheckExpression(
      member.typeAnnotation.typeAnnotation,
      propertyValue
    );

    if (member.optional) {
      if (!typeCheck) {
        return null;
      }

      return t.logicalExpression(
        '||',
        t.binaryExpression(
          '===',
          propertyValue,
          t.identifier('undefined')
        ),
        typeCheck
      );
    }

    const definedCheck = t.binaryExpression(
      '!==',
      propertyValue,
      t.identifier('undefined')
    );

    if (!typeCheck) {
      return definedCheck;
    }

    return t.logicalExpression('&&', definedCheck, typeCheck);
  }).filter(Boolean) as t.Expression[];

  if (!propertyChecks.length) {
    return baseCheck;
  }

  const combinedChecks = propertyChecks.reduce((acc, expr) =>
    t.logicalExpression('&&', acc, expr)
  );

  return t.logicalExpression('&&', baseCheck, combinedChecks);
}
