// Carrier matcher (BUILD_SPEC §7b). Given line + carrier + state, return the
// ordered list of form maps to fill: ACORD base forms first (the universal
// layer most carriers accept), then any per-carrier supplements.

import { type FormMap, loadFormMaps } from "./maps";

function carrierMatches(map: FormMap, carrier: string): boolean {
  if (!map.applies_to.carriers?.length) return false;
  const c = carrier.toLowerCase();
  return map.applies_to.carriers.some((mc) => {
    const m = mc.toLowerCase();
    return c.includes(m) || m.includes(c);
  });
}

export async function selectForms(line: string, carrier = "", state = "CA"): Promise<FormMap[]> {
  const all = await loadFormMaps();
  const base = all.filter(
    (m) =>
      m.applies_to.lines.includes(line) &&
      (m.applies_to.states.includes(state) || m.applies_to.states.includes("*")) &&
      !m.applies_to.carriers?.length,
  );
  const carrierSupp = carrier
    ? all.filter((m) => m.applies_to.lines.includes(line) && carrierMatches(m, carrier))
    : [];
  const seen = new Set<string>();
  return [...base, ...carrierSupp].filter((m) => {
    if (seen.has(m.form_id)) return false;
    seen.add(m.form_id);
    return true;
  });
}
