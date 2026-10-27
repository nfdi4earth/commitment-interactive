# Sourced by ci/build-site.sh and ci/e2e.sh: BASE_PATH is the path of PAGES_URL (the URL the site
# is published at; GitHub: configure-pages' base_url, GitLab: CI_PAGES_URL), "/" without one.
BASE_PATH="$(printf '%s' "${PAGES_URL:-}" | sed -E 's|^[A-Za-z][A-Za-z0-9+.-]*://[^/]*||')"
export BASE_PATH="${BASE_PATH:-/}"
