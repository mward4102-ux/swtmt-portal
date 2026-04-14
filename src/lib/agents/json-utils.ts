// Shared JSON parsing helpers for agent output.
// Opus and Haiku occasionally wrap JSON responses in markdown code fences,
// or include preamble text. These helpers strip that noise before parsing.
export function stripJsonFences(raw: string): string {
  let s = (raw || '').trim();
  // Strip ```json ... ``` or ``` ... ``` fences
  s = s.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  // Strip any leading text before the first { or [
  const firstBrace = s.search(/[{\[]/);
  if (firstBrace > 0) s = s.slice(firstBrace);
  // Strip trailing text after the last } or ]
  const lastClose = Math.max(s.lastIndexOf('}'), s.lastIndexOf(']'));
  if (lastClose > -1 && lastClose < s.length - 1) s = s.slice(0, lastClose + 1);
  return s.trim();
}
export function safeParseJson<T = any>(raw: string, fallback: T | null = null): T | null {
  try {
    return JSON.parse(stripJsonFences(raw)) as T;
  } catch {
    return fallback;
  }
}
export function parseJsonOrThrow<T = any>(raw: string, label: string): T {
  const stripped = stripJsonFences(raw);
  try {
    return JSON.parse(stripped) as T;
  } catch (e: any) {
    throw new Error(`Failed to parse ${label} as JSON: ${e.message}. First 200 chars: ${stripped.slice(0, 200)}`);
  }
}
