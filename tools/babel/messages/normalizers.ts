import * as t from '@babel/types';

export function buildImmutableMapExpression(
  valueExpr: t.Expression,
  options: { castToAny?: boolean; allowUndefined?: boolean } = {}
): t.Expression {
  const { castToAny = false, allowUndefined = true } = options;

  const nilCheck = t.logicalExpression(
    '||',
    t.binaryExpression(
      '===',
      t.cloneNode(valueExpr),
      t.identifier('undefined')
    ),
    t.binaryExpression('===', t.cloneNode(valueExpr), t.nullLiteral())
  );

  // When castToAny is true (in $fromEntries), values are 'unknown' and need
  // casting for constructor calls.
  const immutableCheck = t.callExpression(
    t.memberExpression(t.identifier('ImmutableMap'), t.identifier('isInstance')),
    [t.cloneNode(valueExpr)]
  );

  // When castToAny is true, cast the value to Iterable for the ImmutableMap constructor
  // This is needed in $fromEntries where values are typed as 'unknown'
  const constructorArg = castToAny
    ? t.tsAsExpression(
      t.cloneNode(valueExpr),
      t.tsTypeReference(
        t.identifier('Iterable'),
        t.tsTypeParameterInstantiation([
          t.tsTupleType([t.tsUnknownKeyword(), t.tsUnknownKeyword()])
        ])
      )
    )
    : t.cloneNode(valueExpr);

  const buildNewImmutableMap = () =>
    t.newExpression(t.identifier('ImmutableMap'), [constructorArg]);

  // For required properties (allowUndefined=false), use empty map instead of preserving nil
  const nilResult = allowUndefined
    ? t.cloneNode(valueExpr)
    : t.newExpression(t.identifier('ImmutableMap'), []);

  return t.conditionalExpression(
    nilCheck,
    nilResult,
    t.conditionalExpression(
      immutableCheck,
      t.cloneNode(valueExpr),
      buildNewImmutableMap()
    )
  );
}

export function buildImmutableArrayExpression(
  valueExpr: t.Expression,
  options: { castToAny?: boolean; allowUndefined?: boolean } = {}
): t.Expression {
  const { castToAny = false, allowUndefined = true } = options;

  const nilCheck = t.logicalExpression(
    '||',
    t.binaryExpression(
      '===',
      t.cloneNode(valueExpr),
      t.identifier('undefined')
    ),
    t.binaryExpression('===', t.cloneNode(valueExpr), t.nullLiteral())
  );

  // When castToAny is true (in $fromEntries), values are 'unknown' and need
  // casting for constructor calls.
  const immutableCheck = t.callExpression(
    t.memberExpression(t.identifier('ImmutableArray'), t.identifier('isInstance')),
    [t.cloneNode(valueExpr)]
  );

  // Cast to Iterable<unknown> for unknown values from $fromEntries
  const constructorArg = castToAny
    ? t.tsAsExpression(
        t.cloneNode(valueExpr),
        t.tsTypeReference(
          t.identifier('Iterable'),
          t.tsTypeParameterInstantiation([t.tsUnknownKeyword()])
        )
      )
    : t.cloneNode(valueExpr);
  const toImmutable = () =>
    t.newExpression(t.identifier('ImmutableArray'), [constructorArg]);

  // For required properties (allowUndefined=false), use empty array instead of preserving nil
  const nilResult = allowUndefined
    ? t.cloneNode(valueExpr)
    : t.newExpression(t.identifier('ImmutableArray'), []);

  return t.conditionalExpression(
    nilCheck,
    nilResult,
    t.conditionalExpression(
      immutableCheck,
      t.cloneNode(valueExpr),
      toImmutable()
    )
  );
}

