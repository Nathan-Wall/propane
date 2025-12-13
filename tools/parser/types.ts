/**
 * PMT (Propane Message Tree) Types
 *
 * These types represent the parsed structure of .pmsg files.
 * All propane tools (Babel plugin, PMS client compiler, etc.) consume PMT.
 */

// ============================================================================
// Source Location
// ============================================================================

export interface SourceLocation {
  start: { line: number; column: number };
  end: { line: number; column: number };
}

// ============================================================================
// Diagnostics
// ============================================================================

export type DiagnosticSeverity = 'error' | 'warning';

export interface PmtDiagnostic {
  filePath: string;
  location: SourceLocation;
  severity: DiagnosticSeverity;
  /** Short machine-readable code, e.g. 'PMT010' */
  code: string;
  /** Human-friendly message */
  message: string;
}

// ============================================================================
// Types
// ============================================================================

export type PmtPrimitive =
  | 'string'
  | 'number'
  | 'boolean'
  | 'bigint'
  | 'null'
  | 'undefined';

export type PmtType =
  | { kind: 'primitive'; primitive: PmtPrimitive }
  | { kind: 'reference'; name: string; typeArguments: PmtType[] }
  | { kind: 'array'; elementType: PmtType }
  | { kind: 'map'; keyType: PmtType; valueType: PmtType }
  | { kind: 'set'; elementType: PmtType }
  | { kind: 'union'; types: PmtType[] }
  | { kind: 'date' }
  | { kind: 'url' }
  | { kind: 'arraybuffer' }
  | { kind: 'literal'; value: string | number | boolean };

// ============================================================================
// Type Parameters
// ============================================================================

export interface PmtTypeParameter {
  name: string;
  /** Constraint as a structured type, or null if unconstrained */
  constraint: PmtType | null;
}

// ============================================================================
// Properties
// ============================================================================

export interface PmtProperty {
  /** Logical property name, e.g. "id", "name", "roles" */
  name: string;

  /**
   * Field number for serialization, if using the "1:name" syntax.
   * null for unnumbered fields.
   */
  fieldNumber: number | null;

  /** Whether the property is optional (`?`) */
  optional: boolean;

  /** Whether the property is readonly */
  readonly: boolean;

  /** The property's type */
  type: PmtType;

  /** Location in source for error reporting */
  location: SourceLocation;
}

// ============================================================================
// Message Wrapper (for Endpoint<Payload, Response> patterns)
// ============================================================================

export interface PmtMessageWrapper {
  /** Local name of the wrapper generic (e.g. 'Endpoint', 'PmsRequest') */
  localName: string;

  /** Parsed type of the second type argument (Response), if present */
  responseType: PmtType | null;
}

// ============================================================================
// Messages
// ============================================================================

export interface PmtMessage {
  /** Type name (e.g., "User", "GetUser") */
  name: string;

  /** True if wrapped with Message<{...}>, Table<{...}>, or Endpoint<{...}, R> */
  isMessageType: boolean;

  /** True if wrapped with Table<{...}> from @propanejs/postgres */
  isTableType: boolean;

  /** Path from // @extend('<path>') decorator, if present */
  extendPath: string | null;

  /** Message properties (from the underlying object literal payload) */
  properties: PmtProperty[];

  /** Generic type parameters declared on the message */
  typeParameters: PmtTypeParameter[];

  /**
   * If this message was defined as `F<{ ...payload... }, Response, ...>`
   * rather than a bare object literal, wrapper will be populated.
   *
   * For plain object-literal messages, wrapper is null.
   */
  wrapper: PmtMessageWrapper | null;

  /** Location in source for error reporting */
  location: SourceLocation;
}

// ============================================================================
// Non-message Type Aliases
// ============================================================================

export interface PmtTypeAlias {
  name: string;
  typeParameters: PmtTypeParameter[];
  type: PmtType;
  location: SourceLocation;
}

// ============================================================================
// Imports
// ============================================================================

export interface PmtImportSpecifier {
  /** Imported name, e.g. 'Endpoint' */
  imported: string;
  /** Local name, e.g. 'PmsRequest' (may be same as imported) */
  local: string;
}

export interface PmtImport {
  /** Module source, e.g. '@propanejs/core', './foo' */
  source: string;
  specifiers: PmtImportSpecifier[];
}

// ============================================================================
// File
// ============================================================================

export interface PmtFile {
  /** Absolute path to the source file */
  path: string;

  /** All Message<{...}>/Table<{...}>/Endpoint<{...}> types found in this file */
  messages: PmtMessage[];

  /** Non-message type aliases (restricted shapes) */
  typeAliases: PmtTypeAlias[];

  /** Import statements */
  imports: PmtImport[];

  /** Diagnostics discovered while parsing/validating this file */
  diagnostics: PmtDiagnostic[];
}

// ============================================================================
// Endpoint Info (for RPC detection)
// ============================================================================

export interface PmtEndpointInfo {
  /** Request type name, e.g. "GetUser" */
  requestTypeName: string;
  /** Parsed type of the response */
  responseType: PmtType;
  /** The message this endpoint was derived from */
  message: PmtMessage;
  /** The file containing this endpoint */
  file: PmtFile;
}

// ============================================================================
// Parse Results
// ============================================================================

export interface ParseFileResult {
  file: PmtFile;
  diagnostics: PmtDiagnostic[];
}

export interface ParseFilesResult {
  files: PmtFile[];
  diagnostics: PmtDiagnostic[];
}
