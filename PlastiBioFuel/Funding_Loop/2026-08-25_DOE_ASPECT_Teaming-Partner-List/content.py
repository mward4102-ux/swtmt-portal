# -*- coding: utf-8 -*-
"""PlastiBioFuel teaming-partner package for DOE ASPECT, run of 2026-08-25.

This run positions the company on an open DOE teaming list ahead of a NOFO that
has been noticed but not issued. It is not an application, and no document here
may describe it as one. The word-limit check does not apply: DOE publishes no
word limit on the teaming-list fields, so this run declares none rather than
inventing one.
"""
WORD_LIMITS = {}

CONTACT_L = "PlastiBioFuel LLC  ·  12380 Iveson Drive, Haslet, TX 76052  ·  michael@plastibiofuel.com  ·  817-319-7383"
CONTACT_R = "UEI KQAWZ54RDUM8  ·  CAGE 175D6"
EYE = "DOE ASPECT  ·  DE-FOA-0003646  ·  TEAMING PARTNER LIST TPL-0000073"
B = '<font name="Helvetica-Bold">'

# ------------------------------------------------------------------ BRIEF
brief = [
 ("masthead", "OPPORTUNITY BRIEF"),
 ("hero", "U.S. DEPARTMENT OF ENERGY  ·  ALTERNATIVE FUELS AND FEEDSTOCKS OFFICE",
  "ASPECT\nTeaming Partner List",
  "Accelerating Scale-up and Pre-piloting of Emerging Chemical Technologies. The NOFO is noticed, not issued. The teaming list is open now."),
 ("stats", [("STAGE", "Notice of Intent", "No applications accepted yet"),
            ("APPLICATION DEADLINE", "TBD", "Not published"),
            ("COST TO ACT", "One form", "No deadline, no signature")]),
 ("alert", "Positioning, not a funding application. It puts the company in front of the applicants who will form teams when the NOFO lands."),
 ("factgrid", [
   ("ISSUING OFFICE", "DOE Office of Critical Minerals and Energy Innovation, for the Alternative Fuels and Feedstocks Office."),
   ("ANNOUNCEMENT NUMBERS", "NOI is DE-FOA-0003646. The list is TPL-0000073, whose title cites DE-FOA-0003647 while its body cites DE-FOA-0003646. Select it by title."),
   ("WHAT THE NOFO WILL SEEK", "Development and scale-up of technologies making chemicals from alternative and waste feedstocks, including foundational molecules."),
   ("WHY IT FITS", "Post-consumer PET is a waste feedstock. Terephthalic acid is a foundational molecule, and it is what the company measures today."),
   ("WHAT IS NOT DECIDED", "Award size, cost share, eligibility, topic areas. DOE states a NOFO may differ from the notice or never issue."),
   ("SCOPE SEPARATION", "No overlap with NSF 328095 or the Genesis Mission pitch. A teaming list commits no scope."),
 ]),
 ("factwide", "PORTAL AND CONTACTS",
  'DOE Funding Opportunity Exchange, <font color="#045AA9">eere-exchange.energy.gov</font>, Teaming Partners pane. '
  'Program: <font color="#045AA9">ASPECT@doe.gov</font>, Josh Messner. Support: <font color="#045AA9">eere-exchangesupport@hq.doe.gov</font>'),
 ("small", "Verified Tuesday, August 25, 2026 by direct fetch of the DOE Funding Opportunity Exchange listing. The NOI document is dated July 14, 2026 and the application deadline reads TBD."),
 ("footer", CONTACT_L, CONTACT_R),
]

