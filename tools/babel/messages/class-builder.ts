import * as t from '@babel/types';
import { capitalize } from './utils.js';
import {
  buildInputAcceptingMutable,
  getDefaultValue,
  wrapImmutableType,
} from './properties.js';
import type { PropDescriptor, PluginStateFlags, TypeParameter } from './properties.js';
import {
  typeAllowsNull,
  buildRuntimeTypeCheckExpression,
} from './runtime-checks.js';
import {
  buildImmutableArrayBufferNormalizationExpression,
  buildImmutableArrayExpression,
  buildImmutableArrayOfMessagesExpression,
  buildImmutableDateNormalizationExpression,
  buildImmutableMapExpression,
  buildImmutableMapWithConversionsExpression,
  buildImmutableSetExpression,
  buildImmutableSetOfMessagesExpression,
  buildImmutableUrlNormalizationExpression,
  buildMessageNormalizationExpression,
} from './normalizers.js';
import type { MapConversionInfo } from './normalizers.js';
import {
  getTypeName,
  isArrayTypeNode,
  isDateReference,
  isUrlReference,
} from './type-guards.js';

/**
 * Unwrap parenthesized types to avoid unnecessary parens in generated code.
 * Parentheses are needed in source for disambiguation (e.g., `(A | B)[]`)
 * but not needed in contexts like function parameter types.
 */
function unwrapParenthesizedType(node: t.TSType | null): t.TSType | null {
  if (!node) {
    return null;
  }
  if (t.isTSParenthesizedType(node)) {
    return unwrapParenthesizedType(node.typeAnnotation);
  }
  return node;
}

