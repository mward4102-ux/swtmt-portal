// Canonical → ACORD PDF (BUILD_SPEC §7c). If the official fillable PDF has been
// dropped into forms/<form_id>.pdf, fill its AcroForm via the field-map.
// Otherwise render a faithful ACORD-format facsimile from canonical. Either way,
// the fill layer reads ONLY from canonical.

import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { PDFDocument } from "pdf-lib";
import { type CanonicalRecord, getPath } from "../canonical";
import { renderForm } from "./acord";
import type { FormMap } from "./maps";

export interface FilledForm {
  form_id: string;
  title: string;
  fileName: string;
  bytes: Uint8Array;
  fieldCount: number;
  filledCount: number;
  usedTemplate: "official" | "rendered";
}

async function exists(p: string): Promise<boolean> {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

function isTruthy(s: string): boolean {
  return /^(y|yes|true|x|1|checked)$/i.test(s.trim());
}

function countFilled(map: FormMap, canonical: CanonicalRecord): number {
  let n = 0;
  for (const p of Object.values(map.fields)) {
    const raw = getPath(canonical, p);
    if (raw != null && String(raw) !== "") n++;
  }
  return n;
}

export async function fillForm(map: FormMap, canonical: CanonicalRecord): Promise<FilledForm> {
  const entries = Object.entries(map.fields);
  const officialPath = path.join(process.cwd(), map.pdf_template);

  // Official fillable PDF present → fill its AcroForm.
  if (await exists(officialPath)) {
    const pdf = await PDFDocument.load(await readFile(officialPath));
    const form = pdf.getForm();
    let filled = 0;
    for (const [pdfField, canonicalPath] of entries) {
      const raw = getPath(canonical, canonicalPath);
      const val = raw == null ? "" : String(raw);
      try {
        form.getTextField(pdfField).setText(val);
        if (val) filled++;
      } catch {
        try {
          const cb = form.getCheckBox(pdfField);
          if (isTruthy(val)) { cb.check(); filled++; }
        } catch {
          /* field absent in this template */
        }
      }
    }
    return {
      form_id: map.form_id, title: map.title, fileName: `${map.form_id}.pdf`,
      bytes: await pdf.save(), fieldCount: entries.length, filledCount: filled, usedTemplate: "official",
    };
  }

  // Otherwise render a faithful ACORD facsimile from canonical.
  const bytes = await renderForm(map, canonical);
  return {
    form_id: map.form_id, title: map.title, fileName: `${map.form_id}.pdf`,
    bytes, fieldCount: entries.length, filledCount: countFilled(map, canonical), usedTemplate: "rendered",
  };
}

/** List the real field names in an official template (used when wiring in
 *  official ACORD PDFs — BUILD_SPEC §7c). */
export async function readTemplateFieldNames(map: FormMap): Promise<string[]> {
  const officialPath = path.join(process.cwd(), map.pdf_template);
  if (!(await exists(officialPath))) return [];
  const pdf = await PDFDocument.load(await readFile(officialPath));
  return pdf.getForm().getFields().map((field) => field.getName());
}
