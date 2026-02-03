export type TypeAliasKind = 'message' | 'type';

export interface TypeAliasConfig {
  target: string;
  kind: TypeAliasKind;
  importFrom: string;
}

export type TypeAliasMap = Record<string, TypeAliasConfig>;

export const DEFAULT_TYPE_ALIASES: TypeAliasMap = {
  Date: { target: 'ImmutableDate', kind: 'message', importFrom: '@propane/runtime' },
  URL: { target: 'ImmutableUrl', kind: 'message', importFrom: '@propane/runtime' },
  ArrayBuffer: { target: 'ImmutableArrayBuffer', kind: 'message', importFrom: '@propane/runtime' },
  Array: { target: 'ImmutableArray', kind: 'message', importFrom: '@propane/runtime' },
  ReadonlyArray: { target: 'ImmutableArray', kind: 'message', importFrom: '@propane/runtime' },
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
        message: `Alias "${alias}" must be an object with { target, kind, importFrom }.`,
      });
      continue;
    }

    const target = (config as TypeAliasConfig).target;
    const kind = (config as TypeAliasConfig).kind;
    const importFrom = (config as TypeAliasConfig).importFrom;

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

    if (typeof importFrom !== 'string' || importFrom.length === 0) {
      errors.push({
        alias,
        message: `Alias "${alias}" must define a non-empty "importFrom" string.`,
      });
      continue;
    }

    aliases[alias] = { target, kind, importFrom };
  }

  // Check for conflicting kinds for the same target.
  const targetKinds = new Map<string, TypeAliasKind>();
  const targetSources = new Map<string, string>();
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
    const existingSource = targetSources.get(config.target);
    if (existingSource && existingSource !== config.importFrom) {
      errors.push({
        alias,
        message:
          `Alias "${alias}" conflicts with another alias for target "${config.target}" `
          + `using a different importFrom ("${existingSource}" vs "${config.importFrom}").`,
      });
      continue;
    }
    targetSources.set(config.target, config.importFrom);
  }

  return { aliases, errors };
}
