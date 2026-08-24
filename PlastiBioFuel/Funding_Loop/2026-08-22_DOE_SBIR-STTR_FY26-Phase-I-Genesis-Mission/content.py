# -*- coding: utf-8 -*-
"""PlastiBioFuel funding documents in the redesigned block vocabulary."""
CONTACT_L = "PlastiBioFuel LLC  ·  12380 Iveson Drive, Haslet, TX 76052  ·  michael@plastibiofuel.com  ·  817-319-7383"
CONTACT_R = "UEI KQAWZ54RDUM8  ·  CAGE 175D6"
EYE = "DOE SBIR/STTR FY26 PHASE I  ·  GENESIS MISSION"

# ------------------------------------------------------------------ BRIEF
brief = [
 ("masthead", "OPPORTUNITY BRIEF"),
 ("hero", "U.S. DEPARTMENT OF ENERGY  ·  SBIR AND STTR",
  "FY26 Phase I\nGenesis Mission",
  "Topic 1, Scaling the Biotechnology Revolution. A physics-informed machine learning model for design of the immobilized-enzyme reactor."),
 ("stats", [("AWARD CEILING", "$250,000", "$256,500 with TABA"),
            ("PITCH CLOSES", "Sep 10", "2026, 2:00 PM Eastern"),
            ("COST SHARE", "$0", "None required at Phase I")]),
 ("alert", "Nineteen days out as of this brief. Late submissions are not accepted."),
 ("factgrid", [
   ("AGENCY", "DOE Office of Technology Commercialization. Administered by ConnectWerx, operated by Advanced Technology International."),
   ("PROGRAM", "Small Business Innovation Research and Small Business Technology Transfer."),
   ("ANNOUNCEMENT NUMBER", "None issued. DOE assigned no DE-FOA number; identified by title on the DOE SBIR/STTR Application Hub."),
   ("MECHANISM", "Phase I, two stage. A pitch gates the full application. SBIR or STTR elected later."),
   ("TOPIC AND SUBTOPIC", "Topic 1, Scaling the Biotechnology Revolution. No subtopics."),
   ("PERIOD OF PERFORMANCE", "6 to 12 months. Exact term set during award negotiation."),
 ]),
 ("factwide", "SUBMISSION PORTAL AND DIRECT URL",
  'DOE SBIR/STTR Acquisition Management Portal (AMP), <font color="#045AA9">sbirsttr-amp.ati.org</font>. '
  'Account requests at <font color="#045AA9">register.ati.org</font>. Opportunity page: '
  '<font color="#045AA9">sbir-sttr.connectwerx.org/portfolio-items/fy26genesismission</font>'),
 ("tint", "WINDOW VERIFIED", None,
  "Saturday, August 22, 2026, 13:45 to 14:30 UTC. Verified by direct fetch of two issuing-agency pages: the DOE announcement at energy.gov and the ConnectWerx opportunity page. Both state September 10, 2026 at 2:00 PM ET."),
 ("footer", CONTACT_L, CONTACT_R),
]

# ------------------------------------------------------------------ PITCH
# Answers are the source of truth; every word count on the page is computed
# from them, so edits here cannot leave a stale number anywhere else.
import re as _re
_wc = lambda t: len(_re.findall(r"\S+", t))

Q1 = [(None,
  "PlastiBioFuel is building a route from post-consumer PET to fuel-grade ethanol using a PET "
  "hydrolase immobilized in a covalent organic framework. The continuous spiral-flow reactor was "
  "designed in simulation: flow, channel geometry, and reusability modeled across more than a "
  "million runs. Wet-lab work at UNT confirms the enzyme and "
  "immobilization chemistry the design depends on, and identifies mass transfer as the limit. "
  "Transport is what reactor geometry decides. Phase I closes the gap between the model and "
  "hardware, turning it into a design tool with quantified error. That is AI applied to "
  "bioreactor design and biomanufacturing, Topic 1.")]

