import path from 'node:path';
export function capitalize(name) {
    if (!name) {
        return '';
    }
    return name.charAt(0).toUpperCase() + name.slice(1);
}
export function pathTransform(filename) {
    const relative = path.relative(process.cwd(), filename);
    const normalized = relative && !relative.startsWith('..')
        ? relative
        : filename;
    return normalized.split(path.sep).join('/');
}
