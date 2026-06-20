// Registry of faithful ACORD renderers, keyed by form_id. fill.ts uses this when
// no official fillable PDF has been dropped into forms/.

import type { CanonicalRecord } from "../../canonical";
import type { FormMap } from "../maps";
import { renderAcord25 } from "./acord25";
import { renderAcord125 } from "./acord125";
import { renderAcord36 } from "./acord36";
import { renderAcord37 } from "./acord37";
import { renderAcord80, renderAcord90, renderSupplement } from "./acordApp";

type Renderer = (record: CanonicalRecord) => Promise<Uint8Array>;

const REGISTRY: Record<string, Renderer> = {
  ACORD_25: renderAcord25,
  ACORD_125: renderAcord125,
  ACORD_37: renderAcord37,
  ACORD_36: (r) => renderAcord36(r),
  ACORD_90_PersonalAuto: renderAcord90,
  ACORD_80_Homeowners: renderAcord80,
};

/** Render a faithful ACORD-format PDF for the given form, filled from canonical. */
export async function renderForm(map: FormMap, record: CanonicalRecord): Promise<Uint8Array> {
  const renderer = REGISTRY[map.form_id];
  if (renderer) return renderer(record);
  // Unknown form (e.g. carrier supplement) → ACORD-styled supplement from the map.
  return renderSupplement(map.title || map.form_id, map.form_id, record, map.fields);
}
