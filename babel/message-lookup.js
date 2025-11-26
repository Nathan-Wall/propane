import * as t from '@babel/types';
import { analyzePropaneModule, getFilename, getImportedName, resolveImportPath, } from './imports.js';
export function createMessageReferenceResolver(declaredMessageTypeNames) {
    const messageModuleCache = new Map();
    return function getMessageReferenceName(typePath) {
        if (!typePath?.isTSTypeReference()) {
            return null;
        }
        const typeName = typePath.node.typeName;
        if (!t.isIdentifier(typeName)) {
            return null;
        }
        const name = typeName.name;
        if (declaredMessageTypeNames.has(name)) {
            return name;
        }
        const binding = typePath.scope.getBinding(name);
        if (binding
            && (binding.path.isImportSpecifier()
                || binding.path.isImportDefaultSpecifier())
            && binding.path.parentPath?.isImportDeclaration()) {
            const importSource = binding.path.parentPath.node.source.value;
            const filename = getFilename(typePath);
            const resolved = resolveImportPath(importSource, filename);
            if (!resolved) {
                return null;
            }
            if (!messageModuleCache.has(resolved)) {
                messageModuleCache.set(resolved, analyzePropaneModule(resolved));
            }
            const exportNames = messageModuleCache.get(resolved);
            const importedName = getImportedName(binding.path);
            if (exportNames && importedName && exportNames.has(importedName)) {
                return binding.identifier.name;
            }
        }
        return null;
    };
}
