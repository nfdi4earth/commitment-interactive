import { describe, expect, it } from "vitest";
import { parseHeader } from "./header";

describe("parseHeader", () => {
    it("reads fields, lists and lists of maps", () => {
        expect(
            parseHeader(
                'title: A note\norder: 2\nplaceholder: true\nroles: [a, "b, c"]\nlinks:\n  - label: "X: Y"\n    url: https://x.org\nstatements:\n- 1\n- 2'
            )
        ).toEqual({
            title: "A note",
            order: 2,
            placeholder: true,
            roles: ["a", "b, c"],
            links: [{ label: "X: Y", url: "https://x.org" }],
            statements: [1, 2]
        });
    });

    it("keeps values as text where YAML would change them", () => {
        expect(parseHeader("a: 1.5\nb: True\nc: 0x1F\nd: Note:")).toEqual({
            a: "1.5",
            b: "True",
            c: "0x1F",
            d: "Note:"
        });
    });

    it("reads list items with more spaces after the -", () => {
        expect(parseHeader("links:\n  -   label: a\n      url: b")).toEqual({
            links: [{ label: "a", url: "b" }]
        });
    });

    it("reads a field after a list that starts at the same indentation", () => {
        expect(parseHeader("links:\n- label: a\n  url: b\ntitle: x")).toEqual({
            links: [{ label: "a", url: "b" }],
            title: "x"
        });
    });

    it("names the line of a problem, counted in the whole file", () => {
        expect(() => parseHeader("title: Step\t#3")).toThrow("line 2: use spaces, not tabs");
        expect(() => parseHeader('title: "\\q"')).toThrow(
            'line 2: "\\q" – write a backslash as \\\\'
        );
        expect(() => parseHeader("title: x\n   order: 1")).toThrow(
            "line 3: unexpected indentation"
        );
        expect(() => parseHeader("title: x\ntitle: y")).toThrow('line 3: "title" appears twice');
        expect(() => parseHeader("title:")).toThrow('line 2: "title" has no value');
        expect(() => parseHeader("just text")).toThrow('line 2: expected "field: value"');
        expect(() => parseHeader("title: Use: this")).toThrow(/contains ": " or " #"/);
        expect(() => parseHeader("title: &Use")).toThrow(/starts with a special character/);
        expect(() => parseHeader("\ttitle: x")).toThrow("line 2: use spaces, not tabs");
        expect(() => parseHeader('title: "x" #3')).toThrow(
            /must end with " and have nothing after it/
        );
        expect(() => parseHeader("  title: x")).toThrow("line 2: unexpected indentation");
        expect(() => parseHeader("roles: [student]]")).toThrow(/contains \[ or \]/);
        expect(Object.keys(parseHeader("constructor: x\n__proto__: y"))).toEqual([
            "constructor",
            "__proto__"
        ]);
        expect(() => parseHeader("title: 'Open\tdata'")).toThrow("line 2: use spaces, not tabs");
        expect(() => parseHeader("links:\n  - \n    label: a")).toThrow(
            "line 3: start the list item on the same line as the -"
        );
        expect(() => parseHeader("order: 99999999999999999999")).toThrow(/too large/);
        expect(() => parseHeader("statements:\n  - 1\n  -2")).toThrow(
            "line 4: put a space after the -"
        );
        expect(() => parseHeader('roles: ["a"x, b]')).toThrow(
            'line 2: ["a"x, b] – separate the list items with commas'
        );
    });
});
