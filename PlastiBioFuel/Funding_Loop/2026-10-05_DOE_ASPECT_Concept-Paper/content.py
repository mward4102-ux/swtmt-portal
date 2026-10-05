# -*- coding: utf-8 -*-
"""DOE ASPECT DE-FOA-0003647 concept paper package, block vocabulary.

Topic Area 1, Subtopic Area 1a. Concept paper due 2026-10-09, 5:00 PM ET.
Submitted through DOE eXCHANGE only. The concept paper is capped at five pages
by the NOFO, so PAGE_LIMITS gates it in the audit.
"""
CONTACT_L = "PlastiBioFuel LLC  ·  12380 Iveson Drive, Haslet, TX 76052  ·  michael@plastibiofuel.com  ·  817-319-7383"
CONTACT_R = "UEI KQAWZ54RDUM8  ·  CAGE 175D6"
EYE = "DOE ASPECT  ·  DE-FOA-0003647  ·  TOPIC AREA 1, SUBTOPIC 1a"
B = '<font name="Helvetica-Bold">'
TITLE = ("Bench-Scale Process Development for Enzymatic Production of "
         "Terephthalic Acid from Post-Consumer PET")

# No funder-published word limits for this concept paper. The binding limit is
# five pages, enforced below as PAGE_LIMITS.
WORD_LIMITS = {}
PAGE_LIMITS = {"02_Concept_Paper": 5}

# ------------------------------------------------------------------ BRIEF
brief = [
 ("masthead", "OPPORTUNITY BRIEF"),
 ("hero", "U.S. DEPARTMENT OF ENERGY  \u00b7  CMEI, ALTERNATIVE FUELS AND FEEDSTOCKS OFFICE",
  "ASPECT\nDE-FOA-0003647",
  "Topic Area 1, Subtopic Area 1a. Terephthalic acid from post-consumer PET."),
 ("stats", [("FEDERAL SHARE SOUGHT", "$2,000,000", "Topic Area 1 range is $2M to $10M"),
            ("CONCEPT PAPER DUE", "Oct 9", "2026, 5:00 PM Eastern"),
            ("COST SHARE", "20%", "Minimum, share of total project cost")]),
 ("alert", "Four days out. The eXCHANGE submit button disables automatically at the deadline, and Stage 1 is open only to applicants whose concept paper DOE finds eligible."),
 ("factgrid", [
   ("AGENCY", "DOE Office of Critical Minerals and Energy Innovation, Alternative Fuels and Feedstocks Office. On Grants.gov under Golden Field Office."),
   ("ANNOUNCEMENT", "DE-FOA-0003647, Modification 000002 posted 2026-09-23. Cooperative agreement. Concept paper, then Stage 1 by eligibility, then Stage 2 by invitation."),
   ("PROGRAM TOTAL", "$58,000,000, subject to availability. Topic Area 1 is zero to seven awards at $2M to $10M federal share."),
   ("PERIOD OF PERFORMANCE", "Subtopic 1a is one phase over 12 to 24 months in two budget periods, the first closing on a go or no-go."),
   ("ELIGIBILITY", "Small businesses eligible as prime, which also satisfies the industrial-entity requirement. Higher education eligible as a subrecipient under Topic Area 1."),
   ("SUBMISSION PORTAL", "DOE eXCHANGE, eere-exchange.energy.gov, announcement DE-FOA-0003647. Grants.gov is not a route. Questions to ASPECT@doe.gov, portal support at EERE-ExchangeSupport@hq.doe.gov."),
 ]),
 ("tint", "WINDOW AND FEEDSTOCK ELIGIBILITY VERIFIED", None,
  "October 5, 2026, by direct fetch of the Grants.gov opportunity detail and the DOE eXCHANGE listing. Feedstock eligibility rests on DOE\'s published webinar transcript, not on Appendix A read verbatim. See step 3 of the Submission Checklist."),
 ("footer", CONTACT_L, CONTACT_R),
]

