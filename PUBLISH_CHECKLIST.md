# SDK Package Publication Checklist

Final verification checklist for publishing `@zk-payroll/sdk` to npm.
Run through **every** item before `npm publish`. For the full release process,
see [RELEASE_CHECKLIST.md](./RELEASE_CHECKLIST.md).

> [!IMPORTANT]
> This checklist is the **last gate** before a package reaches users.
> Do not skip sections — even when a release "looks small."

---

## 1 — Version

- [ ] `package.json` `"version"` bumped per [semver](https://semver.org/)
- [ ] Version matches the annotated git tag (`v{major}.{minor}.{patch}`)
- [ ] Tag created on the **version-bump commit** (not before, not after)
- [ ] Tag pushed to origin:

  ```bash
  git tag -a v1.2.3 -m "v1.2.3"
  git push origin v1.2.3
  ```

- [ ] `git status` is clean — no uncommitted changes after the bump

### Common mistakes

| Mistake | Fix |
| --------- | ----- |
| Bumping version *after* tagging | Delete the tag, bump, re-tag |
| Non-standard tag format (`1.2.3` instead of `v1.2.3`) | Use the `v` prefix consistently |
| Tag not pushed | `git push origin v{version}` |

---

## 2 — Tests

All checks below are enforced by the [CI workflow](.github/workflows/ci.yml)
(Node 20, `npm ci`, lint → typecheck → test → smoke → build).

- [ ] `npm run typecheck` — zero TypeScript errors
- [ ] `npm run lint` — no ESLint violations
- [ ] `npm test` — all Vitest unit tests pass
- [ ] `npm run test:smoke` — smoke tests pass (`__tests__/smoke/`)
- [ ] `npm run test:coverage` — coverage threshold met *(if configured)*
- [ ] **CI is green** on the release branch / PR — check the GitHub Actions dashboard

### Common mistakes

| Mistake | Fix |
| --------- | ----- |
| `test.only` / `test.skip` left in from debugging | Search: `grep -r "\.only\|\.skip" __tests__/` |
| Coverage dropped but went unreviewed | Compare against the previous release |
| CI green locally but red in Actions | Run `npm ci && npm run build` in a clean checkout |

---

## 3 — Changelog & Documentation

### CHANGELOG.md

- [ ] A versioned entry exists under `## [x.y.z]` following [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
- [ ] Sections used as applicable: `Added`, `Changed`, `Fixed`, `Removed`, `Security`
- [ ] All links reference **real** issues or PRs
- [ ] `## [Unreleased]` section is present **above** the new version entry

### Other docs

- [ ] **README** — installation, public API, and usage instructions are current
- [ ] **JSDoc / TSDoc** — every public export in `lib/zk/` has an up-to-date doc comment
- [ ] **`docs/` files** — updated for any behaviour changes in this release
- [ ] **`.env.example`** — lists any new required environment variables

### Common mistakes

| Mistake | Fix |
| --------- | ----- |
| New exports are undocumented | Audit `lib/zk/` for missing doc comments |
| README references removed features | Search README for old parameter names |
| CHANGELOG entry under the wrong version heading | Move the entry before tagging |

---

## 4 — Build Artifacts

- [ ] `npm run build` — production build completes without warnings
- [ ] Inspect what will ship:

  ```bash
  npm pack --dry-run
  ```

  The output **must include**:
  - Compiled JS / TypeScript declaration (`.d.ts`) files
  - `package.json`, `README.md`, `LICENSE`, `CHANGELOG.md`

  The output **must exclude**:
  - `__tests__/`, `node_modules/`, `.next/`, `.env*`, `.git/`
  - Source maps (unless intentionally shipped)
  - Docker / CI config files

- [ ] `"files"` field **or** `.npmignore` is correctly configured in `package.json`

> [!WARNING]
> The project currently has **no `"files"` field and no `.npmignore`**.
> Add one before the first publish to avoid shipping the entire repo.

### Common mistakes

| Mistake | Fix |
| --------- | ----- |
| `.env` / secrets in the build output | Add to `.npmignore` and re-pack |
| Package is unexpectedly large | Compare `npm pack --dry-run` size to previous release |
| Build passes locally but fails in CI | Always confirm CI green before publishing |

---

## 5 — Package Metadata

Verify these `package.json` fields before publish:

| Field | Expected |
| ------- | ---------- |
| `"name"` | `@zk-payroll/sdk` (scoped) |
| `"version"` | Matches the git tag |
| `"private"` | `false` **or removed** |
| `"main"` / `"exports"` | Points to the compiled entry point |
| `"types"` | Points to the root `.d.ts` file |
| `"description"` | Accurate one-liner |
| `"license"` | SPDX identifier matching `LICENSE` file |
| `"engines"` | `"node": ">=20"` *(matches CI)* |

> [!WARNING]
> The project currently has `"private": true` and is missing `"main"`,
> `"exports"`, and `"types"`. These **must** be set before the first npm
> publish.

- [ ] `npm ci` produces a clean install — no unexpected dependency changes
- [ ] `tsconfig.json` has no dev-only path aliases leaking into declarations

---

## 6 — Publish

### Pre-publish

- [ ] Logged into the correct npm account and scope:

  ```bash
  npm whoami
  npm whoami --registry=https://registry.npmjs.org/
  ```

- [ ] 2FA is enabled on the npm account (required for scoped packages)
- [ ] Dry run — no errors:

  ```bash
  npm publish --dry-run
  ```

### Publish

- [ ] Publish with provenance (recommended for supply-chain security):

  ```bash
  npm publish --provenance --access public
  ```

  Or without provenance:

  ```bash
  npm publish --access public
  ```

### Post-publish

- [ ] Verify the package is live:

  ```bash
  npm view @zk-payroll/sdk@latest
  ```

- [ ] **Smoke-test the published package** in a clean directory:

  ```bash
  cd /tmp && mkdir sdk-smoke && cd sdk-smoke
  npm init -y
  npm install @zk-payroll/sdk@latest
  node -e "require('@zk-payroll/sdk')"
  ```

- [ ] **Create a GitHub Release**:

  ```bash
  gh release create v{version} --generate-notes
  ```

- [ ] **Vercel deployment** *(if applicable)*: merge to `main` —
  the [deploy workflow](.github/workflows/deploy.yml) handles build & deploy
  automatically

### Common mistakes

| Mistake | Fix |
| --------- | ----- |
| Published from the wrong npm account | `npm unpublish` within 72 h, republish from correct account |
| Skipped the dry run → bad file list | `npm deprecate` the broken version, publish a patch |
| Forgot the GitHub Release | `gh release create v{version} --generate-notes` |

---

## 7 — Rollback Plan

If a broken version is published:

1. **Deprecate** (preferred — keeps dependents' installs working but warns them):

   ```bash
   npm deprecate @zk-payroll/sdk@"x.y.z" "Known issue — use x.y.z+1 instead"
   ```

2. **Unpublish** (within 72 hours, only if absolutely necessary):

   ```bash
   npm unpublish @zk-payroll/sdk@x.y.z
   ```

3. **Publish a patch** with the fix as soon as possible.

---

## Quick Reference: Publish Flow

```text
Bump version  →  Update CHANGELOG  →  Commit & tag  →  Push tag  →
CI passes     →  Build & pack verify  →  npm publish --provenance  →
Post-publish smoke test  →  Create GitHub Release  →  Merge to main (Vercel)
```

---

## Related Files

| Resource | Path |
| ---------- | ------ |
| Release process | [RELEASE_CHECKLIST.md](./RELEASE_CHECKLIST.md) |
| CI (lint, typecheck, test, build) | [ci.yml](.github/workflows/ci.yml) |
| Deploy (Vercel) | [deploy.yml](.github/workflows/deploy.yml) |
| Contributing guide | [CONTRIBUTING.md](./CONTRIBUTING.md) |
| Changelog | [CHANGELOG.md](./CHANGELOG.md) |
| Security policy | [SECURITY.md](./SECURITY.md) |

---

*Report issues with this checklist at <https://github.com/zkpayroll/zk-payroll-dashboard/issues>*