export function buildImmutableSetExpression(
  valueExpr: t.Expression,
  options: { castToAny?: boolean; allowUndefined?: boolean } = {}
): t.Expression {
  const { castToAny = false, allowUndefined = true } = options;

  const nilCheck = t.logicalExpression(
    '||',
    t.binaryExpression(
      '===',
      t.cloneNode(valueExpr),
      t.identifier('undefined')
    ),
    t.binaryExpression('===', t.cloneNode(valueExpr), t.nullLiteral())
  );

  // When castToAny is true (in $fromEntries), values are 'unknown' and need
  // casting for constructor calls.
  const immutableCheck = t.callExpression(
    t.memberExpression(t.identifier('ImmutableSet'), t.identifier('isInstance')),
    [t.cloneNode(valueExpr)]
  );

  // Cast to Iterable<unknown> for unknown values from $fromEntries
  const constructorArg = castToAny
    ? t.tsAsExpression(
        t.cloneNode(valueExpr),
        t.tsTypeReference(
          t.identifier('Iterable'),
          t.tsTypeParameterInstantiation([t.tsUnknownKeyword()])
        )
      )
    : t.cloneNode(valueExpr);
  const buildNewImmutableSet = () =>
    t.newExpression(t.identifier('ImmutableSet'), [constructorArg]);

  // For required properties (allowUndefined=false), use empty set instead of preserving nil
  const nilResult = allowUndefined
    ? t.cloneNode(valueExpr)
    : t.newExpression(t.identifier('ImmutableSet'), []);

  return t.conditionalExpression(
    nilCheck,
    nilResult,
    t.conditionalExpression(
      immutableCheck,
      t.cloneNode(valueExpr),
      buildNewImmutableSet()
    )
  );
}

export function buildImmutableArrayBufferNormalizationExpression(
  valueExpr: t.Expression,
  {
    allowUndefined = false,
    allowNull = false,
    allowCompact = false,
    optionsExpr,
  }: {
    allowUndefined?: boolean;
    allowNull?: boolean;
    allowCompact?: boolean;
    optionsExpr?: t.Expression;
  } = {}
): t.Expression {
  const instanceCheck = t.callExpression(
    t.memberExpression(t.identifier('ImmutableArrayBuffer'), t.identifier('isInstance')),
    [t.cloneNode(valueExpr)]
  );
  const isArrayBufferView = t.callExpression(
    t.memberExpression(t.identifier('ArrayBuffer'), t.identifier('isView')),
    [t.cloneNode(valueExpr)]
  );
  // Cast valueExpr to expected type for TypeScript when used as ArrayBufferView
  const newFromView = t.newExpression(
    t.identifier('ImmutableArrayBuffer'),
    [
      t.tsAsExpression(
        t.cloneNode(valueExpr),
        t.tsTypeReference(t.identifier('ArrayBufferView'))
      )
    ]
  );
  // Cast valueExpr to ArrayBuffer in the fallback branch
  const newInstance = t.newExpression(t.identifier('ImmutableArrayBuffer'), [
    t.tsAsExpression(
      t.cloneNode(valueExpr),
      t.tsTypeReference(t.identifier('ArrayBuffer'))
    ),
  ]);

  let normalized: t.Expression = t.conditionalExpression(
    instanceCheck,
    t.cloneNode(valueExpr),
    t.conditionalExpression(isArrayBufferView, newFromView, newInstance)
  );

  if (allowCompact) {
    const stringCheck = t.binaryExpression(
      '===',
      t.unaryExpression('typeof', t.cloneNode(valueExpr)),
      t.stringLiteral('string')
    );
    const compactCheck = t.binaryExpression(
      '===',
      t.memberExpression(
        t.identifier('ImmutableArrayBuffer'),
        t.identifier('$compact')
      ),
      t.booleanLiteral(true)
    );
    const compactTag = t.memberExpression(
      t.identifier('ImmutableArrayBuffer'),
      t.identifier('$compactTag')
    );
    const startsWith = t.callExpression(
      t.memberExpression(t.cloneNode(valueExpr), t.identifier('startsWith')),
      [t.cloneNode(compactTag)]
    );
    const shouldStrip = t.logicalExpression('&&', t.cloneNode(compactTag), startsWith);
    const payloadExpr = t.conditionalExpression(
      shouldStrip,
      t.callExpression(
        t.memberExpression(t.cloneNode(valueExpr), t.identifier('slice')),
        [t.memberExpression(t.cloneNode(compactTag), t.identifier('length'))]
      ),
      t.cloneNode(valueExpr)
    );
    const fromCompactArgs: t.Expression[] = [payloadExpr];
    if (optionsExpr) {
      fromCompactArgs.push(t.cloneNode(optionsExpr));
    }
    const fromCompactCall = t.callExpression(
      t.memberExpression(
        t.identifier('ImmutableArrayBuffer'),
        t.identifier('fromCompact')
      ),
      fromCompactArgs
    );
    normalized = t.conditionalExpression(
      t.logicalExpression('&&', stringCheck, compactCheck),
      t.tsAsExpression(fromCompactCall, t.tsAnyKeyword()),
      normalized
    );
  }

  if (allowNull) {
    normalized = t.conditionalExpression(
      t.binaryExpression('===', t.cloneNode(valueExpr), t.nullLiteral()),
      t.cloneNode(valueExpr),
      normalized
    );
  }

  if (allowUndefined) {
    normalized = t.conditionalExpression(
      t.binaryExpression(
        '===',
        t.cloneNode(valueExpr),
        t.identifier('undefined')
      ),
      t.identifier('undefined'),
      normalized
    );
  }

  return normalized;
}

