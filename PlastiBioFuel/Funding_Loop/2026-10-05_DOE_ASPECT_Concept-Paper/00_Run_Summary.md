# ASPECT concept paper package, built 2026-10-05

**Opportunity:** DOE ASPECT, DE-FOA-0003647. Topic Area 1, Subtopic Area 1a.
**Concept paper due:** 2026-10-09, 5:00 PM ET. Four days from this build.
**Submitted through:** DOE eXCHANGE only. Grants.gov is not an accepted route.
**Federal share sought:** $2,000,000 over 24 months, with the minimum 20 percent cost share.

## Why this was built now

The concept paper did not exist. The registry marked ASPECT "Package built" on the
strength of a teaming-list package from 2026-08-25 and an Opportunity Brief from
2026-09-11, and that flag is what stopped four consecutive runs from writing the
application itself. The 2026-10-02 run produced readiness paperwork and said so
plainly: "The 2026-09-11 concept paper itself was not rebuilt." The only remaining
scheduled run fires 2026-10-09 at 14:13Z, about seven hours before the deadline,
which is too late for review and submission.

The feedstock go/no-go that had been carried as a hard block since 2026-09-23 was
resolved on 2026-09-25 from DOE's own published webinar transcript. See
`2026-09-25_ASPECT_Appendix-A_Resolution.md`.

## What is here

| File | Purpose |
|---|---|
| `content.py` | Every document below, written once as a block list |
| `01_Opportunity_Brief` | One page. Agency, announcement, dates, award range, cost share, portal, eligibility, and the dated verification line |
| `02_Concept_Paper` | **The deliverable.** Four pages against a five-page cap |
| `03_Bibliography_and_References_Cited` | Six peer-reviewed sources re-verified against PubMed by PMID on 2026-10-05, plus the provisional patent |
| `04_Forms_and_Certifications_Checklist` | Concept paper stage and Stage 1, each row marked confirmed or anticipated, plus ready-to-use generative AI disclosure language |
| `05_Submission_Checklist` | Ten numbered steps, four of them checks only Michael can perform |

Each renders to `.docx` and `.pdf` from the one block list, so the two cannot drift.
`generator/audit.py` passes: house style clean, contact of record on every document,
327 strings checked for docx-to-pdf parity with 0 missing, brief at one page, concept
paper at four pages against the declared cap of five.

## How the concept paper is built

It follows DOE's four published concept paper evaluation factors, which carry equal
weight: eligibility; the technology, its uniqueness and innovativeness against the
state of the art, its risks and challenges including regulatory and financial aspects
with mitigation, and the impact of DOE funding; the applicant's qualifications and
resources; and whether the work would meet the NOFO's objectives.

Eight sections: the chemical and the feedstock; technology and what is new;
preliminary data; proposed work; risks and mitigation; qualifications and resources;
impact of DOE funding; other federal applications pending.

## Three decisions worth reviewing

**Subtopic 1a, not 1b.** 1b excludes work on strain discovery, heterogeneous
catalysis, catalysts in powder form, thermocatalytic processes, and electrocatalytic
cells. A framework-immobilized enzyme is arguably heterogeneous biocatalysis on a
powder support, which makes 1b a responsiveness hazard. 1a carries none of those
exclusions and matches the stage of the work: past proof of concept, needing
bench-scale development. 1a also caps at $5,000,000 federal share in one phase.

**Terephthalic acid, not fuel.** DOE lists primary products solely used as fuels, and
ethanol as a final product, as specifically not of interest. The concept paper leads
with terephthalic acid as a commodity chemical and says in the first section that the
product is not a fuel and is not ethanol. No renewable fuel credit or low carbon fuel
standard framing appears anywhere, and ARG Petro is not mentioned. The company name
will invite the question regardless, which is why the denial is explicit and early.

**$2,000,000, the floor of the Topic Area 1 range.** A $5,000,000 ask needs
$1,250,000 of non-federal cost share. At the floor the share is $500,000 against a
$2,500,000 total project. That is a judgment call about what PlastiBioFuel can
actually match while a $800,000 raise is open, and it is Michael's to change.

## What the concept paper discloses rather than hides

- FAST-PETase came from the Alper group at UT Austin, published in Nature in 2022.
  PlastiBioFuel did not invent it and makes no claim to it.
- The reactor geometry is a validated simulation model, not hardware. No reactor
  wet-body material has been qualified; the candidate resin class is a screening
  candidate pending soak-coupon qualification as of 2026-10-01.
- The 80 degree C result is reported with its caveat attached: water evaporated, the
  figure is confounded, and the laboratory reads the gain as substrate access rather
  than enzyme kinetics.
- Provisional 63/848,456 conversion and freedom to operate on FAST-PETase are both
  named as open diligence items with counsel.
- SRA1016 runs to 2027-08-31 and needs an amendment before a 2027 period of
  performance.
- NSF proposal 328095 is disclosed, with the three scopes it covers that this
  application does not.

## What only Michael can do

1. **Open NOFO Part 1 and the concept paper template on eXCHANGE.** This container
   cannot retrieve either; both are Word files and both hosts are refused. Check the
   concept paper against the template's field list in section 4.C and reorder if
   needed. The content is right; the headings may not match.
2. **Read Appendix A as modified**, and the Question and Answer Log dated 2026-09-24.
   Feedstock eligibility rests on DOE's 2026-09-11 webinar transcript, which predates
   Modification 000002.
3. **Confirm the cost share basis.** Stated here as 20 percent of total project cost,
   the standard DOE basis, and flagged in the Forms checklist as needing confirmation.
4. **Submit on 2026-10-07 or 2026-10-08**, not on the ninth. Any change made after
   the submit button is pressed unsubmits the application.

## What submitting commits

Nothing. DOE stated that applicants are not obligated to apply after submitting a
concept paper and are not bound to the statements in it. What it buys is eligibility:
Stage 1 is open only to applicants whose concept paper DOE reviewed and found
eligible, and DOE will not review a Stage 1 application from anyone it did not invite.

## Registry correction required

The ASPECT row in `FUNDING_REGISTRY.md` should move from "Package built" to the actual
state, and the Topic Area 1 numbers should replace the $2M to $20M headline, which
spans both topic areas. Letters of commitment fall at Stage 1 on 2026-12-01, not with
the concept paper.
