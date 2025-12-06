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
  extractWrapperInfo,
  type TypeParserContext,
} from './type-parser.js';
import {
  validateNoInterfaces,
  validateNoIntersections,
  validateMessageType,
  validateNonMessageType,
  validateFileLevel,
} from './validation.js';

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

  const ctx: TypeParserContext = { filePath, diagnostics };

  // Run file-level validations
  validateFileLevel(ast, { filePath, diagnostics });
  validateNoInterfaces(ast.program.body, { filePath, diagnostics });

  // Process all statements
  for (const stmt of ast.program.body) {
    // Handle imports
    if (t.isImportDeclaration(stmt)) {
      const pmtImport = parseImport(stmt);
      if (pmtImport) {
        imports.push(pmtImport);
      }
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
 * Process a type alias declaration.
 */
function processTypeAlias(
  typeAlias: t.TSTypeAliasDeclaration,
  originalStmt: t.Statement,
  ctx: TypeParserContext,
  messages: PmtMessage[],
  typeAliases: PmtTypeAlias[]
): void {
  const typeName = typeAlias.id.name;
  const typeAnnotation = typeAlias.typeAnnotation;
  const location = getSourceLocation(typeAlias);

  // Extract decorators from comments
  const decoratorInfo = extractDecorators(
    originalStmt, ctx.filePath, ctx.diagnostics
  );

  // Validate for intersections
  validateNoIntersections(typeAnnotation, {
    filePath: ctx.filePath, diagnostics: ctx.diagnostics,
  });

  // Validate @message usage
  const { isWrapper } = validateMessageType(
    typeAnnotation,
    decoratorInfo.hasMessage,
    typeName,
    { filePath: ctx.filePath, diagnostics: ctx.diagnostics }
  );

  // Validate non-@message types
  validateNonMessageType(
    typeAnnotation,
    decoratorInfo.hasMessage,
    typeName,
    { filePath: ctx.filePath, diagnostics: ctx.diagnostics }
  );

  // Parse type parameters
  const typeParameters = parseTypeParameters(typeAlias.typeParameters, ctx);

  // If this is a @message type
  if (decoratorInfo.hasMessage) {
    let properties: PmtProperty[] = [];
    let wrapper: PmtMessageWrapper | null = null;

    if (isWrapper && t.isTSTypeReference(typeAnnotation)) {
      // Extract wrapper info
      const wrapperInfo = extractWrapperInfo(typeAnnotation, ctx);
      if (wrapperInfo) {
        wrapper = {
          localName: wrapperInfo.localName,
          responseType: wrapperInfo.responseType,
        };
        // Parse properties from the payload (first type argument)
        properties = parseProperties(wrapperInfo.payload, ctx);
      }
    } else if (t.isTSTypeLiteral(typeAnnotation)) {
      // Plain object literal message
      properties = parseProperties(typeAnnotation, ctx);
    }

    const message: PmtMessage = {
      name: typeName,
      hasMessageDecorator: true,
      extendPath: decoratorInfo.extendPath,
      properties,
      typeParameters,
      wrapper,
      location,
    };

    messages.push(message);
  } else {
    // Non-@message type alias
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

/**
 * Parse an import declaration into a PmtImport.
 */
function parseImport(stmt: t.ImportDeclaration): PmtImport | null {
  const source = stmt.source.value;
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