# --------------------------------------------------------------- PROFILE
BACKGROUND = (
 "PlastiBioFuel LLC is a service-disabled veteran-owned small business in Haslet, Texas, converting "
 "post-consumer PET into chemicals and fuel. The company works on an immobilized-enzyme route: a PET "
 "hydrolase held in a covalent organic framework, feeding a continuous spiral-flow reactor.\n\n"
 "What is established today, in a signed final report from the University of North Texas covering "
 "January to June 2026. Free FAST-PETase breaks real post-consumer water bottle PET down to "
 "terephthalic acid, confirmed by HPLC against standards. The enzyme loads into a TAPB-BPDA-COF with "
 "no protein detectable in the supernatant at 280 nm. Immobilized turnover measured 122 micromol per "
 "hour per milligram at 24 hours, against a 246 to 348 literature range for the free enzyme, and the "
 "laboratory attributes that gap to mass transfer down the framework channel rather than to loss of "
 "enzyme activity. Three project milestones closed ahead of schedule.\n\n"
 "What is not yet built. The spiral-flow reactor exists as a validated model and not as hardware. "
 "The route from monomer to fuel-grade ethanol is the company's objective and has not been "
 "demonstrated. Nothing in this profile should be read as a pilot result.\n\n"
 "What PlastiBioFuel brings to a team. A waste feedstock with a measured conversion to a foundational "
 "molecule; framework and immobilization chemistry through a sponsored research agreement with Prof. "
 "Shengqian Ma at the University of North Texas; and a simulation and modeling program, built and run "
 "in-house, that decides which reactor conditions the laboratory tests next.\n\n"
 "What PlastiBioFuel is looking for. Partners with pre-pilot and pilot-scale reactor capacity, "
 "downstream separations, and offtake into chemical markets. The company is prepared to participate as "
 "a prime or as a subrecipient."
)

profile = [
 ("masthead", "TEAMING PROFILE RESPONSES"),
 ("hero", EYE, "Field by field,\nready to paste",
  "The DOE teaming form asks for nine fields. Each one is answered below in the form the portal expects. Paste them as written."),
 ("chip", "PORTAL FIELDS", "eere-exchange.energy.gov, Teaming Partners"),
 ("kvrows", [
   ("Investigator Name", "Michael David Ward"),
   ("Organization Name", "PlastiBioFuel LLC"),
   ("Organization Type", "Small business. Service-disabled veteran-owned, SBA VetCert verified."),
   ("Topic Area", "Chemicals from alternative and waste feedstocks. Post-consumer PET to terephthalic acid and downstream derivatives."),
   ("Website", "plastibiofuel.com"),
   ("Contact Address", "12380 Iveson Drive, Haslet, TX 76052"),
   ("Contact Email", "michael@plastibiofuel.com"),
   ("Contact Phone", "817-319-7383"),
 ]),
 ("chip", "BACKGROUND AND CAPABILITIES", "The one free-text field"),
 ("callout", "WRITTEN TO A CHEMICALS PROGRAM, NOT AN AI PROGRAM",
  "ASPECT scores feedstock, chemistry, and scale-up. The modeling program earns one sentence here because that is what this reader pays for. The full AI argument belongs in the DOE Genesis Mission pitch, where the topic asks for it."),
 ("p", BACKGROUND),
 ("callout", "TWO STANDING RULES CARRIED INTO THIS TEXT",
  "1.  ARG Petro is offtake discussions and interest. There is no signed letter of intent and no executed offtake agreement, and no document in this package says otherwise.\n2.  Renewable fuel credit eligibility stays subject to final pathway qualification. This profile makes no credit claim at all."),
 ("tint", "PUBLICATION NOTICE", None,
  "DOE publishes every field above on a list that any applicant can read. Submitting the request consents to that publication. Nothing here is confidential, and nothing here is business sensitive."),
 ("footer", CONTACT_L, CONTACT_R),
]

