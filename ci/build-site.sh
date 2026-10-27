#!/usr/bin/env sh
# Builds the static site in dist/www, for the URL in PAGES_URL (see ci/base-path.sh).
set -eu
. "$(dirname "$0")/base-path.sh"
pnpm build
# Static hosts only know files: give every page of the app its own copy of index.html, so that
# links to it answer with status 200. GitHub and GitLab Pages serve /x from x.html without a
# redirect (x/index.html would redirect to x/). Keep in step with src/packages/commitment/routes.tsx;
# the browser tests against the deployment check a sample.
content=src/packages/commitment/content
ids() { for f in "$content/$1"/*.md; do [ -e "$f" ] && basename "$f" .md; done; }
for route in commitment commitment/for commitment/topics commitment/concepts commitment/map \
    $(ids roles | sed 's|^|commitment/for/|') \
    $(ids topics | sed 's|^|commitment/topics/|') \
    $(ids deepdives | sed 's|^|commitment/deep-dive/|'); do
    mkdir -p "$(dirname "dist/www/$route")"
    cp dist/www/index.html "dist/www/$route.html"
done
# any other path gets the app too, which leads back to the reader (with status 404)
cp dist/www/index.html dist/www/404.html
echo "Built dist/www for ${BASE_PATH}"
