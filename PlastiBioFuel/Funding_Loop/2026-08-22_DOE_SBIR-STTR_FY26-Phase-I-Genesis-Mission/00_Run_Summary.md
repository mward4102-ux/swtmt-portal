# Funding Loop Run Summary

**Run date:** Saturday, 2026-08-22 (manual run; not a Tuesday or Thursday cadence run, so the Thursday reconciliation pass does not apply)
**Selected:** DOE SBIR/STTR FY26 Phase I, Genesis Mission, Topic 1 (Scaling the Biotechnology Revolution)
**Deadline:** Thursday, September 10, 2026 at 2:00 PM ET
**Value:** up to $250,000 Phase I ($256,500 with TABA), no cost share
**Portal:** DOE SBIR/STTR Acquisition Management Portal (AMP), https://sbirsttr-amp.ati.org/
**Opportunity page:** https://sbir-sttr.connectwerx.org/portfolio-items/fy26genesismission/

---

## Michael must supply

Two items. Both are one-line fills. Neither blocks submission.

**1. Name of the computational lead.** The pitch is scored in part on Team Qualifications and the proposed work is computational. PlastiBioFuel has no machine learning lead on file. Question 4 as written is complete and submittable without one. If you have a name (a modeling consultant, a UNT computational chemist, or yourself if you will do the modeling), insert this sentence into Question 4 immediately after the sentence ending "runs day-to-day wet lab work":

> `[NAME]`, `[one-line credential]`, leads model development.

That adds roughly 8 to 12 words, which Question 4 has room for at 181 words.

**2. Your call on disclosure posture.** DOE states that pitches should not contain proprietary or business sensitive information. Question 2 cites four specific preliminary results: HPLC-confirmed depolymerization of real post-consumer bottle PET, near-complete framework loading with retained activity, product formation linear through 24 hours, and turnover-frequency decline tracking substrate depletion. Those data are what make the pitch credible, and USPTO provisional 63/848,456 (July 2025) already covers the immobilization system, reactor geometry, and integrated process. My read is that the disclosure is worth it and the exposure is limited. It is your call, not a legal defect either way. If you want it removed, delete the Feasibility paragraph from Question 2 and the answer still stands at 128 words.

---

## Why this one won

Nineteen days of runway, a two-hour first stage, and no cost share. The pitch is four open-text answers plus an optional bibliography. Being invited costs almost nothing and buys access to a $250,000 Phase I and a staged path DOE values at up to $44,000,000 cumulative across a project lifecycle.

The topic fits without stretching. DOE named "accelerate bioreactor design and biomanufacturing" as an area of interest under Topic 1, for biochemicals and bioproducts applications. PlastiBioFuel holds the thing most AI-for-bioreactor applicants will not have: real continuous-operation data from a working immobilized-enzyme reactor running real high-crystallinity post-consumer PET.

One more point in favor. FAST-PETase was itself produced by a machine learning method (Lu et al., Nature 2022). Proposing to move that method up a level, from residue selection to reactor operating conditions, is a natural next step in the same lineage, and it reads that way to a reviewer.

## Scope separation from NSF 328095

| | NSF SBIR Phase I, proposal 328095 | DOE Genesis Mission Phase I pitch |
|---|---|---|
| Scope | COF-enzyme reusability, monomer-to-ethanol pathway, integrated lab-scale spiral reactor module | Physics-informed machine learning surrogate model of the immobilized-enzyme reactor, validated against held-out reactor runs |
| Nature of work | Wet chemistry and reactor hardware | Computational design layer |
| Shared tasks | None | None |
| Shared budget lines | None | None |

NSF 328095 is disclosed inside the DOE pitch text (Question 4) so DOE can confirm there is no duplicate funding. Ready-to-use certification language is in `04_Forms_and_Certifications_Checklist`.

## Eligibility, checked against the issuing site

- For-profit small business, U.S. place of business. PlastiBioFuel LLC, Haslet, Texas. **Passes.**
- 51 percent or more owned and controlled by U.S. citizens or permanent residents. **Passes.**
- 500 or fewer employees including all domestic and foreign affiliates. **Passes.**
- All R&D performed entirely within the United States. UNT is in Denton, Texas. **Passes.**
- SBIR route: PI primarily employed (more than 50 percent) by the small business, and the small business performs at least two-thirds of Phase I effort. Michael Ward as PI passes, and work share is controllable because the modeling work sits with the company. **Passes.**
- STTR route available if UNT should carry the larger share: small business at 40 percent or more, research institution at 30 percent or more, plus a written IP agreement before work begins.
- DOE does not make awards to small businesses majority-owned by multiple VC operating companies, hedge funds, or private equity firms. **Not applicable.**