export function buildMessageNormalizationExpression(
  valueExpr: t.Expression,
  className: string,
  {
    allowUndefined = false,
    allowNull = false,
    optionsExpr,
    castToAny = false,
    compactArgs = [],
    valueTypeArgs = [],
    allowCompact = true,
    allowTagged = false,
  }: {
    allowUndefined?: boolean;
    allowNull?: boolean;
    /** Expression for constructor options (e.g., options identifier for skipValidation propagation) */
    optionsExpr?: t.Expression;
    /** When true, cast valueExpr to Class.Value for unknown values from $fromEntries */
    castToAny?: boolean;
    /** Optional type arguments to pass to fromCompact before the value */
    compactArgs?: t.Expression[];
    /** Optional type arguments to use for ClassName.Value casts */
    valueTypeArgs?: t.TSType[];
    /** When true, allow compact string coercion via fromCompact */
    allowCompact?: boolean;
    /** When true, allow TaggedMessageData inputs */
    allowTagged?: boolean;
  } = {}
): t.Expression {
  const instanceCheck = t.callExpression(
    t.memberExpression(t.identifier(className), t.identifier('isInstance')),
    [t.cloneNode(valueExpr)]
  );
  const buildNewInstance = (inputExpr: t.Expression) => {
    // Pass options to nested message constructor if provided
    // Cast to ClassName.Value when coming from $fromEntries (unknown type)
    const constructorArg = castToAny
      ? t.tsAsExpression(
          t.cloneNode(inputExpr),
          t.tsTypeReference(
            t.tsQualifiedName(t.identifier(className), t.identifier('Value')),
            valueTypeArgs.length > 0
              ? t.tsTypeParameterInstantiation(
                valueTypeArgs.map((arg) => t.cloneNode(arg))
              )
              : undefined
          )
        )
      : t.cloneNode(inputExpr);
    const newInstanceArgs: t.Expression[] = [constructorArg];
    if (optionsExpr) {
      newInstanceArgs.push(t.cloneNode(optionsExpr));
    }
    return t.newExpression(t.identifier(className), newInstanceArgs);
  };
  const newInstance = buildNewInstance(t.cloneNode(valueExpr));

  const buildFromCompact = (inputExpr: t.Expression) => {
    const fromCompactArgs: t.Expression[] = [
      ...compactArgs.map((arg) => t.cloneNode(arg)),
      inputExpr,
    ];
    if (optionsExpr) {
      fromCompactArgs.push(t.cloneNode(optionsExpr));
    }
    return t.callExpression(
      t.memberExpression(t.identifier(className), t.identifier('fromCompact')),
      fromCompactArgs
    );
  };

  const buildCompactPayload = (inputExpr: t.Expression) => {
    const compactTag = t.memberExpression(t.identifier(className), t.identifier('$compactTag'));
    const startsWith = t.callExpression(
      t.memberExpression(t.cloneNode(inputExpr), t.identifier('startsWith')),
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
        t.memberExpression(t.cloneNode(inputExpr), t.identifier('slice')),
        [t.memberExpression(t.cloneNode(compactTag), t.identifier('length'))]
      ),
      t.cloneNode(inputExpr)
    );
  };

  const normalizedBase = t.conditionalExpression(
    instanceCheck,
    t.cloneNode(valueExpr),
    newInstance
  );

  if (!allowTagged) {
    let normalized: t.Expression = normalizedBase;
    if (allowCompact) {
      const compactCheck = t.binaryExpression(
        '===',
        t.memberExpression(t.identifier(className), t.identifier('$compact')),
        t.booleanLiteral(true)
      );
      const stringCheck = t.binaryExpression(
        '===',
        t.unaryExpression('typeof', t.cloneNode(valueExpr)),
        t.stringLiteral('string')
      );
      const payloadExpr = buildCompactPayload(t.cloneNode(valueExpr));
      const fromCompactCall = buildFromCompact(payloadExpr);
      const typedFromCompact = t.tsAsExpression(
        fromCompactCall,
        t.tsAnyKeyword()
      );
      normalized = t.conditionalExpression(
        t.logicalExpression('&&', stringCheck, compactCheck),
        typedFromCompact,
        normalized
      );
    }

    if (allowNull) {
      normalized = t.conditionalExpression(
        t.binaryExpression(
          '===',
          t.cloneNode(valueExpr),
          t.nullLiteral()
        ),
        t.cloneNode(valueExpr),
        normalized
      );
    }

    if (allowUndefined) {
      normalized = t.conditionalExpression(
        t.binaryExpression(
          '===',
          t.cloneNode(valueExpr),
          t.identifier('undefined')
        ),
        t.cloneNode(valueExpr),
        normalized
      );
    }

    return normalized;
  }

  const valueId = t.identifier('value');
  const resultId = t.identifier('result');
  const statements: t.Statement[] = [
    t.variableDeclaration('let', [
      t.variableDeclarator(
        resultId,
        t.tsAsExpression(t.cloneNode(valueId), t.tsAnyKeyword())
      ),
    ]),
  ];

  const instanceCheckTagged = t.callExpression(
    t.memberExpression(t.identifier(className), t.identifier('isInstance')),
    [t.cloneNode(valueId)]
  );
  const instanceAssign = t.ifStatement(
    instanceCheckTagged,
    t.blockStatement([
      t.expressionStatement(
        t.assignmentExpression('=', t.cloneNode(resultId), t.cloneNode(valueId))
      ),
    ]),
    t.blockStatement([
      t.expressionStatement(
        t.assignmentExpression(
          '=',
          t.cloneNode(resultId),
          buildNewInstance(t.cloneNode(valueId))
        )
      ),
    ])
  );

  const taggedCheck = t.callExpression(
    t.identifier('isTaggedMessageData'),
    [t.cloneNode(valueId)]
  );
  const tagMatch = t.binaryExpression(
    '===',
    t.memberExpression(t.cloneNode(valueId), t.identifier('$tag')),
    t.stringLiteral(className)
  );
  const dataExpr = t.memberExpression(t.cloneNode(valueId), t.identifier('$data'));
  const taggedStringCheck = t.binaryExpression(
    '===',
    t.unaryExpression('typeof', t.cloneNode(dataExpr)),
    t.stringLiteral('string')
  );
  const compactCheck = t.binaryExpression(
    '===',
    t.memberExpression(t.identifier(className), t.identifier('$compact')),
    t.booleanLiteral(true)
  );
  const payloadExpr = buildCompactPayload(t.cloneNode(dataExpr));
  const fromCompactCall = buildFromCompact(payloadExpr);
  const fromEntriesCall = t.newExpression(
    t.identifier(className),
    optionsExpr
      ? [
        t.callExpression(
          t.memberExpression(
            t.memberExpression(t.identifier(className), t.identifier('prototype')),
            t.identifier('$fromEntries')
          ),
          [t.cloneNode(dataExpr), t.cloneNode(optionsExpr)]
        ),
        t.cloneNode(optionsExpr),
      ]
      : [
        t.callExpression(
          t.memberExpression(
            t.memberExpression(t.identifier(className), t.identifier('prototype')),
            t.identifier('$fromEntries')
          ),
          [t.cloneNode(dataExpr)]
        ),
      ]
  );

  const invalidTagThrow = t.throwStatement(
    t.newExpression(t.identifier('Error'), [
      t.stringLiteral(`Tagged message type mismatch: expected ${className}.`),
    ])
  );
  const invalidCompactThrow = t.throwStatement(
    t.newExpression(t.identifier('Error'), [
      t.stringLiteral(`Invalid compact tagged value for ${className}.`),
    ])
  );

  const taggedBlock = t.blockStatement([
    t.ifStatement(
      tagMatch,
      t.blockStatement([
        t.ifStatement(
          taggedStringCheck,
          t.blockStatement([
            t.ifStatement(
              compactCheck,
              t.blockStatement([
                t.expressionStatement(
                  t.assignmentExpression(
                    '=',
                    t.cloneNode(resultId),
                    t.tsAsExpression(fromCompactCall, t.tsAnyKeyword())
                  )
                ),
              ]),
              t.blockStatement([invalidCompactThrow])
            ),
          ]),
          t.blockStatement([
            t.expressionStatement(
              t.assignmentExpression('=', t.cloneNode(resultId), fromEntriesCall)
            ),
          ])
        ),
      ]),
      t.blockStatement([invalidTagThrow])
    ),
  ]);

  const taggedIf = t.ifStatement(
    taggedCheck,
    taggedBlock,
    t.blockStatement([instanceAssign])
  );

  if (allowCompact) {
    const compactCheck = t.binaryExpression(
      '===',
      t.memberExpression(t.identifier(className), t.identifier('$compact')),
      t.booleanLiteral(true)
    );
    const stringCheck = t.binaryExpression(
      '===',
      t.unaryExpression('typeof', t.cloneNode(valueId)),
      t.stringLiteral('string')
    );
    const payloadExpr = buildCompactPayload(t.cloneNode(valueId));
    const fromCompactCall = buildFromCompact(payloadExpr);
    const typedFromCompact = t.tsAsExpression(fromCompactCall, t.tsAnyKeyword());
    statements.push(
      t.ifStatement(
        t.logicalExpression('&&', stringCheck, compactCheck),
        t.blockStatement([
          t.expressionStatement(
            t.assignmentExpression('=', t.cloneNode(resultId), typedFromCompact)
          ),
        ]),
        t.blockStatement([taggedIf])
      )
    );
  } else {
    statements.push(taggedIf);
  }

  if (allowNull) {
    statements.push(
      t.ifStatement(
        t.binaryExpression('===', t.cloneNode(valueId), t.nullLiteral()),
        t.blockStatement([
          t.expressionStatement(
            t.assignmentExpression('=', t.cloneNode(resultId), t.cloneNode(valueId))
          ),
        ])
      )
    );
  }

  if (allowUndefined) {
    statements.push(
      t.ifStatement(
        t.binaryExpression(
          '===',
          t.cloneNode(valueId),
          t.identifier('undefined')
        ),
        t.blockStatement([
          t.expressionStatement(
            t.assignmentExpression('=', t.cloneNode(resultId), t.cloneNode(valueId))
          ),
        ])
      )
    );
  }

  statements.push(t.returnStatement(t.cloneNode(resultId)));

  return t.callExpression(
    t.arrowFunctionExpression([valueId], t.blockStatement(statements)),
    [t.cloneNode(valueExpr)]
  );
}