function getMapConversionInfo(
  prop: PropDescriptor,
  declaredMessageTypeNames: Set<string>
): MapConversionInfo {
  const conversions: MapConversionInfo = {};

  // Check key type
  if (prop.mapKeyType) {
    if (isArrayTypeNode(prop.mapKeyType)) {
      conversions.keyIsArray = true;
    } else if (t.isTSTypeReference(prop.mapKeyType)) {
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
    conversions.keyIsDate
    || conversions.keyIsUrl
    || conversions.keyIsArray
    || conversions.keyIsMessage
    || conversions.valueIsDate
    || conversions.valueIsUrl
    || conversions.valueIsMessage
  );
}

/**
 * Get the private field name for a type parameter's constructor reference.
 * E.g., 'T' -> '#tClass', 'U' -> '#uClass'
 */
function getConstructorFieldName(paramName: string): string {
  return `${paramName.toLowerCase()}Class`;
}

/**
 * Build a type reference that includes type parameters if the type is generic.
 * E.g., for Response<T>, returns TSTypeReference to "Response<T>" not just "Response"
 */
function buildGenericTypeReference(
  typeName: string,
  typeParameters: TypeParameter[]
): t.TSTypeReference {
  if (typeParameters.length === 0) {
    return t.tsTypeReference(t.identifier(typeName));
  }

  const typeArgs = t.tsTypeParameterInstantiation(
    typeParameters.map((p) => t.tsTypeReference(t.identifier(p.name)))
  );

  return t.tsTypeReference(t.identifier(typeName), typeArgs);
}

/**
 * Build a qualified type reference (e.g., TypeName.Data<T>)
 */
function buildGenericQualifiedTypeReference(
  typeName: string,
  qualifier: string,
  typeParameters: TypeParameter[]
): t.TSTypeReference {
  const qualifiedName = t.tsQualifiedName(
    t.identifier(typeName),
    t.identifier(qualifier)
  );

  if (typeParameters.length === 0) {
    return t.tsTypeReference(qualifiedName);
  }

  const typeArgs = t.tsTypeParameterInstantiation(
    typeParameters.map((p) => t.tsTypeReference(t.identifier(p.name)))
  );

  return t.tsTypeReference(qualifiedName, typeArgs);
}

/**
 * Build the class type parameters for a generic message.
 * E.g., Container<T extends Message<any>> becomes:
 * t.tsTypeParameterDeclaration([t.tsTypeParameter('T', constraint, null)])
 */
function buildClassTypeParameters(
  typeParameters: TypeParameter[]
): t.TSTypeParameterDeclaration | null {
  if (typeParameters.length === 0) {
    return null;
  }

  const params = typeParameters.map((param) => {
    // Create the constraint: Message<any>
    const constraint = t.tsTypeReference(
      t.identifier('Message'),
      t.tsTypeParameterInstantiation([t.tsAnyKeyword()])
    );

    const tsParam = t.tsTypeParameter(constraint, null, param.name);
    return tsParam;
  });

  return t.tsTypeParameterDeclaration(params);
}

/**
 * Build private fields to store constructor references for generic types.
 * E.g., #tClass: MessageConstructor<T>;
 */
function buildConstructorRefFields(
  typeParameters: TypeParameter[]
): t.ClassPrivateProperty[] {
  return typeParameters.map((param) => {
    const fieldName = getConstructorFieldName(param.name);
    const field = t.classPrivateProperty(
      t.privateName(t.identifier(fieldName))
    );

    // Type: MessageConstructor<T>
    field.typeAnnotation = t.tsTypeAnnotation(
      t.tsTypeReference(
        t.identifier('MessageConstructor'),
        t.tsTypeParameterInstantiation([
          t.tsTypeReference(t.identifier(param.name))
        ])
      )
    );

    return field;
  });
}

/**
 * Build constructor parameters for generic type constructors.
 * E.g., tClass: MessageConstructor<T>, uClass: MessageConstructor<U>
 */
function buildConstructorClassParams(
  typeParameters: TypeParameter[]
): t.Identifier[] {
  return typeParameters.map((param) => {
    const paramName = getConstructorFieldName(param.name);
    const paramId = t.identifier(paramName);

    // Type: MessageConstructor<T>
    paramId.typeAnnotation = t.tsTypeAnnotation(
      t.tsTypeReference(
        t.identifier('MessageConstructor'),
        t.tsTypeParameterInstantiation([
          t.tsTypeReference(t.identifier(param.name))
        ])
      )
    );

    return paramId;
  });
}

/**
 * Build assignments to store constructor references in the constructor body.
 * E.g., this.#tClass = tClass;
 */
function buildConstructorRefAssignments(
  typeParameters: TypeParameter[]
): t.ExpressionStatement[] {
  return typeParameters.map((param) => {
    const fieldName = getConstructorFieldName(param.name);
    return t.expressionStatement(
      t.assignmentExpression(
        '=',
        t.memberExpression(
          t.thisExpression(),
          t.privateName(t.identifier(fieldName))
        ),
        t.identifier(fieldName)
      )
    );
  });
}

/**
 * Build the $typeName string for a generic message.
 * For generic: `TypeName<${tClass.$typeName}>`
 * For non-generic: just typeName
 */
function buildTypeNameExpression(
  typeName: string,
  typeParameters: TypeParameter[]
): t.Expression {
  if (typeParameters.length === 0) {
    return t.stringLiteral(typeName);
  }

  // Build template literal: `TypeName<${tClass.$typeName},...>`
  const quasis: t.TemplateElement[] = [];
  const expressions: t.Expression[] = [];

  // First quasi: "TypeName<"
  quasis.push(t.templateElement({ raw: `${typeName}<`, cooked: `${typeName}<` }, false));

  for (const [index, param] of typeParameters.entries()) {
    const fieldName = getConstructorFieldName(param.name);
    // Expression: tClass.$typeName
    expressions.push(
      t.memberExpression(
        t.identifier(fieldName),
        t.identifier('$typeName')
      )
    );

    // Quasi after expression: "," or ">"
    const isLast = index === typeParameters.length - 1;
    quasis.push(t.templateElement(
      { raw: isLast ? '>' : ',', cooked: isLast ? '>' : ',' },
      isLast
    ));
  }

  return t.templateLiteral(quasis, expressions);
}

/**
 * Build the static bind() method for generic messages.
 */
function buildBindMethod(
  typeName: string,
  typeParameters: TypeParameter[],
  state: PluginStateFlags
): t.ClassMethod | null {
  if (typeParameters.length === 0) {
    return null;
  }

  // We need parseCerealString for the deserialize implementation
  state.usesParseCerealString = true;

  // Build type parameters for the static method
  const methodTypeParams = buildClassTypeParameters(typeParameters);

  // Build parameters: tClass: MessageConstructor<T>, ...
  const params = buildConstructorClassParams(typeParameters);

  // Return type: MessageConstructor<TypeName<T, U, ...>>
  const returnTypeParams = typeParameters.map((param) =>
    t.tsTypeReference(t.identifier(param.name))
  );
  const returnType = t.tsTypeReference(
    t.identifier('MessageConstructor'),
    t.tsTypeParameterInstantiation([
      t.tsTypeReference(
        t.identifier(typeName),
        t.tsTypeParameterInstantiation(returnTypeParams)
      )
    ])
  );

  // Build the bound constructor function
  // const boundCtor = function(props: TypeName.Data<T>) { return new TypeName(tClass, props); }
  const propsParam = t.identifier('props');
  propsParam.typeAnnotation = t.tsTypeAnnotation(
    t.tsTypeReference(
      t.tsQualifiedName(t.identifier(typeName), t.identifier('Data')),
      t.tsTypeParameterInstantiation(returnTypeParams)
    )
  );

  const constructorArgs = [
    ...typeParameters.map(
      (param) => t.identifier(getConstructorFieldName(param.name))
    ),
    t.identifier('props')
  ];

  const boundCtorFn = t.functionExpression(
    null,
    [propsParam],
    t.blockStatement([
      t.returnStatement(
        t.newExpression(t.identifier(typeName), constructorArgs)
      )
    ])
  );

  // Cast to MessageConstructor
  const boundCtorCast = t.tsAsExpression(
    t.tsAsExpression(boundCtorFn, t.tsUnknownKeyword()),
    returnType
  );

  const boundCtorDecl = t.variableDeclaration('const', [
    t.variableDeclarator(t.identifier('boundCtor'), boundCtorCast)
  ]);

  // Build deserialize function that properly handles generic types:
  // boundCtor.deserialize = (data: string) => {
  //   const payload = parseCerealString(data);
  //   const proto = TypeName.prototype as TypeName<any>;
  //   const props = proto.$fromEntries(payload as Record<string, unknown>);
  //   return new TypeName(tClass, props as TypeName.Data<T>);
  // };
  const dataParam = t.identifier('data');
  dataParam.typeAnnotation = t.tsTypeAnnotation(t.tsStringKeyword());

  // const payload = parseCerealString(data);
  const payloadDecl = t.variableDeclaration('const', [
    t.variableDeclarator(
      t.identifier('payload'),
      t.callExpression(t.identifier('parseCerealString'), [t.identifier('data')])
    )
  ]);

  // const proto = TypeName.prototype;
  const protoDecl = t.variableDeclaration('const', [
    t.variableDeclarator(
      t.identifier('proto'),
      t.memberExpression(t.identifier(typeName), t.identifier('prototype'))
    )
  ]);

  // const props = proto.$fromEntries(payload as Record<string, unknown>);
  const propsDecl = t.variableDeclaration('const', [
    t.variableDeclarator(
      t.identifier('props'),
      t.callExpression(
        t.memberExpression(t.identifier('proto'), t.identifier('$fromEntries')),
        [
          t.tsAsExpression(
            t.identifier('payload'),
            t.tsTypeReference(
              t.identifier('Record'),
              t.tsTypeParameterInstantiation([
                t.tsStringKeyword(),
                t.tsUnknownKeyword()
              ])
            )
          )
        ]
      )
    )
  ]);

  // return new TypeName(tClass, props as TypeName.Data<T>);
  const deserializeReturn = t.returnStatement(
    t.newExpression(t.identifier(typeName), [
      ...typeParameters.map(
        (param) => t.identifier(getConstructorFieldName(param.name))
      ),
      t.tsAsExpression(
        t.identifier('props'),
        t.tsTypeReference(
          t.tsQualifiedName(t.identifier(typeName), t.identifier('Data')),
          t.tsTypeParameterInstantiation(returnTypeParams)
        )
      )
    ])
  );

  const deserializeBody = t.blockStatement([
    payloadDecl,
    protoDecl,
    propsDecl,
    deserializeReturn
  ]);

  const deserializeAssign = t.expressionStatement(
    t.assignmentExpression(
      '=',
      t.memberExpression(t.identifier('boundCtor'), t.identifier('deserialize')),
      t.arrowFunctionExpression([dataParam], deserializeBody)
    )
  );

  // (boundCtor as { $typeName: string }).$typeName = `TypeName<${tClass.$typeName}>`;
  // Cast to bypass readonly constraint on $typeName
  const typeNameAssign = t.expressionStatement(
    t.assignmentExpression(
      '=',
      t.memberExpression(
        t.tsAsExpression(
          t.identifier('boundCtor'),
          t.tsTypeLiteral([
            t.tsPropertySignature(
              t.identifier('$typeName'),
              t.tsTypeAnnotation(t.tsStringKeyword())
            )
          ])
        ),
        t.identifier('$typeName')
      ),
      buildTypeNameExpression(typeName, typeParameters)
    )
  );

  // return boundCtor;
  const returnStmt = t.returnStatement(t.identifier('boundCtor'));

  const methodBody = t.blockStatement([
    boundCtorDecl,
    deserializeAssign,
    typeNameAssign,
    returnStmt
  ]);

  const bindMethod = t.classMethod(
    'method',
    t.identifier('bind'),
    params,
    methodBody,
    false,
    true // static
  );
  bindMethod.typeParameters = methodTypeParams;
  bindMethod.returnType = t.tsTypeAnnotation(returnType);
  // Add override modifier - needed because Function.prototype.bind exists
  // and noImplicitOverride is enabled
  bindMethod.override = true;

  return bindMethod;
}

/**
 * Build the static $typeName property for non-generic messages.
 */
function buildStaticTypeName(typeName: string): t.ClassProperty {
  const prop = t.classProperty(
    t.identifier('$typeName'),
    t.stringLiteral(typeName),
    null,
    null,
    false,
    true // static
  );
  prop.readonly = true;
  return prop;
}

export function buildClassFromProperties(
  typeName: string,
  properties: PropDescriptor[],
  declaredMessageTypeNames: Set<string>,
  state: PluginStateFlags,
  typeParameters: TypeParameter[] = []
): t.ClassDeclaration {
  const isGeneric = typeParameters.length > 0;
  if (isGeneric) {
    state.usesDataObject = true;
    state.hasGenericTypes = true;
  }
  const backingFields: t.ClassPrivateProperty[] = [];
  const getters: t.ClassMethod[] = [];
  const propDescriptors = properties.map((prop) => ({
    ...prop,
    privateName: t.privateName(t.identifier(prop.name)),
  }));
  const propsTypeRef = buildGenericQualifiedTypeReference(typeName, 'Data', typeParameters);
  const valueTypeRef = buildGenericQualifiedTypeReference(typeName, 'Value', typeParameters);

  for (const prop of propDescriptors) {
    const baseType = wrapImmutableType(t.cloneNode(prop.typeAnnotation));

    const needsOptionalUnion = prop.optional
      && (prop.isArray || prop.isMap || prop.isSet || prop.isArrayBufferType);
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

  // Add private fields for constructor references (for generic types)
  if (isGeneric) {
    const constructorRefFields = buildConstructorRefFields(typeParameters);
    backingFields.push(...constructorRefFields);
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
            t.stringLiteral(typeName),
          ])
        ),
      ])
    ) as unknown as t.ClassDeclaration;
    // Note: unreachable path in current usage
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
      const elementTypeName = prop.arrayElementType
        ? getTypeName(prop.arrayElementType)
        : null;
      valueExpr =
        elementTypeName && declaredMessageTypeNames.has(elementTypeName)
          ? buildImmutableArrayOfMessagesExpression(
            propsAccess,
            elementTypeName,
            { allowUndefined: Boolean(prop.optional) }
          )
          : buildImmutableArrayExpression(
            propsAccess,
            { allowUndefined: Boolean(prop.optional) }
          );
    } else if (prop.isMap) {
      const conversions = getMapConversionInfo(
        prop,
        declaredMessageTypeNames
      );
      valueExpr = needsMapConversions(conversions)
        ? buildImmutableMapWithConversionsExpression(
          propsAccess,
          conversions,
          { allowUndefined: Boolean(prop.optional) }
        )
        : buildImmutableMapExpression(
          propsAccess,
          { allowUndefined: Boolean(prop.optional) }
        );
    } else if (prop.isSet) {
      const elementTypeName = prop.setElementType
        ? getTypeName(prop.setElementType)
        : null;
      valueExpr =
        elementTypeName && declaredMessageTypeNames.has(elementTypeName)
          ? buildImmutableSetOfMessagesExpression(
            propsAccess,
            elementTypeName,
            { allowUndefined: Boolean(prop.optional) }
          )
          : buildImmutableSetExpression(
            propsAccess,
            { allowUndefined: Boolean(prop.optional) }
          );
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

    // For generic type parameters, use the stored constructor ref for default value
    let defaultValue: t.Expression;
    if (prop.isGenericParam && prop.genericParamName) {
      // Use the stored constructor reference: new this.#tClass(undefined)
      // Pass undefined explicitly so the inner class uses its EMPTY instance
      const fieldName = getConstructorFieldName(prop.genericParamName);
      defaultValue = t.newExpression(
        t.memberExpression(
          t.thisExpression(),
          t.privateName(t.identifier(fieldName))
        ),
        [t.identifier('undefined')]
      );
    } else {
      defaultValue = getDefaultValue(prop);
    }
    const assignedExpr: t.Expression = t.conditionalExpression(
      t.identifier('props'),
      valueExpr,
      defaultValue
    );

    const assignment = t.assignmentExpression(
      '=',
      t.memberExpression(
        t.thisExpression(),
        t.cloneNode(prop.privateName)
      ),
      assignedExpr
    );

    return t.expressionStatement(assignment);
  });

  // Generic messages don't support memoization (EMPTY instance)
  // because they require constructor parameters
  const memoizationCheck = isGeneric ? null : t.ifStatement(
    t.logicalExpression(
      '&&',
      t.unaryExpression('!', t.identifier('props')),
      t.memberExpression(t.identifier(typeName), t.identifier('EMPTY'))
    ),
    t.returnStatement(
      t.memberExpression(t.identifier(typeName), t.identifier('EMPTY'))
    )
  );

  const memoizationSet = isGeneric ? null : t.ifStatement(
    t.unaryExpression('!', t.identifier('props')),
    t.expressionStatement(
      t.assignmentExpression(
        '=',
        t.memberExpression(t.identifier(typeName), t.identifier('EMPTY')),
        t.thisExpression()
      )
    )
  );

  // Build constructor parameters: for generics, add class params before props
  const constructorClassParams = isGeneric
    ? buildConstructorClassParams(typeParameters)
    : [];
  const allConstructorParams = [...constructorClassParams, constructorParam];

  // Build constructor body
  const constructorBody: t.Statement[] = [];

  // Add memoization check (only for non-generic)
  if (memoizationCheck) {
    constructorBody.push(memoizationCheck);
  }

  // Add super() call with appropriate $typeName
  constructorBody.push(
    t.expressionStatement(
      t.callExpression(t.super(), [
        t.memberExpression(
          t.identifier(typeName),
          t.identifier('TYPE_TAG')
        ),
        buildTypeNameExpression(typeName, typeParameters),
      ])
    )
  );

  // Add constructor ref assignments for generics
  if (isGeneric) {
    constructorBody.push(...buildConstructorRefAssignments(typeParameters));
  }

  // Add property assignments
  constructorBody.push(...constructorAssignments);

  // Add memoization set (only for non-generic)
  if (memoizationSet) {
    constructorBody.push(memoizationSet);
  }

  const constructor = t.classMethod(
    'constructor',
    t.identifier('constructor'),
    allConstructorParams,
    t.blockStatement(constructorBody)
  );

  // Build static fields
  const staticFields: t.ClassProperty[] = [
    t.classProperty(
      t.identifier('TYPE_TAG'),
      t.callExpression(t.identifier('Symbol'), [t.stringLiteral(typeName)]),
      null,
      null,
      false,
      true
    ),
  ];

  // Add static $typeName for non-generic messages
  // (generic messages get $typeName set dynamically in constructor)
  if (!isGeneric) {
    staticFields.push(buildStaticTypeName(typeName));
    // Add EMPTY memoization field (only for non-generic)
    // eslint-disable-next-line unicorn/prefer-single-call -- conditional pushes
    staticFields.push(
      t.classProperty(
        t.identifier('EMPTY'),
        null,
        t.tsTypeAnnotation(
          t.tsTypeReference(t.identifier(typeName))
        ),
        null,
        false,
        true
      )
    );
  }

  const fromEntriesMethod = buildFromEntriesMethod(
    propDescriptors,
    propsTypeRef,
    declaredMessageTypeNames,
    state
  );
  const descriptorMethod = buildDescriptorMethod(propDescriptors, propsTypeRef);

  const setterMethods = propDescriptors.map((prop) =>
    buildSetterMethod(
      typeName,
      propDescriptors,
      prop,
      declaredMessageTypeNames,
      typeParameters
    )
  );
  const deleteMethods = propDescriptors
    .filter((prop) => prop.optional)
    .map((prop) => buildDeleteMethod(
      typeName, propDescriptors, prop, typeParameters
    ));
  const arrayMethods = buildArrayMutatorMethods(
    typeName,
    propDescriptors,
    typeParameters
  );
  const mapMethods = buildMapMutatorMethods(
    typeName,
    propDescriptors,
    typeParameters
  );
  const setMethods = buildSetMutatorMethods(
    typeName,
    propDescriptors,
    typeParameters
  );

  // Build hybrid approach methods
  const withChildMethod = buildWithChildMethod(
    typeName,
    propDescriptors,
    declaredMessageTypeNames,
    typeParameters
  );
  const getMessageChildrenMethod = buildGetMessageChildrenMethod(
    propDescriptors,
    state
  );

  const classBodyMembers = [
    ...staticFields,
    ...backingFields,
    constructor,
    descriptorMethod,
    fromEntriesMethod,
  ];

  // Add hybrid approach methods
  if (withChildMethod) {
    classBodyMembers.push(withChildMethod);
  }
  if (getMessageChildrenMethod) {
    classBodyMembers.push(getMessageChildrenMethod);
  }

  // Add bind() method for generic messages
  if (isGeneric) {
    const bindMethod = buildBindMethod(typeName, typeParameters, state);
    if (bindMethod) {
      classBodyMembers.push(bindMethod);
    }
  }

  classBodyMembers.push(...getters,
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
    }));

  const classBody = t.classBody(classBodyMembers);

  const classDecl = t.classDeclaration(
    t.identifier(typeName),
    t.identifier('Message'),
    classBody,
    []
  );

  // Add type parameters to the class for generics
  if (isGeneric) {
    classDecl.typeParameters = buildClassTypeParameters(typeParameters);
  }

  // Update propsTypeRef to include type parameters for generics
  const superTypeArg = isGeneric
    ? t.tsTypeReference(
        t.tsQualifiedName(t.identifier(typeName), t.identifier('Data')),
        t.tsTypeParameterInstantiation(
          typeParameters.map((p) => t.tsTypeReference(t.identifier(p.name)))
        )
      )
    : t.cloneNode(propsTypeRef);

  classDecl.superTypeParameters = t.tsTypeParameterInstantiation([
    superTypeArg,
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

function buildDescriptorMethod(
  propDescriptors: (PropDescriptor & { privateName: t.PrivateName })[],
  propsTypeRef: t.TSTypeReference
): t.ClassMethod {
  const descriptorEntries = propDescriptors.map((prop) => {
    const properties: t.ObjectProperty[] = [
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
    ];

    // Add unionMessageTypes if the property is a union with message types
    if (prop.unionMessageTypes.length > 0) {
      properties.push(
        t.objectProperty(
          t.identifier('unionMessageTypes'),
          t.arrayExpression(
            prop.unionMessageTypes.map((name) => t.stringLiteral(name))
          )
        )
      );
    }

    return t.objectExpression(properties);
  });

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

function buildFromEntriesMethod(
  propDescriptors: (PropDescriptor & { privateName: t.PrivateName })[],
  propsTypeRef: t.TSTypeReference,
  declaredMessageTypeNames: Set<string>,
  state: PluginStateFlags
): t.ClassMethod {
  const argsId = t.identifier('entries');
  argsId.typeAnnotation = t.tsTypeAnnotation(
    t.tsTypeReference(
      t.identifier('Record'),
      t.tsTypeParameterInstantiation([
        t.tsStringKeyword(),
        t.tsUnknownKeyword()
      ])
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
      const conversions = getMapConversionInfo(
        prop,
        declaredMessageTypeNames
      );
      // In $fromEntries, values are typed as 'unknown', so we need to cast to 'any'
      // for the ImmutableMap constructor
      const mapExpr = needsMapConversions(conversions)
        ? buildImmutableMapWithConversionsExpression(
          checkedValueId as t.Expression,
          conversions,
          { castToAny: true, allowUndefined: Boolean(prop.optional) }
        )
        : buildImmutableMapExpression(
          checkedValueId as t.Expression,
          { castToAny: true, allowUndefined: Boolean(prop.optional) }
        );
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
            buildImmutableSetExpression(
              checkedValueId as t.Expression,
              { castToAny: true, allowUndefined: Boolean(prop.optional) }
            )
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
            buildImmutableArrayExpression(
              checkedValueId as t.Expression,
              { castToAny: true, allowUndefined: Boolean(prop.optional) }
            )
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
    } else if (prop.unionMessageTypes.length > 0) {
      // Handle tagged message unions
      state.usesTaggedMessageData = true;

      const unionValueId = t.identifier(`${prop.name}UnionValue`);
      // Build the if-else chain for handling each message type in the union
      const constructorStatements = buildTaggedMessageUnionHandler(
        checkedValueId as t.Expression,
        unionValueId,
        prop.unionMessageTypes,
        prop.name,
        prop.optional
      );

      statements.push(...constructorStatements);
      checkedValueId = unionValueId;
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

    // For generic type parameters, cast the value to the type parameter
    // For Map/Set/Array properties from unknown entries, cast to the field type to satisfy TypeScript
    let assignedValue: t.Expression = checkedValueId as t.Expression;
    if (prop.isGenericParam && prop.genericParamName) {
      assignedValue = t.tsAsExpression(
        checkedValueId as t.Expression,
        t.tsTypeReference(t.identifier(prop.genericParamName))
      );
    } else if (prop.isMap || prop.isSet || prop.isArray) {
      // Values from Record<string, unknown> need to be cast to the field type for assignment
      assignedValue = t.tsAsExpression(
        checkedValueId as t.Expression,
        t.cloneNode(prop.typeAnnotation)
      );
    }

    statements.push(
      t.expressionStatement(
        t.assignmentExpression(
          '=',
          t.memberExpression(propsId, t.identifier(prop.name)),
          assignedValue
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

function buildEntryAccessExpression(
  prop: PropDescriptor & { privateName: t.PrivateName },
  entriesId: t.Identifier
): t.Expression {
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

/**
 * Builds statements to handle tagged message unions in $fromEntries.
 * Generates code like:
 * ```
 * let valueUnionValue = value;
 * if (isTaggedMessageData(value)) {
 *   if (value.$tag === 'MessageA') {
 *     valueUnionValue = new MessageA(value.$data);
 *   } else if (value.$tag === 'MessageB') {
 *     valueUnionValue = new MessageB(value.$data);
 *   }
 * }
 * ```
 */
function buildTaggedMessageUnionHandler(
  sourceExpr: t.Expression,
  targetId: t.Identifier,
  messageTypes: string[],
  propName: string,
  isOptional: boolean
): t.Statement[] {
  // let valueUnionValue = value;
  const statements: t.Statement[] = [
    t.variableDeclaration('let', [
      t.variableDeclarator(targetId, t.cloneNode(sourceExpr)),
    ]),
  ];

  // Build nested if-else for each message type
  // if (value.$tag === 'MessageA') { ... } else if (value.$tag === 'MessageB') { ... }
  let innerIf: t.IfStatement | null = null;

  for (let i = messageTypes.length - 1; i >= 0; i -= 1) {
    const msgType = messageTypes[i]!;
    const tagCheck = t.binaryExpression(
      '===',
      t.memberExpression(sourceExpr, t.identifier('$tag')),
      t.stringLiteral(msgType)
    );

    // Convert parsed entries to props using $fromEntries, then construct
    // const props = MessageType.prototype.$fromEntries(value.$data);
    // new MessageType(props)
    const propsId = t.identifier(`${propName}${msgType}Props`);
    const fromEntriesCall = t.callExpression(
      t.memberExpression(
        t.memberExpression(t.identifier(msgType), t.identifier('prototype')),
        t.identifier('$fromEntries')
      ),
      [t.memberExpression(t.cloneNode(sourceExpr), t.identifier('$data'))]
    );

    const propsDecl = t.variableDeclaration('const', [
      t.variableDeclarator(propsId, fromEntriesCall),
    ]);

    const constructorCall = t.newExpression(
      t.identifier(msgType),
      [propsId]
    );

    const assignStmt = t.expressionStatement(
      t.assignmentExpression('=', t.cloneNode(targetId), constructorCall)
    );

    innerIf = t.ifStatement(
      tagCheck,
      t.blockStatement([propsDecl, assignStmt]),
      innerIf
    );
  }

  if (innerIf) {
    // Wrap in isTaggedMessageData check
    const taggedCheck = t.callExpression(
      t.identifier('isTaggedMessageData'),
      [t.cloneNode(sourceExpr)]
    );

    // For optional properties, also check it's not undefined
    const outerCondition = isOptional
      ? t.logicalExpression(
        '&&',
        t.binaryExpression(
          '!==',
          t.cloneNode(sourceExpr),
          t.identifier('undefined')
        ),
        taggedCheck
      )
      : taggedCheck;

    statements.push(
      t.ifStatement(outerCondition, t.blockStatement([innerIf]))
    );
  }

  return statements;
}

function buildSetterMethod(
  typeName: string,
  propDescriptors: (PropDescriptor & { privateName: t.PrivateName })[],
  targetProp: PropDescriptor & { privateName: t.PrivateName },
  declaredMessageTypeNames: Set<string>,
  typeParameters: TypeParameter[] = []
): t.ClassMethod {
  const valueId = t.identifier('value');
  valueId.typeAnnotation = t.tsTypeAnnotation(
    t.cloneNode(targetProp.displayType ?? targetProp.inputTypeAnnotation)
  );

  let setterValueExpr: t.Expression = t.cloneNode(valueId);

  if (targetProp.isMap) {
    const conversions = getMapConversionInfo(
      targetProp,
      declaredMessageTypeNames
    );
    setterValueExpr = needsMapConversions(conversions)
      ? buildImmutableMapWithConversionsExpression(
        setterValueExpr,
        conversions,
        { allowUndefined: Boolean(targetProp.optional) }
      )
      : buildImmutableMapExpression(
        setterValueExpr,
        { allowUndefined: Boolean(targetProp.optional) }
      );
  } else if (targetProp.isSet) {
    setterValueExpr = buildImmutableSetExpression(
      setterValueExpr,
      { allowUndefined: Boolean(targetProp.optional) }
    );
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

  // Build constructor arguments: for generics, include constructor refs before props
  const constructorArgs: t.Expression[] = [];
  if (typeParameters.length > 0) {
    for (const param of typeParameters) {
      const fieldName = getConstructorFieldName(param.name);
      constructorArgs.push(
        t.memberExpression(
          t.thisExpression(),
          t.privateName(t.identifier(fieldName))
        )
      );
    }
  }
  constructorArgs.push(propsObject);

  // For generic types, cast to 'this' to satisfy polymorphic return type
  let newExpr: t.Expression = t.newExpression(
    t.identifier(typeName), constructorArgs
  );
  if (typeParameters.length > 0) {
    newExpr = t.tsAsExpression(newExpr, t.tsThisType());
  }

  const body = t.blockStatement([
    t.returnStatement(
      t.callExpression(
        t.memberExpression(t.thisExpression(), t.identifier('$update')),
        [newExpr]
      )
    ),
  ]);

  const methodName = `set${capitalize(targetProp.name)}`;
  const method = t.classMethod(
    'method',
    t.identifier(methodName),
    [valueId],
    body
  );
  method.returnType = t.tsTypeAnnotation(
    buildGenericTypeReference(typeName, typeParameters)
  );
  return method;
}

function buildDeleteMethod(
  typeName: string,
  propDescriptors: (PropDescriptor & { privateName: t.PrivateName })[],
  targetProp: PropDescriptor & { privateName: t.PrivateName },
  typeParameters: TypeParameter[] = []
): t.ClassMethod {
  const propsObject = buildPropsObjectExpression(
    propDescriptors,
    targetProp,
    t.identifier('undefined'),
    { omitTarget: true }
  );

  // Build constructor arguments: for generics, include constructor refs before props
  const constructorArgs: t.Expression[] = [];
  if (typeParameters.length > 0) {
    for (const param of typeParameters) {
      const fieldName = getConstructorFieldName(param.name);
      constructorArgs.push(
        t.memberExpression(
          t.thisExpression(),
          t.privateName(t.identifier(fieldName))
        )
      );
    }
  }
  constructorArgs.push(propsObject);

  // For generic types, cast to 'this' to satisfy polymorphic return type
  let newExpr: t.Expression = t.newExpression(
    t.identifier(typeName), constructorArgs
  );
  if (typeParameters.length > 0) {
    newExpr = t.tsAsExpression(newExpr, t.tsThisType());
  }

  const body = t.blockStatement([
    t.returnStatement(
      t.callExpression(
        t.memberExpression(t.thisExpression(), t.identifier('$update')),
        [newExpr]
      )
    ),
  ]);

  const methodName = `delete${capitalize(targetProp.name)}`;
  const method = t.classMethod('method', t.identifier(methodName), [], body);
  method.returnType = t.tsTypeAnnotation(
    buildGenericTypeReference(typeName, typeParameters)
  );
  return method;
}

function buildArrayMutatorMethods(
  typeName: string,
  propDescriptors: (PropDescriptor & { privateName: t.PrivateName })[],
  typeParameters: TypeParameter[] = []
): t.ClassMethod[] {
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
        },
        typeParameters
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
        ],
        {},
        typeParameters
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
        ],
        {},
        typeParameters
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
        },
        typeParameters
      ),
      buildSpliceMethod(typeName, propDescriptors, prop, typeParameters),
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
        ],
        {},
        typeParameters
      ),
      buildSortMethod(typeName, propDescriptors, prop, typeParameters),
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
        ],
        {},
        typeParameters
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
        ],
        {},
        typeParameters
      )
    );
  }

  return methods;
}