## Open items carried forward

- **SRA1016 term gap.** The current SRA period ended 07/01/2026. The proposed amendment starts 09/01/2026 for 12 months and would expire 08/31/2027. A DOE Phase I awarded from this pitch would most likely start in 2027, so a 12-month period of performance runs past the end of the amended SRA term. Any budget narrative relying on the UNT subaward must state that gap and the plan to extend. Does not affect the pitch, which carries no budget.
- **Subaward timing.** Subaward documents are award-stage. UNT institutional sign-off is not required at submission under 2 CFR 200.332. Nothing here waits on Janis Miller or the UNT GCA.
- **SAM.gov currency.** The pitch does not require SAM, but the full application does and an invitation can arrive fast. DOE warns SAM renewal can take up to 8 weeks. Confirming the registration is active is step 1 of the submission checklist for that reason.

## Sweep coverage and what could not be verified

All four categories were checked. Full results with rejection reasons are in `../FUNDING_REGISTRY.md`.

**Two gaps to close manually.** SAM.gov contract opportunities and Grants.gov are both blocked by this environment's network egress policy (HTTP 403 at the proxy on every attempt). They are recorded as UNVERIFIED rather than as "nothing found," because those are different things. Category 3 of the sweep, federal contracts, BAAs, sources sought, and SDVOSB set-asides, was therefore not covered this run and needs a manual pass or an unrestricted session.

**Next windows worth holding.**
- **Activate Fellowship, Cohort 2027:** applications open **September 15, 2026** (confirmed on activate.org/apply). Non-dilutive, hardware and hard-tech, and the eligibility screen fits a first-time hard-tech founder. Build this on the first run after September 15.
- **DOE broader Phase I:** DOE has stated on its own site that a Phase I opportunity covering additional technology topics opens in fall 2026. That one is a better fit for the reactor hardware work than the Genesis Mission AI framing.

## Files in this package

| File | Purpose |
|---|---|
| `01_Opportunity_Brief` | One-page brief. Every required field plus the verification timestamp. |
| `02_Pitch_Responses` | The four pitch answers with word counts, plus optional add-on sentences. Copy and paste into AMP. |
| `03_Bibliography_and_References_Cited` | Optional PDF upload. Six peer-reviewed references verified against PubMed, plus the provisional patent. |
| `PlastiBioFuelBibliography.pdf` | The same file renamed for upload. Letters only in the filename, per the solicitation's file-naming rule. |
| `04_Forms_and_Certifications_Checklist` | Stage 1 and Stage 2, with each Stage 2 row marked Confirmed or Anticipated. Includes ready-to-use duplicate-funding language. |
| `05_Submission_Checklist` | Fourteen numbered steps from prerequisites to confirmation, and the answer to where Michael signs. |
| `content.py` | Every document above, written once as a block list. `../generator/build.py` renders it to both formats. |

Every narrative document is provided as `.docx` with a `.pdf` companion. Both come
from the one content model in `content.py`, so the Word file and the PDF cannot
drift apart.

## Design

The documents are set in the PlastiBioFuel house style: deep blue `#045AA9`, white
ground, `#D50057` used only for urgency and warnings, `#2A2A2A` body text, hairline
rules, no heavy borders. Headings are Aptos Display with Calibri and Segoe UI
Semibold as fallbacks; body is Aptos falling back to Calibri. The PDF companion
sets in Helvetica.

The layout was drawn on a design canvas first. Those artboards live in
`../design/` as `.dc.html` files with `canvas.json`, and the block vocabulary that
reproduces them in Word and PDF is documented in `../generator/README.md`.

To rebuild after editing `content.py`:

```
python3 PlastiBioFuel/Funding_Loop/generator/build.py \
        PlastiBioFuel/Funding_Loop/2026-08-22_DOE_SBIR-STTR_FY26-Phase-I-Genesis-Mission
```