Q2 = [
 ("Significance.",
  "Enzymatic PET recycling is limited by reactor engineering, not enzyme discovery, and conditions "
  "are still chosen one factor at a time."),
 ("Innovation.",
  "FAST-PETase was reported by the Alper group at UT Austin in 2022, itself produced by machine "
  "learning. PlastiBioFuel did not invent it. Our contributions, under USPTO provisional "
  "63/848,456, are the framework immobilization system, the computationally derived spiral-flow "
  "geometry, and the integrated process. Phase I moves machine learning from residue selection to "
  "reactor operation."),
 ("Feasibility.",
  "Three UNT milestones closed ahead of schedule in a report signed by Prof. Shengqian Ma. Free "
  "FAST-PETase breaks real post-consumer water bottle PET to terephthalic acid, confirmed by "
  "HPLC against standards. It loads into TAPB-BPDA-COF with no protein detectable at 280 nm. "
  "Immobilized turnover measured 122 \u00b5mol/h/mg at 24 hours against a 246 to 348 "
  "literature range for free enzyme, which UNT attributes to mass transfer down the COF channel "
  "and poor pre-treatment. A run at 80 \u00b0C gave 3.6 times the standard rate, though water loss "
  "leaves it confounded, and the lab reads the gain as substrate access rather "
  "than kinetics. Two independent observations, one cause: transport. Phase I quantifies where the "
  "model is trustworthy and ranks the experiments that separate transport from kinetics."),
]

Q3 = [
 ("Value proposition.",
  "The intended product is fuel-grade ethanol from a waste feedstock. Post-consumer PET is abundant, "
  "domestically sourced, priced well below agricultural feedstock, and it does not compete with "
  "food production. Low carbon fuel standard credit value applies to the finished fuel and is the "
  "firmer part of the value case. Federal renewable identification number eligibility remains "
  "subject to final renewable-fuel pathway qualification, and we do not assume it."),
 ("Competitive advantage.",
  "Pyrolysis carries high energy cost; mechanical recycling degrades polymer every cycle. "
  "Enzymatic recyclers returning monomer to virgin-equivalent resin sell into the resin "
  "market, so our offtake channel does not overlap theirs. Software vendors modeling bioprocess do "
  "not hold the chemistry; we have wet-lab confirmation of the immobilization and enzyme behavior "
  "our design depends on. Wet-lab groups iterate hardware one build at a time; our geometry was "
  "searched in simulation first. Holding both shortens the bench-to-plant step, where enzymatic "
  "routes stall."),
 ("Go to market.",
  "We are in offtake discussions with ARG Petro, a regional fuel distributor, and have their "
  "interest. Texas puts PET waste aggregation, refining infrastructure, and fuel blending demand "
  "in one region. The Phase I output is a sizing and operating envelope for the first modular "
  "unit, so the model feeds a capital decision."),
]

Q4 = [
 ("Company.",
  "Michael David Ward, Founder and CEO, is the principal investigator and is primarily employed "
  "by PlastiBioFuel. He built the project's simulation and modeling capability and runs it "
  "himself, so the computational work Phase I extends stays inside the company rather than "
  "moving to a subcontractor. PlastiBioFuel is a service-disabled veteran-owned small business "
  "verified through SBA VetCert and holds USPTO provisional 63/848,456. Its laboratory program "
  "produced the preliminary data cited here. All work will be performed in the United States."),
 ("Partnerships.",
  "The University of North Texas is our research partner under executed Sponsored Research "
  "Agreement SRA1016, with a $250,000 extension under negotiation. Dr. Shengqian Ma, Department "
  "of Chemistry, leads covalent organic framework and immobilization chemistry; his group has "
  "published on enzyme immobilization in covalent organic frameworks. Dr. Joshua Phipps, "
  "postdoctoral researcher, runs day-to-day wet lab "
  "work. The partnership gives Phase I reactor access, HPLC analytics, and materials "
  "characterization with no capital spending."),
 ("Follow-on funding.",
  "PlastiBioFuel has a separate NSF SBIR Phase I proposal, Research.gov 328095, submitting "
  "against the November 4, 2026 window. That proposal covers wet chemistry and reactor hardware "
  "and does not overlap the computational scope proposed here. We disclose it so DOE can confirm "
  "there is no duplicate funding."),
]

ADDON = {
 "Q2": "Phase I ends with a measured number rather than a claim: quantified uncertainty on the model's reactor-scale predictions, and a ranked experiment sequence to close it.",
 "Q3": "A first modular unit sited near a Texas PET aggregation point is the specific commercial target that Phase I is meant to de-risk.",
 "Q4": "Marshall Nadel is a seed investor in PlastiBioFuel, and Patrick Tarlton of the Texas Concrete Association supports business development.",
}

