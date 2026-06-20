// Extraction acceptance self-check (BUILD_SPEC §16). Runs every sample's
// canonical builder and asserts the anchor fields. Run: npm run test:extraction
import { SAMPLE_BY_ID } from "../lib/samples";

let pass = 0;
let fail = 0;
function check(id, label, cond) {
  if (cond) { pass++; console.log(`  ✓ ${id} ${label}`); }
  else { fail++; console.log(`  ✗ ${id} ${label}`); }
}
const rec = (id) => SAMPLE_BY_ID[id].build();
const cov = (r, needle) => r.coverages.some((c) => (c.limit.value || "").includes(needle) || (c.name.value || "").includes(needle));

// 01 — Pacific Crest personal auto
{
  const r = rec("01");
  check("01", "doc_type personal_auto_dec", r.doc_type === "personal_auto_dec");
  check("01", 'carrier "Pacific Crest Mutual"', r.carrier_name.value === "Pacific Crest Mutual");
  check("01", "policy PA-CA-7741920", r.policy_number.value === "PA-CA-7741920");
  check("01", "2 vehicles incl VIN 2T3W1RFV5MW123456", r.vehicles.length === 2 && r.vehicles.some((v) => v.vin.value === "2T3W1RFV5MW123456"));
  check("01", "premium $1,842.00", r.premium_total.value === "$1,842.00");
}
// 02 — Sierra Vista homeowners
{
  const r = rec("02");
  check("02", "doc_type homeowners_dec", r.doc_type === "homeowners_dec");
  check("02", 'carrier contains "Sierra Vista"', (r.carrier_name.value || "").includes("Sierra Vista"));
  check("02", "Cov A $485,000", r.property.coverage_a.value === "$485,000");
  check("02", "deductible $2,500", r.property.deductible.value === "$2,500");
  check("02", "mortgagee Desert Sun Credit Union", (r.property.mortgagee.value || "").includes("Desert Sun Credit Union"));
}
// 03 — driver license
{
  const r = rec("03");
  check("03", "doc_type drivers_license", r.doc_type === "drivers_license");
  check("03", "name Maria Elena Gutierrez", r.id_document.full_name.value === "Maria Elena Gutierrez");
  check("03", "DL D1234567", r.id_document.license_number.value === "D1234567");
  check("03", "DOB 1985-07-14", r.id_document.dob.value === "1985-07-14");
  check("03", "exp 2027-07-14", r.id_document.expiration.value === "2027-07-14");
}
// 04 — vehicle registration
{
  const r = rec("04");
  check("04", "doc_type vehicle_registration", r.doc_type === "vehicle_registration");
  check("04", "VIN 2T3W1RFV5MW123456", r.vehicles.some((v) => v.vin.value === "2T3W1RFV5MW123456"));
  check("04", "2021 Toyota RAV4", r.vehicles.some((v) => v.year.value === "2021" && v.make.value === "Toyota" && (v.model.value || "").includes("RAV4")));
}
// 05 — ACORD 25 cert
{
  const r = rec("05");
  check("05", "doc_type acord_certificate", r.doc_type === "acord_certificate");
  check("05", "insured Desert Bloom Landscaping LLC", r.business.name.value === "Desert Bloom Landscaping LLC");
  check("05", "GL each occ $1,000,000", r.business.each_occurrence.value === "$1,000,000");
}
// 06 — Granite Peak commercial GL
{
  const r = rec("06");
  check("06", "doc_type commercial_gl_dec", r.doc_type === "commercial_gl_dec");
  check("06", 'carrier contains "Granite Peak"', (r.carrier_name.value || "").includes("Granite Peak"));
  check("06", "policy CGL-GP-5519082", r.policy_number.value === "CGL-GP-5519082");
  check("06", "gen agg $2,000,000", r.business.general_aggregate.value === "$2,000,000");
  check("06", "premium $4,250.00", r.premium_total.value === "$4,250.00");
}
// 07 — Medicare supplement Plan G
{
  const r = rec("07");
  check("07", "doc_type medicare_supplement", r.doc_type === "medicare_supplement");
  check("07", "plan G", cov(r, "Plan G"));
  check("07", "member GSS-44820915", r.policy_number.value === "GSS-44820915");
  check("07", "premium $148.50/mo", r.premium_total.value === "$148.50/mo");
}
// 08 — Coachella Valley prior auto
{
  const r = rec("08");
  check("08", "doc_type prior_auto_dec", r.doc_type === "prior_auto_dec");
  check("08", 'carrier "Coachella Valley Mutual"', r.carrier_name.value === "Coachella Valley Mutual");
  check("08", "BI 50/100", cov(r, "$50,000 / $100,000"));
  check("08", "premium $2,040.00", r.premium_total.value === "$2,040.00");
}

console.log(`\nExtraction acceptance: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
