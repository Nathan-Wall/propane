declare module 'fs' {
  interface Dirent {
    name: string;
    isDirectory(): boolean;
    isFile(): boolean;
  }

  interface FsModule {
    readFileSync(path: string, encoding: 'utf8'): string;
    readFileSync(path: string, options: { encoding: 'utf8' }): string;
    readdirSync(path: string, options: { withFileTypes: true }): Dirent[];
    existsSync(path: string): boolean;
  }

  const fs: FsModule;
  export = fs;
}

declare module 'path' {
  interface PathModule {
    dirname(path: string): string;
    resolve(...segments: string[]): string;
    join(...segments: string[]): string;
    relative(from: string, to: string): string;
    basename(path: string, ext?: string): string;
    sep: string;
  }

  const path: PathModule;
  export = path;
}

declare module 'url' {
  export function fileURLToPath(url: string): string;
  export function pathToFileURL(path: string): { href: string };
}

declare module 'vm' {
  interface VmModule {
    runInNewContext(
      code: string,
      sandbox: Record<string, unknown>,
      options?: { timeout?: number }
    ): void;
  }

  const vm: VmModule;
  export = vm;
}

declare module '@babel/core' {
  export interface TransformOptions {
    filename?: string;
    parserOpts?: { sourceType?: 'module' | 'script'; plugins?: string[] };
    plugins?: unknown[];
  }

  export function transformSync(source: string, options?: TransformOptions): {
    code?: string;
  };
}

