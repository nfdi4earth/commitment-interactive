// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

/// <reference types="vitest" />
import { pioneer } from "@open-pioneer/vite-plugin-pioneer";
import react from "@vitejs/plugin-react-swc";
import { resolve } from "node:path";
import { defineConfig } from "vite";
import eslint from "vite-plugin-eslint";
import { commitmentContent } from "./tools/vite-plugin-content.mjs";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const devMode = mode === "development";

    // Allowed values are "DEBUG", "INFO", "WARN", "ERROR"
    const logLevel = devMode ? "INFO" : "WARN";

    return {
        root: resolve(__dirname, "src"),

        // Load .env files from this directory instead of `root`.
        envDir: __dirname,

        // The path the site is served under; BASE_PATH sets it for a deployment in a sub-path,
        // e.g. "/commitment-interactive/" on GitHub Pages (see ci/build-site.sh)
        base: `/${process.env.BASE_PATH ?? ""}/`.replace(/\/+/g, "/"),

        // Vite's build output is written to dist/www
        build: {
            outDir: resolve(__dirname, "dist/www"),
            emptyOutDir: true,
            // Minimum browser versions supported by generated JS/CSS
            // See also:
            // - https://vitejs.dev/config/build-options.html#build-target
            target: "baseline-widely-available"
        },

        plugins: [
            pioneer({
                // Whether to include src/index.html in the built output
                rootSite: true,

                // Additional directories to include as html (must contain index.html files)
                sites: [],

                // Apps to distribute as .js files for embedded use cases
                apps: []
            }),
            react(),
            eslint(),
            commitmentContent()
        ],

        resolve: {
            alias: {
                "@components": resolve(__dirname, "src/apps/commitment-standalone/components"),
                "@services": resolve(__dirname, "src/apps/commitment-standalone/services"),
                "@os4a": resolve(__dirname, "src/apps/commitment-standalone")
            }
        },

        // Ignore irrelevant deprecations.
        css: {
            preprocessorOptions: {
                scss: {
                    silenceDeprecations: ["import"]
                }
            }
        },

        // define global constants
        // See also: https://vitejs.dev/config/shared-options.html#define
        define: {
            __LOG_LEVEL__: JSON.stringify(logLevel)
        },

        // https://vitest.dev/config/
        test: {
            globals: true,
            environment: "happy-dom",
            setupFiles: ["testing/global-setup.ts"],
            passWithNoTests: true,

            server: {
                deps: {
                    // Workaround to fix some import issues, see
                    // https://github.com/open-pioneer/trails-openlayers-base-packages/issues/314
                    inline: [/@open-pioneer[/\\]/]
                }
            }
        },

        // prettier-ignore
        server: {
            // Use this option if your development setup uses hostnames other than localhost.
            // See also https://vite.dev/config/server-options.html#server-allowedhosts
            // allowedHosts: [".example.com"],
                        
            // disable hot reloading
            // in dev mode press "r" to trigger reload and make changes active
            // See also: https://vitejs.dev/config/server-options.html#server-hmr
            // hmr: false
        }
    };
});
