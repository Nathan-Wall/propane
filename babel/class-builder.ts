import * as t from '@babel/types';
import { capitalize } from './utils';
import {
  buildInputAcceptingMutable,
  getDefaultValue,
  PropDescriptor,
  wrapImmutableType,
} from './properties';
import {
  typeAllowsNull,
  buildRuntimeTypeCheckExpression,
} from './runtime-checks';
import {
  buildImmutableArrayBufferNormalizationExpression,
  buildImmutableArrayExpression,
  buildImmutableArrayOfMessagesExpression,
  buildImmutableDateNormalizationExpression,
  buildImmutableMapExpression,
  buildImmutableMapOfMessagesExpression,
  buildImmutableMapWithConversionsExpression,
  buildImmutableSetExpression,
  buildImmutableSetOfMessagesExpression,
  buildImmutableUrlNormalizationExpression,
  buildMessageNormalizationExpression,
  MapConversionInfo,
} from './normalizers';
import { getTypeName, isDateReference, isUrlReference } from './type-guards';

function getMapConversionInfo(prop: PropDescriptor, declaredMessageTypeNames: Set<string>): MapConversionInfo {
  const conversions: MapConversionInfo = {};

  // Check key type
  if (prop.mapKeyType && t.isTSTypeReference(prop.mapKeyType)) {
    if (isDateReference(prop.mapKeyType)) {
      conversions.keyIsDate = true;
    } else if (isUrlReference(prop.mapKeyType)) {
      conversions.keyIsUrl = true;
    } else {
      const keyTypeName = getTypeName(prop.mapKeyType);
      if (keyTypeName && declaredMessageTypeNames.has(keyTypeName)) {
        conversions.keyIsMessage = keyTypeName;
      }
    }
  }

  // Check value type
  if (prop.mapValueType && t.isTSTypeReference(prop.mapValueType)) {
    if (isDateReference(prop.mapValueType)) {
      conversions.valueIsDate = true;
    } else if (isUrlReference(prop.mapValueType)) {
      conversions.valueIsUrl = true;
    } else {
      const valueTypeName = getTypeName(prop.mapValueType);
      if (valueTypeName && declaredMessageTypeNames.has(valueTypeName)) {
        conversions.valueIsMessage = valueTypeName;
      }
    }
  }

  return conversions;
}

function needsMapConversions(conversions: MapConversionInfo): boolean {
  return Boolean(
    conversions.keyIsDate || conversions.keyIsUrl || conversions.keyIsMessage
    || conversions.valueIsDate || conversions.valueIsUrl || conversions.valueIsMessage
  );
}

export function buildClassFromProperties(
  typeName: string,
  properties: PropDescriptor[],
  declaredMessageTypeNames: Set<string>
): t.ClassDeclaration {
  const backingFields: t.ClassPrivateProperty[] = [];
  const getters: t.ClassMethod[] = [];
  const propDescriptors = properties.map((prop) => ({
    ...prop,
    privateName: t.privateName(t.identifier(prop.name)),
  }));
  const propsTypeRef = t.tsTypeReference(
    t.tsQualifiedName(t.identifier(typeName), t.identifier('Data'))
  );
  const valueTypeRef = t.tsTypeReference(
    t.tsQualifiedName(t.identifier(typeName), t.identifier('Value'))
  );

  for (const prop of propDescriptors) {
    let baseType = wrapImmutableType(t.cloneNode(prop.typeAnnotation)) as t.TSType;

    const needsOptionalUnion = prop.optional && (prop.isArray || prop.isMap || prop.isSet || prop.isArrayBufferType);
    const fieldTypeAnnotation = needsOptionalUnion
      ? t.tsUnionType([baseType, t.tsUndefinedKeyword()])
      : baseType;

    const field = t.classPrivateProperty(t.cloneNode(prop.privateName));
    field.typeAnnotation = t.tsTypeAnnotation(fieldTypeAnnotation);
    backingFields.push(field);

    const getter = t.classMethod(
      'get',
      t.identifier(prop.name),
      [],
      t.blockStatement([
        t.returnStatement(
          t.memberExpression(t.thisExpression(), t.cloneNode(prop.privateName))
        ),
      ])
    );

    const getterReturnType = needsOptionalUnion
      ? t.tsUnionType([baseType, t.tsUndefinedKeyword()])
      : baseType;

    getter.returnType = t.tsTypeAnnotation(getterReturnType);
    getters.push(getter);
  }

  if (propDescriptors.length === 0) {
    return t.classMethod(
      'constructor',
      t.identifier('constructor'),
      [],
      t.blockStatement([
        t.expressionStatement(
          t.callExpression(t.super(), [
            t.memberExpression(
              t.identifier(typeName),
              t.identifier('TYPE_TAG')
            ),
          ])
        ),
      ])
    ) as unknown as t.ClassDeclaration; // Note: unreachable path in current usage
  }

  const constructorParam = t.identifier('props');
  constructorParam.typeAnnotation = t.tsTypeAnnotation(
    t.cloneNode(valueTypeRef)
  );
  constructorParam.optional = true;

  const constructorAssignments = propDescriptors.map((prop) => {
    const propsAccess = t.memberExpression(
      t.identifier('props'),
      t.identifier(prop.name)
    );

    let valueExpr: t.Expression = t.cloneNode(propsAccess);

    if (prop.isArray) {
      const elementTypeName = getTypeName(prop.arrayElementType as t.TSType);
      valueExpr = elementTypeName && declaredMessageTypeNames.has(elementTypeName)
        ? buildImmutableArrayOfMessagesExpression(propsAccess, elementTypeName)
        : buildImmutableArrayExpression(propsAccess);
    } else if (prop.isMap) {
      const conversions = getMapConversionInfo(prop, declaredMessageTypeNames);
      if (needsMapConversions(conversions)) {
        valueExpr = buildImmutableMapWithConversionsExpression(propsAccess, conversions);
      } else {
        valueExpr = buildImmutableMapExpression(propsAccess);
      }
    } else if (prop.isSet) {
      const elementTypeName = getTypeName(prop.setElementType as t.TSType);
      valueExpr = elementTypeName && declaredMessageTypeNames.has(elementTypeName)
        ? buildImmutableSetOfMessagesExpression(propsAccess, elementTypeName)
        : buildImmutableSetExpression(propsAccess);
    } else if (prop.isDateType) {
      valueExpr = buildImmutableDateNormalizationExpression(
        valueExpr,
        {
          allowUndefined: Boolean(prop.optional),
          allowNull: typeAllowsNull(prop.typeAnnotation),
        }
      );
    } else if (prop.isUrlType) {
      valueExpr = buildImmutableUrlNormalizationExpression(
        valueExpr,
        {
          allowUndefined: Boolean(prop.optional),
          allowNull: typeAllowsNull(prop.typeAnnotation),
        }
      );
    } else if (prop.isArrayBufferType) {
      valueExpr = buildImmutableArrayBufferNormalizationExpression(
        valueExpr,
        {
          allowUndefined: Boolean(prop.optional),
          allowNull: typeAllowsNull(prop.typeAnnotation),
        }
      );
    }

    if (prop.isMessageType && prop.messageTypeName) {
      valueExpr = buildMessageNormalizationExpression(
        valueExpr,
        prop.messageTypeName,
        {
          allowUndefined: Boolean(prop.optional),
          allowNull: typeAllowsNull(prop.typeAnnotation),
        }
      );
    }

    const defaultValue = getDefaultValue(prop);
    const assignment = t.assignmentExpression(
      '=',
      t.memberExpression(
        t.thisExpression(),
        t.cloneNode(prop.privateName)
      ),
      t.conditionalExpression(
        t.identifier('props'),
        valueExpr,
        defaultValue
      )
    );

    return t.expressionStatement(assignment);
  });

  const memoizationCheck = t.ifStatement(
    t.logicalExpression(
      '&&',
      t.unaryExpression('!', t.identifier('props')),
      t.memberExpression(t.identifier(typeName), t.identifier('EMPTY'))
    ),
    t.returnStatement(
      t.memberExpression(t.identifier(typeName), t.identifier('EMPTY'))
    )
  );

  const memoizationSet = t.ifStatement(
    t.unaryExpression('!', t.identifier('props')),
    t.expressionStatement(
      t.assignmentExpression(
        '=',
        t.memberExpression(t.identifier(typeName), t.identifier('EMPTY')),
        t.thisExpression()
      )
    )
  );

  const constructor = t.classMethod(
    'constructor',
    t.identifier('constructor'),
    [constructorParam],
    t.blockStatement([
      memoizationCheck,
      t.expressionStatement(
        t.callExpression(t.super(), [
          t.memberExpression(
            t.identifier(typeName),
            t.identifier('TYPE_TAG')
          ),
        ])
      ),
      ...constructorAssignments,
      memoizationSet,
    ])
  );

  const staticFields = [
    t.classProperty(
      t.identifier('TYPE_TAG'),
      t.callExpression(t.identifier('Symbol'), [t.stringLiteral(typeName)]),
      null,
      null,
      false,
      true
    ),
    t.classProperty(
      t.identifier('EMPTY'),
      null,
      t.tsTypeAnnotation(
        t.tsTypeReference(t.identifier(typeName))
      ),
      null,
      false,
      true
    ),
  ];

  const fromEntriesMethod = buildFromEntriesMethod(propDescriptors, propsTypeRef, declaredMessageTypeNames);
  const descriptorMethod = buildDescriptorMethod(propDescriptors, propsTypeRef);

  const setterMethods = propDescriptors.map((prop) =>
    buildSetterMethod(typeName, propDescriptors, prop, declaredMessageTypeNames)
  );
  const deleteMethods = propDescriptors
    .filter((prop) => prop.optional)
    .map((prop) => buildDeleteMethod(typeName, propDescriptors, prop));
  const arrayMethods = buildArrayMutatorMethods(
    typeName,
    propDescriptors
  );
  const mapMethods = buildMapMutatorMethods(
    typeName,
    propDescriptors
  );
  const setMethods = buildSetMutatorMethods(
    typeName,
    propDescriptors
  );

  const classBody = t.classBody([
    ...staticFields,
    ...backingFields,
    constructor,
    descriptorMethod,
    fromEntriesMethod,
    ...getters,
    ...[
      ...setterMethods,
      ...deleteMethods,
      ...arrayMethods,
      ...mapMethods,
      ...setMethods,
    ].toSorted((a, b) => {
      const nameA = (a.key as t.Identifier).name;
      const nameB = (b.key as t.Identifier).name;
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    }),
  ]);

  const classDecl = t.classDeclaration(
    t.identifier(typeName),
    t.identifier('Message'),
    classBody,
    []
  );

  classDecl.superTypeParameters = t.tsTypeParameterInstantiation([
    t.cloneNode(propsTypeRef),
  ]);

  return classDecl;
}