function buildArrayValuesRestParam(prop: PropDescriptor): t.RestElement {
  const valuesId = t.identifier('values');
  const elementType = unwrapParenthesizedType(prop.arrayElementType);
  if (elementType) {
    valuesId.typeAnnotation = t.tsTypeAnnotation(
      t.tsArrayType(t.cloneNode(elementType))
    );
  }
  return t.restElement(valuesId);
}

function buildFillParams(prop: PropDescriptor): t.Identifier[] {
  const valueId = t.identifier('value');
  const elementType = unwrapParenthesizedType(prop.arrayElementType);
  if (elementType) {
    valueId.typeAnnotation = t.tsTypeAnnotation(
      t.cloneNode(elementType)
    );
  }
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

function buildSortMethod(
  typeName: string,
  propDescriptors: (PropDescriptor & { privateName: t.PrivateName })[],
  prop: PropDescriptor & { privateName: t.PrivateName },
  typeParameters: TypeParameter[] = []
): t.ClassMethod {
  const compareId = t.identifier('compareFn');
  const elementType = unwrapParenthesizedType(prop.arrayElementType);
  const firstParam = t.identifier('a');
  if (elementType) {
    firstParam.typeAnnotation = t.tsTypeAnnotation(
      t.cloneNode(elementType)
    );
  }
  const secondParam = t.identifier('b');
  if (elementType) {
    secondParam.typeAnnotation = t.tsTypeAnnotation(
      t.cloneNode(elementType)
    );
  }
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
    ],
    {},
    typeParameters
  );
}

