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
      if (Array.isArray(x)) return x.every(v => isJsonValue(v));
      for (const v of Object.values(x as Record<string, unknown>)) {
        if (!isJsonValue(v)) return false;
      }
      return true;
    default:
      return false;
  }
}

/**
 * Parse a JSON string and validate that it contains only JSON-compatible values.
 * Throws if the string is not valid JSON or contains non-JSON values.
 */
export function parseJson(text: string): JsonValue {
  const parsed: unknown = JSON.parse(text);
  if (!isJsonValue(parsed)) {
    throw new Error('Invalid JSON value.');
  }
  return parsed;
}