export function buildImmutableArrayOfMessagesExpression(
  valueExpr: t.Expression,
  messageTypeName: string,
  options: { castToAny?: boolean; allowUndefined?: boolean } = {}
): t.Expression {
  const { castToAny = false, allowUndefined = true } = options;

  const nilCheck = t.logicalExpression(
    '||',
    t.binaryExpression(
      '===',
      t.cloneNode(valueExpr),
      t.identifier('undefined')
    ),
    t.binaryExpression('===', t.cloneNode(valueExpr), t.nullLiteral())
  );

  // When castToAny is true, cast the value to Iterable for Array.from
  const arrayFromArg = castToAny
    ? t.tsAsExpression(
      t.cloneNode(valueExpr),
      t.tsTypeReference(
        t.identifier('Iterable'),
        t.tsTypeParameterInstantiation([t.tsUnknownKeyword()])
      )
    )
    : t.cloneNode(valueExpr);
  const arrayFrom = t.callExpression(
    t.memberExpression(t.identifier('Array'), t.identifier('from')),
    [arrayFromArg]
  );
  // When castToAny is true, cast 'v' to MessageType.Value for the constructor
  const vForConstructor = castToAny
    ? t.tsAsExpression(
      t.identifier('v'),
      t.tsTypeReference(
        t.tsQualifiedName(t.identifier(messageTypeName), t.identifier('Value'))
      )
    )
    : t.identifier('v');

  const mapCall = t.callExpression(
    t.memberExpression(arrayFrom, t.identifier('map')),
    [
      t.arrowFunctionExpression(
        [t.identifier('v')],
        t.conditionalExpression(
          t.callExpression(
            t.memberExpression(t.identifier(messageTypeName), t.identifier('isInstance')),
            [t.identifier('v')]
          ),
          t.identifier('v'),
          t.newExpression(
            t.identifier(messageTypeName),
            [vForConstructor]
          )
        )
      )
    ]
  );

  const newImmutable = t.newExpression(
    t.identifier('ImmutableArray'),
    [mapCall]
  );

  // For required properties (allowUndefined=false), use empty array instead of preserving nil
  const nilResult = allowUndefined
    ? t.cloneNode(valueExpr)
    : t.newExpression(t.identifier('ImmutableArray'), []);

  return t.conditionalExpression(
    nilCheck,
    nilResult,
    newImmutable
  );
}