function buildPropsObjectExpression(
  propDescriptors: (PropDescriptor & { privateName: t.PrivateName })[],
  targetProp: PropDescriptor & { privateName: t.PrivateName },
  valueExpr: t.Expression,
  { omitTarget = false }: { omitTarget?: boolean } = {}
): t.ObjectExpression {
  return t.objectExpression(
    propDescriptors
      .filter((prop) => !(omitTarget && prop === targetProp))
      .map((prop) =>
        t.objectProperty(
          t.identifier(prop.name),
          prop === targetProp
            ? t.cloneNode(valueExpr)
            : t.memberExpression(
              t.thisExpression(),
              t.cloneNode(prop.privateName)
            )
        )
      )
  );
}

function buildDescriptorMethod(propDescriptors: (PropDescriptor & { privateName: t.PrivateName })[], propsTypeRef: t.TSTypeReference): t.ClassMethod {
  const descriptorEntries = propDescriptors.map((prop) =>
    t.objectExpression([
      t.objectProperty(t.identifier('name'), t.stringLiteral(prop.name)),
      t.objectProperty(
        t.identifier('fieldNumber'),
        prop.fieldNumber === null
          ? t.nullLiteral()
          : t.numericLiteral(prop.fieldNumber)
      ),
      t.objectProperty(
        t.identifier('getValue'),
        t.arrowFunctionExpression(
          [],
          t.memberExpression(t.thisExpression(), t.cloneNode(prop.privateName))
        )
      ),
    ])
  );

  const body = t.blockStatement([
    t.returnStatement(t.arrayExpression(descriptorEntries)),
  ]);

  const method = t.classMethod(
    'method',
    t.identifier('$getPropDescriptors'),
    [],
    body
  );

  method.accessibility = 'protected';

  method.returnType = t.tsTypeAnnotation(
    t.tsArrayType(
      t.tsTypeReference(
        t.identifier('MessagePropDescriptor'),
        t.tsTypeParameterInstantiation([t.cloneNode(propsTypeRef)])
      )
    )
  );

  return method;
}

