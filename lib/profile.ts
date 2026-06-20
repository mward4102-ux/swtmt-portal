// Aggregates a set of documents' canonical records into a person/household/
// business profile for the vault + lead views.

import { DOC_TYPE_LABELS, type CanonicalRecord } from "./canonical";
import type { StoredDocument } from "./types";

export interface ProfileDriver { name: string; license: string; dob: string }
export interface ProfileVehicle { year: string; make: string; model: string; vin: string }
export interface ProfileProperty { address: string; yearBuilt: string; construction: string; coverageA: string }
export interface ProfileBusiness { name: string; entityType: string; description: string; eachOccurrence: string; generalAggregate: string }
export interface PolicySnapshot { docType: string; label: string; carrier: string; policyNumber: string; premium: string; expires: string }

export interface Profile {
  drivers: ProfileDriver[];
  vehicles: ProfileVehicle[];
  properties: ProfileProperty[];
  businesses: ProfileBusiness[];
  policies: PolicySnapshot[];
  addresses: string[];
}

const v = (f?: { value: string | null }) => f?.value ?? "";

const DEC_TYPES = new Set(["personal_auto_dec", "prior_auto_dec", "homeowners_dec", "commercial_gl_dec", "medicare_supplement"]);

export function buildProfile(documents: StoredDocument[]): Profile {
  const drivers = new Map<string, ProfileDriver>();
  const vehicles = new Map<string, ProfileVehicle>();
  const properties = new Map<string, ProfileProperty>();
  const businesses = new Map<string, ProfileBusiness>();
  const addresses = new Set<string>();
  const policies: PolicySnapshot[] = [];

  for (const doc of documents) {
    const r: CanonicalRecord = doc.record;

    for (const d of r.drivers) {
      const name = v(d.name);
      if (!name) continue;
      const key = v(d.license_number) || name.toLowerCase();
      if (!drivers.has(key)) drivers.set(key, { name, license: v(d.license_number), dob: v(d.dob) });
    }
    if (r.id_document.full_name.value) {
      const key = v(r.id_document.license_number) || v(r.id_document.full_name).toLowerCase();
      const existing = drivers.get(key);
      const driver = { name: v(r.id_document.full_name), license: v(r.id_document.license_number), dob: v(r.id_document.dob) };
      if (!existing) drivers.set(key, driver);
      else drivers.set(key, { name: existing.name || driver.name, license: existing.license || driver.license, dob: existing.dob || driver.dob });
    }

    for (const veh of r.vehicles) {
      const vin = v(veh.vin);
      const key = vin || `${v(veh.year)}-${v(veh.make)}-${v(veh.model)}`;
      if (key.replace(/-/g, "") && !vehicles.has(key)) {
        vehicles.set(key, { year: v(veh.year), make: v(veh.make), model: v(veh.model), vin });
      }
    }

    if (r.property.address.value || r.property.coverage_a.value) {
      const key = v(r.property.address) || doc.id;
      if (!properties.has(key)) {
        properties.set(key, {
          address: v(r.property.address), yearBuilt: v(r.property.year_built),
          construction: v(r.property.construction), coverageA: v(r.property.coverage_a),
        });
      }
    }

    if (r.business.name.value) {
      const key = v(r.business.name).toLowerCase();
      if (!businesses.has(key)) {
        businesses.set(key, {
          name: v(r.business.name), entityType: v(r.business.entity_type), description: v(r.business.description),
          eachOccurrence: v(r.business.each_occurrence), generalAggregate: v(r.business.general_aggregate),
        });
      }
    }

    for (const a of [r.mailing_address.value, r.property.address.value, r.id_document.address.value]) {
      if (a) addresses.add(a);
    }

    if (DEC_TYPES.has(doc.docType)) {
      policies.push({
        docType: doc.docType,
        label: DOC_TYPE_LABELS[doc.docType],
        carrier: v(r.carrier_name),
        policyNumber: v(r.policy_number),
        premium: v(r.premium_total),
        expires: v(r.policy_period.end),
      });
    }
  }

  return {
    drivers: [...drivers.values()],
    vehicles: [...vehicles.values()],
    properties: [...properties.values()],
    businesses: [...businesses.values()],
    policies,
    addresses: [...addresses],
  };
}