function buildSpliceMethod(
  typeName: string,
  propDescriptors: (PropDescriptor & { privateName: t.PrivateName })[],
  prop: PropDescriptor & { privateName: t.PrivateName },
  typeParameters: TypeParameter[] = []
): t.ClassMethod {
  const startId = t.identifier('start');
  startId.typeAnnotation = t.tsTypeAnnotation(t.tsNumberKeyword());
  const deleteCountId = t.identifier('deleteCount');
  deleteCountId.typeAnnotation = t.tsTypeAnnotation(t.tsNumberKeyword());
  deleteCountId.optional = true;
  const elementType = unwrapParenthesizedType(prop.arrayElementType);
  const itemsId = t.identifier('items');
  if (elementType) {
    itemsId.typeAnnotation = t.tsTypeAnnotation(
      t.tsArrayType(t.cloneNode(elementType))
    );
  }
  const itemsParam = t.restElement(itemsId);

  return buildArrayMutationMethod(
    typeName,
    propDescriptors,
    prop,
    `splice${capitalize(prop.name)}`,
    [startId, deleteCountId, itemsParam],
    (nextRef) => {
      const allArgs: (t.Expression | t.SpreadElement)[] = [
        t.identifier('start'),
        t.spreadElement(
          t.conditionalExpression(
            t.binaryExpression('!==', deleteCountId, t.identifier('undefined')),
            t.arrayExpression([deleteCountId]),
            t.arrayExpression([])
          )
        ),
        t.spreadElement(t.identifier('items')),
      ];

      return [
        t.expressionStatement(
          t.callExpression(
            t.memberExpression(nextRef(), t.identifier('splice')),
            allArgs
          )
        ),
      ];
    },
    {},
    typeParameters
  );
}