function buildFromEntriesMethod(propDescriptors: (PropDescriptor & { privateName: t.PrivateName })[], propsTypeRef: t.TSTypeReference, declaredMessageTypeNames: Set<string>): t.ClassMethod {
  const argsId = t.identifier('entries');
  argsId.typeAnnotation = t.tsTypeAnnotation(
    t.tsTypeReference(
      t.identifier('Record'),
      t.tsTypeParameterInstantiation([t.tsStringKeyword(), t.tsUnknownKeyword()])
    )
  );
  const propsId = t.identifier('props');

  const statements: t.Statement[] = [
    t.variableDeclaration('const', [
      t.variableDeclarator(
        propsId,
        t.tsAsExpression(
          t.objectExpression([]),
          t.tsTypeReference(
            t.identifier('Partial'),
            t.tsTypeParameterInstantiation([t.cloneNode(propsTypeRef)])
          )
        )
      ),
    ]),
  ];

  for (const prop of propDescriptors) {
    const valueId = t.identifier(`${prop.name}Value`);
    const valueExpr = buildEntryAccessExpression(prop, argsId);
    statements.push(
      t.variableDeclaration('const', [
        t.variableDeclarator(valueId, valueExpr),
      ])
    );

    const undefinedCheck = t.binaryExpression(
      '===',
      valueId,
      t.identifier('undefined')
    );

    if (!prop.optional) {
      statements.push(
        t.ifStatement(
          undefinedCheck,
          buildErrorThrow(`Missing required property "${prop.name}".`)
        )
      );
    }

    const allowsNull = typeAllowsNull(prop.typeAnnotation);
    const normalizedValueId =
      prop.optional && !allowsNull
        ? t.identifier(`${prop.name}Normalized`)
        : valueId;

    if (prop.optional && !allowsNull) {
      statements.push(
        t.variableDeclaration('const', [
          t.variableDeclarator(
            normalizedValueId,
            t.conditionalExpression(
              t.binaryExpression(
                '===',
                valueId,
                t.nullLiteral()
              ),
              t.identifier('undefined'),
              valueId
            )
          ),
        ])
      );
    }

    let checkedValueId: t.Identifier | t.Expression = normalizedValueId;

    if (prop.isMap) {
      const mapValueId = t.identifier(`${prop.name}MapValue`);
      const conversions = getMapConversionInfo(prop, declaredMessageTypeNames);
      const mapExpr = needsMapConversions(conversions)
        ? buildImmutableMapWithConversionsExpression(checkedValueId as t.Expression, conversions)
        : buildImmutableMapExpression(checkedValueId as t.Expression);
      statements.push(
        t.variableDeclaration('const', [
          t.variableDeclarator(mapValueId, mapExpr),
        ])
      );
      checkedValueId = mapValueId;
    } else if (prop.isSet) {
      const setValueId = t.identifier(`${prop.name}SetValue`);
      statements.push(
        t.variableDeclaration('const', [
          t.variableDeclarator(
            setValueId,
            buildImmutableSetExpression(checkedValueId as t.Expression)
          ),
        ])
      );
      checkedValueId = setValueId;
    } else if (prop.isArray) {
      const arrayValueId = t.identifier(`${prop.name}ArrayValue`);
      statements.push(
        t.variableDeclaration('const', [
          t.variableDeclarator(
            arrayValueId,
            buildImmutableArrayExpression(checkedValueId as t.Expression)
          ),
        ])
      );
      checkedValueId = arrayValueId;
    } else if (prop.isArrayBufferType) {
      const abValueId = t.identifier(`${prop.name}ArrayBufferValue`);
      statements.push(
        t.variableDeclaration('const', [
          t.variableDeclarator(
            abValueId,
            buildImmutableArrayBufferNormalizationExpression(
              checkedValueId as t.Expression,
              {
                allowUndefined: Boolean(prop.optional),
                allowNull: allowsNull,
              }
            )
          ),
        ])
      );
      checkedValueId = abValueId;
    } else if (prop.isMessageType && prop.messageTypeName) {
      const messageValueId = t.identifier(`${prop.name}MessageValue`);
      statements.push(
        t.variableDeclaration('const', [
          t.variableDeclarator(
            messageValueId,
            buildMessageNormalizationExpression(
              checkedValueId as t.Expression,
              prop.messageTypeName,
              {
                allowUndefined: Boolean(prop.optional),
                allowNull: allowsNull,
              }
            )
          ),
        ])
      );
      checkedValueId = messageValueId;
    }

    const typeCheckExpr = buildRuntimeTypeCheckExpression(
      prop.typeAnnotation,
      checkedValueId as t.Expression
    );

    if (typeCheckExpr && !t.isBooleanLiteral(typeCheckExpr, { value: true })) {
      const shouldValidate = prop.optional
        ? t.logicalExpression(
          '&&',
          t.binaryExpression(
            '!==',
            checkedValueId as t.Expression,
            t.identifier('undefined')
          ),
          t.unaryExpression('!', typeCheckExpr)
        )
        : t.unaryExpression('!', typeCheckExpr);

      statements.push(
        t.ifStatement(
          shouldValidate,
          buildErrorThrow(`Invalid value for property "${prop.name}".`)
        )
      );
    }

    statements.push(
      t.expressionStatement(
        t.assignmentExpression(
          '=',
          t.memberExpression(propsId, t.identifier(prop.name)),
          checkedValueId as t.Expression
        )
      )
    );
  }

  statements.push(
    t.returnStatement(
      t.tsAsExpression(
        propsId,
        t.cloneNode(propsTypeRef)
      )
    )
  );

  const body = t.blockStatement(statements);

  const method = t.classMethod(
    'method',
    t.identifier('$fromEntries'),
    [argsId],
    body
  );

  method.accessibility = 'protected';
  method.returnType = t.tsTypeAnnotation(t.cloneNode(propsTypeRef));

  return method;
}

function buildEntryAccessExpression(prop: PropDescriptor & { privateName: t.PrivateName }, entriesId: t.Identifier): t.Expression {
  const namedAccess = t.memberExpression(
    entriesId,
    t.stringLiteral(prop.name),
    true
  );

  if (prop.fieldNumber === null) {
    return namedAccess;
  }

  const numberedAccess = t.memberExpression(
    entriesId,
    t.stringLiteral(String(prop.fieldNumber)),
    true
  );

  return t.conditionalExpression(
    t.binaryExpression(
      '===',
      numberedAccess,
      t.identifier('undefined')
    ),
    namedAccess,
    numberedAccess
  );
}

function buildErrorThrow(message: string): t.ThrowStatement {
  return t.throwStatement(
    t.newExpression(t.identifier('Error'), [t.stringLiteral(message)])
  );
}

function buildSetterMethod(typeName: string, propDescriptors: (PropDescriptor & { privateName: t.PrivateName })[], targetProp: PropDescriptor & { privateName: t.PrivateName }, declaredMessageTypeNames: Set<string>): t.ClassMethod {
  const valueId = t.identifier('value');
  valueId.typeAnnotation = t.tsTypeAnnotation(
    t.cloneNode(targetProp.displayType || targetProp.inputTypeAnnotation)
  );

  let setterValueExpr: t.Expression = t.cloneNode(valueId);

  if (targetProp.isMap) {
    const conversions = getMapConversionInfo(targetProp, declaredMessageTypeNames);
    setterValueExpr = needsMapConversions(conversions)
      ? buildImmutableMapWithConversionsExpression(setterValueExpr, conversions)
      : buildImmutableMapExpression(setterValueExpr);
  } else if (targetProp.isSet) {
    setterValueExpr = buildImmutableSetExpression(setterValueExpr);
  }

  if (targetProp.isMessageType && targetProp.messageTypeName) {
    setterValueExpr = buildMessageNormalizationExpression(
      setterValueExpr,
      targetProp.messageTypeName,
      {
        allowUndefined: Boolean(targetProp.optional),
        allowNull: typeAllowsNull(targetProp.typeAnnotation),
      }
    );
  }

  const propsObject = buildPropsObjectExpression(
    propDescriptors,
    targetProp,
    setterValueExpr
  );

  const body = t.blockStatement([
    t.returnStatement(
      t.newExpression(t.identifier(typeName), [propsObject])
    ),
  ]);

  const methodName = `set${capitalize(targetProp.name)}`;
  const method = t.classMethod('method', t.identifier(methodName), [valueId], body);
  method.returnType = t.tsTypeAnnotation(
    t.tsTypeReference(t.identifier(typeName))
  );
  return method;
}

function buildDeleteMethod(typeName: string, propDescriptors: (PropDescriptor & { privateName: t.PrivateName })[], targetProp: PropDescriptor & { privateName: t.PrivateName }): t.ClassMethod {
  const propsObject = buildPropsObjectExpression(
    propDescriptors,
    targetProp,
    t.identifier('undefined'),
    { omitTarget: true }
  );

  const body = t.blockStatement([
    t.returnStatement(
      t.newExpression(t.identifier(typeName), [propsObject])
    ),
  ]);

  const methodName = `delete${capitalize(targetProp.name)}`;
  const method = t.classMethod('method', t.identifier(methodName), [], body);
  method.returnType = t.tsTypeAnnotation(
    t.tsTypeReference(t.identifier(typeName))
  );
  return method;
}

