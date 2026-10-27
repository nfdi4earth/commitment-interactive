// Reads the front matter of a content file: the small YAML subset of docs/content-authoring.md
// ("Header rules"), with messages for content editors. A full YAML parser would accept more and
// silently change some values, e.g. cut `title: Step #3` at the " #" (a comment in YAML) or turn
// `quote: 1.5` into a number.

type Line = { l: string; no: number };

// a "…" string (with \ escapes) and a '…' string (with '' for ')
const DOUBLE = String.raw`"(?:[^"\\]|\\.)*"`;
const SINGLE = String.raw`'(?:[^']|'')*'`;
const DOUBLE_RE = new RegExp(`^${DOUBLE}$`);
const SINGLE_RE = new RegExp(`^${SINGLE}$`);
// one item of an `[a, "b, c"]` list, with the comma before it
const ITEM_RE = new RegExp(String.raw`(?:^|,)\s*(${DOUBLE}|${SINGLE}|[^,]*)\s*`, "g");
export type HeaderValue =
    | string
    | number
    | boolean
    | HeaderValue[]
    | { [key: string]: HeaderValue };

function parseScalar(raw: string, where: string): string | number | boolean {
    const s = raw.trim();
    if (s.startsWith('"')) {
        if (!DOUBLE_RE.test(s))
            throw new Error(
                `${where}: ${s} – a "…" string must end with " and have nothing after it`
            );
        try {
            return JSON.parse(s) as string;
        } catch {
            throw new Error(`${where}: ${s} – write a backslash as \\\\`);
        }
    }
    if (s.startsWith("'")) {
        if (!SINGLE_RE.test(s))
            throw new Error(
                `${where}: ${s} – a '…' string must end with ' and have nothing after it`
            );
        return s.slice(1, -1).replace(/''/g, "'");
    }
    if (/^-?\d+$/.test(s)) {
        if (!Number.isSafeInteger(Number(s)))
            throw new Error(`${where}: number ${s} is too large – put it in "quotes"`);
        return Number(s);
    }
    if (s === "true" || s === "false") return s === "true";
    if (/^[[\]{},&*!|>%@`#]/.test(s) || /^[-?:](\s|$)/.test(s))
        throw new Error(
            `${where}: value "${s}" starts with a special character – put it in "quotes"`
        );
    if (/:\s/.test(s) || /\s#/.test(s))
        throw new Error(`${where}: value "${s}" contains ": " or " #" – put it in "quotes"`);
    if (s === "" || s === "~" || s === "null") throw new Error(`${where}: empty value`);
    return s;
}

/** Splits `a, "b, c", d` at the commas outside quotes. */
function splitItems(s: string, where: string): string[] {
    if (!s.trim()) return [];
    if (s.replace(ITEM_RE, ""))
        throw new Error(`${where}: [${s}] – separate the list items with commas`);
    const items = [...s.matchAll(ITEM_RE)].map((m) => m[1] ?? "");
    const bracket = items.find((x) => !/^["']/.test(x) && /[[\]]/.test(x));
    if (bracket !== undefined)
        throw new Error(`${where}: list item "${bracket}" contains [ or ] – put it in "quotes"`);
    return items;
}

function parseValue(s: string, where: string): HeaderValue {
    const t = s.trim();
    if (!t.startsWith("[")) return parseScalar(t, where);
    if (!t.endsWith("]")) throw new Error(`${where}: list must end with ]`);
    return splitItems(t.slice(1, -1), where).map((x) => parseScalar(x, where));
}

/**
 * Parses the header (the text between the two `---` lines): `field: value` lines, `[a, b]` lists,
 * and `- ` lists of values or of indented maps. Errors name the line, counted in the whole file.
 */
export function parseHeader(text: string): Record<string, HeaderValue> {
    const lines: Line[] = text
        .split("\n")
        .map((l, i) => ({ l: l.replace(/\s+$/, ""), no: i + 2 }))
        .filter(({ l }) => l.trim() && !/^\s*#/.test(l));
    for (const { l, no } of lines) {
        if (l.includes("\t")) throw new Error(`line ${no}: use spaces, not tabs`);
        if ([...l].some((c) => c.charCodeAt(0) < 32))
            throw new Error(`line ${no}: remove the invisible control character`);
        if (/^\s*-$/.test(l))
            throw new Error(`line ${no}: start the list item on the same line as the -`);
        if (/^\s*-\S/.test(l)) throw new Error(`line ${no}: put a space after the -`);
    }
    let i = 0;
    // only spaces: tabs are rejected above
    const indentOf = (l: string) => l.length - l.trimStart().length;
    const isItem = (line: Line | undefined) => !!line?.l.trimStart().startsWith("- ");

    function list(indent: number): HeaderValue[] {
        const out: HeaderValue[] = [];
        for (
            let line = lines[i];
            line && indentOf(line.l) === indent && isItem(line);
            line = lines[i]
        ) {
            const after = line.l.trim().slice(1);
            const item = after.trimStart();
            if (/^[\w-]+:(\s|$)/.test(item)) {
                // an item that is a map: first field on the dash line, further fields aligned with it
                const fieldIndent = indent + 1 + after.length - item.length;
                lines[i] = { l: " ".repeat(fieldIndent) + item, no: line.no };
                out.push(map(fieldIndent));
            } else {
                out.push(parseValue(item, `line ${line.no}`));
                i++;
            }
        }
        return out;
    }

    function map(indent: number): Record<string, HeaderValue> {
        // no prototype: a field named like an Object property (`__proto__`) stays a plain field
        const out = Object.create(null) as Record<string, HeaderValue>;
        for (let line = lines[i]; line && indentOf(line.l) >= indent; line = lines[i]) {
            const where = `line ${line.no}`;
            if (indentOf(line.l) > indent) throw new Error(`${where}: unexpected indentation`);
            const m = line.l.trim().match(/^([\w-]+):(?:\s+(.*))?$/);
            if (!m) throw new Error(`${where}: expected "field: value"`);
            const [, key = "", val] = m;
            if (key in out) throw new Error(`${where}: "${key}" appears twice`);
            i++;
            const next = lines[i];
            if (val) out[key] = parseValue(val, where);
            else if (next && indentOf(next.l) > indent)
                out[key] = isItem(next) ? list(indentOf(next.l)) : map(indentOf(next.l));
            else if (next && indentOf(next.l) === indent && isItem(next)) out[key] = list(indent);
            else throw new Error(`${where}: "${key}" has no value`);
        }
        return out;
    }

    // the map takes all lines: deeper ones belong to a field, others are errors
    return map(0);
}
