// Faithful ACORD 125 (2016/03) — Commercial Insurance Application.
// Page 1: Applicant Information Section. Page 2: General Information.
// Drawn + filled from a CanonicalRecord; official PDF overrides via fill.ts.

import type { CanonicalRecord } from "../../canonical";
import { AGENCY } from "../../config";
import { LABEL, PAGE, Sheet, newDoc } from "./sheet";

const v = (f?: { value: string | null }) => f?.value ?? "";
function fmt(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso.length <= 10 ? `${iso}T00:00:00` : iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString("en-US");
}

const LINES = [
  ["BOILER & MACHINERY", "CYBER AND PRIVACY", "YACHT"],
  ["BUSINESS AUTO", "FIDUCIARY LIABILITY", ""],
  ["BUSINESS OWNERS", "GARAGE AND DEALERS", ""],
  ["COMMERCIAL GENERAL LIABILITY", "LIQUOR LIABILITY", ""],
  ["COMMERCIAL INLAND MARINE", "MOTOR CARRIER", ""],
  ["COMMERCIAL PROPERTY", "TRUCKERS", ""],
  ["CRIME", "UMBRELLA", ""],
];

const ATTACHMENTS = [
  ["ACCOUNTS RECEIVABLE / VALUABLE PAPERS", "GLASS AND SIGN SECTION", "STATEMENT / SCHEDULE OF VALUES"],
  ["ADDITIONAL INTEREST SCHEDULE", "HOTEL / MOTEL SUPPLEMENT", "STATE SUPPLEMENT (If applicable)"],
  ["ADDITIONAL PREMISES INFORMATION SCHEDULE", "INSTALLATION / BUILDERS RISK SECTION", "VACANT BUILDING SUPPLEMENT"],
  ["APARTMENT BUILDING SUPPLEMENT", "INTERNATIONAL LIABILITY EXPOSURE SUPP", "VEHICLE SCHEDULE"],
  ["CONDO ASSN BYLAWS (for D&O Coverage only)", "INTERNATIONAL PROPERTY EXPOSURE SUPP", ""],
  ["CONTRACTORS SUPPLEMENT", "LOSS SUMMARY", ""],
  ["COVERAGES SCHEDULE", "OPEN CARGO SECTION", ""],
  ["DEALERS SECTION", "PREMIUM PAYMENT SUPPLEMENT", ""],
  ["DRIVER INFORMATION SCHEDULE", "PROFESSIONAL LIABILITY SUPPLEMENT", ""],
  ["ELECTRONIC DATA PROCESSING SECTION", "RESTAURANT / TAVERN SUPPLEMENT", ""],
];

const GENERAL_QUESTIONS = [
  "ANY MEDICAL FACILITIES PROVIDED OR MEDICAL PROFESSIONALS EMPLOYED OR CONTRACTED?",
  "ANY EXPOSURE TO RADIOACTIVE/NUCLEAR MATERIALS?",
  "DO/HAVE PAST, PRESENT OR DISCONTINUED OPERATIONS INVOLVE(D) STORING, TREATING, DISCHARGING, APPLYING, DISPOSING, OR TRANSPORTING OF HAZARDOUS MATERIAL? (e.g. landfills, wastes, fuel tanks, etc)",
  "ANY OPERATIONS SOLD, ACQUIRED, OR DISCONTINUED IN LAST FIVE (5) YEARS?",
  "DO YOU RENT OR LOAN EQUIPMENT TO OTHERS?",
  "ANY WATERCRAFT, DOCKS, FLOATS OWNED, HIRED OR LEASED?",
  "ANY PARKING FACILITIES OWNED/RENTED?",
  "IS A FEE CHARGED FOR PARKING?",
  "RECREATION FACILITIES PROVIDED?",
  "ARE THERE ANY LODGING OPERATIONS INCLUDING APARTMENTS?",
  "IS THERE A SWIMMING POOL ON PREMISES?",
  "ARE SOCIAL EVENTS SPONSORED?",
  "ARE ATHLETIC TEAMS SPONSORED?",
  "ANY STRUCTURAL ALTERATIONS CONTEMPLATED?",
  "ANY DEMOLITION EXPOSURE CONTEMPLATED?",
];