function buildArrayMutatorMethods(typeName: string, propDescriptors: (PropDescriptor & { privateName: t.PrivateName })[]): t.ClassMethod[] {
  const methods: t.ClassMethod[] = [];

  for (const prop of propDescriptors) {
    if (!prop.isArray || !prop.arrayElementType) {
      continue;
    }

    methods.push(
      buildArrayMutationMethod(
        typeName,
        propDescriptors,
        prop,
        `push${capitalize(prop.name)}`,
        [buildArrayValuesRestParam(prop)],
        () => [],
        {
          append: [t.spreadElement(t.identifier('values'))],
        }
      ),
      buildArrayMutationMethod(
        typeName,
        propDescriptors,
        prop,
        `pop${capitalize(prop.name)}`,
        [],
        (nextRef) => [
          t.expressionStatement(
            t.callExpression(
              t.memberExpression(nextRef(), t.identifier('pop')),
              []
            )
          ),
        ]
      ),
      buildArrayMutationMethod(
        typeName,
        propDescriptors,
        prop,
        `shift${capitalize(prop.name)}`,
        [],
        (nextRef) => [
          t.expressionStatement(
            t.callExpression(
              t.memberExpression(nextRef(), t.identifier('shift')),
              []
            )
          ),
        ]
      ),
      buildArrayMutationMethod(
        typeName,
        propDescriptors,
        prop,
        `unshift${capitalize(prop.name)}`,
        [buildArrayValuesRestParam(prop)],
        () => [],
        {
          prepend: [t.spreadElement(t.identifier('values'))],
        }
      ),
      buildSpliceMethod(typeName, propDescriptors, prop),
      buildArrayMutationMethod(
        typeName,
        propDescriptors,
        prop,
        `reverse${capitalize(prop.name)}`,
        [],
        (nextRef) => [
          t.expressionStatement(
            t.callExpression(
              t.memberExpression(nextRef(), t.identifier('reverse')),
              []
            )
          ),
        ]
      ),
      buildSortMethod(typeName, propDescriptors, prop),
      buildArrayMutationMethod(
        typeName,
        propDescriptors,
        prop,
        `fill${capitalize(prop.name)}`,
        buildFillParams(prop),
        (nextRef) => [
          t.expressionStatement(
            t.callExpression(
              t.memberExpression(nextRef(), t.identifier('fill')),
              [
                t.identifier('value'),
                t.identifier('start'),
                t.identifier('end'),
              ]
            )
          ),
        ]
      ),
      buildArrayMutationMethod(
        typeName,
        propDescriptors,
        prop,
        `copyWithin${capitalize(prop.name)}`,
        buildCopyWithinParams(),
        (nextRef) => [
          t.expressionStatement(
            t.callExpression(
              t.memberExpression(nextRef(), t.identifier('copyWithin')),
              [
                t.identifier('target'),
                t.identifier('start'),
                t.identifier('end'),
              ]
            )
          ),
        ]
      )
    );
  }

  return methods;
}

function buildArrayValuesRestParam(prop: PropDescriptor): t.RestElement {
  const valuesId = t.identifier('values');
  valuesId.typeAnnotation = t.tsTypeAnnotation(
    t.tsArrayType(t.cloneNode(prop.arrayElementType!))
  );
  return t.restElement(valuesId);
}

function buildFillParams(prop: PropDescriptor): t.Identifier[] {
  const valueId = t.identifier('value');
  valueId.typeAnnotation = t.tsTypeAnnotation(
    t.cloneNode(prop.arrayElementType!)
  );
  const startId = t.identifier('start');
  startId.typeAnnotation = t.tsTypeAnnotation(t.tsNumberKeyword());
  startId.optional = true;
  const endId = t.identifier('end');
  endId.typeAnnotation = t.tsTypeAnnotation(t.tsNumberKeyword());
  endId.optional = true;
  return [valueId, startId, endId];
}

function buildCopyWithinParams(): t.Identifier[] {
  const targetId = t.identifier('target');
  targetId.typeAnnotation = t.tsTypeAnnotation(t.tsNumberKeyword());
  const startId = t.identifier('start');
  startId.typeAnnotation = t.tsTypeAnnotation(t.tsNumberKeyword());
  const endId = t.identifier('end');
  endId.typeAnnotation = t.tsTypeAnnotation(t.tsNumberKeyword());
  endId.optional = true;
  return [targetId, startId, endId];
}

function buildSortMethod(typeName: string, propDescriptors: (PropDescriptor & { privateName: t.PrivateName })[], prop: PropDescriptor & { privateName: t.PrivateName }): t.ClassMethod {
  const compareId = t.identifier('compareFn');
  const firstParam = t.identifier('a');
  firstParam.typeAnnotation = t.tsTypeAnnotation(
    t.cloneNode(prop.arrayElementType!)
  );
  const secondParam = t.identifier('b');
  secondParam.typeAnnotation = t.tsTypeAnnotation(
    t.cloneNode(prop.arrayElementType!)
  );
  const compareType = t.tsFunctionType(
    null,
    [firstParam, secondParam],
    t.tsTypeAnnotation(t.tsNumberKeyword())
  );
  compareId.typeAnnotation = t.tsTypeAnnotation(compareType);
  compareId.optional = true;

  return buildArrayMutationMethod(
    typeName,
    propDescriptors,
    prop,
    `sort${capitalize(prop.name)}`,
    [compareId],
    (nextRef) => [
      t.expressionStatement(
        t.callExpression(
          t.memberExpression(nextRef(), t.identifier('sort')),
          [t.identifier('compareFn')]
        )
      ),
    ]
  );
}

function buildSpliceMethod(typeName: string, propDescriptors: (PropDescriptor & { privateName: t.PrivateName })[], prop: PropDescriptor & { privateName: t.PrivateName }): t.ClassMethod {
  const startId = t.identifier('start');
  startId.typeAnnotation = t.tsTypeAnnotation(t.tsNumberKeyword());
  const deleteCountId = t.identifier('deleteCount');
  deleteCountId.typeAnnotation = t.tsTypeAnnotation(t.tsNumberKeyword());
  deleteCountId.optional = true;
  const itemsId = t.identifier('items');
  itemsId.typeAnnotation = t.tsTypeAnnotation(
    t.tsArrayType(t.cloneNode(prop.arrayElementType!))
  );
  const itemsParam = t.restElement(itemsId);

  return buildArrayMutationMethod(
    typeName,
    propDescriptors,
    prop,
    `splice${capitalize(prop.name)}`,
    [startId, deleteCountId, itemsParam],
    (nextRef) => {
      const argsId = t.identifier('args');
      return [
        t.variableDeclaration('const', [
          t.variableDeclarator(
            argsId,
            t.arrayExpression([t.identifier('start')])
          ),
        ]),
        t.ifStatement(
          t.binaryExpression(
            '!==',
            t.identifier('deleteCount'),
            t.identifier('undefined')
          ),
          t.expressionStatement(
            t.callExpression(
              t.memberExpression(argsId, t.identifier('push')),
              [t.identifier('deleteCount')]
            )
          )
        ),
        t.expressionStatement(
          t.callExpression(
            t.memberExpression(argsId, t.identifier('push')),
            [t.spreadElement(t.identifier('items'))]
          )
        ),
        t.expressionStatement(
          t.callExpression(
            t.memberExpression(nextRef(), t.identifier('splice')),
            [t.spreadElement(argsId)]
          )
        ),
      ];
    }
  );
}

function buildArrayMutationMethod(
  typeName: string,
  propDescriptors: (PropDescriptor & { privateName: t.PrivateName })[],
  prop: PropDescriptor & { privateName: t.PrivateName },
  methodName: string,
  params: (t.Identifier | t.RestElement)[],
  buildMutations: (nextRef: () => t.Identifier) => t.Statement[],
  cloneOptions: { prepend?: t.SpreadElement[]; append?: t.SpreadElement[] } = {}
): t.ClassMethod {
  const { statements, nextName } = buildArrayCloneSetup(prop, cloneOptions);
  const nextRef = () => t.identifier(nextName);
  const mutations = buildMutations(nextRef);
  const currentExpr = t.memberExpression(
    t.thisExpression(),
    t.identifier(prop.name)
  );

  const preludeStatements: t.Statement[] = [];

  if (methodName.startsWith('push') || methodName.startsWith('unshift')) {
    const valuesParam = params[0];
    const valuesId =
      t.isIdentifier(valuesParam) ? valuesParam
        : t.isRestElement(valuesParam) && t.isIdentifier(valuesParam.argument)
          ? valuesParam.argument
          : null;
    if (valuesId) {
      preludeStatements.push(
        t.ifStatement(
          t.binaryExpression('===', t.memberExpression(t.cloneNode(valuesId), t.identifier('length')), t.numericLiteral(0)),
          t.returnStatement(t.thisExpression())
        )
      );
    }
  }

  if (methodName.startsWith('pop') || methodName.startsWith('shift')) {
    const lengthAccess = t.memberExpression(
      t.logicalExpression('??', currentExpr, t.arrayExpression([])),
      t.identifier('length')
    );
    preludeStatements.push(
      t.ifStatement(
        t.binaryExpression('===', lengthAccess, t.numericLiteral(0)),
        t.returnStatement(t.thisExpression())
      )
    );
  }

  const bodyStatements = [
    ...preludeStatements,
    ...statements,
    ...mutations,
    t.returnStatement(
      t.newExpression(t.identifier(typeName), [
        buildPropsObjectExpression(
          propDescriptors,
          prop,
          nextRef()
        ),
      ])
    ),
  ];

  const method = t.classMethod(
    'method',
    t.identifier(methodName),
    params,
    t.blockStatement(bodyStatements)
  );
  method.returnType = t.tsTypeAnnotation(
    t.tsTypeReference(t.identifier(typeName))
  );
  return method;
}