_QS = [("01", "Summary, Topic, and Mission Alignment", Q1, None),
       ("02", "Technical Promise", Q2, "Q2"),
       ("03", "Commercialization Potential", Q3, "Q3"),
       ("04", "Team Qualifications", Q4, "Q4")]
_COUNT = {n: sum(_wc(t) for _, t in q) for n, _, q, _k in _QS}
_TOTAL = sum(_COUNT.values())
_WITH = {n: _COUNT[n] + (_wc(ADDON[k]) if k else 0) for n, _, _q, k in _QS}
_TOTAL_WITH = sum(_WITH.values())

pitch = [
 ("masthead", "PITCH RESPONSES"),
 ("hero", EYE, "Topic 1, Scaling the\nBiotechnology Revolution",
  "Copy each answer into the matching open-text field in AMP. Word counts are shown so you can check them against the Pitch Development Guide before pasting. Images and video are not enabled, so all four answers are plain text."),
 ("stats", [("TOTAL WORDS", str(_TOTAL), "across four answers"),
            ("QUESTION 1", str(_COUNT["01"]), "held under 100"),
            ("TOPIC", "Locked", "after the pitch is submitted")]),
 ("factwide", "PROJECT TITLE TO ENTER IN AMP",
  '<font name="Helvetica-Bold">Physics-Informed Machine Learning for Design of Continuous Immobilized-Enzyme '
  'Reactors Converting Post-Consumer PET to Fuel-Grade Ethanol</font>'),
]
for _n, _t, _q, _k in _QS:
    _addon = ((f"OPTIONAL ADD-ON, ONLY IF THE GUIDE ALLOWS MORE WORDS  ·  {_wc(ADDON[_k])} WORDS", ADDON[_k])
              if _k else None)
    pitch.append(("qblock", _n, _t, f"{_COUNT[_n]} WORDS", _q, _addon))

pitch += [
 ("chip", "WORD COUNT SUMMARY", "As written  ·  With add-on"),
 ("kvrows", [(f"{_n}. {_t}", f"{_COUNT[_n]} words as written  ·  {_WITH[_n]} with add-on") for _n, _t, _q, _k in _QS]
            + [("Total", f"{_TOTAL} words as written  ·  {_TOTAL_WITH} with add-on")]),
 ("p", f"Question 1 is held under 100 words. If the Pitch Development Guide sets higher limits, append the add-on sentences. If it sets lower limits, the answers cut cleanly at paragraph boundaries. Drop the Feasibility paragraph from Question 2 last, since it carries the preliminary data that makes the pitch credible."),
 ("tint", "OPTIONAL UPLOAD: BIBLIOGRAPHY AND REFERENCES CITED", None,
  "Prepared and included in this package. Worth uploading: it substantiates the statement that PlastiBioFuel did not invent the enzyme, and it shows the UNT partner's published record in enzyme immobilization in covalent organic frameworks."),
 ("footer", "PlastiBioFuel LLC  ·  Michael David Ward, Founder and CEO  ·  michael@plastibiofuel.com  ·  817-319-7383", CONTACT_R),
]