# ---------------------------------------------------------- CONCEPT PAPER
concept = [
 ("masthead", "CONCEPT PAPER"),
 ("hero", EYE, TITLE,
  "PlastiBioFuel LLC, Haslet, Texas. Michael David Ward, Founder and CEO, michael@plastibiofuel.com, 817-319-7383. Federal share sought $2,000,000 over 24 months, with the minimum 20 percent cost share."),

 ("chip", "1. THE CHEMICAL, THE FEEDSTOCK, AND THE FIT", "Objectives of the NOFO"),
 ("p", "The target chemical is terephthalic acid, the principal monomer of polyethylene terephthalate. PET is the "
       "most abundant polyester plastic, with almost 70 million tons manufactured annually worldwide (Tournier "
       "et al., Nature 2020, DOI 10.1038/s41586-020-2149-4), which places terephthalic acid an order of magnitude "
       "and more above the one million metric ton global market threshold this NOFO sets. It is a chemical "
       "product, not a fuel, and it is not ethanol."),
 ("p", "The feedstock is post-consumer PET recovered from sorted municipal solid waste, which Appendix A lists as an "
       "allowable feedstock including the plastic constituents going to landfill. The feedstock is domestic, abundant, "
       "priced well below agricultural feedstock, and does not compete with food production. Producing terephthalic "
       "acid from it returns a high-volume monomer to domestic polymer manufacture from material that is currently "
       "landfilled, which strengthens a domestic supply chain and displaces imported monomer."),

 ("chip", "2. TECHNOLOGY, STATE OF THE ART, AND WHAT IS NEW", "Uniqueness and innovation"),
 ("p", "Enzymatic PET depolymerization is limited by reactor engineering rather than by enzyme discovery. FAST-PETase, "
       "the engineered hydrolase this process uses, was reported by the Alper group at the University of Texas at Austin "
       "in Nature in 2022 and was itself produced by machine learning. PlastiBioFuel did not invent the enzyme and makes "
       "no claim to it."),
 ("p", "PlastiBioFuel's contributions, covered by U.S. provisional patent application 63/848,456, are the immobilization "
       "of that enzyme in a TAPB-BPDA covalent organic framework, a continuous spiral-flow reactor geometry derived "
       "computationally, and the integrated process that connects them. The reactor geometry exists as a validated "
       "simulation model and not as hardware; no reactor wet-body material has been qualified, and the candidate resin "
       "class remains a screening candidate pending soak-coupon qualification as of 2026-10-01. Nothing in this "
       "concept paper depends on hardware that does not exist."),
 ("p", "The advance this project proposes is to resolve a transport limitation that the preliminary data has already "
       "located, and to convert the simulation model into a bench-validated design tool with quantified error. The "
       "company runs a wet-laboratory program and a simulation and modeling program that feed each other, and the "
       "principal built and runs the modeling himself."),

 ("chip", "3. PRELIMINARY DATA", "Feasibility"),
 ("p", "The authoritative source is the University of North Texas Final Project Report for Phase I, signed by "
       "Prof. Shengqian Ma and dated 2026-08-07. Standard conditions throughout: pH 8, 100 mM phosphate buffer, "
       "1 mL, 100 mg PET, 0.05 percent Tween-20, 65 °C."),
 ("factgrid", [
   ("DEPOLYMERIZATION CONFIRMED", "Free FAST-PETase breaks real post-consumer water bottle PET down to terephthalic acid, confirmed by HPLC against standards."),
   ("IMMOBILIZATION CONFIRMED", "The enzyme loads into the TAPB-BPDA covalent organic framework with no protein detectable in the supernatant at 280 nm."),
   ("IMMOBILIZED TURNOVER", "Measured at 122 µmol/h/mg at 24 hours, against a 246 to 348 literature range for free enzyme."),
   ("CAUSE OF THE GAP", "The laboratory attributes the gap to mass transfer down the framework channel plus insufficient PET pre-treatment."),
   ("SCHEDULE", "Three milestones closed ahead of schedule against a planned 2026-06-30 date."),
 ]),
 ("p", "A separate run at 80 °C gave roughly 3.6 times the standard rate. That figure is confounded because water "
       "evaporated at that temperature, and the laboratory reads the gain as improved substrate access rather than "
       "enzyme kinetics. It is reported here with that caveat and is not relied on as a rate measurement."),
 ("callout", "WHY THIS IS A TRANSPORT PROBLEM",
  "Two independent observations converge on one cause. The laboratory attributes the gap between 122 and the 246 to 348 literature range to mass transfer down the framework channel. The temperature run is independently read as substrate access rather than kinetics. Transport is what pre-treatment, particle configuration, and reactor geometry decide, and none of those can be settled at 1 mL scale."),

 ("chip", "4. PROPOSED WORK", "Subtopic Area 1a, two budget periods"),
 ("p", "Subtopic 1a is the correct entry point. The technology is past proof of concept and needs bench-scale process "
       "development and optimization. It is not ready for the integrated pre-pilot system at half a dry ton per day "
       "that Topic Area 2 requires, and the work does not involve strain discovery, powder-form or heterogeneous "
       "chemical catalysis, thermocatalytic processing, or electrocatalytic cells."),
 ("kvrows", [
   ("Budget Period 1, verification",
    "Reproduce the immobilized turnover measurement under controlled evaporation, and separate transport from kinetics by varying pre-treatment and framework particle configuration at fixed enzyme loading. Characterize the PET pre-treatment state that the report identifies as insufficient. Closes on a go or no-go decision point."),
   ("Budget Period 2, process development",
    "Optimize pre-treatment, enzyme loading, and framework configuration against measured turnover; establish an operating envelope with quantified uncertainty against the simulation model; and recover terephthalic acid to a purity specification acceptable for re-entry into polymer manufacture."),
 ]),
 ("p", "Real post-consumer PET is used throughout. Model compounds are permitted under Subtopic 1a through Budget "
       "Period 1 only, and this project does not require them."),

 ("chip", "5. RISKS, CHALLENGES, AND MITIGATION", "Technical, regulatory, financial"),
 ("factgrid", [
   ("TRANSPORT MAY NOT FULLY RELIEVE", "The limitation may prove only partly addressable at bench scale. The Budget Period 1 go or no-go is designed to answer exactly that question before Budget Period 2 funds are committed."),
   ("PRE-TREATMENT ENERGY COST", "Aggressive pre-treatment could erode process economics. Energy and mass balance for each pre-treatment state is measured in Budget Period 2 as part of the operating envelope rather than assumed."),
   ("PRODUCT PURITY", "Terephthalic acid is an existing commodity chemical, so no new substance registration is required. Recovered monomer re-entering polymer manufacture must meet a purity specification, which is a Budget Period 2 measurement. Food-contact end uses would require the converter's own clearance, not PlastiBioFuel's."),
   ("INTELLECTUAL PROPERTY", "Provisional application 63/848,456 was filed in July 2025 and its conversion is being settled with patent counsel. FAST-PETase is published prior art from UT Austin, and the company's freedom-to-operate position on it is under review with the same counsel. Both are diligence items, not technical obstacles."),
   ("SUBAWARD TERM", "Sponsored Research Agreement SRA1016 with the University of North Texas runs to 2027-08-31, before a 2027 federal period of performance would end. An amendment extending the term is required and is in progress."),
   ("COST SHARE", "PlastiBioFuel will provide the required minimum 20 percent cost share. Sources are documented at Stage 1, where the NOFO requires them."),
 ]),

 ("chip", "6. QUALIFICATIONS AND RESOURCES", "Capability to perform"),
 ("p", "PlastiBioFuel LLC is a service-disabled veteran-owned small business, certified and active in SAM.gov, "
       "UEI KQAWZ54RDUM8, CAGE 175D6, NAICS 325199, 325193, and 541715. Michael David Ward, Founder and CEO, is the "
       "principal investigator and built and runs the simulation and modeling program the design rests on."),
 ("p", "Wet-laboratory work is performed at the University of North Texas under Sponsored Research Agreement SRA1016. "
       "Prof. Shengqian Ma leads framework and immobilization chemistry and has a published record in enzyme "
       "immobilization in covalent organic and metal-organic frameworks; he participates as other personnel on the "
       "subaward rather than as senior or key personnel of the prime. Higher education is eligible as a subrecipient "
       "under Topic Area 1."),

 ("chip", "7. IMPACT OF DOE FUNDING", "Impact on the field and the application"),
 ("p", "Without this award the transport question stays unresolved at 1 mL scale, and the simulation model stays "
       "unvalidated against bench data. With it, the project produces a quantified operating envelope for enzymatic "
       "PET depolymerization and a bench-validated route from landfill-bound plastic to polymer-grade terephthalic "
       "acid. That is the result the field needs in order to size a pre-pilot system under Topic Area 2, and it is the "
       "result that would let PlastiBioFuel return to this program with prior scale data in hand."),

 ("chip", "8. OTHER FEDERAL APPLICATIONS PENDING", "Disclosure"),
 ("p", "PlastiBioFuel LLC has one other federal proposal pending: NSF SBIR Phase I, Research.gov proposal 328095, "
       "solicitation NSF 26-510, subtopic BT10, total requested $304,955, against the November 4, 2026 window. That "
       "proposal covers covalent organic framework and enzyme reusability, the monomer-to-ethanol biological pathway, "
       "and construction of an integrated lab-scale spiral reactor module. The ASPECT scope proposed here covers none "
       "of those three. There are no shared tasks, no shared budget lines, and no dependency in either direction."),
 ("footer", "PlastiBioFuel LLC  ·  Michael David Ward, Founder and CEO  ·  michael@plastibiofuel.com  ·  817-319-7383", CONTACT_R),
]

