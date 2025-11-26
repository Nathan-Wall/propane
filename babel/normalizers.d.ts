import * as t from '@babel/types';
export declare function buildImmutableMapExpression(valueExpr: t.Expression): t.Expression;
export declare function buildImmutableArrayExpression(valueExpr: t.Expression): t.Expression;
export declare function buildImmutableSetExpression(valueExpr: t.Expression): t.Expression;
export declare function buildImmutableDateNormalizationExpression(valueExpr: t.Expression, { allowUndefined, allowNull }?: {
    allowUndefined?: boolean;
    allowNull?: boolean;
}): t.Expression;
export declare function buildImmutableUrlNormalizationExpression(valueExpr: t.Expression, { allowUndefined, allowNull }?: {
    allowUndefined?: boolean;
    allowNull?: boolean;
}): t.Expression;
export declare function buildImmutableArrayBufferNormalizationExpression(valueExpr: t.Expression, { allowUndefined, allowNull }?: {
    allowUndefined?: boolean;
    allowNull?: boolean;
}): t.Expression;
export declare function buildMessageNormalizationExpression(valueExpr: t.Expression, className: string, { allowUndefined, allowNull }?: {
    allowUndefined?: boolean;
    allowNull?: boolean;
}): t.Expression;
export declare function buildImmutableArrayOfMessagesExpression(valueExpr: t.Expression, messageTypeName: string): t.Expression;
export declare function buildImmutableSetOfMessagesExpression(valueExpr: t.Expression, messageTypeName: string): t.Expression;
export declare function buildImmutableMapOfMessagesExpression(valueExpr: t.Expression, messageTypeName: string): t.Expression;
export interface MapConversionInfo {
    keyIsDate?: boolean;
    keyIsUrl?: boolean;
    keyIsArray?: boolean;
    keyIsMessage?: string;
    valueIsDate?: boolean;
    valueIsUrl?: boolean;
    valueIsMessage?: string;
}
export declare function buildImmutableMapWithConversionsExpression(valueExpr: t.Expression, conversions: MapConversionInfo): t.Expression;