# ------------------------------------------------------------ SUBMISSION
submit = [
 ("masthead", "SUBMISSION CHECKLIST"),
 ("hero", EYE, "Fourteen steps to\na submitted pitch",
  "Steps 1 through 4 are prerequisites and should be done this week. Steps 5 through 14 are the submission itself and take about thirty minutes once the account exists."),
 ("statbar", [("Sep 10, 2:00 PM ET", "DEADLINE"), ("About 30 minutes", "TIME REQUIRED"), ("None", "SIGNATURES NEEDED")]),
 ("chip", "PREREQUISITES", "Do this week"),
 ("step", 1, '<font name="Helvetica-Bold">Confirm the SAM.gov registration is active</font> and not within 60 days of expiry. Log in at sam.gov and check the entity record for PlastiBioFuel LLC, UEI KQAWZ54RDUM8. DOE warns SAM renewal can take up to 8 weeks, which makes an expiring registration the single biggest schedule risk in this package. The pitch itself does not require SAM, but the full application does and an invitation can arrive quickly.'),
 ("step", 2, '<font name="Helvetica-Bold">Confirm the SBA Company Registry record</font> is current and retrieve the SBC Control ID at app.www.sbir.gov/company-registration/overview. Under 10 minutes with the UEI in hand. Needed at full application, not at pitch.'),
 ("step", 3, '<font name="Helvetica-Bold">Request an AMP account</font> at register.ati.org using michael@plastibiofuel.com. Never a university student address. Allow one to two business days for approval, which is why this is step 3 and not step 9.'),
 ("step", 4, '<font name="Helvetica-Bold">Read the Pitch Development Guide</font> and note the word limit printed for each of the four questions. The answers are written to '
  + ", ".join(str(_COUNT[_n]) for _n in ("01", "02", "03")) + f", and {_COUNT['04']} words, {_TOTAL} total, with Question 1 held under 100."
  + ' If the Guide allows more, append the optional add-on sentences supplied with each answer. If it allows less, trim at the paragraph boundaries marked in the Pitch Responses document.'),
 ("chip", "SUBMISSION", "About 30 minutes"),
 ("step", 5, "Log in to AMP at sbirsttr-amp.ati.org/dashboard."),
 ("step", 6, "In the Open Solicitations section, find FY26 Phase I, Genesis Mission, click Respond, then click Proceed in the pop-up box."),
 ("step", 7, "Enter the project title: Physics-Informed Machine Learning for Design of Continuous Immobilized-Enzyme Reactors Converting Post-Consumer PET to Fuel-Grade Ethanol."),
 ("step", 8, "Select Topic 1, Scaling the Biotechnology Revolution. Select one topic only. Topic and prime small business cannot change between pitch and full application; title and team partners may shift slightly."),
 ("step", 9, "Paste the four answers from the Pitch Responses document into the four open-text fields, in order. Paste, do not retype. Images and video are not enabled."),
 ("step", 10, "Upload PlastiBioFuelBibliography.pdf. Requirements from the solicitation: Adobe PDF only, 5 MB or smaller, printable, no password, no ZIP or other formats, and no special characters in the filename. The supplied file is well under 5 MB and its name uses letters only."),
 ("step", 11, "Complete every field marked with a red asterisk. Do not enter proprietary or business sensitive information beyond what is already in the approved answer text."),
 ("step", 12, "Click Submit Application in the upper-right corner. This fixes the topic selection. Everything else can still be edited, and uploaded files replaced, until 2:00 PM ET on September 10."),
 ("step", 13, "Confirm receipt. ConnectWerx sends an email confirming the submission was accepted. If no email arrives within a few hours, contact sbir-sttr@connectwerx.org."),
 ("step", 14, "Log back in and verify that exactly one pitch is pending for PlastiBioFuel. DOE accepts up to three pitches per company and reviews only the three most recent by timestamp. Withdraw anything unintended before the deadline."),
 ("callout", "WHERE MICHAEL SIGNS",
  "Nowhere, at this stage. The pitch carries no certification, representation, or signature block. The first signature in this program comes at award negotiation, when PlastiBioFuel would enter a funding agreement with DOE and ConnectWerx. If the pitch is invited forward, the full application carries the eligibility and work-share certifications listed in the Forms and Certifications Checklist, signed by Michael Ward as Founder and CEO."),
 ("chip", "DATES TO HOLD", ""),
 ("kvrows", [
   ("Sep 10, 2026, 2:00 PM ET", "Pitch closes. Late submissions are not accepted."),
   ("After the deadline", "ConnectWerx emails the decision. Invited pitches may receive reviewer feedback. Declined pitches receive brief standardized feedback, and there is no resubmission for this opportunity."),
   ("Fall 2026", "DOE has stated that a broader Phase I opportunity covering additional technology topics will open. That is the next shot if this one does not land, and it is a better fit for the reactor hardware work."),
 ]),
 ("h1", "Recorded office hours"),
 ("small", '<font name="Helvetica-Bold" color="#2A2A2A">Part I, August 5, 2026.</font>  youtu.be/SKzaJ3W3nPM  ·  Presentation-Office-Hours-8.5.pdf  ·  Transcript-Office-Hours-8.5.pdf'),
 ("small", '<font name="Helvetica-Bold" color="#2A2A2A">Part II, August 12, 2026.</font>  youtube.com/watch?v=JYKvUx3voRI  ·  Phase-I-Pilot-Office-Hours-Webinar_2026.08.12.pdf  ·  Transcript-Office-Hours-8.12.pdf'),
 ("footer", "Questions to ConnectWerx: sbir-sttr@connectwerx.org  ·  DOE program feedback: sbir-sttr@hq.doe.gov",
  "Verified August 22, 2026"),
]

