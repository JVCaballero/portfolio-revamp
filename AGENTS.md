# PF Revamp Agent Operating Contract

## Authority and immutable design

The locked Resource Decision Record v1.0 is project authority. The approved CABALLERO! Newsstand export under `reference/newsstand-original/` is the immutable visual golden master.

**Preserve the experience; replace the prototype plumbing.** Do not redesign, simplify, modernize, normalize, or otherwise make the approved experience more conventional. Preserve visible layout, typography, colors, responsive intent, transitions, hover/click behavior, navigation framing, editorial density, and playful details.

Never edit anything under `reference/newsstand-original/`. Run `pnpm reference:verify` whenever work could have touched reference files.

Structural, accessibility, routing, performance, semantic HTML, browser-history, loading, metadata, and maintainability improvements are allowed only when they do not visibly redesign the approved experience. If a visible design change appears necessary, stop and return that decision to the PF Revamp v2.0 planning thread.

## Branch and contribution rules

1. `main` must remain deployable.
2. Coding agents work only on isolated branches and submit changes through pull requests.
3. Never push agent-generated work directly to `main`.
4. Keep one meaningful concern per branch.
5. Do not perform design-system refactors without an approved issue.
6. Do not perform unrelated refactoring, cleanup, dependency upgrades, or file moves.
7. Any new dependency requires a written reason in the pull request.
8. Do not blindly accept visual snapshot changes.

Suggested branch prefixes: `feat/`, `fix/`, `content/`, and `chore/`.

## Scope boundaries

Launch scope is static Astro. Do not introduce React, Vue, Svelte, Tailwind, a component library, CMS, database, backend, Docker, local LLM, contact form, AI chatbot, or alternate hosting unless a new locked decision explicitly authorizes it.

Never commit secrets, tokens, `.env` files, unredacted client evidence, private screenshots, production logs, confidential documents, employment documents, or unsupported claims/metrics. Placeholder claims and metrics stay placeholders until explicitly verified.

## Required task contract

Every implementation task handed to an agent must state:

- exact files/components in scope;
- acceptance criteria;
- relevant reference screenshots or golden-master locations;
- required viewports;
- behaviors that must not change;
- tests/checks that must pass; and
- an explicit prohibition on unrelated refactoring.

## Acceptance expectations

At minimum, changed work must pass the checks relevant to its scope: formatting, linting, `astro check`, production build, and lightweight Playwright smoke tests. Visual work must be compared at 1440x900, 768x1024, and 390x844. Screenshot differences are reviewed, never auto-approved. Reduced-motion and keyboard behavior must remain usable when the related interaction exists.

For local development on the 8 GB WSL machine, prefer Chromium only, one Playwright worker, and a single route/viewport during active work. Do not run Docker or a local LLM beside normal portfolio development.
