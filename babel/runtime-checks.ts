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
      acc ? t.logicalExpression('||', acc, expr) : expr
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
          elementParam ? t.cloneNode(elementParam) : t.tsAnyKeyword()
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
  const instanceOfDate = t.binaryExpression(
    'instanceof',
    valueId,
    t.identifier('Date')
  );
  const instanceOfImmutableDate = t.binaryExpression(
    'instanceof',
    valueId,
    t.identifier('ImmutableDate')
  );

  const objectToStringCall = buildObjectToStringCall(valueId);

  const tagEqualsDate = t.binaryExpression(
    '===',
    objectToStringCall,
    t.stringLiteral('[object Date]')
  );

  const tagEqualsImmutableDate = t.binaryExpression(
    '===',
    objectToStringCall,
    t.stringLiteral('[object ImmutableDate]')
  );

  return t.logicalExpression(
    '||',
    t.logicalExpression('||', instanceOfDate, instanceOfImmutableDate),
    t.logicalExpression('||', tagEqualsDate, tagEqualsImmutableDate)
  );
}

export function buildUrlCheckExpression(valueId: t.Expression): t.Expression {
  const instanceOfUrl = t.binaryExpression(
    'instanceof',
    valueId,
    t.identifier('URL')
  );
  const instanceOfImmutableUrl = t.binaryExpression(
    'instanceof',
    valueId,
    t.identifier('ImmutableUrl')
  );

  const objectToStringCall = buildObjectToStringCall(valueId);

  const tagEqualsUrl = t.binaryExpression(
    '===',
    objectToStringCall,
    t.stringLiteral('[object URL]')
  );

  const tagEqualsImmutableUrl = t.binaryExpression(
    '===',
    objectToStringCall,
    t.stringLiteral('[object ImmutableUrl]')
  );

  return t.logicalExpression(
    '||',
    t.logicalExpression('||', instanceOfUrl, instanceOfImmutableUrl),
    t.logicalExpression('||', tagEqualsUrl, tagEqualsImmutableUrl)
  );
}

export function buildArrayBufferCheckExpression(
  valueId: t.Expression
): t.Expression {
  const instanceOfArrayBuffer = t.binaryExpression(
    'instanceof',
    valueId,
    t.identifier('ArrayBuffer')
  );
  const instanceOfImmutableArrayBuffer = t.binaryExpression(
    'instanceof',
    valueId,
    t.identifier('ImmutableArrayBuffer')
  );

  const tagEqualsArrayBuffer = t.binaryExpression(
    '===',
    buildObjectToStringCall(valueId),
    t.stringLiteral('[object ArrayBuffer]')
  );
  const tagEqualsImmutableArrayBuffer = t.binaryExpression(
    '===',
    buildObjectToStringCall(valueId),
    t.stringLiteral('[object ImmutableArrayBuffer]')
  );

  return t.logicalExpression(
    '||',
    t.logicalExpression(
      '||',
      instanceOfArrayBuffer,
      instanceOfImmutableArrayBuffer
    ),
    t.logicalExpression(
      '||',
      tagEqualsArrayBuffer,
      tagEqualsImmutableArrayBuffer
    )
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
  const immutableInstanceCheck = t.binaryExpression(
    'instanceof',
    valueId,
    t.identifier('ImmutableMap')
  );
  const immutableTagCheck = buildMapTagComparison(
    valueId,
    '[object ImmutableMap]'
  );
  const immutableCheck = t.logicalExpression(
    '||',
    immutableInstanceCheck,
    immutableTagCheck
  );
  const mapInstanceCheck = t.binaryExpression(
    'instanceof',
    valueId,
    t.identifier('Map')
  );
  const mapTagCheck = buildMapTagComparison(valueId, '[object Map]');
  const mapCheck = t.logicalExpression(
    '||',
    mapInstanceCheck,
    mapTagCheck
  );
  const baseCheck = t.logicalExpression('||', immutableCheck, mapCheck);

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

  const entriesArray = t.arrayExpression([
    t.spreadElement(
      t.callExpression(
        t.memberExpression(valueId, t.identifier('entries')),
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
  const immutableInstanceCheck = t.binaryExpression(
    'instanceof',
    valueId,
    t.identifier('ImmutableSet')
  );
  const immutableTagCheck = buildSetTagComparison(
    valueId,
    '[object ImmutableSet]'
  );
  const immutableCheck = t.logicalExpression(
    '||',
    immutableInstanceCheck,
    immutableTagCheck
  );
  const setInstanceCheck = t.binaryExpression(
    'instanceof',
    valueId,
    t.identifier('Set')
  );
  const setTagCheck = buildSetTagComparison(valueId, '[object Set]');
  const setCheck = t.logicalExpression(
    '||',
    setInstanceCheck,
    setTagCheck
  );
  const baseCheck = t.logicalExpression('||', immutableCheck, setCheck);

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

  const valuesArray = t.arrayExpression([t.spreadElement(valueId)]);

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
  const immutableInstanceCheck = t.binaryExpression(
    'instanceof',
    valueId,
    t.identifier('ImmutableArray')
  );
  const immutableTagCheck = buildSetTagComparison(
    valueId,
    '[object ImmutableArray]'
  );
  const arrayInstanceCheck = t.callExpression(
    t.memberExpression(
      t.identifier('Array'),
      t.identifier('isArray')
    ),
    [valueId]
  );
  const baseCheck = t.logicalExpression(
    '||',
    immutableInstanceCheck,
    t.logicalExpression(
      '||',
      immutableTagCheck,
      arrayInstanceCheck
    )
  );

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

  return t.logicalExpression(
    '&&',
    baseCheck,
    t.callExpression(
      t.memberExpression(
        t.arrayExpression([t.spreadElement(valueId)]),
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

    const propertyValue = t.memberExpression(
      valueId,
      t.identifier(member.key.name)
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

export function buildMapTagComparison(
  valueExpr: t.Expression,
  tag: string
): t.Expression {
  return t.binaryExpression(
    '===',
    buildObjectToStringCall(valueExpr),
    t.stringLiteral(tag)
  );
}

export function buildSetTagComparison(
  valueExpr: t.Expression,
  tag: string
): t.Expression {
  return t.binaryExpression(
    '===',
    buildObjectToStringCall(valueExpr),
    t.stringLiteral(tag)
  );
}

export function buildObjectToStringCall(
  valueExpr: t.Expression
): t.CallExpression {
  return t.callExpression(
    t.memberExpression(
      t.memberExpression(
        t.memberExpression(
          t.identifier('Object'),
          t.identifier('prototype')
        ),
        t.identifier('toString')
      ),
      t.identifier('call')
    ),
    [t.cloneNode(valueExpr)]
  );
}
