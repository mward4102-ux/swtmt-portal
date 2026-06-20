// Low-level drawing helpers for rendering ACORD-format PDFs with pdf-lib, using
// a top-left coordinate system (pdf-lib is bottom-left origin). Produces the
// characteristic ACORD look: thin black rules, tiny uppercase cell labels in the
// top-left of each box, values below, gray section bars.

import { type Color, type PDFFont, type PDFPage, PDFDocument, StandardFonts, rgb } from "pdf-lib";

export const PAGE = { W: 612, H: 792, M: 18 };
export const BLACK = rgb(0, 0, 0);
export const LABEL = rgb(0.27, 0.27, 0.3);
export const BAR = rgb(0.82, 0.84, 0.88);
export const SOFT = rgb(0.95, 0.96, 0.98);

export interface Fonts {
  reg: PDFFont;
  bold: PDFFont;
  obl: PDFFont;
}

export async function newDoc(): Promise<{ doc: PDFDocument; fonts: Fonts }> {
  const doc = await PDFDocument.create();
  const fonts: Fonts = {
    reg: await doc.embedFont(StandardFonts.Helvetica),
    bold: await doc.embedFont(StandardFonts.HelveticaBold),
    obl: await doc.embedFont(StandardFonts.HelveticaOblique),
  };
  return { doc, fonts };
}

function clip(s: string, font: PDFFont, size: number, maxW: number): string {
  if (font.widthOfTextAtSize(s, size) <= maxW) return s;
  let out = s;
  while (out.length > 1 && font.widthOfTextAtSize(`${out}…`, size) > maxW) out = out.slice(0, -1);
  return `${out}…`;
}

export class Sheet {
  page: PDFPage;
  constructor(public doc: PDFDocument, public f: Fonts) {
    this.page = doc.addPage([PAGE.W, PAGE.H]);
  }
  newPage() {
    this.page = this.doc.addPage([PAGE.W, PAGE.H]);
  }
  private ty(top: number) {
    return PAGE.H - top;
  }
  line(x1: number, t1: number, x2: number, t2: number, w = 0.75, color: Color = BLACK) {
    this.page.drawLine({ start: { x: x1, y: this.ty(t1) }, end: { x: x2, y: this.ty(t2) }, thickness: w, color });
  }
  rect(x: number, top: number, w: number, h: number, opts: { border?: number; fill?: Color } = {}) {
    const { border = 0.75, fill } = opts;
    this.page.drawRectangle({
      x, y: this.ty(top + h), width: w, height: h,
      borderWidth: border, borderColor: border ? BLACK : undefined, color: fill,
    });
  }
  text(x: number, top: number, str: string | null | undefined, opts: { size?: number; font?: PDFFont; color?: Color; maxWidth?: number; align?: "l" | "c" | "r"; w?: number } = {}) {
    const { size = 8, font = this.f.reg, color = BLACK, maxWidth, align = "l", w } = opts;
    let s = str == null ? "" : String(str);
    if (!s) return;
    if (maxWidth) s = clip(s, font, size, maxWidth);
    let tx = x;
    if (align !== "l" && w) {
      const tw = font.widthOfTextAtSize(s, size);
      tx = align === "c" ? x + (w - tw) / 2 : x + w - tw;
    }
    this.page.drawText(s, { x: tx, y: this.ty(top + size), size, font, color });
  }
  // wrapped paragraph; returns lines drawn
  paragraph(x: number, top: number, str: string, opts: { size?: number; font?: PDFFont; maxWidth: number; lineH?: number; maxLines?: number; color?: Color }) {
    const { size = 8, font = this.f.reg, maxWidth, lineH = (opts.size ?? 8) + 2, maxLines = 99, color = BLACK } = opts;
    const words = String(str).split(/\s+/);
    const lines: string[] = [];
    let line = "";
    for (const word of words) {
      const t = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(t, size) > maxWidth && line) { lines.push(line); line = word; }
      else line = t;
    }
    if (line) lines.push(line);
    lines.slice(0, maxLines).forEach((ln, i) => this.text(x, top + i * lineH, ln, { size, font, color }));
    return Math.min(lines.length, maxLines);
  }
  label(x: number, top: number, str: string, w?: number) {
    this.text(x + 2.5, top + 1.6, str.toUpperCase(), { size: 4.7, font: this.f.bold, color: LABEL, maxWidth: w ? w - 5 : undefined });
  }
  // bordered cell: tiny label top-left, value below
  cell(x: number, top: number, w: number, h: number, label: string, value?: string | null, opts: { valueSize?: number; bold?: boolean; align?: "l" | "c" | "r"; pad?: number } = {}) {
    this.rect(x, top, w, h);
    if (label) this.label(x, top, label, w);
    const v = value == null ? "" : String(value);
    if (v) {
      const size = opts.valueSize ?? 8;
      const font = opts.bold ? this.f.bold : this.f.reg;
      const vy = label ? top + 7 : top + (h - size) / 2 - 0.5;
      this.text(x + (opts.pad ?? 3), vy, v, { size, font, maxWidth: w - 6, align: opts.align, w });
    }
  }
  // small checkbox + adjacent label (drawn, never a unicode glyph)
  check(x: number, top: number, label?: string, on = false, opts: { size?: number; labelSize?: number } = {}) {
    const sz = opts.size ?? 5.2;
    this.rect(x, top, sz, sz, { border: 0.6 });
    if (on) {
      this.line(x + 0.8, top + 0.8, x + sz - 0.8, top + sz - 0.8, 0.6);
      this.line(x + 0.8, top + sz - 0.8, x + sz - 0.8, top + 0.8, 0.6);
    }
    if (label) this.text(x + sz + 2.5, top + 0.4, label, { size: opts.labelSize ?? 5.6, font: this.f.bold });
  }
  bar(x: number, top: number, w: number, h: number, text: string, fill: Color = BAR) {
    this.rect(x, top, w, h, { fill });
    this.text(x + 3, top + (h - 6) / 2 + 0.5, text, { size: 6.6, font: this.f.bold });
  }
  // centered ACORD form header band
  header(title: string, formNo: string) {
    const { M, W } = PAGE;
    const right = W - M;
    // ACORD logo box
    this.rect(M, M, 74, 26);
    this.text(M + 6, M + 5, "ACORD", { size: 15, font: this.f.bold });
    this.text(M + 60, M + 5, "®", { size: 5, font: this.f.bold });
    // title (centered between logo and date box)
    this.text(M + 80, M + 8, title, { size: 11.5, font: this.f.bold, align: "c", w: right - 80 - 96 });
    // date box
    this.cell(right - 92, M, 92, 26, "DATE (MM/DD/YYYY)", new Date().toLocaleDateString("en-US"));
    return M + 26;
  }
  footer(formNo: string, opts: { page?: string } = {}) {
    const { M, W, H } = PAGE;
    const top = H - M - 10;
    this.line(M, top - 3, W - M, top - 3, 0.75);
    this.text(M, top, formNo, { size: 6.8, font: this.f.bold });
    if (opts.page) this.text(M, top, opts.page, { size: 6.8, font: this.f.bold, align: "c", w: W - 2 * M });
    this.text(M, top, "© 1988-2015 ACORD CORPORATION.  All rights reserved.", { size: 5.8, color: LABEL, align: "r", w: W - 2 * M });
    this.text(M, top + 8, "The ACORD name and logo are registered marks of ACORD.", { size: 5, color: LABEL, align: "c", w: W - 2 * M });
    this.text(M, top + 8, "App-rendered facsimile — drop the official fillable PDF into forms/ to override.", { size: 4.6, color: LABEL });
  }
}
