# Funding package generator

One content model, two outputs. Each run writes its documents once as a list
of blocks in `<run-directory>/content.py`; `build.py` renders every document to
`.docx` (house fonts, for editing and signature) and `.pdf` (companion, for
upload and reading). The two cannot drift because neither is authored by hand.

```
python3 generator/build.py 2026-08-22_DOE_SBIR-STTR_FY26-Phase-I-Genesis-Mission
```

Requires `python-docx`, `reportlab`.

## Design

The visual system is the PlastiBioFuel house style: deep blue `#045AA9`,
white ground, `#D50057` accent used only for urgency and warnings, `#2A2A2A`
body text, hairline rules, no heavy borders. Headings set in Aptos Display
with Calibri and Segoe UI Semibold as fallbacks; body in Aptos falling back
to Calibri. The PDF companion sets in Helvetica, which is metrically close
and always available.

The canvas the design was drawn on lives in `../design/` as `.dc.html`
artboards plus `canvas.json`.

## Block vocabulary

| Block | Shape | Renders as |
|---|---|---|
| `masthead` | `(label)` | Full-bleed blue band, wordmark left, document label right, accent rule under |
| `hero` | `(eyebrow, title, standfirst)` | Blue letterspaced eyebrow, large display title, grey standfirst |
| `stats` | `[(label, value, note)]` | Rule-bounded row of large blue figures |
| `statbar` | `[(value, label)]` | Same, value first; the figure auto-sizes to its length |
| `legend` | `[(pill-kind, text)]` | Status pills with their meanings |
| `alert` | `(text)` | Pink-tinted strip with an accent rule at the left |
| `factgrid` | `[(label, text)]` | Two-column definition grid on hairline rules |
| `factwide` | `(label, rich-text)` | Full-width definition row |
| `chip` | `(text, right-text)` | White-on-blue section chip with a muted right caption |
| `qblock` | `(num, title, pill, [(lead, text)], addon)` | Ghost numeral, question title, word-count pill, indented answer |
| `step` | `(n, rich-text)` | Circled step number beside the instruction |
| `card` | `(pill-kind, title, where, who, note)` | Status pill beside a titled record with WHERE and SIGNS meta |
| `callout` | `(label, text)` | Pink-tinted block; `\n` splits it into paragraphs |
| `tint` | `(label, sub, quote)` | Pale blue block, optional rule-marked quotation |
| `kvrows` | `[(key, value)]` | Two-column rows on hairline rules |
| `ref` | `(idx, rich-citation, doi, why)` | Numbered reference with DOI line and an indented annotation |
| `h1` `h2` `p` `small` | text | Headings and body copy |
| `footer` | `(left, right)` | Rule, then small grey meta split left and right |

`rich-text` accepts a small HTML subset shared by both renderers:
`<font name="Helvetica-Bold">`, `<font color="#RRGGBB">`, `<i>`.

## Pill kinds

`confirmed` · `anticipated` · `na` · `required` · `optional` · `ready`
