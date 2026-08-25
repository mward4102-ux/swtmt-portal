#!/usr/bin/env python3
"""Audit a built funding package against the standing rules.

    python3 generator/audit.py <run-directory>

Checks, in order: pitch word limits, house style, the contact of record on every
document, that every word in each .docx also reaches its .pdf, that upload
aliases still match their source, and that the one-page brief is still one page.
Exits non-zero on any failure so a run cannot be shipped on a stale build.
"""
import base64, html, importlib.util, os, re, sys, zipfile, zlib

WORD_LIMITS = {"01": 100, "02": 200, "03": 200, "04": 200}   # default; a run may declare its own
BANNED = ["delve", "dive into", "landscape", "tapestry", "testament to",
          "game-changer", "unlock", "elevate", "seamless", "robust",
          "leverage", "supercharge"]
CONTACT = "michael@plastibiofuel.com"
PROSE = ["00_Run_Summary.md", "content.py", "source/README.md"]

norm = lambda s: re.sub(r"[^a-z0-9]", "", s.lower())


def load(path):
    spec = importlib.util.spec_from_file_location("run_content", path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def docx_runs(path):
    """Text of <w:t> elements only. <w:tbl> and <w:tc> also start with 'w:t'."""
    with zipfile.ZipFile(path) as z:
        xml = z.read("word/document.xml").decode("utf-8")
    return [html.unescape(s) for s in re.findall(r"<w:t(?:\s[^>]*)?>(.*?)</w:t>", xml, re.S)]


def _unescape(b):
    b = re.sub(rb"\\([nrtbf])", lambda m: {b"n": b"\n", b"r": b"\r", b"t": b"\t",
                                           b"b": b"", b"f": b""}[m.group(1)], b)
    b = re.sub(rb"\\([0-7]{1,3})", lambda m: bytes([int(m.group(1), 8) & 0xFF]), b)
    return re.sub(rb"\\(.)", rb"\1", b)


def pdf_text(path):
    parts = []
    for m in re.finditer(rb"stream\r?\n(.*?)endstream", open(path, "rb").read(), re.S):
        data = m.group(1).rstrip(b"\r\n")
        try:
            data = zlib.decompress(base64.a85decode(data, adobe=True))
        except Exception:
            try:
                data = zlib.decompress(data)
            except Exception:
                continue
        parts += [_unescape(t.group(0)[1:-1])
                  for t in re.finditer(rb"\((?:\\.|[^\\()])*\)", data)]
    return b" ".join(parts).decode("latin-1")


def pdf_body(path):
    """Normalized PDF text with the running page footer removed.

    Every page carries "PlastiBioFuel LLC" plus a page number, which interleaves
    with body text at page breaks. The document footer starts the same way but is
    followed by a five-digit street number, so a one-or-two-digit lookahead keeps
    real content intact.
    """
    return re.sub(r"plastibiofuelllc(\d{1,2})(?!\d)", "", norm(pdf_text(path)))


def pages(path):
    return len(re.findall(rb"/Type\s*/Page[^s]", open(path, "rb").read()))


def main(run_dir):
    content = load(os.path.join(run_dir, "content.py"))
    at = lambda *p: os.path.join(run_dir, *p)
    docx = sorted(f for f in os.listdir(run_dir) if f.endswith(".docx"))
    fails = []

    def check(ok, label, detail=""):
        print(f"  {'ok  ' if ok else 'FAIL'}  {label}" + (f"  ->  {detail}" if detail and not ok else ""))
        if not ok:
            fails.append(label)

    print("=== pitch word limits ===")
    limits = getattr(content, "WORD_LIMITS", WORD_LIMITS)
    if not limits:
        print("  ok    none declared for this run")
    else:
        for q, limit in limits.items():
            count = content._COUNT[q]
            check(count <= limit, f"Q{q}: {count} / {limit}")
        print(f"        total {content._TOTAL}")

    print("\n=== house style ===")
    for f in docx + [p for p in PROSE if os.path.exists(at(p))]:
        text = " ".join(docx_runs(at(f))) if f.endswith(".docx") else open(at(f), encoding="utf-8").read()
        hits = [name for ch, name in (("—", "em dash"), ("–", "en dash"), ("~", "tilde")) if ch in text]
        hits += [w for w in BANNED if re.search(r"\b" + re.escape(w), text.lower())]
        check(not hits, f, str(hits))

    print("\n=== contact of record ===")
    for f in docx:
        text = " ".join(docx_runs(at(f)))
        check(CONTACT in text and not re.search(r"@(my\.)?unt\.edu", text), f,
              "missing contact" if CONTACT not in text else "university address present")

    print("\n=== docx / pdf parity ===")
    checked = missing = 0
    for name in content.DOCS:
        body = pdf_body(at(name + ".pdf"))
        strings = [s for s in docx_runs(at(name + ".docx")) if norm(s)]
        gone = [s for s in strings if norm(s) not in body]
        checked += len(strings); missing += len(gone)
        check(not gone, f"{name}: {len(strings)} strings", f"{len(gone)} missing, first {gone[:1]}")
    print(f"        {checked} strings checked, {missing} missing")

    print("\n=== upload aliases ===")
    for alias, source in getattr(content, "UPLOADS", {}).items():
        same = pdf_text(at(alias + ".pdf")) == pdf_text(at(source + ".pdf"))
        check(same and alias.isalpha(), f"{alias}.pdf mirrors {source}",
              "text differs" if not same else "filename is not letters only")

    print("\n=== page counts ===")
    for f in sorted(x for x in os.listdir(run_dir) if x.endswith(".pdf")):
        n = pages(at(f))
        check(not (f.startswith("01_") and n != 1), f"{f}: {n} page(s)", "brief must stay on one page")

    print("\n" + ("ALL CHECKS PASS" if not fails else f"{len(fails)} FAILURE(S): " + "; ".join(fails)))
    return 1 if fails else 0


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    sys.exit(main(sys.argv[1]))
