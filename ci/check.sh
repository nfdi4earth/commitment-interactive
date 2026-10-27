#!/usr/bin/env sh
# Static checks and unit tests. Duplicate packages are checked by `pnpm install` (prepare).
set -eu
pnpm lint
pnpm prettier-check
pnpm check-types
pnpm check-content
CI=1 pnpm test run # CI=1 disallows `.only` in tests
