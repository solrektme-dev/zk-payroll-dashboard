# Release Checklist

Use this checklist before publishing a new version. Each item links to the relevant workflow or file.

---

## 1. Version & Changelog

- [ ] **Determine version bump** — follow [semver](https://semver.org/):
  - `patch` (1.0.0 → 1.0.1): bug fixes
  - `minor` (1.0.0 → 1.1.0): new features, backwards compatible
  - `major` (1.0.0 → 2.0.0): breaking changes
- [ ] **Update `version` field** in `package.json`
- [ ] **Update CHANGELOG** — entries grouped under the new version with sections:
  - `Added` — new features
  - `Changed` — behaviour changes
  - `Fixed` — bug fixes
  - `Removed` — deprecated/removed features
  - `Security` — vulnerability fixes
- [ ] **Check that CHANGELOG links reference real issues/PRs**
- [ ] **Create a git tag** matching the new version (`v{major}.{minor}.{patch}`)

  ```bash
  git tag -a v1.0.1 -m "v1.0.1"
  git push origin v1.0.1
  ```

### Common mistakes

- Forgetting to tag the release commit
- Bumping version after tagging (tag and commit must match)
- Using a non-standard tag format (use `v1.2.3`)

---

## 2. Code Quality

All items below are enforced by [CI workflow](.github/workflows/ci.yml). Run them locally before pushing:

- [ ] `npm run lint` — no lint errors
- [ ] `npx tsc --noEmit` — TypeScript type checks pass
- [ ] `npm test` — all unit tests pass
- [ ] `npm run test:smoke` — smoke tests pass

### Common mistakes

- Pushing with failing CI — run locally first
- Ignoring TypeScript errors by using `// @ts-ignore` or `any` where a real type exists
- Committing `test.only` or `test.skip` left over from debugging

---

## 3. Documentation

- [ ] **README** — verify features, API, and setup instructions reflect the new release
- [ ] **`docs/` files** — update any guide affected by the change
- [ ] **JSDoc / TSDoc** — public API exports have accurate doc comments
- [ ] **Inline comments** — remove stale or misleading comments in changed code

### Common mistakes

- README references removed features or old parameter names
- New exports are undocumented
- Docs describe behaviour that was modified in this release

---

## 4. Build & Artifacts

- [ ] `npm run build` — production build succeeds
- [ ] **Inspect the build output** — verify all expected artifacts exist (see `next.config.mjs` for output configuration)
- [ ] **If publishing to npm**:
  - [ ] Remove `"private": true` from `package.json` (or set to `false`)
  - [ ] Verify `"files"` field or `.npmignore` includes all necessary files and excludes sources, tests, and config
  - [ ] Dry-run the publish: `npm publish --dry-run` — check the file list
- [ ] **If deploying to Vercel**: [deploy workflow](.github/workflows/deploy.yml) handles this automatically after merge to `main`

### Common mistakes

- `.env` or secrets baked into the build output
- Large unnecessary files included in the published package (node_modules, `.next/`, `.git/`)
- Build succeeds locally but fails in CI due to environment differences
- Forgetting to remove `"private": true` before publishing to npm

---

## 5. Environment & Configuration

- [ ] **`package.json`** — verify `"name"`, `"version"`, and `"description"` are correct
- [ ] **`tsconfig.json`** — no development-only path aliases or loose compiler options
- [ ] **`next.config.mjs`** — production settings are appropriate (no dev-only overrides)
- [ ] **Environment variables** — `.env.example` is up to date with any new required vars

### Common mistakes

- Hardcoded dev endpoints or API keys in production config
- Missing environment variables that cause runtime failures in production
- `package.json` `"name"` does not match the npm package name

---

## 6. Final Verification

- [ ] **CI passes** on the release branch/PR — confirm at the GitHub Actions dashboard
- [ ] **Changelog is committed** alongside the version bump
- [ ] **All checklist items above are complete**
- [ ] **A maintainer (other than the releaser) has reviewed the release** for a fresh set of eyes

### Common mistakes

- Skipping peer review for the release itself
- Releasing late in the day — prefer morning releases so issues can be handled during business hours

---

## Publishing Steps (for reference)

### If publishing to npm

```bash
# 1. Confirm you are logged in to the correct npm account
npm whoami

# 2. Run final checks
npm run lint
npx tsc --noEmit
npm test
npm run test:smoke
npm run build

# 3. Publish
npm publish

# 4. Create a GitHub Release
gh release create v{version} --generate-notes
```

### If deploying to Vercel

Merge the release branch to `main`. The [deploy workflow](.github/workflows/deploy.yml) handles:

1. `vercel build --prod`
2. `vercel deploy --prebuilt --prod`

Verify the deployment at the Vercel project dashboard.

---

*See [CONTRIBUTING.md](CONTRIBUTING.md) for the development workflow and [CI workflow](.github/workflows/ci.yml) for automated checks.*
