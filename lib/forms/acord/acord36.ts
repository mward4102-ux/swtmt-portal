// Faithful ACORD 36 (2007/01) — Agent/Broker of Record Change. Filled from canonical.

import type { CanonicalRecord } from "../../canonical";
import { AGENCY } from "../../config";
import { LABEL, PAGE, Sheet, newDoc } from "./sheet";

const v = (f?: { value: string | null }) => f?.value ?? "";
function fmt(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso.length <= 10 ? `${iso}T00:00:00` : iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString("en-US");
}

export async function renderAcord36(record: CanonicalRecord, lineLabel = ""): Promise<Uint8Array> {
  const { doc, fonts } = await newDoc();
  const s = new Sheet(doc, fonts);
  const { M, W } = PAGE;
  const R = W - M;
  const FW = R - M;

  // Header
  s.rect(M, M, 74, 26);
  s.text(M + 6, M + 8, "ACORD", { size: 14, font: fonts.bold });
  s.text(M + 58, M + 8, "®", { size: 5, font: fonts.bold });
  s.text(M + 84, M + 6, "AGENT/BROKER OF RECORD CHANGE", { size: 13, font: fonts.bold, align: "c", w: R - 96 - (M + 84) });
  s.cell(R - 92, M, 92, 26, "DATE (MM/DD/YYYY)", new Date().toLocaleDateString("en-US"));

  let y = M + 26;
  const cx = 306;
  // New agency + insurance company
  s.rect(M, y, cx - M, 60);
  s.label(M, y, "NEW AGENCY", cx - M);
  s.text(M + 4, y + 9, AGENCY.name, { size: 7.5, font: fonts.bold });
  s.text(M + 4, y + 18, AGENCY.address, { size: 6.4 });
  s.text(M + 4, y + 27, `${AGENCY.phone}`, { size: 6.4 });
  s.cell(cx, y, R - cx, 60, "INSURANCE COMPANY NAME", v(record.carrier_name), { valueSize: 8, bold: true });
  y += 60;
  s.cell(M, y, cx - M, 12, "E-MAIL ADDRESS:", AGENCY.email, { valueSize: 6.2 });
  s.cell(M, y + 12, (cx - M) / 2, 12, "CODE:", "");
  s.cell(M + (cx - M) / 2, y + 12, (cx - M) / 2, 12, "SUBCODE:", "");
  s.cell(M, y + 24, cx - M, 12, "AGENCY CUSTOMER ID:", "");
  s.cell(cx, y, (R - cx) / 2, 36, "CURRENT AGENCY", "");
  s.cell(cx + (R - cx) / 2, y, (R - cx) / 2, 36, "CURRENT PRODUCER", "");
  y += 44;

  // Table
  const cols = [
    { label: "NAMED INSURED (AS IT APPEARS ON POLICY)", w: 170 },
    { label: "POLICY NUMBER(S)", w: 130 },
    { label: "EFFECTIVE DATE", w: 70 },
    { label: "EXPIRATION DATE", w: 70 },
    { label: "LINE OF BUSINESS", w: FW - 440 },
  ];
  let hx = M;
  cols.forEach((c) => { s.cell(hx, y, c.w, 22, "", c.label, { valueSize: 5, bold: true, align: "c" }); hx += c.w; });
  y += 22;
  const firstRow = [v(record.business.name) || v(record.named_insured), v(record.policy_number), fmt(v(record.policy_period.start)), fmt(v(record.policy_period.end)), lineLabel];
  for (let r = 0; r < 7; r++) {
    let rx = M;
    cols.forEach((c, ci) => {
      s.rect(rx, y, c.w, 18);
      if (r === 0 && firstRow[ci]) s.text(rx + 3, y + 5, firstRow[ci], { size: 6.4, maxWidth: c.w - 6 });
      rx += c.w;
    });
    y += 18;
  }
  y += 16;

  // Body
  s.text(M + 40, y, "Please be advised that we wish to name", { size: 10, font: fonts.bold });
  s.line(M + 240, y + 12, R - 20, y + 12, 0.8);
  s.text(M + 280, y + 14, "PRODUCER", { size: 6, color: LABEL });
  s.text(M + 245, y + 2, AGENCY.name, { size: 8, font: fonts.obl });
  y += 22;
  s.line(M + 20, y + 12, M + 120, y + 12, 0.8);
  s.text(M + 40, y + 14, "CODE #", { size: 6, color: LABEL });
  s.text(M + 130, y, "as our exclusive representative effective", { size: 10, font: fonts.bold });
  s.line(M + 360, y + 12, R - 20, y + 12, 0.8);
  s.text(M + 430, y + 14, "DATE", { size: 6, color: LABEL });
  y += 24;
  s.text(M, y, "for the lines of business shown above, currently in force or submitted by application.", { size: 10, font: fonts.bold });
  y += 24;
  s.paragraph(M, y, "This authorization replaces any other authorization that may have been previously completed for any other insurance representative for the stated lines of business.", { size: 10, font: fonts.bold, maxWidth: FW, lineH: 13, maxLines: 3 });
  y += 56;

  // Signature lines
  const sig = (label: string, top: number, x = M + 60, w = FW - 200) => {
    s.line(x, top + 12, x + w, top + 12, 0.7);
    s.text(x, top + 16, label, { size: 6.5, color: LABEL, align: "c", w });
  };
  sig("INSURED'S SIGNATURE", y); s.line(R - 120, y + 12, R - 20, y + 12, 0.7); s.text(R - 120, y + 16, "DATE", { size: 6.5, color: LABEL, align: "c", w: 100 });
  y += 30; sig("TITLE (IF APPLICABLE)", y);
  y += 30; sig("COMPANY NAME (IF APPLICABLE)", y);
  y += 30; sig("STREET ADDRESS OF INSURED", y);
  y += 30;
  s.line(M + 40, y + 12, M + 220, y + 12, 0.7); s.text(M + 40, y + 16, "CITY OF INSURED", { size: 6.5, color: LABEL, align: "c", w: 180 });
  s.line(M + 250, y + 12, M + 370, y + 12, 0.7); s.text(M + 250, y + 16, "STATE OF INSURED", { size: 6.5, color: LABEL, align: "c", w: 120 });
  s.line(M + 400, y + 12, R - 20, y + 12, 0.7); s.text(M + 400, y + 16, "ZIP CODE OF INSURED", { size: 6.5, color: LABEL, align: "c", w: R - 20 - (M + 400) });

  s.footer("ACORD 36 (2007/01)");
  return doc.save();
}