function buildArrayCloneSetup(prop: PropDescriptor & { privateName: t.PrivateName }, { prepend = [], append = [] }: { prepend?: t.SpreadElement[]; append?: t.SpreadElement[] } = {}) {
  const sourceName = `${prop.name}Array`;
  const nextName = `${prop.name}Next`;

  const fieldExpr = () =>
    t.memberExpression(
      t.thisExpression(),
      t.cloneNode(prop.privateName)
    );

  const sourceInit = prop.optional
    ? t.conditionalExpression(
      t.binaryExpression(
        '===',
        fieldExpr(),
        t.identifier('undefined')
      ),
      t.arrayExpression([]),
      fieldExpr()
    )
    : fieldExpr();

  const statements = [
    t.variableDeclaration('const', [
      t.variableDeclarator(t.identifier(sourceName), sourceInit),
    ]),
    t.variableDeclaration('const', [
      t.variableDeclarator(
        t.identifier(nextName),
        t.arrayExpression([
          ...prepend,
          t.spreadElement(t.identifier(sourceName)),
          ...append,
        ])
      ),
    ]),
  ];

  return { statements, nextName };
}

function buildMapMutatorMethods(typeName: string, propDescriptors: (PropDescriptor & { privateName: t.PrivateName })[]): t.ClassMethod[] {
  const methods: t.ClassMethod[] = [];

  for (const prop of propDescriptors) {
    if (!prop.isMap) {
      continue;
    }

    methods.push(
      buildMapMutationMethod(
        typeName,
        propDescriptors,
        prop,
        `set${capitalize(prop.name)}Entry`,
        buildMapSetParams(prop),
        (mapRef) => [
          t.expressionStatement(
            t.callExpression(
              t.memberExpression(mapRef(), t.identifier('set')),
              [t.identifier('key'), t.identifier('value')]
            )
          ),
        ],
        buildSetEntryOptions(prop)
      ),
      buildMapMutationMethod(
        typeName,
        propDescriptors,
        prop,
        `delete${capitalize(prop.name)}Entry`,
        buildMapDeleteParams(prop),
        (mapRef) => [
          t.expressionStatement(
            t.callExpression(
              t.memberExpression(mapRef(), t.identifier('delete')),
              [t.identifier('key')]
            )
          ),
        ],
        buildDeleteEntryOptions(prop)
      ),
      buildMapMutationMethod(
        typeName,
        propDescriptors,
        prop,
        `clear${capitalize(prop.name)}`,
        [],
        (mapRef) => [
          t.expressionStatement(
            t.callExpression(
              t.memberExpression(mapRef(), t.identifier('clear')),
              []
            )
          ),
        ],
        buildClearMapOptions(prop)
      ),
      buildMapMutationMethod(
        typeName,
        propDescriptors,
        prop,
        `merge${capitalize(prop.name)}Entries`,
        buildMapMergeParams(prop),
        (mapRef) => {
          const mergeKeyId = t.identifier('mergeKey');
          const mergeValueId = t.identifier('mergeValue');
          return [
            t.forOfStatement(
              t.variableDeclaration('const', [
                t.variableDeclarator(t.arrayPattern([mergeKeyId, mergeValueId])),
              ]),
              t.identifier('entries'),
              t.blockStatement([
                t.expressionStatement(
                  t.callExpression(
                    t.memberExpression(mapRef(), t.identifier('set')),
                    [mergeKeyId, mergeValueId]
                  )
                ),
              ])
            ),
          ];
        }
      ),
      buildMapMutationMethod(
        typeName,
        propDescriptors,
        prop,
        `update${capitalize(prop.name)}Entry`,
        buildMapUpdateParams(prop),
        (mapRef) => {
          const currentId = t.identifier('currentValue');
          const updatedId = t.identifier('updatedValue');
          return [
            t.variableDeclaration('const', [
              t.variableDeclarator(
                currentId,
                t.callExpression(
                  t.memberExpression(mapRef(), t.identifier('get')),
                  [t.identifier('key')]
                )
              ),
            ]),
            t.variableDeclaration('const', [
              t.variableDeclarator(
                updatedId,
                t.callExpression(t.identifier('updater'), [currentId])
              ),
            ]),
            t.expressionStatement(
              t.callExpression(
                t.memberExpression(mapRef(), t.identifier('set')),
                [t.identifier('key'), updatedId]
              )
            ),
          ];
        }
      ),
      buildMapMutationMethod(
        typeName,
        propDescriptors,
        prop,
        `map${capitalize(prop.name)}Entries`,
        buildMapMapperParams(prop),
        (mapRef) => {
          const mappedEntriesId = t.identifier(`${prop.name}MappedEntries`);
          const keyId = t.identifier('entryKey');
          const valueId = t.identifier('entryValue');
          const mappedId = t.identifier('mappedEntry');
          const newKeyId = t.identifier('newKey');
          const newValueId = t.identifier('newValue');
          return [
            t.variableDeclaration('const', [
              t.variableDeclarator(mappedEntriesId, t.arrayExpression([])),
            ]),
            t.forOfStatement(
              t.variableDeclaration('const', [
                t.variableDeclarator(t.arrayPattern([keyId, valueId])),
              ]),
              mapRef(),
              t.blockStatement([
                t.variableDeclaration('const', [
                  t.variableDeclarator(
                    mappedId,
                    t.callExpression(t.identifier('mapper'), [valueId, keyId])
                  ),
                ]),
                t.expressionStatement(
                  t.callExpression(
                    t.memberExpression(mappedEntriesId, t.identifier('push')),
                    [mappedId]
                  )
                ),
              ])
            ),
            t.expressionStatement(
              t.callExpression(
                t.memberExpression(mapRef(), t.identifier('clear')),
                []
              )
            ),
            t.forOfStatement(
              t.variableDeclaration('const', [
                t.variableDeclarator(
                  t.arrayPattern([newKeyId, newValueId]),
                  null
                ),
              ]),
              mappedEntriesId,
              t.blockStatement([
                t.expressionStatement(
                  t.callExpression(
                    t.memberExpression(mapRef(), t.identifier('set')),
                    [newKeyId, newValueId]
                  )
                ),
              ])
            ),
          ];
        }
      ),
      buildMapMutationMethod(
        typeName,
        propDescriptors,
        prop,
        `filter${capitalize(prop.name)}Entries`,
        buildMapPredicateParams(prop),
        (mapRef) => {
          const keyId = t.identifier('entryKey');
          const valueId = t.identifier('entryValue');
          return [
            t.forOfStatement(
              t.variableDeclaration('const', [
                t.variableDeclarator(t.arrayPattern([keyId, valueId])),
              ]),
              mapRef(),
              t.blockStatement([
                t.ifStatement(
                  t.unaryExpression(
                    '!',
                    t.callExpression(t.identifier('predicate'), [valueId, keyId])
                  ),
                  t.expressionStatement(
                    t.callExpression(
                      t.memberExpression(mapRef(), t.identifier('delete')),
                      [keyId]
                    )
                  )
                ),
              ])
            ),
          ];
        }
      )
    );
  }

  return methods;
}

