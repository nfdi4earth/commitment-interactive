#!/usr/bin/env sh
# Browser tests against the build in dist/www (ci/build-site.sh, same PAGES_URL), served by
# `vite preview`. In CI, first installs the Chromium that matches the locked Playwright.
set -eu
. "$(dirname "$0")/base-path.sh"
if [ -n "${CI:-}" ]; then pnpm exec playwright install --with-deps chromium; fi
pnpm exec playwright test
