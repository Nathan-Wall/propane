declare module 'fs' {
  const fs: any;
  export = fs;
}

declare module 'path' {
  const path: any;
  export = path;
}

declare module 'url' {
  export const fileURLToPath: (url: string) => string;
  export const pathToFileURL: (path: string) => { href: string };
}

declare module 'vm' {
  const vm: any;
  export = vm;
}

declare module '@babel/core' {
  export function transformSync(...args: any[]): any;
}

declare module '../babel/propane-plugin.js' {
  const plugin: any;
  export default plugin;
}