# ---------------------------------------------------------------- FORMS
AI_DISCLOSURE = (
  "Generative artificial intelligence was used to draft the narrative text of this concept paper from named source "
  "documents, and is disclosed here for that use. It generated no experimental value and no citation. Every laboratory "
  "number in this concept paper traces to the University of North Texas Final Project Report for Phase I signed by "
  "Prof. Shengqian Ma and dated 2026-08-07, and every reference was checked against PubMed by identifier.\n"
  "Separately, and not as a writing aid, simulation and modeling software is part of the subject matter of the work. "
  "The spiral-flow reactor geometry referenced in this concept paper was derived computationally by Michael David Ward. "
  "That modeling is the company's own technical program, it is described as such, and it is not a drafting tool.\n"
  "PlastiBioFuel LLC is responsible for the accuracy, authenticity, and authorship of this submission, is fully "
  "capable of performing the work described, and represents that the submission does not infringe the rights of any "
  "third party.")

forms = [
 ("masthead", "FORMS AND CERTIFICATIONS"),
 ("hero", EYE, "What is filed,\nand who signs",
  "Concept paper stage first, then what falls at Stage 1. Each row is marked for whether it was confirmed on a DOE source read this run or is anticipated and still needs checking against the template."),
 ("legend", [("confirmed", "Verified on a DOE source read on 2026-10-05 or 2026-09-25, cited in the row."),
             ("anticipated", "Expected but not verified. NOFO Part 1 is a Word file this container cannot retrieve."),
             ("na", "Does not apply to this announcement.")]),
 ("chip", "CONCEPT PAPER STAGE", "Due 2026-10-09, 5:00 PM ET"),
 ("card", "confirmed", "Concept paper, five pages maximum",
  "DOE eXCHANGE, announcement DE-FOA-0003647", "No signature stated at this stage",
  "Required, not optional. Must be limited to a single concept, technology, or project. Anything beyond page five is not reviewed and may result in disqualification. A NOFO-specific template is posted on eXCHANGE; all of the content in it is required, use of the template itself is not. Source: DOE's published webinar transcript for this NOFO."),
 ("card", "confirmed", "DOE eXCHANGE account for PlastiBioFuel LLC",
  "eere-exchange.energy.gov", "Michael Ward registers",
  "Submission is through eXCHANGE only. DOE will not review or consider applications submitted through other means. The system returned from its consolidation outage on 2026-10-04 at 6:00 AM ET."),
 ("card", "confirmed", "Active SAM.gov registration with UEI",
  "sam.gov", "No action required",
  "Active and confirmed. DOE restated the requirement in the webinar and warned that new registrations take several weeks. Not an open item for PlastiBioFuel."),
 ("card", "anticipated", "Concept paper content fields and cover information",
  "The template posted on eXCHANGE", "Michael Ward completes",
  "NOFO Part 1 section 4.C lists the required concept paper content. That document is published only as a Word file, and this container cannot retrieve it: files.simpler.grants.gov is refused by network policy and the eXCHANGE copy is served as a download. The field order in this package follows DOE's four published concept paper evaluation factors. Check it against the template before uploading."),
 ("card", "anticipated", "Generative AI use disclosure",
  "Wherever the template asks", "Michael Ward attests",
  "DOE asks applicants to state the extent of generative AI use and how it was used. Whether this NOFO's concept paper carries the question was not verified. Ready-to-use language is below, and it is correct whether the question appears at concept paper or at Stage 1."),
 ("card", "na", "SF-424 family and other Grants.gov forms",
  "Not filed", "No signature",
  "Not applicable at this stage. This announcement is administered through DOE eXCHANGE, and Grants.gov is not an accepted route."),
 ("chip", "STAGE 1 STAGE", "Due 2026-12-01, 5:00 PM ET"),
 ("card", "confirmed", "Letter or letters of commitment",
  "Stage 1 application", "An industrial partner signs",
  "Modification 000001 moved Letters of Commitment from Stage 2 to Stage 1 and added a clause in section III.D saying they are submitted with Stage 1 applications. They are not required with the concept paper. The NOFO separately treats an application with no industrial entity as applicant or partner as not of interest, and PlastiBioFuel satisfies that as prime by itself."),
 ("card", "confirmed", "Technical volume within the page limit",
  "Stage 1 application", "Michael Ward submits",
  "Fifteen pages for Subtopic 1a, inclusive of cover page, table of contents, citations, charts, graphs, maps, photos, and all other graphics. Twenty-five for 1b, thirty for 2a, twenty-five for 2b."),
 ("card", "anticipated", "Cost share documentation, 20 percent minimum",
  "Stage 1 application", "Michael Ward commits",
  "Topic Area 1 carries a 20 percent minimum cost share. Stated here as a share of total project cost, which is the standard DOE basis: on a $2,000,000 federal share that is $500,000 against a $2,500,000 total project. Confirm the basis against the cost sharing section of NOFO Part 1 before Stage 1."),
 ("card", "anticipated", "Research, Technology and Economic Security review materials",
  "Stage 1 application", "Michael Ward submits",
  "DOE stated that Stage 1 includes the core documents needed for a technical review and for the RTES review. The specific RTES forms were not verified."),
 ("callout", "READY-TO-USE GENERATIVE AI DISCLOSURE", AI_DISCLOSURE),
 ("footer", "PlastiBioFuel LLC  ·  michael@plastibiofuel.com  ·  SDVOSB, active in SAM.gov  ·  NAICS 325199, 325193, 541715", CONTACT_R),
]