function buildArrayMutationMethod(
  typeName: string,
  propDescriptors: (PropDescriptor & { privateName: t.PrivateName })[],
  prop: PropDescriptor & { privateName: t.PrivateName },
  methodName: string,
  params: (t.Identifier | t.RestElement)[],
  buildMutations: (nextRef: () => t.Identifier) => t.Statement[],
  cloneOptions: {
    prepend?: t.SpreadElement[];
    append?: t.SpreadElement[];
  } = {},
  typeParameters: TypeParameter[] = []
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
    const valuesId = (function () {
      if (t.isIdentifier(valuesParam)) {
        return valuesParam;
      } else if (
        t.isRestElement(valuesParam)
        && t.isIdentifier(valuesParam.argument)
      ) {
        return valuesParam.argument;
      }
      return null;
    })();
    if (valuesId) {
      preludeStatements.push(
        t.ifStatement(
          t.binaryExpression(
            '===',
            t.memberExpression(
              t.cloneNode(valuesId),
              t.identifier('length')
            ),
            t.numericLiteral(0)
          ),
          t.returnStatement(t.thisExpression())
        )
      );
    }
  }

  if (methodName.startsWith('pop') || methodName.startsWith('shift')) {
    const lengthAccess = t.memberExpression(
      t.logicalExpression(
        '??',
        currentExpr,
        t.arrayExpression([])
      ),
      t.identifier('length')
    );
    preludeStatements.push(
      t.ifStatement(
        t.binaryExpression('===', lengthAccess, t.numericLiteral(0)),
        t.returnStatement(t.thisExpression())
      )
    );
  }

  // Build constructor arguments: for generics, include constructor refs before props
  const constructorArgs: t.Expression[] = [];
  if (typeParameters.length > 0) {
    for (const param of typeParameters) {
      const fieldName = getConstructorFieldName(param.name);
      constructorArgs.push(
        t.memberExpression(
          t.thisExpression(),
          t.privateName(t.identifier(fieldName))
        )
      );
    }
  }
  constructorArgs.push(
    buildPropsObjectExpression(
      propDescriptors,
      prop,
      nextRef()
    )
  );

  // For generic types, cast to 'this' to satisfy polymorphic return type
  let newExpr: t.Expression = t.newExpression(
    t.identifier(typeName), constructorArgs
  );
  if (typeParameters.length > 0) {
    newExpr = t.tsAsExpression(newExpr, t.tsThisType());
  }

  const bodyStatements = [
    ...preludeStatements,
    ...statements,
    ...mutations,
    t.returnStatement(
      t.callExpression(
        t.memberExpression(t.thisExpression(), t.identifier('$update')),
        [newExpr]
      )
    ),
  ];

  const method = t.classMethod(
    'method',
    t.identifier(methodName),
    params,
    t.blockStatement(bodyStatements)
  );
  method.returnType = t.tsTypeAnnotation(
    buildGenericTypeReference(typeName, typeParameters)
  );
  return method;
}

