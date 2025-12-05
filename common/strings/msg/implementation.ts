// This is in its own file instead of in ./index.ts to avoid a circular
// dependency.

// Supports easy simple message formatting. It works very similarly to Markdown
// as far as whitespace rules. Whitespace is normalized to a single space. An
// empty line can be used to break up paragraphs. \n can be used to force a new
// line.
export function msg(
  strings: TemplateStringsArray,
  ...args: (string|number|boolean|null|undefined)[]
) {
  const out: string[] = [];
  // We capture raw strings so that we can allow forced new lines with \n.
  for (let i = 0; i < strings.raw.length; i++) {
    let string = strings.raw[i] ?? '';
    if (i === 0) {
      string = string.replace(/^\s+/, '');
    }
    if (i === strings.length - 1) {
      string = string.replace(/\s+$/, '');
    }
    string = string.replaceAll(/\s+/g, w => w.includes('\n\n') ? String.raw`\n\n` : ' ');
    // Whitespace following a forced new line wtih \n should be ignored.
    string = string.replaceAll(/\\n\s+/g, String.raw`\n`);
    // Process the raw strings to convert escapes sequences.
    string = JSON.parse(
      '"'
      + string
        // Double quotes should always be escaped.
        .replaceAll(/((?:^|[^\\])(?:\\{2})*)"/g, String.raw`$1\"`)
        // Single quotes and back ticks should never be escaped.
        .replaceAll(/((?:^|[^\\])(?:\\{2})*)\\(['`])/g, '$1$2')
      + '"',
    );
    out.push(string);
    const arg = args[i];
    if (arg !== undefined) {
      out.push(String(arg));
    }
  }
  return out.join('');
}
