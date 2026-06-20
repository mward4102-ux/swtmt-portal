// Generates a labelled, genuinely-fillable stub PDF for a form map, so the fill
// pipeline produces a real, downloadable, filled PDF before Beach drops in the
// official ACORD PDFs (BUILD_SPEC §7c "ship a stub placeholder").

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { FormMap } from "./maps";
import { AGENCY } from "../config";

function humanize(s: string): string {
  return s.replace(/_/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2").replace(/([0-9])([A-Z])/g, "$1 $2");
}

export async function stubPdfForMap(map: FormMap): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const form = pdf.getForm();

  const W = 612, H = 792, margin = 54;
  const navy = rgb(0.066, 0.243, 0.42);
  const amber = rgb(0.6, 0.33, 0.1);
  const grey = rgb(0.25, 0.25, 0.3);

  let page = pdf.addPage([W, H]);
  let y = H - margin;

  page.drawText(map.title, { x: margin, y, size: 15, font: bold, color: navy });
  y -= 20;
  page.drawText(`${AGENCY.name} · prepared from canonical record`, { x: margin, y, size: 9, font, color: grey });
  y -= 16;
  page.drawText(
    "DEMO TEMPLATE — replace with the official fillable ACORD PDF (see forms/README.md).",
    { x: margin, y, size: 8, font, color: amber },
  );
  y -= 12;
  page.drawLine({ start: { x: margin, y }, end: { x: W - margin, y }, thickness: 1, color: rgb(0.85, 0.88, 0.92) });
  y -= 28;

  for (const name of Object.keys(map.fields)) {
    if (y < margin + 50) {
      page = pdf.addPage([W, H]);
      y = H - margin;
    }
    page.drawText(humanize(name), { x: margin, y, size: 9, font, color: grey });
    const tf = form.createTextField(name);
    tf.setText("");
    tf.addToPage(page, {
      x: margin,
      y: y - 22,
      width: W - 2 * margin,
      height: 17,
      borderWidth: 1,
      borderColor: rgb(0.8, 0.82, 0.88),
      backgroundColor: rgb(0.98, 0.99, 1),
    });
    y -= 46;
  }

  return pdf.save();
}
