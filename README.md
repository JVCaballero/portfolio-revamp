# CABALLERO! Portfolio Revamp

Production rebuild of the approved CABALLERO! Newsstand concept. The governing rule is simple: **preserve the experience; replace the prototype plumbing.** The original export is stored read-only under `reference/newsstand-original/` and is the visual/interaction source of truth.

## Locked foundation

- Astro 6, statically generated
- TypeScript strict mode
- Node.js 24 LTS, repository-pinned to 24.19.0
- pnpm, repository-pinned to 11.17.0
- Semantic Astro components
- Plain CSS and small vanilla TypeScript interaction modules
- Markdown/MDX content collections and typed data files
- Playwright, Chromium-first, one worker
- Cloudflare Workers Static Assets
- GitHub Actions for pull-request quality gates

No client framework, CMS, database, backend, Docker, local LLM, contact form, or AI chatbot is part of launch scope.

## WSL setup

The repository assumes `nvm` is available in WSL. If you use a different Node version manager, install the exact version shown in `.nvmrc` by that tool instead.

```bash
nvm install 24.19.0
nvm use 24.19.0
corepack enable
corepack install --global pnpm@11.17.0
pnpm --version
pnpm install
pnpm exec playwright install chromium
```

What these do: `nvm` selects the locked Node LTS patch; Corepack activates the repository-pinned pnpm; `pnpm install` creates/uses `pnpm-lock.yaml`; the final command installs only Chromium for the routine Playwright workflow.

**Important:** commit the generated `pnpm-lock.yaml`. CI intentionally uses `pnpm install --frozen-lockfile`, so a pull request cannot silently change dependency resolution.

## Daily resource-conscious workflow

```bash
pnpm dev
```

Keep that terminal running while implementing one route. For a quick check in another terminal:

```bash
pnpm check
pnpm test:smoke:desktop
```

Before opening a pull request, run the full local gate:

```bash
pnpm reference:verify
pnpm format:check
pnpm lint
pnpm check
pnpm build
pnpm test:smoke
pnpm test:a11y
```

`pnpm test:smoke` uses Chromium and one worker across the locked desktop, tablet, and mobile viewports. `pnpm test:a11y` runs the lightweight automated WCAG A/AA gate. The full CI suite should run remotely before merge.

## Repository map

```text
reference/newsstand-original/   Immutable exported concept
src/components/                 Semantic reusable Astro components
src/layouts/                    Shared page layouts
src/pages/                      File-based routes
src/content/                    Markdown/MDX source entries
src/content.config.ts           Astro 6 collection schemas/loaders
src/data/                       Typed frequently-updated structured data
src/scripts/interactions/       Small vanilla TypeScript interactions
src/styles/                     CSS tokens/layers/primitives (Sprint 1 onward)
src/assets/                     Build-processed local assets
public/resume/                  Recruiter-downloadable resume PDF
scripts/                        Repository/reference verification utilities
tests/                          Playwright smoke/visual tests and reviewed baselines
```

Astro 6 uses the top-level `src/content.config.ts` Content Layer configuration. Content bodies remain organized under `src/content/`.

## Immutable design reference

Verify the archive copy:

```bash
pnpm reference:verify
```

Capture the original Cover at the three locked viewports after Chromium is installed:

```bash
pnpm reference:baseline
```

The expected outputs live in `tests/baselines/newsstand-original/`. Review them before committing. Never use an automatic snapshot-update command as a substitute for visual review.

## GitHub repository setup

The project owner may create the initial repository directly; coding agents must use branches and pull requests afterward.

```bash
git init -b main
git add .
git commit -m "chore: scaffold Sprint 0 foundation"
gh auth login
gh repo create portfolio-revamp --public --source=. --remote=origin --push
```

If GitHub CLI is not installed, create an empty public `portfolio-revamp` repository in the GitHub UI, then add its remote and push `main`. Do not add a license yet, and do not initialize the remote with files that would conflict with this scaffold.

Recommended repository protection after the first push: require a pull request for agent work and require the `quality` Actions job before merge.

## Cloudflare Workers Static Assets

`wrangler.jsonc` deploys the generated `dist/` directory as static assets. No application secret is required for the static site itself.

For the first owner-controlled preview from WSL:

```bash
pnpm build
pnpm exec wrangler login
pnpm cf:deploy
```

`wrangler login` stores authentication outside the repository. Never commit Cloudflare tokens. Keep the existing GitHub Pages portfolio live until the revamp is reviewed and approved for cutover.

For branch previews/production automation, connect the GitHub repository to Cloudflare Workers Builds in the Cloudflare dashboard. Create/select the Worker with the same name as `wrangler.jsonc`: `portfolio-revamp`. Set `main` as the production branch, enable builds for non-production branches, use `pnpm build` as the build command, `pnpm exec wrangler deploy` as the production deploy command, and `pnpm exec wrangler versions upload` as the non-production deploy command. Non-production uploads create reviewable preview versions without promoting them to the active production deployment.

Cloudflare Web Analytics is intentionally deferred until a deployed site exists.

## Branch discipline

See [`AGENTS.md`](./AGENTS.md). In short: agents work on isolated branches, visible differences are reviewed, new dependencies need rationale, unrelated refactors are prohibited, and `reference/newsstand-original/` is never edited.
