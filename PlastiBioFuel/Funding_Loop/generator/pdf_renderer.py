# -*- coding: utf-8 -*-
"""PDF renderer for PlastiBioFuel funding documents (reportlab)."""
import html
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_RIGHT
from reportlab.platypus import (BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer,
                                Table, TableStyle, KeepTogether, Flowable)
import tokens as T

C = lambda h: colors.HexColor("#" + h)
F, FB, FI = "Helvetica", "Helvetica-Bold", "Helvetica-Oblique"
M = inch                      # 1in margins
CW = LETTER[0] - 2 * M        # 6.5in content width

def esc(t): return html.escape(str(t), quote=False)

S = dict(
  eyebrow = ParagraphStyle("eyebrow", fontName=FB, fontSize=9, leading=12, textColor=C(T.BLUE), spaceAfter=8),
  h0      = ParagraphStyle("h0", fontName=FB, fontSize=30, leading=32, textColor=C(T.INK), spaceAfter=9),
  stand   = ParagraphStyle("stand", fontName=F, fontSize=11.5, leading=16, textColor=C(T.SOFT), spaceAfter=0),
  h1      = ParagraphStyle("h1", fontName=FB, fontSize=13, leading=16, textColor=C(T.BLUE), spaceBefore=15, spaceAfter=5),
  h2      = ParagraphStyle("h2", fontName=FB, fontSize=11, leading=14, textColor=C(T.BLUE), spaceBefore=10, spaceAfter=3),
  body    = ParagraphStyle("body", fontName=F, fontSize=10.5, leading=15, textColor=C(T.INK), spaceAfter=7),
  small   = ParagraphStyle("small", fontName=F, fontSize=9.5, leading=13.5, textColor=C(T.SOFT), spaceAfter=6),
  tiny    = ParagraphStyle("tiny", fontName=F, fontSize=8, leading=11, textColor=C(T.MUTED)),
  tinyR   = ParagraphStyle("tinyR", fontName=F, fontSize=8, leading=11, textColor=C(T.MUTED), alignment=TA_RIGHT),
  lbl     = ParagraphStyle("lbl", fontName=FB, fontSize=7.5, leading=10, textColor=C(T.BLUE), spaceAfter=3),
  lblM    = ParagraphStyle("lblM", fontName=FB, fontSize=7.5, leading=10, textColor=C(T.MUTED), spaceAfter=3),
  statv   = ParagraphStyle("statv", fontName=FB, fontSize=25, leading=27, textColor=C(T.BLUE), spaceAfter=4),
  statn   = ParagraphStyle("statn", fontName=F, fontSize=9, leading=12, textColor=C(T.MUTED)),
  ghost   = ParagraphStyle("ghost", fontName=FB, fontSize=34, leading=32, textColor=C(T.GHOST)),
  qtitle  = ParagraphStyle("qtitle", fontName=FB, fontSize=14, leading=17, textColor=C(T.BLUE)),
  cite    = ParagraphStyle("cite", fontName=F, fontSize=10, leading=14, textColor=C(T.INK), spaceAfter=4),
  doi     = ParagraphStyle("doi", fontName=FB, fontSize=8.5, leading=12, textColor=C(T.BLUE), spaceAfter=5),
  why     = ParagraphStyle("why", fontName=F, fontSize=9.5, leading=13.5, textColor=C(T.SOFT)),
  idx     = ParagraphStyle("idx", fontName=FB, fontSize=16, leading=19, textColor=C(T.GHOST)),
  step    = ParagraphStyle("step", fontName=F, fontSize=10.5, leading=15, textColor=C(T.INK)),
  dot     = ParagraphStyle("dot", fontName=FB, fontSize=10.5, leading=13, textColor=C(T.BLUE)),
  cardt   = ParagraphStyle("cardt", fontName=FB, fontSize=10.5, leading=14, textColor=C(T.INK), spaceAfter=3),
  meta    = ParagraphStyle("meta", fontName=F, fontSize=8.5, leading=12, textColor=C(T.MUTED), spaceAfter=3),
  note    = ParagraphStyle("note", fontName=F, fontSize=9.5, leading=13.5, textColor=C(T.SOFT)),
  pill    = ParagraphStyle("pill", fontName=FB, fontSize=7, leading=10, textColor=colors.white, alignment=TA_LEFT),
  chip    = ParagraphStyle("chip", fontName=FB, fontSize=9.5, leading=13, textColor=colors.white),
  chipR   = ParagraphStyle("chipR", fontName=FB, fontSize=9, leading=13, textColor=C(T.MUTED), alignment=TA_RIGHT),
  quote   = ParagraphStyle("quote", fontName=F, fontSize=10, leading=15, textColor=C(T.INK)),
)


