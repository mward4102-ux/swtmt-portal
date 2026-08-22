#!/usr/bin/env python3
"""Regenerate Pitch.dc.html from a run's content.py so the canvas cannot drift
from the deliverables. Run after editing the pitch answers.

    python3 design/build_pitch_artboard.py <run-directory>
"""
import importlib.util, os, sys, html

HERE = os.path.dirname(os.path.abspath(__file__))


def load(p):
    spec = importlib.util.spec_from_file_location("run_content", p)
    m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
    return m


def esc(t):
    return html.escape(t, quote=False)


HEAD = '''<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700&family=Figtree:wght@400;500;600&display=swap">
  <style>
    body { margin: 0; background: #FFFFFF; }
    * { box-sizing: border-box; }
    a { color: #045AA9; text-decoration: none; }
    a:hover { color: #023A6E; }
    .disp { font-family: 'Archivo', 'Aptos Display', 'Segoe UI Semibold', Calibri, sans-serif; }
    .body { font-family: 'Figtree', 'Aptos', Calibri, 'Segoe UI', sans-serif; }
    .num { font-variant-numeric: tabular-nums; letter-spacing: -0.02em; }
    .ans { font-size: 15.5px; line-height: 1.62; color: #2A2A2A; margin: 0 0 13px 0; text-wrap: pretty; }
    .lead { font-family: 'Archivo', 'Aptos Display', Calibri, sans-serif; font-weight: 600; color: #045AA9; }
    .pill { flex-shrink: 0; font-size: 11px; font-weight: 600; letter-spacing: 0.08em; color: #FFFFFF; background: #045AA9; padding: 4px 10px; border-radius: 2px; }
    .qhead { display: flex; justify-content: space-between; align-items: baseline; gap: 16px; border-bottom: 1px solid #E3E8EF; padding-bottom: 9px; margin-bottom: 14px; }
    .qnum { width: 72px; flex-shrink: 0; font-size: 54px; font-weight: 700; color: #D7E6F5; line-height: 0.86; }
    .addon { margin-top: 6px; border-left: 2px dashed #C9D6E4; padding: 3px 0 3px 16px; }
    .addonl { font-size: 9.5px; font-weight: 600; letter-spacing: 0.13em; color: #6B7684; margin-bottom: 5px; }
    .srow { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0; padding: 7px 0; border-bottom: 1px solid #E6EDF4; }
  </style>
</helmet>

<div class="body" style="width: 816px; background: #FFFFFF; color: #2A2A2A; padding-bottom: 40px;">

  <div style="background: #045AA9; padding: 18px 56px 16px 56px; display: flex; justify-content: space-between; align-items: baseline;">
    <div class="disp" style="color: #FFFFFF; font-size: 15px; font-weight: 700; letter-spacing: 0.16em;">PLASTIBIOFUEL</div>
    <div class="disp" style="color: #9EC8F0; font-size: 11px; font-weight: 600; letter-spacing: 0.20em;">PITCH RESPONSES</div>
  </div>
  <div style="height: 4px; background: {{accent}};"></div>

  <div style="padding: 34px 56px 0 56px;">
    <div class="disp" style="color: #045AA9; font-size: 12px; font-weight: 600; letter-spacing: 0.14em; margin-bottom: 11px;">DOE SBIR/STTR FY26 PHASE I &middot; GENESIS MISSION</div>
    <h1 class="disp" style="margin: 0; font-size: 38px; line-height: 1.06; font-weight: 700; letter-spacing: -0.025em;">Topic 1, Scaling the<br>Biotechnology Revolution</h1>
    <div style="margin-top: 14px; font-size: 15px; line-height: 1.55; color: #4A5561; max-width: 620px;">Copy each answer into the matching open-text field in AMP. Word counts are shown so you can check them against the Pitch Development Guide before pasting. Images and video are not enabled, so all four answers are plain text.</div>
  </div>

  <div style="margin: 26px 56px 0 56px; border-top: 2px solid #2A2A2A; border-bottom: 1px solid #E3E8EF; padding: 18px 0;">
    <div class="disp" style="font-size: 10px; font-weight: 600; letter-spacing: 0.15em; color: #045AA9; margin-bottom: 7px;">PROJECT TITLE TO ENTER IN AMP</div>
    <div class="disp" style="font-size: 18px; line-height: 1.34; font-weight: 600; color: #2A2A2A; max-width: 660px;">Physics-Informed Machine Learning for Design of Continuous Immobilized-Enzyme Reactors Converting Post-Consumer PET to Fuel-Grade Ethanol</div>
    <div style="margin-top: 12px; display: flex; align-items: center; gap: 9px;">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="{{accent}}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><path d="M12 9v4"></path><path d="M12 17h.01"></path><path d="M10.3 3.9L2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"></path></svg>
      <div style="font-size: 13.5px; color: #2A2A2A;"><span style="font-weight: 600;">Topic selection is permanent.</span> Topic and prime small business cannot change between pitch and full application.</div>
    </div>
  </div>
'''