export function buildImmutableSetOfMessagesExpression(
  valueExpr: t.Expression,
  messageTypeName: string,
  options: { castToAny?: boolean; allowUndefined?: boolean } = {}
): t.Expression {
  const { castToAny = false, allowUndefined = true } = options;

  const nilCheck = t.logicalExpression(
    '||',
    t.binaryExpression(
      '===',
      t.cloneNode(valueExpr),
      t.identifier('undefined')
    ),
    t.binaryExpression('===', t.cloneNode(valueExpr), t.nullLiteral())
  );

  // When castToAny is true, cast the value to Iterable for Array.from
  const arrayFromArg = castToAny
    ? t.tsAsExpression(
      t.cloneNode(valueExpr),
      t.tsTypeReference(
        t.identifier('Iterable'),
        t.tsTypeParameterInstantiation([t.tsUnknownKeyword()])
      )
    )
    : t.cloneNode(valueExpr);
  const arrayFrom = t.callExpression(
    t.memberExpression(t.identifier('Array'), t.identifier('from')),
    [arrayFromArg]
  );
  // When castToAny is true, cast 'v' to MessageType.Value for the constructor
  const vForSetConstructor = castToAny
    ? t.tsAsExpression(
      t.identifier('v'),
      t.tsTypeReference(
        t.tsQualifiedName(t.identifier(messageTypeName), t.identifier('Value'))
      )
    )
    : t.identifier('v');

  const mapCall = t.callExpression(
    t.memberExpression(arrayFrom, t.identifier('map')),
    [
      t.arrowFunctionExpression(
        [t.identifier('v')],
        t.conditionalExpression(
          t.callExpression(
            t.memberExpression(t.identifier(messageTypeName), t.identifier('isInstance')),
            [t.identifier('v')]
          ),
          t.identifier('v'),
          t.newExpression(
            t.identifier(messageTypeName),
            [vForSetConstructor]
          )
        )
      )
    ]
  );

  const newImmutable = t.newExpression(
    t.identifier('ImmutableSet'),
    [mapCall]
  );

  // For required properties (allowUndefined=false), use empty set instead of preserving nil
  const nilResult = allowUndefined
    ? t.cloneNode(valueExpr)
    : t.newExpression(t.identifier('ImmutableSet'), []);

  return t.conditionalExpression(
    nilCheck,
    nilResult,
    newImmutable
  );
}

