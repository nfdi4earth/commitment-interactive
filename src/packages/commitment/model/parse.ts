// Parses the Markdown files of content/ into the content model and checks their integrity.
// It applies the same rules as tools/build-content.mjs (which builds the mock-up); error messages
// are written for content editors, see docs/content-authoring.md.
import yaml from "js-yaml";
import { ICON_NAMES } from "../components/icons";
import type {
    Annotation,
    Box,
    Concept,
    Content,
    DeepDive,
    DeepDiveSection,
    Depth,
    Figure,
    Link,
    Role,
    Statement,
    Topic
} from "./types";
import { ANNOTATION_SCHEME } from "./types";

/** Raw file contents by path relative to the package, e.g. `content/roles/student.md`. */
export type ContentFiles = Record<string, string>;

/** The key of a file in ContentFiles, from any path that ends in `content/…` (also `\` paths). */
export const contentFileKey = (path: string) =>
    path
        .split("\\")
        .join("/")
        .replace(/^.*?(?=content\/)/, "");

export interface ParseResult {
    content: Content;
    errors: string[];
}

const DEPTHS: Depth[] = ["note", "explainer", "deepdive"];
const FIGURES: Figure[] = ["licence", "openness", "fair"];
const ID = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const HEX = /^#[0-9A-Fa-f]{6}$/;

const oneLine = (s: string) => s.replace(/\s+/g, " ").trim();
const stripComments = (s: string) => s.replace(/<!--[\s\S]*?-->/g, "");
const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Bold and italic parts of a text, with the length of their delimiter. As in CommonMark, a
 * delimiter opens before and closes after a non-space; `_` only outside words. Bold and italic are
 * matched separately, so emphasis inside bold gives a second range.
 */
const EMPHASIS: [RegExp, number][] = [
    [/\*\*(?![\s*])[^\n]*?[^\s*]\*\*/gu, 2],
    [/(?<!\*)\*(?![\s*])[^*\n]*?[^\s*]\*(?!\*)/gu, 1],
    [/(?<![\p{L}\p{N}_])__(?![\s_])[^\n]*?[^\s_]__(?![\p{L}\p{N}_])/gu, 2],
    [/(?<![\p{L}\p{N}_])_(?![\s_])[^_\n]*?[^\s_]_(?![\p{L}\p{N}_])/gu, 1]
];

