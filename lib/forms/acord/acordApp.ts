// ACORD-styled application renderers for personal auto (ACORD 90) and homeowner
// (ACORD 80), plus a generic supplement renderer driven by a field-map. These
// use the same header/footer/cell engine so output is consistent ACORD format.

import { type CanonicalRecord, getPath } from "../../canonical";
import { AGENCY } from "../../config";
import { PAGE, Sheet, newDoc } from "./sheet";

const v = (f?: { value: string | null }) => f?.value ?? "";
function fmt(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso.length <= 10 ? `${iso}T00:00:00` : iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString("en-US");
}

function agencyApplicant(s: Sheet, record: CanonicalRecord, y: number, applicantLabel: string): number {
  const { M, W } = PAGE;
  const R = W - M;
  const cx = 306;
  s.rect(M, y, cx - M, 44);
  s.label(M, y, "AGENCY", cx - M);
  s.text(M + 4, y + 9, AGENCY.name, { size: 7.5, font: s.f.bold });
  s.text(M + 4, y + 18, AGENCY.address, { size: 6.4 });
  s.text(M + 4, y + 27, `${AGENCY.phone} · ${AGENCY.license}`, { size: 6.4 });
  s.rect(cx, y, R - cx, 44);
  s.label(cx, y, applicantLabel, R - cx);
  s.text(cx + 4, y + 10, v(record.named_insured) || v(record.business.name), { size: 8, font: s.f.bold });
  s.text(cx + 4, y + 22, v(record.mailing_address), { size: 6.6, maxWidth: R - cx - 8 });
  y += 44;
  s.cell(M, y, (cx - M), 16, "CURRENT CARRIER", v(record.carrier_name), { valueSize: 7 });
  s.cell(cx, y, (R - cx) / 3, 16, "POLICY NUMBER", v(record.policy_number), { valueSize: 7 });
  s.cell(cx + (R - cx) / 3, y, (R - cx) / 3, 16, "EFFECTIVE", fmt(v(record.policy_period.start)), { valueSize: 7 });
  s.cell(cx + (2 * (R - cx)) / 3, y, (R - cx) / 3, 16, "EXPIRATION", fmt(v(record.policy_period.end)), { valueSize: 7 });
  return y + 16;
}

function table(s: Sheet, y: number, cols: { label: string; w: number }[], rows: string[][], minRows: number): number {
  const { M } = PAGE;
  let hx = M;
  cols.forEach((c) => { s.bar(hx, y, c.w, 13, c.label); hx += c.w; });
  y += 13;
  const total = Math.max(rows.length, minRows);
  for (let r = 0; r < total; r++) {
    let rx = M;
    cols.forEach((c, ci) => {
      s.rect(rx, y, c.w, 15);
      const val = rows[r]?.[ci];
      if (val) s.text(rx + 3, y + 4.5, val, { size: 7, maxWidth: c.w - 6 });
      rx += c.w;
    });
    y += 15;
  }
  return y;
}

export async function renderAcord90(record: CanonicalRecord): Promise<Uint8Array> {
  const { doc, fonts } = await newDoc();
  const s = new Sheet(doc, fonts);
  const { M, W } = PAGE;
  const FW = W - 2 * M;
  s.header("PERSONAL AUTO APPLICATION", "ACORD 90");
  let y = 46;
  y = agencyApplicant(s, record, y, "APPLICANT (NAMED INSURED) AND MAILING ADDRESS") + 8;

  s.text(M, y, "DRIVERS", { size: 8, font: fonts.bold }); y += 11;
  y = table(s, y,
    [{ label: "DRIVER NAME", w: 240 }, { label: "DATE OF BIRTH", w: 150 }, { label: "DRIVER LICENSE NUMBER", w: FW - 390 }],
    record.drivers.map((d) => [v(d.name), fmt(v(d.dob)), v(d.license_number)]), 3) + 8;

  s.text(M, y, "VEHICLES", { size: 8, font: fonts.bold }); y += 11;
  y = table(s, y,
    [{ label: "YEAR", w: 50 }, { label: "MAKE", w: 110 }, { label: "MODEL", w: 130 }, { label: "VEHICLE IDENTIFICATION NUMBER (VIN)", w: 196 }, { label: "USE", w: FW - 486 }],
    record.vehicles.map((veh) => [v(veh.year), v(veh.make), v(veh.model), v(veh.vin), ""]), 3) + 8;

  s.text(M, y, "COVERAGES", { size: 8, font: fonts.bold }); y += 11;
  y = table(s, y,
    [{ label: "COVERAGE", w: 220 }, { label: "LIMIT", w: 150 }, { label: "DEDUCTIBLE", w: 90 }, { label: "PREMIUM", w: FW - 460 }],
    record.coverages.map((c) => [v(c.name), v(c.limit), v(c.deductible), v(c.premium)]), 4);

  s.footer("ACORD 90 (Personal Auto Application)");
  return doc.save();
}

