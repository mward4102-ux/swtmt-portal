// Dev utility: render every ACORD form from seed data to /tmp/acord for visual
// QA. Run: node --import tsx scripts/render-acord.mjs
import { writeFileSync, mkdirSync } from "node:fs";
import { getFormMap } from "../lib/forms/maps.ts";
import { renderForm } from "../lib/forms/acord/index.ts";
import { buildCanonicalForLine } from "../lib/forms/plan.ts";
import { SAMPLE_BY_ID } from "../lib/samples.ts";

mkdirSync("/tmp/acord", { recursive: true });
const d = (docType, id) => ({ docType, record: SAMPLE_BY_ID[id].build() });

const commercial = buildCanonicalForLine([d("commercial_gl_dec", "06"), d("acord_certificate", "05")], "commercial");
const auto = buildCanonicalForLine([d("personal_auto_dec", "01"), d("drivers_license", "03"), d("vehicle_registration", "04")], "personal_auto");
const home = buildCanonicalForLine([d("homeowners_dec", "02")], "homeowners");

const jobs = [
  ["ACORD_25", commercial], ["ACORD_125", commercial], ["GranitePeak_GL_Supplement", commercial],
  ["ACORD_37", commercial], ["ACORD_36", commercial],
  ["ACORD_90_PersonalAuto", auto], ["ACORD_80_Homeowners", home],
];

for (const [id, rec] of jobs) {
  const map = await getFormMap(id);
  if (!map) { console.log("NO MAP", id); continue; }
  const bytes = await renderForm(map, rec);
  writeFileSync(`/tmp/acord/${id}.pdf`, Buffer.from(bytes));
  console.log("wrote", id, bytes.length, "bytes");
}
