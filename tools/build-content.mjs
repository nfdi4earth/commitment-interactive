#!/usr/bin/env node
/* Builds mockup/data.js from the Markdown files in src/packages/commitment/content/ and checks
 * content integrity. Messages name files relative to the package, e.g. content/roles/student.md.
 * No dependencies (Node >= 18). See docs/content-authoring.md.
 *
 *   node tools/build-content.mjs           validate and write mockup/data.js
 *   node tools/build-content.mjs --check   validate and fail if mockup/data.js is out of date
 *
 * Front matter is parsed with a small, strict YAML subset (see parseYaml). The React app will
 * read the same files with js-yaml (already an OS4A dependency), so everything accepted here
 * must also be valid YAML with the same meaning.
 */
import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
// content lives in the commitment package, so that it moves with the package into OneStop4All
const PACKAGE = join(ROOT, "src", "packages", "commitment");
const CONTENT = join(PACKAGE, "content");
const OUT = join(ROOT, "mockup", "data.js");
const errors = [];
const fail = (file, msg) => errors.push(`${file}: ${msg}`);
const rel = (p) => p.slice(PACKAGE.length + 1);

/* ---------- strict YAML subset ---------- */
// Supports: `key: value` maps (nested by indentation), `- item` lists of scalars or of maps,
// flow lists `[a, b]`, quoted strings ("…" with \" escapes, '…' with '' escapes), integers,
// true/false. Anything else (anchors, block scalars, flow maps, …) is an error.
function parseScalar(raw, where) {
    const s = raw.trim();
    if (s.startsWith('"')) {
        if (!/^"(?:[^"\\]|\\.)*"$/.test(s)) throw new Error(`${where}: unterminated "…" string`);
        return JSON.parse(s);
    }
    if (s.startsWith("'")) {
        if (!/^'(?:[^']|'')*'$/.test(s)) throw new Error(`${where}: unterminated '…' string`);
        return s.slice(1, -1).replace(/''/g, "'");
    }
    if (/^-?\d+$/.test(s)) return Number(s);
    if (s === "true" || s === "false") return s === "true";
    if (/^[[\]{},&*!|>%@`#]/.test(s) || /^[-?:](\s|$)/.test(s))
        throw new Error(`${where}: value "${s}" starts with a special character – put it in "quotes"`);
    if (/:\s/.test(s) || / #/.test(s)) throw new Error(`${where}: value "${s}" contains ": " or " #" – put it in "quotes"`);
    if (s === "" || s === "~" || s === "null") throw new Error(`${where}: empty value`);
    return s;
}
function parseFlowList(s, where) {
    const inner = s.trim().slice(1, -1).trim();
    if (!s.trim().endsWith("]")) throw new Error(`${where}: list must end with ]`);
    return inner ? inner.split(",").map((x) => parseScalar(x, where)) : [];
}
function parseValue(s, where) {
    return s.trim().startsWith("[") ? parseFlowList(s, where) : parseScalar(s, where);
}
function parseYaml(text, file) {
    const lines = text.split("\n").map((l, i) => ({ l: l.replace(/\s+$/, ""), no: i + 2 }))
        .filter(({ l }) => l.trim() && !/^\s*#/.test(l));
    for (const { l, no } of lines) if (/^\s*\t/.test(l)) throw new Error(`${file}:${no}: use spaces, not tabs`);
    let i = 0;
    const indentOf = (l) => l.match(/^ */)[0].length;
    function block(indent) {
        const isList = lines[i].l.trimStart().startsWith("- ");
        const out = isList ? [] : {};
        while (i < lines.length) {
            const { l, no } = lines[i];
            const ind = indentOf(l);
            if (ind < indent) break;
            if (ind > indent) throw new Error(`${file}:${no}: unexpected indentation`);
            const where = `${file}:${no}`;
            const body = l.trim();
            if (isList) {
                if (!body.startsWith("- ")) throw new Error(`${where}: expected a "- " list item`);
                const item = body.slice(2);
                if (/^[\w-]+:(\s|$)/.test(item)) {
                    // list item that is a map: first key on the dash line, further keys indented by 2
                    lines[i] = { l: " ".repeat(indent + 2) + item, no };
                    out.push(block(indent + 2));
                } else {
                    out.push(parseValue(item, where));
                    i++;
                }
            } else {
                const m = body.match(/^([\w-]+):(?:\s+(.*))?$/);
                if (!m) throw new Error(`${where}: expected "key: value"`);
                const [, key, val] = m;
                if (key in out) throw new Error(`${where}: duplicate key "${key}"`);
                i++;
                if (val !== undefined && val !== "") out[key] = parseValue(val, where);
                else if (i < lines.length && indentOf(lines[i].l) > indent) out[key] = block(indentOf(lines[i].l));
                else if (i < lines.length && indentOf(lines[i].l) === indent && lines[i].l.trim().startsWith("- ")) out[key] = block(indent);
                else throw new Error(`${where}: "${key}" has no value`);
            }
        }
        return out;
    }
    return lines.length ? block(indentOf(lines[0].l)) : {};
}

/* ---------- files ---------- */
const stripComments = (s) => s.replace(/<!--[\s\S]*?-->/g, "");
function readItem(path) {
    const raw = readFileSync(path, "utf8").replace(/\r\n/g, "\n");
    const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
    if (!m) {
        fail(rel(path), "missing front matter (the file must start with a --- line)");
        return null;
    }
    try {
        return { meta: parseYaml(m[1], rel(path)), body: stripComments(m[2]).trim() };
    } catch (e) {
        errors.push(e.message);
        return null;
    }
}
function readFolder(name, idPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/) {
    const dir = join(CONTENT, name);
    if (!existsSync(dir)) return [];
    return readdirSync(dir).filter((f) => f.endsWith(".md")).sort().flatMap((f) => {
        const id = basename(f, ".md");
        const file = `content/${name}/${f}`;
        if (!idPattern.test(id)) {
            fail(file, `file name "${id}" must be lower case letters, digits and hyphens`);
            return [];
        }
        const item = readItem(join(dir, f));
        return item ? [{ id, file, ...item }] : [];
    });
}

/* ---------- schema checks ---------- */
const HEX = /^#[0-9A-Fa-f]{6}$/;
const appSrc = readFileSync(join(ROOT, "mockup", "app.js"), "utf8");
const ICONS = new Set([...appSrc.slice(appSrc.indexOf("ICON_PATHS"), appSrc.indexOf("};", appSrc.indexOf("ICON_PATHS"))).matchAll(/^\s+(\w+):/gm)].map((m) => m[1]));
const FIGURES = new Set([...appSrc.matchAll(/kind === "(\w+)"/g)].map((m) => m[1]));
const DEPTHS = ["note", "explainer", "deepdive"];

const t = {
    string: (v) => typeof v === "string" || "must be text",
    int: (v) => Number.isInteger(v) || "must be a whole number",
    bool: (v) => typeof v === "boolean" || "must be true or false",
    colour: (v) => (typeof v === "string" && HEX.test(v)) || 'must be a colour like "#05668D" (in quotes)',
    icon: (v) => ICONS.has(v) || `must be one of: ${[...ICONS].join(", ")}`,
    ids: (v) => (Array.isArray(v) && v.every((x) => typeof x === "string")) || "must be a list like [a, b]",
    ints: (v) => (Array.isArray(v) && v.every(Number.isInteger)) || "must be a list of numbers like [1, 2]",
    links: (v) => (Array.isArray(v) && v.every((x) => x && typeof x === "object" && typeof x.label === "string" && typeof x.url === "string" && Object.keys(x).length === 2))
        || 'must be a list of items with "label:" and "url:"',
    depth: (v) => DEPTHS.includes(v) || `must be one of: ${DEPTHS.join(", ")}`,
    figure: (v) => FIGURES.has(v) || `must be one of: ${[...FIGURES].join(", ")}`
};
function checkMeta(item, schema) {
    for (const [key, spec] of Object.entries(schema)) {
        const [type, required] = spec.split("!");
        if (!(key in item.meta)) {
            if (required !== undefined) fail(item.file, `"${key}" is required`);
            continue;
        }
        const ok = t[type](item.meta[key]);
        if (ok !== true) fail(item.file, `"${key}" ${ok}`);
    }
    for (const key of Object.keys(item.meta)) if (!(key in schema)) fail(item.file, `unknown field "${key}" (allowed: ${Object.keys(schema).join(", ")})`);
}
function checkMarkdown(file, text) {
    if (/<\/?[a-zA-Z]/.test(text)) fail(file, "raw HTML is not allowed; use Markdown (see docs/content-authoring.md)");
    for (const m of text.matchAll(/\]\(([^)]*)\)/g))
        if (!/^(https?:\/\/|mailto:|#\/)/.test(m[1])) fail(file, `link target "${m[1]}" must start with https://, http://, mailto: or #/`);
}
const oneLine = (s) => s.replace(/\s+/g, " ").trim();
// splits a body at "## " headings: { lead, sections: [{ heading, text }] }
function sections(body) {
    const parts = ("\n" + body).split(/\n## /);
    return { lead: parts[0].trim(), sections: parts.slice(1).map((p) => {
        const nl = p.indexOf("\n");
        return { heading: (nl < 0 ? p : p.slice(0, nl)).trim(), text: nl < 0 ? "" : p.slice(nl + 1).trim() };
    }) };
}

/* ---------- commitment text ---------- */
const textFile = "content/commitment.md";
const text = { preamble: [], intro: "", boxes: [], statements: [] };
{
    const src = stripComments(readFileSync(join(CONTENT, "commitment.md"), "utf8").replace(/\r\n/g, "\n"));
    checkMarkdown(textFile, src);
    const parts = src.split(/^# /m).slice(1);
    for (const part of parts) {
        const nl = part.indexOf("\n");
        const head = part.slice(0, nl).match(/^(.*?)\s*\{#([\w-]+)\}$/);
        if (!head) {
            fail(textFile, `heading "# ${part.slice(0, nl)}" needs an id, e.g. {#boxA}`);
            continue;
        }
        const [, title, id] = head;
        const paras = part.slice(nl + 1).trim().split(/\n\s*\n/).map(oneLine).filter(Boolean);
        if (id === "preamble") text.preamble = paras;
        else if (id === "intro") text.intro = paras.join(" ");
        else if (/^box[A-Z]$/.test(id)) {
            const items = part.slice(nl + 1).trim().split(/\n(?=\d+\. )/).map((it) => it.match(/^(\d+)\. ([\s\S]+)$/));
            if (items.some((x) => !x)) fail(textFile, `section ${id} may only contain a numbered list of statements`);
            const nums = items.filter(Boolean).map(([, n, s]) => {
                text.statements.push({ n: Number(n), text: oneLine(s) });
                return Number(n);
            });
            text.boxes.push({ id, title: oneLine(title), from: Math.min(...nums), to: Math.max(...nums) });
        } else fail(textFile, `unknown section id "${id}" (allowed: preamble, intro, boxA, boxB, …)`);
    }
    text.statements.forEach((s, i) => s.n !== i + 1 && fail(textFile, `statement ${s.n} should be number ${i + 1}`));
}

/* ---------- content items ---------- */
const roles = readFolder("roles");
const topics = readFolder("topics");
const concepts = readFolder("concepts");
const statementMeta = readFolder("statements", /^\d\d$/);
const annotations = readFolder("annotations");
const deepdives = readFolder("deepdives");

const ROLE_IDS = new Set(roles.map((r) => r.id));
const TOPIC_IDS = new Set(topics.map((x) => x.id));
const CONCEPT_IDS = new Set(concepts.map((x) => x.id));
const STMT_NS = new Set(text.statements.map((s) => s.n));
const ANNO_IDS = new Set(annotations.map((a) => a.id));
const DD_IDS = new Set(deepdives.map((d) => d.id));
function checkRefs(item, key, known, kind) {
    for (const v of item.meta[key] || []) if (!known.has(v)) fail(item.file, `${key}: unknown ${kind} "${v}"`);
}
const facetRefs = (item) => {
    checkRefs(item, "roles", ROLE_IDS, "perspective (content/roles/)");
    checkRefs(item, "topics", TOPIC_IDS, "topic (content/topics/)");
    checkRefs(item, "concepts", CONCEPT_IDS, "concept (content/concepts/)");
};
const byOrder = (list) => [...list].sort((a, b) => (a.meta.order ?? 0) - (b.meta.order ?? 0));
const checkOrder = (list, folder) => {
    const seen = new Map();
    list.forEach((x) => seen.has(x.meta.order) ? fail(x.file, `order ${x.meta.order} is also used by ${seen.get(x.meta.order)}`) : seen.set(x.meta.order, x.file));
    if (!list.length) fail(`content/${folder}/`, "no files found");
};

const perspectiveNotes = {};
for (const r of roles) {
    checkMeta(r, { label: "string!", plural: "string!", colour: "colour!", icon: "icon!", order: "int!" });
    checkMarkdown(r.file, r.body);
    const { lead, sections: secs } = sections(r.body);
    if (!lead) fail(r.file, "add a one-paragraph description before the first ## heading");
    r.blurb = oneLine(lead);
    perspectiveNotes[r.id] = {};
    for (const sec of secs) {
        const m = sec.heading.match(/^Statement (\d+)$/);
        if (!m) {
            fail(r.file, `heading "## ${sec.heading}" must be "## Statement <number>"`);
            continue;
        }
        const n = Number(m[1]);
        if (!STMT_NS.has(n)) fail(r.file, `## Statement ${n} does not exist`);
        if (perspectiveNotes[r.id][n]) fail(r.file, `## Statement ${n} appears twice`);
        const am = sec.text.match(/^([\s\S]*?)\n*- \[ \] (.+)$/);
        if (!am || !am[1].trim()) {
            fail(r.file, `## Statement ${n} needs a note and, as its last line, one first step as "- [ ] …"`);
            continue;
        }
        perspectiveNotes[r.id][n] = [am[1].trim(), am[2].trim()];
    }
}
checkOrder(roles, "roles");

const topicSteps = {};
for (const x of topics) {
    checkMeta(x, { label: "string!", colour: "colour!", icon: "icon!", order: "int!", known_from: "string!" });
    checkMarkdown(x.file, x.body);
    const { lead, sections: secs } = sections(x.body);
    if (lead) fail(x.file, "text before the first ## heading is not used; put it into a step");
    if (secs.length) topicSteps[x.id] = secs.map((sec) => {
        const m = sec.heading.match(/^(.+?)\s*\{statement=(\d+)\}$/);
        if (!m) {
            fail(x.file, `step "## ${sec.heading}" must end with {statement=<number>}`);
            return null;
        }
        if (!STMT_NS.has(Number(m[2]))) fail(x.file, `step "${m[1]}": statement ${m[2]} does not exist`);
        if (!sec.text) fail(x.file, `step "${m[1]}" has no text`);
        return { n: Number(m[2]), title: m[1], text: sec.text };
    }).filter(Boolean);
}
checkOrder(topics, "topics");

for (const x of concepts) {
    checkMeta(x, { label: "string!", colour: "colour!", order: "int!" });
    if (x.body) fail(x.file, "concept files have no text; write a deep dive in content/deepdives/ instead");
}
checkOrder(concepts, "concepts");

const statements = text.statements.map((s) => ({ ...s }));
for (const x of statementMeta) {
    checkMeta(x, { short: "string!", roles: "ids!", topics: "ids!", concepts: "ids!" });
    facetRefs(x);
    if (x.body) fail(x.file, "statement files have no text; the text is in content/commitment.md");
    const s = statements.find((st) => st.n === Number(x.id));
    if (!s) fail(x.file, `statement ${Number(x.id)} is not in content/commitment.md`);
    else Object.assign(s, { short: x.meta.short, roles: x.meta.roles, topics: x.meta.topics, concepts: x.meta.concepts });
}
statements.forEach((s) => !s.short && fail(`content/statements/${String(s.n).padStart(2, "0")}.md`, "missing"));

/* ---------- annotations: quotes → [[id|quote]] markers ---------- */
const TARGETS = { legend: null, intro: "intro" };
text.preamble.forEach((_, i) => (TARGETS[`pre-${i + 1}`] = ["preamble", i]));
text.boxes.forEach((b) => (TARGETS[b.id] = b));
statements.forEach((s) => (TARGETS[`c${s.n}`] = s));
const getText = (target) => {
    const ref = TARGETS[target];
    if (ref === "intro") return [() => text.intro, (v) => (text.intro = v)];
    if (Array.isArray(ref)) return [() => text.preamble[ref[1]], (v) => (text.preamble[ref[1]] = v)];
    if (ref.title !== undefined) return [() => ref.title, (v) => (ref.title = v)];
    return [() => ref.text, (v) => (ref.text = v)];
};
const marks = {};
const annoOut = {};
for (const a of annotations) {
    checkMeta(a, {
        target: "string!", quote: "string", occurrence: "int", depth: "depth!", title: "string!", roles: "ids", topics: "ids", concepts: "ids",
        links: "links", figure: "figure", deepdive: "string", statements: "ints"
    });
    facetRefs(a);
    checkMarkdown(a.file, a.body);
    if (!a.body) fail(a.file, "the text below the front matter is empty");
    const m = a.meta;
    if (m.deepdive && !DD_IDS.has(m.deepdive)) fail(a.file, `deepdive: unknown deep dive "${m.deepdive}" (content/deepdives/)`);
    for (const n of m.statements || []) if (!STMT_NS.has(n)) fail(a.file, `statements: statement ${n} does not exist`);
    for (const l of m.links || []) if (!/^(https?:\/\/|mailto:)/.test(l.url)) fail(a.file, `link "${l.label}": url must start with https://, http:// or mailto:`);
    if (!(m.target in TARGETS)) fail(a.file, `target "${m.target}" does not exist (use pre-1…pre-${text.preamble.length}, intro, ${text.boxes.map((b) => b.id).join(", ")}, c1…c${statements.length} or legend)`);
    else if (m.target === "legend") {
        if (m.quote) fail(a.file, "legend annotations have no quote");
    } else if (!m.quote) fail(a.file, '"quote" is required');
    else (marks[m.target] ||= []).push(a);
    annoOut[a.id] = Object.fromEntries(Object.entries({
        depth: m.depth, title: m.title, body: a.body, roles: m.roles, topics: m.topics, concepts: m.concepts,
        links: m.links && m.links.map((l) => [l.label, l.url]), figure: m.figure, deepdive: m.deepdive, statements: m.statements
    }).filter(([, v]) => v !== undefined));
}
for (const [target, list] of Object.entries(marks)) {
    const [get, set] = getText(target);
    const src = get();
    const linkRanges = [...src.matchAll(/\[[^\]]*\]\([^)]*\)/g)].map((m) => [m.index, m.index + m[0].length]);
    // a quote is plain text or inside one bold or italic part, never across its edge
    // bold and italic parts with their delimiter length; as in CommonMark, a delimiter opens before
    // and closes after a non-space, `_` only outside words; emphasis inside bold is a second range
    const styleRanges = [
        [/\*\*(?![\s*])[^\n]*?[^\s*]\*\*/gu, 2],
        [/(?<!\*)\*(?![\s*])[^*\n]*?[^\s*]\*(?!\*)/gu, 1],
        [/(?<![\p{L}\p{N}_])__(?![\s_])[^\n]*?[^\s_]__(?![\p{L}\p{N}_])/gu, 2],
        [/(?<![\p{L}\p{N}_])_(?![\s_])[^_\n]*?[^\s_]_(?![\p{L}\p{N}_])/gu, 1]
    ].flatMap(([re, mark]) => [...src.matchAll(re)].map((m) => [m.index, m.index + m[0].length, mark]));
    const overlaps = (at, end, s, e) => at < e && end > s;
    const crossesStyle = (at, end) => styleRanges.some(([s, e, mark]) => overlaps(at, end, s, e) && !(at >= s + mark && end <= e - mark));
    const spans = [];
    for (const a of list) {
        // whole words only: "NFDI" does not match inside "NFDI4Earth"
        const q = oneLine(a.meta.quote);
        const re = new RegExp(`(?<![\\p{L}\\p{N}])${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![\\p{L}\\p{N}])`, "gu");
        const hits = [...src.matchAll(re)].map((m) => m.index);
        const occ = a.meta.occurrence;
        const at = occ ? hits[occ - 1] : hits[0];
        if (!hits.length) fail(a.file, `quote "${q}" not found in ${target}. It must match whole words of the text in content/commitment.md exactly, including punctuation`);
        else if (occ && at === undefined) fail(a.file, `occurrence ${occ}: quote "${q}" occurs only ${hits.length} time(s) in ${target}`);
        else if (!occ && hits.length > 1) fail(a.file, `quote "${q}" occurs ${hits.length} times in ${target}; quote a few more words or add "occurrence: <n>"`);
        else if (/[[\]]/.test(q) || linkRanges.some(([s, e]) => overlaps(at, at + q.length, s, e))) fail(a.file, `quote "${q}" overlaps a link; annotate text outside links`);
        else if (crossesStyle(at, at + q.length)) fail(a.file, `quote "${q}" crosses the edge of **bold** or *italic* text; quote only plain text, or only text inside one bold or italic part`);
        else spans.push({ at, end: at + q.length, a });
    }
    spans.sort((x, y) => x.at - y.at);
    spans.forEach((s, i) => i && s.at < spans[i - 1].end && fail(s.a.file, `quote overlaps the quote of ${spans[i - 1].a.file}`));
    let out = src;
    for (const s of [...spans].reverse()) out = out.slice(0, s.at) + `[[${s.a.id}|${out.slice(s.at, s.end)}]]` + out.slice(s.end);
    set(out);
}

/* ---------- deep dives ---------- */
const ddOut = {};
for (const d of deepdives) {
    checkMeta(d, { title: "string!", concept: "string!", statements: "ints!", anchors: "ids!", links: "links", figure: "figure", placeholder: "bool" });
    checkMarkdown(d.file, d.body);
    if (!CONCEPT_IDS.has(d.meta.concept)) fail(d.file, `concept: unknown concept "${d.meta.concept}"`);
    for (const n of d.meta.statements || []) if (!STMT_NS.has(n)) fail(d.file, `statements: statement ${n} does not exist`);
    for (const x of d.meta.anchors || []) if (!ANNO_IDS.has(x)) fail(d.file, `anchors: unknown annotation "${x}" (content/annotations/)`);
    for (const l of d.meta.links || []) if (!/^(https?:\/\/|mailto:)/.test(l.url)) fail(d.file, `link "${l.label}": url must start with https://, http:// or mailto:`);
    const { lead, sections: secs } = sections(d.body);
    if (!lead) fail(d.file, "add a lead paragraph before the first ## heading");
    if (!secs.length) fail(d.file, "add at least one ## section");
    ddOut[d.id] = Object.fromEntries(Object.entries({
        title: d.meta.title, concept: d.meta.concept, anchors: d.meta.anchors, statements: d.meta.statements, placeholder: d.meta.placeholder,
        lead, sections: secs.map((s) => [s.heading, s.text]), links: (d.meta.links || []).map((l) => [l.label, l.url]), figure: d.meta.figure
    }).filter(([, v]) => v !== undefined));
}

/* ---------- output ---------- */
if (errors.length) {
    console.error(`Content check failed with ${errors.length} problem(s):\n` + errors.map((e) => "  - " + e).join("\n"));
    process.exit(1);
}
const DATA = {
    roles: byOrder(roles).map((r) => ({ id: r.id, label: r.meta.label, plural: r.meta.plural, colour: r.meta.colour, icon: r.meta.icon, blurb: r.blurb })),
    topics: byOrder(topics).map((x) => ({ id: x.id, label: x.meta.label, colour: x.meta.colour, icon: x.meta.icon, knownFrom: x.meta.known_from })),
    concepts: byOrder(concepts).map((x) => ({ id: x.id, label: x.meta.label, colour: x.meta.colour })),
    preamble: text.preamble,
    intro: text.intro,
    boxes: text.boxes,
    statements,
    annotations: annoOut,
    perspectiveNotes,
    topicSteps,
    deepdives: ddOut
};
const js = `/* GENERATED by tools/build-content.mjs from src/packages/commitment/content/ – do not edit; see docs/content-authoring.md.
 * Commitment text: NFDI4Earth Consortium (2024), doi:10.5281/zenodo.10123880, CC-BY 4.0.
 * All annotations, perspective notes, topic steps and deep dives are FAKE example content.
 */
window.DATA = ${JSON.stringify(DATA, null, 2)};
`;
const counts = `${statements.length} statements, ${annotations.length} annotations, ${roles.length} perspectives, ${topics.length} topics, ${concepts.length} concepts, ${deepdives.length} deep dives`;
if (process.argv.includes("--check")) {
    if (!existsSync(OUT) || readFileSync(OUT, "utf8") !== js) {
        console.error("Content is valid, but mockup/data.js is out of date. Run: node tools/build-content.mjs");
        process.exit(1);
    }
    console.log(`Content OK (${counts}); mockup/data.js is up to date.`);
} else {
    writeFileSync(OUT, js);
    console.log(`Content OK (${counts}); wrote mockup/data.js.`);
}
