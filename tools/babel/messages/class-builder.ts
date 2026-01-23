import * as t from '@babel/types';
import { capitalize, getSingularPlural } from './utils.js';
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
  buildImmutableMapExpression,
  buildImmutableMapWithConversionsExpression,
  buildImmutableSetExpression,
  buildImmutableSetOfMessagesExpression,
  buildMessageNormalizationExpression,
} from './normalizers.js';
import type { MapConversionInfo } from './normalizers.js';
import {
  getTypeName,
  isArrayTypeNode,
  isArrayBufferReference,
  isImmutableArrayBufferReference,
  isMapReference,
} from './type-guards.js';
import type { TypeRegistry } from '@/types/src/registry.js';
import type { ValidatorImportTracker } from './validator-import-tracker.js';
import {
  buildValidateMethod,
  buildValidateAllMethod,
  buildValidateCall,
  extractPropertyValidations,
  hasAnyValidation,
  type ValidationBuildContext,
} from './validation-builder.js';

type UnionMessageTypeRef = {
  name: string;
  typeArgs: t.Expression[];
};

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

function buildInstanceofCheck(
  valueId: t.Expression,
  className: string
): t.BinaryExpression {
  const castValueId = t.tsAsExpression(
    t.cloneNode(valueId),
    t.tsTypeReference(t.identifier('object'))
  );
  return t.binaryExpression('instanceof', castValueId, t.identifier(className));
}

function buildWrapperRuntimeTypeCheckExpression(
  typeNode: t.TSType | null,
  valueId: t.Expression
): t.Expression | null {
  if (!typeNode) {
    return null;
  }
  if (t.isTSParenthesizedType(typeNode)) {
    return buildWrapperRuntimeTypeCheckExpression(typeNode.typeAnnotation, valueId);
  }
  if (t.isTSTypeReference(typeNode)) {
    if (
      isArrayBufferReference(typeNode)
      || isImmutableArrayBufferReference(typeNode)
    ) {
      return buildInstanceofCheck(valueId, 'ArrayBuffer');
    }
  }
  return buildRuntimeTypeCheckExpression(typeNode, valueId);
}

function buildTypeArgExpression(typeNode: t.TSType): t.Expression | null {
  if (t.isTSParenthesizedType(typeNode)) {
    return buildTypeArgExpression(typeNode.typeAnnotation);
  }

  if (t.isTSNullKeyword(typeNode)) {
    return t.nullLiteral();
  }

  if (t.isTSUndefinedKeyword(typeNode)) {
    return t.identifier('undefined');
  }

  if (t.isTSLiteralType(typeNode)) {
    const literal = typeNode.literal;
    if (t.isStringLiteral(literal)) {
      return t.stringLiteral(literal.value);
    }
    if (t.isNumericLiteral(literal)) {
      return t.numericLiteral(literal.value);
    }
    if (t.isBooleanLiteral(literal)) {
      return t.booleanLiteral(literal.value);
    }
    if (t.isBigIntLiteral(literal)) {
      return t.bigIntLiteral(literal.value);
    }
    if (
      t.isUnaryExpression(literal)
      && t.isNumericLiteral(literal.argument)
      && (literal.operator === '-' || literal.operator === '+')
    ) {
      return t.unaryExpression(literal.operator, t.numericLiteral(literal.argument.value));
    }
  }

  return null;
}

function buildTypeArgumentExpressions(typeNode: t.TSType | null): t.Expression[] {
  const unwrapped = unwrapParenthesizedType(typeNode);
  if (!unwrapped || !t.isTSTypeReference(unwrapped) || !unwrapped.typeParameters) {
    return [];
  }
  return unwrapped.typeParameters.params.map((param) =>
    buildTypeArgExpression(param) ?? t.identifier('undefined')
  );
}

function buildTypeArgumentTypes(typeNode: t.TSType | null): t.TSType[] {
  const unwrapped = unwrapParenthesizedType(typeNode);
  if (!unwrapped || !t.isTSTypeReference(unwrapped) || !unwrapped.typeParameters) {
    return [];
  }
  return unwrapped.typeParameters.params.map((param) => t.cloneNode(param));
}

function buildFromCompactCall(
  messageTypeName: string,
  valueExpr: t.Expression,
  typeArgs: t.Expression[],
  optionsExpr?: t.Expression
): t.Expression {
  const args: t.Expression[] = [
    ...typeArgs.map((arg) => t.cloneNode(arg)),
    t.cloneNode(valueExpr),
  ];
  if (optionsExpr) {
    args.push(t.cloneNode(optionsExpr));
  }
  return t.callExpression(
    t.memberExpression(t.identifier(messageTypeName), t.identifier('fromCompact')),
    args
  );
}

function buildCompactPayloadExpression(
  valueExpr: t.Expression,
  messageTypeName: string
): t.Expression {
  const compactTag = t.memberExpression(
    t.identifier(messageTypeName),
    t.identifier('$compactTag')
  );
  const startsWith = t.callExpression(
    t.memberExpression(t.cloneNode(valueExpr), t.identifier('startsWith')),
    [t.cloneNode(compactTag)]
  );
  const shouldStrip = t.logicalExpression(
    '&&',
    t.cloneNode(compactTag),
    startsWith
  );
  return t.conditionalExpression(
    shouldStrip,
    t.callExpression(
      t.memberExpression(t.cloneNode(valueExpr), t.identifier('slice')),
      [t.memberExpression(t.cloneNode(compactTag), t.identifier('length'))]
    ),
    t.cloneNode(valueExpr)
  );
}

function buildCompactCoercionExpression(
  valueExpr: t.Expression,
  messageTypeName: string,
  typeArgs: t.Expression[],
  optionsExpr?: t.Expression
): t.Expression {
  const stringCheck = t.binaryExpression(
    '===',
    t.unaryExpression('typeof', t.cloneNode(valueExpr)),
    t.stringLiteral('string')
  );
  const compactCheck = t.binaryExpression(
    '===',
    t.memberExpression(t.identifier(messageTypeName), t.identifier('$compact')),
    t.booleanLiteral(true)
  );
  const payloadExpr = buildCompactPayloadExpression(
    t.cloneNode(valueExpr),
    messageTypeName
  );
  const fromCompact = buildFromCompactCall(
    messageTypeName,
    payloadExpr,
    typeArgs,
    optionsExpr
  );
  const typedFromCompact = t.tsAsExpression(fromCompact, t.tsAnyKeyword());
  return t.conditionalExpression(
    t.logicalExpression('&&', stringCheck, compactCheck),
    typedFromCompact,
    t.cloneNode(valueExpr)
  );
}

/**
 * Check if two types are equivalent for the purpose of avoiding redundant casts.
 * Returns true for primitives (string, number, boolean, etc.) that don't need casts.
 */
function typesAreEquivalent(a: t.TSType | null, b: t.TSType | null): boolean {
  if (!a || !b) return false;

  // Unwrap parentheses
  const unwrappedA = unwrapParenthesizedType(a);
  const unwrappedB = unwrapParenthesizedType(b);
  if (!unwrappedA || !unwrappedB) return false;

  // Same node type check
  if (unwrappedA.type !== unwrappedB.type) return false;

  // Primitive keywords - if types match, they're equivalent
  if (
    t.isTSStringKeyword(unwrappedA) ||
    t.isTSNumberKeyword(unwrappedA) ||
    t.isTSBooleanKeyword(unwrappedA) ||
    t.isTSNullKeyword(unwrappedA) ||
    t.isTSUndefinedKeyword(unwrappedA) ||
    t.isTSBigIntKeyword(unwrappedA)
  ) {
    return true;
  }

  // For type references, compare the type name
  if (t.isTSTypeReference(unwrappedA) && t.isTSTypeReference(unwrappedB)) {
    const nameA = t.isIdentifier(unwrappedA.typeName)
      ? unwrappedA.typeName.name
      : null;
    const nameB = t.isIdentifier(unwrappedB.typeName)
      ? unwrappedB.typeName.name
      : null;
    // Only consider equivalent if both are simple identifiers with same name
    // and neither has type parameters
    if (
      nameA && nameB && nameA === nameB &&
      !unwrappedA.typeParameters && !unwrappedB.typeParameters
    ) {
      return true;
    }
  }

  // For literal types, compare the literal value
  if (t.isTSLiteralType(unwrappedA) && t.isTSLiteralType(unwrappedB)) {
    const litA = unwrappedA.literal;
    const litB = unwrappedB.literal;
    if (t.isStringLiteral(litA) && t.isStringLiteral(litB)) {
      return litA.value === litB.value;
    }
    if (t.isNumericLiteral(litA) && t.isNumericLiteral(litB)) {
      return litA.value === litB.value;
    }
    if (t.isBooleanLiteral(litA) && t.isBooleanLiteral(litB)) {
      return litA.value === litB.value;
    }
  }

  // Default: not equivalent (conservative - add cast if unsure)
  return false;
}

function isStringTypeNode(node: t.TSType | null): boolean {
  const unwrapped = unwrapParenthesizedType(node);
  return Boolean(unwrapped && t.isTSStringKeyword(unwrapped));
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
      if (isMapReference(prop.mapKeyType)) {
        conversions.keyIsMap = true;
      } else {
        const keyTypeName = prop.mapKeyMessageTypeName
          ?? (getTypeName(prop.mapKeyType) && declaredMessageTypeNames.has(getTypeName(prop.mapKeyType)!) 
            ? getTypeName(prop.mapKeyType)
            : null);
        if (keyTypeName) {
          conversions.keyIsMessage = keyTypeName;
        }
      }
    }
  }

  // Check value type
  if (prop.mapValueType && t.isTSTypeReference(prop.mapValueType)) {
    const valueTypeName = prop.mapValueMessageTypeName
      ?? (getTypeName(prop.mapValueType) && declaredMessageTypeNames.has(getTypeName(prop.mapValueType)!)
        ? getTypeName(prop.mapValueType)
        : null);
    if (valueTypeName) {
      conversions.valueIsMessage = valueTypeName;
    }
  }

  return conversions;
}

function needsMapConversions(conversions: MapConversionInfo): boolean {
  return Boolean(
    conversions.keyIsArray
    || conversions.keyIsMap
    || conversions.keyIsMessage
    || conversions.valueIsMessage
  );
}

/**
 * Build a key conversion expression for map operations.
 * Converts input types (array, Map, Message) to internal types.
 * Uses static `from` methods for cleaner generated code.
 */
function buildKeyConversionExpr(
  keyExpr: t.Expression,
  conversions: MapConversionInfo
): t.Expression {
  if (conversions.keyIsArray) {
    // ImmutableArray.from(k)
    return t.callExpression(
      t.memberExpression(t.identifier('ImmutableArray'), t.identifier('from')),
      [t.cloneNode(keyExpr)]
    );
  }
  if (conversions.keyIsMap) {
    // ImmutableMap.from(k)
    return t.callExpression(
      t.memberExpression(t.identifier('ImmutableMap'), t.identifier('from')),
      [t.cloneNode(keyExpr)]
    );
  }
  if (conversions.keyIsMessage) {
    // MessageType.from(k)
    return t.callExpression(
      t.memberExpression(t.identifier(conversions.keyIsMessage), t.identifier('from')),
      [t.cloneNode(keyExpr)]
    );
  }
  return keyExpr;
}

/**
 * Build a value conversion expression for map operations.
 * Converts input types (Message) to internal types.
 * Uses static `from` methods for cleaner generated code.
 */
function buildValueConversionExpr(
  valueExpr: t.Expression,
  conversions: MapConversionInfo
): t.Expression {
  if (conversions.valueIsMessage) {
    // MessageType.from(v)
    return t.callExpression(
      t.memberExpression(t.identifier(conversions.valueIsMessage), t.identifier('from')),
      [t.cloneNode(valueExpr)]
    );
  }
  return valueExpr;
}

/**
 * Get the private field name for a type parameter's constructor reference.
 * E.g., 'T' -> '#tClass', 'U' -> '#uClass'
 */
function getConstructorFieldName(paramName: string): string {
  return `${paramName.toLowerCase()}Class`;
}

