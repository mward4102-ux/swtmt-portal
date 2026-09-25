# -*- coding: utf-8 -*-
"""Private capital and accelerators, run of 2026-08-25.

Opens a fifth sweep category. Everything here is equity money except the
LabCentral Golden Tickets, and equity interacts with the non-dilutive programs
already in the registry. Those interactions are the substance of document 03 and
they are the reason this package exists rather than a list of names.

Terms were read off each firm's own page on 2026-08-25.
"""
WORD_LIMITS = {}

CONTACT_L = "PlastiBioFuel LLC  ·  12380 Iveson Drive, Haslet, TX 76052  ·  michael@plastibiofuel.com  ·  817-319-7383"
CONTACT_R = "UEI KQAWZ54RDUM8  ·  CAGE 175D6"
EYE = "PRIVATE CAPITAL AND ACCELERATORS  ·  CATEGORY 5"
B = '<font name="Helvetica-Bold">'

# ------------------------------------------------------------------ BRIEF
brief = [
 ("masthead", "OPPORTUNITY BRIEF"),
 ("hero", "ACCELERATORS, SEED FUNDS, AND SHARED LABS",
  "Two windows\nopen today",
  "Y Combinator is taking late applications for the Fall 2026 batch. SOSV and IndieBio take applications on a rolling basis. Everything else in this category is closed, unverifiable, or a poor fit, and each is recorded as such."),
 ("stats", [("OPEN NOW", "2", "YC late window, SOSV rolling"),
            ("GOLDEN TICKETS", "Sep 4 and 11", "LabCentral, sponsor funded"),
            ("EQUITY COST, YC", "About 9.5%", "7% plus a typical MFN conversion")]),
 ("alert", "Read document 03 before applying to any of these. Two constraints in this category collide with money already in the registry, and one of them would undo the SAM registration and certification that are already finished."),
 ("factgrid", [
   ("WHAT CHANGED", "The loop had four sweep categories, all public money. This adds a fifth for private capital, accelerators, and shared laboratory access."),
   ("WHY IT IS NOT SIMPLY MORE MONEY", "Non-dilutive and dilutive money are not additive. Every program in the registry that caps outside funding counts these dollars against that cap."),
   ("THE HONEST FRAMING", "Accelerator money is fast and expensive. Federal money is slow and free. The company needs cash now, which argues for speed; it also has two federal windows opening September 15 that equity could complicate."),
   ("WHAT THIS PACKAGE IS NOT", "It is not a recommendation to take equity money or to refuse it. That is a decision about control and timeline, not a research finding."),
 ]),
 ("small", "Terms read off each firm's own page on August 25, 2026. Y Combinator publishes its standard deal in full; SOSV does not publish terms on its application form."),
 ("footer", CONTACT_L, CONTACT_R),
]

# ------------------------------------------------ ELIGIBILITY INTERACTIONS
interactions = [
 ("masthead", "ELIGIBILITY INTERACTIONS"),
 ("hero", EYE, "Where this money\ncollides",
  "Four interactions between equity capital and the programs already tracked. None of them is a reason not to raise. All of them are cheaper to know now than to discover during diligence."),
 ("chip", "1. THE ENTITY ITSELF", "The expensive one"),
 ("callout", "YC INVESTS IN CORPORATIONS, NOT LLCS",
  "Y Combinator states it invests in US, Canada, Cayman, and Singapore corporations, and that companies incorporated otherwise must restructure to put a parent company in one of those four. PlastiBioFuel is an LLC.\n\nThe cost is not the filing fee. UEI KQAWZ54RDUM8, CAGE 175D6, the SAM.gov registration, and the SDVOSB certification all attach to the LLC. A new parent entity is a different legal person, and federal registrations and certifications do not travel with it automatically. Anything already submitted under the LLC, including the DOE pitch, was submitted by an entity that would no longer be the parent.\n\nThis is answerable and companies do it constantly. It is not a paperwork afternoon, and it should be priced before an accelerator application, not after an acceptance."),
 ("chip", "2. THE $2M CAPS", "Both September 15 programs"),
 ("kvrows", [
   ("Activate Fellowship", "Must not have raised more than $2M in debt or equity from non-governmental sources at the application deadline. Applications open September 15."),
   ("ORNL Innovation Crossroads", "Must have raised no more than $2M from non-government sources in the three years prior to application. Applications open September 15 and close October 30."),
   ("What that means here", "A YC deal at $500,000 or an SOSV check does not break either cap on its own. Both caps are cumulative and both are measured at application. Raising a seed round on top of an accelerator check is what breaks them."),
   ("Order of operations", "Applying to the federal fellowships first costs nothing and forecloses nothing. Raising first can foreclose them. That asymmetry is the whole point of this row."),
 ]),
 ("chip", "3. SBIR OWNERSHIP", "Less dangerous than it sounds"),
 ("p", "SBIR eligibility requires the concern be more than 50 percent owned and controlled by US citizens or permanent residents, or by other small business concerns that are themselves so owned. A $500,000 SAFE converting to single-digit percentages does not approach that line, so an accelerator check is not by itself an SBIR problem. Majority ownership by investment funds is a different matter: only some agencies permit it, only for a portion of their awards, and it requires specific registration with SBA. The number to watch is cumulative institutional ownership across rounds, not the first check."),
 ("chip", "4. THE PROVISIONAL PATENT CLOCK", "Confirm before posting anything public"),
 ("callout", "THE DATE MATH, WHICH MAY ALREADY HAVE RUN OUT",
  "USPTO provisional application 63/848,456 was filed in July 2025. A provisional lasts twelve months and cannot be extended. That put the conversion deadline in July 2026, which is in the past as of this run.\n\nIf a non-provisional or a PCT application was filed before it lapsed, the priority date holds and this row is closed. If it was not, the priority date from that provisional is gone, and the technology's public exposure to date becomes the governing question rather than a formality.\n\nThis matters directly to the plan to post the immobilization result publicly. Public disclosure before a filing is a bar to patenting in most countries outside the United States, which apply absolute novelty with no grace period, and it starts a one-year clock in the United States. Confirm the filing status with patent counsel before any public post, not after. Nothing else in this package is worth as much as that one phone call."),
 ("footer", CONTACT_L, CONTACT_R),
]

