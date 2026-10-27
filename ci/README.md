# CI scripts

All CI steps are these scripts; the CI configs only install dependencies and call them, so the
interim GitHub Actions setup (`.github/workflows/pages.yml`) and the prepared GitLab CI setup
(`.gitlab-ci.yml`, not run yet) do the same. They also run locally (Node.js from `.nvmrc`, pnpm from
`packageManager` in `package.json`, after `pnpm install --frozen-lockfile`).

- `ci/check.sh`: the static checks and unit tests (also the pre-commit hook)
- `ci/build-site.sh`: the static site in `dist/www`, for the Pages URL in `PAGES_URL` (`ci/base-path.sh`)
- `ci/e2e.sh`: the browser tests against that build

Both configs run `check` and `build-e2e` in parallel on every branch and merge/pull request, and
publish `dist/www` from the default branch.

One-time setup: on GitHub, set Settings → Pages → Source to "GitHub Actions"; on GitLab, Pages
must be enabled for the project. No secrets are needed. Pages from a private GitHub repository need a
paid organisation plan, and the published site is public unless the organisation restricts access.
