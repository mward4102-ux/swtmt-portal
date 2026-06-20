// Loads the form-map configs from forms/field-maps/*.json at runtime, so adding
// a carrier/form is "drop a JSON (+ PDF)" with no code change (BUILD_SPEC §7).

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

export interface FormMap {
  form_id: string;
  title: string;
  applies_to: { lines: string[]; states: string[]; carriers?: string[] };
  pdf_template: string;
  fields: Record<string, string>;
}

const MAPS_DIR = path.join(process.cwd(), "forms", "field-maps");

const g = globalThis as unknown as { __BSI_FORMMAPS__?: FormMap[] };

export async function loadFormMaps(): Promise<FormMap[]> {
  if (g.__BSI_FORMMAPS__) return g.__BSI_FORMMAPS__;
  let files: string[] = [];
  try {
    files = (await readdir(MAPS_DIR)).filter((fn) => fn.endsWith(".json"));
  } catch {
    return [];
  }
  const maps: FormMap[] = [];
  for (const fn of files) {
    try {
      const raw = await readFile(path.join(MAPS_DIR, fn), "utf8");
      maps.push(JSON.parse(raw) as FormMap);
    } catch {
      // skip malformed map
    }
  }
  g.__BSI_FORMMAPS__ = maps;
  return maps;
}

export async function getFormMap(formId: string): Promise<FormMap | undefined> {
  return (await loadFormMaps()).find((m) => m.form_id === formId);
}
