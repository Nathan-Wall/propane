export type TypeAliasKind = 'message' | 'type';

export interface TypeAliasConfig {
  target: string;
  kind: TypeAliasKind;
}

export type TypeAliasMap = Record<string, TypeAliasConfig>;

export const DEFAULT_TYPE_ALIASES: TypeAliasMap = {
  Date: { target: 'ImmutableDate', kind: 'message' },
  URL: { target: 'ImmutableUrl', kind: 'message' },
  ArrayBuffer: { target: 'ImmutableArrayBuffer', kind: 'message' },
  Array: { target: 'ImmutableArray', kind: 'message' },
  ReadonlyArray: { target: 'ImmutableArray', kind: 'message' },
};

export interface TypeAliasValidationError {
  alias: string;
  message: string;
}

const IDENTIFIER_RE = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

export function normalizeTypeAliases(
  custom?: TypeAliasMap
): { aliases: TypeAliasMap; errors: TypeAliasValidationError[] } {
  const errors: TypeAliasValidationError[] = [];
  const aliases: TypeAliasMap = { ...DEFAULT_TYPE_ALIASES };

  if (!custom) {
    return { aliases, errors };
  }

  for (const [alias, config] of Object.entries(custom)) {
    if (!IDENTIFIER_RE.test(alias)) {
      errors.push({
        alias,
        message: `Alias name "${alias}" must be a simple identifier.`,
      });
      continue;
    }

    if (!config || typeof config !== 'object') {
      errors.push({
        alias,
        message: `Alias "${alias}" must be an object with { target, kind }.`,
      });
      continue;
    }

    const target = (config as TypeAliasConfig).target;
    const kind = (config as TypeAliasConfig).kind;

    if (typeof target !== 'string' || target.length === 0) {
      errors.push({
        alias,
        message: `Alias "${alias}" must define a non-empty "target" string.`,
      });
      continue;
    }

    if (kind !== 'message' && kind !== 'type') {
      errors.push({
        alias,
        message: `Alias "${alias}" must define kind "message" or "type".`,
      });
      continue;
    }

    aliases[alias] = { target, kind };
  }

  // Check for conflicting kinds for the same target.
  const targetKinds = new Map<string, TypeAliasKind>();
  for (const [alias, config] of Object.entries(aliases)) {
    const existing = targetKinds.get(config.target);
    if (existing && existing !== config.kind) {
      errors.push({
        alias,
        message:
          `Alias "${alias}" conflicts with another alias for target "${config.target}" `
          + `using a different kind ("${existing}" vs "${config.kind}").`,
      });
      continue;
    }
    targetKinds.set(config.target, config.kind);
  }

  return { aliases, errors };
}