function buildArrayCloneSetup(
  prop: PropDescriptor & { privateName: t.PrivateName },
  {
    prepend = [],
    append = []
  }: {
    prepend?: t.SpreadElement[];
    append?: t.SpreadElement[];
  } = {}
) {
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

function buildMapMutatorMethods(
  typeName: string,
  propDescriptors: (PropDescriptor & { privateName: t.PrivateName })[],
  typeParameters: TypeParameter[] = []
): t.ClassMethod[] {
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
        buildSetEntryOptions(prop),
        typeParameters
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
        buildDeleteEntryOptions(prop),
        typeParameters
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
        buildClearMapOptions(prop),
        typeParameters
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
                t.variableDeclarator(
                  t.arrayPattern([mergeKeyId, mergeValueId])
                ),
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
        },
        {},
        typeParameters
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
        },
        {},
        typeParameters
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
        },
        {},
        typeParameters
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
                    t.callExpression(
                      t.identifier('predicate'),
                      [valueId, keyId]
                    )
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
        },
        {},
        typeParameters
      )
    );
  }

  return methods;
}

function buildSetMutatorMethods(
  typeName: string,
  propDescriptors: (PropDescriptor & { privateName: t.PrivateName })[],
  typeParameters: TypeParameter[] = []
): t.ClassMethod[] {
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
        ],
        typeParameters
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
        },
        typeParameters
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
        ],
        typeParameters
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
        },
        typeParameters
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
        ],
        typeParameters
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
        },
        typeParameters
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
        },
        typeParameters
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
        },
        typeParameters
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
  options: {
    prelude?: t.Statement[];
    skipNoopGuard?: boolean;
  } = {},
  typeParameters: TypeParameter[] = []
): t.ClassMethod {
  const { prelude = [], skipNoopGuard = false } = options;
  const { statements, nextName } = buildMapCloneSetup(prop);
  const nextRef = () => t.identifier(nextName);
  const mutations = buildMutations(nextRef);
  const currentExpr = t.memberExpression(
    t.thisExpression(),
    t.identifier(prop.name)
  );

  // Build constructor arguments: for generics, include constructor refs before props
  const constructorArgs: t.Expression[] = [];
  if (typeParameters.length > 0) {
    for (const param of typeParameters) {
      const fieldName = getConstructorFieldName(param.name);
      constructorArgs.push(
        t.memberExpression(
          t.thisExpression(),
          t.privateName(t.identifier(fieldName))
        )
      );
    }
  }
  constructorArgs.push(
    buildPropsObjectExpression(propDescriptors, prop, nextRef())
  );

  // For generic types, cast to 'this' to satisfy polymorphic return type
  let newExpr: t.Expression = t.newExpression(
    t.identifier(typeName), constructorArgs
  );
  if (typeParameters.length > 0) {
    newExpr = t.tsAsExpression(newExpr, t.tsThisType());
  }

  const bodyStatements = [
    ...prelude,
    ...statements,
    ...mutations,
    ...skipNoopGuard ? [] : [buildNoopGuard(currentExpr, nextRef())],
    t.returnStatement(
      t.callExpression(
        t.memberExpression(t.thisExpression(), t.identifier('$update')),
        [newExpr]
      )
    ),
  ];

  const method = t.classMethod(
    'method',
    t.identifier(methodName),
    params,
    t.blockStatement(bodyStatements)
  );
  method.returnType = t.tsTypeAnnotation(
    buildGenericTypeReference(typeName, typeParameters)
  );
  return method;
}

