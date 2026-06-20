// Maps a just-extracted CanonicalRecord into a quote line's field data
// (BUILD_SPEC §8: "Upload current policy to autofill").

import type { CanonicalRecord } from "./canonical";
import type { QuoteLineType } from "./types";

const v = (f?: { value: string | null }) => f?.value ?? "";

export function mapCanonicalToLine(line: QuoteLineType, r: CanonicalRecord): Record<string, unknown> {
  switch (line) {
    case "personal_auto": {
      let drivers = r.drivers.map((d) => ({ name: v(d.name), dob: v(d.dob), license_number: v(d.license_number) }));
      if (!drivers.length && r.id_document.full_name.value) {
        drivers = [{ name: v(r.id_document.full_name), dob: v(r.id_document.dob), license_number: v(r.id_document.license_number) }];
      }
      const vehicles = r.vehicles.map((veh) => ({ year: v(veh.year), make: v(veh.make), model: v(veh.model), vin: v(veh.vin), use: "" }));
      return {
        drivers,
        vehicles,
        current_carrier: v(r.carrier_name),
        current_expiry: v(r.policy_period.end),
      };
    }
    case "homeowners":
      return {
        property_address: v(r.property.address) || v(r.mailing_address),
        year_built: v(r.property.year_built),
        construction: v(r.property.construction),
        current_cov_a: v(r.property.coverage_a),
        mortgagee: v(r.property.mortgagee),
        current_carrier: v(r.carrier_name),
      };
    case "commercial":
      return {
        business_name: v(r.business.name),
        entity_type: v(r.business.entity_type),
        description: v(r.business.description),
        lines_wanted: ["General Liability"],
      };
    case "life_health":
      return {
        type: r.doc_type === "medicare_supplement" ? "Medicare Supplement" : "",
        dob: v(r.id_document.dob),
        coverage_amount: "",
      };
    default:
      return {};
  }
}