function buildSetMutatorMethods(typeName: string, propDescriptors: (PropDescriptor & { privateName: t.PrivateName })[]): t.ClassMethod[] {
  const methods: t.ClassMethod[] = [];

  for (const prop of propDescriptors) {
    if (!prop.isSet || !prop.setElementType) {
      continue;
    }

    methods.push(
      buildSetMutationMethod(
        typeName,
        propDescriptors,
        prop,
        `add${capitalize(prop.name)}`,
        buildSetAddParams(prop),
        (setRef) => [
          t.expressionStatement(
            t.callExpression(
              t.memberExpression(setRef(), t.identifier('add')),
              [t.identifier('value')]
            )
          ),
        ]
      ),
      buildSetMutationMethod(
        typeName,
        propDescriptors,
        prop,
        `addAll${capitalize(prop.name)}`,
        buildSetAddAllParams(prop),
        (setRef) => {
          const toAddId = t.identifier('toAdd');
          return [
            t.forOfStatement(
              t.variableDeclaration('const', [
                t.variableDeclarator(toAddId),
              ]),
              t.identifier('values'),
              t.blockStatement([
                t.expressionStatement(
                  t.callExpression(
                    t.memberExpression(setRef(), t.identifier('add')),
                    [toAddId]
                  )
                ),
              ])
            ),
          ];
        }
      ),
      buildSetMutationMethod(
        typeName,
        propDescriptors,
        prop,
        `delete${capitalize(prop.name)}`,
        buildSetDeleteParams(prop),
        (setRef) => [
          t.expressionStatement(
            t.callExpression(
              t.memberExpression(setRef(), t.identifier('delete')),
              [t.identifier('value')]
            )
          ),
        ]
      ),
      buildSetMutationMethod(
        typeName,
        propDescriptors,
        prop,
        `deleteAll${capitalize(prop.name)}`,
        buildSetDeleteAllParams(prop),
        (setRef) => {
          const delId = t.identifier('del');
          return [
            t.forOfStatement(
              t.variableDeclaration('const', [
                t.variableDeclarator(delId),
              ]),
              t.identifier('values'),
              t.blockStatement([
                t.expressionStatement(
                  t.callExpression(
                    t.memberExpression(setRef(), t.identifier('delete')),
                    [delId]
                  )
                ),
              ])
            ),
          ];
        }
      ),
      buildSetMutationMethod(
        typeName,
        propDescriptors,
        prop,
        `clear${capitalize(prop.name)}`,
        [],
        (setRef) => [
          t.expressionStatement(
            t.callExpression(
              t.memberExpression(setRef(), t.identifier('clear')),
              []
            )
          ),
        ]
      ),
      buildSetMutationMethod(
        typeName,
        propDescriptors,
        prop,
        `filter${capitalize(prop.name)}`,
        buildSetFilterParams(prop),
        (setRef) => {
          const filteredId = t.identifier(`${prop.name}Filtered`);
          const valueId = t.identifier('value');
          return [
            t.variableDeclaration('const', [
              t.variableDeclarator(filteredId, t.arrayExpression([])),
            ]),
            t.forOfStatement(
              t.variableDeclaration('const', [
                t.variableDeclarator(valueId),
              ]),
              setRef(),
              t.blockStatement([
                t.ifStatement(
                  t.callExpression(t.identifier('predicate'), [valueId]),
                  t.expressionStatement(
                    t.callExpression(
                      t.memberExpression(filteredId, t.identifier('push')),
                      [valueId]
                    )
                  )
                ),
              ])
            ),
            t.expressionStatement(
              t.callExpression(
                t.memberExpression(setRef(), t.identifier('clear')),
                []
              )
            ),
            t.forOfStatement(
              t.variableDeclaration('const', [
                t.variableDeclarator(valueId),
              ]),
              filteredId,
              t.blockStatement([
                t.expressionStatement(
                  t.callExpression(
                    t.memberExpression(setRef(), t.identifier('add')),
                    [valueId]
                  )
                ),
              ])
            ),
          ];
        }
      ),
      buildSetMutationMethod(
        typeName,
        propDescriptors,
        prop,
        `map${capitalize(prop.name)}`,
        buildSetMapParams(prop),
        (setRef) => {
          const mappedId = t.identifier(`${prop.name}Mapped`);
          const valueId = t.identifier('value');
          const mappedValueId = t.identifier('mappedValue');
          return [
            t.variableDeclaration('const', [
              t.variableDeclarator(mappedId, t.arrayExpression([])),
            ]),
            t.forOfStatement(
              t.variableDeclaration('const', [
                t.variableDeclarator(valueId),
              ]),
              setRef(),
              t.blockStatement([
                t.variableDeclaration('const', [
                  t.variableDeclarator(
                    mappedValueId,
                    t.callExpression(t.identifier('mapper'), [valueId])
                  ),
                ]),
                t.expressionStatement(
                  t.callExpression(
                    t.memberExpression(mappedId, t.identifier('push')),
                    [mappedValueId]
                  )
                ),
              ])
            ),
            t.expressionStatement(
              t.callExpression(
                t.memberExpression(setRef(), t.identifier('clear')),
                []
              )
            ),
            t.forOfStatement(
              t.variableDeclaration('const', [
                t.variableDeclarator(valueId),
              ]),
              mappedId,
              t.blockStatement([
                t.expressionStatement(
                  t.callExpression(
                    t.memberExpression(setRef(), t.identifier('add')),
                    [valueId]
                  )
                ),
              ])
            ),
          ];
        }
      ),
      buildSetMutationMethod(
        typeName,
        propDescriptors,
        prop,
        `update${capitalize(prop.name)}`,
        buildSetUpdateParams(prop),
        (setRef) => {
          const updatedId = t.identifier('updated');
          return [
            t.variableDeclaration('const', [
              t.variableDeclarator(
                updatedId,
                t.callExpression(t.identifier('updater'), [setRef()])
              ),
            ]),
            t.expressionStatement(
              t.callExpression(
                t.memberExpression(setRef(), t.identifier('clear')),
                []
              )
            ),
            t.forOfStatement(
              t.variableDeclaration('const', [
                t.variableDeclarator(t.identifier('updatedItem'), null),
              ]),
              updatedId,
              t.blockStatement([
                t.expressionStatement(
                  t.callExpression(
                    t.memberExpression(setRef(), t.identifier('add')),
                    [t.identifier('updatedItem')]
                  )
                ),
              ])
            ),
          ];
        }
      )
    );
  }

  return methods;
}

function buildMapMutationMethod(
  typeName: string,
  propDescriptors: (PropDescriptor & { privateName: t.PrivateName })[],
  prop: PropDescriptor & { privateName: t.PrivateName },
  methodName: string,
  params: (t.Identifier | t.RestElement)[],
  buildMutations: (mapRef: () => t.Identifier) => t.Statement[],
  options: { prelude?: t.Statement[]; skipNoopGuard?: boolean } = {}
): t.ClassMethod {
  const { prelude = [], skipNoopGuard = false } = options;
  const { statements, nextName } = buildMapCloneSetup(prop);
  const nextRef = () => t.identifier(nextName);
  const mutations = buildMutations(nextRef);
  const currentExpr = t.memberExpression(
    t.thisExpression(),
    t.identifier(prop.name)
  );
  const bodyStatements = [
    ...prelude,
    ...statements,
    ...mutations,
    ...(skipNoopGuard ? [] : [buildNoopGuard(currentExpr, nextRef())]),
    t.returnStatement(
      t.newExpression(t.identifier(typeName), [
        buildPropsObjectExpression(propDescriptors, prop, nextRef()),
      ])
    ),
  ];

  const method = t.classMethod(
    'method',
    t.identifier(methodName),
    params,
    t.blockStatement(bodyStatements)
  );
  method.returnType = t.tsTypeAnnotation(
    t.tsTypeReference(t.identifier(typeName))
  );
  return method;
}