function buildMapCloneSetup(
  prop: PropDescriptor & { privateName: t.PrivateName }
) {
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
            t.memberExpression(
              t.identifier(sourceName),
              t.identifier('entries')
            ),
            []
          )
        )
      ])
    )
    : t.arrayExpression([
      t.spreadElement(
        t.callExpression(
          t.memberExpression(
            t.identifier(sourceName),
            t.identifier('entries')
          ),
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
  buildMutations: (setRef: () => t.Identifier) => t.Statement[],
  typeParameters: TypeParameter[] = []
): t.ClassMethod {
  const { statements, nextName } = buildSetCloneSetup(prop);
  const nextRef = () => t.identifier(nextName);
  const mutations = buildMutations(nextRef);
  const currentExpr = t.memberExpression(
    t.thisExpression(),
    t.identifier(prop.name)
  );

  // Build constructor arguments: for generics, include constructor refs before props
  const constructorArgs: t.Expression[] = [];
  if (typeParameters.length > 0) {
    for (const param of typeParameters) {
      const fieldName = getConstructorFieldName(param.name);
      constructorArgs.push(
        t.memberExpression(
          t.thisExpression(),
          t.privateName(t.identifier(fieldName))
        )
      );
    }
  }
  constructorArgs.push(
    buildPropsObjectExpression(
      propDescriptors,
      prop,
      nextRef()
    )
  );

  // For generic types, cast to 'this' to satisfy polymorphic return type
  let newExpr: t.Expression = t.newExpression(
    t.identifier(typeName), constructorArgs
  );
  if (typeParameters.length > 0) {
    newExpr = t.tsAsExpression(newExpr, t.tsThisType());
  }

  const bodyStatements = [
    ...statements,
    ...mutations,
    buildNoopGuard(currentExpr, nextRef()),
    t.returnStatement(
      t.callExpression(
        t.memberExpression(t.thisExpression(), t.identifier('$update')),
        [newExpr]
      )
    ),
  ];

  const method = t.classMethod(
    'method',
    t.identifier(methodName),
    params,
    t.blockStatement(bodyStatements)
  );
  method.returnType = t.tsTypeAnnotation(
    buildGenericTypeReference(typeName, typeParameters)
  );
  return method;
}

function buildSetCloneSetup(
  prop: PropDescriptor & { privateName: t.PrivateName }
) {
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

function buildNoopGuard(
  currentExpr: t.Expression,
  nextExpr: t.Expression
): t.IfStatement {
  // Cast nextExpr to 'unknown' for the reference equality check because
  // currentExpr may be ImmutableMap and nextExpr may be Map
  const sameRef = t.binaryExpression(
    '===',
    t.cloneNode(currentExpr),
    t.tsAsExpression(t.cloneNode(nextExpr), t.tsUnknownKeyword())
  );
  // Use optional chaining: currentExpr?.equals(nextExpr)
  const equalsCall = t.optionalCallExpression(
    t.optionalMemberExpression(
      t.cloneNode(currentExpr),
      t.identifier('equals'),
      false,
      true
    ),
    [t.cloneNode(nextExpr)],
    false
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
  // Use optional chaining: currentId?.has(key)
  const optionalHasKey = t.optionalCallExpression(
    t.optionalMemberExpression(currentId, t.identifier('has'), false, true),
    [t.identifier('key')],
    false
  );
  const getExisting = t.callExpression(
    t.memberExpression(t.cloneNode(currentId), t.identifier('get')),
    [t.identifier('key')]
  );
  const equalsCall = t.callExpression(
    t.identifier('equals'),
    [existingId, valueId]
  );

  const prelude = [
    t.variableDeclaration('const', [
      t.variableDeclarator(
        currentId,
        t.memberExpression(t.thisExpression(), t.identifier(prop.name))
      ),
    ]),
    t.ifStatement(
      optionalHasKey,
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
  // Use optional chaining: currentId?.has(key)
  const optionalHasKey = t.optionalCallExpression(
    t.optionalMemberExpression(currentId, t.identifier('has'), false, true),
    [t.identifier('key')],
    false
  );
  const prelude = [
    t.variableDeclaration('const', [
      t.variableDeclarator(
        currentId,
        t.memberExpression(t.thisExpression(), t.identifier(prop.name))
      ),
    ]),
    t.ifStatement(
      t.unaryExpression('!', optionalHasKey),
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
      t.variableDeclarator(
        currentId,
        t.memberExpression(t.thisExpression(), t.identifier(prop.name))
      ),
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
  return prop.mapKeyType
    ? wrapImmutableType(t.cloneNode(prop.mapKeyType))
    : t.tsUnknownKeyword();
}

function cloneMapValueType(prop: PropDescriptor): t.TSType {
  if (prop.mapValueInputType) {
    return t.cloneNode(prop.mapValueInputType);
  }
  return prop.mapValueType
    ? wrapImmutableType(t.cloneNode(prop.mapValueType))
    : t.tsUnknownKeyword();
}

function cloneSetElementType(prop: PropDescriptor): t.TSType {
  if (prop.setElementInputType) {
    return t.cloneNode(prop.setElementInputType);
  }
  return prop.setElementType
    ? wrapImmutableType(t.cloneNode(prop.setElementType))
    : t.tsUnknownKeyword();
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
  // buildInputAcceptingMutable already includes Iterable<[K, V]> in the union
  const mapInputUnion = buildInputAcceptingMutable(
    t.tsTypeReference(
      t.identifier('ImmutableMap'),
      t.tsTypeParameterInstantiation([keyType, valueType])
    )
  );
  entriesId.typeAnnotation = t.tsTypeAnnotation(mapInputUnion);
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

function buildSetFilterParams(unused_prop: PropDescriptor): t.Identifier[] {
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
  if (prop.setElementType) {
    mapperId.typeAnnotation = t.tsTypeAnnotation(
      t.tsFunctionType(
        null,
        [t.identifier(valueId.name)],
        t.tsTypeAnnotation(t.cloneNode(prop.setElementType))
      )
    );
  }
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

/**
 * Builds the [WITH_CHILD] method that replaces a child at a given key.
 * This is part of the hybrid approach for update propagation.
 */
function buildWithChildMethod(
  typeName: string,
  propDescriptors: (PropDescriptor & { privateName: t.PrivateName })[],
  declaredMessageTypeNames: Set<string>,
  typeParameters: TypeParameter[] = []
): t.ClassMethod | null {
  // Find all message-type children (including collections with messages)
  const messageChildren = propDescriptors.filter(
    (prop) =>
      prop.isMessageType
      || prop.isArray
      || prop.isMap
      || prop.isSet
  );

  if (messageChildren.length === 0) {
    return null;
  }

  const keyId = t.identifier('key');
  keyId.typeAnnotation = t.tsTypeAnnotation(
    t.tsUnionType([t.tsStringKeyword(), t.tsNumberKeyword()])
  );

  const childId = t.identifier('child');
  childId.typeAnnotation = t.tsTypeAnnotation(t.tsUnknownKeyword());

  // Build switch cases for each child property
  const switchCases: t.SwitchCase[] = messageChildren.map((prop) => {
    // Create new instance with this property replaced
    // Cast child to the property's actual type
    const propsObject = t.objectExpression(
      propDescriptors.map((p) =>
        t.objectProperty(
          t.identifier(p.name),
          p === prop
            ? t.tsAsExpression(
              t.cloneNode(childId), t.cloneNode(p.typeAnnotation)
            )
            : t.memberExpression(
              t.thisExpression(), t.cloneNode(p.privateName)
            )
        )
      )
    );

    // Build constructor args with class refs for generics
    const constructorArgs: t.Expression[] = [];
    if (typeParameters.length > 0) {
      for (const param of typeParameters) {
        const fieldName = getConstructorFieldName(param.name);
        constructorArgs.push(
          t.memberExpression(
            t.thisExpression(),
            t.privateName(t.identifier(fieldName))
          )
        );
      }
    }
    constructorArgs.push(propsObject);

    // For generic types, cast to 'this' to satisfy polymorphic return
    let returnExpr: t.Expression = t.newExpression(
      t.identifier(typeName), constructorArgs
    );
    if (typeParameters.length > 0) {
      returnExpr = t.tsAsExpression(returnExpr, t.tsThisType());
    }

    return t.switchCase(t.stringLiteral(prop.name), [
      t.returnStatement(returnExpr),
    ]);
  });

  // Add default case that throws
  switchCases.push(
    t.switchCase(null, [
      t.throwStatement(
        t.newExpression(t.identifier('Error'), [
          t.templateLiteral(
            [
              t.templateElement({ raw: 'Unknown key: ', cooked: 'Unknown key: ' }),
              t.templateElement({ raw: '', cooked: '' }, true),
            ],
            [t.cloneNode(keyId)]
          ),
        ])
      ),
    ])
  );

  const body = t.blockStatement([
    t.switchStatement(t.cloneNode(keyId), switchCases),
  ]);

  const withChildMethod = t.classMethod(
    'method',
    t.identifier('[WITH_CHILD]'),
    [keyId, childId],
    body
  );
  withChildMethod.computed = true;
  withChildMethod.key = t.identifier('WITH_CHILD');
  withChildMethod.override = true; // Override base class method
  // For generic types, use 'this' return type to match base class polymorphism
  withChildMethod.returnType = t.tsTypeAnnotation(
    typeParameters.length > 0
      ? t.tsThisType()
      : buildGenericTypeReference(typeName, typeParameters)
  );

  return withChildMethod;
}

/**
 * Builds the [GET_MESSAGE_CHILDREN] generator method.
 * This is part of the hybrid approach for propagating listeners to children.
 */
function buildGetMessageChildrenMethod(
  propDescriptors: (PropDescriptor & { privateName: t.PrivateName })[],
  state: PluginStateFlags
): t.ClassMethod | null {
  // Find all message-type children (including collections with messages)
  const messageChildren = propDescriptors.filter(
    (prop) =>
      prop.isMessageType
      || prop.isArray
      || prop.isMap
      || prop.isSet
  );

  if (messageChildren.length === 0) {
    return null;
  }

  // Mark that we need type-only imports for the yield type union
  // Use separate flags so these don't become value imports when only needed as types
  state.usesDataObject = true;
  state.needsImmutableArrayType = true;
  state.needsImmutableMapType = true;
  state.needsImmutableSetType = true;

  // Build yield statements for each child
  // Use union type matching base class return type instead of 'any'
  const childValueType = t.tsUnionType([
    t.tsTypeReference(
      t.identifier('Message'),
      t.tsTypeParameterInstantiation([t.tsTypeReference(t.identifier('DataObject'))])
    ),
    t.tsTypeReference(
      t.identifier('ImmutableArray'),
      t.tsTypeParameterInstantiation([t.tsUnknownKeyword()])
    ),
    t.tsTypeReference(
      t.identifier('ImmutableMap'),
      t.tsTypeParameterInstantiation([
        t.tsUnknownKeyword(), t.tsUnknownKeyword()
      ])
    ),
    t.tsTypeReference(
      t.identifier('ImmutableSet'),
      t.tsTypeParameterInstantiation([t.tsUnknownKeyword()])
    ),
  ]);

  const yieldStatements = messageChildren.map((prop) =>
    t.expressionStatement(
      t.yieldExpression(
        t.tsAsExpression(
          t.arrayExpression([
            t.stringLiteral(prop.name),
            t.memberExpression(
              t.thisExpression(), t.cloneNode(prop.privateName)
            ),
          ]),
          t.tsTupleType([
            t.tsStringKeyword(),
            childValueType
          ])
        )
      )
    )
  );

  const body = t.blockStatement(yieldStatements);

  const method = t.classMethod(
    'method',
    t.identifier('GET_MESSAGE_CHILDREN'),
    [],
    body
  );
  method.computed = true;
  method.generator = true;
  method.override = true; // Override base class method

  return method;
}
