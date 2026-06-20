# forms/

ACORD forms are copyrighted. Beach obtains the official **fillable** PDFs through
his ACORD subscription / AMS and drops them in this folder — the app fills them,
it does not reproduce them (BUILD_SPEC §1, §7c).

## How it works

- `field-maps/<form>.json` maps **PDF field name → canonical path** for each form,
  plus which line(s)/state(s)/carrier(s) the form applies to.
- The fill engine (`lib/forms/fill.ts`) loads `forms/<form_id>.pdf` if present.
  **Until you drop the official PDF in, it renders a faithful ACORD-format
  facsimile** (`lib/forms/acord/` — real ACORD 25, 125, 37, 36 layouts, plus
  ACORD-styled personal-auto/homeowner applications) filled from the canonical
  record, so "Generate Forms" produces a real, on-form, downloadable PDF today.
- Regenerate them for visual QA with `node --import tsx scripts/render-acord.mjs`.

## Dropping in an official ACORD PDF

1. Save the official fillable PDF here as `forms/<form_id>.pdf`
   (e.g. `forms/ACORD_125.pdf`).
2. Read its true field names:
   ```js
   const { PDFDocument } = require("pdf-lib");
   const bytes = require("fs").readFileSync("forms/ACORD_125.pdf");
   PDFDocument.load(bytes).then(d =>
     console.log(d.getForm().getFields().map(f => f.getName()))
   );
   ```
3. Update the `fields` map in `field-maps/<form>.json` to use those real names.

## Adding a carrier (zero code change)

Drop a new `field-maps/<carrier-form>.json` with
`"applies_to": { "carriers": ["Carrier Name"] }` and its PDF. The matcher picks
it up automatically as a per-carrier supplement (BUILD_SPEC §7b).
