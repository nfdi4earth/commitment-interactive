// Loads all Markdown files in content/ (in this package) at build time.
import { parseContent, type ContentFiles } from "./parse";

const raw = import.meta.glob<string>("../content/**/*.md", {
    query: "?raw",
    import: "default",
    eager: true
});

/** The files keyed by their path relative to the package, e.g. `content/roles/student.md`. */
export const contentFiles: ContentFiles = Object.fromEntries(
    Object.entries(raw).map(([path, text]) => [path.replace(/^(\.\.\/)+/, ""), text])
);

const result = parseContent(contentFiles);

/** Problems found in content/; the tests require none. */
export const contentErrors = result.errors;
if (contentErrors.length)
    console.error(`Content check failed:\n${contentErrors.map((e) => "  - " + e).join("\n")}`);

export const content = result.content;
