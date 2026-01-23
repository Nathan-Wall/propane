/**
 * AST to PMT Conversion
 *
 * Converts a Babel AST into a PMT (Propane Message Tree).
 */

import * as t from '@babel/types';
import type {
  PmtFile,
  PmtMessage,
  PmtProperty,
  PmtTypeAlias,
  PmtImport,
  PmtDiagnostic,
  PmtMessageWrapper,
} from './types.js';
import { extractDecorators } from './decorators.js';
import { parseProperties } from './properties.js';
import {
  parseType,
  parseTypeParameters,
  getSourceLocation,
  type TypeParserContext,
} from './type-parser.js';
import {
  validateNoInterfaces,
  validateNoIntersections,
  validateObjectLiteralRequiresWrapper,
  validateFileLevel,
} from './validation.js';
import { detectWrapper } from './wrapper-detection.js';

/**
 * Parse a Babel AST into a PMT file.
 */
export function parseFromAst(
  ast: t.File,
  filePath: string
): { file: PmtFile; diagnostics: PmtDiagnostic[] } {
  const diagnostics: PmtDiagnostic[] = [];
  const messages: PmtMessage[] = [];
  const typeAliases: PmtTypeAlias[] = [];
  const imports: PmtImport[] = [];

  // Run file-level validations
  validateFileLevel(ast, { filePath, diagnostics });
  validateNoInterfaces(ast.program.body, { filePath, diagnostics });

  // First pass: collect all imports (needed for wrapper detection)
  for (const stmt of ast.program.body) {
    if (t.isImportDeclaration(stmt)) {
      const pmtImport = parseImport(stmt);
      if (pmtImport) {
        imports.push(pmtImport);
      }
    }
  }

  // Create context with imports for wrapper detection
  const ctx: ProcessTypeAliasContext = { filePath, diagnostics, imports };

  // Second pass: process type aliases
  for (const stmt of ast.program.body) {
    // Skip imports (already processed)
    if (t.isImportDeclaration(stmt)) {
      continue;
    }

    // Handle type aliases (with or without export)
    const typeAlias = extractTypeAlias(stmt);
    if (typeAlias) {
      processTypeAlias(typeAlias, stmt, ctx, messages, typeAliases);
      continue;
    }
  }

  const file: PmtFile = {
    path: filePath,
    messages,
    typeAliases,
    imports,
    diagnostics: [...diagnostics], // Copy diagnostics to file
  };

  return { file, diagnostics };
}

/**
 * Extract type alias from a statement (handles export declarations).
 */
function extractTypeAlias(stmt: t.Statement): t.TSTypeAliasDeclaration | null {
  if (t.isTSTypeAliasDeclaration(stmt)) {
    return stmt;
  }

  if (
    t.isExportNamedDeclaration(stmt)
    && t.isTSTypeAliasDeclaration(stmt.declaration)
  ) {
    return stmt.declaration;
  }

  return null;
}

/**
 * Interface for parsed imports passed to processTypeAlias.
 */
interface ProcessTypeAliasContext extends TypeParserContext {
  imports: PmtImport[];
}

/**
 * Process a type alias declaration.
 */
