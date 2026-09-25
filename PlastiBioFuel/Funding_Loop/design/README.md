# Design canvas

The artboards the funding-package layout was drawn on, one `.dc.html` per
document, laid out by `canvas.json`. These are the design source; the Word and
PDF deliverables are reproduced from them by `../generator/`.

Published canvas: https://claude.ai/code/artifact/85b20399-2383-4161-aba4-fb06fa935b85

The seeded single-file canvas is a build artifact and is not committed. To
rebuild it, run the `design` skill's `seed-canvas.mjs` over these files:

```
node <skill>/seed-canvas.mjs \
  --template <skill>/payload.template.html \
  --out plastibiofuel-funding-package.html \
  --title "PlastiBioFuel Funding Package" \
  --artboard Main.dc.html --artboard Pitch.dc.html --artboard Submission.dc.html \
  --artboard Forms.dc.html --artboard Bibliography.dc.html \
  --canvas canvas.json
```

| Artboard | Document | Print mode |
|---|---|---|
| `Main.dc.html` | Opportunity Brief | fixed, one Letter page |
| `Pitch.dc.html` | Pitch Responses | flow |
| `Submission.dc.html` | Submission Checklist | flow |
| `Forms.dc.html` | Forms and Certifications Checklist | flow |
| `Bibliography.dc.html` | Bibliography and References Cited | flow |

Type on the canvas maps to the Word deliverable: Archivo falls back to Aptos
Display and Segoe UI Semibold, Figtree falls back to Aptos and Calibri.