# --------------------------------------------------------- BIBLIOGRAPHY
biblio = [
 ("masthead", "BIBLIOGRAPHY"),
 ("hero", EYE, "Bibliography and\nReferences Cited",
  "Not requested by the teaming form. Held with the package so the technical claims in the profile can be traced by anyone who asks for them."),
 ("statbar", [("4", "PEER-REVIEWED SOURCES"), ("1", "WITH DR. MA AS AUTHOR"), ("1", "PROVISIONAL PATENT")]),
 ("chip", "ENZYMATIC DEPOLYMERIZATION OF PET", ""),
 ("ref", 1, "Lu, H.; Diaz, D. J.; Czarnecki, N. J.; Zhu, C.; Kim, W.; Shroff, R.; Acosta, D. J.; Alexander, B. R.; "
  "Cole, H. O.; Zhang, Y.; Lynd, N. A.; Ellington, A. D.; Alper, H. S. " + B + "Machine learning-aided engineering of "
  "hydrolases for PET depolymerization.</font> <i>Nature</i> 2022, 604 (7907), 662-667.",
  "DOI 10.1038/s41586-022-04599-z  ·  PMID 35478237",
  "Source of FAST-PETase. PlastiBioFuel did not develop this enzyme and makes no claim to it. Cited to fix the boundary between prior art and the company contribution."),
 ("ref", 2, "Tournier, V.; Topham, C. M.; Gilles, A.; David, B.; Folgoas, C.; Moya-Leclair, E.; Kamionka, E.; "
  "Desrousseaux, M.-L.; Texier, H.; Gavalda, S.; Cot, M.; Guemard, E.; Dalibey, M.; Nomme, J.; Cioci, G.; Barbe, S.; "
  "Chateau, M.; Andre, I.; Duquesne, S.; Marty, A. " + B + "An engineered PET depolymerase to break down and recycle "
  "plastic bottles.</font> <i>Nature</i> 2020, 580 (7802), 216-219.",
  "DOI 10.1038/s41586-020-2149-4  ·  PMID 32269349",
  "Benchmark for enzymatic PET depolymerization productivity, and the competing route that returns terephthalate to virgin-equivalent PET rather than to fuel."),
 ("ref", 3, "Yoshida, S.; Hiraga, K.; Takehana, T.; Taniguchi, I.; Yamaji, H.; Maeda, Y.; Toyohara, K.; Miyamoto, K.; "
  "Kimura, Y.; Oda, K. " + B + "A bacterium that degrades and assimilates poly(ethylene terephthalate).</font> "
  "<i>Science</i> 2016, 351 (6278), 1196-1199.",
  "DOI 10.1126/science.aad6359  ·  PMID 26965627",
  "Origin of the PETase and MHETase system, and the source of the terephthalic acid and ethylene glycol product pair that the company intends to route onward."),
 ("chip", "ENZYME IMMOBILIZATION IN FRAMEWORK MATERIALS", ""),
 ("ref", 4, 'Wang, X.; Lan, P. C.; <font name="Helvetica-Bold" color="#045AA9">Ma, S.</font> ' + B +
  "Metal-Organic Frameworks for Enzyme Immobilization: Beyond Host Matrix Materials.</font> "
  "<i>ACS Central Science</i> 2020, 6 (9), 1497-1506.",
  "DOI 10.1021/acscentsci.0c00687  ·  PMID 32999925",
  "Authored from the Department of Chemistry, University of North Texas. Dr. Shengqian Ma is the PlastiBioFuel subaward lead for framework and immobilization chemistry under Sponsored Research Agreement SRA1016."),
 ("chip", "PLASTIBIOFUEL INTELLECTUAL PROPERTY", ""),
 ("ref", 5, 'Ward, M. D. ' + B + "U.S. Provisional Patent Application 63/848,456</font>, filed July 2025.", None,
  "Covers framework immobilization, spiral-flow reactor geometry, and the integrated depolymerization process."),
 ("tint", "VERIFICATION", None,
  "References 1 through 4 were retrieved from PubMed and verified by identifier on August 25, 2026."),
 ("footer", "PlastiBioFuel LLC  ·  michael@plastibiofuel.com  ·  817-319-7383", CONTACT_R),
]

# ---------------------------------------------------------------- FORMS
forms = [
 ("masthead", "FORMS AND CERTIFICATIONS"),
 ("hero", EYE, "Nothing to sign\nto join the list",
  "The teaming list takes a portal account and a form. No certifications, no representations, no signature. The rows below separate what the list needs today from what a future ASPECT application would need."),
 ("legend", [("confirmed", "Stated on the DOE Funding Opportunity Exchange page as of August 25, 2026"),
            ("anticipated", "Standard DOE financial assistance practice, not yet published for ASPECT")]),
 ("chip", "TODAY  ·  TEAMING PARTNER LIST", "No deadline"),
 ("card", "required", "DOE Funding Opportunity Exchange account", "eere-exchange.energy.gov", "Michael Ward, no signature", "Registration is free. Required before a teaming request can be submitted."),
 ("card", "ready", "Teaming partner request, nine fields", "Exchange, Teaming Partners pane", "No signature", "Text is written. See the Teaming Profile Responses document in this package."),
 ("card", "na", "Certifications and representations", "Not applicable", "Not applicable", "None required to join a teaming list. Confirmed against the DOE page on August 25, 2026."),
 ("card", "na", "Cost share and budget", "Not applicable", "Not applicable", "No budget is submitted with a teaming request."),
 ("chip", "LATER  ·  IF AND WHEN THE NOFO ISSUES", "Deadline not published"),
 ("card", "confirmed", "SF-424, Application for Federal Assistance", "Exchange, listed on the ASPECT page", "Michael Ward as Authorized Representative", "DOE lists this form on the announcement page already."),
 ("card", "confirmed", "SF-LLL, Disclosure of Lobbying Activities", "Exchange, listed on the ASPECT page", "Michael Ward", "Listed alongside SF-424 on the same page."),
 ("card", "required", "Active SAM.gov registration and UEI", "sam.gov/entity-registration", "Michael Ward as Entity Administrator", "No DOE financial assistance award can be made without it. Renewal can take up to 8 weeks, which is why it is the first step of the DOE Genesis Mission checklist as well."),
 ("card", "anticipated", "Duplicate funding and equivalent work disclosure", "Full application", "Michael Ward", "NSF 328095 and any DOE Genesis Mission award would both be disclosed. Ready-to-use language is in the August 22 package."),
 ("card", "anticipated", "Subaward statement of work and budget for UNT", "Full application attachment", "Prepared by PlastiBioFuel with UNT input", "Note the SRA1016 term: the proposed amendment runs to August 31, 2027, which is earlier than a 12-month period of performance beginning in 2027 would end."),
 ("card", "anticipated", "Foreign risk management and research security disclosures", "Full application", "Michael Ward", "Standard for DOE financial assistance. Not yet published for ASPECT."),
 ("callout", "ONE STANDING PERSONNEL RULE",
  "Dr. Shengqian Ma is Other Personnel on NSF-style forms, not Senior or Key Personnel. Apply the same treatment on any ASPECT form unless DOE defines its categories differently."),
 ("footer", "PlastiBioFuel LLC  ·  michael@plastibiofuel.com  ·  SDVOSB, SBA VetCert verified  ·  NAICS 325199, 325193, 541715", CONTACT_R),
]