export function buildImmutableMapOfMessagesExpression(
  valueExpr: t.Expression,
  messageTypeName: string,
  options: { allowUndefined?: boolean; castToAny?: boolean } = {}
): t.Expression {
  const { allowUndefined = true, castToAny = false } = options;

  const nilCheck = t.logicalExpression(
    '||',
    t.binaryExpression(
      '===',
      t.cloneNode(valueExpr),
      t.identifier('undefined')
    ),
    t.binaryExpression('===', t.cloneNode(valueExpr), t.nullLiteral())
  );

  // When castToAny is true, values are 'unknown' and need casting for constructor
  const vInstanceCheck = t.callExpression(
    t.memberExpression(t.identifier(messageTypeName), t.identifier('isInstance')),
    [t.identifier('v')]
  );
  // Cast v to the message's Value type for the constructor call
  const vForConstructor = castToAny
    ? t.tsAsExpression(
      t.identifier('v'),
      t.tsUnionType([
        t.tsTypeReference(
          t.tsQualifiedName(t.identifier(messageTypeName), t.identifier('Value'))
        ),
        t.tsUndefinedKeyword()
      ])
    )
    : t.identifier('v');

  const arrayFrom = t.callExpression(
    t.memberExpression(t.identifier('Array'), t.identifier('from')),
    [t.cloneNode(valueExpr)]
  );
  const mapCall = t.callExpression(
    t.memberExpression(arrayFrom, t.identifier('map')),
    [
      t.arrowFunctionExpression(
        [t.arrayPattern([t.identifier('k'), t.identifier('v')])],
        t.arrayExpression([
          t.identifier('k'),
          t.conditionalExpression(
            vInstanceCheck,
            t.identifier('v'),
            t.newExpression(
              t.identifier(messageTypeName),
              [vForConstructor]
            )
          )
        ])
      )
    ]
  );

  const newImmutable = t.newExpression(
    t.identifier('ImmutableMap'),
    [mapCall]
  );

  // For required properties (allowUndefined=false), use empty map instead of preserving nil
  const nilResult = allowUndefined
    ? t.cloneNode(valueExpr)
    : t.newExpression(t.identifier('ImmutableMap'), []);

  return t.conditionalExpression(
    nilCheck,
    nilResult,
    newImmutable
  );
}

