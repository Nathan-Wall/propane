/**
 * File Parsing API
 *
 * High-level API for parsing .pmsg files from disk or source strings.
 */

import { parse } from '@babel/parser';
import { readFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { ParseFileResult, ParseFilesResult, PmtDiagnostic } from './types.js';
import { getBabelParserOptions } from './babel-config.js';
import { parseFromAst } from './parse-ast.js';
import type { TypeAliasMap } from './type-aliases.js';

export interface ParseOptions {
  typeAliases?: TypeAliasMap;
}

/**
 * Parse a single .pmsg file from source code.
 *
 * @param source - The source code to parse
 * @param filePath - The file path (used for error messages and PMT metadata)
 * @returns Parse result with PMT file and diagnostics
 */
export function parseSource(
  source: string,
  filePath: string,
  options?: ParseOptions
): ParseFileResult {
  const diagnostics: PmtDiagnostic[] = [];

  try {
    const ast = parse(source, getBabelParserOptions());
    const result = parseFromAst(ast, filePath, options);
    return result;
  } catch (error) {
    // Handle Babel parse errors
    const message = error instanceof Error ? error.message : String(error);
    diagnostics.push({
      filePath,
      location: {
        start: { line: 1, column: 0 },
        end: { line: 1, column: 0 },
      },
      severity: 'error',
      code: 'PMT001',
      message: `Failed to parse file: ${message}`,
    });

    return {
      file: {
        path: filePath,
        messages: [],
        typeAliases: [],
        imports: [],
        diagnostics,
      },
      diagnostics,
    };
  }
}

/**
 * Parse a single .pmsg file from disk.
 *
 * @param filePath - Path to the .pmsg file
 * @returns Parse result with PMT file and diagnostics
 */
export function parseFile(
  filePath: string,
  options?: ParseOptions
): ParseFileResult {
  const absolutePath = path.resolve(filePath);

  try {
    const source = readFileSync(absolutePath, 'utf8');
    return parseSource(source, absolutePath, options);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const diagnostics: PmtDiagnostic[] = [
      {
        filePath: absolutePath,
        location: {
          start: { line: 0, column: 0 },
          end: { line: 0, column: 0 },
        },
        severity: 'error',
        code: 'PMT002',
        message: `Failed to read file: ${message}`,
      },
    ];

    return {
      file: {
        path: absolutePath,
        messages: [],
        typeAliases: [],
        imports: [],
        diagnostics,
      },
      diagnostics,
    };
  }
}

/**
 * Parse multiple .pmsg files.
 *
 * @param filePaths - Paths to the .pmsg files
 * @returns Parse result with all PMT files and aggregated diagnostics
 */
export function parseFiles(
  filePaths: string[],
  options?: ParseOptions
): ParseFilesResult {
  const files = [];
  const allDiagnostics: PmtDiagnostic[] = [];

  for (const filePath of filePaths) {
    const result = parseFile(filePath, options);
    files.push(result.file);
    allDiagnostics.push(...result.diagnostics);
  }

  return {
    files,
    diagnostics: allDiagnostics,
  };
}

/**
 * Parse a single .pmsg file from disk asynchronously.
 *
 * @param filePath - Path to the .pmsg file
 * @returns Promise resolving to parse result with PMT file and diagnostics
 */
export async function parseFileAsync(
  filePath: string,
  options?: ParseOptions
): Promise<ParseFileResult> {
  const absolutePath = path.resolve(filePath);

  try {
    const source = await readFile(absolutePath, 'utf8');
    return parseSource(source, absolutePath, options);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const diagnostics: PmtDiagnostic[] = [
      {
        filePath: absolutePath,
        location: {
          start: { line: 0, column: 0 },
          end: { line: 0, column: 0 },
        },
        severity: 'error',
        code: 'PMT002',
        message: `Failed to read file: ${message}`,
      },
    ];

    return {
      file: {
        path: absolutePath,
        messages: [],
        typeAliases: [],
        imports: [],
        diagnostics,
      },
      diagnostics,
    };
  }
}

/**
 * Parse multiple .pmsg files asynchronously.
 *
 * @param filePaths - Paths to the .pmsg files
 * @returns Parse result with all PMT files and aggregated diagnostics
 */
export async function parseFilesAsync(
  filePaths: string[],
  options?: ParseOptions
): Promise<ParseFilesResult> {
  const results = await Promise.all(
    filePaths.map(filePath => parseFileAsync(filePath, options))
  );

  const files = results.map(r => r.file);
  const allDiagnostics = results.flatMap(r => r.diagnostics);

  return {
    files,
    diagnostics: allDiagnostics,
  };
}
