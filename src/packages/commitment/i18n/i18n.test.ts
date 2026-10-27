import yaml from "js-yaml";
import { describe, expect, it } from "vitest";
import de from "./de.yaml?raw";
import en from "./en.yaml?raw";

const keys = (node: unknown, prefix = ""): string[] =>
    node && typeof node === "object"
        ? Object.entries(node).flatMap(([k, v]) => keys(v, prefix ? `${prefix}.${k}` : k))
        : [prefix];
const messages = (src: string) => (yaml.load(src) as { messages: unknown }).messages;

describe("i18n", () => {
    it("has the same messages in English and German", () => {
        expect(keys(messages(de)).sort()).toEqual(keys(messages(en)).sort());
    });
});