export async function renderAcord125(record: CanonicalRecord): Promise<Uint8Array> {
  const { doc, fonts } = await newDoc();
  const s = new Sheet(doc, fonts);
  const { M, W } = PAGE;
  const R = W - M;
  const FW = R - M;

  // ── Page 1: Applicant Information ──────────────────────────────────────────
  // Header
  s.rect(M, M, 74, 30);
  s.text(M + 6, M + 9, "ACORD", { size: 15, font: fonts.bold });
  s.text(M + 60, M + 9, "®", { size: 5, font: fonts.bold });
  s.text(M + 80, M + 4, "COMMERCIAL INSURANCE APPLICATION", { size: 12.5, font: fonts.bold, align: "c", w: R - 96 - (M + 80) });
  s.text(M + 80, M + 19, "APPLICANT INFORMATION SECTION", { size: 8, font: fonts.bold, align: "c", w: R - 96 - (M + 80) });
  s.cell(R - 92, M, 92, 30, "DATE (MM/DD/YYYY)", new Date().toLocaleDateString("en-US"));

  let y = 48;
  const cx = 378; // left/right split
  // AGENCY
  s.rect(M, y, cx - M, 68);
  s.label(M, y, "AGENCY", cx - M);
  s.text(M + 3, y + 9, AGENCY.name, { size: 8, font: fonts.bold });
  s.text(M + 3, y + 19, AGENCY.address, { size: 6.6 });
  s.text(M + 3, y + 28, `${AGENCY.phone} · ${AGENCY.license}`, { size: 6.6 });
  // CARRIER / NAIC / program / policy
  s.cell(cx, y, 144, 28, "CARRIER", v(record.carrier_name), { valueSize: 7 });
  s.cell(cx + 144, y, R - cx - 144, 28, "NAIC CODE", "");
  s.cell(cx, y + 28, 132, 20, "COMPANY POLICY OR PROGRAM NAME", "");
  s.cell(cx + 132, y + 28, R - cx - 132, 20, "PROGRAM CODE", "");
  s.cell(cx, y + 48, R - cx, 20, "POLICY NUMBER", v(record.policy_number), { valueSize: 7 });
  y += 68;

  // Contact (left) + underwriter/status (right)
  const inl = (x: number, top: number, w: number, h: number, label: string, value: string, lw: number) => {
    s.rect(x, top, w, h);
    s.text(x + 2, top + 1.6, label, { size: 4.4, font: fonts.bold, color: LABEL });
    s.text(x + lw, top + (h - 5.8) / 2, value, { size: 5.8, maxWidth: w - lw - 3 });
  };
  inl(M, y, cx - M, 11, "CONTACT NAME:", AGENCY.name, 56);
  inl(M, y + 11, cx - M, 11, "PHONE (A/C, No, Ext):", AGENCY.phone, 72);
  inl(M, y + 22, cx - M, 11, "FAX (A/C, No):", "", 56);
  inl(M, y + 33, cx - M, 11, "E-MAIL ADDRESS:", AGENCY.email, 64);
  inl(M, y + 44, (cx - M) / 2, 11, "CODE:", "", 28);
  inl(M + (cx - M) / 2, y + 44, (cx - M) / 2, 11, "SUBCODE:", "", 38);
  inl(M, y + 55, cx - M, 11, "AGENCY CUSTOMER ID:", "", 78);
  // right
  s.cell(cx, y, (R - cx) / 2, 18, "UNDERWRITER", "");
  s.cell(cx + (R - cx) / 2, y, (R - cx) / 2, 18, "UNDERWRITER OFFICE", "");
  s.rect(cx, y + 18, R - cx, 48);
  s.label(cx, y + 18, "STATUS OF TRANSACTION", R - cx);
  s.check(cx + 4, y + 27, "QUOTE", true, { labelSize: 5.4 });
  s.check(cx + 70, y + 27, "ISSUE POLICY", false, { labelSize: 5.4 });
  s.check(cx + 140, y + 27, "RENEW", false, { labelSize: 5.4 });
  s.check(cx + 4, y + 38, "BOUND (Give Date and/or Attach Copy)", false, { labelSize: 4.8 });
  s.check(cx + 4, y + 49, "CHANGE", false, { labelSize: 5.4 });
  s.check(cx + 70, y + 49, "CANCEL", false, { labelSize: 5.4 });
  y += 66;

  // LINES OF BUSINESS
  s.text(M, y, "LINES OF BUSINESS", { size: 8, font: fonts.bold });
  y += 10;
  const colW = FW / 3;
  // header row
  for (let c = 0; c < 3; c++) {
    s.cell(M + c * colW, y, colW - 52, 11, "", "INDICATE LINES OF BUSINESS", { valueSize: 5, bold: true });
    s.cell(M + c * colW + colW - 52, y, 52, 11, "", "PREMIUM", { valueSize: 5, bold: true });
  }
  y += 11;
  LINES.forEach((row, r) => {
    row.forEach((name, c) => {
      const x = M + c * colW;
      s.rect(x, y, colW - 52, 12);
      s.rect(x + colW - 52, y, 52, 12);
      if (name) {
        s.check(x + 3, y + 3.5, "", name === "COMMERCIAL GENERAL LIABILITY");
        s.text(x + 12, y + 3.5, name, { size: 5.2, font: fonts.bold, maxWidth: colW - 52 - 14 });
        s.text(x + colW - 50, y + 3.5, "$", { size: 6 });
        if (name === "COMMERCIAL GENERAL LIABILITY") s.text(x + colW - 44, y + 3.5, v(record.premium_total), { size: 6, font: fonts.bold });
      }
    });
    y += 12;
  });

  // ATTACHMENTS
  s.text(M, y + 1, "ATTACHMENTS", { size: 8, font: fonts.bold });
  y += 11;
  ATTACHMENTS.forEach((row) => {
    row.forEach((name, c) => {
      const x = M + c * colW;
      s.rect(x, y, colW, 11);
      if (name) {
        s.check(x + 3, y + 3, "", false);
        s.text(x + 12, y + 3, name, { size: 4.8, maxWidth: colW - 14 });
      }
    });
    y += 11;
  });

  // POLICY INFORMATION
  s.text(M, y + 1, "POLICY INFORMATION", { size: 8, font: fonts.bold });
  y += 11;
  const pcols = [
    { label: "PROPOSED EFF DATE", value: fmt(v(record.policy_period.start)), w: 66 },
    { label: "PROPOSED EXP DATE", value: fmt(v(record.policy_period.end)), w: 66 },
    { label: "BILLING PLAN", value: "", w: 70 },
    { label: "PAYMENT PLAN", value: "", w: 64 },
    { label: "METHOD OF PAYMENT", value: "", w: 70 },
    { label: "AUDIT", value: "", w: 40 },
    { label: "DEPOSIT", value: "", w: 50 },
    { label: "MINIMUM PREMIUM", value: "", w: 56 },
    { label: "POLICY PREMIUM", value: v(record.premium_total), w: FW - (66 + 66 + 70 + 64 + 70 + 40 + 50 + 56) },
  ];
  let px = M;
  pcols.forEach((c) => {
    s.cell(px, y, c.w, 26, c.label, c.value, { valueSize: 6.5 });
    px += c.w;
  });
  y += 26;

  // APPLICANT INFORMATION
  s.text(M, y + 1, "APPLICANT INFORMATION", { size: 8, font: fonts.bold });
  y += 11;
  const applicantBlock = (top: number, name: string, addr: string, entity: string) => {
    const nameW = 372;
    s.rect(M, top, nameW, 56);
    s.label(M, top, "NAME (First Named Insured) AND MAILING ADDRESS (including ZIP+4)", nameW);
    if (name) s.text(M + 4, top + 12, name, { size: 9, font: fonts.bold });
    if (addr) s.paragraph(M + 4, top + 24, addr, { size: 7, maxWidth: nameW - 8, lineH: 9, maxLines: 3 });
    // right info cells
    const rx = M + nameW;
    const rw = R - rx;
    s.cell(rx, top, rw / 4, 14, "GL CODE", "");
    s.cell(rx + rw / 4, top, rw / 4, 14, "SIC", "");
    s.cell(rx + rw / 2, top, rw / 4, 14, "NAICS", "");
    s.cell(rx + (3 * rw) / 4, top, rw / 4, 14, "FEIN OR SOC SEC #", "");
    s.cell(rx, top + 14, rw, 14, "BUSINESS PHONE #:", "");
    s.cell(rx, top + 28, rw, 28, "WEBSITE ADDRESS", "");
    // entity row
    const ey = top + 56;
    s.rect(M, ey, FW, 20);
    const ents = ["CORPORATION", "INDIVIDUAL", "JOINT VENTURE", "LLC", "NOT FOR PROFIT ORG", "PARTNERSHIP", "SUBCHAPTER \"S\" CORP", "TRUST"];
    const ew = FW / ents.length;
    ents.forEach((e, i) => {
      const on = matchEntity(entity, e);
      s.check(M + i * ew + 3, ey + 7, "", on);
      s.text(M + i * ew + 12, ey + 7, e, { size: 4.6, font: fonts.bold, maxWidth: ew - 14 });
    });
    return ey + 20;
  };
  y = applicantBlock(y, v(record.business.name) || v(record.named_insured), v(record.mailing_address), v(record.business.entity_type));
  y = applicantBlock(y + 2, "", "", ""); // Other Named Insured (blank)

  s.footer("ACORD 125 (2016/03)", { page: "Page 1 of 4" });

  // ── Page 2: General Information ────────────────────────────────────────────
  s.newPage();
  s.text(M, M, "GENERAL INFORMATION", { size: 9, font: fonts.bold });
  let gy = M + 12;
  s.rect(M, gy, FW - 28, 11, { fill: undefined });
  s.text(M + 3, gy + 3, "EXPLAIN ALL \"YES\" RESPONSES (For all past or present operations)", { size: 5.4, font: fonts.bold });
  s.rect(M + FW - 28, gy, 28, 11);
  s.text(M + FW - 24, gy + 3, "Y / N", { size: 5.4, font: fonts.bold });
  gy += 11;
  const rowH = 42;
  GENERAL_QUESTIONS.forEach((q, i) => {
    s.rect(M, gy, FW - 28, rowH);
    s.rect(M + FW - 28, gy, 28, rowH);
    s.paragraph(M + 4, gy + 4, `${i + 1}.  ${q}`, { size: 6, font: fonts.bold, maxWidth: FW - 36, lineH: 7.5, maxLines: 3 });
    s.text(M + FW - 20, gy + 4, "N", { size: 7, font: fonts.bold });
    gy += rowH;
  });
  s.footer("ACORD 125 (2016/03)", { page: "Page 2 of 4" });

  return doc.save();
}

function matchEntity(entity: string, label: string): boolean {
  const e = entity.toLowerCase();
  if (!e) return false;
  if (label === "LLC") return /llc|limited liability/.test(e);
  if (label === "CORPORATION") return /^c-?corp|corporation/.test(e) && !/sub|s-/.test(e);
  if (label.includes("\"S\"")) return /s-corp|subchapter/.test(e);
  if (label === "PARTNERSHIP") return /partnership/.test(e);
  if (label === "INDIVIDUAL") return /individual|sole/.test(e);
  if (label === "TRUST") return /trust/.test(e);
  return false;
}