/** Splits a body at `## ` headings. */
export function splitSections(body: string): { lead: string; sections: DeepDiveSection[] } {
    const parts = ("\n" + body).split(/\n## /);
    return {
        lead: (parts[0] ?? "").trim(),
        sections: parts.slice(1).map((p) => {
            const nl = p.indexOf("\n");
            return {
                heading: (nl < 0 ? p : p.slice(0, nl)).trim(),
                text: nl < 0 ? "" : p.slice(nl + 1).trim()
            };
        })
    };
}

type Meta = Record<string, unknown>;
interface Item {
    id: string;
    file: string;
    meta: Meta;
    body: string;
}
type FieldType =
    | "string"
    | "int"
    | "bool"
    | "colour"
    | "icon"
    | "ids"
    | "ints"
    | "links"
    | "depth"
    | "figure";

const isStringList = (v: unknown): v is string[] =>
    Array.isArray(v) && v.every((x) => typeof x === "string");
const FIELD_CHECKS: Record<FieldType, (v: unknown) => true | string> = {
    string: (v) => typeof v === "string" || "must be text",
    int: (v) => Number.isInteger(v) || "must be a whole number",
    bool: (v) => typeof v === "boolean" || "must be true or false",
    colour: (v) =>
        (typeof v === "string" && HEX.test(v)) || 'must be a colour like "#05668D" (in quotes)',
    icon: (v) =>
        (typeof v === "string" && ICON_NAMES.includes(v)) ||
        `must be one of: ${ICON_NAMES.join(", ")}`,
    ids: (v) => isStringList(v) || "must be a list like [a, b]",
    ints: (v) =>
        (Array.isArray(v) && v.every(Number.isInteger)) || "must be a list of numbers like [1, 2]",
    links: (v) =>
        (Array.isArray(v) &&
            v.every(
                (x) =>
                    x &&
                    typeof x === "object" &&
                    typeof x.label === "string" &&
                    typeof x.url === "string" &&
                    Object.keys(x).length === 2
            )) ||
        'must be a list of items with "label:" and "url:"',
    depth: (v) => DEPTHS.includes(v as Depth) || `must be one of: ${DEPTHS.join(", ")}`,
    figure: (v) => FIGURES.includes(v as Figure) || `must be one of: ${FIGURES.join(", ")}`
};

export function parseContent(files: ContentFiles): ParseResult {
    const errors: string[] = [];
    const fail = (file: string, msg: string) => errors.push(`${file}: ${msg}`);

    /* ---------- files ---------- */
    function readItem(file: string, raw: string): Item | undefined {
        const text = raw.replace(/\r\n/g, "\n");
        const m = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
        const id = file.replace(/^.*\//, "").replace(/\.md$/, "");
        if (!m) {
            fail(file, "missing front matter (the file must start with a --- line)");
            return undefined;
        }
        try {
            // CORE_SCHEMA: no dates or other implicit types beyond those tools/build-content.mjs accepts
            const meta = yaml.load(m[1] ?? "", { schema: yaml.CORE_SCHEMA }) ?? {};
            if (typeof meta !== "object" || Array.isArray(meta)) {
                fail(file, 'the front matter must be "field: value" lines');
                return undefined;
            }
            return { id, file, meta: meta as Meta, body: stripComments(m[2] ?? "").trim() };
        } catch (e) {
            fail(file, (e as Error).message);
            return undefined;
        }
    }
    function readFolder(name: string, { idPattern = ID, required = false } = {}): Item[] {
        const prefix = `content/${name}/`;
        const paths = Object.keys(files)
            .filter((p) => p.startsWith(prefix) && p.endsWith(".md"))
            .sort();
        if (required && !paths.length) fail(prefix, "no files found");
        return paths.flatMap((p) => {
            const id = p.slice(prefix.length, -3);
            if (!idPattern.test(id)) {
                fail(p, `file name "${id}" must be lower case letters, digits and hyphens`);
                return [];
            }
            const item = readItem(p, files[p] ?? "");
            return item ? [item] : [];
        });
    }
    function checkMeta(item: Item, schema: Record<string, `${FieldType}` | `${FieldType}!`>) {
        for (const [key, spec] of Object.entries(schema)) {
            const required = spec.endsWith("!");
            const type = spec.replace("!", "") as FieldType;
            if (!(key in item.meta)) {
                if (required) fail(item.file, `"${key}" is required`);
                continue;
            }
            const ok = FIELD_CHECKS[type](item.meta[key]);
            if (ok !== true) fail(item.file, `"${key}" ${ok}`);
        }
        for (const key of Object.keys(item.meta))
            if (!(key in schema))
                fail(
                    item.file,
                    `unknown field "${key}" (allowed: ${Object.keys(schema).join(", ")})`
                );
    }
    function checkMarkdown(file: string, text: string) {
        if (/<\/?[a-zA-Z]/.test(text))
            fail(file, "raw HTML is not allowed; use Markdown (see docs/content-authoring.md)");
        for (const m of text.matchAll(/\]\(([^)]*)\)/g))
            if (!/^(https?:\/\/|mailto:|#\/)/.test(m[1] ?? ""))
                fail(
                    file,
                    `link target "${m[1]}" must start with https://, http://, mailto: or #/`
                );
    }
    function checkLinkUrls(item: Item, links: Link[]) {
        for (const l of links)
            if (!/^(https?:\/\/|mailto:)/.test(l.url))
                fail(
                    item.file,
                    `link "${l.label}": url must start with https://, http:// or mailto:`
                );
    }
    const str = (item: Item, key: string) => (item.meta[key] as string | undefined) ?? "";
    const list = <T>(item: Item, key: string) => (item.meta[key] as T[] | undefined) ?? [];

    /* ---------- commitment text ---------- */
    const textFile = "content/commitment.md";
    const preamble: string[] = [];
    let intro = "";
    const boxes: Box[] = [];
    const statementTexts: { n: number; box: string; text: string }[] = [];
    if (files[textFile] === undefined) fail(textFile, "file not found");
    else {
        const src = stripComments(files[textFile].replace(/\r\n/g, "\n"));
        checkMarkdown(textFile, src);
        for (const part of src.split(/^# /m).slice(1)) {
            const nl = part.indexOf("\n");
            const head = part.slice(0, nl).match(/^(.*?)\s*\{#([\w-]+)\}$/);
            if (!head) {
                fail(textFile, `heading "# ${part.slice(0, nl)}" needs an id, e.g. {#boxA}`);
                continue;
            }
            const [, title = "", id = ""] = head;
            const body = part.slice(nl + 1).trim();
            const paras = body
                .split(/\n\s*\n/)
                .map(oneLine)
                .filter(Boolean);
            if (id === "preamble") preamble.push(...paras);
            else if (id === "intro") intro = paras.join(" ");
            else if (/^box[A-Z]$/.test(id)) {
                const items = body
                    .split(/\n(?=\d+\. )/)
                    .map((it) => it.match(/^(\d+)\. ([\s\S]+)$/));
                if (items.some((x) => !x))
                    fail(textFile, `section ${id} may only contain a numbered list of statements`);
                const nums = items.flatMap((x) => {
                    if (!x) return [];
                    const n = Number(x[1]);
                    statementTexts.push({ n, box: id, text: oneLine(x[2] ?? "") });
                    return [n];
                });
                boxes.push({
                    id,
                    title: oneLine(title),
                    from: Math.min(...nums),
                    to: Math.max(...nums)
                });
            } else
                fail(
                    textFile,
                    `unknown section id "${id}" (allowed: preamble, intro, boxA, boxB, …)`
                );
        }
        statementTexts.forEach(
            (s, i) => s.n !== i + 1 && fail(textFile, `statement ${s.n} should be number ${i + 1}`)
        );
    }
    const STMT_NS = new Set(statementTexts.map((s) => s.n));

    /* ---------- facets ---------- */
    const roleItems = readFolder("roles", { required: true });
    const topicItems = readFolder("topics", { required: true });
    const conceptItems = readFolder("concepts", { required: true });
    const ROLE_IDS = new Set(roleItems.map((x) => x.id));
    const TOPIC_IDS = new Set(topicItems.map((x) => x.id));
    const CONCEPT_IDS = new Set(conceptItems.map((x) => x.id));
    function checkRefs(item: Item, key: string, known: Set<string>, kind: string) {
        for (const v of list<string>(item, key))
            if (!known.has(v)) fail(item.file, `${key}: unknown ${kind} "${v}"`);
    }
    function facetRefs(item: Item) {
        checkRefs(item, "roles", ROLE_IDS, "perspective (content/roles/)");
        checkRefs(item, "topics", TOPIC_IDS, "topic (content/topics/)");
        checkRefs(item, "concepts", CONCEPT_IDS, "concept (content/concepts/)");
    }
    function checkOrder(items: Item[]) {
        const seen = new Map<unknown, string>();
        for (const x of items) {
            const other = seen.get(x.meta.order);
            if (other) fail(x.file, `order ${x.meta.order} is also used by ${other}`);
            else seen.set(x.meta.order, x.file);
        }
    }
    const byOrder = <T extends { order: number }>(xs: T[]) =>
        [...xs].sort((a, b) => a.order - b.order);

    const roles: Role[] = roleItems.map((r) => {
        checkMeta(r, {
            label: "string!",
            plural: "string!",
            colour: "colour!",
            icon: "icon!",
            order: "int!"
        });
        checkMarkdown(r.file, r.body);
        const { lead, sections } = splitSections(r.body);
        if (!lead) fail(r.file, "add a one-paragraph description before the first ## heading");
        const notes: Role["notes"] = {};
        for (const sec of sections) {
            const m = sec.heading.match(/^Statement (\d+)$/);
            if (!m) {
                fail(r.file, `heading "## ${sec.heading}" must be "## Statement <number>"`);
                continue;
            }
            const n = Number(m[1]);
            if (!STMT_NS.has(n)) fail(r.file, `## Statement ${n} does not exist`);
            if (notes[n]) fail(r.file, `## Statement ${n} appears twice`);
            const am = sec.text.match(/^([\s\S]*?)\n*- \[ \] (.+)$/);
            if (!am || !am[1]?.trim()) {
                fail(
                    r.file,
                    `## Statement ${n} needs a note and, as its last line, one first step as "- [ ] …"`
                );
                continue;
            }
            notes[n] = { note: am[1].trim(), step: (am[2] ?? "").trim() };
        }
        return {
            id: r.id,
            kind: "role",
            label: str(r, "label"),
            plural: str(r, "plural"),
            colour: str(r, "colour"),
            icon: str(r, "icon"),
            order: Number(r.meta.order),
            blurb: oneLine(lead),
            notes
        };
    });
    checkOrder(roleItems);

    const topics: Topic[] = topicItems.map((x) => {
        checkMeta(x, {
            label: "string!",
            colour: "colour!",
            icon: "icon!",
            order: "int!",
            known_from: "string!"
        });
        checkMarkdown(x.file, x.body);
        const { lead, sections } = splitSections(x.body);
        if (lead) fail(x.file, "text before the first ## heading is not used; put it into a step");
        const steps = sections.flatMap((sec) => {
            const m = sec.heading.match(/^(.+?)\s*\{statement=(\d+)\}$/);
            if (!m) {
                fail(x.file, `step "## ${sec.heading}" must end with {statement=<number>}`);
                return [];
            }
            const n = Number(m[2]);
            if (!STMT_NS.has(n)) fail(x.file, `step "${m[1]}": statement ${n} does not exist`);
            if (!sec.text) fail(x.file, `step "${m[1]}" has no text`);
            return [{ n, title: m[1] ?? "", text: sec.text }];
        });
        return {
            id: x.id,
            kind: "topic",
            label: str(x, "label"),
            colour: str(x, "colour"),
            icon: str(x, "icon"),
            order: Number(x.meta.order),
            knownFrom: str(x, "known_from"),
            steps
        };
    });
    checkOrder(topicItems);

    const concepts: Concept[] = conceptItems.map((x) => {
        checkMeta(x, { label: "string!", colour: "colour!", order: "int!" });
        if (x.body)
            fail(
                x.file,
                "concept files have no text; write a deep dive in content/deepdives/ instead"
            );
        return {
            id: x.id,
            kind: "concept",
            label: str(x, "label"),
            colour: str(x, "colour"),
            icon: "bulb",
            order: Number(x.meta.order)
        };
    });
    checkOrder(conceptItems);

    /* ---------- statements ---------- */
    const statements: Statement[] = statementTexts.map((s) => ({
        ...s,
        short: "",
        roles: [],
        topics: [],
        concepts: []
    }));
    for (const x of readFolder("statements", { idPattern: /^\d\d$/ })) {
        checkMeta(x, { short: "string!", roles: "ids!", topics: "ids!", concepts: "ids!" });
        facetRefs(x);
        if (x.body)
            fail(x.file, "statement files have no text; the text is in content/commitment.md");
        const s = statements.find((st) => st.n === Number(x.id));
        if (!s) fail(x.file, `statement ${Number(x.id)} is not in content/commitment.md`);
        else
            Object.assign(s, {
                short: str(x, "short"),
                roles: list(x, "roles"),
                topics: list(x, "topics"),
                concepts: list(x, "concepts")
            });
    }
    for (const s of statements)
        if (!s.short) fail(`content/statements/${String(s.n).padStart(2, "0")}.md`, "missing");

    /* ---------- deep dives (ids needed by annotations) ---------- */
    const deepdiveItems = readFolder("deepdives");
    const DD_IDS = new Set(deepdiveItems.map((d) => d.id));

    /* ---------- annotations ---------- */
    const annotationItems = readFolder("annotations");
    const ANNO_IDS = new Set(annotationItems.map((a) => a.id));
    // text of each target, rewritten below with annotation links
    const targets = new Map<string, { get: () => string; set: (v: string) => void }>();
    preamble.forEach((_, i) =>
        targets.set(`pre-${i + 1}`, { get: () => preamble[i] ?? "", set: (v) => (preamble[i] = v) })
    );
    targets.set("intro", { get: () => intro, set: (v) => (intro = v) });
    for (const b of boxes) targets.set(b.id, { get: () => b.title, set: (v) => (b.title = v) });
    for (const s of statements)
        targets.set(`c${s.n}`, { get: () => s.text, set: (v) => (s.text = v) });

    const annotations: Record<string, Annotation> = {};
    const byTarget = new Map<string, { item: Item; quote: string }[]>();
    for (const a of annotationItems) {
        checkMeta(a, {
            target: "string!",
            quote: "string",
            occurrence: "int",
            depth: "depth!",
            title: "string!",
            roles: "ids",
            topics: "ids",
            concepts: "ids",
            links: "links",
            figure: "figure",
            deepdive: "string",
            statements: "ints"
        });
        facetRefs(a);
        checkMarkdown(a.file, a.body);
        if (!a.body) fail(a.file, "the text below the front matter is empty");
        const target = str(a, "target");
        const quote = a.meta.quote as string | undefined;
        const deepdive = a.meta.deepdive as string | undefined;
        if (deepdive && !DD_IDS.has(deepdive))
            fail(a.file, `deepdive: unknown deep dive "${deepdive}" (content/deepdives/)`);
        for (const n of list<number>(a, "statements"))
            if (!STMT_NS.has(n)) fail(a.file, `statements: statement ${n} does not exist`);
        const links = list<Link>(a, "links");
        checkLinkUrls(a, links);
        if (target === "legend") {
            if (quote) fail(a.file, "legend annotations have no quote");
        } else if (!targets.has(target))
            fail(
                a.file,
                `target "${target}" does not exist (use pre-1…pre-${preamble.length}, intro, ${boxes
                    .map((b) => b.id)
                    .join(", ")}, c1…c${statements.length} or legend)`
            );
        else if (!quote) fail(a.file, '"quote" is required');
        else byTarget.set(target, [...(byTarget.get(target) ?? []), { item: a, quote }]);
        annotations[a.id] = {
            id: a.id,
            target,
            quote: quote && oneLine(quote),
            depth: a.meta.depth as Depth,
            title: str(a, "title"),
            body: a.body,
            roles: list(a, "roles"),
            topics: list(a, "topics"),
            concepts: list(a, "concepts"),
            links,
            figure: a.meta.figure as Figure | undefined,
            deepdive,
            statements: a.meta.statements as number[] | undefined
        };
    }

    // quotes → [quote](annotation:id)
    for (const [target, quotes] of byTarget) {
        const access = targets.get(target);
        if (!access) continue;
        const src = access.get();
        const linkRanges = [...src.matchAll(/\[[^\]]*\]\([^)]*\)/g)].map(
            (m) => [m.index, m.index + m[0].length] as const
        );
        // a quote is plain text or inside one bold or italic part, never across its edge
        const styleRanges = EMPHASIS.flatMap(([re, mark]) =>
            [...src.matchAll(re)].map((m) => [m.index, m.index + m[0].length, mark] as const)
        );
        const overlaps = (at: number, end: number, s: number, e: number) => at < e && end > s;
        const crossesStyle = (at: number, end: number) =>
            styleRanges.some(
                ([s, e, mark]) => overlaps(at, end, s, e) && !(at >= s + mark && end <= e - mark)
            );
        const spans: { at: number; end: number; item: Item }[] = [];
        for (const { item, quote } of quotes) {
            // whole words only: "NFDI" does not match inside "NFDI4Earth"
            const q = oneLine(quote);
            const re = new RegExp(`(?<![\\p{L}\\p{N}])${escapeRegExp(q)}(?![\\p{L}\\p{N}])`, "gu");
            const hits = [...src.matchAll(re)].map((m) => m.index);
            const occ = item.meta.occurrence as number | undefined;
            const at = occ ? hits[occ - 1] : hits[0];
            if (!hits.length || at === undefined) {
                if (!hits.length)
                    fail(
                        item.file,
                        `quote "${q}" not found in ${target}. It must match whole words of the text in content/commitment.md exactly, including punctuation`
                    );
                else
                    fail(
                        item.file,
                        `occurrence ${occ}: quote "${q}" occurs only ${hits.length} time(s) in ${target}`
                    );
            } else if (!occ && hits.length > 1)
                fail(
                    item.file,
                    `quote "${q}" occurs ${hits.length} times in ${target}; quote a few more words or add "occurrence: <n>"`
                );
            else if (
                /[[\]]/.test(q) ||
                linkRanges.some(([s, e]) => overlaps(at, at + q.length, s, e))
            )
                fail(item.file, `quote "${q}" overlaps a link; annotate text outside links`);
            else if (crossesStyle(at, at + q.length))
                fail(
                    item.file,
                    `quote "${q}" crosses the edge of **bold** or *italic* text; quote only plain text, or only text inside one bold or italic part`
                );
            else spans.push({ at, end: at + q.length, item });
        }
        spans.sort((x, y) => x.at - y.at);
        spans.forEach((s, i) => {
            const prev = spans[i - 1];
            if (prev && s.at < prev.end)
                fail(s.item.file, `quote overlaps the quote of ${prev.item.file}`);
        });
        let out = src;
        for (const s of [...spans].reverse())
            out =
                out.slice(0, s.at) +
                `[${out.slice(s.at, s.end)}](${ANNOTATION_SCHEME}${s.item.id})` +
                out.slice(s.end);
        access.set(out);
    }

    /* ---------- deep dives ---------- */
    const deepdives: Record<string, DeepDive> = {};
    for (const d of deepdiveItems) {
        checkMeta(d, {
            title: "string!",
            concept: "string!",
            statements: "ints!",
            anchors: "ids!",
            links: "links",
            figure: "figure",
            placeholder: "bool"
        });
        checkMarkdown(d.file, d.body);
        const concept = str(d, "concept");
        if (!CONCEPT_IDS.has(concept)) fail(d.file, `concept: unknown concept "${concept}"`);
        for (const n of list<number>(d, "statements"))
            if (!STMT_NS.has(n)) fail(d.file, `statements: statement ${n} does not exist`);
        for (const x of list<string>(d, "anchors"))
            if (!ANNO_IDS.has(x))
                fail(d.file, `anchors: unknown annotation "${x}" (content/annotations/)`);
        const links = list<Link>(d, "links");
        checkLinkUrls(d, links);
        const { lead, sections } = splitSections(d.body);
        if (!lead) fail(d.file, "add a lead paragraph before the first ## heading");
        if (!sections.length) fail(d.file, "add at least one ## section");
        deepdives[d.id] = {
            id: d.id,
            title: str(d, "title"),
            concept,
            statements: list(d, "statements"),
            anchors: list(d, "anchors"),
            links,
            figure: d.meta.figure as Figure | undefined,
            placeholder: d.meta.placeholder === true,
            lead,
            sections
        };
    }

    return {
        content: {
            preamble,
            intro,
            boxes,
            statements,
            annotations,
            roles: byOrder(roles),
            topics: byOrder(topics),
            concepts: byOrder(concepts),
            deepdives
        },
        errors
    };
}