# ------------------------------------------------------------ SUBMISSION
submit = [
 ("masthead", "SUBMISSION CHECKLIST"),
 ("hero", EYE, "Ten steps to a\nsubmitted concept paper",
  "Steps 1 through 4 are checks that have to happen before the upload and cannot be done from this container. Steps 5 through 10 are the submission itself."),
 ("statbar", [("Oct 9, 5:00 PM ET", "DEADLINE"), ("About 40 minutes", "TIME REQUIRED"), ("None stated", "SIGNATURES AT THIS STAGE")]),
 ("alert", "DOE advises submitting one to two days before the deadline. Any change made after the submit button is pressed unsubmits the application and it must be resubmitted."),
 ("chip", "CHECKS BEFORE UPLOAD", "Do these first"),
 ("step", 1, '<font name="Helvetica-Bold">Log in to DOE eXCHANGE</font> at eere-exchange.energy.gov and confirm the PlastiBioFuel LLC account works. The system returned from its consolidation outage on 2026-10-04 at 6:00 AM ET. If the account does not exist, create it now rather than on the ninth; portal support is EERE-ExchangeSupport@hq.doe.gov with the NOFO title and DE-FOA-0003647 in the subject line.'),
 ("step", 2, '<font name="Helvetica-Bold">Download NOFO Part 1 and the concept paper template</font> from the Documents section of announcement DE-FOA-0003647. Both are Word files. This container is blocked from retrieving them, which is why steps 2 through 4 are yours rather than the package\'s.'),
 ("step", 3, '<font name="Helvetica-Bold">Read Appendix A and confirm the sorted municipal solid waste line.</font> Feedstock eligibility for post-consumer PET rests on DOE\'s own published webinar transcript, where the NOFO co-manager lists the Appendix A feedstocks and names sorted municipal solid waste including the plastic constituents going to landfill. That webinar was held 2026-09-11 and Modification 000002 updated Appendix A on 2026-09-23, so read the current text. Modification 000002 names only the construction and demolition waste definition as its Appendix A change. Also open the DE-FOA-0003647 Question and Answer Log, last updated 2026-09-24 at 4:51 PM ET, the day after the modification.'),
 ("step", 4, '<font name="Helvetica-Bold">Check this concept paper against the template\'s field list</font> in NOFO Part 1 section 4.C. The document is written to DOE\'s four published evaluation factors, which is the right content, but the template may want it in a different order or under different headings. Reorder rather than rewrite.'),
 ("chip", "THE SUBMISSION", "About 40 minutes"),
 ("step", 5, 'Find DE-FOA-0003647 in eXCHANGE and click Apply. Enter the project title: ' + TITLE + '.'),
 ("step", 6, 'Select <font name="Helvetica-Bold">Topic Area 1, Subtopic Area 1a</font>. One topic area and one concept only. Subtopic 1a is the entry point for technology that is past proof of concept and needs bench-scale development; it is also the only Topic Area 1 subtopic that does not exclude work on heterogeneous or powder-form catalysis, which matters for a framework-immobilized enzyme.'),
 ("step", 7, 'Upload <font name="Helvetica-Bold">02_Concept_Paper.pdf</font>. Confirm in the reader that it is five pages or fewer before uploading. Anything past page five is not reviewed and may disqualify the concept paper.'),
 ("step", 8, 'Complete every required field, then click Submit. Do it on 2026-10-07 or 2026-10-08, not on the ninth. The APPLY and SUBMIT buttons disable automatically at 5:00 PM ET on 2026-10-09 and DOE enforces that as a hard deadline.'),
 ("step", 9, 'Confirm receipt in eXCHANGE and keep the confirmation. If a technical problem causes a late submission, DOE accepts it only when you encountered difficulties beyond your control, contacted the helpdesk at exchangehelp@hq.doe.gov, and submitted within 24 hours of the posted deadline. All three conditions, not any one of them.'),
 ("step", 10, 'Record the submission date in FUNDING_REGISTRY.md and correct the ASPECT row, which still reads Package built. Also submit the teaming entry for TPL-0000073 if that has not been done, and record the date.'),
 ("callout", "WHERE MICHAEL SIGNS",
  "Nowhere at the concept paper stage, as far as any DOE source read for this package states. No certification or signature block is described for the concept paper, and the exact field list in NOFO Part 1 section 4.C has not been read, so confirm when the template is open.\nThe first signatures fall at Stage 1 on 2026-12-01: the cost share commitment, the Research, Technology and Economic Security materials, and whatever certifications the Stage 1 content requirements carry. An industrial partner, not Michael, signs the Letter of Commitment at Stage 1."),
 ("chip", "WHAT SUBMITTING DOES AND DOES NOT COMMIT", ""),
 ("tint", "THE CONCEPT PAPER IS NOT BINDING", None,
  "DOE, in the published webinar transcript: applicants are not obligated to apply after submitting a concept paper, are not bound to the statements made in it, and it is reasonable for project partners, locations, and other factors to change during application development. What the concept paper does buy is eligibility: Stage 1 is open only to applicants whose concept paper DOE reviewed and found eligible, and DOE will not review a Stage 1 application from anyone it did not invite."),
 ("chip", "DATES TO HOLD", ""),
 ("kvrows", [
   ("2026-10-09, 5:00 PM ET", "Concept paper closes. Hard deadline, buttons disable automatically."),
   ("2026-12-01, 5:00 PM ET", "Stage 1 application. Letter of commitment and cost share documentation fall here."),
   ("mid-January 2027", "Stage 2 invitations. An invitee-only webinar is expected on or around 2027-01-20."),
   ("2027-02-12", "Stage 2 application due. DOE advises staffing for engagement between roughly 2027-01-10 and mid-February."),
   ("mid-April 2027", "Selection notifications and the start of award negotiation."),
 ]),
 ("footer", "Program questions: ASPECT@doe.gov  ·  Portal support: EERE-ExchangeSupport@hq.doe.gov  ·  michael@plastibiofuel.com",
  "Verified October 5, 2026"),
]

