// Cross-document identity stitching (BUILD_SPEC §16): files 01/03/04/08 all
// resolve to Maria Gutierrez; 05/06 resolve to Desert Bloom. We derive strong
// signals (license #, VIN, normalized name, address) from each canonical record
// and group documents whose signals overlap into a single lead.

import { type CanonicalRecord, recordSubject } from "../canonical";
import { normalizeName } from "../utils";

export interface Signals {
  names: Set<string>;
  businessNames: Set<string>;
  licenses: Set<string>;
  vins: Set<string>;
  addresses: Set<string>;
}

function nameKey(name: string | null | undefined): string {
  const norm = normalizeName(name);
  if (!norm) return "";
  const parts = norm.split(" ").filter(Boolean);
  if (parts.length < 2) return norm;
  // first + last token is robust to middle name/initial differences
  return `${parts[0]} ${parts[parts.length - 1]}`;
}

function addrKey(addr: string | null | undefined): string {
  if (!addr) return "";
  return addr.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 24);
}

export function recordSignals(record: CanonicalRecord): Signals {
  const s: Signals = { names: new Set(), businessNames: new Set(), licenses: new Set(), vins: new Set(), addresses: new Set() };

  const bn = record.business.name.value;
  if (bn) s.businessNames.add(normalizeName(bn));

  const personName = record.named_insured.value || record.id_document.full_name.value;
  if (personName && !bn) {
    const k = nameKey(personName);
    if (k) s.names.add(k);
  }

  for (const d of record.drivers) {
    if (d.license_number.value) s.licenses.add(d.license_number.value.toUpperCase().replace(/\s/g, ""));
    if (d.name.value) {
      const k = nameKey(d.name.value);
      if (k) s.names.add(k);
    }
  }
  if (record.id_document.license_number.value) {
    s.licenses.add(record.id_document.license_number.value.toUpperCase().replace(/\s/g, ""));
  }
  for (const v of record.vehicles) {
    if (v.vin.value) s.vins.add(v.vin.value.toUpperCase().replace(/\s/g, ""));
  }
  for (const a of [record.mailing_address.value, record.property.address.value, record.id_document.address.value]) {
    const k = addrKey(a);
    if (k) s.addresses.add(k);
  }
  return s;
}

export function mergeSignals(into: Signals, from: Signals): void {
  for (const k of from.names) into.names.add(k);
  for (const k of from.businessNames) into.businessNames.add(k);
  for (const k of from.licenses) into.licenses.add(k);
  for (const k of from.vins) into.vins.add(k);
  for (const k of from.addresses) into.addresses.add(k);
}

function overlaps(a: Set<string>, b: Set<string>): boolean {
  for (const x of a) if (b.has(x)) return true;
  return false;
}

/** Two signal sets describe the same entity if any strong signal overlaps. */
export function signalsMatch(a: Signals, b: Signals): boolean {
  // A business is only matched to a business (by business name).
  if (a.businessNames.size && b.businessNames.size) {
    return overlaps(a.businessNames, b.businessNames);
  }
  if (a.businessNames.size || b.businessNames.size) {
    // one is a business, the other a person — don't merge unless address shared
    return overlaps(a.addresses, b.addresses) && overlaps(a.names, b.names);
  }
  return (
    overlaps(a.licenses, b.licenses) ||
    overlaps(a.vins, b.vins) ||
    overlaps(a.names, b.names) ||
    (a.addresses.size > 0 && overlaps(a.addresses, b.addresses))
  );
}

export { recordSubject };
