import { describe, expect, it } from "vitest";
import generated from "./content.generated.json";
import { contentFileKey, parseContent, type ContentFiles } from "./parse";
import { plainText } from "./types";

const raw = import.meta.glob<string>("../content/**/*.md", {
    query: "?raw",
    import: "default",
    eager: true
});
/** The files keyed by their path relative to the package, e.g. `content/roles/student.md`. */
const contentFiles: ContentFiles = Object.fromEntries(
    Object.entries(raw).map(([path, text]) => [contentFileKey(path), text])
);
const { content, errors } = parseContent(contentFiles);

describe("content/", () => {
    it("has no problems", () => {
        expect(errors).toEqual([]);
    });

    it("matches the generated file the app loads (else run `pnpm build-content`)", () => {
        expect(JSON.parse(JSON.stringify(content))).toEqual(generated);
    });

    it("has the 12 statements of the Commitment in two boxes", () => {
        expect(content.statements.map((s) => s.n)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
        expect(content.boxes.map((b) => [b.id, b.from, b.to])).toEqual([
            ["boxA", 1, 9],
            ["boxB", 10, 12]
        ]);
        expect(content.preamble).toHaveLength(5);
    });

    it("keeps the Commitment text unchanged by annotations", () => {
        const src = contentFiles["content/commitment.md"] ?? "";
        const words = (s: string) => s.replace(/\s+/g, " ").trim();
        for (const s of content.statements)
            expect(words(src)).toContain(`${s.n}. ${plainText(s.text)}`);
    });

    it("places every annotation except the legend examples in the text", () => {
        const texts = [
            ...content.preamble,
            content.intro,
            ...content.boxes.map((b) => b.title),
            ...content.statements.map((s) => s.text)
        ].join("\n");
        for (const a of Object.values(content.annotations))
            if (a.target !== "legend") expect(texts).toContain(`(annotation:${a.id})`);
    });
});

/* ---------- rules, on a minimal content set ---------- */
const BASE: ContentFiles = {
    "content/commitment.md": [
        "# Preamble {#preamble}",
        "",
        "The **NFDI** and NFDI4Earth share data. See [the website](https://www.nfdi.de/) for news.",
        "",
        "# Introduction {#intro}",
        "",
        "Open data is good. Open data is useful.",
        "",
        "# We commit. {#boxA}",
        "",
        "1. Use open licences.",
        "2. Cite data."
    ].join("\n"),
    "content/roles/student.md":
        '---\nlabel: Student\nplural: Students\ncolour: "#F1C129"\nicon: cap\norder: 1\n---\n\nYou study.\n\n## Statement 1\n\nPick CC BY.\n\n- [ ] Read more\n',
    "content/topics/publishing.md":
        '---\nlabel: Publishing\ncolour: "#E76F51"\nicon: book\norder: 1\nknown_from: papers\n---\n\n## Licence it {statement=1}\n\nChoose a licence.\n',
    "content/concepts/licensing.md": '---\nlabel: Licensing\ncolour: "#2A9D8F"\norder: 1\n---\n',
    "content/statements/01.md":
        "---\nshort: Licences\nroles: [student]\ntopics: [publishing]\nconcepts: [licensing]\n---\n",
    "content/statements/02.md": "---\nshort: Citations\nroles: []\ntopics: []\nconcepts: []\n---\n",
    "content/deepdives/licensing.md":
        "---\ntitle: Licensing\nconcept: licensing\nstatements: [1]\nanchors: []\n---\n\nLead.\n\n## Part\n\nText.\n"
};
const annotation = (fields: string, body = "Text.") =>
    `---\n${fields}\ndepth: note\ntitle: A note\n---\n\n${body}\n`;
const parseWith = (extra: ContentFiles) => parseContent({ ...BASE, ...extra });

describe("parseContent", () => {
    it("accepts the minimal content set", () => {
        const { errors, content } = parseContent(BASE);
        expect(errors).toEqual([]);
        expect(content.roles[0]?.notes[1]).toEqual({ note: "Pick CC BY.", step: "Read more" });
        expect(content.topics[0]?.steps).toEqual([
            { n: 1, title: "Licence it", text: "Choose a licence." }
        ]);
        expect(content.statements[0]?.box).toBe("boxA");
    });

    it("wraps a quote as an annotation link", () => {
        const { errors, content } = parseWith({
            "content/annotations/lic.md": annotation("target: c1\nquote: open licences")
        });
        expect(errors).toEqual([]);
        expect(content.statements[0]?.text).toBe("Use [open licences](annotation:lic).");
    });

    it("matches whole words only", () => {
        const { errors, content } = parseWith({
            "content/annotations/nfdi.md": annotation("target: pre-1\nquote: NFDI")
        });
        expect(errors).toEqual([]);
        expect(content.preamble[0]).toContain("**[NFDI](annotation:nfdi)** and NFDI4Earth");
    });

    it("asks for more words or an occurrence when a quote is ambiguous", () => {
        const { errors } = parseWith({
            "content/annotations/od.md": annotation("target: intro\nquote: Open data")
        });
        expect(errors).toEqual([
            'content/annotations/od.md: quote "Open data" occurs 2 times in intro; quote a few more words or add "occurrence: <n>"'
        ]);
        const second = parseWith({
            "content/annotations/od.md": annotation(
                "target: intro\nquote: Open data\noccurrence: 2"
            )
        });
        expect(second.errors).toEqual([]);
        expect(second.content.intro).toBe(
            "Open data is good. [Open data](annotation:od) is useful."
        );
    });

    it("rejects quotes inside links and overlapping quotes", () => {
        const { errors } = parseWith({
            "content/annotations/c.md": annotation("target: c1\nquote: Use open"),
            "content/annotations/d.md": annotation("target: c1\nquote: open licences")
        });
        expect(errors).toEqual([
            "content/annotations/d.md: quote overlaps the quote of content/annotations/c.md"
        ]);
        const link = parseWith({
            "content/annotations/a.md": annotation("target: pre-1\nquote: the website")
        });
        expect(link.errors).toEqual([
            'content/annotations/a.md: quote "the website" overlaps a link; annotate text outside links'
        ]);
    });

    it("rejects quotes across the edge of bold or italic text", () => {
        const cross = (quote: string, intro = "Open data is good. Open data is useful.") =>
            parseWith({
                "content/commitment.md": (BASE["content/commitment.md"] ?? "").replace(
                    "Open data is good. Open data is useful.",
                    intro
                ),
                "content/annotations/x.md": annotation(
                    `target: ${quote.includes("NFDI") ? "pre-1" : "intro"}\nquote: "${quote}"`
                )
            }).errors;
        const error = (q: string) =>
            `content/annotations/x.md: quote "${q}" crosses the edge of **bold** or *italic* text; quote only plain text, or only text inside one bold or italic part`;
        // part of the bold text plus plain text, and all of it plus plain text
        expect(cross("NFDI** and")).toEqual([error("NFDI** and")]);
        expect(cross("The **NFDI**")).toEqual([error("The **NFDI**")]);
        // italic, both spellings
        expect(cross("is *good*", "Open data is *good*. More is useful.")).toEqual([
            error("is *good*")
        ]);
        expect(cross("is _good_", "Open data is _good_. More is useful.")).toEqual([
            error("is _good_")
        ]);
        // `__bold__` too, and italic inside bold
        expect(cross("is __good__", "Open data is __good__. More is useful.")).toEqual([
            error("is __good__")
        ]);
        expect(cross("very *good", "Open data is **very *good* now**. More.")).toEqual([
            error("very *good")
        ]);
        // inside one bold or italic part is fine, also inside nested emphasis
        expect(cross("NFDI")).toEqual([]);
        expect(cross("good", "Open data is *good*. More is useful.")).toEqual([]);
        expect(cross("very", "Open data is **very *good* now**. More.")).toEqual([]);
        // single asterisks with spaces around are not emphasis
        expect(cross("is 5 * 3", "Open data is 5 * 3 * 2. More is useful.")).toEqual([]);
    });

    it("reports quotes that are not in the text", () => {
        const { errors } = parseWith({
            "content/annotations/x.md": annotation("target: c2\nquote: cite data")
        });
        expect(errors[0]).toMatch(/quote "cite data" not found in c2/);
    });

    it("reports unknown fields, unknown references and raw HTML", () => {
        const { errors } = parseWith({
            "content/annotations/x.md": annotation(
                "target: c1\nquote: Use\ncolor: red\nroles: [teacher]",
                "Some <b>bold</b> text."
            )
        });
        expect(errors).toEqual([
            'content/annotations/x.md: unknown field "color" (allowed: target, quote, occurrence, depth, title, roles, topics, concepts, links, figure, deepdive, statements)',
            'content/annotations/x.md: roles: unknown perspective (content/roles/) "teacher"',
            "content/annotations/x.md: raw HTML is not allowed; use Markdown (see docs/content-authoring.md)"
        ]);
    });
});