export interface MapConversionInfo {
  keyIsArray?: boolean;
  keyIsMap?: boolean;
  keyIsMessage?: string;
  valueIsMessage?: string;
}

export function buildImmutableMapWithConversionsExpression(
  valueExpr: t.Expression,
  conversions: MapConversionInfo,
  options: { castToAny?: boolean; allowUndefined?: boolean; allowCompact?: boolean } = {}
): t.Expression {
  const { castToAny = false, allowUndefined = true, allowCompact = true } = options;

  const nilCheck = t.logicalExpression(
    '||',
    t.binaryExpression(
      '===',
      t.cloneNode(valueExpr),
      t.identifier('undefined')
    ),
    t.binaryExpression('===', t.cloneNode(valueExpr), t.nullLiteral())
  );

  const immutableCheck = t.callExpression(
    t.memberExpression(t.identifier('ImmutableMap'), t.identifier('isInstance')),
    [t.cloneNode(valueExpr)]
  );

  // Build the key conversion expression
  const keyId = t.identifier('k');
  let keyConversion: t.Expression = keyId;

  // Cast keyId for constructor calls when castToAny is true (values are 'unknown')
  const keyArrayConstructorArg = castToAny
    ? t.tsAsExpression(
      t.cloneNode(keyId),
      t.tsTypeReference(
        t.identifier('Iterable'),
        t.tsTypeParameterInstantiation([t.tsUnknownKeyword()])
      )
    )
    : t.cloneNode(keyId);
  // Cast for message key constructor - creates MessageType.Value type
  const keyMessageConstructorArg = (messageTypeName: string) => castToAny
    ? t.tsAsExpression(
      t.cloneNode(keyId),
      t.tsTypeReference(
        t.tsQualifiedName(t.identifier(messageTypeName), t.identifier('Value'))
      )
    )
    : t.cloneNode(keyId);

  if (conversions.keyIsArray) {
    // ImmutableArray.from(k)
    keyConversion = t.callExpression(
      t.memberExpression(t.identifier('ImmutableArray'), t.identifier('from')),
      [keyArrayConstructorArg]
    );
  } else if (conversions.keyIsMap) {
    // ImmutableMap.from(k)
    keyConversion = t.callExpression(
      t.memberExpression(t.identifier('ImmutableMap'), t.identifier('from')),
      [keyArrayConstructorArg]
    );
  } else if (conversions.keyIsMessage) {
    // MessageType.from(k), unless compact strings should pass through
    const keyFromCall = t.callExpression(
      t.memberExpression(
        t.identifier(conversions.keyIsMessage),
        t.identifier('from')
      ),
      [keyMessageConstructorArg(conversions.keyIsMessage)]
    );
    if (allowCompact) {
      const keyStringCheck = t.binaryExpression(
        '===',
        t.unaryExpression('typeof', t.cloneNode(keyId)),
        t.stringLiteral('string')
      );
      const keyCompactCheck = t.binaryExpression(
        '===',
        t.memberExpression(t.identifier(conversions.keyIsMessage), t.identifier('$compact')),
        t.booleanLiteral(true)
      );
      keyConversion = t.conditionalExpression(
        t.logicalExpression('&&', keyStringCheck, keyCompactCheck),
        t.cloneNode(keyId),
        keyFromCall
      );
    } else {
      keyConversion = keyFromCall;
    }
  }

  // Build the value conversion expression
  const valueId = t.identifier('v');
  let valueConversion: t.Expression = valueId;

  // Cast for message constructor - creates MessageType.Value type
  const messageConstructorArg = (messageTypeName: string) => castToAny
    ? t.tsAsExpression(
      t.cloneNode(valueId),
      t.tsTypeReference(
        t.tsQualifiedName(t.identifier(messageTypeName), t.identifier('Value'))
      )
    )
    : t.cloneNode(valueId);

  if (conversions.valueIsMessage) {
    // MessageType.from(v), unless compact strings should pass through
    const valueFromCall = t.callExpression(
      t.memberExpression(
        t.identifier(conversions.valueIsMessage),
        t.identifier('from')
      ),
      [messageConstructorArg(conversions.valueIsMessage)]
    );
    if (allowCompact) {
      const valueStringCheck = t.binaryExpression(
        '===',
        t.unaryExpression('typeof', t.cloneNode(valueId)),
        t.stringLiteral('string')
      );
      const valueCompactCheck = t.binaryExpression(
        '===',
        t.memberExpression(t.identifier(conversions.valueIsMessage), t.identifier('$compact')),
        t.booleanLiteral(true)
      );
      valueConversion = t.conditionalExpression(
        t.logicalExpression('&&', valueStringCheck, valueCompactCheck),
        t.cloneNode(valueId),
        valueFromCall
      );
    } else {
      valueConversion = valueFromCall;
    }
  }

  // If no conversions needed, use the simple ImmutableMap expression
  const needsConversion =
    conversions.keyIsArray
    || conversions.keyIsMessage
    || conversions.valueIsMessage;

  // When castToAny is true, cast the value to Iterable for the ImmutableMap constructor
  const constructorArg = castToAny
    ? t.tsAsExpression(
      t.cloneNode(valueExpr),
      t.tsTypeReference(
        t.identifier('Iterable'),
        t.tsTypeParameterInstantiation([
          t.tsTupleType([t.tsUnknownKeyword(), t.tsUnknownKeyword()])
        ])
      )
    )
    : t.cloneNode(valueExpr);

  // For required properties (allowUndefined=false), use empty map instead of preserving nil
  const nilResult = allowUndefined
    ? t.cloneNode(valueExpr)
    : t.newExpression(t.identifier('ImmutableMap'), []);

  if (!needsConversion) {
    return t.conditionalExpression(
      nilCheck,
      nilResult,
      t.conditionalExpression(
        immutableCheck,
        t.cloneNode(valueExpr),
        t.newExpression(
          t.identifier('ImmutableMap'),
          [constructorArg]
        )
      )
    );
  }

  // Build: Array.from(value).map(([k, v]) => [keyConversion, valueConversion])
  const arrayFromArg = castToAny
    ? t.tsAsExpression(
      t.cloneNode(valueExpr),
      t.tsTypeReference(
        t.identifier('Iterable'),
        t.tsTypeParameterInstantiation([
          t.tsTupleType([t.tsUnknownKeyword(), t.tsUnknownKeyword()])
        ])
      )
    )
    : t.cloneNode(valueExpr);
  const arrayFrom = t.callExpression(
    t.memberExpression(t.identifier('Array'), t.identifier('from')),
    [arrayFromArg]
  );
  const mapCall = t.callExpression(
    t.memberExpression(arrayFrom, t.identifier('map')),
    [
      t.arrowFunctionExpression(
        [t.arrayPattern([keyId, valueId])],
        t.arrayExpression([keyConversion, valueConversion])
      )
    ]
  );

  const newImmutableMap = t.newExpression(
    t.identifier('ImmutableMap'),
    [mapCall]
  );

  return t.conditionalExpression(
    nilCheck,
    nilResult,
    newImmutableMap
  );
}
