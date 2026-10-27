// Builds src/packages/commitment/model/content.generated.json from content/ for the React app, so
// that the browser gets the parsed content and no YAML parser or content checks.
// It runs the app's own parser (model/parse.ts) through Vite, so the rules are the same as in the
// tests.
//
//   node tools/build-app-content.mjs           write the file (`pnpm dev` also does it on every change)
//   node tools/build-app-content.mjs --check   fail if content/ has problems or the file is out of date
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { runnerImport } from "vite";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PACKAGE = join(ROOT, "src", "packages", "commitment");
export const CONTENT = join(PACKAGE, "content");
export const PARSER = join(PACKAGE, "model", "parse.ts");
const OUT = join(PACKAGE, "model", "content.generated.json");
const OUT_NAME = relative(ROOT, OUT);

/**
 * Parses content/ with model/parse.ts (the module, as loaded by Vite); returns the JSON text, or
 * throws an error that lists the problems.
 */
export function generate({ parseContent, contentFileKey }) {
    const files = Object.fromEntries(
        readdirSync(CONTENT, { recursive: true })
            .filter((f) => f.endsWith(".md"))
            .map((f) => [
                contentFileKey(join("content", f)),
                readFileSync(join(CONTENT, f), "utf8")
            ])
    );
    const { content, errors } = parseContent(files);
    if (errors.length)
        throw new Error(
            `Content check failed with ${errors.length} problem(s):\n${errors.map((e) => "  - " + e).join("\n")}`
        );
    return JSON.stringify(content, null, 1) + "\n";
}

const upToDate = (json) => existsSync(OUT) && readFileSync(OUT, "utf8") === json;

/** Writes the file if it changed; returns whether it did. */
export function write(json) {
    if (upToDate(json)) return false;
    writeFileSync(OUT, json);
    return true;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    try {
        const { module } = await runnerImport(pathToFileURL(PARSER).href, {
            configFile: false,
            logLevel: "silent"
        });
        const json = generate(module);
        if (!process.argv.includes("--check"))
            console.log(write(json) ? `Wrote ${OUT_NAME}.` : `${OUT_NAME} is up to date.`);
        else if (upToDate(json)) console.log(`Content OK; ${OUT_NAME} is up to date.`);
        else
            throw new Error(
                `${OUT_NAME} is out of date: run \`pnpm build-content\` and commit it.`
            );
    } catch (e) {
        console.error(e.message);
        process.exit(1);
    }
}