class Band(Flowable):
    """Full-bleed masthead band with the wordmark and the document label."""
    def __init__(self, label, accent=T.PINK):
        Flowable.__init__(self); self.label = label; self.accent = accent
        self.width = CW; self.height = 46

    def wrap(self, aw, ah): return (aw, self.height)

    @staticmethod
    def _ls(c, x, y, txt, font, size, space, right=None, width=0):
        t = c.beginText()
        t.setFont(font, size)
        t.setCharSpace(space)
        if right is not None:
            w = c.stringWidth(txt, font, size) + space * (len(txt) - 1)
            t.setTextOrigin(right - w, y)
        else:
            t.setTextOrigin(x, y)
        t.textOut(txt)
        c.drawText(t)

    def draw(self):
        c = self.canv
        c.saveState()
        c.setFillColor(C(T.BLUE))
        c.rect(-M, 4, LETTER[0], 38, stroke=0, fill=1)
        c.setFillColor(C(self.accent))
        c.rect(-M, 0, LETTER[0], 4, stroke=0, fill=1)
        c.setFillColor(colors.white)
        self._ls(c, 0, 17, "PLASTIBIOFUEL", FB, 11, 1.8)
        c.setFillColor(C(T.BLUE_LT))
        self._ls(c, 0, 18, self.label, FB, 8, 1.9, right=CW)
        c.restoreState()


class Rule(Flowable):
    def __init__(self, color=T.RULE, weight=0.6, space=0, width=None):
        Flowable.__init__(self); self.c = color; self.w = weight
        self.space = space; self._w = width
    def wrap(self, aw, ah):
        self.width = self._w or aw
        return (self.width, self.w + self.space)
    def draw(self):
        self.canv.setStrokeColor(C(self.c)); self.canv.setLineWidth(self.w)
        self.canv.line(0, self.space, self.width, self.space)


def _pill(text, fg, bg):
    p = Paragraph(esc(text), ParagraphStyle("p", parent=S["pill"], textColor=C(fg)))
    t = Table([[p]], colWidths=[None], hAlign="LEFT")
    t.setStyle(TableStyle([("BACKGROUND", (0,0), (-1,-1), C(bg)),
                           ("LEFTPADDING", (0,0), (-1,-1), 6), ("RIGHTPADDING", (0,0), (-1,-1), 6),
                           ("TOPPADDING", (0,0), (-1,-1), 3), ("BOTTOMPADDING", (0,0), (-1,-1), 3)]))
    return t


def _plain(rows, widths, pad=0, style=None):
    t = Table(rows, colWidths=widths, hAlign="LEFT")
    base = [("VALIGN", (0,0), (-1,-1), "TOP"),
            ("LEFTPADDING", (0,0), (-1,-1), pad), ("RIGHTPADDING", (0,0), (-1,-1), pad),
            ("TOPPADDING", (0,0), (-1,-1), 0), ("BOTTOMPADDING", (0,0), (-1,-1), 0)]
    t.setStyle(TableStyle(base + (style or [])))
    return t


