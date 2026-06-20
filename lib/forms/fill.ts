// Canonical → ACORD PDF fill (BUILD_SPEC §7c). Loads the official PDF when
// present, otherwise a generated stub, then writes each mapped field from the
// canonical record. The fill layer reads ONLY from canonical.

import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { PDFDocument } from "pdf-lib";
import { type CanonicalRecord, getPath } from "../canonical";
import type { FormMap } from "./maps";
import { stubPdfForMap } from "./stub-pdf";

export interface FilledForm {
  form_id: string;
  title: string;
  fileName: string;
  bytes: Uint8Array;
  fieldCount: number;
  filledCount: number;
  usedTemplate: "official" | "stub";
}

async function exists(p: string): Promise<boolean> {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

async function loadTemplate(map: FormMap): Promise<{ bytes: Uint8Array; usedTemplate: "official" | "stub" }> {
  const p = path.join(process.cwd(), map.pdf_template);
  if (await exists(p)) return { bytes: await readFile(p), usedTemplate: "official" };
  return { bytes: await stubPdfForMap(map), usedTemplate: "stub" };
}

function isTruthy(s: string): boolean {
  return /^(y|yes|true|x|1|checked)$/i.test(s.trim());
}

export async function fillForm(map: FormMap, canonical: CanonicalRecord): Promise<FilledForm> {
  const { bytes, usedTemplate } = await loadTemplate(map);
  const pdf = await PDFDocument.load(bytes);
  const form = pdf.getForm();

  const entries = Object.entries(map.fields);
  let filled = 0;
  for (const [pdfField, canonicalPath] of entries) {
    const raw = getPath(canonical, canonicalPath);
    const val = raw == null ? "" : String(raw);
    try {
      const tf = form.getTextField(pdfField);
      tf.setText(val);
      if (val) filled++;
    } catch {
      // Not a text field — try checkbox, else skip (BUILD_SPEC §7c).
      try {
        const cb = form.getCheckBox(pdfField);
        if (isTruthy(val)) {
          cb.check();
          filled++;
        }
      } catch {
        /* field absent in this template — ignore */
      }
    }
  }

  const out = await pdf.save();
  return {
    form_id: map.form_id,
    title: map.title,
    fileName: `${map.form_id}.pdf`,
    bytes: out,
    fieldCount: entries.length,
    filledCount: filled,
    usedTemplate,
  };
}

/** List the real field names in an (official) template — used when wiring in
 *  official ACORD PDFs (BUILD_SPEC §7c). */
export async function readTemplateFieldNames(map: FormMap): Promise<string[]> {
  const { bytes } = await loadTemplate(map);
  const pdf = await PDFDocument.load(bytes);
  return pdf.getForm().getFields().map((field) => field.getName());
}