function buildMapCloneSetup(prop: PropDescriptor & { privateName: t.PrivateName }) {
  const sourceName = `${prop.name}MapSource`;
  const entriesName = `${prop.name}MapEntries`;
  const nextName = `${prop.name}MapNext`;

  const fieldExpr = () =>
    t.memberExpression(
      t.thisExpression(),
      t.cloneNode(prop.privateName)
    );

  const sourceDecl = t.variableDeclaration('const', [
    t.variableDeclarator(t.identifier(sourceName), fieldExpr()),
  ]);

  const entriesExpr = prop.optional
    ? t.conditionalExpression(
      t.binaryExpression(
        '===',
        t.identifier(sourceName),
        t.identifier('undefined')
      ),
      t.arrayExpression([]),
      t.arrayExpression([
        t.spreadElement(
          t.callExpression(
            t.memberExpression(t.identifier(sourceName), t.identifier('entries')),
            []
          )
        )
      ])
    )
    : t.arrayExpression([
      t.spreadElement(
        t.callExpression(
          t.memberExpression(t.identifier(sourceName), t.identifier('entries')),
          []
        )
      )
    ]);

  const entriesDecl = t.variableDeclaration('const', [
    t.variableDeclarator(t.identifier(entriesName), entriesExpr),
  ]);

  const mapDecl = t.variableDeclaration('const', [
    t.variableDeclarator(
      t.identifier(nextName),
      t.newExpression(t.identifier('Map'), [t.identifier(entriesName)])
    ),
  ]);

  return { statements: [sourceDecl, entriesDecl, mapDecl], nextName };
}

function buildSetMutationMethod(
  typeName: string,
  propDescriptors: (PropDescriptor & { privateName: t.PrivateName })[],
  prop: PropDescriptor & { privateName: t.PrivateName },
  methodName: string,
  params: (t.Identifier | t.RestElement)[],
  buildMutations: (setRef: () => t.Identifier) => t.Statement[]
): t.ClassMethod {
  const { statements, nextName } = buildSetCloneSetup(prop);
  const nextRef = () => t.identifier(nextName);
  const mutations = buildMutations(nextRef);
  const currentExpr = t.memberExpression(
    t.thisExpression(),
    t.identifier(prop.name)
  );
  const bodyStatements = [
    ...statements,
    ...mutations,
    buildNoopGuard(currentExpr, nextRef()),
    t.returnStatement(
      t.newExpression(t.identifier(typeName), [
        buildPropsObjectExpression(
          propDescriptors,
          prop,
          nextRef()
        ),
      ])
    ),
  ];

  const method = t.classMethod(
    'method',
    t.identifier(methodName),
    params,
    t.blockStatement(bodyStatements)
  );
  method.returnType = t.tsTypeAnnotation(
    t.tsTypeReference(t.identifier(typeName))
  );
  return method;
}

function buildSetCloneSetup(prop: PropDescriptor & { privateName: t.PrivateName }) {
  const sourceName = `${prop.name}SetSource`;
  const entriesName = `${prop.name}SetEntries`;
  const nextName = `${prop.name}SetNext`;

  const fieldExpr = () =>
    t.memberExpression(
      t.thisExpression(),
      t.identifier(prop.name)
    );

  const statements = [
    t.variableDeclaration('const', [
      t.variableDeclarator(
        t.identifier(sourceName),
        t.logicalExpression(
          '??',
          fieldExpr(),
          t.arrayExpression([])
        )
      ),
    ]),
    t.variableDeclaration('const', [
      t.variableDeclarator(
        t.identifier(entriesName),
        t.arrayExpression([
          t.spreadElement(t.identifier(sourceName)),
        ])
      ),
    ]),
    t.variableDeclaration('const', [
      t.variableDeclarator(
        t.identifier(nextName),
        t.newExpression(
          t.identifier('Set'),
          [t.identifier(entriesName)]
        )
      ),
    ]),
  ];

  return { statements, nextName, entriesName };
}

function buildNoopGuard(currentExpr: t.Expression, nextExpr: t.Expression): t.IfStatement {
  const sameRef = t.binaryExpression('===', t.cloneNode(currentExpr), t.cloneNode(nextExpr));
  const equalsCall = t.logicalExpression(
    '&&',
    t.binaryExpression('!==', t.cloneNode(currentExpr), t.identifier('undefined')),
    t.callExpression(
      t.memberExpression(t.cloneNode(currentExpr), t.identifier('equals')),
      [t.cloneNode(nextExpr)]
    )
  );
  return t.ifStatement(
    t.logicalExpression('||', sameRef, equalsCall),
    t.returnStatement(t.thisExpression())
  );
}

function buildSetEntryOptions(prop: PropDescriptor) {
  const currentId = t.identifier(`${prop.name}Current`);
  const existingId = t.identifier('existing');
  const valueId = t.identifier('value');
  const hasKey = t.callExpression(
    t.memberExpression(currentId, t.identifier('has')),
    [t.identifier('key')]
  );
  const getExisting = t.callExpression(
    t.memberExpression(currentId, t.identifier('get')),
    [t.identifier('key')]
  );
  const equalsCall = t.callExpression(t.identifier('equals'), [existingId, valueId]);

  const prelude = [
    t.variableDeclaration('const', [
      t.variableDeclarator(currentId, t.memberExpression(t.thisExpression(), t.identifier(prop.name))),
    ]),
    t.ifStatement(
      t.logicalExpression(
        '&&',
        currentId,
        hasKey
      ),
      t.blockStatement([
        t.variableDeclaration('const', [
          t.variableDeclarator(existingId, getExisting),
        ]),
        t.ifStatement(equalsCall, t.returnStatement(t.thisExpression())),
      ])
    ),
  ];

  return { prelude, skipNoopGuard: true };
}

function buildDeleteEntryOptions(prop: PropDescriptor) {
  const currentId = t.identifier(`${prop.name}Current`);
  const hasKey = t.callExpression(
    t.memberExpression(currentId, t.identifier('has')),
    [t.identifier('key')]
  );
  const prelude = [
    t.variableDeclaration('const', [
      t.variableDeclarator(currentId, t.memberExpression(t.thisExpression(), t.identifier(prop.name))),
    ]),
    t.ifStatement(
      t.logicalExpression(
        '||',
        t.binaryExpression('===', currentId, t.identifier('undefined')),
        t.unaryExpression('!', hasKey)
      ),
      t.returnStatement(t.thisExpression())
    ),
  ];
  return { prelude, skipNoopGuard: true };
}

function buildClearMapOptions(prop: PropDescriptor) {
  const currentId = t.identifier(`${prop.name}Current`);
  const sizeAccess = t.memberExpression(currentId, t.identifier('size'));
  const prelude = [
    t.variableDeclaration('const', [
      t.variableDeclarator(currentId, t.memberExpression(t.thisExpression(), t.identifier(prop.name))),
    ]),
    t.ifStatement(
      t.logicalExpression(
        '||',
        t.binaryExpression('===', currentId, t.identifier('undefined')),
        t.binaryExpression('===', sizeAccess, t.numericLiteral(0))
      ),
      t.returnStatement(t.thisExpression())
    ),
  ];
  return { prelude, skipNoopGuard: true };
}

