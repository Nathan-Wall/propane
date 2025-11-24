export function normalizePropertyKey(memberPath) {
    const keyPath = memberPath.get('key');
    if (keyPath.isIdentifier()) {
        const name = keyPath.node.name;
        assertValidPropertyName(name, keyPath);
        return { name, fieldNumber: null };
    }
    if (keyPath.isStringLiteral()) {
        const rawValue = keyPath.node.value;
        const match = /^(\d+):([A-Za-z_][A-Za-z0-9_]*)$/.exec(rawValue);
        if (!match) {
            throw keyPath.buildCodeFrameError('Numbered propane properties must follow the "<positive-integer>:<identifier>" format, e.g. \'1:name\'.');
        }
        const [, numberPart, identifierPart] = match;
        const fieldNumber = Number(numberPart);
        if (!Number.isSafeInteger(fieldNumber)) {
            throw keyPath.buildCodeFrameError('Propane property numbers must be integers.');
        }
        assertValidPropertyName(identifierPart, keyPath);
        return { name: identifierPart, fieldNumber };
    }
    throw memberPath.buildCodeFrameError('Propane properties must use identifier names or numbered keys like \'1:name\'.');
}
export function assertValidPropertyName(name, keyPath) {
    if (name.includes('$')) {
        throw keyPath.buildCodeFrameError('Propane property names cannot contain "$".');
    }
}
