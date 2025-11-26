export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;
export type JsonArray = JsonValue[];
export interface JsonObject {
  [key: string]: JsonValue;
}

export function isJsonValue(x: unknown): x is JsonValue {
  if (x === null) {
    return true;
  }
  switch (typeof x) {
    case 'string':
    case 'number':
    case 'boolean':
      return true;
    case 'object':
      if (Array.isArray(x)) return x.every((v) => isJsonValue(v));
      for (const v of Object.values(x as Record<string, unknown>)) {
        if (!isJsonValue(v)) return false;
      }
      return true;
    default:
      return false;
  }
}

export function parseJson<T extends JsonValue = JsonValue>(text: string): T {
  const parsed = JSON.parse(text) as JsonValue;
  if (!isJsonValue(parsed)) {
    throw new Error('Invalid JSON value.');
  }
  return parsed as T;
}