def build(blocks, path, title_text, accent=T.PINK):
    doc = BaseDocTemplate(path, pagesize=LETTER, leftMargin=M, rightMargin=M,
                          topMargin=M * 0.45, bottomMargin=M * 0.72,
                          title=title_text, author="PlastiBioFuel LLC")
    frame = Frame(M, M * 0.72, CW, LETTER[1] - M * 0.45 - M * 0.72, id="f",
                  leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)

    def page(cv, _d):
        cv.saveState()
        cv.setStrokeColor(C(T.RULE)); cv.setLineWidth(0.5)
        cv.line(M, 0.58 * inch, LETTER[0] - M, 0.58 * inch)
        cv.setFont(F, 7.5); cv.setFillColor(C(T.MUTED))
        cv.drawString(M, 0.42 * inch, "PlastiBioFuel LLC")
        cv.drawRightString(LETTER[0] - M, 0.42 * inch, str(cv.getPageNumber()))
        cv.restoreState()

    doc.addPageTemplates([PageTemplate(id="p", frames=[frame], onPage=page)])
    story = []
    stepn = 0

    for b in blocks:
        k = b[0]
        if k != "step":
            stepn = 0

        if k == "masthead":
            story.append(Band(b[1], accent)); story.append(Spacer(1, 18))

        elif k == "hero":
            story.append(Paragraph(esc(b[1]), S["eyebrow"]))
            story.append(Paragraph(esc(b[2]).replace("\n", "<br/>"), S["h0"]))
            if len(b) > 3 and b[3]:
                story.append(Paragraph(esc(b[3]), S["stand"]))
            story.append(Spacer(1, 13))

        elif k == "stats":
            n = len(b[1]); w = CW / n
            cells = []
            for label, val, note in b[1]:
                inner = [[Paragraph(esc(label), S["lblM"])],
                         [Paragraph(esc(val), S["statv"])],
                         [Paragraph(esc(note), S["statn"])]]
                cells.append(_plain(inner, [w - 24]))
            t = Table([cells], colWidths=[w] * n, hAlign="LEFT")
            st = [("VALIGN", (0,0), (-1,-1), "TOP"),
                  ("LINEABOVE", (0,0), (-1,0), 1.4, C(T.INK)),
                  ("LINEBELOW", (0,0), (-1,0), 0.6, C(T.RULE)),
                  ("TOPPADDING", (0,0), (-1,-1), 11), ("BOTTOMPADDING", (0,0), (-1,-1), 11),
                  ("LEFTPADDING", (0,0), (0,0), 0), ("RIGHTPADDING", (-1,0), (-1,0), 0)]
            for i in range(n - 1):
                st.append(("LINEAFTER", (i,0), (i,0), 0.6, C(T.RULE)))
            t.setStyle(TableStyle(st))
            story.append(t); story.append(Spacer(1, 9))

        elif k == "alert":
            p = Paragraph(esc(b[1]), ParagraphStyle("al", fontName=F, fontSize=10.5, leading=14.5, textColor=C(T.INK)))
            t = Table([[p]], colWidths=[CW], hAlign="LEFT")
            t.setStyle(TableStyle([("BACKGROUND", (0,0), (-1,-1), C(T.PINK_BG)),
                                   ("LINEBEFORE", (0,0), (0,-1), 3, C(accent)),
                                   ("LEFTPADDING", (0,0), (-1,-1), 14), ("RIGHTPADDING", (0,0), (-1,-1), 14),
                                   ("TOPPADDING", (0,0), (-1,-1), 9), ("BOTTOMPADDING", (0,0), (-1,-1), 9)]))
            story.append(t); story.append(Spacer(1, 10))

        elif k == "factgrid":
            items = b[1]; w = CW / 2
            rows = []
            for i in range(0, len(items), 2):
                pair = items[i:i+2]
                cells = []
                for label, txt in pair:
                    cells.append(_plain([[Paragraph(esc(label), S["lbl"])],
                                         [Paragraph(esc(txt), ParagraphStyle("fg", fontName=F, fontSize=9.5,
                                          leading=13, textColor=C(T.INK)))]], [w - 26]))
                while len(cells) < 2:
                    cells.append("")
                rows.append(cells)
            t = Table(rows, colWidths=[w, w], hAlign="LEFT")
            st = [("VALIGN", (0,0), (-1,-1), "TOP"),
                  ("TOPPADDING", (0,0), (-1,-1), 7.5), ("BOTTOMPADDING", (0,0), (-1,-1), 7.5),
                  ("LEFTPADDING", (0,0), (0,-1), 0), ("RIGHTPADDING", (0,0), (0,-1), 26),
                  ("LEFTPADDING", (1,0), (1,-1), 0), ("RIGHTPADDING", (1,0), (1,-1), 0)]
            for r in range(len(rows)):
                st.append(("LINEABOVE", (0,r), (-1,r), 0.6, C(T.RULE)))
            t.setStyle(TableStyle(st))
            story.append(t)

        elif k == "factwide":
            story.append(Rule(T.RULE, 0.6, 0))
            story.append(Spacer(1, 7))
            story.append(Paragraph(esc(b[1]), S["lbl"]))
            story.append(Paragraph(b[2], ParagraphStyle("fw", fontName=F, fontSize=9.5, leading=13.5, textColor=C(T.INK))))
            story.append(Spacer(1, 8))

        elif k == "chip":
            left = Table([[Paragraph(esc(b[1]), S["chip"])]], hAlign="LEFT")
            left.setStyle(TableStyle([("BACKGROUND", (0,0), (-1,-1), C(T.BLUE)),
                                      ("LEFTPADDING", (0,0), (-1,-1), 10), ("RIGHTPADDING", (0,0), (-1,-1), 10),
                                      ("TOPPADDING", (0,0), (-1,-1), 5), ("BOTTOMPADDING", (0,0), (-1,-1), 5)]))
            right = Paragraph(esc(b[2]) if len(b) > 2 and b[2] else "", S["chipR"])
            t = _plain([[left, right]], [CW * 0.55, CW * 0.45],
                       style=[("VALIGN", (1,0), (1,0), "MIDDLE")])
            story.append(Spacer(1, 8)); story.append(t); story.append(Spacer(1, 12))

        elif k == "qblock":
            num, qt, pill, paras, addon = b[1], b[2], b[3], b[4], (b[5] if len(b) > 5 else None)
            head = _plain([[Paragraph(esc(num), S["ghost"]),
                            Paragraph(esc(qt), S["qtitle"]),
                            _pill(pill, "FFFFFF", T.BLUE)]],
                          [62, CW - 62 - 82, 82],
                          style=[("VALIGN", (1,0), (2,0), "MIDDLE"), ("ALIGN", (2,0), (2,0), "RIGHT")])
            story.append(KeepTogether([head, Spacer(1, 4),
                                       Rule(T.RULE, 0.6, 0, width=CW - 62)]))
            story.append(Spacer(1, 8))
            ans = ParagraphStyle("ans", fontName=F, fontSize=10.5, leading=15.2,
                                 textColor=C(T.INK), spaceAfter=8, leftIndent=62)
            for lead, txt in paras:
                pre = f'<font name="{FB}" color="#{T.BLUE}">{esc(lead)}</font> ' if lead else ""
                story.append(Paragraph(pre + esc(txt), ans))
            if addon:
                ad = _plain([[Paragraph(esc(addon[0]), ParagraphStyle("adl", fontName=FB, fontSize=7,
                                        leading=10, textColor=C(T.MUTED), spaceAfter=3))],
                             [Paragraph(esc(addon[1]), S["why"])]], [CW - 62 - 14])
                adt = Table([["", ad]], colWidths=[62, CW - 62], hAlign="LEFT")
                adt.setStyle(TableStyle([("LINEBEFORE", (1,0), (1,-1), 1, C("C9D6E4")),
                                         ("VALIGN", (0,0), (-1,-1), "TOP"),
                                         ("LEFTPADDING", (0,0), (0,0), 0), ("RIGHTPADDING", (0,0), (0,0), 0),
                                         ("LEFTPADDING", (1,0), (1,0), 12), ("RIGHTPADDING", (1,0), (1,0), 0),
                                         ("TOPPADDING", (0,0), (-1,-1), 3), ("BOTTOMPADDING", (0,0), (-1,-1), 3)]))
                story.append(KeepTogether(adt))
            story.append(Spacer(1, 16))

        elif k == "step":
            stepn += 1
            n = Paragraph(esc(str(b[1])), ParagraphStyle("dn", parent=S["dot"], alignment=1))
            dot = Table([[n]], colWidths=[24], rowHeights=[24], hAlign="LEFT")
            dot.setStyle(TableStyle([("BOX", (0,0), (-1,-1), 1, C(T.BLUE)),
                                     ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
                                     ("LEFTPADDING", (0,0), (-1,-1), 0), ("RIGHTPADDING", (0,0), (-1,-1), 0),
                                     ("TOPPADDING", (0,0), (-1,-1), 0), ("BOTTOMPADDING", (0,0), (-1,-1), 0),
                                     ("ROUNDEDCORNERS", [12, 12, 12, 12])]))
            row = _plain([[dot, Paragraph(b[2], S["step"])]], [38, CW - 38])
            story.append(KeepTogether(row)); story.append(Spacer(1, 10))

        elif k == "card":
            kind, ttl, where, who, note = b[1], b[2], b[3], b[4], b[5]
            label, fg, bg = T.PILLS[kind]
            left = _plain([[_pill(label, fg, bg)]], [96])
            right = _plain([[Paragraph(esc(ttl), S["cardt"])],
                            [Paragraph(f'<font name="{FB}" color="#{T.FAINT}" size="7">WHERE</font>  '
                                       f'{esc(where)}   <font color="#D5DCE3">|</font>   '
                                       f'<font name="{FB}" color="#{T.FAINT}" size="7">SIGNS</font>  {esc(who)}', S["meta"])],
                            [Paragraph(esc(note), S["note"])]], [CW - 96 - 14])
            t = Table([[left, right]], colWidths=[96 + 14, CW - 96 - 14], hAlign="LEFT")
            t.setStyle(TableStyle([("VALIGN", (0,0), (-1,-1), "TOP"),
                                   ("LINEBELOW", (0,0), (-1,-1), 0.5, C(T.RULE_LT)),
                                   ("LEFTPADDING", (0,0), (-1,-1), 0), ("RIGHTPADDING", (0,0), (0,0), 14),
                                   ("RIGHTPADDING", (1,0), (1,0), 0),
                                   ("TOPPADDING", (0,0), (-1,-1), 9), ("BOTTOMPADDING", (0,0), (-1,-1), 9)]))
            story.append(KeepTogether(t))

        elif k == "callout":
            cstyle = ParagraphStyle("cb", fontName=F, fontSize=10.5, leading=15,
                                    textColor=C(T.INK), spaceAfter=5)
            rows_ = [[Paragraph(esc(b[1]), ParagraphStyle("cl", fontName=FB, fontSize=8.5,
                      leading=12, textColor=C(accent), spaceAfter=6))]]
            rows_ += [[Paragraph(esc(ln), cstyle)] for ln in b[2].split("\n") if ln.strip()]
            inner = _plain(rows_, [CW - 34])
            t = Table([[inner]], colWidths=[CW], hAlign="LEFT")
            t.setStyle(TableStyle([("BACKGROUND", (0,0), (-1,-1), C(T.PINK_BG)),
                                   ("LINEBEFORE", (0,0), (0,-1), 3, C(accent)),
                                   ("LEFTPADDING", (0,0), (-1,-1), 16), ("RIGHTPADDING", (0,0), (-1,-1), 16),
                                   ("TOPPADDING", (0,0), (-1,-1), 12), ("BOTTOMPADDING", (0,0), (-1,-1), 12)]))
            story.append(Spacer(1, 8)); story.append(t); story.append(Spacer(1, 14))

        elif k == "tint":
            parts = [[Paragraph(esc(b[1]), ParagraphStyle("tl", fontName=FB, fontSize=8.5,
                      leading=12, textColor=C(T.BLUE), spaceAfter=5))]]
            if len(b) > 2 and b[2]:
                parts.append([Paragraph(esc(b[2]), S["meta"])])
            if len(b) > 3 and b[3]:
                qs = ParagraphStyle("q", parent=S["quote"], spaceAfter=7)
                lines = [ln for ln in str(b[3]).split("\n") if ln.strip()]
                q = Table([[Paragraph(esc(ln), qs)] for ln in lines],
                          colWidths=[CW - 46], hAlign="LEFT")
                q.setStyle(TableStyle([("LINEBEFORE", (0,0), (0,-1), 2, C(T.BLUE)),
                                       ("LEFTPADDING", (0,0), (-1,-1), 12), ("RIGHTPADDING", (0,0), (-1,-1), 0),
                                       ("TOPPADDING", (0,0), (-1,-1), 2), ("BOTTOMPADDING", (0,0), (-1,-1), 0)]))
                parts.append([q])
            inner = _plain(parts, [CW - 46])
            t = Table([[inner]], colWidths=[CW], hAlign="LEFT")
            t.setStyle(TableStyle([("BACKGROUND", (0,0), (-1,-1), C(T.TINT)),
                                   ("LEFTPADDING", (0,0), (-1,-1), 18), ("RIGHTPADDING", (0,0), (-1,-1), 18),
                                   ("TOPPADDING", (0,0), (-1,-1), 13), ("BOTTOMPADDING", (0,0), (-1,-1), 13)]))
            story.append(Spacer(1, 6)); story.append(t); story.append(Spacer(1, 10))

        elif k == "kvrows":
            rows = [[Paragraph(esc(kk), ParagraphStyle("kk", fontName=FB, fontSize=9.5, leading=13, textColor=C(T.INK))),
                     Paragraph(esc(vv), ParagraphStyle("vv", fontName=F, fontSize=9.5, leading=13.5, textColor=C(T.INK)))]
                    for kk, vv in b[1]]
            t = Table(rows, colWidths=[132, CW - 132], hAlign="LEFT")
            st = [("VALIGN", (0,0), (-1,-1), "TOP"),
                  ("LEFTPADDING", (0,0), (-1,-1), 0), ("RIGHTPADDING", (0,0), (0,-1), 16),
                  ("TOPPADDING", (0,0), (-1,-1), 9), ("BOTTOMPADDING", (0,0), (-1,-1), 9)]
            for r in range(len(rows)):
                st.append(("LINEABOVE", (0,r), (-1,r), 0.6, C(T.RULE)))
            st.append(("LINEBELOW", (0,len(rows)-1), (-1,len(rows)-1), 0.6, C(T.RULE)))
            t.setStyle(TableStyle(st))
            story.append(t); story.append(Spacer(1, 6))

        elif k == "ref":
            idx, cite, doi, why = b[1], b[2], b[3], b[4]
            right = [[Paragraph(cite, S["cite"])]]
            if doi:
                right.append([Paragraph(esc(doi), S["doi"])])
            wt = Table([[Paragraph(esc(why), S["why"])]], colWidths=[CW - 34 - 14], hAlign="LEFT")
            wt.setStyle(TableStyle([("LINEBEFORE", (0,0), (0,-1), 1.2, C(T.RULE)),
                                    ("LEFTPADDING", (0,0), (-1,-1), 11), ("RIGHTPADDING", (0,0), (-1,-1), 0),
                                    ("TOPPADDING", (0,0), (-1,-1), 2), ("BOTTOMPADDING", (0,0), (-1,-1), 0)]))
            right.append([wt])
            row = _plain([[Paragraph(esc(str(idx)), S["idx"]), _plain(right, [CW - 34])]], [34, CW - 34])
            t = Table([[row]], colWidths=[CW], hAlign="LEFT")
            t.setStyle(TableStyle([("LINEBELOW", (0,0), (-1,-1), 0.5, C(T.RULE_LT)),
                                   ("LEFTPADDING", (0,0), (-1,-1), 0), ("RIGHTPADDING", (0,0), (-1,-1), 0),
                                   ("TOPPADDING", (0,0), (-1,-1), 4), ("BOTTOMPADDING", (0,0), (-1,-1), 13)]))
            story.append(KeepTogether(t)); story.append(Spacer(1, 9))

        elif k == "statbar":
            n = len(b[1]); w = CW / n
            cells = []
            longest = max(len(v) for v, _ in b[1])
            vsize = 19 if longest <= 5 else (14 if longest <= 20 else 12)
            for val, label in b[1]:
                cells.append(_plain([[Paragraph(esc(val), ParagraphStyle("sv", fontName=FB, fontSize=vsize,
                                      leading=vsize * 1.18, textColor=C(T.BLUE), spaceAfter=6))],
                                     [Paragraph(esc(label), S["lblM"])]], [w - 24]))
            t = Table([cells], colWidths=[w] * n, hAlign="LEFT")
            st = [("VALIGN", (0,0), (-1,-1), "TOP"),
                  ("LINEABOVE", (0,0), (-1,0), 1.4, C(T.INK)),
                  ("LINEBELOW", (0,0), (-1,0), 0.6, C(T.RULE)),
                  ("TOPPADDING", (0,0), (-1,-1), 10), ("BOTTOMPADDING", (0,0), (-1,-1), 10),
                  ("LEFTPADDING", (0,0), (0,0), 0), ("RIGHTPADDING", (-1,0), (-1,0), 0)]
            for i in range(n - 1):
                st.append(("LINEAFTER", (i,0), (i,0), 0.6, C(T.RULE)))
            t.setStyle(TableStyle(st))
            story.append(t); story.append(Spacer(1, 14))

        elif k == "legend":
            cells = []
            for kind, txt in b[1]:
                label, fg, bg = T.PILLS[kind]
                cells.append(_plain([[_pill(label, fg, bg), Paragraph(esc(txt), S["meta"])]],
                                    [92, (CW / len(b[1])) - 100],
                                    style=[("VALIGN", (1,0), (1,0), "MIDDLE"), ("RIGHTPADDING", (0,0), (0,0), 8)]))
            t = Table([cells], colWidths=[CW / len(b[1])] * len(b[1]), hAlign="LEFT")
            t.setStyle(TableStyle([("VALIGN", (0,0), (-1,-1), "MIDDLE"),
                                   ("LINEABOVE", (0,0), (-1,0), 1.4, C(T.INK)),
                                   ("LINEBELOW", (0,0), (-1,0), 0.6, C(T.RULE)),
                                   ("TOPPADDING", (0,0), (-1,-1), 9), ("BOTTOMPADDING", (0,0), (-1,-1), 9),
                                   ("LEFTPADDING", (0,0), (-1,-1), 0), ("RIGHTPADDING", (0,0), (-1,-1), 0)]))
            story.append(t); story.append(Spacer(1, 10))

        elif k == "h1":
            story.append(Paragraph(esc(b[1]), S["h1"]))
        elif k == "h2":
            story.append(Paragraph(esc(b[1]), S["h2"]))
        elif k == "p":
            lead = b[2] if len(b) > 2 and b[2] else ""
            s = (f'<font name="{FB}">{esc(lead)}</font>' if lead else "") + esc(b[1])
            story.append(Paragraph(s, S["body"]))
        elif k == "praw":
            story.append(Paragraph(b[1], S["body"]))
        elif k == "small":
            story.append(Paragraph(b[1], S["small"]))
        elif k == "spacer":
            story.append(Spacer(1, b[1]))
        elif k == "rule":
            story.append(Spacer(1, 6)); story.append(Rule(T.RULE, 0.6, 0)); story.append(Spacer(1, 8))
        elif k == "footer":
            story.append(Spacer(1, 10)); story.append(Rule(T.RULE, 0.6, 0)); story.append(Spacer(1, 6))
            story.append(_plain([[Paragraph(esc(b[1]), S["tiny"]), Paragraph(esc(b[2]), S["tinyR"])]],
                                [CW * 0.66, CW * 0.34]))
    doc.build(story)