function getMessageTypeParameters(
  typeParameters: TypeParameter[]
): TypeParameter[] {
  return typeParameters.filter((param) => param.requiresConstructor);
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
 * Build a structural constraint for message type parameters.
 * Uses AnyMessage shape to match the runtime's AnyMessage interface.
 */
function buildMessageConstraint(): t.TSTypeLiteral {
  return t.tsTypeLiteral([
    t.tsPropertySignature(
      t.identifier('$typeName'),
      t.tsTypeAnnotation(t.tsStringKeyword())
    ),
    t.tsMethodSignature(
      t.identifier('serialize'),
      null,
      [],
      t.tsTypeAnnotation(t.tsStringKeyword())
    ),
    t.tsMethodSignature(
      t.identifier('hashCode'),
      null,
      [],
      t.tsTypeAnnotation(t.tsNumberKeyword())
    ),
    t.tsMethodSignature(
      t.identifier('equals'),
      null,
      [
        {
          ...t.identifier('other'),
          typeAnnotation: t.tsTypeAnnotation(t.tsUnknownKeyword()),
        } as t.Identifier,
      ],
      t.tsTypeAnnotation(t.tsBooleanKeyword())
    ),
  ]);
}

function isMessageConstraintTypeNode(
  constraint: t.TSType | null
): boolean {
  return Boolean(
    constraint
    && t.isTSTypeReference(constraint)
    && t.isIdentifier(constraint.typeName)
    && constraint.typeName.name === 'Message'
  );
}
/**
 * Build the class type parameters for a generic message.
 * E.g., Container<T extends { $typeName: string; serialize(): string }> becomes:
 * t.tsTypeParameterDeclaration([t.tsTypeParameter('T', constraint, null)])
 */
function buildClassTypeParameters(
  typeParameters: TypeParameter[]
): t.TSTypeParameterDeclaration | null {
  if (typeParameters.length === 0) {
    return null;
  }

  const params = typeParameters.map((param) => {
    const constraint = param.constraint
      ? isMessageConstraintTypeNode(param.constraint)
        ? buildMessageConstraint()
        : t.cloneNode(param.constraint)
      : null;

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
  const messageTypeParameters = getMessageTypeParameters(typeParameters);
  return messageTypeParameters.map((param) => {
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
    // Add definite assignment assertion (!) for early-return constructor pattern
    field.definite = true;

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
  const messageTypeParameters = getMessageTypeParameters(typeParameters);
  return messageTypeParameters.map((param) => {
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
  const messageTypeParameters = getMessageTypeParameters(typeParameters);
  return messageTypeParameters.map((param) => {
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
  const messageTypeParameters = getMessageTypeParameters(typeParameters);
  if (messageTypeParameters.length === 0) {
    return t.stringLiteral(typeName);
  }

  // Build template literal: `TypeName<${tClass.$typeName},...>`
  const quasis: t.TemplateElement[] = [];
  const expressions: t.Expression[] = [];

  // First quasi: "TypeName<"
  quasis.push(t.templateElement({ raw: `${typeName}<`, cooked: `${typeName}<` }, false));

  for (const [index, param] of messageTypeParameters.entries()) {
    const fieldName = getConstructorFieldName(param.name);
    // Expression: tClass.$typeName
    expressions.push(
      t.memberExpression(
        t.identifier(fieldName),
        t.identifier('$typeName')
      )
    );

    // Quasi after expression: "," or ">"
    const isLast = index === messageTypeParameters.length - 1;
    quasis.push(t.templateElement(
      { raw: isLast ? '>' : ',', cooked: isLast ? '>' : ',' },
      isLast
    ));
  }

  return t.templateLiteral(quasis, expressions);
}

/**
 * Build a new expression using this.constructor to support class extension.
 * Generates: new (this.constructor as typeof TypeName)(...args)
 * This pattern ensures that extended classes create instances of the
 * extended class rather than the base class.
 */
function buildThisConstructorNewExpression(
  typeName: string,
  constructorArgs: t.Expression[]
): t.NewExpression {
  // (this.constructor as typeof TypeName)
  const castConstructor = t.tsAsExpression(
    t.memberExpression(t.thisExpression(), t.identifier('constructor')),
    t.tsTypeQuery(t.identifier(typeName))
  );

  return t.newExpression(castConstructor, constructorArgs);
}

/**
 * Build the static bind() method for generic messages.
 */
function buildBindMethod(
  typeName: string,
  className: string,
  typeParameters: TypeParameter[],
  properties: PropDescriptor[],
  state: PluginStateFlags
): t.ClassMethod | null {
  const messageTypeParameters = getMessageTypeParameters(typeParameters);
  if (messageTypeParameters.length === 0) {
    return null;
  }

  // We need parseCerealString for the deserialize implementation
  state.usesParseCerealString = true;
  state.usesDataObject = true;

  // Build type parameters for the static method
  const methodTypeParams = buildClassTypeParameters(typeParameters);

  // Build parameters: tClass: MessageConstructor<T>, ...
  const params = buildConstructorClassParams(typeParameters);

  // Return type: callable factory function with deserialize and $typeName
  // ((props: TypeName.Value<T>) => TypeName<T>) & { deserialize: (data: string) => TypeName<T>; $typeName: string; }
  const returnTypeParams = typeParameters.map((param) =>
    t.tsTypeReference(t.identifier(param.name))
  );
  const instanceType = t.tsTypeReference(
    t.identifier(className),
    t.tsTypeParameterInstantiation(returnTypeParams)
  );

  // Build params type for signatures: props: TypeName.Value<T>
  const funcParam = t.identifier('props');
  funcParam.typeAnnotation = t.tsTypeAnnotation(
    t.tsTypeReference(
      t.tsQualifiedName(t.identifier(typeName), t.identifier('Value')),
      t.tsTypeParameterInstantiation(returnTypeParams)
    )
  );

  // Build return type as a type literal with call, construct, and property signatures:
  // {
  //   (props: TypeName.Value<T>): TypeName<T>;          // call signature
  //   new (props: TypeName.Value<T>): TypeName<T>;      // construct signature
  //   deserialize(data: string): TypeName<T>;
  //   $typeName: string;
  // }

  // Call signature: (props: TypeName.Value<T>) => TypeName<T>
  const callSignature = t.tsCallSignatureDeclaration(
    null,
    [t.cloneNode(funcParam)],
    t.tsTypeAnnotation(t.cloneNode(instanceType))
  );

  // Construct signature: new (props: TypeName.Value<T>) => TypeName<T>
  const constructSignature = t.tsConstructSignatureDeclaration(
    null,
    [t.cloneNode(funcParam)],
    t.tsTypeAnnotation(t.cloneNode(instanceType))
  );

  // deserialize property
  const deserializeParam = t.identifier('data');
  deserializeParam.typeAnnotation = t.tsTypeAnnotation(t.tsStringKeyword());
  const deserializeOptionsParam = t.identifier('options');
  deserializeOptionsParam.typeAnnotation = t.tsTypeAnnotation(
    t.tsTypeLiteral([
      t.tsPropertySignature(
        t.identifier('skipValidation'),
        t.tsTypeAnnotation(t.tsBooleanKeyword())
      )
    ])
  );
  deserializeOptionsParam.optional = true;
  const deserializeFuncType = t.tsFunctionType(
    null,
    [deserializeParam, deserializeOptionsParam],
    t.tsTypeAnnotation(t.cloneNode(instanceType))
  );
  const deserializeProp = t.tsPropertySignature(
    t.identifier('deserialize'),
    t.tsTypeAnnotation(deserializeFuncType)
  );

  // $typeName property
  const typeNameProp = t.tsPropertySignature(
    t.identifier('$typeName'),
    t.tsTypeAnnotation(t.tsStringKeyword())
  );

  // $typeId property (optional)
  const typeIdProp = t.tsPropertySignature(
    t.identifier('$typeId'),
    t.tsTypeAnnotation(t.tsStringKeyword())
  );
  typeIdProp.optional = true;

  // $typeHash property (optional)
  const typeHashProp = t.tsPropertySignature(
    t.identifier('$typeHash'),
    t.tsTypeAnnotation(t.tsStringKeyword())
  );
  typeHashProp.optional = true;

  // isInstance property (type predicate)
  const isInstanceParam = t.identifier('value');
  isInstanceParam.typeAnnotation = t.tsTypeAnnotation(t.tsUnknownKeyword());
  const isInstanceReturn = t.tsTypeAnnotation(
    t.tsTypePredicate(
      t.identifier('value'),
      t.tsTypeAnnotation(t.cloneNode(instanceType))
    )
  );
  const isInstanceFuncType = t.tsFunctionType(
    null,
    [t.cloneNode(isInstanceParam)],
    isInstanceReturn
  );
  const isInstanceProp = t.tsPropertySignature(
    t.identifier('isInstance'),
    t.tsTypeAnnotation(isInstanceFuncType)
  );

  // Combine into type literal
  const returnType = t.tsTypeLiteral([
    callSignature,
    constructSignature,
    deserializeProp,
    typeNameProp,
    typeIdProp,
    typeHashProp,
    isInstanceProp
  ]);

  // Build the bound constructor function that reconstructs generic type parameter fields
  // const boundCtor = function(props: TypeName.Value<T>) {
  //   const inner = props.inner instanceof tClass ? props.inner : new tClass(props.inner as any);
  //   return new TypeName(tClass, { ...props, inner });
  // }
  const propsParam = t.identifier('props');
  propsParam.typeAnnotation = t.tsTypeAnnotation(
    t.tsTypeReference(
      t.tsQualifiedName(t.identifier(typeName), t.identifier('Value')),
      t.tsTypeParameterInstantiation(returnTypeParams)
    )
  );

  // Find properties that are generic type parameters
  const genericProps = properties.filter(
    (prop) =>
      prop.isGenericParam
      && prop.genericParamName
      && prop.genericParamRequiresConstructor
  );

  // Build reconstruction statements for each generic property
  const reconstructionStatements: t.Statement[] = [];
  const reconstructedPropNames: string[] = [];

  for (const prop of genericProps) {
    const propName = prop.name;
    const paramName = prop.genericParamName!;
    const tClassName = getConstructorFieldName(paramName);
    reconstructedPropNames.push(propName);

    // const propName = props.propName instanceof tClass
    //   ? props.propName
    //   : new tClass(props.propName as any);
    // For optional fields:
    // const propName = props.propName === undefined
    //   ? undefined
    //   : props.propName instanceof tClass
    //     ? props.propName
    //     : new tClass(props.propName as any);

    const propAccess = t.memberExpression(t.identifier('props'), t.identifier(propName));
    const instanceofCheck = t.binaryExpression(
      'instanceof',
      t.cloneNode(propAccess),
      t.identifier(tClassName)
    );
    const constructCall = t.newExpression(
      t.identifier(tClassName),
      [t.tsAsExpression(t.cloneNode(propAccess), t.tsAnyKeyword())]
    );
    const reconstructExpr = t.conditionalExpression(
      instanceofCheck,
      t.cloneNode(propAccess),
      constructCall
    );

    // For optional fields, check for undefined first
    const finalExpr: t.Expression = prop.optional
      ? t.conditionalExpression(
          t.binaryExpression(
            '===', t.cloneNode(propAccess), t.identifier('undefined')
          ),
          t.identifier('undefined'),
          reconstructExpr
        )
      : reconstructExpr;

    reconstructionStatements.push(
      t.variableDeclaration('const', [
        t.variableDeclarator(t.identifier(propName), finalExpr)
      ])
    );
  }

  // Build the constructor call with reconstructed props
  const constructorArgs: t.Expression[] =
    messageTypeParameters.map(
      (param) => t.identifier(getConstructorFieldName(param.name))
    );

  let propsArg: t.Expression;
  // eslint-disable-next-line unicorn/prefer-ternary -- complex expression
  if (reconstructedPropNames.length > 0) {
    // { ...props, propName1, propName2, ... }
    // Cast to Value<T, ...> to satisfy TypeScript when there are non-generic required fields
    const valueTypeParams = typeParameters.map((param) =>
      t.tsTypeReference(t.identifier(param.name))
    );
    const valueType = t.tsTypeReference(
      t.tsQualifiedName(t.identifier(typeName), t.identifier('Value')),
      t.tsTypeParameterInstantiation(valueTypeParams)
    );
    propsArg = t.tsAsExpression(
      t.objectExpression([
        t.spreadElement(t.identifier('props')),
        ...reconstructedPropNames.map((name) => t.objectProperty(
          t.identifier(name),
          t.identifier(name),
          false,
          true // shorthand
        ))
      ]),
      valueType
    );
  } else {
    propsArg = t.identifier('props');
  }
  constructorArgs.push(propsArg);

  const boundCtorBody = t.blockStatement([
    ...reconstructionStatements,
    t.returnStatement(t.newExpression(t.identifier(className), constructorArgs))
  ]);

  const boundCtorFn = t.functionExpression(
    null,
    [propsParam],
    boundCtorBody
  );

  const boundCtorDecl = t.variableDeclaration('const', [
    t.variableDeclarator(t.identifier('boundCtor'), boundCtorFn)
  ]);

  // Build deserialize function that delegates to static deserialize:
  // boundCtor.deserialize = (data: string, options?: { skipValidation?: boolean }) => {
  //   return TypeName.deserialize(tClass, data, options);
  // };
  const dataParam = t.identifier('data');
  dataParam.typeAnnotation = t.tsTypeAnnotation(t.tsStringKeyword());

  const optionsParam = t.identifier('options');
  optionsParam.typeAnnotation = t.tsTypeAnnotation(
    t.tsTypeLiteral([
      t.tsPropertySignature(
        t.identifier('skipValidation'),
        t.tsTypeAnnotation(t.tsBooleanKeyword())
      ),
    ])
  );
  optionsParam.optional = true;

  // return TypeName.deserialize(tClass, uClass, ..., data, options);
  const deserializeArgs = [
    ...messageTypeParameters.map((param) =>
      t.identifier(getConstructorFieldName(param.name))
    ),
    t.identifier('data'),
    t.identifier('options')
  ];
  const deserializeReturn = t.returnStatement(
    t.callExpression(
      t.memberExpression(t.identifier(className), t.identifier('deserialize')),
      deserializeArgs
    )
  );

  const deserializeAssign = t.expressionStatement(
    t.assignmentExpression(
      '=',
      t.memberExpression(t.identifier('boundCtor'), t.identifier('deserialize')),
      t.arrowFunctionExpression([dataParam, optionsParam], t.blockStatement([deserializeReturn]))
    )
  );

  // boundCtor.$typeName = `TypeName<${tClass.$typeName}>`;
  const typeNameAssign = t.expressionStatement(
    t.assignmentExpression(
      '=',
      t.memberExpression(t.identifier('boundCtor'), t.identifier('$typeName')),
      buildTypeNameExpression(typeName, messageTypeParameters)
    )
  );

  // boundCtor.$typeId = TypeName.$typeId;
  const typeIdAssign = t.expressionStatement(
    t.assignmentExpression(
      '=',
      t.memberExpression(t.identifier('boundCtor'), t.identifier('$typeId')),
      t.memberExpression(t.identifier(className), t.identifier('$typeId'))
    )
  );

  // boundCtor.$typeHash = TypeName.$typeHash;
  const typeHashAssign = t.expressionStatement(
    t.assignmentExpression(
      '=',
      t.memberExpression(t.identifier('boundCtor'), t.identifier('$typeHash')),
      t.memberExpression(t.identifier(className), t.identifier('$typeHash'))
    )
  );

  // boundCtor.$compact = TypeName.$compact;
  const compactAssign = t.expressionStatement(
    t.assignmentExpression(
      '=',
      t.memberExpression(t.identifier('boundCtor'), t.identifier('$compact')),
      t.memberExpression(t.identifier(className), t.identifier('$compact'))
    )
  );

  const compactTagAssign = t.expressionStatement(
    t.assignmentExpression(
      '=',
      t.memberExpression(t.identifier('boundCtor'), t.identifier('$compactTag')),
      t.memberExpression(t.identifier(className), t.identifier('$compactTag'))
    )
  );

  // boundCtor.isInstance = (value) => TypeName.isInstance(value);
  const isInstanceAssign = t.expressionStatement(
    t.assignmentExpression(
      '=',
      t.memberExpression(t.identifier('boundCtor'), t.identifier('isInstance')),
      t.arrowFunctionExpression(
        [t.cloneNode(isInstanceParam)],
        t.callExpression(
          t.memberExpression(t.identifier(className), t.identifier('isInstance')),
          [t.identifier('value')]
        )
      )
    )
  );

  // return boundCtor as ReturnType;
  // Cast is needed because functions can't have construct signatures in JS,
  // but TypeScript allows using them with 'new' when the type says so
  const returnStmt = t.returnStatement(
    t.tsAsExpression(
      t.tsAsExpression(t.identifier('boundCtor'), t.tsUnknownKeyword()),
      returnType
    )
  );

  const methodBody = t.blockStatement([
    boundCtorDecl,
    deserializeAssign,
    typeNameAssign,
    typeIdAssign,
    typeHashAssign,
    compactAssign,
    compactTagAssign,
    isInstanceAssign,
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
 * Build the static deserialize() override for generic messages.
 * This provides a unified deserialization API:
 *   Container.deserialize(Item, data) for generic messages
 *   User.deserialize(data) for non-generic messages (inherited from base)
 */
function buildGenericDeserializeMethod(
  typeName: string,
  className: string,
  typeParameters: TypeParameter[],
  properties: PropDescriptor[],
  declaredMessageTypeNames: Set<string>,
  state: PluginStateFlags
): t.ClassMethod | null {
  if (typeParameters.length === 0) {
    return null;
  }
  const messageTypeParameters = getMessageTypeParameters(typeParameters);
  if (messageTypeParameters.length === 0) {
    return null;
  }

  state.usesParseCerealString = true;
  state.usesEnsure = true;
  state.usesDataObject = true;
  state.usesTaggedMessageData = true;
  state.usesTaggedMessageData = true;

  // Build type parameters for the method: <T extends Message<any>, U extends Message<any>, ...>
  const methodTypeParams = buildClassTypeParameters(typeParameters);

  // Build parameters: tClass: MessageConstructor<T>, ..., data: string, options?: { skipValidation?: boolean }
  const typeClassParams = buildConstructorClassParams(typeParameters);
  const dataParam = t.identifier('data');
  dataParam.typeAnnotation = t.tsTypeAnnotation(t.tsStringKeyword());

  // Add options parameter
  const optionsParam = t.identifier('options');
  optionsParam.typeAnnotation = t.tsTypeAnnotation(
    t.tsTypeLiteral([
      t.tsPropertySignature(
        t.identifier('skipValidation'),
        t.tsTypeAnnotation(t.tsBooleanKeyword())
      ),
    ])
  );
  optionsParam.optional = true;

  const params = [...typeClassParams, dataParam, optionsParam];

  // Return type: TypeName<T, U, ...>
  const returnTypeParams = typeParameters.map((param) =>
    t.tsTypeReference(t.identifier(param.name))
  );
  const returnType = t.tsTypeReference(
    t.identifier(className),
    t.tsTypeParameterInstantiation(returnTypeParams)
  );

  const parsedId = t.identifier('parsed');
  const parsedDecl = t.variableDeclaration('const', [
    t.variableDeclarator(
      parsedId,
      t.callExpression(t.identifier('parseCerealString'), [t.identifier('data')])
    ),
  ]);

  const buildCompactPayload = (inputExpr: t.Expression) => {
    const compactTag = t.memberExpression(t.identifier(className), t.identifier('$compactTag'));
    const startsWith = t.callExpression(
      t.memberExpression(t.cloneNode(inputExpr), t.identifier('startsWith')),
      [t.cloneNode(compactTag)]
    );
    const shouldStrip = t.logicalExpression('&&', t.cloneNode(compactTag), startsWith);
    return t.conditionalExpression(
      shouldStrip,
      t.callExpression(
        t.memberExpression(t.cloneNode(inputExpr), t.identifier('slice')),
        [t.memberExpression(t.cloneNode(compactTag), t.identifier('length'))]
      ),
      t.cloneNode(inputExpr)
    );
  };

  const compactCheck = t.binaryExpression(
    '===',
    t.memberExpression(t.identifier(className), t.identifier('$compact')),
    t.booleanLiteral(true)
  );
  const stringCheck = t.binaryExpression(
    '===',
    t.unaryExpression('typeof', t.cloneNode(parsedId)),
    t.stringLiteral('string')
  );
  const compactPayload = buildCompactPayload(t.cloneNode(parsedId));
  const fromCompactCall = t.callExpression(
    t.memberExpression(t.identifier(className), t.identifier('fromCompact')),
    [compactPayload, t.identifier('options')]
  );
  const invalidCompactThrow = buildErrorThrow('Invalid compact message payload.');

  const stringBranch = t.ifStatement(
    stringCheck,
    t.blockStatement([
      t.ifStatement(
        compactCheck,
        t.blockStatement([t.returnStatement(t.tsAsExpression(fromCompactCall, t.tsAnyKeyword()))]),
        t.blockStatement([invalidCompactThrow])
      ),
    ])
  );

  const taggedCheck = t.callExpression(
    t.identifier('isTaggedMessageData'),
    [t.cloneNode(parsedId)]
  );
  const tagMatch = t.binaryExpression(
    '===',
    t.memberExpression(t.cloneNode(parsedId), t.identifier('$tag')),
    t.stringLiteral(typeName)
  );
  const dataExpr = t.memberExpression(t.cloneNode(parsedId), t.identifier('$data'));
  const taggedStringCheck = t.binaryExpression(
    '===',
    t.unaryExpression('typeof', t.cloneNode(dataExpr)),
    t.stringLiteral('string')
  );
  const taggedPayload = buildCompactPayload(t.cloneNode(dataExpr));
  const taggedFromCompact = t.callExpression(
    t.memberExpression(t.identifier(className), t.identifier('fromCompact')),
    [taggedPayload, t.identifier('options')]
  );
  const taggedPropsExpr = t.callExpression(
    t.memberExpression(
      t.memberExpression(t.identifier(className), t.identifier('prototype')),
      t.identifier('$fromEntries')
    ),
    [t.cloneNode(dataExpr), t.identifier('options')]
  );
  const invalidTagThrow = buildErrorThrow(
    `Tagged message type mismatch: expected ${typeName}.`
  );
  const invalidTaggedCompact = buildErrorThrow(
    `Invalid compact tagged value for ${typeName}.`
  );

  const taggedBranch = t.ifStatement(
    taggedCheck,
    t.blockStatement([
      t.ifStatement(
        tagMatch,
        t.blockStatement([
          t.ifStatement(
            taggedStringCheck,
            t.blockStatement([
              t.ifStatement(
                compactCheck,
                t.blockStatement([
                  t.returnStatement(t.tsAsExpression(taggedFromCompact, t.tsAnyKeyword())),
                ]),
                t.blockStatement([invalidTaggedCompact])
              ),
            ]),
            t.blockStatement([
              t.returnStatement(
                t.newExpression(t.identifier(className), [
                  ...typeClassParams.map((param) => t.cloneNode(param)),
                  taggedPropsExpr,
                  t.identifier('options'),
                ])
              ),
            ])
          ),
        ]),
        t.blockStatement([invalidTagThrow])
      ),
    ])
  );

  const payloadDecl = t.variableDeclaration('const', [
    t.variableDeclarator(
      t.identifier('payload'),
      t.tsAsExpression(
        t.callExpression(
          t.memberExpression(t.identifier('ensure'), t.identifier('simpleObject')),
          [t.cloneNode(parsedId)]
        ),
        t.tsTypeReference(t.identifier('DataObject'))
      )
    )
  ]);

  // Separate generic properties (need tClass reconstruction) from non-generic (use helper for validation)
  const genericProps = properties.filter(
    (prop) =>
      prop.isGenericParam
      && prop.genericParamName
      && prop.genericParamRequiresConstructor
  );
  const nonGenericProps = properties.filter(
    (prop) =>
      !prop.isGenericParam
      || !prop.genericParamName
      || !prop.genericParamRequiresConstructor
  );

  const reconstructionStatements: t.Statement[] = [];
  const allPropNames: string[] = [];
  const payloadId = t.identifier('payload');

  // Validate and convert non-generic fields using the helper
  for (const prop of nonGenericProps) {
    const { statements: fieldStatements, finalValueId } = buildFieldValidationStatements(
      prop,
      payloadId,
      declaredMessageTypeNames,
      state,
      { optionsExpr: t.identifier('options') }
    );
    reconstructionStatements.push(...fieldStatements);
    // Store final value in a variable with the property name
    reconstructionStatements.push(
      t.variableDeclaration('const', [
        t.variableDeclarator(t.identifier(prop.name), finalValueId)
      ])
    );
    allPropNames.push(prop.name);
  }

  // Reconstruct generic property fields using tClass
  // const inner = new tClass(payload["1"] ?? payload["inner"], options);
  for (const prop of genericProps) {
    const propName = prop.name;
    const paramName = prop.genericParamName!;
    const tClassName = getConstructorFieldName(paramName);
    allPropNames.push(propName);

    // payload["1"] ?? payload["inner"]
    // Use field number if available, otherwise just use name
    const payloadAccess = prop.fieldNumber === null
      ? t.memberExpression(
          payloadId,
          t.stringLiteral(propName),
          true
        )
      : t.logicalExpression(
          '??',
          t.memberExpression(
            payloadId,
            t.stringLiteral(String(prop.fieldNumber)),
            true
          ),
          t.memberExpression(
            payloadId,
            t.stringLiteral(propName),
            true
          )
        );

    // Cast payload access to `any` since we're parsing untyped data
    // and the props type varies by message class
    const messageValueType = t.tsAnyKeyword();

    // Pass options to nested message constructor for skipValidation propagation
    let constructExpr: t.Expression = t.newExpression(
      t.identifier(tClassName),
      [t.tsAsExpression(payloadAccess, messageValueType), t.identifier('options')]
    );

    // For optional fields, check for undefined
    if (prop.optional) {
      const rawVarName = `${propName}Raw`;
      // const innerRaw = payload["1"] ?? payload["inner"];
      reconstructionStatements.push(
        t.variableDeclaration('const', [
          t.variableDeclarator(t.identifier(rawVarName), payloadAccess)
        ])
      );
      // const inner = innerRaw !== undefined ? new tClass(innerRaw as any, options) : undefined;
      constructExpr = t.conditionalExpression(
        t.binaryExpression('!==', t.identifier(rawVarName), t.identifier('undefined')),
        t.newExpression(t.identifier(tClassName), [
          t.tsAsExpression(t.identifier(rawVarName), messageValueType),
          t.identifier('options')
        ]),
        t.identifier('undefined')
      );
      reconstructionStatements.push(
        t.variableDeclaration('const', [
          t.variableDeclarator(t.identifier(propName), constructExpr)
        ])
      );
    } else {
      reconstructionStatements.push(
        t.variableDeclaration('const', [
          t.variableDeclarator(t.identifier(propName), constructExpr)
        ])
      );
    }
  }

  // Build the constructor call
  // return new TypeName(tClass, uClass, { id, name, inner, other }, options);
  const constructorArgs: t.Expression[] = messageTypeParameters.map(
    (param) => t.identifier(getConstructorFieldName(param.name))
  );

  // Build props object with ALL validated property values (no spread of raw payload)
  const propsArg = t.objectExpression(
    allPropNames.map((name) => t.objectProperty(
      t.identifier(name),
      t.identifier(name),
      false,
      true // shorthand
    ))
  );
  constructorArgs.push(propsArg);
  // Pass options to the constructor for skipValidation propagation
  constructorArgs.push(t.identifier('options'));

  const returnStmt = t.returnStatement(
    t.newExpression(t.identifier(className), constructorArgs)
  );

  const methodBody = t.blockStatement([
    parsedDecl,
    stringBranch,
    taggedBranch,
    payloadDecl,
    ...reconstructionStatements,
    returnStmt
  ]);

  // Generate static deserialize method that hides (not overrides) the base Message.deserialize
  // This is intentional: generic messages require type class parameters that don't match base signature
  const method = t.classMethod(
    'method',
    t.identifier('deserialize'),
    params,
    methodBody,
    false,
    true // static
  );
  method.typeParameters = methodTypeParams;
  method.returnType = t.tsTypeAnnotation(returnType);

  return method;
}

/**
 * Build the static deserialize() method for non-generic messages.
 *
 * @param className The actual class name (e.g., Person$Base for extended types)
 * @param namespaceName The namespace name for types (e.g., Person)
 */
function buildNonGenericDeserializeMethod(
  className: string,
  namespaceName: string,
  state: PluginStateFlags,
  typeParameters: TypeParameter[] = []
): t.ClassMethod {
  state.usesParseCerealString = true;
  state.usesEnsure = true;
  state.usesDataObject = true;
  state.usesTaggedMessageData = true;

  // Type parameter: T extends typeof ClassName
  const typeParam = t.tsTypeParameter(
    t.tsTypeQuery(t.identifier(className)),
    undefined,
    'T'
  );

  // Parameters: this: T, data: string, options?: { skipValidation?: boolean }
  // The `this` parameter enables proper return type for subclasses
  const thisParam = t.identifier('this');
  thisParam.typeAnnotation = t.tsTypeAnnotation(t.tsTypeReference(t.identifier('T')));

  const dataParam = t.identifier('data');
  dataParam.typeAnnotation = t.tsTypeAnnotation(t.tsStringKeyword());

  const optionsParam = t.identifier('options');
  optionsParam.typeAnnotation = t.tsTypeAnnotation(
    t.tsTypeLiteral([
      t.tsPropertySignature(
        t.identifier('skipValidation'),
        t.tsTypeAnnotation(t.tsBooleanKeyword())
      ),
    ])
  );
  optionsParam.optional = true;

  const typeArgParams: t.Identifier[] = typeParameters.map((param) => {
    const id = t.identifier(param.name);
    id.typeAnnotation = t.tsTypeAnnotation(
      param.constraint ? t.cloneNode(param.constraint) : t.tsUnknownKeyword()
    );
    return id;
  });
  const typeArgExprs: t.Identifier[] = typeArgParams.map((param) =>
    t.identifier(param.name)
  );
  const params = [thisParam, ...typeArgParams, dataParam, optionsParam];

  // Return type: InstanceType<T> - returns instance of the actual class called on
  const returnType = t.tsTypeReference(
    t.identifier('InstanceType'),
    t.tsTypeParameterInstantiation([t.tsTypeReference(t.identifier('T'))])
  );

  const parsedId = t.identifier('parsed');
  const parsedDecl = t.variableDeclaration('const', [
    t.variableDeclarator(
      parsedId,
      t.callExpression(t.identifier('parseCerealString'), [t.identifier('data')])
    ),
  ]);

  const buildCompactPayload = (inputExpr: t.Expression) => {
    const compactTag = t.memberExpression(t.thisExpression(), t.identifier('$compactTag'));
    const startsWith = t.callExpression(
      t.memberExpression(t.cloneNode(inputExpr), t.identifier('startsWith')),
      [t.cloneNode(compactTag)]
    );
    const shouldStrip = t.logicalExpression('&&', t.cloneNode(compactTag), startsWith);
    return t.conditionalExpression(
      shouldStrip,
      t.callExpression(
        t.memberExpression(t.cloneNode(inputExpr), t.identifier('slice')),
        [t.memberExpression(t.cloneNode(compactTag), t.identifier('length'))]
      ),
      t.cloneNode(inputExpr)
    );
  };

  const compactCheck = t.binaryExpression(
    '===',
    t.memberExpression(t.thisExpression(), t.identifier('$compact')),
    t.booleanLiteral(true)
  );
  const stringCheck = t.binaryExpression(
    '===',
    t.unaryExpression('typeof', t.cloneNode(parsedId)),
    t.stringLiteral('string')
  );
  const compactPayload = buildCompactPayload(t.cloneNode(parsedId));
  const fromCompactArgs = [
    ...typeArgExprs.map((param) => t.cloneNode(param)),
    compactPayload,
    t.identifier('options'),
  ];
  const fromCompactCall = t.callExpression(
    t.memberExpression(t.thisExpression(), t.identifier('fromCompact')),
    fromCompactArgs
  );
  const typedFromCompact = t.tsAsExpression(
    fromCompactCall,
    t.tsTypeReference(
      t.identifier('InstanceType'),
      t.tsTypeParameterInstantiation([t.tsTypeReference(t.identifier('T'))])
    )
  );
  const invalidCompactThrow = buildErrorThrow('Invalid compact message payload.');

  const stringBranch = t.ifStatement(
    stringCheck,
    t.blockStatement([
      t.ifStatement(
        compactCheck,
        t.blockStatement([t.returnStatement(typedFromCompact)]),
        t.blockStatement([invalidCompactThrow])
      ),
    ])
  );

  const taggedCheck = t.callExpression(
    t.identifier('isTaggedMessageData'),
    [t.cloneNode(parsedId)]
  );
  const tagMatch = t.binaryExpression(
    '===',
    t.memberExpression(t.cloneNode(parsedId), t.identifier('$tag')),
    t.memberExpression(t.thisExpression(), t.identifier('$typeName'))
  );
  const dataExpr = t.memberExpression(t.cloneNode(parsedId), t.identifier('$data'));
  const taggedStringCheck = t.binaryExpression(
    '===',
    t.unaryExpression('typeof', t.cloneNode(dataExpr)),
    t.stringLiteral('string')
  );
  const taggedPayload = buildCompactPayload(t.cloneNode(dataExpr));
  const taggedFromCompact = t.callExpression(
    t.memberExpression(t.thisExpression(), t.identifier('fromCompact')),
    [
      ...typeArgExprs.map((param) => t.cloneNode(param)),
      taggedPayload,
      t.identifier('options'),
    ]
  );
  const taggedFromEntries = t.callExpression(
    t.memberExpression(
      t.memberExpression(t.thisExpression(), t.identifier('prototype')),
      t.identifier('$fromEntries')
    ),
    [t.cloneNode(dataExpr), t.identifier('options')]
  );
  const taggedPropsReturn = t.returnStatement(
    t.tsAsExpression(
      t.newExpression(t.thisExpression(), [taggedFromEntries, t.identifier('options')]),
      t.tsTypeReference(
        t.identifier('InstanceType'),
        t.tsTypeParameterInstantiation([t.tsTypeReference(t.identifier('T'))])
      )
    )
  );
  const invalidTagThrow = buildErrorThrow(
    `Tagged message type mismatch: expected ${namespaceName}.`
  );
  const invalidTaggedCompact = buildErrorThrow(
    `Invalid compact tagged value for ${namespaceName}.`
  );

  const taggedBranch = t.ifStatement(
    taggedCheck,
    t.blockStatement([
      t.ifStatement(
        tagMatch,
        t.blockStatement([
          t.ifStatement(
            taggedStringCheck,
            t.blockStatement([
              t.ifStatement(
                compactCheck,
                t.blockStatement([t.returnStatement(t.tsAsExpression(
                  taggedFromCompact,
                  t.tsTypeReference(
                    t.identifier('InstanceType'),
                    t.tsTypeParameterInstantiation([t.tsTypeReference(t.identifier('T'))])
                  )
                ))]),
                t.blockStatement([invalidTaggedCompact])
              ),
            ]),
            t.blockStatement([taggedPropsReturn])
          ),
        ]),
        t.blockStatement([invalidTagThrow])
      ),
    ])
  );

  const payloadDecl = t.variableDeclaration('const', [
    t.variableDeclarator(
      t.identifier('payload'),
      t.tsAsExpression(
        t.callExpression(
          t.memberExpression(t.identifier('ensure'), t.identifier('simpleObject')),
          [t.cloneNode(parsedId)]
        ),
        t.tsTypeReference(t.identifier('DataObject'))
      )
    ),
  ]);
  const propsDecl = t.variableDeclaration('const', [
    t.variableDeclarator(
      t.identifier('props'),
      t.callExpression(
        t.memberExpression(
          t.memberExpression(t.thisExpression(), t.identifier('prototype')),
          t.identifier('$fromEntries')
        ),
        [t.identifier('payload'), t.identifier('options')]
      )
    ),
  ]);
  const returnStmt = t.returnStatement(
    t.tsAsExpression(
      t.newExpression(t.thisExpression(), [t.identifier('props'), t.identifier('options')]),
      t.tsTypeReference(
        t.identifier('InstanceType'),
        t.tsTypeParameterInstantiation([t.tsTypeReference(t.identifier('T'))])
      )
    )
  );

  const methodBody = t.blockStatement([
    parsedDecl,
    stringBranch,
    taggedBranch,
    payloadDecl,
    propsDecl,
    returnStmt,
  ]);

  const method = t.classMethod(
    'method',
    t.identifier('deserialize'),
    params,
    methodBody,
    false,
    true // static
  );
  method.typeParameters = t.tsTypeParameterDeclaration([typeParam]);
  method.returnType = t.tsTypeAnnotation(returnType);

  return method;
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

/**
 * Build the static from() method for non-generic messages.
 * Returns the input if already an instance, otherwise wraps it.
 *
 * Generated code:
 *   static from(value: TypeName.Value): TypeName {
 *     return value instanceof TypeName ? value : new TypeName(value);
 *   }
 */
function buildFromMethod(typeName: string, className: string): t.ClassMethod {
  // Parameter: value: TypeName.Value
  const valueParam = t.identifier('value');
  valueParam.typeAnnotation = t.tsTypeAnnotation(
    t.tsTypeReference(
      t.tsQualifiedName(t.identifier(typeName), t.identifier('Value'))
    )
  );

  // Body: return value instanceof ClassName ? value : new ClassName(value)
  const body = t.blockStatement([
    t.returnStatement(
      t.conditionalExpression(
        t.binaryExpression(
          'instanceof',
          t.identifier('value'),
          t.identifier(className)
        ),
        t.identifier('value'),
        t.newExpression(t.identifier(className), [t.identifier('value')])
      )
    )
  ]);

  const method = t.classMethod(
    'method',
    t.identifier('from'),
    [valueParam],
    body,
    false, // computed
    true   // static
  );
  method.returnType = t.tsTypeAnnotation(
    t.tsTypeReference(t.identifier(className))
  );

  return method;
}

function buildAutoCompactMethods(
  propName: string
): { toCompact: t.ClassMethod; fromCompact: t.ClassMethod } {
  const toCompactMethod = t.classMethod(
    'method',
    t.identifier('toCompact'),
    [],
    t.blockStatement([
      t.returnStatement(
        t.memberExpression(t.thisExpression(), t.identifier(propName))
      ),
    ])
  );
  toCompactMethod.override = true;
  toCompactMethod.returnType = t.tsTypeAnnotation(t.tsStringKeyword());

  const argsId = t.identifier('args');
  const restParam = t.restElement(argsId);
  restParam.typeAnnotation = t.tsTypeAnnotation(
    t.tsArrayType(t.tsUnknownKeyword())
  );
  const maybeOptionsId = t.identifier('maybeOptions');
  const optionsId = t.identifier('options');
  const valueIndexId = t.identifier('valueIndex');
  const valueId = t.identifier('value');
  const optionsType = t.tsTypeLiteral([
    t.tsPropertySignature(
      t.identifier('skipValidation'),
      t.tsTypeAnnotation(t.tsBooleanKeyword())
    ),
  ]);

  const maybeOptionsDecl = t.variableDeclaration('const', [
    t.variableDeclarator(
      maybeOptionsId,
      t.memberExpression(
        argsId,
        t.binaryExpression(
          '-',
          t.memberExpression(argsId, t.identifier('length')),
          t.numericLiteral(1)
        ),
        true
      )
    ),
  ]);
  const hasOptionsCheck = t.logicalExpression(
    '&&',
    t.binaryExpression(
      '===',
      t.unaryExpression('typeof', t.cloneNode(maybeOptionsId)),
      t.stringLiteral('object')
    ),
    t.logicalExpression(
      '&&',
      t.binaryExpression(
        '!==',
        t.cloneNode(maybeOptionsId),
        t.nullLiteral()
      ),
      t.binaryExpression(
        'in',
        t.stringLiteral('skipValidation'),
        t.cloneNode(maybeOptionsId)
      )
    )
  );
  const optionsDecl = t.variableDeclaration('const', [
    t.variableDeclarator(
      optionsId,
      t.conditionalExpression(
        hasOptionsCheck,
        t.tsAsExpression(t.cloneNode(maybeOptionsId), optionsType),
        t.identifier('undefined')
      )
    ),
  ]);
  const valueIndexDecl = t.variableDeclaration('const', [
    t.variableDeclarator(
      valueIndexId,
      t.conditionalExpression(
        hasOptionsCheck,
        t.binaryExpression(
          '-',
          t.memberExpression(argsId, t.identifier('length')),
          t.numericLiteral(2)
        ),
        t.binaryExpression(
          '-',
          t.memberExpression(argsId, t.identifier('length')),
          t.numericLiteral(1)
        )
      )
    ),
  ]);
  const valueDecl = t.variableDeclaration('const', [
    t.variableDeclarator(
      valueId,
      t.memberExpression(t.cloneNode(argsId), t.cloneNode(valueIndexId), true)
    ),
  ]);
  const valueTypeCheck = t.ifStatement(
    t.binaryExpression(
      '!==',
      t.unaryExpression('typeof', t.cloneNode(valueId)),
      t.stringLiteral('string')
    ),
    buildErrorThrow('Compact message fromCompact expects a string value.')
  );
  const propsObj = t.objectExpression([
    t.objectProperty(t.identifier(propName), t.cloneNode(valueId)),
  ]);
  const ctorExpr = t.newExpression(
    t.tsAsExpression(t.thisExpression(), t.tsAnyKeyword()),
    [propsObj, t.cloneNode(optionsId)]
  );
  const fromCompactMethod = t.classMethod(
    'method',
    t.identifier('fromCompact'),
    [restParam],
    t.blockStatement([
      maybeOptionsDecl,
      optionsDecl,
      valueIndexDecl,
      valueDecl,
      valueTypeCheck,
      t.returnStatement(ctorExpr),
    ]),
    false,
    true
  );
  fromCompactMethod.override = true;

  return { toCompact: toCompactMethod, fromCompact: fromCompactMethod };
}

function buildWrapperCompactMethods(
  propName: string,
  typeName: string
): { toCompact: t.ClassMethod; fromCompact: t.ClassMethod } {
  const ctorId = t.identifier('ctor');
  const serializerId = t.identifier('serializer');
  const compactValueId = t.identifier('compactValue');

  const ctorDecl = t.variableDeclaration('const', [
    t.variableDeclarator(
      ctorId,
      t.tsAsExpression(
        t.memberExpression(t.thisExpression(), t.identifier('constructor')),
        t.tsAnyKeyword()
      )
    ),
  ]);
  const serializerDecl = t.variableDeclaration('const', [
    t.variableDeclarator(
      serializerId,
      t.memberExpression(t.cloneNode(ctorId), t.identifier('$serialize'))
    ),
  ]);
  const serializerCheck = t.ifStatement(
    t.binaryExpression(
      '!==',
      t.unaryExpression('typeof', t.cloneNode(serializerId)),
      t.stringLiteral('function')
    ),
    buildErrorThrow(`${typeName}.$serialize() is not implemented.`)
  );
  const compactDecl = t.variableDeclaration('const', [
    t.variableDeclarator(
      compactValueId,
      t.callExpression(
        t.memberExpression(t.cloneNode(serializerId), t.identifier('call')),
        [
          t.cloneNode(ctorId),
          t.memberExpression(t.thisExpression(), t.identifier(propName)),
        ]
      )
    ),
  ]);
  const compactCheck = t.ifStatement(
    t.binaryExpression(
      '!==',
      t.unaryExpression('typeof', t.cloneNode(compactValueId)),
      t.stringLiteral('string')
    ),
    buildErrorThrow(`${typeName}.$serialize() must return a string.`)
  );

  const toCompactMethod = t.classMethod(
    'method',
    t.identifier('toCompact'),
    [],
    t.blockStatement([
      ctorDecl,
      serializerDecl,
      serializerCheck,
      compactDecl,
      compactCheck,
      t.returnStatement(t.cloneNode(compactValueId)),
    ])
  );
  toCompactMethod.override = true;
  toCompactMethod.returnType = t.tsTypeAnnotation(t.tsStringKeyword());

  const argsId = t.identifier('args');
  const restParam = t.restElement(argsId);
  restParam.typeAnnotation = t.tsTypeAnnotation(
    t.tsArrayType(t.tsUnknownKeyword())
  );
  const maybeOptionsId = t.identifier('maybeOptions');
  const optionsId = t.identifier('options');
  const valueIndexId = t.identifier('valueIndex');
  const valueId = t.identifier('value');
  const decodedId = t.identifier('decoded');
  const deserializerId = t.identifier('deserializer');
  const optionsType = t.tsTypeLiteral([
    t.tsPropertySignature(
      t.identifier('skipValidation'),
      t.tsTypeAnnotation(t.tsBooleanKeyword())
    ),
  ]);

  const maybeOptionsDecl = t.variableDeclaration('const', [
    t.variableDeclarator(
      maybeOptionsId,
      t.memberExpression(
        argsId,
        t.binaryExpression(
          '-',
          t.memberExpression(argsId, t.identifier('length')),
          t.numericLiteral(1)
        ),
        true
      )
    ),
  ]);
  const hasOptionsCheck = t.logicalExpression(
    '&&',
    t.binaryExpression(
      '===',
      t.unaryExpression('typeof', t.cloneNode(maybeOptionsId)),
      t.stringLiteral('object')
    ),
    t.logicalExpression(
      '&&',
      t.binaryExpression(
        '!==',
        t.cloneNode(maybeOptionsId),
        t.nullLiteral()
      ),
      t.binaryExpression(
        'in',
        t.stringLiteral('skipValidation'),
        t.cloneNode(maybeOptionsId)
      )
    )
  );
  const optionsDecl = t.variableDeclaration('const', [
    t.variableDeclarator(
      optionsId,
      t.conditionalExpression(
        hasOptionsCheck,
        t.tsAsExpression(t.cloneNode(maybeOptionsId), optionsType),
        t.identifier('undefined')
      )
    ),
  ]);
  const valueIndexDecl = t.variableDeclaration('const', [
    t.variableDeclarator(
      valueIndexId,
      t.conditionalExpression(
        hasOptionsCheck,
        t.binaryExpression(
          '-',
          t.memberExpression(argsId, t.identifier('length')),
          t.numericLiteral(2)
        ),
        t.binaryExpression(
          '-',
          t.memberExpression(argsId, t.identifier('length')),
          t.numericLiteral(1)
        )
      )
    ),
  ]);
  const valueDecl = t.variableDeclaration('const', [
    t.variableDeclarator(
      valueId,
      t.memberExpression(t.cloneNode(argsId), t.cloneNode(valueIndexId), true)
    ),
  ]);
  const valueTypeCheck = t.ifStatement(
    t.binaryExpression(
      '!==',
      t.unaryExpression('typeof', t.cloneNode(valueId)),
      t.stringLiteral('string')
    ),
    buildErrorThrow('Compact message fromCompact expects a string value.')
  );
  const deserializerDecl = t.variableDeclaration('const', [
    t.variableDeclarator(
      deserializerId,
      t.memberExpression(t.thisExpression(), t.identifier('$deserialize'))
    ),
  ]);
  const deserializerCheck = t.ifStatement(
    t.binaryExpression(
      '!==',
      t.unaryExpression('typeof', t.cloneNode(deserializerId)),
      t.stringLiteral('function')
    ),
    buildErrorThrow(`${typeName}.$deserialize() is not implemented.`)
  );
  const decodedDecl = t.variableDeclaration('const', [
    t.variableDeclarator(
      decodedId,
      t.callExpression(
        t.memberExpression(t.cloneNode(deserializerId), t.identifier('call')),
        [t.thisExpression(), t.cloneNode(valueId)]
      )
    ),
  ]);
  const propsObj = t.objectExpression([
    t.objectProperty(t.identifier(propName), t.cloneNode(decodedId)),
  ]);
  const ctorExpr = t.newExpression(
    t.tsAsExpression(t.thisExpression(), t.tsAnyKeyword()),
    [propsObj, t.cloneNode(optionsId)]
  );
  const fromCompactMethod = t.classMethod(
    'method',
    t.identifier('fromCompact'),
    [restParam],
    t.blockStatement([
      maybeOptionsDecl,
      optionsDecl,
      valueIndexDecl,
      valueDecl,
      valueTypeCheck,
      deserializerDecl,
      deserializerCheck,
      decodedDecl,
      t.returnStatement(ctorExpr),
    ]),
    false,
    true
  );
  fromCompactMethod.override = true;

  return { toCompact: toCompactMethod, fromCompact: fromCompactMethod };
}

function buildWrapperSerializerMethods(
  typeName: string,
  valueType: t.TSType
): { serializeMethod: t.ClassMethod; deserializeMethod: t.ClassMethod } {
  const serializeParam = t.identifier('value');
  serializeParam.typeAnnotation = t.tsTypeAnnotation(t.cloneNode(valueType));
  const serializeMethod = t.classMethod(
    'method',
    t.identifier('$serialize'),
    [serializeParam],
    t.blockStatement([
      buildErrorThrow(`${typeName}.$serialize() is not implemented.`),
    ]),
    false,
    true
  );
  serializeMethod.returnType = t.tsTypeAnnotation(t.tsStringKeyword());

  const deserializeParam = t.identifier('value');
  deserializeParam.typeAnnotation = t.tsTypeAnnotation(t.tsStringKeyword());
  const deserializeMethod = t.classMethod(
    'method',
    t.identifier('$deserialize'),
    [deserializeParam],
    t.blockStatement([
      buildErrorThrow(`${typeName}.$deserialize() is not implemented.`),
    ]),
    false,
    true
  );
  deserializeMethod.returnType = t.tsTypeAnnotation(t.cloneNode(valueType));

  return { serializeMethod, deserializeMethod };
}

/**
 * Information about an Endpoint wrapper type.
 * Used to generate the __responseType phantom field on endpoint classes.
 */
export interface WrapperInfo {
  /** The wrapper type name (e.g., 'Endpoint', 'Message', 'Table') */
  wrapperName: string;
  /** The response type reference (e.g., 'GetUserResponse'), only for Endpoint */
  responseTypeName?: string;
  /** True if this is a MessageWrapper<T> */
  isValueWrapper?: boolean;
}

/** Validation context for code generation */
export interface ClassValidationContext {
  /** Type registry for validator definitions */
  registry: TypeRegistry | undefined;
  /** Import tracker for resolving validator references */
  tracker: ValidatorImportTracker;
}

export function buildClassFromProperties(
  typeName: string,
  properties: PropDescriptor[],
  declaredMessageTypeNames: Set<string>,
  state: PluginStateFlags,
  typeParameters: TypeParameter[] = [],
  isExtended = false,
  wrapperInfo?: WrapperInfo,
  validationContext?: ClassValidationContext,
  typeAliasDefinitions?: Map<string, t.TSType>,
  typeTagIdent?: t.Identifier,
  typeId?: string,
  typeHash?: string,
  compact = false,
  compactTag?: string | null
): t.ClassDeclaration {
  // Use $Base suffix for extended types
  const className = isExtended ? `${typeName}$Base` : typeName;
  const isGeneric = typeParameters.length > 0;
  const resolvedTypeId = typeId ?? typeName;
  const messageTypeParameters = getMessageTypeParameters(typeParameters);
  const hasMessageTypeParameters = messageTypeParameters.length > 0;
  if (messageTypeParameters.length > 0) {
    state.usesMessageConstructor = true;
  }
  if (isGeneric) {
    state.usesDataObject = true;
    state.hasGenericTypes = true;
  }
  const backingFields: t.ClassPrivateProperty[] = [];
  const protectedFields: t.ClassProperty[] = [];
  const getters: t.ClassMethod[] = [];
  const propDescriptors = properties.map((prop) => ({
    ...prop,
    privateName: t.privateName(t.identifier(prop.name)),
  }));
  const propsTypeRef = buildGenericQualifiedTypeReference(typeName, 'Data', typeParameters);
  const valueTypeRef = buildGenericQualifiedTypeReference(typeName, 'Value', typeParameters);

  // Extract validation information if validation context is provided
  const validationBuildContext: ValidationBuildContext | null = validationContext
    ? { state, registry: validationContext.registry, tracker: validationContext.tracker, typeName }
    : null;
  const propertyValidations = validationBuildContext
    ? extractPropertyValidations(propDescriptors, validationBuildContext)
    : new Map();
  const needsValidation = hasAnyValidation(propertyValidations);

  // Check if any nested message types exist that might need validation propagation
  // This ensures skipValidation can be passed to nested message constructors
  const hasNestedMessageTypes = propDescriptors.some(prop => prop.isMessageType);
  const wrapperValueProp = propDescriptors.find((prop) => prop.isWrapperValue);
  const wrapperSerializeMethods = wrapperValueProp
    ? buildWrapperSerializerMethods(typeName, wrapperValueProp.typeAnnotation)
    : null;
  const wrapperCompactMethods = wrapperValueProp
    ? buildWrapperCompactMethods(wrapperValueProp.name, typeName)
    : null;
  const autoCompactProp = !wrapperValueProp && compact && propDescriptors.length === 1
    ? propDescriptors[0]!
    : null;
  const autoCompactMethods = autoCompactProp
    && autoCompactProp.fieldNumber === 1
    && !autoCompactProp.optional
    && isStringTypeNode(autoCompactProp.typeAnnotation)
    ? buildAutoCompactMethods(autoCompactProp.name)
    : null;

  for (const prop of propDescriptors) {
    const baseType = prop.isWrapperValue
      ? t.cloneNode(prop.typeAnnotation)
      : wrapImmutableType(t.cloneNode(prop.typeAnnotation));

    // For optional properties, the field type should include undefined
    // to match the actual stored value (which can be undefined)
    const fieldTypeAnnotation = prop.optional
      ? t.tsUnionType([baseType, t.tsUndefinedKeyword()])
      : baseType;

    const field = t.classPrivateProperty(t.cloneNode(prop.privateName));
    field.typeAnnotation = t.tsTypeAnnotation(fieldTypeAnnotation);
    // Add definite assignment assertion (!) for early-return constructor pattern
    field.definite = true;
    backingFields.push(field);

    if (prop.isWrapperValue) {
      const wrapperField = t.classProperty(
        t.identifier(prop.name),
        undefined,
        t.tsTypeAnnotation(fieldTypeAnnotation)
      );
      wrapperField.accessibility = 'protected';
      wrapperField.definite = true;
      protectedFields.push(wrapperField);
    } else {
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

      // Getter return type matches the field type
      const getterReturnType = prop.optional
        ? t.tsUnionType([t.cloneNode(baseType), t.tsUndefinedKeyword()])
        : t.cloneNode(baseType);

      getter.returnType = t.tsTypeAnnotation(getterReturnType);
      getters.push(getter);
    }
  }

  // Add private fields for constructor references (for generic types)
  if (hasMessageTypeParameters) {
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
            typeTagIdent ?? t.memberExpression(
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

  // Create options parameter: options?: { skipValidation?: boolean }
  const optionsParam = t.identifier('options');
  optionsParam.typeAnnotation = t.tsTypeAnnotation(
    t.tsTypeLiteral([
      t.tsPropertySignature(
        t.identifier('skipValidation'),
        t.tsTypeAnnotation(t.tsBooleanKeyword())
      ),
    ].map((sig) => {
      sig.optional = true;
      return sig;
    }))
  );
  optionsParam.optional = true;

  const constructorAssignments = propDescriptors.map((prop) => {
    const propsAccess = t.memberExpression(
      t.identifier('props'),
      t.identifier(prop.name)
    );

    let valueExpr: t.Expression = t.cloneNode(propsAccess);

    if (!prop.isWrapperValue && prop.isArray) {
      const elementTypeName = prop.arrayElementMessageTypeName;
      // Use castToAny to handle the Value union type (Message | Data) where
      // property access returns a union that doesn't satisfy Array.from overloads
      valueExpr =
        elementTypeName
          ? buildImmutableArrayOfMessagesExpression(
            propsAccess,
            elementTypeName,
            { allowUndefined: Boolean(prop.optional), castToAny: true }
          )
          : buildImmutableArrayExpression(
            propsAccess,
            { allowUndefined: Boolean(prop.optional), castToAny: true }
          );
    } else if (!prop.isWrapperValue && prop.isMap) {
      const conversions = getMapConversionInfo(
        prop,
        declaredMessageTypeNames
      );
      // Use castToAny to handle the Value union type (Message | Data) where
      // property access returns a union that doesn't satisfy Array.from overloads
      valueExpr = needsMapConversions(conversions)
        ? buildImmutableMapWithConversionsExpression(
          propsAccess,
          conversions,
          { allowUndefined: Boolean(prop.optional), castToAny: true, allowCompact: false }
        )
        : buildImmutableMapExpression(
          propsAccess,
          { allowUndefined: Boolean(prop.optional), castToAny: true }
        );
    } else if (!prop.isWrapperValue && prop.isSet) {
      const elementTypeName = prop.setElementMessageTypeName;
      // Use castToAny to handle the Value union type (Message | Data)
      valueExpr =
        elementTypeName
          ? buildImmutableSetOfMessagesExpression(
            propsAccess,
            elementTypeName,
            { allowUndefined: Boolean(prop.optional), castToAny: true }
          )
          : buildImmutableSetExpression(
            propsAccess,
            { allowUndefined: Boolean(prop.optional), castToAny: true }
          );
    } else if (!prop.isWrapperValue && prop.isArrayBufferType) {
      valueExpr = buildImmutableArrayBufferNormalizationExpression(
        valueExpr,
        {
          allowUndefined: Boolean(prop.optional),
          allowNull: typeAllowsNull(prop.typeAnnotation),
        }
      );
    }

    if (!prop.isWrapperValue && prop.isMessageType && prop.messageTypeName) {
      const messageTypeArgs = buildTypeArgumentExpressions(prop.typeAnnotation);
      const messageTypeArgTypes = buildTypeArgumentTypes(prop.typeAnnotation);
      valueExpr = buildMessageNormalizationExpression(
        valueExpr,
        prop.messageTypeName,
        {
          allowUndefined: Boolean(prop.optional),
          allowNull: typeAllowsNull(prop.typeAnnotation),
          // Always propagate options (skipValidation) to nested messages
          optionsExpr: t.identifier('options'),
          compactArgs: messageTypeArgs,
          valueTypeArgs: messageTypeArgTypes,
          allowCompact: false,
        }
      );
    }
    if (!prop.isWrapperValue && prop.unionMessageTypes.length > 0) {
      const unionMessageRefs = getUnionMessageTypeRefs(
        prop.typeAnnotation,
        prop.unionMessageTypes
      );
      valueExpr = buildMessageUnionValueNormalizationExpression(
        valueExpr,
        unionMessageRefs,
        t.identifier('options')
      );
    }

    // Add type cast for immutable collection types to match field type
    // This is needed because TypeScript can't infer the element type through instanceof checks
    if (!prop.isWrapperValue && (prop.isArray || prop.isMap || prop.isSet || prop.isArrayBufferType)) {
      const fieldType = wrapImmutableType(t.cloneNode(prop.typeAnnotation));
      valueExpr = t.tsAsExpression(valueExpr, fieldType);
    }

    // For generic type parameters, use the stored constructor ref for default value
    let defaultValue: t.Expression;
    if (prop.isWrapperValue) {
      defaultValue = t.identifier('undefined');
    } else if (
      prop.isGenericParam
      && prop.genericParamName
      && prop.genericParamRequiresConstructor
    ) {
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
      defaultValue = getDefaultValue(prop, declaredMessageTypeNames, typeAliasDefinitions);
    }
    const assignedExpr: t.Expression = t.conditionalExpression(
      t.identifier('props'),
      valueExpr,
      defaultValue
    );

    // Cast the assigned value to the field type to handle cases where
    // the conditional expression type doesn't match (e.g., branded types
    // where `props ? props.id : undefined` returns `Brand | undefined`
    // but the field type is just `Brand`)
    // Skip casting for Date/URL/ArrayBuffer types because the stored type
    // is the Immutable version (ImmutableDate, ImmutableUrl, ImmutableArrayBuffer)
    // but typeAnnotation refers to the user-facing type (Date, URL, ArrayBuffer)
    const skipTypeCast = prop.isDateType || prop.isUrlType
      || prop.unionHasDate || prop.unionHasUrl
      || prop.isArrayBufferType
      || prop.isMessageType || prop.isArray || prop.isSet || prop.isMap;
    const typedAssignedExpr = skipTypeCast
      ? assignedExpr
      : t.tsAsExpression(
        assignedExpr,
        t.cloneNode(prop.typeAnnotation)
      );

    const assignment = t.assignmentExpression(
      '=',
      t.memberExpression(
        t.thisExpression(),
        t.cloneNode(prop.privateName)
      ),
      typedAssignedExpr
    );

    return t.expressionStatement(assignment);
  });

  // Generic messages don't support memoization (EMPTY instance)
  // because they require constructor parameters
  // Use className for internal static references (handles $Base suffix for extended types)
  const memoizationCheck = hasMessageTypeParameters ? null : t.ifStatement(
    t.logicalExpression(
      '&&',
      t.unaryExpression('!', t.identifier('props')),
      t.memberExpression(t.identifier(className), t.identifier('EMPTY'))
    ),
    t.returnStatement(
      t.memberExpression(t.identifier(className), t.identifier('EMPTY'))
    )
  );

  const memoizationSet = hasMessageTypeParameters ? null : t.ifStatement(
    t.unaryExpression('!', t.identifier('props')),
    t.expressionStatement(
      t.assignmentExpression(
        '=',
        t.memberExpression(t.identifier(className), t.identifier('EMPTY')),
        t.thisExpression()
      )
    )
  );

  // Build constructor parameters: for generics, add class params before props
  const constructorClassParams = hasMessageTypeParameters
    ? buildConstructorClassParams(typeParameters)
    : [];
  // Always include options parameter since any message could be used as a nested type
  // in another message. The options parameter is used to propagate skipValidation.
  const allConstructorParams = [...constructorClassParams, constructorParam, optionsParam];

  // Build constructor body
  const constructorBody: t.Statement[] = [];

  // Add memoization check (only for non-generic)
  if (memoizationCheck) {
    constructorBody.push(memoizationCheck);
  }

  // Add super() call with appropriate $typeName
  constructorBody.push(
    t.expressionStatement(
      t.callExpression(
        t.super(),
        [
          typeTagIdent ?? t.memberExpression(
            t.identifier(className),
            t.identifier('TYPE_TAG')
          ),
          buildTypeNameExpression(typeName, typeParameters),
        ]
      )
    )
  );

  // Add constructor ref assignments for generics
  if (hasMessageTypeParameters) {
    constructorBody.push(...buildConstructorRefAssignments(typeParameters));
  }

  // Add validation call BEFORE property assignments (pre-assignment validation)
  // This validates user input before normalization, enabling:
  // 1. Better error messages showing user's actual input
  // 2. validateAll() can collect all errors before any normalization throws
  // Wrapped in: if (!options?.skipValidation) { this.#validate(data); }
  if (needsValidation && validationBuildContext) {
    constructorBody.push(
      t.ifStatement(
        t.unaryExpression(
          '!',
          t.optionalMemberExpression(
            t.identifier('options'),
            t.identifier('skipValidation'),
            false,
            true
          )
        ),
        t.blockStatement([buildValidateCall()])
      )
    );
  }

  // Add property assignments AFTER validation
  constructorBody.push(...constructorAssignments);

  const wrapperValueAssignments = propDescriptors
    .filter((prop) => prop.isWrapperValue)
    .map((prop) => t.expressionStatement(
      t.assignmentExpression(
        '=',
        t.memberExpression(t.thisExpression(), t.identifier(prop.name)),
        t.memberExpression(t.thisExpression(), t.cloneNode(prop.privateName))
      )
    ));
  if (wrapperValueAssignments.length > 0) {
    constructorBody.push(...wrapperValueAssignments);
  }

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
  const staticFields: t.ClassProperty[] = [];

  if (resolvedTypeId) {
    staticFields.push(
      t.classProperty(
        t.identifier('$typeId'),
        t.stringLiteral(resolvedTypeId),
        null,
        null,
        false,
        true
      )
    );
    if (typeHash) {
      staticFields.push(
        t.classProperty(
          t.identifier('$typeHash'),
          t.stringLiteral(typeHash),
          null,
          null,
          false,
          true
        )
      );
    }
    staticFields.push(
      t.classProperty(
        t.identifier('$instanceTag'),
        t.callExpression(
          t.memberExpression(t.identifier('Symbol'), t.identifier('for')),
          [
            t.binaryExpression(
              '+',
              t.stringLiteral('propane:message:'),
              t.memberExpression(t.identifier(className), t.identifier('$typeId'))
            )
          ]
        ),
        null,
        null,
        false,
        true
      )
    );
  }

  if (compact) {
    const compactProp = t.classProperty(
      t.identifier('$compact'),
      t.booleanLiteral(true),
      null,
      null,
      false,
      true
    );
    compactProp.override = true;
    compactProp.readonly = true;
    staticFields.push(compactProp);
  }

  if (compactTag) {
    const compactTagProp = t.classProperty(
      t.identifier('$compactTag'),
      t.stringLiteral(compactTag),
      null,
      null,
      false,
      true
    );
    compactTagProp.override = true;
    compactTagProp.readonly = true;
    staticFields.push(compactTagProp);
  }

  // Add static $typeName for non-generic messages
  // (generic messages get $typeName set dynamically in constructor)
  if (!hasMessageTypeParameters) {
    staticFields.push(buildStaticTypeName(typeName));
    // Add EMPTY memoization field (only for non-generic)
    // Use className (not typeName) for the type annotation - when extended,
    // the class is TypeName$Base but the namespace is TypeName
    // eslint-disable-next-line unicorn/prefer-single-call -- conditional pushes
    const emptyType = typeParameters.length > 0
      ? t.tsTypeReference(
        t.identifier(className),
        t.tsTypeParameterInstantiation(
          typeParameters.map(() => t.tsAnyKeyword())
        )
      )
      : t.tsTypeReference(t.identifier(className));
    staticFields.push(
      t.classProperty(
        t.identifier('EMPTY'),
        null,
        t.tsTypeAnnotation(emptyType),
        null,
        false,
        true
      )
    );
  }

  // Build static from() method for non-generic messages
  const fromMethod = !isGeneric ? buildFromMethod(typeName, className) : null;

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
      className,
      propDescriptors,
      prop,
      declaredMessageTypeNames,
      typeParameters
    )
  );
  const deleteMethods = propDescriptors
    .filter((prop) => prop.optional)
    .map((prop) => buildDeleteMethod(
      typeName, className, propDescriptors, prop, typeParameters
    ));
  const arrayMethods = buildArrayMutatorMethods(
    typeName,
    className,
    propDescriptors,
    typeParameters
  );
  const mapMethods = buildMapMutatorMethods(
    typeName,
    className,
    propDescriptors,
    declaredMessageTypeNames,
    typeParameters
  );
  const setMethods = buildSetMutatorMethods(
    typeName,
    className,
    propDescriptors,
    typeParameters
  );

  // Build batch set() method for updating multiple fields at once
  const batchSetMethod = buildBatchSetMethod(typeName, className, typeParameters);
  state.usesSkip = true;
  state.needsSetUpdatesType = true;

  // Build hybrid approach methods
  const withChildMethod = buildWithChildMethod(
    typeName,
    className,
    propDescriptors,
    declaredMessageTypeNames,
    typeParameters
  );
  const getMessageChildrenMethod = buildGetMessageChildrenMethod(
    propDescriptors,
    state
  );

  // Build #validate() method if needed
  const validateMethod = needsValidation && validationBuildContext
    ? buildValidateMethod(propertyValidations, validationBuildContext)
    : null;

  // Build static validateAll() method if needed
  const validateAllMethod = needsValidation && validationBuildContext
    ? buildValidateAllMethod(typeName, propertyValidations, validationBuildContext)
    : null;

  const classBodyMembers: (
    | t.ClassMethod
    | t.ClassPrivateMethod
    | t.ClassPrivateProperty
    | t.ClassProperty
  )[] = [
    ...staticFields,
    ...backingFields,
    ...protectedFields,
    constructor,
    descriptorMethod,
    fromEntriesMethod,
  ];

  if (wrapperSerializeMethods) {
    classBodyMembers.push(
      wrapperSerializeMethods.serializeMethod,
      wrapperSerializeMethods.deserializeMethod
    );
  }

  if (wrapperCompactMethods) {
    classBodyMembers.push(wrapperCompactMethods.toCompact, wrapperCompactMethods.fromCompact);
  } else if (autoCompactMethods) {
    classBodyMembers.push(autoCompactMethods.toCompact, autoCompactMethods.fromCompact);
  }

  // Add static from() method for non-generic messages
  if (fromMethod) {
    classBodyMembers.push(fromMethod);
  }

  // Add #validate() method if generated
  if (validateMethod) {
    classBodyMembers.push(validateMethod);
  }

  // Add static validateAll() method if generated
  if (validateAllMethod) {
    classBodyMembers.push(validateAllMethod);
  }

  // Add hybrid approach methods
  if (withChildMethod) {
    classBodyMembers.push(withChildMethod);
  }
  if (getMessageChildrenMethod) {
    classBodyMembers.push(getMessageChildrenMethod);
  }

  // Add bind() and deserialize() methods for generic messages
  if (isGeneric) {
    const bindMethod = buildBindMethod(
      typeName, className, typeParameters, properties, state
    );
    if (bindMethod) {
      classBodyMembers.push(bindMethod);
    }
    if (hasMessageTypeParameters) {
      const deserializeMethod = buildGenericDeserializeMethod(
        typeName,
        className,
        typeParameters,
        properties,
        declaredMessageTypeNames,
        state
      );
      if (deserializeMethod) {
        classBodyMembers.push(deserializeMethod);
      }
    } else {
      // Generic with non-message type params only - use non-generic deserialize
      const deserializeMethod = buildNonGenericDeserializeMethod(
        className,
        typeName,
        state,
        typeParameters
      );
      classBodyMembers.push(deserializeMethod);
    }
  } else {
    // Add deserialize() method for non-generic messages
    // className is the actual class (e.g., Person$Base), typeName is the namespace (e.g., Person)
    const deserializeMethod = buildNonGenericDeserializeMethod(
      className,
      typeName,
      state,
      typeParameters
    );
    classBodyMembers.push(deserializeMethod);
  }

  // Add __responseType phantom field for Endpoint types
  if (wrapperInfo?.responseTypeName) {
    const responseTypeField = t.classProperty(
      t.identifier('__responseType'),
      undefined, // no initializer
      t.tsTypeAnnotation(
        t.tsUnionType([
          t.tsTypeReference(t.identifier(wrapperInfo.responseTypeName)),
          t.tsUndefinedKeyword()
        ])
      )
    );
    responseTypeField.readonly = true;
    responseTypeField.declare = true; // Makes it a declaration only (no runtime code)
    classBodyMembers.push(responseTypeField);
  }

  classBodyMembers.push(...getters,
    ...[
      batchSetMethod,
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
    t.identifier(className),
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
      .map((prop) => {
        if (prop === targetProp) {
          // Only cast if displayType differs from inputTypeAnnotation
          // (avoids redundant casts like `value as string` when value is already string)
          const needsCast = targetProp.displayType &&
            !typesAreEquivalent(targetProp.displayType, targetProp.inputTypeAnnotation);
          const value = needsCast
            ? t.tsAsExpression(t.cloneNode(valueExpr), t.cloneNode(targetProp.displayType!))
            : t.cloneNode(valueExpr);
          return t.objectProperty(
            t.identifier(prop.name),
            value
          );
        }
        // For map/set/array/date/url/arraybuffer types, cast the private field
        // to its display type (mutable) to match the Value type expected by constructor
        // Only cast if displayType differs from inputTypeAnnotation
        const privateAccess = t.memberExpression(
          t.thisExpression(),
          t.cloneNode(prop.privateName)
        );
        const needsCast = prop.displayType &&
          !typesAreEquivalent(prop.displayType, prop.inputTypeAnnotation);
        const value = needsCast
          ? t.tsAsExpression(privateAccess, t.cloneNode(prop.displayType!))
          : privateAccess;
        return t.objectProperty(t.identifier(prop.name), value);
      })
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
          // Cast to displayType for type compatibility with MessagePropDescriptor<Data>
          // Internal storage uses immutable types but Data interface uses mutable types
          // Only cast if types differ (avoids redundant casts for primitives)
          (() => {
            const needsCast = prop.displayType &&
              !typesAreEquivalent(prop.displayType, prop.inputTypeAnnotation);
            const access = t.memberExpression(t.thisExpression(), t.cloneNode(prop.privateName));
            return needsCast
              ? t.tsAsExpression(access, t.cloneNode(prop.displayType!))
              : access;
          })()
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
    if (prop.unionHasString) {
      properties.push(
        t.objectProperty(
          t.identifier('unionHasString'),
          t.booleanLiteral(true)
        )
      );
    }

    if (prop.arrayElementUnionMessageTypes.length > 0) {
      properties.push(
        t.objectProperty(
          t.identifier('arrayElementUnionMessageTypes'),
          t.arrayExpression(
            prop.arrayElementUnionMessageTypes.map((name) => t.stringLiteral(name))
          )
        )
      );
    }
    if (prop.arrayElementUnionHasString) {
      properties.push(
        t.objectProperty(
          t.identifier('arrayElementUnionHasString'),
          t.booleanLiteral(true)
        )
      );
    }

    if (prop.setElementUnionMessageTypes.length > 0) {
      properties.push(
        t.objectProperty(
          t.identifier('setElementUnionMessageTypes'),
          t.arrayExpression(
            prop.setElementUnionMessageTypes.map((name) => t.stringLiteral(name))
          )
        )
      );
    }
    if (prop.setElementUnionHasString) {
      properties.push(
        t.objectProperty(
          t.identifier('setElementUnionHasString'),
          t.booleanLiteral(true)
        )
      );
    }

    if (prop.mapKeyUnionMessageTypes.length > 0) {
      properties.push(
        t.objectProperty(
          t.identifier('mapKeyUnionMessageTypes'),
          t.arrayExpression(
            prop.mapKeyUnionMessageTypes.map((name) => t.stringLiteral(name))
          )
        )
      );
    }
    if (prop.mapKeyUnionHasString) {
      properties.push(
        t.objectProperty(
          t.identifier('mapKeyUnionHasString'),
          t.booleanLiteral(true)
        )
      );
    }

    if (prop.mapValueUnionMessageTypes.length > 0) {
      properties.push(
        t.objectProperty(
          t.identifier('mapValueUnionMessageTypes'),
          t.arrayExpression(
            prop.mapValueUnionMessageTypes.map((name) => t.stringLiteral(name))
          )
        )
      );
    }
    if (prop.mapValueUnionHasString) {
      properties.push(
        t.objectProperty(
          t.identifier('mapValueUnionHasString'),
          t.booleanLiteral(true)
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

/**
 * Build validation and conversion statements for a single field during deserialization.
 * This is used by both $fromEntries and generic deserialize methods.
 *
 * Returns:
 * - statements: The validation/conversion statements to add
 * - finalValueId: The identifier holding the final converted value
 */
function buildFieldValidationStatements(
  prop: PropDescriptor,
  entriesId: t.Identifier,
  declaredMessageTypeNames: Set<string>,
  state: PluginStateFlags,
  options: {
    /** Expression for options parameter (for skipValidation propagation) */
    optionsExpr?: t.Expression;
  } = {}
): { statements: t.Statement[]; finalValueId: t.Expression } {
  const statements: t.Statement[] = [];

  // Step 1: Get value from entries
  const valueId = t.identifier(`${prop.name}Value`);
  const valueExpr = buildEntryAccessExpression(prop, entriesId);
  statements.push(
    t.variableDeclaration('const', [
      t.variableDeclarator(valueId, valueExpr),
    ])
  );

  // Step 2: Required check
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

  // Step 3: Null normalization
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

  // Step 4: Type-specific normalization
  let checkedValueId: t.Identifier | t.Expression = normalizedValueId;

  if (prop.isMap) {
    const mapValueId = t.identifier(`${prop.name}MapValue`);
    const conversions = getMapConversionInfo(prop, declaredMessageTypeNames);
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
    state.usesTaggedMessageData = true;
    const messageValueId = t.identifier(`${prop.name}MessageValue`);
    const messageTypeArgs = buildTypeArgumentExpressions(prop.typeAnnotation);
    const messageTypeArgTypes = buildTypeArgumentTypes(prop.typeAnnotation);
    const normalizeExpr = buildMessageNormalizationExpression(
      checkedValueId as t.Expression,
      prop.messageTypeName,
      {
        allowUndefined: Boolean(prop.optional),
        allowNull: allowsNull,
        castToAny: true,
        optionsExpr: options.optionsExpr,
        compactArgs: messageTypeArgs,
        valueTypeArgs: messageTypeArgTypes,
        allowTagged: true,
      }
    );

    statements.push(
      t.variableDeclaration('const', [
        t.variableDeclarator(messageValueId, normalizeExpr),
      ])
    );
    checkedValueId = messageValueId;
  } else if (prop.unionMessageTypes.length > 0) {
    state.usesTaggedMessageData = true;
    const unionValueId = t.identifier(`${prop.name}UnionValue`);
    const unionMessageRefs = getUnionMessageTypeRefs(
      prop.typeAnnotation,
      prop.unionMessageTypes
    );
    const constructorStatements = buildTaggedMessageUnionHandler(
      checkedValueId as t.Expression,
      unionValueId,
      unionMessageRefs,
      prop.name,
      prop.optional,
      options.optionsExpr
    );
    statements.push(...constructorStatements);
    checkedValueId = unionValueId;
  }

  if (prop.isArray) {
    const elementMessageTypeName = prop.arrayElementMessageTypeName;
    if (prop.arrayElementUnionMessageTypes.length > 0) {
      state.usesTaggedMessageData = true;
      const unionMessageRefs = getUnionMessageTypeRefs(
        prop.arrayElementType ?? t.tsUnknownKeyword(),
        prop.arrayElementUnionMessageTypes
      );
      const arrayValueId = t.identifier(`${prop.name}ArrayValueConverted`);
      const elementId = t.identifier('element');
      const convertExpr = buildTaggedMessageUnionCoercionExpression(
        elementId,
        unionMessageRefs,
        `${prop.name} element`,
        options.optionsExpr
      );
      const nilCheck = t.logicalExpression(
        '||',
        t.binaryExpression(
          '===',
          t.cloneNode(checkedValueId as t.Expression),
          t.identifier('undefined')
        ),
        t.binaryExpression(
          '===',
          t.cloneNode(checkedValueId as t.Expression),
          t.nullLiteral()
        )
      );
      const mapSource = t.tsAsExpression(
        t.cloneNode(checkedValueId as t.Expression),
        t.tsUnionType([
          t.tsTypeReference(
            t.identifier('ImmutableArray'),
            t.tsTypeParameterInstantiation([t.tsUnknownKeyword()])
          ),
          t.tsArrayType(t.tsUnknownKeyword()),
        ])
      );
      const mapExpr = t.callExpression(
        t.memberExpression(
          mapSource,
          t.identifier('map')
        ),
        [t.arrowFunctionExpression([elementId], convertExpr)]
      );
      statements.push(
        t.variableDeclaration('const', [
          t.variableDeclarator(
            arrayValueId,
            t.conditionalExpression(
              nilCheck,
              t.cloneNode(checkedValueId as t.Expression),
              mapExpr
            )
          ),
        ])
      );
      checkedValueId = arrayValueId;
    } else if (elementMessageTypeName) {
      const elementTypeArgs = buildTypeArgumentExpressions(prop.arrayElementType);
      const arrayValueId = t.identifier(`${prop.name}ArrayValueConverted`);
      const elementId = t.identifier('element');
      const convertExpr = buildCompactCoercionExpression(
        elementId,
        elementMessageTypeName,
        elementTypeArgs,
        options.optionsExpr
      );
      const nilCheck = t.logicalExpression(
        '||',
        t.binaryExpression(
          '===',
          t.cloneNode(checkedValueId as t.Expression),
          t.identifier('undefined')
        ),
        t.binaryExpression(
          '===',
          t.cloneNode(checkedValueId as t.Expression),
          t.nullLiteral()
        )
      );
      const mapSource = t.tsAsExpression(
        t.cloneNode(checkedValueId as t.Expression),
        t.tsUnionType([
          t.tsTypeReference(
            t.identifier('ImmutableArray'),
            t.tsTypeParameterInstantiation([t.tsUnknownKeyword()])
          ),
          t.tsArrayType(t.tsUnknownKeyword()),
        ])
      );
      const mapExpr = t.callExpression(
        t.memberExpression(
          mapSource,
          t.identifier('map')
        ),
        [t.arrowFunctionExpression([elementId], convertExpr)]
      );
      statements.push(
        t.variableDeclaration('const', [
          t.variableDeclarator(
            arrayValueId,
            t.conditionalExpression(
              nilCheck,
              t.cloneNode(checkedValueId as t.Expression),
              mapExpr
            )
          ),
        ])
      );
      checkedValueId = arrayValueId;
    }
  }

  if (prop.isSet) {
    const elementMessageTypeName = prop.setElementMessageTypeName;
    if (prop.setElementUnionMessageTypes.length > 0) {
      state.usesTaggedMessageData = true;
      const unionMessageRefs = getUnionMessageTypeRefs(
        prop.setElementType ?? t.tsUnknownKeyword(),
        prop.setElementUnionMessageTypes
      );
      const setValueId = t.identifier(`${prop.name}SetValueConverted`);
      const elementId = t.identifier('element');
      const convertExpr = buildTaggedMessageUnionCoercionExpression(
        elementId,
        unionMessageRefs,
        `${prop.name} element`,
        options.optionsExpr
      );
      const nilCheck = t.logicalExpression(
        '||',
        t.binaryExpression(
          '===',
          t.cloneNode(checkedValueId as t.Expression),
          t.identifier('undefined')
        ),
        t.binaryExpression(
          '===',
          t.cloneNode(checkedValueId as t.Expression),
          t.nullLiteral()
        )
      );
      const arraySource = t.tsAsExpression(
        t.cloneNode(checkedValueId as t.Expression),
        t.tsTypeReference(
          t.identifier('Iterable'),
          t.tsTypeParameterInstantiation([t.tsUnknownKeyword()])
        )
      );
      const arrayFrom = t.callExpression(
        t.memberExpression(t.identifier('Array'), t.identifier('from')),
        [
          arraySource,
          t.arrowFunctionExpression([elementId], convertExpr),
        ]
      );
      const newSetExpr = t.newExpression(t.identifier('ImmutableSet'), [arrayFrom]);
      statements.push(
        t.variableDeclaration('const', [
          t.variableDeclarator(
            setValueId,
            t.conditionalExpression(
              nilCheck,
              t.cloneNode(checkedValueId as t.Expression),
              newSetExpr
            )
          ),
        ])
      );
      checkedValueId = setValueId;
    } else if (elementMessageTypeName) {
      const elementTypeArgs = buildTypeArgumentExpressions(prop.setElementType);
      const setValueId = t.identifier(`${prop.name}SetValueConverted`);
      const elementId = t.identifier('element');
      const convertExpr = buildCompactCoercionExpression(
        elementId,
        elementMessageTypeName,
        elementTypeArgs,
        options.optionsExpr
      );
      const nilCheck = t.logicalExpression(
        '||',
        t.binaryExpression(
          '===',
          t.cloneNode(checkedValueId as t.Expression),
          t.identifier('undefined')
        ),
        t.binaryExpression(
          '===',
          t.cloneNode(checkedValueId as t.Expression),
          t.nullLiteral()
        )
      );
      const arraySource = t.tsAsExpression(
        t.cloneNode(checkedValueId as t.Expression),
        t.tsTypeReference(
          t.identifier('Iterable'),
          t.tsTypeParameterInstantiation([t.tsUnknownKeyword()])
        )
      );
      const arrayFrom = t.callExpression(
        t.memberExpression(t.identifier('Array'), t.identifier('from')),
        [
          arraySource,
          t.arrowFunctionExpression([elementId], convertExpr),
        ]
      );
      const newSetExpr = t.newExpression(t.identifier('ImmutableSet'), [arrayFrom]);
      statements.push(
        t.variableDeclaration('const', [
          t.variableDeclarator(
            setValueId,
            t.conditionalExpression(
              nilCheck,
              t.cloneNode(checkedValueId as t.Expression),
              newSetExpr
            )
          ),
        ])
      );
      checkedValueId = setValueId;
    }
  }

  if (prop.isMap) {
    const keyMessageTypeName = prop.mapKeyMessageTypeName;
    const valueMessageTypeName = prop.mapValueMessageTypeName;
    const hasKeyUnion = prop.mapKeyUnionMessageTypes.length > 0;
    const hasValueUnion = prop.mapValueUnionMessageTypes.length > 0;

    if (hasKeyUnion || hasValueUnion) {
      state.usesTaggedMessageData = true;
      const mapValueId = t.identifier(`${prop.name}MapValueConverted`);
      const entryParam = t.arrayPattern([t.identifier('k'), t.identifier('v')]);
      const keyId = t.identifier('k');
      const valueId = t.identifier('v');
      const keyUnionRefs = getUnionMessageTypeRefs(
        prop.mapKeyType ?? t.tsUnknownKeyword(),
        prop.mapKeyUnionMessageTypes
      );
      const valueUnionRefs = getUnionMessageTypeRefs(
        prop.mapValueType ?? t.tsUnknownKeyword(),
        prop.mapValueUnionMessageTypes
      );
      const keyConv = hasKeyUnion
        ? buildTaggedMessageUnionCoercionExpression(
          keyId,
          keyUnionRefs,
          `${prop.name} key`,
          options.optionsExpr
        )
        : keyId;
      const valueConv = hasValueUnion
        ? buildTaggedMessageUnionCoercionExpression(
          valueId,
          valueUnionRefs,
          `${prop.name} value`,
          options.optionsExpr
        )
        : valueId;
      const nilCheck = t.logicalExpression(
        '||',
        t.binaryExpression(
          '===',
          t.cloneNode(checkedValueId as t.Expression),
          t.identifier('undefined')
        ),
        t.binaryExpression(
          '===',
          t.cloneNode(checkedValueId as t.Expression),
          t.nullLiteral()
        )
      );
      const mapIterable = t.tsAsExpression(
        t.cloneNode(checkedValueId as t.Expression),
        t.tsTypeReference(
          t.identifier('Iterable'),
          t.tsTypeParameterInstantiation([
            t.tsTupleType([t.tsUnknownKeyword(), t.tsUnknownKeyword()])
          ])
        )
      );
      const entriesArray = t.arrayExpression([
        t.spreadElement(mapIterable),
      ]);
      const mappedEntries = t.callExpression(
        t.memberExpression(entriesArray, t.identifier('map')),
        [t.arrowFunctionExpression([entryParam], t.arrayExpression([keyConv, valueConv]))]
      );
      const newMapExpr = t.newExpression(t.identifier('ImmutableMap'), [mappedEntries]);
      statements.push(
        t.variableDeclaration('const', [
          t.variableDeclarator(
            mapValueId,
            t.conditionalExpression(
              nilCheck,
              t.cloneNode(checkedValueId as t.Expression),
              newMapExpr
            )
          ),
        ])
      );
      checkedValueId = mapValueId;
    } else if (keyMessageTypeName || valueMessageTypeName) {
      const mapValueId = t.identifier(`${prop.name}MapValueConverted`);
      const entryParam = t.arrayPattern([t.identifier('k'), t.identifier('v')]);
      const keyId = t.identifier('k');
      const valueId = t.identifier('v');
      const keyTypeArgs = buildTypeArgumentExpressions(prop.mapKeyType);
      const valueTypeArgs = buildTypeArgumentExpressions(prop.mapValueType);
      const keyConv = keyMessageTypeName
        ? buildCompactCoercionExpression(
          keyId,
          keyMessageTypeName,
          keyTypeArgs,
          options.optionsExpr
        )
        : keyId;
      const valueConv = valueMessageTypeName
        ? buildCompactCoercionExpression(
          valueId,
          valueMessageTypeName,
          valueTypeArgs,
          options.optionsExpr
        )
        : valueId;
      const nilCheck = t.logicalExpression(
        '||',
        t.binaryExpression(
          '===',
          t.cloneNode(checkedValueId as t.Expression),
          t.identifier('undefined')
        ),
        t.binaryExpression(
          '===',
          t.cloneNode(checkedValueId as t.Expression),
          t.nullLiteral()
        )
      );
      const mapIterable = t.tsAsExpression(
        t.cloneNode(checkedValueId as t.Expression),
        t.tsTypeReference(
          t.identifier('Iterable'),
          t.tsTypeParameterInstantiation([
            t.tsTupleType([t.tsUnknownKeyword(), t.tsUnknownKeyword()])
          ])
        )
      );
      const entriesArray = t.arrayExpression([
        t.spreadElement(mapIterable),
      ]);
      const mappedEntries = t.callExpression(
        t.memberExpression(entriesArray, t.identifier('map')),
        [t.arrowFunctionExpression([entryParam], t.arrayExpression([keyConv, valueConv]))]
      );
      const newMapExpr = t.newExpression(t.identifier('ImmutableMap'), [mappedEntries]);
      statements.push(
        t.variableDeclaration('const', [
          t.variableDeclarator(
            mapValueId,
            t.conditionalExpression(
              nilCheck,
              t.cloneNode(checkedValueId as t.Expression),
              newMapExpr
            )
          ),
        ])
      );
      checkedValueId = mapValueId;
    }
  }

  // Step 5: Runtime type check
  let typeCheckExpr = prop.isWrapperValue
    ? buildWrapperRuntimeTypeCheckExpression(
      prop.typeAnnotation,
      checkedValueId as t.Expression
    )
    : buildRuntimeTypeCheckExpression(
      prop.typeAnnotation,
      checkedValueId as t.Expression
    );

  if (prop.unionMessageTypes.length > 0) {
    const messageChecks = prop.unionMessageTypes.map((messageType) =>
      t.callExpression(
        t.memberExpression(t.identifier(messageType), t.identifier('isInstance')),
        [t.cloneNode(checkedValueId as t.Expression)]
      )
    );
    if (messageChecks.length > 0) {
      const messageCheckExpr = messageChecks.reduce<t.Expression | null>(
        (acc, expr) => acc ? t.logicalExpression('||', acc, expr) : expr,
        null
      );
      if (messageCheckExpr) {
        typeCheckExpr = typeCheckExpr
          ? t.logicalExpression('||', typeCheckExpr, messageCheckExpr)
          : messageCheckExpr;
      }
    }
  }

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

  // Step 6: Determine final value with appropriate cast
  let finalValue: t.Expression = checkedValueId as t.Expression;
  if (prop.isGenericParam && prop.genericParamName) {
    finalValue = t.tsAsExpression(
      checkedValueId as t.Expression,
      t.tsTypeReference(t.identifier(prop.genericParamName))
    );
  } else if (
    prop.isMap
    || prop.isSet
    || prop.isArray
    || prop.isArrayBufferType
    || prop.isDateType
    || prop.isUrlType
  ) {
    finalValue = t.tsAsExpression(
      checkedValueId as t.Expression,
      prop.displayType ? t.cloneNode(prop.displayType) : wrapImmutableType(t.cloneNode(prop.typeAnnotation))
    );
  } else if (!prop.isMessageType && prop.unionMessageTypes.length === 0) {
    finalValue = t.tsAsExpression(
      checkedValueId as t.Expression,
      t.cloneNode(prop.typeAnnotation)
    );
  }

  return { statements, finalValueId: finalValue };
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
    const { statements: fieldStatements, finalValueId } = buildFieldValidationStatements(
      prop,
      argsId,
      declaredMessageTypeNames,
      state,
      { optionsExpr: t.identifier('options') }
    );
    statements.push(...fieldStatements);

    statements.push(
      t.expressionStatement(
        t.assignmentExpression(
          '=',
          t.memberExpression(propsId, t.identifier(prop.name)),
          finalValueId
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

  // Add options parameter: options?: { skipValidation?: boolean }
  const optionsId = t.identifier('options');
  optionsId.typeAnnotation = t.tsTypeAnnotation(
    t.tsTypeLiteral([
      t.tsPropertySignature(
        t.identifier('skipValidation'),
        t.tsTypeAnnotation(t.tsBooleanKeyword())
      ),
    ])
  );
  optionsId.optional = true;

  const method = t.classMethod(
    'method',
    t.identifier('$fromEntries'),
    [argsId, optionsId],
    body
  );

  // Internal method used by deserialize and union reconstruction. Not part of the public API.
  method.returnType = t.tsTypeAnnotation(t.cloneNode(propsTypeRef));
  t.addComment(method, 'leading', '* @internal - Do not use directly. Subject to change without notice. ', false);

  return method;
}

function buildEntryAccessExpression(
  prop: PropDescriptor,
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

function getUnionMessageTypeRefs(
  typeNode: t.TSType,
  unionMessageTypes: string[]
): UnionMessageTypeRef[] {
  const unwrapped = unwrapParenthesizedType(typeNode);
  if (!unwrapped || !t.isTSUnionType(unwrapped)) {
    return unionMessageTypes.map((name) => ({ name, typeArgs: [] }));
  }

  const typeArgsByName = new Map<string, t.Expression[]>();
  for (const member of unwrapped.types) {
    const memberUnwrapped = unwrapParenthesizedType(member) ?? member;
    if (t.isTSTypeReference(memberUnwrapped) && t.isIdentifier(memberUnwrapped.typeName)) {
      const name = memberUnwrapped.typeName.name;
      if (unionMessageTypes.includes(name)) {
        typeArgsByName.set(name, buildTypeArgumentExpressions(memberUnwrapped));
      }
    }
  }

  return unionMessageTypes.map((name) => ({
    name,
    typeArgs: typeArgsByName.get(name) ?? [],
  }));
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
  messageTypes: UnionMessageTypeRef[],
  propName: string,
  isOptional: boolean,
  optionsExpr?: t.Expression
): t.Statement[] {
  // Use a permissive type here to avoid needing generic type args for unions.
  const unionType: t.TSType = t.tsAnyKeyword();

  // Declare with type annotation and cast initializer:
  // let valueUnionValue: any = value as any;
  const typedTargetId = t.cloneNode(targetId);
  typedTargetId.typeAnnotation = t.tsTypeAnnotation(t.cloneNode(unionType));

  const castInitializer = t.tsAsExpression(
    t.cloneNode(sourceExpr),
    t.cloneNode(unionType)
  );

  const statements: t.Statement[] = [
    t.variableDeclaration('let', [
      t.variableDeclarator(typedTargetId, castInitializer),
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
      t.stringLiteral(msgType.name)
    );

    // $data uses field numbers as keys (e.g., {"1": "Whiskers", "2": true})
    // We need to call $fromEntries to convert to named keys (e.g., { name: "Whiskers", meows: true })
    // new MessageType(MessageType.prototype.$fromEntries(value.$data, options), options)
    const dataExpr = t.memberExpression(t.cloneNode(sourceExpr), t.identifier('$data'));
    const stringCheck = t.binaryExpression(
      '===',
      t.unaryExpression('typeof', t.cloneNode(dataExpr)),
      t.stringLiteral('string')
    );
    const compactCheck = t.binaryExpression(
      '===',
      t.memberExpression(t.identifier(msgType.name), t.identifier('$compact')),
      t.booleanLiteral(true)
    );
    const payloadExpr = buildCompactPayloadExpression(
      t.cloneNode(dataExpr),
      msgType.name
    );
    const fromCompactCall = buildFromCompactCall(
      msgType.name,
      payloadExpr,
      msgType.typeArgs,
      optionsExpr
    );
    const fromEntriesCall = t.callExpression(
      t.memberExpression(
        t.memberExpression(t.identifier(msgType.name), t.identifier('prototype')),
        t.identifier('$fromEntries')
      ),
      optionsExpr
        ? [t.cloneNode(dataExpr), t.cloneNode(optionsExpr)]
        : [t.cloneNode(dataExpr)]
    );
    const constructorArgs: t.Expression[] = [fromEntriesCall];
    if (optionsExpr) {
      constructorArgs.push(t.cloneNode(optionsExpr));
    }
    const constructorCall = t.newExpression(
      t.identifier(msgType.name),
      constructorArgs
    );

    const assignCompact = t.expressionStatement(
      t.assignmentExpression('=', t.cloneNode(targetId), fromCompactCall)
    );
    const assignExpanded = t.expressionStatement(
      t.assignmentExpression('=', t.cloneNode(targetId), constructorCall)
    );

    const compactGuard = t.ifStatement(
      compactCheck,
      t.blockStatement([assignCompact]),
      t.blockStatement([
        buildErrorThrow(
          `Invalid compact tagged value for property "${propName}" (${msgType.name}).`
        )
      ])
    );

    const assignStmt = t.ifStatement(
      stringCheck,
      t.blockStatement([compactGuard]),
      t.blockStatement([assignExpanded])
    );

    innerIf = t.ifStatement(
      tagCheck,
      t.blockStatement([assignStmt]),
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

    const stringCheck = t.binaryExpression(
      '===',
      t.unaryExpression('typeof', t.cloneNode(sourceExpr)),
      t.stringLiteral('string')
    );
    let stringIf: t.IfStatement | null = null;

    for (let i = messageTypes.length - 1; i >= 0; i -= 1) {
      const msgType = messageTypes[i]!;
      const compactTagExpr = t.memberExpression(
        t.identifier(msgType.name),
        t.identifier('$compactTag')
      );
      const startsWith = t.callExpression(
        t.memberExpression(t.cloneNode(sourceExpr), t.identifier('startsWith')),
        [t.cloneNode(compactTagExpr)]
      );
      const tagCheck = t.logicalExpression('&&', t.cloneNode(compactTagExpr), startsWith);
      const compactCheck = t.binaryExpression(
        '===',
        t.memberExpression(t.identifier(msgType.name), t.identifier('$compact')),
        t.booleanLiteral(true)
      );
      const payloadExpr = buildCompactPayloadExpression(
        t.cloneNode(sourceExpr),
        msgType.name
      );
      const fromCompactCall = buildFromCompactCall(
        msgType.name,
        payloadExpr,
        msgType.typeArgs,
        optionsExpr
      );
      const assignCompact = t.expressionStatement(
        t.assignmentExpression('=', t.cloneNode(targetId), fromCompactCall)
      );
      const compactGuard = t.ifStatement(
        compactCheck,
        t.blockStatement([assignCompact]),
        t.blockStatement([
          buildErrorThrow(
            `Invalid compact tagged value for property "${propName}" (${msgType.name}).`
          )
        ])
      );
      const assignStmt = t.ifStatement(
        tagCheck,
        t.blockStatement([compactGuard]),
        stringIf
      );
      stringIf = assignStmt;
    }

    if (stringIf) {
      statements.push(
        t.ifStatement(stringCheck, t.blockStatement([stringIf]))
      );
    }

    // Attempt to coerce untagged object values into union message types
    const notTaggedCheck = t.unaryExpression(
      '!',
      t.callExpression(t.identifier('isTaggedMessageData'), [t.cloneNode(sourceExpr)])
    );
    const objectCheck = t.logicalExpression(
      '&&',
      t.binaryExpression(
        '===',
        t.unaryExpression('typeof', t.cloneNode(sourceExpr)),
        t.stringLiteral('object')
      ),
      t.binaryExpression(
        '!==',
        t.cloneNode(sourceExpr),
        t.nullLiteral()
      )
    );
    const definedCheck = t.binaryExpression(
      '!==',
      t.cloneNode(sourceExpr),
      t.identifier('undefined')
    );
    const coercionCondition = isOptional
      ? t.logicalExpression(
        '&&',
        definedCheck,
        t.logicalExpression('&&', notTaggedCheck, objectCheck)
      )
      : t.logicalExpression('&&', notTaggedCheck, objectCheck);

    const matchedId = t.identifier(`${targetId.name}Matched`);
    const coercionStatements: t.Statement[] = [
      t.variableDeclaration('let', [
        t.variableDeclarator(matchedId, t.booleanLiteral(false)),
      ]),
    ];

    for (const msgType of messageTypes) {
      const instanceLhs = t.tsAsExpression(
        t.cloneNode(sourceExpr),
        t.tsTypeReference(t.identifier('object'))
      );
      const instanceCheck = t.binaryExpression(
        'instanceof',
        instanceLhs,
        t.identifier(msgType.name)
      );
      const assignExisting = t.expressionStatement(
        t.assignmentExpression(
          '=',
          t.cloneNode(targetId),
          t.tsAsExpression(t.cloneNode(sourceExpr), t.cloneNode(unionType))
        )
      );
      const markMatched = t.expressionStatement(
        t.assignmentExpression('=', t.cloneNode(matchedId), t.booleanLiteral(true))
      );
      const fromEntriesCall = t.callExpression(
        t.memberExpression(
          t.memberExpression(t.identifier(msgType.name), t.identifier('prototype')),
          t.identifier('$fromEntries')
        ),
        optionsExpr
          ? [
            t.tsAsExpression(
              t.cloneNode(sourceExpr),
              t.tsTypeReference(
                t.identifier('Record'),
                t.tsTypeParameterInstantiation([
                  t.tsStringKeyword(),
                  t.tsUnknownKeyword(),
                ])
              )
            ),
            t.cloneNode(optionsExpr),
          ]
          : [
            t.tsAsExpression(
              t.cloneNode(sourceExpr),
              t.tsTypeReference(
                t.identifier('Record'),
                t.tsTypeParameterInstantiation([
                  t.tsStringKeyword(),
                  t.tsUnknownKeyword(),
                ])
              )
            ),
          ]
      );
      const constructorArgs: t.Expression[] = [fromEntriesCall];
      if (optionsExpr) {
        constructorArgs.push(t.cloneNode(optionsExpr));
      }
      const constructorCall = t.newExpression(
        t.identifier(msgType.name),
        constructorArgs
      );
      const assignConstructed = t.expressionStatement(
        t.assignmentExpression('=', t.cloneNode(targetId), constructorCall)
      );
      const tryAssign = t.tryStatement(
        t.blockStatement([assignConstructed, markMatched]),
        t.catchClause(t.identifier('e'), t.blockStatement([]))
      );
      const attemptBlock = t.ifStatement(
        instanceCheck,
        t.blockStatement([assignExisting, markMatched]),
        t.blockStatement([tryAssign])
      );
      coercionStatements.push(
        t.ifStatement(
          t.unaryExpression('!', t.cloneNode(matchedId)),
          t.blockStatement([attemptBlock])
        )
      );
    }

    statements.push(
      t.ifStatement(coercionCondition, t.blockStatement(coercionStatements))
    );
  }

  return statements;
}

function buildTaggedMessageUnionCoercionExpression(
  sourceExpr: t.Expression,
  messageTypes: UnionMessageTypeRef[],
  propName: string,
  optionsExpr?: t.Expression
): t.Expression {
  const valueId = t.identifier('value');
  const targetId = t.identifier('unionValue');
  const statements = buildTaggedMessageUnionHandler(
    valueId,
    targetId,
    messageTypes,
    propName,
    false,
    optionsExpr
  );
  statements.push(t.returnStatement(t.cloneNode(targetId)));
  const func = t.arrowFunctionExpression([valueId], t.blockStatement(statements));
  return t.callExpression(func, [t.cloneNode(sourceExpr)]);
}

function buildMessageUnionValueNormalizationExpression(
  sourceExpr: t.Expression,
  messageTypes: UnionMessageTypeRef[],
  optionsExpr?: t.Expression
): t.Expression {
  const valueId = t.identifier('value');
  const resultId = t.identifier('result');
  const matchedId = t.identifier('matched');
  const isMessageId = t.identifier('isMessage');

  const statements: t.Statement[] = [
    t.variableDeclaration('let', [
      t.variableDeclarator(
        resultId,
        t.tsAsExpression(t.cloneNode(valueId), t.tsAnyKeyword())
      ),
    ]),
    t.variableDeclaration('const', [
      t.variableDeclarator(
        isMessageId,
        t.callExpression(
          t.memberExpression(t.identifier('Message'), t.identifier('isMessage')),
          [t.cloneNode(valueId)]
        )
      ),
    ]),
  ];

  const objectCheck = t.logicalExpression(
    '&&',
    t.binaryExpression(
      '===',
      t.unaryExpression('typeof', t.cloneNode(valueId)),
      t.stringLiteral('object')
    ),
    t.binaryExpression(
      '!==',
      t.cloneNode(valueId),
      t.nullLiteral()
    )
  );
  const notArrayCheck = t.unaryExpression(
    '!',
    t.callExpression(
      t.memberExpression(t.identifier('Array'), t.identifier('isArray')),
      [t.cloneNode(valueId)]
    )
  );
  const condition = t.logicalExpression('&&', objectCheck, notArrayCheck);

  const coercionStatements: t.Statement[] = [
    t.variableDeclaration('let', [
      t.variableDeclarator(matchedId, t.booleanLiteral(false)),
    ]),
  ];

  for (const msgType of messageTypes) {
    const isInstanceCall = t.callExpression(
      t.memberExpression(t.identifier(msgType.name), t.identifier('isInstance')),
      [t.cloneNode(valueId)]
    );
    const assignExisting = t.expressionStatement(
      t.assignmentExpression(
        '=',
        t.cloneNode(resultId),
        t.tsAsExpression(t.cloneNode(valueId), t.tsAnyKeyword())
      )
    );
    const markMatched = t.expressionStatement(
      t.assignmentExpression('=', t.cloneNode(matchedId), t.booleanLiteral(true))
    );
    const ctorArgs: t.Expression[] = [
      t.tsAsExpression(t.cloneNode(valueId), t.tsAnyKeyword()),
    ];
    if (optionsExpr) {
      ctorArgs.push(t.cloneNode(optionsExpr));
    }
    const constructorCall = t.newExpression(
      t.identifier(msgType.name),
      ctorArgs
    );
    const assignConstructed = t.expressionStatement(
      t.assignmentExpression('=', t.cloneNode(resultId), constructorCall)
    );
    const tryAssign = t.tryStatement(
      t.blockStatement([assignConstructed, markMatched]),
      t.catchClause(t.identifier('e'), t.blockStatement([]))
    );
    const attemptBlock = t.ifStatement(
      isInstanceCall,
      t.blockStatement([assignExisting, markMatched]),
      t.blockStatement([
        t.ifStatement(
          t.unaryExpression('!', t.cloneNode(isMessageId)),
          t.blockStatement([tryAssign])
        ),
      ])
    );
    coercionStatements.push(
      t.ifStatement(
        t.unaryExpression('!', t.cloneNode(matchedId)),
        t.blockStatement([attemptBlock])
      )
    );
  }

  statements.push(
    t.ifStatement(condition, t.blockStatement(coercionStatements))
  );
  statements.push(t.returnStatement(t.cloneNode(resultId)));

  const func = t.arrowFunctionExpression([valueId], t.blockStatement(statements));
  return t.callExpression(func, [t.cloneNode(sourceExpr)]);
}

function buildSetterMethod(
  typeName: string,
  className: string,  // For @extend, this is TypeName$Base
  propDescriptors: (PropDescriptor & { privateName: t.PrivateName })[],
  targetProp: PropDescriptor & { privateName: t.PrivateName },
  declaredMessageTypeNames: Set<string>,
  typeParameters: TypeParameter[] = []
): t.ClassMethod {
  const valueId = t.identifier('value');
  let valueType = t.cloneNode(targetProp.displayType ?? targetProp.inputTypeAnnotation);
  // If the property is optional, setter should also accept undefined
  if (targetProp.optional) {
    valueType = t.tsUnionType([valueType, t.tsUndefinedKeyword()]);
  }
  valueId.typeAnnotation = t.tsTypeAnnotation(valueType);

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
        { allowUndefined: Boolean(targetProp.optional), allowCompact: false }
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
    const setterMessageTypeArgs = buildTypeArgumentExpressions(targetProp.typeAnnotation);
    const setterMessageTypeArgTypes = buildTypeArgumentTypes(targetProp.typeAnnotation);
    setterValueExpr = buildMessageNormalizationExpression(
      setterValueExpr,
      targetProp.messageTypeName,
      {
        allowUndefined: Boolean(targetProp.optional),
        allowNull: typeAllowsNull(targetProp.typeAnnotation),
        compactArgs: setterMessageTypeArgs,
        valueTypeArgs: setterMessageTypeArgTypes,
        allowCompact: false,
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
  const constructorParams = getMessageTypeParameters(typeParameters);
  if (constructorParams.length > 0) {
    for (const param of constructorParams) {
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

  // For generic messages, use direct construction: new ClassName(...)
  // For non-generic messages, use this.constructor pattern to support subclassing
  const newExpr: t.Expression = constructorParams.length > 0 ? t.tsAsExpression(
      t.newExpression(t.identifier(className), constructorArgs),
      t.tsThisType()
    ) : buildThisConstructorNewExpression(className, constructorArgs);

  const body = t.blockStatement([
    t.returnStatement(
      t.callExpression(
        t.memberExpression(t.thisExpression(), t.identifier('$update')),
        // Cast to `this` for polymorphic return type compatibility
        [t.tsAsExpression(newExpr, t.tsThisType())]
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
  return method;
}

function buildDeleteMethod(
  typeName: string,
  className: string,  // For @extend, this is TypeName$Base
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
  const constructorParams = getMessageTypeParameters(typeParameters);
  if (constructorParams.length > 0) {
    for (const param of constructorParams) {
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

  // For generic messages, use direct construction: new ClassName(...)
  // For non-generic messages, use this.constructor pattern to support subclassing
  const newExpr: t.Expression = constructorParams.length > 0 ? t.tsAsExpression(
      t.newExpression(t.identifier(className), constructorArgs),
      t.tsThisType()
    ) : buildThisConstructorNewExpression(className, constructorArgs);

  const body = t.blockStatement([
    t.returnStatement(
      t.callExpression(
        t.memberExpression(t.thisExpression(), t.identifier('$update')),
        // Cast to `this` for polymorphic return type compatibility
        [t.tsAsExpression(newExpr, t.tsThisType())]
      )
    ),
  ]);

  const methodName = `unset${capitalize(targetProp.name)}`;
  const method = t.classMethod('method', t.identifier(methodName), [], body);
  return method;
}

/**
 * Builds the batch set() method that allows updating multiple fields at once.
 *
 * Generated code:
 * ```typescript
 * set(updates: Partial<SetUpdates<TypeName.Data>>): this {
 *   const data = this.toData();
 *   for (const [key, value] of Object.entries(updates)) {
 *     if (value !== SKIP) {
 *       (data as Record<string, unknown>)[key] = value;
 *     }
 *   }
 *   return this.$update(new TypeName(data) as this);
 * }
 * ```
 */
function buildBatchSetMethod(
  typeName: string,
  className: string,  // For @extend, this is TypeName$Base
  typeParameters: TypeParameter[] = []
): t.ClassMethod {
  const updatesId = t.identifier('updates');
  const dataId = t.identifier('data');
  const keyId = t.identifier('key');
  const valueId = t.identifier('value');

  // Build type annotation: Partial<SetUpdates<TypeName.Data>>
  const dataTypeRef = buildGenericQualifiedTypeReference(typeName, 'Data', typeParameters);
  const setUpdatesType = t.tsTypeReference(
    t.identifier('SetUpdates'),
    t.tsTypeParameterInstantiation([dataTypeRef])
  );
  const partialType = t.tsTypeReference(
    t.identifier('Partial'),
    t.tsTypeParameterInstantiation([setUpdatesType])
  );
  updatesId.typeAnnotation = t.tsTypeAnnotation(partialType);

  // const data = this.toData();
  const toDataCall = t.callExpression(
    t.memberExpression(t.thisExpression(), t.identifier('toData')),
    []
  );
  const dataDecl = t.variableDeclaration('const', [
    t.variableDeclarator(dataId, toDataCall),
  ]);

  // for (const [key, value] of Object.entries(updates))
  const entriesCall = t.callExpression(
    t.memberExpression(t.identifier('Object'), t.identifier('entries')),
    [updatesId]
  );

  // if (value !== SKIP) { (data as Record<string, unknown>)[key] = value; }
  const skipCheck = t.binaryExpression(
    '!==',
    valueId,
    t.identifier('SKIP')
  );
  const recordType = t.tsTypeReference(
    t.identifier('Record'),
    t.tsTypeParameterInstantiation([
      t.tsStringKeyword(),
      t.tsUnknownKeyword(),
    ])
  );
  const dataAsRecord = t.tsAsExpression(dataId, recordType);
  const assignment = t.assignmentExpression(
    '=',
    t.memberExpression(dataAsRecord, keyId, true),
    valueId
  );
  const ifStatement = t.ifStatement(
    skipCheck,
    t.blockStatement([t.expressionStatement(assignment)])
  );

  const forOfStatement = t.forOfStatement(
    t.variableDeclaration('const', [
      t.variableDeclarator(t.arrayPattern([keyId, valueId])),
    ]),
    entriesCall,
    t.blockStatement([ifStatement])
  );

  // Build constructor arguments: for generics, include constructor refs before props
  const constructorArgs: t.Expression[] = [];
  const constructorParams = getMessageTypeParameters(typeParameters);
  if (constructorParams.length > 0) {
    for (const param of constructorParams) {
      const fieldName = getConstructorFieldName(param.name);
      constructorArgs.push(
        t.memberExpression(
          t.thisExpression(),
          t.privateName(t.identifier(fieldName))
        )
      );
    }
  }
  constructorArgs.push(dataId);

  // For generic messages, use direct construction: new ClassName(...)
  // For non-generic messages, use this.constructor pattern to support subclassing
  const newExpr: t.Expression = constructorParams.length > 0
    ? t.tsAsExpression(
        t.newExpression(t.identifier(className), constructorArgs),
        t.tsThisType()
      )
    : buildThisConstructorNewExpression(className, constructorArgs);

  const returnStatement = t.returnStatement(
    t.callExpression(
      t.memberExpression(t.thisExpression(), t.identifier('$update')),
      // Cast to `this` for polymorphic return type compatibility
      [t.tsAsExpression(newExpr, t.tsThisType())]
    )
  );

  const body = t.blockStatement([dataDecl, forOfStatement, returnStatement]);

  const method = t.classMethod('method', t.identifier('set'), [updatesId], body);
  return method;
}

function buildArrayMutatorMethods(
  typeName: string,
  className: string,  // For @extend, this is TypeName$Base
  propDescriptors: (PropDescriptor & { privateName: t.PrivateName })[],
  typeParameters: TypeParameter[] = []
): t.ClassMethod[] {
  const methods: t.ClassMethod[] = [];

  for (const prop of propDescriptors) {
    if (!prop.isArray || !prop.arrayElementType) {
      continue;
    }

    const { singular, plural } = getSingularPlural(prop.name);
    // If singular !== plural (e.g., "items" → "item"), use singular for element operations.
    // If singular === plural (unchangeable word), use prop.name as-is for all operations.
    const isChangeable = singular !== plural;
    const singleName = isChangeable ? singular : prop.name;

    methods.push(
      buildArrayMutationMethod(
        typeName,
        className,
        propDescriptors,
        prop,
        `push${capitalize(singleName)}`,
        [buildArrayValuesRestParam(prop)],
        () => [],
        {
          append: [t.spreadElement(t.identifier('values'))],
        },
        typeParameters
      ),
      buildArrayMutationMethod(
        typeName,
        className,
        propDescriptors,
        prop,
        `pop${capitalize(singleName)}`,
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
        className,
        propDescriptors,
        prop,
        `shift${capitalize(singleName)}`,
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
        className,
        propDescriptors,
        prop,
        `unshift${capitalize(singleName)}`,
        [buildArrayValuesRestParam(prop)],
        () => [],
        {
          prepend: [t.spreadElement(t.identifier('values'))],
        },
        typeParameters
      ),
      buildSpliceMethod(typeName, className, propDescriptors, prop, singleName, typeParameters),
      buildArrayMutationMethod(
        typeName,
        className,
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
      buildSortMethod(typeName, className, propDescriptors, prop, prop.name, typeParameters),
      buildArrayMutationMethod(
        typeName,
        className,
        propDescriptors,
        prop,
        `fill${capitalize(singleName)}`,
        buildFillParams(prop),
        (nextRef) => {
          // Cast the array to allow element type from Data (e.g. ArrayBuffer | ImmutableArrayBuffer)
          // since the spread array has the narrower internal type (e.g. ImmutableArrayBuffer)
          // Use double cast (as unknown as Type[]) to satisfy TypeScript
          const elementType = unwrapParenthesizedType(prop.arrayElementType);
          const arrayExpr = elementType
            ? t.tsAsExpression(
                t.tsAsExpression(nextRef(), t.tsUnknownKeyword()),
                t.tsArrayType(t.cloneNode(elementType))
              )
            : nextRef();
          return [
            t.expressionStatement(
              t.callExpression(
                t.memberExpression(arrayExpr, t.identifier('fill')),
                [
                  t.identifier('value'),
                  t.identifier('start'),
                  t.identifier('end'),
                ]
              )
            ),
          ];
        },
        {},
        typeParameters
      ),
      buildArrayMutationMethod(
        typeName,
        className,
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
  // Type annotation goes on the RestElement for ...values: ElementType[]
  const restParam = t.restElement(valuesId);
  restParam.typeAnnotation = t.tsTypeAnnotation(
    elementType
      ? t.tsArrayType(t.cloneNode(elementType))
      : t.tsArrayType(t.tsUnknownKeyword())
  );
  return restParam;
}

function buildFillParams(prop: PropDescriptor): t.Identifier[] {
  const valueId = t.identifier('value');
  const elementType = unwrapParenthesizedType(prop.arrayElementType);
  // Always add type annotation - use unknown as fallback
  valueId.typeAnnotation = t.tsTypeAnnotation(
    elementType ? t.cloneNode(elementType) : t.tsUnknownKeyword()
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

function buildSortMethod(
  typeName: string,
  className: string,  // For @extend, this is TypeName$Base
  propDescriptors: (PropDescriptor & { privateName: t.PrivateName })[],
  prop: PropDescriptor & { privateName: t.PrivateName },
  plural: string,
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
    className,
    propDescriptors,
    prop,
    `sort${capitalize(plural)}`,
    [compareId],
    (nextRef) => {
      // Cast the array to allow element type from Data (e.g. ArrayBuffer | ImmutableArrayBuffer)
      // since the spread array has the narrower internal type (e.g. ImmutableArrayBuffer)
      // Use double cast (as unknown as Type[]) to satisfy TypeScript
      const arrayExpr = elementType
        ? t.tsAsExpression(
            t.tsAsExpression(nextRef(), t.tsUnknownKeyword()),
            t.tsArrayType(t.cloneNode(elementType))
          )
        : nextRef();
      return [
        t.expressionStatement(
          t.callExpression(
            t.memberExpression(arrayExpr, t.identifier('sort')),
            [t.identifier('compareFn')]
          )
        ),
      ];
    },
    {},
    typeParameters
  );
}

function buildSpliceMethod(
  typeName: string,
  className: string,  // For @extend, this is TypeName$Base
  propDescriptors: (PropDescriptor & { privateName: t.PrivateName })[],
  prop: PropDescriptor & { privateName: t.PrivateName },
  singular: string,
  typeParameters: TypeParameter[] = []
): t.ClassMethod {
  const startId = t.identifier('start');
  startId.typeAnnotation = t.tsTypeAnnotation(t.tsNumberKeyword());
  const deleteCountId = t.identifier('deleteCount');
  deleteCountId.typeAnnotation = t.tsTypeAnnotation(t.tsNumberKeyword());
  deleteCountId.optional = true;
  const elementType = unwrapParenthesizedType(prop.arrayElementType);
  const itemsId = t.identifier('items');
  // Type annotation goes on the RestElement for ...items: ElementType[]
  const itemsParam = t.restElement(itemsId);
  itemsParam.typeAnnotation = t.tsTypeAnnotation(
    elementType
      ? t.tsArrayType(t.cloneNode(elementType))
      : t.tsArrayType(t.tsUnknownKeyword())
  );

  return buildArrayMutationMethod(
    typeName,
    className,
    propDescriptors,
    prop,
    `splice${capitalize(singular)}`,
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
  className: string,  // For @extend, this is TypeName$Base
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
  const constructorParams = getMessageTypeParameters(typeParameters);
  if (constructorParams.length > 0) {
    for (const param of constructorParams) {
      const fieldName = getConstructorFieldName(param.name);
      constructorArgs.push(
        t.memberExpression(
          t.thisExpression(),
          t.privateName(t.identifier(fieldName))
        )
      );
    }
  }
  const propsObject = buildPropsObjectExpression(propDescriptors, prop, nextRef());
  constructorArgs.push(propsObject);

  // For generic messages, use direct construction: new ClassName(...)
  // For non-generic messages, use this.constructor pattern to support subclassing
  const newExpr: t.Expression = constructorParams.length > 0 ? t.tsAsExpression(
      t.newExpression(t.identifier(className), constructorArgs),
      t.tsThisType()
    ) : buildThisConstructorNewExpression(className, constructorArgs);

  const bodyStatements = [
    ...preludeStatements,
    ...statements,
    ...mutations,
    t.returnStatement(
      t.callExpression(
        t.memberExpression(t.thisExpression(), t.identifier('$update')),
        // Cast to `this` for polymorphic return type compatibility
        [t.tsAsExpression(newExpr, t.tsThisType())]
      )
    ),
  ];

  const method = t.classMethod(
    'method',
    t.identifier(methodName),
    params,
    t.blockStatement(bodyStatements)
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
  className: string,  // For @extend, this is TypeName$Base
  propDescriptors: (PropDescriptor & { privateName: t.PrivateName })[],
  declaredMessageTypeNames: Set<string>,
  typeParameters: TypeParameter[] = []
): t.ClassMethod[] {
  const methods: t.ClassMethod[] = [];

  for (const prop of propDescriptors) {
    if (!prop.isMap) {
      continue;
    }

    const { singular, plural } = getSingularPlural(prop.name);
    // Use singular/plural forms when the singular form differs from prop.name.
    // When singular === prop.name (e.g., "map" → "map", "data" → "data"), use Entry/Entries
    // suffixes to avoid conflict with whole-collection setters.
    const canUseSingular = singular !== prop.name;
    const singleName = canUseSingular ? singular : `${prop.name}Entry`;
    const multiName = canUseSingular ? plural : `${prop.name}Entries`;

    // Get conversion info to determine if key/value need runtime conversion
    const conversions = getMapConversionInfo(prop, declaredMessageTypeNames);

    // Build options first to know if key conversion is needed
    const setEntryOptions = buildSetEntryOptions(prop, conversions);

    methods.push(
      buildMapMutationMethod(
        typeName,
        className,
        propDescriptors,
        prop,
        `set${capitalize(singleName)}`,
        buildMapSetParams(prop),
        (mapRef) => {
          // Use 'k' if prelude defined it, otherwise convert key inline
          const keyExpr = setEntryOptions.needsKeyConversion
            ? t.identifier('k')
            : t.identifier('key');
          const valueExpr = buildValueConversionExpr(t.identifier('value'), conversions);
          return [
            t.expressionStatement(
              t.callExpression(
                t.memberExpression(mapRef(), t.identifier('set')),
                [keyExpr, valueExpr]
              )
            ),
          ];
        },
        setEntryOptions,
        typeParameters
      ),
    );

    const deleteEntryOptions = buildDeleteEntryOptions(prop, conversions);
    methods.push(
      buildMapMutationMethod(
        typeName,
        className,
        propDescriptors,
        prop,
        `delete${capitalize(singleName)}`,
        buildMapDeleteParams(prop),
        (mapRef) => {
          // Use 'k' if prelude defined it, otherwise use 'key'
          const keyExpr = deleteEntryOptions.needsKeyConversion
            ? t.identifier('k')
            : t.identifier('key');
          return [
            t.expressionStatement(
              t.callExpression(
                t.memberExpression(mapRef(), t.identifier('delete')),
                [keyExpr]
              )
            ),
          ];
        },
        deleteEntryOptions,
        typeParameters
      ),
      buildMapMutationMethod(
        typeName,
        className,
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
        className,
        propDescriptors,
        prop,
        `merge${capitalize(multiName)}`,
        buildMapMergeParams(prop),
        (mapRef) => {
          const mergeKeyId = t.identifier('mergeKey');
          const mergeValueId = t.identifier('mergeValue');
          // Convert key and value to internal types for set() - handles Date/URL/Message types
          const keyExpr = buildKeyConversionExpr(mergeKeyId, conversions);
          const valueExpr = buildValueConversionExpr(mergeValueId, conversions);
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
                    [keyExpr, valueExpr]
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
        className,
        propDescriptors,
        prop,
        `update${capitalize(singleName)}`,
        buildMapUpdateParams(prop),
        (mapRef) => {
          const currentId = t.identifier('currentValue');
          const updatedId = t.identifier('updatedValue');

          // Check if key needs conversion
          const needsKeyConversion = Boolean(
            conversions.keyIsArray
            || conversions.keyIsMap
            || conversions.keyIsMessage
          );

          const statements: t.Statement[] = [];

          // Convert key once if needed: const k = ImmutableDate.from(key)
          if (needsKeyConversion) {
            const keyConversion = buildKeyConversionExpr(t.identifier('key'), conversions);
            statements.push(
              t.variableDeclaration('const', [
                t.variableDeclarator(t.identifier('k'), keyConversion),
              ])
            );
          }

          const keyRef = needsKeyConversion ? t.identifier('k') : t.identifier('key');
          const valueExpr = buildValueConversionExpr(updatedId, conversions);

          statements.push(
            t.variableDeclaration('const', [
              t.variableDeclarator(
                currentId,
                t.callExpression(
                  t.memberExpression(mapRef(), t.identifier('get')),
                  [t.cloneNode(keyRef)]
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
                [t.cloneNode(keyRef), valueExpr]
              )
            )
          );

          return statements;
        },
        {},
        typeParameters
      ),
      buildMapMutationMethod(
        typeName,
        className,
        propDescriptors,
        prop,
        `map${capitalize(multiName)}`,
        buildMapMapperParams(prop),
        (mapRef) => {
          const mappedEntriesId = t.identifier(`${prop.name}MappedEntries`);
          const keyId = t.identifier('entryKey');
          const valueId = t.identifier('entryValue');
          const mappedId = t.identifier('mappedEntry');
          const newKeyId = t.identifier('newKey');
          const newValueId = t.identifier('newValue');
          // Input types (what mapper returns)
          const inputKeyType = cloneMapKeyType(prop);
          const inputValueType = cloneMapValueType(prop);
          // Type annotation uses input types (what mapper returns)
          const tupleType = t.tsTupleType([inputKeyType, inputValueType]);
          const arrayType = t.tsArrayType(tupleType);
          const typedMappedEntriesId = Object.assign(
            t.identifier(`${prop.name}MappedEntries`),
            { typeAnnotation: t.tsTypeAnnotation(arrayType) }
          );
          // Convert from input types to internal types - handles Date/URL/Message types
          const keyExpr = buildKeyConversionExpr(newKeyId, conversions);
          const valueExpr = buildValueConversionExpr(newValueId, conversions);
          return [
            t.variableDeclaration('const', [
              t.variableDeclarator(typedMappedEntriesId, t.arrayExpression([])),
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
                    // Convert from input types to internal types
                    [keyExpr, valueExpr]
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
        className,
        propDescriptors,
        prop,
        `filter${capitalize(multiName)}`,
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
  className: string,  // For @extend, this is TypeName$Base
  propDescriptors: (PropDescriptor & { privateName: t.PrivateName })[],
  typeParameters: TypeParameter[] = []
): t.ClassMethod[] {
  const methods: t.ClassMethod[] = [];

  for (const prop of propDescriptors) {
    if (!prop.isSet || !prop.setElementType) {
      continue;
    }

    const { singular, plural } = getSingularPlural(prop.name);
    // If singular !== plural (e.g., "tags" → "tag"), use singular/plural forms.
    // If singular === plural (unchangeable word like "metadata", "data", "tag"), use Entry/Entries suffixes.
    const isChangeable = singular !== plural;
    const singleName = isChangeable ? singular : prop.name;
    const multiName = isChangeable ? plural : `${prop.name}Entries`;

    methods.push(
      buildSetMutationMethod(
        typeName,
        className,
        propDescriptors,
        prop,
        `add${capitalize(singleName)}`,
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
        className,
        propDescriptors,
        prop,
        `add${capitalize(multiName)}`,
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
        className,
        propDescriptors,
        prop,
        `delete${capitalize(singleName)}`,
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
        className,
        propDescriptors,
        prop,
        `delete${capitalize(multiName)}`,
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
        className,
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
        className,
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
        className,
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
        className,
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
  className: string,  // For @extend, this is TypeName$Base
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
  const constructorParams = getMessageTypeParameters(typeParameters);
  if (constructorParams.length > 0) {
    for (const param of constructorParams) {
      const fieldName = getConstructorFieldName(param.name);
      constructorArgs.push(
        t.memberExpression(
          t.thisExpression(),
          t.privateName(t.identifier(fieldName))
        )
      );
    }
  }
  const propsObject = buildPropsObjectExpression(propDescriptors, prop, nextRef());
  constructorArgs.push(propsObject);

  // For generic messages, use direct construction: new ClassName(...)
  // For non-generic messages, use this.constructor pattern to support subclassing
  const newExpr: t.Expression = constructorParams.length > 0 ? t.tsAsExpression(
      t.newExpression(t.identifier(className), constructorArgs),
      t.tsThisType()
    ) : buildThisConstructorNewExpression(className, constructorArgs);

  const bodyStatements = [
    ...prelude,
    ...statements,
    ...mutations,
    ...skipNoopGuard ? [] : [buildNoopGuard(currentExpr, nextRef())],
    t.returnStatement(
      t.callExpression(
        t.memberExpression(t.thisExpression(), t.identifier('$update')),
        // Cast to `this` for polymorphic return type compatibility
        [t.tsAsExpression(newExpr, t.tsThisType())]
      )
    ),
  ];

  const method = t.classMethod(
    'method',
    t.identifier(methodName),
    params,
    t.blockStatement(bodyStatements)
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
  className: string,  // For @extend, this is TypeName$Base
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
  const constructorParams = getMessageTypeParameters(typeParameters);
  if (constructorParams.length > 0) {
    for (const param of constructorParams) {
      const fieldName = getConstructorFieldName(param.name);
      constructorArgs.push(
        t.memberExpression(
          t.thisExpression(),
          t.privateName(t.identifier(fieldName))
        )
      );
    }
  }
  const propsObject = buildPropsObjectExpression(propDescriptors, prop, nextRef());
  constructorArgs.push(propsObject);

  // For generic messages, use direct construction: new ClassName(...)
  // For non-generic messages, use this.constructor pattern to support subclassing
  const newExpr: t.Expression = constructorParams.length > 0 ? t.tsAsExpression(
      t.newExpression(t.identifier(className), constructorArgs),
      t.tsThisType()
    ) : buildThisConstructorNewExpression(className, constructorArgs);

  const bodyStatements = [
    ...statements,
    ...mutations,
    buildNoopGuard(currentExpr, nextRef()),
    t.returnStatement(
      t.callExpression(
        t.memberExpression(t.thisExpression(), t.identifier('$update')),
        // Cast to `this` for polymorphic return type compatibility
        [t.tsAsExpression(newExpr, t.tsThisType())]
      )
    ),
  ];

  const method = t.classMethod(
    'method',
    t.identifier(methodName),
    params,
    t.blockStatement(bodyStatements)
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

function buildSetEntryOptions(prop: PropDescriptor, conversions: MapConversionInfo) {
  const currentId = t.identifier(`${prop.name}Current`);
  const existingId = t.identifier('existing');
  const valueId = t.identifier('value');

  // Check if key needs conversion (Array, Map, or Message)
  const needsKeyConversion = Boolean(
    conversions.keyIsArray
    || conversions.keyIsMap
    || conversions.keyIsMessage
  );

  // Use 'k' if we need conversion, otherwise use 'key' directly
  const keyRef = needsKeyConversion ? t.identifier('k') : t.identifier('key');

  // Use optional chaining: currentId?.has(k) or currentId?.has(key)
  const optionalHasKey = t.optionalCallExpression(
    t.optionalMemberExpression(currentId, t.identifier('has'), false, true),
    [t.cloneNode(keyRef)],
    false
  );
  const getExisting = t.callExpression(
    t.memberExpression(t.cloneNode(currentId), t.identifier('get')),
    [t.cloneNode(keyRef)]
  );
  const equalsCall = t.callExpression(
    t.identifier('equals'),
    [existingId, valueId]
  );

  const prelude: t.Statement[] = [
    t.variableDeclaration('const', [
      t.variableDeclarator(
        currentId,
        t.memberExpression(t.thisExpression(), t.identifier(prop.name))
      ),
    ]),
  ];

  // Add key conversion if needed.
  if (needsKeyConversion) {
    const keyConversion = buildKeyConversionExpr(t.identifier('key'), conversions);
    prelude.push(
      t.variableDeclaration('const', [
        t.variableDeclarator(t.identifier('k'), keyConversion),
      ])
    );
  }

  prelude.push(
    t.ifStatement(
      optionalHasKey,
      t.blockStatement([
        t.variableDeclaration('const', [
          t.variableDeclarator(existingId, getExisting),
        ]),
        t.ifStatement(equalsCall, t.returnStatement(t.thisExpression())),
      ])
    )
  );

  return { prelude, skipNoopGuard: true, needsKeyConversion };
}

function buildDeleteEntryOptions(prop: PropDescriptor, conversions: MapConversionInfo) {
  const currentId = t.identifier(`${prop.name}Current`);

  // Check if key needs conversion (Array, Map, or Message)
  const needsKeyConversion = Boolean(
    conversions.keyIsArray
    || conversions.keyIsMap
    || conversions.keyIsMessage
  );

  // Use 'k' if we need conversion, otherwise use 'key' directly
  const keyRef = needsKeyConversion ? t.identifier('k') : t.identifier('key');

  // Use optional chaining: currentId?.has(k) or currentId?.has(key)
  const optionalHasKey = t.optionalCallExpression(
    t.optionalMemberExpression(currentId, t.identifier('has'), false, true),
    [t.cloneNode(keyRef)],
    false
  );

  const prelude: t.Statement[] = [
    t.variableDeclaration('const', [
      t.variableDeclarator(
        currentId,
        t.memberExpression(t.thisExpression(), t.identifier(prop.name))
      ),
    ]),
  ];

  // Add key conversion if needed.
  if (needsKeyConversion) {
    const keyConversion = buildKeyConversionExpr(t.identifier('key'), conversions);
    prelude.push(
      t.variableDeclaration('const', [
        t.variableDeclarator(t.identifier('k'), keyConversion),
      ])
    );
  }

  prelude.push(
    t.ifStatement(
      t.unaryExpression('!', optionalHasKey),
      t.returnStatement(t.thisExpression())
    )
  );

  return { prelude, skipNoopGuard: true, needsKeyConversion };
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

function buildSetFilterParams(prop: PropDescriptor): t.Identifier[] {
  const predicateId = t.identifier('predicate');
  const valueId = t.identifier('value');
  // Add type annotation to the value parameter
  if (prop.setElementType) {
    valueId.typeAnnotation = t.tsTypeAnnotation(t.cloneNode(prop.setElementType));
  } else {
    valueId.typeAnnotation = t.tsTypeAnnotation(t.tsUnknownKeyword());
  }
  predicateId.typeAnnotation = t.tsTypeAnnotation(
    t.tsFunctionType(
      null,
      [valueId],
      t.tsTypeAnnotation(t.tsBooleanKeyword())
    )
  );
  return [predicateId];
}

function buildSetMapParams(prop: PropDescriptor): t.Identifier[] {
  const mapperId = t.identifier('mapper');
  const valueId = t.identifier('value');
  // Add type annotation to the value parameter
  if (prop.setElementType) {
    valueId.typeAnnotation = t.tsTypeAnnotation(t.cloneNode(prop.setElementType));
    mapperId.typeAnnotation = t.tsTypeAnnotation(
      t.tsFunctionType(
        null,
        [valueId],
        t.tsTypeAnnotation(t.cloneNode(prop.setElementType))
      )
    );
  } else {
    valueId.typeAnnotation = t.tsTypeAnnotation(t.tsUnknownKeyword());
    mapperId.typeAnnotation = t.tsTypeAnnotation(
      t.tsFunctionType(
        null,
        [valueId],
        t.tsTypeAnnotation(t.tsUnknownKeyword())
      )
    );
  }
  return [mapperId];
}

function buildSetUpdateParams(prop: PropDescriptor): t.Identifier[] {
  const updaterId = t.identifier('updater');
  const currentId = t.identifier('current');
  // Use Set<T> (not ImmutableSet<T>) since we pass a mutable Set for in-place updates
  currentId.typeAnnotation = t.tsTypeAnnotation(
    t.tsTypeReference(
      t.identifier('Set'),
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
  className: string,  // For @extend, this is TypeName$Base
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
    // Use displayType casts to match the Data interface expected by constructor
    const propsObject = t.objectExpression(
      propDescriptors.map((p) => {
        if (p === prop) {
          // Cast child to the property's displayType (or inputTypeAnnotation if no displayType)
          const castType = p.displayType ?? p.inputTypeAnnotation;
          return t.objectProperty(
            t.identifier(p.name),
            t.tsAsExpression(t.cloneNode(childId), t.cloneNode(castType))
          );
        }
        // For other properties, cast private field to displayType if needed
        const privateAccess = t.memberExpression(
          t.thisExpression(), t.cloneNode(p.privateName)
        );
        const needsCast = p.displayType &&
          !typesAreEquivalent(p.displayType, p.inputTypeAnnotation);
        const value = needsCast
          ? t.tsAsExpression(privateAccess, t.cloneNode(p.displayType!))
          : privateAccess;
        return t.objectProperty(t.identifier(p.name), value);
      })
    );

    // Build constructor args with class refs for generics
    const constructorArgs: t.Expression[] = [];
    const constructorParams = getMessageTypeParameters(typeParameters);
    if (constructorParams.length > 0) {
      for (const param of constructorParams) {
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

    // For generic messages, use direct construction: new ClassName(...)
    // For non-generic messages, use this.constructor pattern
    // Always cast to 'this' to satisfy polymorphic return type from base class
    const newExpr: t.Expression =
      constructorParams.length > 0
        ? t.newExpression(t.identifier(className), constructorArgs)
        : buildThisConstructorNewExpression(className, constructorArgs);
    const returnExpr = t.tsAsExpression(newExpr, t.tsThisType());

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
  // Use 'this' return type to match base class polymorphism
  withChildMethod.returnType = t.tsTypeAnnotation(t.tsThisType());

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

  // Use double cast pattern (as unknown as Type) to avoid TS2352 errors
  // since specific types like [string, User] don't directly overlap with
  // [string, Message<DataObject> | ...]
  const targetTupleType = t.tsTupleType([
    t.tsStringKeyword(),
    childValueType
  ]);

  const yieldStatements = messageChildren.map((prop) =>
    t.expressionStatement(
      t.yieldExpression(
        t.tsAsExpression(
          t.tsAsExpression(
            t.arrayExpression([
              t.stringLiteral(prop.name),
              t.memberExpression(
                t.thisExpression(), t.cloneNode(prop.privateName)
              ),
            ]),
            t.tsUnknownKeyword()
          ),
          targetTupleType
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
