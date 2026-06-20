// Faithful ACORD 25 (2016/03) — Certificate of Liability Insurance.
// Drawn + filled from a CanonicalRecord. The official fillable PDF (dropped into
// forms/ACORD_25.pdf) overrides this via the field-map path in fill.ts.

import type { CanonicalRecord, Coverage } from "../../canonical";
import { AGENCY } from "../../config";
import { LABEL, PAGE, Sheet, newDoc } from "./sheet";

const v = (f?: { value: string | null }) => f?.value ?? "";
function fmt(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso.length <= 10 ? `${iso}T00:00:00` : iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString("en-US");
}

export async function renderAcord25(record: CanonicalRecord): Promise<Uint8Array> {
  const { doc, fonts } = await newDoc();
  const s = new Sheet(doc, fonts);
  const { M, W } = PAGE;
  const R = W - M; // right edge (594)
  const FW = R - M; // 576

  s.header("CERTIFICATE OF LIABILITY INSURANCE", "ACORD 25 (2016/03)");

  // Disclaimer
  let y = 44;
  s.rect(M, y, FW, 30);
  s.paragraph(M + 3, y + 3, "THIS CERTIFICATE IS ISSUED AS A MATTER OF INFORMATION ONLY AND CONFERS NO RIGHTS UPON THE CERTIFICATE HOLDER. THIS CERTIFICATE DOES NOT AFFIRMATIVELY OR NEGATIVELY AMEND, EXTEND OR ALTER THE COVERAGE AFFORDED BY THE POLICIES BELOW. THIS CERTIFICATE OF INSURANCE DOES NOT CONSTITUTE A CONTRACT BETWEEN THE ISSUING INSURER(S), AUTHORIZED REPRESENTATIVE OR PRODUCER, AND THE CERTIFICATE HOLDER.", { size: 5.2, font: fonts.bold, maxWidth: FW - 6, lineH: 6.4, maxLines: 4 });
  y += 30;
  s.rect(M, y, FW, 26);
  s.paragraph(M + 3, y + 3, "IMPORTANT: If the certificate holder is an ADDITIONAL INSURED, the policy(ies) must have ADDITIONAL INSURED provisions or be endorsed. If SUBROGATION IS WAIVED, subject to the terms and conditions of the policy, certain policies may require an endorsement. A statement on this certificate does not confer rights to the certificate holder in lieu of such endorsement(s).", { size: 5.2, font: fonts.bold, maxWidth: FW - 6, lineH: 6.2, maxLines: 3 });
  y += 26;

  // Producer / contact / insurers / insured
  const colX = 312;
  const lw = colX - M;
  // Producer
  s.rect(M, y, lw, 54);
  s.label(M, y, "PRODUCER", lw);
  s.text(M + 3, y + 8, AGENCY.name, { size: 8, font: fonts.bold });
  s.text(M + 3, y + 18, AGENCY.address, { size: 6.4, maxWidth: lw - 6 });
  s.text(M + 3, y + 27, AGENCY.phone, { size: 6.4 });
  s.text(M + 3, y + 36, AGENCY.license, { size: 6.4 });
  // Contact block (right) — label + value inline so short rows don't collide
  const inlineCell = (x: number, top: number, w: number, label: string, value: string, labelW: number) => {
    s.rect(x, top, w, 11);
    s.text(x + 2, top + 1.6, label, { size: 4.5, font: fonts.bold, color: LABEL });
    s.text(x + labelW, top + 3.6, value, { size: 5.8, maxWidth: w - labelW - 3 });
  };
  inlineCell(colX, y, R - colX, "CONTACT NAME:", AGENCY.name, 62);
  inlineCell(colX, y + 11, 162, "PHONE (A/C, No, Ext):", AGENCY.phone, 80);
  inlineCell(colX + 162, y + 11, R - colX - 162, "FAX (A/C, No):", "", 56);
  inlineCell(colX, y + 22, R - colX, "E-MAIL ADDRESS:", AGENCY.email, 64);
  // Insurer header
  s.bar(colX, y + 33, R - colX - 40, 11, "INSURER(S) AFFORDING COVERAGE");
  s.bar(colX + (R - colX - 40), y + 33, 40, 11, "NAIC #");
  // Insured
  s.rect(M, y + 54, lw, 56);
  s.label(M, y + 54, "INSURED", lw);
  s.text(M + 3, y + 62, v(record.business.name) || v(record.named_insured), { size: 8, font: fonts.bold, maxWidth: lw - 6 });
  s.text(M + 3, y + 72, v(record.mailing_address), { size: 6.4, maxWidth: lw - 6 });
  // Insurer A..F rows
  const letters = ["A", "B", "C", "D", "E", "F"];
  const naicX = colX + (R - colX - 40);
  letters.forEach((ltr, i) => {
    const ry = y + 44 + i * 11;
    s.rect(colX, ry, R - colX - 40, 11);
    s.rect(naicX, ry, 40, 11);
    s.text(colX + 3, ry + 3, `INSURER ${ltr} :`, { size: 5.8, font: fonts.bold });
    s.text(colX + 56, ry + 3, i === 0 ? (v(record.carrier_name)) : "", { size: 6.2, maxWidth: naicX - (colX + 56) - 3 });
  });
  y += 110;

  // COVERAGES bar row
  s.rect(M, y, FW, 12);
  s.text(M + 3, y + 3.5, "COVERAGES", { size: 7.5, font: fonts.bold });
  s.text(M + 150, y + 3.5, "CERTIFICATE NUMBER:", { size: 6.5, font: fonts.bold });
  s.text(M + 360, y + 3.5, "REVISION NUMBER:", { size: 6.5, font: fonts.bold });
  s.line(M + 145, y, M + 145, y + 12); s.line(M + 355, y, M + 355, y + 12);
  y += 12;
  s.rect(M, y, FW, 20);
  s.paragraph(M + 3, y + 2, "THIS IS TO CERTIFY THAT THE POLICIES OF INSURANCE LISTED BELOW HAVE BEEN ISSUED TO THE INSURED NAMED ABOVE FOR THE POLICY PERIOD INDICATED. NOTWITHSTANDING ANY REQUIREMENT, TERM OR CONDITION OF ANY CONTRACT OR OTHER DOCUMENT WITH RESPECT TO WHICH THIS CERTIFICATE MAY BE ISSUED OR MAY PERTAIN, THE INSURANCE AFFORDED BY THE POLICIES DESCRIBED HEREIN IS SUBJECT TO ALL THE TERMS, EXCLUSIONS AND CONDITIONS OF SUCH POLICIES. LIMITS SHOWN MAY HAVE BEEN REDUCED BY PAID CLAIMS.", { size: 4.5, maxWidth: FW - 6, lineH: 5.4, maxLines: 4 });
  y += 20;

  // Table columns
  const C = { insr: M, type: M + 24, addl: M + 180, subr: M + 202, policy: M + 224, eff: M + 342, exp: M + 396, lim: M + 450 };
  const colLines = [C.type, C.addl, C.subr, C.policy, C.eff, C.exp, C.lim];
  const hh = 18;
  s.rect(M, y, FW, hh);
  s.text(C.insr + 1, y + 4, "INSR", { size: 4.6, font: fonts.bold }); s.text(C.insr + 1, y + 9.5, "LTR", { size: 4.6, font: fonts.bold });
  s.text(C.type + 30, y + 6.5, "TYPE OF INSURANCE", { size: 5.6, font: fonts.bold });
  s.text(C.addl + 1, y + 4, "ADDL", { size: 4, font: fonts.bold }); s.text(C.addl + 1, y + 9.5, "INSD", { size: 4, font: fonts.bold });
  s.text(C.subr + 1, y + 4, "SUBR", { size: 4, font: fonts.bold }); s.text(C.subr + 1, y + 9.5, "WVD", { size: 4, font: fonts.bold });
  s.text(C.policy + 30, y + 6.5, "POLICY NUMBER", { size: 5.6, font: fonts.bold });
  s.text(C.eff + 2, y + 4, "POLICY EFF", { size: 4, font: fonts.bold }); s.text(C.eff + 2, y + 9.5, "(MM/DD/YYYY)", { size: 3.6, font: fonts.bold });
  s.text(C.exp + 2, y + 4, "POLICY EXP", { size: 4, font: fonts.bold }); s.text(C.exp + 2, y + 9.5, "(MM/DD/YYYY)", { size: 3.6, font: fonts.bold });
  s.text(C.lim + 44, y + 6.5, "LIMITS", { size: 5.6, font: fonts.bold });
  colLines.forEach((x) => s.line(x, y, x, y + hh));
  y += hh;

  const cov = record.coverages ?? [];
  const find = (re: RegExp) => { const m = cov.find((c: Coverage) => re.test(v(c.name))); return m ? v(m.limit) : ""; };
  const policyNo = v(record.policy_number);
  const eff = fmt(v(record.policy_period.start));
  const exp = fmt(v(record.policy_period.end));

  const block = (insr: string, drawType: (top: number) => void, limits: { label: string; value: string }[], rows: number) => {
    const rowH = 13;
    const bh = rows * rowH;
    s.rect(M, y, FW, bh);
    colLines.forEach((x) => s.line(x, y, x, y + bh));
    if (insr) s.text(C.insr + 6, y + 4, insr, { size: 7, font: fonts.bold });
    drawType(y);
    if (insr) {
      s.text(C.policy + 3, y + 4, policyNo, { size: 6, maxWidth: C.eff - C.policy - 5 });
      s.text(C.eff + 2, y + 4, eff, { size: 5.6 });
      s.text(C.exp + 2, y + 4, exp, { size: 5.6 });
    }
    limits.forEach((lm, i) => {
      const ry = y + i * rowH;
      if (i > 0) s.line(C.lim, ry, R, ry, 0.4);
      s.paragraph(C.lim + 2, ry + 2.5, lm.label, { size: 4.3, font: fonts.bold, maxWidth: 70, lineH: 4.6, maxLines: 2 });
      const vbx = C.lim + 74;
      s.line(vbx, ry, vbx, ry + rowH, 0.4);
      s.text(vbx + 2, ry + 4, "$", { size: 6 });
      s.text(vbx + 8, ry + 4, lm.value, { size: 6, font: fonts.bold, maxWidth: R - vbx - 10 });
    });
    y += bh;
  };

  // GL
  block("A", (t) => {
    s.text(C.type + 3, t + 3, "COMMERCIAL GENERAL LIABILITY", { size: 5.6, font: fonts.bold });
    s.check(C.type + 6, t + 12, "CLAIMS-MADE", false, { labelSize: 5 });
    s.check(C.type + 70, t + 12, "OCCUR", true, { labelSize: 5 });
    s.text(C.type + 3, t + 48, "GEN'L AGGREGATE LIMIT APPLIES PER:", { size: 4.8, font: fonts.bold });
    s.check(C.type + 6, t + 56, "POLICY", true, { labelSize: 5 });
    s.check(C.type + 52, t + 56, "PROJECT", false, { labelSize: 5 });
    s.check(C.type + 104, t + 56, "LOC", false, { labelSize: 5 });
  }, [
    { label: "EACH OCCURRENCE", value: find(/each occ/i) || v(record.business.each_occurrence) },
    { label: "DAMAGE TO RENTED PREMISES (Ea occurrence)", value: find(/damage to (premises|rented)/i) },
    { label: "MED EXP (Any one person)", value: find(/med(ical)? ?(exp|expense|pay)/i) },
    { label: "PERSONAL & ADV INJURY", value: find(/personal.*(adv|advertis)/i) },
    { label: "GENERAL AGGREGATE", value: find(/general aggregate/i) || v(record.business.general_aggregate) },
    { label: "PRODUCTS - COMP/OP AGG", value: find(/products|completed/i) },
    { label: "", value: "" },
  ], 7);

  // Auto
  const autoLtr = find(/auto|combined single/i) ? "A" : "";
  block(autoLtr, (t) => {
    s.text(C.type + 3, t + 3, "AUTOMOBILE LIABILITY", { size: 5.6, font: fonts.bold });
    s.check(C.type + 6, t + 12, "ANY AUTO", false, { labelSize: 5 });
    s.check(C.type + 6, t + 22, "OWNED AUTOS ONLY", false, { labelSize: 4.6 });
    s.check(C.type + 6, t + 32, "HIRED AUTOS ONLY", false, { labelSize: 4.6 });
    s.check(C.type + 78, t + 22, "SCHEDULED AUTOS", false, { labelSize: 4.6 });
    s.check(C.type + 78, t + 32, "NON-OWNED AUTOS", false, { labelSize: 4.6 });
  }, [
    { label: "COMBINED SINGLE LIMIT (Ea accident)", value: find(/combined single|automobile|auto/i) },
    { label: "BODILY INJURY (Per person)", value: "" },
    { label: "BODILY INJURY (Per accident)", value: "" },
    { label: "PROPERTY DAMAGE (Per accident)", value: "" },
    { label: "", value: "" },
  ], 5);

  // Umbrella
  const umbLtr = find(/umbrella|excess/i) ? "A" : "";
  block(umbLtr, (t) => {
    s.check(C.type + 6, t + 4, "UMBRELLA LIAB", false, { labelSize: 5.4 });
    s.check(C.type + 6, t + 16, "EXCESS LIAB", false, { labelSize: 5.4 });
    s.check(C.type + 84, t + 4, "OCCUR", false, { labelSize: 5 });
    s.check(C.type + 84, t + 16, "CLAIMS-MADE", false, { labelSize: 5 });
    s.check(C.type + 6, t + 28, "DED", false, { labelSize: 5 });
    s.check(C.type + 50, t + 28, "RETENTION $", false, { labelSize: 5 });
  }, [
    { label: "EACH OCCURRENCE", value: find(/umbrella|excess/i) },
    { label: "AGGREGATE", value: "" },
    { label: "", value: "" },
  ], 3);

  // WC
  const wcVal = find(/workers/i);
  block(wcVal ? "A" : "", (t) => {
    s.text(C.type + 3, t + 3, "WORKERS COMPENSATION", { size: 5.4, font: fonts.bold });
    s.text(C.type + 3, t + 10, "AND EMPLOYERS' LIABILITY", { size: 5.4, font: fonts.bold });
    s.text(C.type + 3, t + 20, "ANY PROPRIETOR/PARTNER/EXECUTIVE", { size: 4, });
    s.text(C.type + 3, t + 26, "OFFICER/MEMBER EXCLUDED?", { size: 4 });
    s.text(C.type + 3, t + 38, "If yes, describe under", { size: 4 });
    s.text(C.type + 3, t + 44, "DESCRIPTION OF OPERATIONS below", { size: 4 });
  }, [
    { label: "PER STATUTE / OTHER", value: /statut/i.test(wcVal) ? "STATUTORY" : "" },
    { label: "E.L. EACH ACCIDENT", value: "" },
    { label: "E.L. DISEASE - EA EMPLOYEE", value: "" },
    { label: "E.L. DISEASE - POLICY LIMIT", value: "" },
  ], 4);

  // Description of operations
  s.rect(M, y, FW, 46);
  s.label(M, y, "DESCRIPTION OF OPERATIONS / LOCATIONS / VEHICLES (ACORD 101, Additional Remarks Schedule, may be attached if more space is required)", FW);
  s.paragraph(M + 3, y + 9, v(record.business.description) || "Certificate issued as evidence of coverage.", { size: 6.4, maxWidth: FW - 6, lineH: 8, maxLines: 4 });
  y += 46;

  // Certificate holder + cancellation
  const half = FW / 2;
  s.bar(M, y, half, 12, "CERTIFICATE HOLDER");
  s.bar(M + half, y, half, 12, "CANCELLATION");
  y += 12;
  s.rect(M, y, half, 78);
  s.rect(M + half, y, half, 78);
  s.paragraph(M + half + 4, y + 5, "SHOULD ANY OF THE ABOVE DESCRIBED POLICIES BE CANCELLED BEFORE THE EXPIRATION DATE THEREOF, NOTICE WILL BE DELIVERED IN ACCORDANCE WITH THE POLICY PROVISIONS.", { size: 5.4, font: fonts.bold, maxWidth: half - 8, lineH: 6.6, maxLines: 4 });
  s.text(M + half + 4, y + 52, "AUTHORIZED REPRESENTATIVE", { size: 5.4, font: fonts.bold });
  s.line(M + half + 60, y + 70, M + FW - 6, y + 70, 0.5);
  s.text(M + half + 62, y + 62, AGENCY.name, { size: 8, font: fonts.obl });

  s.footer("ACORD 25 (2016/03)");
  return doc.save();
}
