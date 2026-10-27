// While this repository's dev server runs, keeps src/packages/commitment/model/content.generated.json
// in step with content/ (see tools/build-app-content.mjs), so edits show up at once.
// Builds and tests use the committed file, so that a stale one fails the tests instead of being
// fixed silently; OneStop4All builds from it as well and doesn't need this plugin.
import { dirname } from "node:path";
import { CONTENT, PARSER, generate, write } from "./build-app-content.mjs";

// the parser and the modules it imports
const MODEL = dirname(PARSER);

export function commitmentContent() {
    return {
        name: "commitment-content",
        // only the dev server; Vitest also starts one, but must see the committed file
        apply: (_config, env) => env.command === "serve" && !process.env.VITEST,
        configureServer(server) {
            const { logger } = server.config;
            // an editor's save can fire several events: run once at a time, then once more
            let running = false;
            let again = false;
            const update = async () => {
                if (running) return void (again = true);
                running = true;
                try {
                    // the dev server's own module graph caches the parser and reloads it on change
                    const parser = await server.ssrLoadModule(PARSER);
                    if (write(generate(parser))) logger.info("commitment: content updated");
                } catch (e) {
                    // show the problems and keep the last good content
                    logger.error(e.message);
                } finally {
                    running = false;
                    if (again) {
                        again = false;
                        void update();
                    }
                }
            };
            server.watcher.on("all", (_event, file) => {
                const source =
                    (file.startsWith(CONTENT) && file.endsWith(".md")) ||
                    (file.startsWith(MODEL) && file.endsWith(".ts"));
                if (source) void update();
            });
            void update();
        }
    };
}
