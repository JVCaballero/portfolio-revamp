# Newsstand Original — Immutable Reference Inventory

Source archive: `Portfolio revamp_ three concepts (1)(1).zip`

The locked export is copied **unchanged** under `reference/newsstand-original/`. Do not edit files in that directory. Run `pnpm reference:verify` after any operation that could have touched it.

| File                                   |     Bytes | SHA-256                                                            | Purpose                                               |
| -------------------------------------- | --------: | ------------------------------------------------------------------ | ----------------------------------------------------- |
| `README.txt`                           |     1,200 | `e1db782fe575342a4a78bdfb72fc25e695761728161a3d4ae369a5f03e0368fd` | Export notes and page inventory                       |
| `index.html`                           | 3,100,219 | `2023e03d8a6cc8dd2a89343c5769d13171c633972ffc075da54a01302198cdfd` | Self-contained full-site visual/interaction reference |
| `source/Newsstand - Full Site.dc.html` |   110,260 | `01f294e5b7f2340ced99cec390017e75ee9baffc3ee126707242b8d74578827c` | Original editable prototype source                    |
| `source/support.js`                    |    69,150 | `8fe7df74405f3c55f49b7249c74ea1397e65d07dea2b1bd3b4a489bec2e28cbe` | Prototype support runtime                             |

## Observed prototype dependencies / placeholders

The export notes reference Google Fonts families (Archivo Black, Barlow Condensed, Source Serif 4, Space Mono, Architects Daughter) and `picsum.photos` placeholder images. The bundled `index.html` contains embedded prototype resources plus 11 `picsum.photos` references. These are reference-only implementation details, not production architecture decisions.

The visible sections listed by the export are Cover, Feature, Reviews, The Interview, Columns (including individual entries), B-Sides, Rotation, and Letters. The production route architecture remains governed by the locked RDR.