# ----------------------------------------------------------- BIBLIOGRAPHY
biblio = [
 ("masthead", "BIBLIOGRAPHY"),
 ("hero", EYE, "Bibliography and\nReferences Cited",
  "Supporting material. It fixes the boundary between prior art and the PlastiBioFuel contribution, sources the market-scale statement in the concept paper, and shows the subaward partner's published record in enzyme immobilization."),
 ("statbar", [("6", "PEER-REVIEWED SOURCES"), ("3", "WITH DR. MA AS AUTHOR"), ("1", "PROVISIONAL PATENT")]),
 ("chip", "ENZYMATIC DEPOLYMERIZATION OF PET", ""),
 ("ref", 1, "Lu, H.; Diaz, D. J.; Czarnecki, N. J.; Zhu, C.; Kim, W.; Shroff, R.; Acosta, D. J.; Alexander, B. R.; "
  "Cole, H. O.; Zhang, Y.; Lynd, N. A.; Ellington, A. D.; Alper, H. S. " + B + "Machine learning-aided engineering of "
  "hydrolases for PET depolymerization.</font> <i>Nature</i> 2022, 604 (7907), 662-667.",
  "DOI 10.1038/s41586-022-04599-z  ·  PMID 35478237",
  "Source of FAST-PETase and of the machine-learning method that produced it, from the McKetta Department of Chemical Engineering at the University of Texas at Austin. PlastiBioFuel did not develop this enzyme and makes no claim to it. Cited to fix the boundary between prior art and the PlastiBioFuel contribution, and because the paper reports depolymerization of untreated post-consumer PET from 51 thermoformed products and of a commercial water bottle, which is the feedstock class this project uses."),
 ("ref", 2, "Tournier, V.; Topham, C. M.; Gilles, A.; David, B.; Folgoas, C.; Moya-Leclair, E.; Kamionka, E.; "
  "Desrousseaux, M.-L.; Texier, H.; Gavalda, S.; Cot, M.; Guemard, E.; Dalibey, M.; Nomme, J.; Cioci, G.; Barbe, S.; "
  "Chateau, M.; Andre, I.; Duquesne, S.; Marty, A. " + B + "An engineered PET depolymerase to break down and recycle "
  "plastic bottles.</font> <i>Nature</i> 2020, 580 (7802), 216-219.",
  "DOI 10.1038/s41586-020-2149-4  ·  PMID 32269349",
  "Source of the market-scale statement in section 1 of the concept paper: the paper reports PET as the most abundant polyester plastic with almost 70 million tons manufactured annually worldwide. Terephthalic acid is its principal monomer, which places the target chemical far above this NOFO's one million metric ton threshold. The paper is also the productivity benchmark for enzymatic PET depolymerization and establishes the competing route that returns monomer to virgin-equivalent resin."),
 ("ref", 3, "Yoshida, S.; Hiraga, K.; Takehana, T.; Taniguchi, I.; Yamaji, H.; Maeda, Y.; Toyohara, K.; Miyamoto, K.; "
  "Kimura, Y.; Oda, K. " + B + "A bacterium that degrades and assimilates poly(ethylene terephthalate).</font> "
  "<i>Science</i> 2016, 351 (6278), 1196-1199.",
  "DOI 10.1126/science.aad6359  ·  PMID 26965627",
  "Origin of the PETase and MHETase system. Establishes that the enzymatic route converts PET to terephthalic acid and ethylene glycol, which is why terephthalic acid is the primary product this project targets."),
 ("chip", "ENZYME IMMOBILIZATION IN ORGANIC AND METAL-ORGANIC FRAMEWORKS", ""),
 ("ref", 4, 'Wang, X.; Lan, P. C.; <font name="Helvetica-Bold" color="#045AA9">Ma, S.</font> ' + B +
  "Metal-Organic Frameworks for Enzyme Immobilization: Beyond Host Matrix Materials.</font> "
  "<i>ACS Central Science</i> 2020, 6 (9), 1497-1506.",
  "DOI 10.1021/acscentsci.0c00687  ·  PMID 32999925",
  "Written from the Department of Chemistry at the University of North Texas. Dr. Shengqian Ma leads framework and immobilization chemistry on the PlastiBioFuel subaward under Sponsored Research Agreement SRA1016."),
 ("ref", 5, 'Li, M.; Qiao, S.; Zheng, Y.; Andaloussi, Y. H.; Li, X.; Zhang, Z.; Li, A.; Cheng, P.; '
  '<font name="Helvetica-Bold" color="#045AA9">Ma, S.</font>; Chen, Y. ' + B + "Fabricating Covalent Organic Framework "
  "Capsules with Commodious Microenvironment for Enzymes.</font> <i>Journal of the American Chemical Society</i> "
  "2020, 142 (14), 6675-6681.",
  "DOI 10.1021/jacs.0c00285  ·  PMID 32197569",
  "Covalent organic framework capsules as enzyme hosts. The paper reports improved conformational freedom and enhanced mass transfer as the mechanism behind retained activity, which is the same variable this project proposes to measure and optimize at bench scale."),
 ("ref", 6, 'Zhang, S.; Zheng, Y.; An, H.; Aguila, B.; Yang, C.-X.; Dong, Y.; Xie, W.; Cheng, P.; Zhang, Z.; Chen, Y.; '
  '<font name="Helvetica-Bold" color="#045AA9">Ma, S.</font> ' + B + "Covalent Organic Frameworks with Chirality "
  "Enriched by Biomolecules for Efficient Chiral Separation.</font> <i>Angewandte Chemie International Edition</i> "
  "2018, 57 (51), 16754-16759.",
  "DOI 10.1002/anie.201810571  ·  PMID 30359485",
  "Covalent immobilization of enzymes and other biomolecules into covalent organic frameworks with function retained, from the same group."),
 ("chip", "PLASTIBIOFUEL INTELLECTUAL PROPERTY", ""),
 ("ref", 7, 'Ward, M. D. ' + B + "U.S. Provisional Patent Application 63/848,456</font>, filed July 2025.", None,
  "Covers covalent organic framework immobilization, the spiral-flow reactor geometry, and the integrated depolymerization process. Conversion is being settled with patent counsel."),
 ("tint", "VERIFICATION", None,
  "References 1 through 6 were retrieved from PubMed and verified by PMID on October 5, 2026. Titles, journals, volumes, issues, page ranges, and DOIs match the PubMed records. Reference 2's market figure is quoted from that paper's own abstract."),
 ("footer", "PlastiBioFuel LLC  ·  michael@plastibiofuel.com  ·  817-319-7383", CONTACT_R),
]

DOCS = {
 "01_Opportunity_Brief": brief,
 "02_Concept_Paper": concept,
 "03_Bibliography_and_References_Cited": biblio,
 "04_Forms_and_Certifications_Checklist": forms,
 "05_Submission_Checklist": submit,
}