TAIL = '''
  <div style="margin: 24px 56px 0 56px; display: flex; gap: 14px; align-items: flex-start; border-top: 1px solid #E3E8EF; padding-top: 18px;">
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="{{accent}}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; margin-top: 1px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><path d="M7 10l5-5 5 5"></path><path d="M12 5v13"></path></svg>
    <div>
      <div class="disp" style="font-size: 15px; font-weight: 600; color: #2A2A2A; margin-bottom: 5px;">Optional upload: Bibliography and References Cited</div>
      <div style="font-size: 14px; line-height: 1.55; color: #4A5561; max-width: 620px;">Prepared and included in this package. Worth uploading: it substantiates the statement that PlastiBioFuel did not invent the enzyme, and it shows the UNT partner's published record in enzyme immobilization in covalent organic frameworks.</div>
    </div>
  </div>

  <div style="border-top: 1px solid #E3E8EF; margin: 26px 56px 0 56px; padding: 12px 0 0 0; display: flex; justify-content: space-between; font-size: 11px; color: #6B7684;">
    <div>PlastiBioFuel LLC &middot; Michael David Ward, Founder and CEO &middot; michael@plastibiofuel.com &middot; 817-319-7383</div>
    <div class="num">UEI KQAWZ54RDUM8 &middot; CAGE 175D6</div>
  </div>

</div>
</x-dc>
<script data-dc-script data-props='{"accent":{"editor":"color","default":"#D50057","options":["#D50057","#045AA9","#B8860B","#0F766E"]},"$preview":{"width":816,"height":%HEIGHT%}}'>
class Component extends DCLogic {
  renderVals() {
    return { accent: this.props.accent ?? '#D50057' };
  }
}
</script>
</body>
</html>
'''


def main(run_dir):
    c = load(os.path.join(run_dir, "content.py"))
    out = [HEAD]
    for num, title, paras, addon_key in c._QS:
        out.append(f'''
  <div style="margin: 34px 56px 0 56px; display: flex; gap: 24px;">
    <div class="disp num qnum">{num}</div>
    <div style="flex-grow: 1;">
      <div class="qhead">
        <div class="disp" style="font-size: 19px; font-weight: 600; color: #045AA9;">{esc(title)}</div>
        <div class="disp num pill">{c._COUNT[num]} WORDS</div>
      </div>''')
        for lead, text in paras:
            lead_html = f'<span class="lead">{esc(lead)}</span> ' if lead else ""
            out.append(f'      <p class="ans">{lead_html}{esc(text)}</p>')
        if addon_key:
            a = c.ADDON[addon_key]
            out.append(f'''      <div class="addon">
        <div class="disp addonl">OPTIONAL ADD-ON, ONLY IF THE GUIDE ALLOWS MORE WORDS &middot; {c._wc(a)} WORDS</div>
        <div style="font-size: 14px; line-height: 1.55; color: #4A5561;">{esc(a)}</div>
      </div>''')
        out.append("    </div>\n  </div>")

    rows = "".join(f'''
    <div class="srow">
      <div style="font-size: 14px;">{n}. {esc(t)}</div>
      <div class="num" style="font-size: 14px; text-align: right;">{c._COUNT[n]}</div>
      <div class="num" style="font-size: 14px; text-align: right; color: #6B7684;">{c._WITH[n]}</div>
    </div>''' for n, t, _p, _k in c._QS)

    out.append(f'''
  <div style="margin: 40px 56px 0 56px; background: #F2F7FC; padding: 24px 28px;">
    <div class="disp" style="font-size: 12px; font-weight: 600; letter-spacing: 0.14em; color: #045AA9; margin-bottom: 16px;">WORD COUNT SUMMARY</div>
    <div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0; border-bottom: 1px solid #D7E2ED; padding-bottom: 8px; margin-bottom: 4px;">
      <div class="disp" style="font-size: 10px; font-weight: 600; letter-spacing: 0.12em; color: #6B7684;">QUESTION</div>
      <div class="disp" style="font-size: 10px; font-weight: 600; letter-spacing: 0.12em; color: #6B7684; text-align: right;">AS WRITTEN</div>
      <div class="disp" style="font-size: 10px; font-weight: 600; letter-spacing: 0.12em; color: #6B7684; text-align: right;">WITH ADD-ON</div>
    </div>{rows}
    <div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0; padding: 10px 0 0 0; border-top: 2px solid #045AA9;">
      <div class="disp" style="font-size: 15px; font-weight: 700; color: #045AA9;">Total</div>
      <div class="disp num" style="font-size: 20px; font-weight: 700; text-align: right; color: #045AA9;">{c._TOTAL}</div>
      <div class="disp num" style="font-size: 20px; font-weight: 700; text-align: right; color: #6B7684;">{c._TOTAL_WITH}</div>
    </div>
    <div style="font-size: 13.5px; line-height: 1.55; color: #4A5561; margin-top: 16px;">Question 1 is held under 100 words. If the Pitch Development Guide sets higher limits, append the add-on sentences. If it sets lower limits, the answers cut cleanly at paragraph boundaries. Drop the Feasibility paragraph from Question 2 last, since it carries the preliminary data that makes the pitch credible.</div>
  </div>''')

    body = "\n".join(out) + TAIL
    # generous: measured content plus about 6 percent, so a font swap cannot clip
    est = (1180 + sum(len(t) for _n, _t, ps, _k in c._QS for _l, t in ps) // 4 + 900) * 1.06
    body = body.replace("%HEIGHT%", str(int(est / 50) * 50))
    open(os.path.join(HERE, "Pitch.dc.html"), "w").write(body)
    print("wrote Pitch.dc.html from", os.path.basename(run_dir), "| est height", int(est / 50) * 50)


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else
         os.path.join(HERE, "..", "2026-08-22_DOE_SBIR-STTR_FY26-Phase-I-Genesis-Mission"))