function cloneMapKeyType(prop: PropDescriptor): t.TSType {
  if (prop.mapKeyInputType) {
    return t.cloneNode(prop.mapKeyInputType);
  }
  return prop.mapKeyType ? wrapImmutableType(t.cloneNode(prop.mapKeyType)) as t.TSType : t.tsAnyKeyword();
}

function cloneMapValueType(prop: PropDescriptor): t.TSType {
  if (prop.mapValueInputType) {
    return t.cloneNode(prop.mapValueInputType);
  }
  return prop.mapValueType ? wrapImmutableType(t.cloneNode(prop.mapValueType)) as t.TSType : t.tsAnyKeyword();
}

function cloneSetElementType(prop: PropDescriptor): t.TSType {
  if (prop.setElementInputType) {
    return t.cloneNode(prop.setElementInputType);
  }
  return prop.setElementType ? wrapImmutableType(t.cloneNode(prop.setElementType)) as t.TSType : t.tsAnyKeyword();
}

function buildMapSetParams(prop: PropDescriptor): t.Identifier[] {
  const keyId = t.identifier('key');
  keyId.typeAnnotation = t.tsTypeAnnotation(cloneMapKeyType(prop));
  const valueId = t.identifier('value');
  valueId.typeAnnotation = t.tsTypeAnnotation(cloneMapValueType(prop));
  return [keyId, valueId];
}

function buildMapDeleteParams(prop: PropDescriptor): t.Identifier[] {
  const keyId = t.identifier('key');
  keyId.typeAnnotation = t.tsTypeAnnotation(cloneMapKeyType(prop));
  return [keyId];
}

function buildMapMergeParams(prop: PropDescriptor): t.Identifier[] {
  const entriesId = t.identifier('entries');
  const keyType = cloneMapKeyType(prop);
  const valueType = cloneMapValueType(prop);
  const tupleType = t.tsTupleType([keyType, valueType]);
  const iterableType = t.tsTypeReference(
    t.identifier('Iterable'),
    t.tsTypeParameterInstantiation([tupleType])
  );
  const mapInputUnion = buildInputAcceptingMutable(
    t.tsTypeReference(
      t.identifier('ImmutableMap'),
      t.tsTypeParameterInstantiation([keyType, valueType])
    )
  );
  entriesId.typeAnnotation = t.tsTypeAnnotation(
    t.tsUnionType([
      iterableType,
      mapInputUnion as t.TSType,
    ])
  );
  return [entriesId];
}

function buildMapUpdateParams(prop: PropDescriptor): t.Identifier[] {
  const keyId = t.identifier('key');
  keyId.typeAnnotation = t.tsTypeAnnotation(cloneMapKeyType(prop));
  const updaterId = t.identifier('updater');
  const valueType = cloneMapValueType(prop);
  const updaterParam = t.identifier('currentValue');
  updaterParam.typeAnnotation = t.tsTypeAnnotation(
    t.tsUnionType([t.cloneNode(valueType), t.tsUndefinedKeyword()])
  );
  updaterId.typeAnnotation = t.tsTypeAnnotation(
    t.tsFunctionType(
      null,
      [updaterParam],
      t.tsTypeAnnotation(t.cloneNode(valueType))
    )
  );
  return [keyId, updaterId];
}

function buildSetAddParams(prop: PropDescriptor): t.Identifier[] {
  const valueId = t.identifier('value');
  valueId.typeAnnotation = t.tsTypeAnnotation(cloneSetElementType(prop));
  return [valueId];
}

function buildSetAddAllParams(prop: PropDescriptor): t.Identifier[] {
  const valuesId = t.identifier('values');
  valuesId.typeAnnotation = t.tsTypeAnnotation(
    t.tsTypeReference(
      t.identifier('Iterable'),
      t.tsTypeParameterInstantiation([cloneSetElementType(prop)])
    )
  );
  return [valuesId];
}

function buildSetDeleteParams(prop: PropDescriptor): t.Identifier[] {
  const valueId = t.identifier('value');
  valueId.typeAnnotation = t.tsTypeAnnotation(cloneSetElementType(prop));
  return [valueId];
}

function buildSetDeleteAllParams(prop: PropDescriptor): t.Identifier[] {
  const valuesId = t.identifier('values');
  valuesId.typeAnnotation = t.tsTypeAnnotation(
    t.tsTypeReference(
      t.identifier('Iterable'),
      t.tsTypeParameterInstantiation([cloneSetElementType(prop)])
    )
  );
  return [valuesId];
}

function buildSetFilterParams(_prop: PropDescriptor): t.Identifier[] {
  const predicateId = t.identifier('predicate');
  const valueId = t.identifier('value');
  predicateId.typeAnnotation = t.tsTypeAnnotation(
    t.tsFunctionType(
      null,
      [t.identifier(valueId.name)],
      t.tsTypeAnnotation(t.tsTypeReference(t.identifier('boolean')))
    )
  );
  return [predicateId];
}

function buildSetMapParams(prop: PropDescriptor): t.Identifier[] {
  const mapperId = t.identifier('mapper');
  const valueId = t.identifier('value');
  mapperId.typeAnnotation = t.tsTypeAnnotation(
    t.tsFunctionType(
      null,
      [t.identifier(valueId.name)],
      t.tsTypeAnnotation(t.cloneNode(prop.setElementType!))
    )
  );
  return [mapperId];
}

function buildSetUpdateParams(prop: PropDescriptor): t.Identifier[] {
  const updaterId = t.identifier('updater');
  const currentId = t.identifier('current');
  currentId.typeAnnotation = t.tsTypeAnnotation(
    t.tsTypeReference(
      t.identifier('ImmutableSet'),
      t.tsTypeParameterInstantiation([cloneSetElementType(prop)])
    )
  );
  updaterId.typeAnnotation = t.tsTypeAnnotation(
    t.tsFunctionType(
      null,
      [currentId],
      t.tsTypeAnnotation(
        t.tsTypeReference(
          t.identifier('Iterable'),
          t.tsTypeParameterInstantiation([cloneSetElementType(prop)])
        )
      )
    )
  );
  return [updaterId];
}

function buildMapMapperParams(prop: PropDescriptor): t.Identifier[] {
  const mapperId = t.identifier('mapper');
  const valueType = cloneMapValueType(prop);
  const keyType = cloneMapKeyType(prop);
  const valueParam = t.identifier('value');
  valueParam.typeAnnotation = t.tsTypeAnnotation(t.cloneNode(valueType));
  const keyParam = t.identifier('key');
  keyParam.typeAnnotation = t.tsTypeAnnotation(t.cloneNode(keyType));
  mapperId.typeAnnotation = t.tsTypeAnnotation(
    t.tsFunctionType(
      null,
      [valueParam, keyParam],
      t.tsTypeAnnotation(
        t.tsTupleType([t.cloneNode(keyType), t.cloneNode(valueType)])
      )
    )
  );
  return [mapperId];
}

function buildMapPredicateParams(prop: PropDescriptor): t.Identifier[] {
  const predicateId = t.identifier('predicate');
  const valueType = cloneMapValueType(prop);
  const keyType = cloneMapKeyType(prop);
  const valueParam = t.identifier('value');
  valueParam.typeAnnotation = t.tsTypeAnnotation(t.cloneNode(valueType));
  const keyParam = t.identifier('key');
  keyParam.typeAnnotation = t.tsTypeAnnotation(t.cloneNode(keyType));
  predicateId.typeAnnotation = t.tsTypeAnnotation(
    t.tsFunctionType(
      null,
      [valueParam, keyParam],
      t.tsTypeAnnotation(t.tsBooleanKeyword())
    )
  );
  return [predicateId];
}
