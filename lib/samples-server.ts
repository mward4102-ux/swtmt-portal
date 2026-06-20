// Server-only access to the bundled sample PDFs (samples/ is not public; binaries
// are served via the auth-gated /api/documents/[id]/file route).

import { readFile } from "node:fs/promises";
import path from "node:path";
import { SAMPLE_BY_ID } from "./samples";

export async function readSampleBuffer(sampleId: string): Promise<Buffer | null> {
  const sample = SAMPLE_BY_ID[sampleId];
  if (!sample) return null;
  try {
    return await readFile(path.join(process.cwd(), "samples", sample.fileName));
  } catch {
    return null;
  }
}
