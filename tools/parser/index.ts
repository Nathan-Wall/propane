/**
 * @propane/parser
 *
 * Shared parser library for .pmsg (Propane Message) files.
 *
 * This library provides the single source of truth for parsing .pmsg files.
 * All propane tools (Babel plugin, PMS client compiler, etc.) should use
 * this library to ensure consistent interpretation of .pmsg semantics.
 *
 * @example
 * ```typescript
 * import { parseFile, getEndpointInfo, isTransformableMessage } from '@propane/parser';
 *
 * const { file, diagnostics } = parseFile('./api.pmsg');
 *
 * // Check for errors
 * const errors = diagnostics.filter(d => d.severity === 'error');
 * if (errors.length > 0) {
 *   console.error('Parse errors:', errors);
 * }
 *
 * // Process messages
 * for (const message of file.messages) {
 *   if (isTransformableMessage(message, file)) {
 *     console.log('Message:', message.name);
 *   }
 *
 *   const endpoint = getEndpointInfo(file, message);
 *   if (endpoint) {
 *     console.log('Endpoint:', endpoint.requestTypeName);
 *   }
 * }
 * ```
 */

// ============================================================================
// Types
// ============================================================================

export type {
  // Core PMT types
  PmtFile,
  PmtMessage,
  PmtProperty,
  PmtType,
  PmtTypeParameter,
  PmtTypeAlias,
  PmtMessageWrapper,
  PmtImport,
  PmtImportSpecifier,
  PmtPrimitive,

  // Diagnostics
  PmtDiagnostic,
  DiagnosticSeverity,

  // Source locations
  SourceLocation,

  // Endpoint info
  PmtEndpointInfo,

  // Parse results
  ParseFileResult,
  ParseFilesResult,
} from './types.js';

// ============================================================================
// Babel Configuration
// ============================================================================

export { getBabelParserOptions } from './babel-config.js';

// ============================================================================
// Parsing API
// ============================================================================

export {
  parseSource,
  parseFile,
  parseFiles,
  parseFileAsync,
  parseFilesAsync,
  type ParseOptions,
} from './parse-file.js';

export { parseFromAst } from './parse-ast.js';

// ============================================================================
// Endpoint Detection
// ============================================================================

export {
  isTransformableMessage,
  getEndpointInfo,
  findEndpoints,
  findAllEndpoints,
  getResponseTypeName,
} from './rpc.js';

// ============================================================================
// Type Parsing Utilities (for advanced use cases)
// ============================================================================

export {
  parseType,
  parseTypeParameters,
  getSourceLocation,
  isObjectLiteralType,
  isWrapperType,
  extractWrapperInfo,
  type TypeParserContext,
} from './type-parser.js';

export type {
  TypeAliasConfig,
  TypeAliasKind,
  TypeAliasMap,
} from './type-aliases.js';

export {
  DEFAULT_TYPE_ALIASES,
  normalizeTypeAliases,
} from './type-aliases.js';

// ============================================================================
// Decorator Extraction (for advanced use cases)
// ============================================================================

export {
  extractDecorators,
  type DecoratorInfo,
} from './decorators.js';

// ============================================================================
// Validation (for advanced use cases)
// ============================================================================

export {
  validateNoInterfaces,
  validateNoIntersections,
  validateObjectLiteralRequiresWrapper,
  containsIntersection,
  type ValidationContext,
} from './validation.js';

// ============================================================================
// Wrapper Detection (for advanced use cases)
// ============================================================================

export {
  detectWrapper,
  isMessageWrapperType,
  isTableWrapperType,
  isEndpointWrapperType,
  type WrapperDetectionResult,
} from './wrapper-detection.js';