# ---------------------------------------------------------------- FORMS
DISCLOSURE = ("“PlastiBioFuel LLC has one other federal proposal pending: NSF SBIR Phase I, Research.gov proposal 328095, "
  "solicitation NSF 26-510, subtopic BT10 Synthetic Biology and Metabolic Engineering, total requested $304,955, submitting "
  "against the November 4, 2026 window. That proposal addresses COF-enzyme reusability, the monomer-to-ethanol biological "
  "conversion pathway, and construction of an integrated lab-scale spiral reactor module. The scope proposed to DOE is the "
  "computational design layer: a physics-informed machine learning surrogate model of the immobilized-enzyme reactor and its "
  "experimental validation. The two efforts share no tasks, no personnel effort months, and no budget lines. This is not "
  "essentially equivalent work, and no duplicate funding would result from award of both.”")

forms = [
 ("masthead", "FORMS AND CERTIFICATIONS"),
 ("hero", EYE, "Nothing to sign\nat the pitch stage",
  "DOE requires no forms, certifications, or representations at the pitch stage. The only gate is an AMP account. Stage 2 applies only if the pitch is invited forward, and DOE has not yet published the full-application forms package. Every Stage 2 row is marked by source so nothing anticipated is mistaken for something confirmed."),
 ("legend", [("confirmed", "Stated on a DOE or ConnectWerx page as of August 22, 2026"),
            ("anticipated", "Standard SBIR/STTR practice, not yet published here")]),
 ("chip", "STAGE 1  ·  PITCH", "Due Sep 10, 2026, 2:00 PM ET"),
 ("card", "required", "AMP account request", "register.ati.org", "Michael Ward, no signature", "Required before submission. Under 5 minutes to request, allow 1 to 2 business days for approval."),
 ("card", "ready", "Pitch submission form, four open-text answers", "AMP, sbirsttr-amp.ati.org", "No signature", "Text is written. See the Pitch Responses document in this package."),
 ("card", "required", "Topic selection, one only", "AMP submission form", "No signature", "Topic 1, Scaling the Biotechnology Revolution. Cannot be changed after submission."),
 ("card", "optional", "Bibliography and References Cited", "AMP file upload, PDF, 5 MB or smaller", "No signature", "Prepared. Upload the file named PlastiBioFuelBibliography.pdf."),
 ("card", "na", "Certifications and representations", "Not applicable", "Not applicable", "None required at pitch stage. Confirmed against the ConnectWerx opportunity page and FAQ on August 22, 2026."),
 ("card", "na", "SBIR versus STTR election", "Not applicable", "Not applicable", "Not made at pitch. DOE states pitches are not evaluated separately for SBIR and STTR."),
 ("chip", "STAGE 2  ·  FULL APPLICATION", "Only if invited"),
 ("card", "confirmed", "Active SAM.gov registration and UEI", "sam.gov/entity-registration", "Michael Ward as Entity Administrator", "UEI KQAWZ54RDUM8 must be entered on the application."),
 ("card", "confirmed", "SBA Company Registry registration and proof", "app.www.sbir.gov/company-registration", "Michael Ward", "Proof of registration is required as part of the application."),
 ("card", "confirmed", "Small Business Concern eligibility representation", "Full application", "Michael Ward, Founder and CEO", "For-profit, U.S. place of business, 51 percent or more U.S. citizen owned and controlled, 500 or fewer employees. Form not yet published."),
 ("card", "confirmed", "Place of performance", "Full application", "Michael Ward", "All research and development performed in the United States."),
 ("card", "confirmed", "SBIR only: PI primary employment certification", "Full application", "Michael Ward as PI", "More than 50 percent employment with the small business."),
 ("card", "confirmed", "SBIR only: work-share certification", "Full application", "Michael Ward", "Small business performs at least two-thirds of Phase I effort."),
 ("card", "confirmed", "STTR only: work-share certification", "Full application", "Michael Ward and UNT authorized official", "Small business at least 40 percent and research institution at least 30 percent."),
 ("card", "confirmed", "STTR only: written IP allocation and licensing agreement", "Executed before work begins", "Michael Ward and UNT authorized official", "DOE states this must be in place before work begins."),
 ("card", "anticipated", "Essentially equivalent work and duplicate funding disclosure", "Full application", "Michael Ward", "Standard across SBIR and STTR agencies. Ready-to-use language is below."),
 ("card", "anticipated", "Current and pending support for all personnel", "Full application", "Michael Ward", "Not yet published for this opportunity."),
 ("card", "anticipated", "UNT subaward statement of work and budget", "Full application attachment", "Prepared by PlastiBioFuel with UNT input", "Award-stage under 2 CFR 200.332. Institutional sign-off is not required at submission."),
 ("card", "anticipated", "Budget and line-by-line justification", "Full application", "Michael Ward", "Must not exceed $250,000, or $256,500 with TABA."),
 ("card", "anticipated", "Foreign risk management and research security disclosures", "Full application", "Michael Ward", "DOE maintains a Foreign Risk Management page for the SBIR and STTR programs."),
 ("tint", "DUPLICATE FUNDING DISCLOSURE, READY TO USE",
  "Use this wording on any essentially equivalent work certification at full application. It is already reflected in Question 4 of the pitch.",
  DISCLOSURE),
 ("callout", "TWO STANDING RULES FOR THIS PACKAGE",
  "1.  Dr. Shengqian Ma is Other Personnel on NSF-style forms, not Senior or Key Personnel. DOE has not published its personnel categories for this opportunity, so apply the same treatment unless the DOE form defines categories differently.\n2.  ARG Petro is offtake discussions and interest. There is no signed letter of intent and no executed offtake agreement. No document in this package may say otherwise."),
 ("footer", "PlastiBioFuel LLC  ·  michael@plastibiofuel.com  ·  SDVOSB, SBA VetCert verified  ·  NAICS 325199, 325193, 541715", CONTACT_R),
]