export async function renderAcord80(record: CanonicalRecord): Promise<Uint8Array> {
  const { doc, fonts } = await newDoc();
  const s = new Sheet(doc, fonts);
  const { M, W } = PAGE;
  const R = W - M;
  const FW = R - M;
  s.header("HOMEOWNER APPLICATION", "ACORD 80");
  let y = 46;
  y = agencyApplicant(s, record, y, "APPLICANT (NAMED INSURED) AND MAILING ADDRESS") + 8;

  s.text(M, y, "DWELLING", { size: 8, font: fonts.bold }); y += 11;
  s.cell(M, y, FW, 16, "PROPERTY ADDRESS", v(record.property.address) || v(record.mailing_address), { valueSize: 7.5 });
  y += 16;
  s.cell(M, y, FW / 3, 16, "YEAR BUILT", v(record.property.year_built), { valueSize: 7.5 });
  s.cell(M + FW / 3, y, FW / 3, 16, "CONSTRUCTION", v(record.property.construction), { valueSize: 7.5 });
  s.cell(M + (2 * FW) / 3, y, FW / 3, 16, "PROTECTION CLASS", "", { valueSize: 7.5 });
  y += 16;
  s.cell(M, y, FW / 4, 18, "COVERAGE A (DWELLING)", v(record.property.coverage_a), { valueSize: 7.5, bold: true });
  s.cell(M + FW / 4, y, FW / 4, 18, "COVERAGE C (CONTENTS)", v(record.property.coverage_c), { valueSize: 7.5 });
  s.cell(M + FW / 2, y, FW / 4, 18, "PERSONAL LIABILITY", v(record.property.liability), { valueSize: 7.5 });
  s.cell(M + (3 * FW) / 4, y, FW / 4, 18, "DEDUCTIBLE", v(record.property.deductible), { valueSize: 7.5 });
  y += 18;
  s.cell(M, y, FW, 18, "MORTGAGEE", v(record.property.mortgagee), { valueSize: 7.5 });
  y += 26;

  s.text(M, y, "COVERAGES", { size: 8, font: fonts.bold }); y += 11;
  table(s, y,
    [{ label: "COVERAGE", w: 260 }, { label: "LIMIT", w: 160 }, { label: "DEDUCTIBLE / PREMIUM", w: FW - 420 }],
    record.coverages.map((c) => [v(c.name), v(c.limit), [v(c.deductible), v(c.premium)].filter(Boolean).join(" / ")]), 6);

  s.footer("ACORD 80 (Homeowner Application)");
  return doc.save();
}

function humanize(s: string): string {
  return s.replace(/_/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2").replace(/([0-9])([A-Z])/g, "$1 $2");
}

// Generic supplement: title + a grid of label/value cells from the field-map.
export async function renderSupplement(title: string, formNo: string, record: CanonicalRecord, fields: Record<string, string>): Promise<Uint8Array> {
  const { doc, fonts } = await newDoc();
  const s = new Sheet(doc, fonts);
  const { M, W } = PAGE;
  const FW = W - 2 * M;
  s.header(title, formNo);
  let y = 50;
  s.bar(M, y, FW, 12, "APPLICANT / RISK INFORMATION");
  y += 12;
  const entries = Object.entries(fields);
  const colW = FW / 2;
  entries.forEach(([pdfField, path], i) => {
    const x = M + (i % 2) * colW;
    const raw = getPath(record, path);
    s.cell(x, y, colW, 22, humanize(pdfField), raw == null ? "" : String(raw), { valueSize: 7.5 });
    if (i % 2 === 1) y += 22;
  });
  if (entries.length % 2 === 1) y += 22;
  s.footer(formNo);
  return doc.save();
}