# ------------------------------------------------------- TARGETS AND TERMS
targets = [
 ("masthead", "TARGETS AND TERMS"),
 ("hero", EYE, "Verified terms,\nnot reputations",
  "Each entry states what the firm publishes, what it does not publish, and the fit question that decides whether an application is worth writing."),
 ("legend", [("ready", "Window open now"), ("anticipated", "No open window found"), ("na", "Channel could not be verified")]),
 ("card", "ready", "Y Combinator, Fall 2026 batch", "ycombinator.com/apply", "Michael Ward",
  "On-time deadline was July 27, 2026, and late applications are still accepted with no promised decision date. Batch runs October to December, in person in San Francisco. Standard deal is $500,000: $125,000 on a post-money SAFE for 7 percent, plus $375,000 on an uncapped MFN SAFE that converted at a $15M cap would be a further 2.5 percent. No fees. Pro rata rights on later rounds. Requires a US, Canada, Cayman, or Singapore corporation."),
 ("card", "ready", "SOSV and IndieBio", "sosv.com/apply/sosv", "Michael Ward",
  "Rolling application, no deadline published. Choose the New York or San Francisco program. Topic categories on the form that fit include Sustainability and Decarbonization, Energy and Industrial Resilience, and Advanced Research Tools. The form asks directly about patents and prior outside investment. Terms are not published on the application page: confirm the check size and equity percentage in writing before accepting anything."),
 ("card", "ready", "LabCentral Golden Tickets", "labcentral.org", "Michael Ward",
  "Sponsor-funded residency, which is lab access rather than a check and is the only item in this category that is not equity. Three application events are posted: BioMarin on September 4, 2026, and AbbVie and Breakthrough T1D on September 11, 2026. **Fit question:** LabCentral describes its labs as biological R&D in service of human health, and all three sponsors are therapeutics companies. PlastiBioFuel is industrial biotechnology. Read the eligibility on each ticket before spending a day on it."),
 ("card", "anticipated", "Breakthrough Energy", "breakthroughenergy.org", "Michael Ward",
  "The fellows program URL redirects to the home page and no open application window is published. Recheck each run. Breakthrough Energy Ventures invests rather than granting, and does so by introduction."),
 ("card", "na", "Lowercarbon Capital", "lowercarboncapital.com", "Michael Ward",
  "The site returns 403 to this environment, so nothing about their process could be verified. Not recorded as closed. A warm introduction through an accelerator or a portfolio founder is the realistic path regardless of what the site says."),
 ("card", "anticipated", "Radical Ventures", "radical.vc", "Michael Ward",
  "Thesis is artificial intelligence, and the portfolio is AI infrastructure, models, and AI-native biotechnology. The company's modeling loop is the only part of this business that fits that thesis, and it is a component rather than the product. Weakest fit of the named funds. Revisit if the modeling work becomes a product in its own right."),
 ("tint", "ON WARM INTRODUCTIONS", None,
  "Every seed fund named in the plan is introduction-driven, which is exactly why the accelerators sit first in the sequence. An accelerator is the introduction. Cold email to a seed fund with no traction is the lowest-yield activity available and it is not in the outreach queue for that reason."),
 ("footer", CONTACT_L, CONTACT_R),
]