function processTypeAlias(
  typeAlias: t.TSTypeAliasDeclaration,
  originalStmt: t.Statement,
  ctx: ProcessTypeAliasContext,
  messages: PmtMessage[],
  typeAliases: PmtTypeAlias[]
): void {
  const typeName = typeAlias.id.name;
  const typeAnnotation = typeAlias.typeAnnotation;
  const location = getSourceLocation(typeAlias);

  // Extract @extend decorator from comments (only decorator still supported)
  const decoratorInfo = extractDecorators(
    originalStmt, ctx.filePath, ctx.diagnostics
  );

  // Validate for intersections
  validateNoIntersections(typeAnnotation, {
    filePath: ctx.filePath, diagnostics: ctx.diagnostics,
  });

  // Detect Message/Table/Endpoint wrapper
  const wrapperResult = detectWrapper(typeAnnotation, ctx.imports);

  if (decoratorInfo.compact && !wrapperResult.isMessageWrapper) {
    ctx.diagnostics.push({
      filePath: ctx.filePath,
      location,
      severity: 'error',
      code: 'PMT041',
      message: '@compact decorator requires a Message<{...}> wrapper.',
    });
  }

  // Validate that object literals must use Message<{...}> wrapper
  validateObjectLiteralRequiresWrapper(
    typeAnnotation,
    wrapperResult.isMessageWrapper,
    typeName,
    { filePath: ctx.filePath, diagnostics: ctx.diagnostics }
  );

  // Parse type parameters
  const typeParameters = parseTypeParameters(typeAlias.typeParameters, ctx);

  // If this is a message type (Message<T>, Table<T>, or Endpoint<P, R> wrapper)
  if (wrapperResult.isMessageWrapper) {
    let properties: PmtProperty[] = [];
    let wrapper: PmtMessageWrapper | null = null;

    // Extract properties from the inner object literal
    if (wrapperResult.innerType) {
      properties = parseProperties(wrapperResult.innerType, ctx);
    }

    // For Endpoint wrapper, capture the response type
    if (wrapperResult.isEndpointWrapper && wrapperResult.secondTypeArg) {
      wrapper = {
        localName: wrapperResult.wrapperLocalName!,
        responseType: parseType(wrapperResult.secondTypeArg, ctx),
      };
    } else if (wrapperResult.wrapperLocalName) {
      wrapper = {
        localName: wrapperResult.wrapperLocalName,
        responseType: null,
      };
    }

    const autoCompact = decoratorInfo.compact
      && isAutoCompactMessage(properties);
    if (decoratorInfo.compact && !decoratorInfo.extendPath && !autoCompact) {
      ctx.diagnostics.push({
        filePath: ctx.filePath,
        location,
        severity: 'error',
        code: 'PMT042',
        message: '@compact decorator requires @extend to define toCompact/fromCompact.',
      });
    }

    const message: PmtMessage = {
      name: typeName,
      isMessageType: true,
      isTableType: wrapperResult.isTableWrapper,
      extendPath: decoratorInfo.extendPath,
      typeId: decoratorInfo.typeId,
      compact: decoratorInfo.compact,
      compactTag: decoratorInfo.compactTag,
      properties,
      typeParameters,
      wrapper,
      location,
    };

    messages.push(message);
  } else {
    // Non-message type alias
    const type = parseType(typeAnnotation, ctx);

    const alias: PmtTypeAlias = {
      name: typeName,
      typeParameters,
      type,
      location,
    };

    typeAliases.push(alias);
  }
}

function isAutoCompactMessage(properties: PmtProperty[]): boolean {
  if (properties.length !== 1) return false;
  const prop = properties[0]!;
  if (prop.optional) return false;
  if (prop.fieldNumber !== 1) return false;
  return prop.type.kind === 'primitive' && prop.type.primitive === 'string';
}

/**
 * Known package directory patterns and their canonical package names.
 * Used to normalize relative imports to @propane/* package names.
 */
const PACKAGE_DIR_PATTERNS: [RegExp, string][] = [
  [/(?:^|\/|\\)runtime(?:\/|\\|$)/, '@propane/runtime'],
  [/(?:^|\/|\\)postgres(?:\/|\\|$)/, '@propane/postgres'],
  [/(?:^|\/|\\)pms-core(?:\/|\\|$)/, '@propane/pms-core'],
];

/**
 * Normalize an import source to its canonical package name.
 * Converts relative paths like '../../runtime/index.js' to '@propane/runtime'.
 */
function normalizeImportSource(source: string): string {
  // Already a package import
  if (source.startsWith('@propane/') || source.startsWith('@/')) {
    return source;
  }

  // Check if relative path matches a known package directory
  for (const [pattern, packageName] of PACKAGE_DIR_PATTERNS) {
    if (pattern.test(source)) {
      return packageName;
    }
  }

  return source;
}

/**
 * Parse an import declaration into a PmtImport.
 */
function parseImport(stmt: t.ImportDeclaration): PmtImport | null {
  const source = normalizeImportSource(stmt.source.value);
  const specifiers: PmtImport['specifiers'] = [];

  for (const spec of stmt.specifiers) {
    if (t.isImportSpecifier(spec)) {
      const imported = t.isIdentifier(spec.imported)
        ? spec.imported.name
        : spec.imported.value;
      const local = spec.local.name;
      specifiers.push({ imported, local });
    }
    // Note: We don't track default imports or namespace imports
    // as they're not relevant for endpoint detection
  }

  if (specifiers.length === 0) {
    return null;
  }

  return { source, specifiers };
}
