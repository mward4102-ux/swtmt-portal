// Faithful ACORD 37 (1/96) — Statement of No Loss. Drawn + filled from canonical.

import type { CanonicalRecord } from "../../canonical";
import { AGENCY } from "../../config";
import { LABEL, PAGE, Sheet, newDoc } from "./sheet";

const v = (f?: { value: string | null }) => f?.value ?? "";

export async function renderAcord37(record: CanonicalRecord): Promise<Uint8Array> {
  const { doc, fonts } = await newDoc();
  const s = new Sheet(doc, fonts);
  const { M, W } = PAGE;
  const R = W - M;
  const FW = R - M;

  // Header
  s.rect(M, M, FW, 26);
  s.text(M + 6, M + 8, "ACORD", { size: 13, font: fonts.bold });
  s.text(M + 50, M + 13, "TM", { size: 4.5, font: fonts.bold });
  s.text(M + 90, M + 6, "STATEMENT OF NO LOSS", { size: 15, font: fonts.bold });

  let y = M + 26;
  const cx = 306;
  // Producer (left)
  s.rect(M, y, cx - M, 56);
  s.label(M, y, "PRODUCER", cx - M);
  s.text(M + 4, y + 9, AGENCY.name, { size: 7.5, font: fonts.bold });
  s.text(M + 4, y + 18, AGENCY.address, { size: 6.4 });
  s.text(M + 4, y + 27, AGENCY.phone, { size: 6.4 });
  s.cell(M, y + 56, (cx - M) / 2, 14, "CODE:", "");
  s.cell(M + (cx - M) / 2, y + 56, (cx - M) / 2, 14, "SUBCODE:", "");
  // Right
  s.cell(cx, y, (R - cx) * 0.55, 22, "INSURED'S NAME", v(record.business.name) || v(record.named_insured), { valueSize: 7.5, bold: true });
  s.cell(cx + (R - cx) * 0.55, y, (R - cx) * 0.45, 22, "TELEPHONE NUMBER", record.id_document ? "" : "", {});
  s.cell(cx, y + 22, R - cx, 16, "COMPANY:", v(record.carrier_name), { valueSize: 7 });
  s.cell(cx, y + 38, R - cx, 16, "APPROVED BY:", "");
  s.cell(cx, y + 54, R - cx, 16, "POLICY #", v(record.policy_number), { valueSize: 7.5, bold: true });
  y += 80;

  // Body certification
  s.line(M, y, R, y, 1.2);
  y += 24;
  const body = [
    "I CERTIFY THAT THERE HAVE BEEN NO LOSSES, ACCIDENTS OR",
    "CIRCUMSTANCES THAT MIGHT GIVE RISE TO A CLAIM UNDER",
    "THE INSURANCE POLICY WHOSE NUMBER IS SHOWN ABOVE,",
  ];
  body.forEach((ln, i) => s.text(M, y + i * 22, ln, { size: 15, font: fonts.bold, align: "c", w: FW }));
  y += body.length * 22;
  // "FROM 12:01 AM ON [date] TO [date/time]"
  s.text(M + 10, y + 4, "FROM 12:01 AM ON", { size: 14, font: fonts.bold });
  s.line(M + 200, y + 18, M + 345, y + 18, 0.8);
  s.text(M + 206, y + 3, fmtDate(v(record.policy_period.end)), { size: 11 });
  s.text(M + 360, y + 4, "TO", { size: 14, font: fonts.bold });
  s.line(M + 395, y + 18, R - 15, y + 18, 0.8);
  s.text(M + 200, y + 24, "CANCELLATION DATE", { size: 6, color: LABEL, align: "c", w: 145 });
  s.text(M + 395, y + 24, "DATE AND TIME SIGNED", { size: 6, color: LABEL, align: "c", w: R - 15 - (M + 395) });
  y += 56;

  // Applicant signature
  s.line(M + 150, y + 14, R - 150, y + 14, 0.8);
  s.text(M, y + 18, "APPLICANT'S SIGNATURE", { size: 7, font: fonts.bold, align: "c", w: FW });
  y += 50;

  // Receipt
  s.text(M, y, "RECEIPT", { size: 13, font: fonts.bold, align: "c", w: FW });
  y += 30;
  s.text(M + 30, y, "$", { size: 10, font: fonts.bold });
  s.line(M + 42, y + 12, M + 180, y + 12, 0.8);
  s.text(M + 195, y, "AMOUNT RECEIVED BY:", { size: 8, font: fonts.bold });
  s.line(M + 320, y + 12, R - 20, y + 12, 0.8);
  s.text(M + 340, y + 18, "PRODUCER", { size: 6, color: LABEL });
  y += 44;
  s.line(M + 20, y + 12, M + 260, y + 12, 0.8);
  s.text(M + 90, y + 18, "WITNESS", { size: 6.5, color: LABEL });
  s.line(M + 320, y + 12, R - 20, y + 12, 0.8);
  s.text(M + 380, y + 18, "DATE AND TIME", { size: 6.5, color: LABEL });

  // Footer
  const top = PAGE.H - M - 8;
  s.line(M, top - 4, R, top - 4, 1);
  s.text(M, top, "ACORD 37 (1/96)", { size: 7, font: fonts.bold });
  s.text(M, top, "© ACORD CORPORATION 1996", { size: 6, color: LABEL, align: "r", w: FW });
  return doc.save();
}

function fmtDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso.length <= 10 ? `${iso}T00:00:00` : iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString("en-US");
}