# --------------------------------------------------------------- PIPELINE
pipeline = [
 ("masthead", "PIPELINE TRACKER"),
 ("hero", EYE, "50 outreaches,\n10 chats,\n2 to 3 letters",
  "The funnel as stated, with the definitions that make it countable and the current standing. The live copy is PIPELINE.md, which every run updates."),
 ("statbar", [("50", "OUTREACHES"), ("10", "CONVERSATIONS"), ("3", "PILOTS OR LOIS")]),
 ("chip", "STAGE DEFINITIONS", "So a number means one thing"),
 ("kvrows", [
   ("Outreach sent", "A written approach left the building, to a named office, person, or firm. Drafted is not sent. An application submitted to a program counts as an outreach as well as an application."),
   ("Reply received", "Any human response that is not an autoresponder."),
   ("Conversation held", "A call, a meeting, or a substantive written exchange. The target of ten."),
   ("Pilot or letter of intent", "A written expression of intent to test, buy, host, fund, or collaborate. The target of two to three. ARG Petro is discussions and is not one of these until something is signed."),
 ]),
 ("chip", "STANDING AS OF THIS RUN", "August 25, 2026"),
 ("kvrows", [
   ("Written", "8 approaches across two outreach batches, plus 2 accelerator applications drafted here."),
   ("Sent", "0. Five are staged as Gmail drafts and wait on Michael."),
   ("Replies", "0."),
   ("Conversations", "0."),
   ("Pilots or LOIs", "0."),
   ("Gap to 50", "42 approaches. At one per loop run this takes into 2027, which is the argument for batching rather than pacing."),
 ]),
 ("callout", "WHAT THE FUNNEL IMPLIES ABOUT CADENCE",
  "Fifty outreaches at one per run is a year of runs. The loop now writes them in batches instead: eight already exist, and the queue can absorb university tech transfer offices, corporate venture arms in chemicals and packaging, waste haulers, and bottlers without changing the format. The constraint is not writing them. The constraint is that none of the eight already written has been sent."),
 ("footer", CONTACT_L, CONTACT_R),
]

# ------------------------------------------------------------ NEXT ACTIONS
actions = [
 ("masthead", "NEXT ACTIONS"),
 ("hero", EYE, "In order,\nwith reasons",
  "Sequenced so that the free and reversible things happen before the expensive and irreversible ones."),
 ("step", 1, B + "Call patent counsel about 63/848,456.</font> Confirm a non-provisional or PCT was filed before the July 2026 lapse. Everything about public posting and everything an investor will ask in diligence turns on the answer. One call."),
 ("step", 2, B + "Send the eight outreaches already written.</font> Five are Gmail drafts. Zero have been sent, and no funnel starts at zero sends."),
 ("step", 3, B + "Submit the DOE Genesis Mission pitch by September 10.</font> Built, audited, sixteen days out, $250,000, no equity, no cost share."),
 ("step", 4, B + "Decide the Oak Ridge question before September 15.</font> Innovation Crossroads requires relocating for two years. If that is a no, the loop stops building for it and spends the effort on Activate."),
 ("step", 5, B + "Apply to Activate and Innovation Crossroads when they open September 15.</font> Both are non-dilutive, both cap outside funding at $2M, and applying first forecloses nothing."),
 ("step", 6, B + "Then decide on accelerators.</font> YC's late window and SOSV's rolling application do not expire on a date the way the September 15 programs do. Price the LLC conversion before applying, not after acceptance."),
 ("h1", "The one thing this package will not do"),
 ("p", "It will not tell you whether to trade equity for speed. Bills are real and federal money is slow, and that tension is not resolvable by more research. What the loop can do is make sure the free money is applied for before the expensive money makes it unavailable, and that is what the sequence above protects."),
 ("footer", "PlastiBioFuel LLC  ·  michael@plastibiofuel.com  ·  SDVOSB, certified and active in SAM.gov", CONTACT_R),
]

DOCS = {
 "01_Opportunity_Brief": brief,
 "02_Targets_and_Terms": targets,
 "03_Eligibility_Interactions": interactions,
 "04_Pipeline_Tracker": pipeline,
 "05_Next_Actions": actions,
}
