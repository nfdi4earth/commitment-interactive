import { describe, expect, it } from "vitest";
import { content, contentErrors, contentFiles } from "./content";
import { parseContent, plainText, type ContentFiles } from "./parse";

describe("content/", () => {
    it("has no problems", () => {
        expect(contentErrors).toEqual([]);
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
