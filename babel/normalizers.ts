import * as t from '@babel/types';
import {
  buildMapTagComparison,
  buildSetTagComparison,
} from './runtime-checks';

export function buildImmutableMapExpression(
  valueExpr: t.Expression
): t.Expression {
  const nilCheck = t.logicalExpression(
    '||',
    t.binaryExpression(
      '===',
      t.cloneNode(valueExpr),
      t.identifier('undefined')
    ),
    t.binaryExpression('===', t.cloneNode(valueExpr), t.nullLiteral())
  );

  const immutableCheck = t.logicalExpression(
    '||',
    t.binaryExpression(
      'instanceof',
      t.cloneNode(valueExpr),
      t.identifier('ImmutableMap')
    ),
    buildMapTagComparison(valueExpr, '[object ImmutableMap]')
  );

  const buildNewImmutableMap = () =>
    t.newExpression(t.identifier('ImmutableMap'), [t.cloneNode(valueExpr)]);

  return t.conditionalExpression(
    nilCheck,
    t.cloneNode(valueExpr),
    t.conditionalExpression(
      immutableCheck,
      t.cloneNode(valueExpr),
      buildNewImmutableMap()
    )
  );
}

export function buildImmutableArrayExpression(
  valueExpr: t.Expression
): t.Expression {
  const nilCheck = t.logicalExpression(
    '||',
    t.binaryExpression(
      '===',
      t.cloneNode(valueExpr),
      t.identifier('undefined')
    ),
    t.binaryExpression('===', t.cloneNode(valueExpr), t.nullLiteral())
  );

  const immutableCheck = t.binaryExpression(
    'instanceof',
    t.cloneNode(valueExpr),
    t.identifier('ImmutableArray')
  );

  const toImmutable = () =>
    t.newExpression(t.identifier('ImmutableArray'), [t.cloneNode(valueExpr)]);

  return t.conditionalExpression(
    nilCheck,
    t.cloneNode(valueExpr),
    t.conditionalExpression(
      immutableCheck,
      t.cloneNode(valueExpr),
      toImmutable()
    )
  );
}

export function buildImmutableSetExpression(
  valueExpr: t.Expression
): t.Expression {
  const nilCheck = t.logicalExpression(
    '||',
    t.binaryExpression(
      '===',
      t.cloneNode(valueExpr),
      t.identifier('undefined')
    ),
    t.binaryExpression('===', t.cloneNode(valueExpr), t.nullLiteral())
  );

  const immutableCheck = t.logicalExpression(
    '||',
    t.binaryExpression(
      'instanceof',
      t.cloneNode(valueExpr),
      t.identifier('ImmutableSet')
    ),
    buildSetTagComparison(valueExpr, '[object ImmutableSet]')
  );

  const buildNewImmutableSet = () =>
    t.newExpression(t.identifier('ImmutableSet'), [t.cloneNode(valueExpr)]);

  return t.conditionalExpression(
    nilCheck,
    t.cloneNode(valueExpr),
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
  messageTypeName: string
): t.Expression {
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

  return t.conditionalExpression(
    nilCheck,
    t.cloneNode(valueExpr),
    newImmutable
  );
}

export function buildImmutableSetOfMessagesExpression(
  valueExpr: t.Expression,
  messageTypeName: string
): t.Expression {
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

  return t.conditionalExpression(
    nilCheck,
    t.cloneNode(valueExpr),
    newImmutable
  );
}

export function buildImmutableMapOfMessagesExpression(
  valueExpr: t.Expression,
  messageTypeName: string
): t.Expression {
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

  return t.conditionalExpression(
    nilCheck,
    t.cloneNode(valueExpr),
    newImmutable
  );
}

export interface MapConversionInfo {
  keyIsDate?: boolean;
  keyIsUrl?: boolean;
  keyIsMessage?: string;
  valueIsDate?: boolean;
  valueIsUrl?: boolean;
  valueIsMessage?: string;
}

export function buildImmutableMapWithConversionsExpression(
  valueExpr: t.Expression,
  conversions: MapConversionInfo
): t.Expression {
  const nilCheck = t.logicalExpression(
    '||',
    t.binaryExpression(
      '===',
      t.cloneNode(valueExpr),
      t.identifier('undefined')
    ),
    t.binaryExpression('===', t.cloneNode(valueExpr), t.nullLiteral())
  );

  const immutableCheck = t.logicalExpression(
    '||',
    t.binaryExpression(
      'instanceof',
      t.cloneNode(valueExpr),
      t.identifier('ImmutableMap')
    ),
    buildMapTagComparison(valueExpr, '[object ImmutableMap]')
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
    || conversions.keyIsMessage
    || conversions.valueIsDate
    || conversions.valueIsUrl
    || conversions.valueIsMessage;

  if (!needsConversion) {
    return t.conditionalExpression(
      nilCheck,
      t.cloneNode(valueExpr),
      t.conditionalExpression(
        immutableCheck,
        t.cloneNode(valueExpr),
        t.newExpression(
          t.identifier('ImmutableMap'),
          [t.cloneNode(valueExpr)]
        )
      )
    );
  }

  // Build: Array.from(value).map(([k, v]) => [keyConversion, valueConversion])
  const arrayFrom = t.callExpression(
    t.memberExpression(t.identifier('Array'), t.identifier('from')),
    [t.cloneNode(valueExpr)]
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
    t.cloneNode(valueExpr),
    newImmutableMap
  );
}
