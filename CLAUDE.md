# refract-ui

Themeable React component library, extracted from [parammehta.com](https://github.com/parammehta/portfolio).
Published to npm as `refract-ui`; Storybook deploys to `storybook.parammehta.com`. See
`README.md` for the consumer-facing API — this file is about developing the library itself.

## Quick reference

| What | Command |
|---|---|
| Storybook (dev) | `npm run storybook` (port 9009) |
| Build the package | `npm run build` → `dist/` |
| Build Storybook | `npm run build:storybook` → `build-storybook/` |
| Tests | `npm test` / `npm run test:watch` |
| Lint | `npm run lint` / `npm run stylelint` |
| Typecheck | `npm run typecheck` |
| Deploy Storybook (manual) | `npm run deploy:storybook` |

Node **24.12.0** (see `.nvmrc`).

## Architecture

- **Bundler: Vite 6 library mode** (`vite.config.ts`), chosen specifically so
  `@storybook/react-vite` and Vitest can reuse the exact same config — one asset/CSS
  pipeline for build, docs, and tests, so `.svg`/`.css`/`.glb` never mean something
  different between them.
- **Three build entries**: `src/index.ts` (everything except Model/Carousel),
  `src/entries/model.ts`, `src/entries/carousel.ts`. Model and Carousel are split out so
  `three`/`three-stdlib` (~600KB) never land in a bundle that only uses `<Text>`. Both are
  *optional* peer dependencies for exactly this reason.
- **ESM + CJS output**, not ESM-only — consumers on older toolchains (CJS Jest configs, for
  instance) need `require()` to work without `transformIgnorePatterns` surgery.
- **No path aliases.** Every internal import is relative (`../../utils/style`, not
  `utils/style`). `eslint.config.mjs` has a `no-restricted-imports` rule banning
  `components/*`, `hooks/*`, `utils/*`, etc. specifically so this can't regress — a bundler
  alias here would resolve locally but break the second anyone `npm link`s or installs the
  package, since the alias config never ships.
- **CSS**: components use CSS Modules with `@custom-media` (`postcss-preset-env`,
  config in `postcss.config.cjs`, breakpoints in `src/styles/media.css`). Vite's build
  resolves `@custom-media` to literal `@media` queries at *library* build time — the
  published `dist/styles.css` has zero custom-media syntax in it, so consumers need no
  PostCSS config of their own. Verify this didn't regress with
  `grep -c -- '--media' dist/styles.css` after a build (should be 0).
- **Four CSS artifacts** ship from `dist/`: `styles.css` (required — component styles plus
  `fadeIn`/`reveal` keyframes, which several components reference via `:global` but which
  live in `src/styles/animations.css` since `@keyframes` names aren't module-scoped),
  `tokens.css` (required — generated post-build by `scripts/build-tokens-css.cjs`, which
  `require()`s the *built* `dist/index.cjs` to extract `tokenStyles` rather than
  duplicating the token logic), `reset.css` and `media.css` (both opt-in, static
  passthroughs of `src/styles/*.css` copied by `scripts/copy-static-assets.cjs`).
- **No fonts ship.** `--fontStack` resolves through `var(--brandFontStack, var(--systemFontStack))`
  — consumers set `--brandFontStack` for their own typeface. The portfolio's Gotham files
  stay in that repo (`shell/fonts.ts`) since Gotham is commercially licensed.
- **Next-agnostic by construction.** `LinkProvider` is a context defaulting to a plain
  `<a>`; `Link`/`Button` call `useLinkComponent()` instead of importing `next/link`
  directly. `ThemeProvider` upserts `<meta name="theme-color">` imperatively in an effect
  instead of using `next/head`. `RefractProvider` composes `ThemeProvider` + `LinkProvider`
  + a config context (`dracoDecoderPath`, `modelBasePath`, `portalContainer`) as a
  convenience — none of the three are required to use the others.
- **`.glb` device models and the DRACO decoder are not bundled into the JS.** `Model`
  resolves them against a configurable base path (default `/models/`, `/draco/`);
  `dist/assets/*.glb` are static files a consumer copies themselves — see the README's "3D
  components" section for the exact `cp` commands, and `scripts/models-storybook.cjs` /
  `scripts/draco-storybook.cjs` for how this repo's own Storybook does it.

## Project structure

```
src/
  index.ts        — 'use client' + the primitives barrel + animations.css import
  entries/        — model.ts, carousel.ts (separate bundles, keep three optional)
  components/     — one directory per component (Component.tsx, .module.css, .stories.tsx,
                    .test.tsx, index.ts) — same shape as the portfolio's src/components/
  hooks/          — only the four hooks components actually use (useHasMounted,
                    useInViewport, useFps, useFormInput) — not a full hooks library
  utils/          — style.ts (classes/cssProps/media/px↔rem↔ms helpers), image.ts, three.ts,
                    delay.ts — ported verbatim from the portfolio
  styles/         — animations.css, reset.css, media.css (the three static CSS artifacts)
  assets/models/  — the two device .glb files, copied to dist/assets/ at build time
  stories/        — StoryContainer + fixture images shared across stories (fixtures/ is
                    never included in the npm tarball — only dist/ is, per package.json's
                    `files` field)
types/            — ambient module declarations for *.svg, *.glb, *.png, *.jpg, *.module.css,
                    *.glsl?raw — needed because there's no bundler-specific type shimming
                    the way Next's `next-env.d.ts` provides
```

## Component conventions

Same shape as the portfolio (where all of this was extracted from):
```
src/components/Button/
  Button.tsx           — implementation
  Button.module.css    — styles
  Button.stories.tsx   — Storybook story
  Button.test.tsx      — Vitest (only Text has one today — see Testing)
  index.ts             — re-export
```

## Testing

**Vitest, not Jest** — deliberately, so it shares `vite.config.ts`'s plugins (SVGR, `?raw`
for `.glsl`, CSS Modules) instead of needing a parallel `moduleNameMapper` setup that could
drift from what the real build does.

- `vitest.config.ts` sets `environment: 'jsdom'`, `globals: true`, and excludes
  `**/.claude/**` — a sibling git worktree sometimes appears there from other Claude Code
  sessions working in this repo concurrently; without the exclude, Vitest (and ESLint) walk
  into it and pick up its `dist/` and `node_modules` as if they were this repo's own.
- Only `Text` has a test today (`Text.test.tsx`) — it was the proof-of-toolchain component
  in Phase 2 of the extraction. Coverage on the rest is currently zero; adding tests for
  other components is a legitimate, welcome gap to fill.

## Linting & formatting

- **ESLint**: flat config (`eslint.config.mjs`) — `@eslint/js` recommended +
  `typescript-eslint` + `eslint-plugin-storybook` + `eslint-plugin-react-hooks` **v7**
  (matches the portfolio's version, pulled in there via `eslint-config-next` — a lower
  major is missing rule names like `react-hooks/immutability` and
  `react-hooks/preserve-manual-memoization` that some ported components have inline
  disables for). Also ignores `.claude/**` for the same sibling-worktree reason as Vitest.
- **Stylelint**: `stylelint-config-standard` + `stylelint-config-css-modules`, identical
  rules to the portfolio (camelCase selectors/custom properties/keyframes).
- **Prettier**: `.prettierrc`, same config as the portfolio.

## Publishing & CI

- **release-please** (`release-please-config.json`, `.release-please-manifest.json`) —
  same flow as the portfolio: push Conventional Commits to `main`, release-please opens a
  Release PR, `release.yml` auto-merges it, the merge re-triggers `release.yml` which tags
  + publishes a GitHub Release, which fires `storybook.yml`. Needs `RELEASE_PLEASE_TOKEN`
  (a PAT — the default `GITHUB_TOKEN` can't retrigger workflows) and the repo's "Allow
  auto-merge" setting.
- **npm trusted publishing (GitHub Actions OIDC)** — the `publish` job in `release.yml`
  needs no `NPM_TOKEN`; it authenticates via `id-token: write` permission and npm's
  Trusted Publisher config (set once on npmjs.com: package Settings → Trusted Publisher →
  GitHub Actions → this repo → `release.yml`). Don't add `npm install -g npm@latest` to
  that job — it fails on Node 24.12.0 (the newest npm requires a newer Node); the bundled
  npm (11.6.2) already clears the ≥11.5.1 floor trusted publishing needs.
- **CI** (`ci.yml`): `lint`, `test`, `build` (the real gate — catches a leftover alias or
  missing asset that typecheck alone wouldn't), `build-storybook`.
- **Storybook deploy** (`storybook.yml`, on `release: published` or manual
  `workflow_dispatch`): builds and syncs to the *same* S3 bucket +
  CloudFront distribution the portfolio previously deployed its own Storybook to. Needs
  `AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY` scoped to just that bucket + distribution
  (a dedicated IAM user `refract-ui-deploy`, not the account's main credentials).

## Guidelines for changes

- A new component needs no portfolio-specific content, no `next/*` imports, and no
  hardcoded copy — if it needs any of those, it belongs in the portfolio repo instead, not
  here.
- Keep `three`/`three-stdlib` out of `src/index.ts` and everything it transitively imports.
  If a new piece needs them, give it its own entry in `src/entries/` the way
  `model.ts`/`carousel.ts` do.
- Don't reach for a bundler alias to avoid a relative import — see "No path aliases" above.
- After changing anything CSS-related, rebuild and grep `dist/styles.css` for `--media` to
  confirm `@custom-media` still resolves (should find nothing).
- The portfolio repo (`../portfolio`) is the consumer to check against for any breaking
  API change — its `package.json` pins `refract-ui`, and its own CLAUDE.md documents how
  it's wired in (`LinkProvider`, `shell/fonts.ts`, `_document.page.tsx`'s `tokenStyles`
  inlining).
