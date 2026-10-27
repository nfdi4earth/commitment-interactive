// The content of content/ (in this package), parsed and checked at build time by
// tools/build-app-content.mjs; the browser gets no YAML parser or content checks.
// It is committed, and builds use it as it is (a host app too): `pnpm dev` keeps it up to date while
// it runs, `pnpm build-content` updates it, and the tests fail if it is out of date.
import generated from "./content.generated.json";
import type { Content } from "./types";

export const content = generated as unknown as Content;