# --------------------------------------------------------- BIBLIOGRAPHY
B = '<font name="Helvetica-Bold">'
biblio = [
 ("masthead", "BIBLIOGRAPHY"),
 ("hero", EYE + "  ·  TOPIC 1", "Bibliography and\nReferences Cited",
  "Optional upload. It draws the line between prior art and the PlastiBioFuel contribution, and it shows the UNT partner's published record in enzyme immobilization."),
 ("statbar", [("6", "PEER-REVIEWED SOURCES"), ("3", "WITH DR. MA AS AUTHOR"), ("1", "PROVISIONAL PATENT")]),
 ("chip", "ENZYMATIC DEPOLYMERIZATION OF PET", ""),
 ("ref", 1, "Lu, H.; Diaz, D. J.; Czarnecki, N. J.; Zhu, C.; Kim, W.; Shroff, R.; Acosta, D. J.; Alexander, B. R.; "
  "Cole, H. O.; Zhang, Y.; Lynd, N. A.; Ellington, A. D.; Alper, H. S. " + B + "Machine learning-aided engineering of "
  "hydrolases for PET depolymerization.</font> <i>Nature</i> 2022, 604 (7907), 662-667.",
  "DOI 10.1038/s41586-022-04599-z  ·  PMID 35478237",
  "Source of FAST-PETase and of the machine-learning method used to engineer it. PlastiBioFuel did not develop this enzyme and makes no claim to it. Cited to fix the boundary between prior art and the PlastiBioFuel contribution, and because it establishes that machine learning is already productive in this system at the molecular scale. The proposed Phase I work moves that method up one level, from residue selection to reactor operating conditions."),
 ("ref", 2, "Tournier, V.; Topham, C. M.; Gilles, A.; David, B.; Folgoas, C.; Moya-Leclair, E.; Kamionka, E.; "
  "Desrousseaux, M.-L.; Texier, H.; Gavalda, S.; Cot, M.; Guemard, E.; Dalibey, M.; Nomme, J.; Cioci, G.; Barbe, S.; "
  "Chateau, M.; Andre, I.; Duquesne, S.; Marty, A. " + B + "An engineered PET depolymerase to break down and recycle "
  "plastic bottles.</font> <i>Nature</i> 2020, 580 (7802), 216-219.",
  "DOI 10.1038/s41586-020-2149-4  ·  PMID 32269349",
  "Benchmark for enzymatic PET depolymerization productivity and for the monomer-to-resin route. Establishes the competing commercial pathway that returns terephthalate to virgin-equivalent PET rather than to fuel."),
 ("ref", 3, "Yoshida, S.; Hiraga, K.; Takehana, T.; Taniguchi, I.; Yamaji, H.; Maeda, Y.; Toyohara, K.; Miyamoto, K.; "
  "Kimura, Y.; Oda, K. " + B + "A bacterium that degrades and assimilates poly(ethylene terephthalate).</font> "
  "<i>Science</i> 2016, 351 (6278), 1196-1199.",
  "DOI 10.1126/science.aad6359  ·  PMID 26965627",
  "Origin of the PETase and MHETase system, and the source of the terephthalic acid and ethylene glycol product pair that PlastiBioFuel intends to route to ethanol."),
 ("chip", "ENZYME IMMOBILIZATION IN COVALENT ORGANIC FRAMEWORKS", ""),
 ("ref", 4, 'Wang, X.; Lan, P. C.; <font name="Helvetica-Bold" color="#045AA9">Ma, S.</font> ' + B +
  "Metal-Organic Frameworks for Enzyme Immobilization: Beyond Host Matrix Materials.</font> "
  "<i>ACS Central Science</i> 2020, 6 (9), 1497-1506.",
  "DOI 10.1021/acscentsci.0c00687  ·  PMID 32999925",
  "Authored from the Department of Chemistry, University of North Texas. Dr. Shengqian Ma is the PlastiBioFuel subaward lead for framework and immobilization chemistry under Sponsored Research Agreement SRA1016."),
 ("ref", 5, 'Li, M.; Qiao, S.; Zheng, Y.; Andaloussi, Y. H.; Li, X.; Zhang, Z.; Li, A.; Cheng, P.; '
  '<font name="Helvetica-Bold" color="#045AA9">Ma, S.</font>; Chen, Y. ' + B + "Fabricating Covalent Organic Framework "
  "Capsules with Commodious Microenvironment for Enzymes.</font> <i>Journal of the American Chemical Society</i> "
  "2020, 142 (14), 6675-6681.",
  "DOI 10.1021/jacs.0c00285  ·  PMID 32197569",
  "Covalent organic framework capsules as enzyme hosts that preserve conformational freedom and mass transfer. This is the physical basis for the near-complete loading with retained catalytic activity that PlastiBioFuel measures in its own framework."),
 ("ref", 6, 'Zhang, S.; Zheng, Y.; An, H.; Aguila, B.; Yang, C.-X.; Dong, Y.; Xie, W.; Cheng, P.; Zhang, Z.; Chen, Y.; '
  '<font name="Helvetica-Bold" color="#045AA9">Ma, S.</font> ' + B + "Covalent Organic Frameworks with Chirality "
  "Enriched by Biomolecules for Efficient Chiral Separation.</font> <i>Angewandte Chemie International Edition</i> "
  "2018, 57 (51), 16754-16759.",
  "DOI 10.1002/anie.201810571  ·  PMID 30359485",
  "Covalent immobilization of enzymes and other biomolecules into covalent organic frameworks with function retained, from the same group."),
 ("chip", "PLASTIBIOFUEL INTELLECTUAL PROPERTY", ""),
 ("ref", 7, 'Ward, M. D. ' + B + "U.S. Provisional Patent Application 63/848,456</font>, filed July 2025.", None,
  "Covers covalent organic framework immobilization, spiral-flow reactor geometry, and the integrated depolymerization-to-ethanol process."),
 ("tint", "VERIFICATION", None, "References 1 through 6 were retrieved from PubMed and verified on August 22, 2026."),
 ("footer", "PlastiBioFuel LLC  ·  michael@plastibiofuel.com  ·  817-319-7383", CONTACT_R),
]

DOCS = {
 "01_Opportunity_Brief": brief,
 "02_Pitch_Responses": pitch,
 "03_Bibliography_and_References_Cited": biblio,
 "04_Forms_and_Certifications_Checklist": forms,
 "05_Submission_Checklist": submit,
}

# The solicitation restricts upload filenames to letters only, so the
# bibliography also ships under an alias. Rendered from the same blocks as its
# source document, so the file the portal receives can never go stale.
UPLOADS = {
 "PlastiBioFuelBibliography": "03_Bibliography_and_References_Cited",
}
