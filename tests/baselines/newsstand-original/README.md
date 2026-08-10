# Original Newsstand Baselines

These screenshots are evidence for visual review, not an invitation to redesign the export.

Run from WSL after installing the pinned toolchain and Chromium:

```bash
pnpm reference:verify
pnpm exec playwright install chromium
pnpm reference:baseline
```

Expected reviewed files:

- `desktop-1440x900-cover.png`
- `tablet-768x1024-cover.png`
- `mobile-390x844-cover.png`

Do **not** replace or update baseline images automatically. Review every visual difference against `reference/newsstand-original` before committing a new baseline.
