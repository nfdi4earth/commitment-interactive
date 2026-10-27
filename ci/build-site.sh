#!/usr/bin/env sh
# Builds the static site in dist/www, for the URL in PAGES_URL (see ci/base-path.sh).
set -eu
. "$(dirname "$0")/base-path.sh"
pnpm build
# Static hosts serve 404.html for unknown paths: let the app's router handle deep links such as
# /commitment/for/student (with HTTP status 404, which is fine for a preview)
cp dist/www/index.html dist/www/404.html
echo "Built dist/www for ${BASE_PATH}"
