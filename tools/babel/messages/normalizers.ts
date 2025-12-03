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
  // an 'as object' cast for instanceof to work
  const instanceofLhs = castToAny
    ? t.tsAsExpression(t.cloneNode(valueExpr), t.tsTypeReference(t.identifier('object')))
    : t.cloneNode(valueExpr);
  const immutableCheck = t.binaryExpression(
    'instanceof',
    instanceofLhs,
    t.identifier('ImmutableMap')
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
  // an 'as object' cast for instanceof to work
  const instanceofLhs = castToAny
    ? t.tsAsExpression(t.cloneNode(valueExpr), t.tsTypeReference(t.identifier('object')))
    : t.cloneNode(valueExpr);
  const immutableCheck = t.binaryExpression(
    'instanceof',
    instanceofLhs,
    t.identifier('ImmutableArray')
  );

  const toImmutable = () =>
    t.newExpression(t.identifier('ImmutableArray'), [t.cloneNode(valueExpr)]);

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
  // an 'as object' cast for instanceof to work
  const instanceofLhs = castToAny
    ? t.tsAsExpression(t.cloneNode(valueExpr), t.tsTypeReference(t.identifier('object')))
    : t.cloneNode(valueExpr);
  const immutableCheck = t.binaryExpression(
    'instanceof',
    instanceofLhs,
    t.identifier('ImmutableSet')
  );

  const buildNewImmutableSet = () =>
    t.newExpression(t.identifier('ImmutableSet'), [t.cloneNode(valueExpr)]);

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

export function buildImmutableDateNormalizationExpression(
  valueExpr: t.Expression,
  {
    allowUndefined = false,
    allowNull = false
  }: { allowUndefined?: boolean; allowNull?: boolean } = {}
): t.Expression {
  const instanceCheck = t.binaryExpression(
    'instanceof',
    t.cloneNode(valueExpr),
    t.identifier('ImmutableDate')
  );
  const newInstance = t.newExpression(t.identifier('ImmutableDate'), [
    t.cloneNode(valueExpr),
  ]);

  let normalized: t.Expression = t.conditionalExpression(
    instanceCheck,
    t.cloneNode(valueExpr),
    newInstance
  );

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

export function buildImmutableUrlNormalizationExpression(
  valueExpr: t.Expression,
  {
    allowUndefined = false,
    allowNull = false
  }: { allowUndefined?: boolean; allowNull?: boolean } = {}
): t.Expression {
  const instanceCheck = t.binaryExpression(
    'instanceof',
    t.cloneNode(valueExpr),
    t.identifier('ImmutableUrl')
  );
  const newInstance = t.newExpression(t.identifier('ImmutableUrl'), [
    t.cloneNode(valueExpr),
  ]);

  let normalized: t.Expression = t.conditionalExpression(
    instanceCheck,
    t.cloneNode(valueExpr),
    newInstance
  );

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

export function buildImmutableArrayBufferNormalizationExpression(
  valueExpr: t.Expression,
  {
    allowUndefined = false,
    allowNull = false
  }: { allowUndefined?: boolean; allowNull?: boolean } = {}
): t.Expression {
  const instanceCheck = t.binaryExpression(
    'instanceof',
    t.cloneNode(valueExpr),
    t.identifier('ImmutableArrayBuffer')
  );
  const isArrayBufferView = t.callExpression(
    t.memberExpression(t.identifier('ArrayBuffer'), t.identifier('isView')),
    [t.cloneNode(valueExpr)]
  );
  const newFromView = t.newExpression(
    t.identifier('ImmutableArrayBuffer'),
    [t.cloneNode(valueExpr)]
  );
  const newInstance = t.newExpression(t.identifier('ImmutableArrayBuffer'), [
    t.cloneNode(valueExpr),
  ]);

  let normalized: t.Expression = t.conditionalExpression(
    instanceCheck,
    t.cloneNode(valueExpr),
    t.conditionalExpression(isArrayBufferView, newFromView, newInstance)
  );

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
    allowNull = false
  }: { allowUndefined?: boolean; allowNull?: boolean } = {}
): t.Expression {
  const instanceCheck = t.binaryExpression(
    'instanceof',
    t.cloneNode(valueExpr),
    t.identifier(className)
  );
  const newInstance = t.newExpression(t.identifier(className), [
    t.cloneNode(valueExpr),
  ]);

  let normalized: t.Expression = t.conditionalExpression(
    instanceCheck,
    t.cloneNode(valueExpr),
    newInstance
  );

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

export function buildImmutableArrayOfMessagesExpression(
  valueExpr: t.Expression,
  messageTypeName: string,
  options: { allowUndefined?: boolean } = {}
): t.Expression {
  const { allowUndefined = true } = options;

  const nilCheck = t.logicalExpression(
    '||',
    t.binaryExpression(
      '===',
      t.cloneNode(valueExpr),
      t.identifier('undefined')
    ),
    t.binaryExpression('===', t.cloneNode(valueExpr), t.nullLiteral())
  );

  const arrayFrom = t.callExpression(
    t.memberExpression(t.identifier('Array'), t.identifier('from')),
    [t.cloneNode(valueExpr)]
  );
  const mapCall = t.callExpression(
    t.memberExpression(arrayFrom, t.identifier('map')),
    [
      t.arrowFunctionExpression(
        [t.identifier('v')],
        t.conditionalExpression(
          t.binaryExpression(
            'instanceof',
            t.identifier('v'),
            t.identifier(messageTypeName)
          ),
          t.identifier('v'),
          t.newExpression(
            t.identifier(messageTypeName),
            [t.identifier('v')]
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
  options: { allowUndefined?: boolean } = {}
): t.Expression {
  const { allowUndefined = true } = options;

  const nilCheck = t.logicalExpression(
    '||',
    t.binaryExpression(
      '===',
      t.cloneNode(valueExpr),
      t.identifier('undefined')
    ),
    t.binaryExpression('===', t.cloneNode(valueExpr), t.nullLiteral())
  );

  const arrayFrom = t.callExpression(
    t.memberExpression(t.identifier('Array'), t.identifier('from')),
    [t.cloneNode(valueExpr)]
  );
  const mapCall = t.callExpression(
    t.memberExpression(arrayFrom, t.identifier('map')),
    [
      t.arrowFunctionExpression(
        [t.identifier('v')],
        t.conditionalExpression(
          t.binaryExpression(
            'instanceof',
            t.identifier('v'),
            t.identifier(messageTypeName)
          ),
          t.identifier('v'),
          t.newExpression(
            t.identifier(messageTypeName),
            [t.identifier('v')]
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
  options: { allowUndefined?: boolean } = {}
): t.Expression {
  const { allowUndefined = true } = options;

  const nilCheck = t.logicalExpression(
    '||',
    t.binaryExpression(
      '===',
      t.cloneNode(valueExpr),
      t.identifier('undefined')
    ),
    t.binaryExpression('===', t.cloneNode(valueExpr), t.nullLiteral())
  );

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
            t.binaryExpression(
              'instanceof',
              t.identifier('v'),
              t.identifier(messageTypeName)
            ),
            t.identifier('v'),
            t.newExpression(
              t.identifier(messageTypeName),
              [t.identifier('v')]
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
  keyIsDate?: boolean;
  keyIsUrl?: boolean;
  keyIsArray?: boolean;
  keyIsMessage?: string;
  valueIsDate?: boolean;
  valueIsUrl?: boolean;
  valueIsMessage?: string;
}

export function buildImmutableMapWithConversionsExpression(
  valueExpr: t.Expression,
  conversions: MapConversionInfo,
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
  // an 'as object' cast for instanceof to work
  const instanceofLhs = castToAny
    ? t.tsAsExpression(t.cloneNode(valueExpr), t.tsTypeReference(t.identifier('object')))
    : t.cloneNode(valueExpr);
  const immutableCheck = t.binaryExpression(
    'instanceof',
    instanceofLhs,
    t.identifier('ImmutableMap')
  );

  // Build the key conversion expression
  const keyId = t.identifier('k');
  let keyConversion: t.Expression = keyId;

  if (conversions.keyIsDate) {
    keyConversion = t.conditionalExpression(
      t.binaryExpression(
        'instanceof',
        t.cloneNode(keyId),
        t.identifier('ImmutableDate')
      ),
      t.cloneNode(keyId),
      t.newExpression(
        t.identifier('ImmutableDate'),
        [t.cloneNode(keyId)]
      )
    );
  } else if (conversions.keyIsUrl) {
    keyConversion = t.conditionalExpression(
      t.binaryExpression(
        'instanceof',
        t.cloneNode(keyId),
        t.identifier('ImmutableUrl')
      ),
      t.cloneNode(keyId),
      t.newExpression(
        t.identifier('ImmutableUrl'),
        [t.cloneNode(keyId)]
      )
    );
  } else if (conversions.keyIsArray) {
    keyConversion = t.conditionalExpression(
      t.binaryExpression(
        'instanceof',
        t.cloneNode(keyId),
        t.identifier('ImmutableArray')
      ),
      t.cloneNode(keyId),
      t.newExpression(
        t.identifier('ImmutableArray'),
        [t.cloneNode(keyId)]
      )
    );
  } else if (conversions.keyIsMessage) {
    keyConversion = t.conditionalExpression(
      t.binaryExpression(
        'instanceof',
        t.cloneNode(keyId),
        t.identifier(conversions.keyIsMessage)
      ),
      t.cloneNode(keyId),
      t.newExpression(
        t.identifier(conversions.keyIsMessage),
        [t.cloneNode(keyId)]
      )
    );
  }

  // Build the value conversion expression
  const valueId = t.identifier('v');
  let valueConversion: t.Expression = valueId;

  if (conversions.valueIsDate) {
    valueConversion = t.conditionalExpression(
      t.binaryExpression(
        'instanceof',
        t.cloneNode(valueId),
        t.identifier('ImmutableDate')
      ),
      t.cloneNode(valueId),
      t.newExpression(
        t.identifier('ImmutableDate'),
        [t.cloneNode(valueId)]
      )
    );
  } else if (conversions.valueIsUrl) {
    valueConversion = t.conditionalExpression(
      t.binaryExpression(
        'instanceof',
        t.cloneNode(valueId),
        t.identifier('ImmutableUrl')
      ),
      t.cloneNode(valueId),
      t.newExpression(
        t.identifier('ImmutableUrl'),
        [t.cloneNode(valueId)]
      )
    );
  } else if (conversions.valueIsMessage) {
    valueConversion = t.conditionalExpression(
      t.binaryExpression(
        'instanceof',
        t.cloneNode(valueId),
        t.identifier(conversions.valueIsMessage)
      ),
      t.cloneNode(valueId),
      t.newExpression(
        t.identifier(conversions.valueIsMessage),
        [t.cloneNode(valueId)]
      )
    );
  }

  // If no conversions needed, use the simple ImmutableMap expression
  const needsConversion =
    conversions.keyIsDate
    || conversions.keyIsUrl
    || conversions.keyIsArray
    || conversions.keyIsMessage
    || conversions.valueIsDate
    || conversions.valueIsUrl
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