# ----------------------------------------------------------- SUBMISSION
submit = [
 ("masthead", "SUBMISSION CHECKLIST"),
 ("hero", EYE, "Nine steps,\nabout twenty minutes",
  "There is no deadline on a teaming list, which is exactly why it slips. The whole action fits in one sitting."),
 ("step", 1, 'Open <font color="#045AA9">eere-exchange.energy.gov</font>. This is the DOE Funding Opportunity Exchange, not the ARPA-E Exchange and not Grants.gov.'),
 ("step", 2, 'Register an account, or log in if one already exists. Use ' + B + 'michael@plastibiofuel.com</font> so DOE correspondence lands in the company inbox rather than a personal one.'),
 ("step", 3, 'In the left navigation pane, click ' + B + 'Teaming Partners</font>.'),
 ("step", 4, 'From the drop-down, select the list titled ' + B + '"Teaming Partner List for DE-FOA-0003647: Accelerating Scale-up and Pre-piloting of Emerging Chemical Technologies (ASPECT)."</font> Select it by title. The title cites DE-FOA-0003647 and the body cites DE-FOA-0003646, and DOE has not reconciled the two.'),
 ("step", 5, "Fill the nine fields from the Teaming Profile Responses document in this package. Paste the Background and Capabilities text whole rather than retyping it."),
 ("step", 6, "Read the publication notice before submitting. Every field becomes public on a list other applicants can read."),
 ("step", 7, "Submit the request."),
 ("step", 8, 'Confirm the entry appears on the published list. If it has not appeared within five business days, email ' + B + 'eere-exchangesupport@hq.doe.gov</font> with the submission date.'),
 ("step", 9, 'Set a watch on the ASPECT page for the NOFO itself. Program questions go to ' + B + 'ASPECT@doe.gov</font>, Josh Messner. The funding loop rechecks this page every run.'),
 ("h1", "What this does not do"),
 ("p", "Joining the list is not an application, does not reserve a place, and carries no weight in any future merit review. DOE says plainly that it does not endorse or evaluate the organizations that list themselves, and that a NOFO may never issue. The value is that teams form before a NOFO drops, and PlastiBioFuel is currently invisible to them."),
 ("h1", "One thing worth deciding before the NOFO"),
 ("p", "Whether PlastiBioFuel wants to be a prime or a subrecipient on a scale-up award. The profile says the company is prepared to be either, which is honest today. A pre-pilot program will ask for reactor capacity the company does not own, so the answer probably decides which partners are worth calling first."),
 ("footer", "DOE Funding Opportunity Exchange support: eere-exchangesupport@hq.doe.gov  ·  Program: ASPECT@doe.gov",
  "Verified August 25, 2026"),
]

DOCS = {
 "01_Opportunity_Brief": brief,
 "02_Teaming_Profile_Responses": profile,
 "03_Bibliography_and_References_Cited": biblio,
 "04_Forms_and_Certifications_Checklist": forms,
 "05_Submission_Checklist": submit,
}
