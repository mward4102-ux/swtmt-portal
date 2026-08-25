# -*- coding: utf-8 -*-
"""Strategic outreach, batch 01, run of 2026-08-25.

Outreach is not an application and no document here may read like one. Each
letter asks for one small, specific thing that a federal office can say yes to
without a decision memo: a notification list, a name, or fifteen minutes.

Every contact channel in this package was read off the issuing office's own page
on the date recorded beside it. Nothing here is inferred from a pattern, and no
address is written down that was not seen published.
"""
WORD_LIMITS = {}

CONTACT_L = "PlastiBioFuel LLC  ·  12380 Iveson Drive, Haslet, TX 76052  ·  michael@plastibiofuel.com  ·  817-319-7383"
CONTACT_R = "UEI KQAWZ54RDUM8  ·  CAGE 175D6"
EYE = "STRATEGIC OUTREACH  ·  BATCH 01  ·  FEDERAL R&D"
B = '<font name="Helvetica-Bold">'

# ------------------------------------------------------------------ BRIEF
brief = [
 ("masthead", "OUTREACH BRIEF"),
 ("hero", "PLASTIBIOFUEL LLC  ·  SDVOSB",
  "Getting on\nthe radar",
  "Three federal offices whose job is to know companies like this one. No deadlines, no forms, no applications. Each letter asks for one thing an office can grant without a decision."),
 ("stats", [("LETTERS", "3", "Ready to send today"),
            ("QUEUE BEHIND THEM", "7", "One per run from here"),
            ("COST", "Under an hour", "Total, for all three")]),
 ("alert", "Outreach does not win awards. It decides whether the people who write topics and run programs know the company exists before the next window opens."),
 ("factgrid", [
   ("WHY NOW", "A DOE pitch lands September 10 and a DOE teaming list is open. Both give a reason to write that is not simply asking for attention."),
   ("WHAT IS ASKED", "To be added to a notification list, to be pointed at the right program manager, or fifteen minutes. Nothing that costs an office a decision."),
   ("WHAT IS NEVER ASKED", "Money, a set-aside, preferential treatment, or feedback on a pending proposal. The first three are improper and the fourth is unwise."),
   ("WHO SENDS", "Michael Ward, from michael@plastibiofuel.com. Federal offices answer founders, not agents."),
   ("WHAT IS CLAIMED", "Only what the signed UNT report establishes. No reactor is built, no ethanol has been produced, and neither letter says otherwise."),
   ("CADENCE", "One outreach per funding-loop run, advancing the queue cursor. Batch 01 is three at once because they are the front doors."),
 ]),
 ("small", "Every contact channel was read off the issuing office's own page and is dated in the Targets and Channels document. Verified August 25, 2026."),
 ("footer", CONTACT_L, CONTACT_R),
]

# ---------------------------------------------------------------- LETTERS
L1_SUBJ = "SDVOSB introduction: enzymatic PET to chemicals, Haslet TX (UEI KQAWZ54RDUM8)"
L1 = (
 "Dear Office of Small Business Programs,\n\n"
 "I am writing to introduce PlastiBioFuel LLC, a service-disabled veteran-owned small business "
 "in Haslet, Texas, SDVOSB certified and active in SAM.gov. We "
 "convert post-consumer PET into chemicals using an enzyme immobilized in a covalent organic "
 "framework, with a sponsored research agreement at the University of North Texas.\n\n"
 "Where the work stands: an independent final report from UNT confirms that our enzyme breaks "
 "real post-consumer bottle PET down to terephthalic acid, and identifies mass transfer as the "
 "limit on rate. Our reactor design exists as a validated model and not yet as hardware. We are "
 "a first-time federal applicant with a DOE SBIR/STTR pitch going in on September 10 and an NSF "
 "SBIR proposal in preparation.\n\n"
 "Two questions, and I know your office fields many:\n\n"
 "1. Is there a small business program manager in the DOE offices working on chemicals from "
 "waste feedstocks that you would point me toward?\n\n"
 "2. How do I get on the notification list for vendor outreach sessions and the Mentor-Protege "
 "Program?\n\n"
 "I am not asking for consideration on anything pending. I would rather be known before the next "
 "window opens than introduce myself inside an application.\n\n"
 "Respectfully,\n\n"
 "Michael David Ward\n"
 "Founder and Chief Executive Officer, PlastiBioFuel LLC\n"
 "UEI KQAWZ54RDUM8  |  CAGE 175D6  |  SDVOSB, certified and active in SAM.gov\n"
 "michael@plastibiofuel.com  |  817-319-7383  |  plastibiofuel.com"
)

L2_SUBJ = "FY26 Phase I notification list and topic questions, PlastiBioFuel LLC (SDVOSB)"
L2 = (
 "Dear DOE SBIR/STTR Program Office,\n\n"
 "PlastiBioFuel LLC is a service-disabled veteran-owned small business in Haslet, Texas working "
 "on enzymatic conversion of post-consumer PET to chemicals. We are preparing a pitch for the "
 "FY26 Phase I Genesis Mission opportunity under Topic 1, due September 10.\n\n"
 "This note is not about that pitch and needs no reply that touches it.\n\n"
 "The opportunity page states that a broader Phase I funding opportunity covering additional "
 "technology topics will follow later this summer. Our reactor hardware work fits that broader "
 "call better than it fits the Genesis Mission framing, so:\n\n"
 "1. Is there a notification list for the broader FY26 Phase I release, beyond the general "
 "mailing list?\n\n"
 "2. For future topic cycles, who is the right person to hear from small businesses working on "
 "chemical recycling and waste-to-chemical conversion?\n\n"
 "We are a first-time DOE applicant, which is the reason for asking rather than assuming.\n\n"
 "Respectfully,\n\n"
 "Michael David Ward\n"
 "Founder and Chief Executive Officer, PlastiBioFuel LLC\n"
 "UEI KQAWZ54RDUM8  |  CAGE 175D6  |  SDVOSB, certified and active in SAM.gov\n"
 "michael@plastibiofuel.com  |  817-319-7383  |  plastibiofuel.com"
)

L3_SUBJ = "SDVOSB capability introduction: waste plastic to fuel and chemicals (UEI KQAWZ54RDUM8)"
L3 = (
 "Dear Office of Industrial Base Growth,\n\n"
 "PlastiBioFuel LLC is a service-disabled veteran-owned small business in Haslet, Texas, "
 "SDVOSB certified and active in SAM.gov. We work on converting "
 "waste PET plastic into chemicals, and our longer objective is fuel.\n\n"
 "The reason to write your office rather than a science office: fuel and its logistics are a "
 "tonnage problem before they are a chemistry problem, and waste plastic is one of the few "
 "feedstocks that is already present wherever people are. We are early. An independent "
 "university report confirms our enzyme converts real post-consumer bottle PET to terephthalic "
 "acid; our reactor exists as a validated model rather than hardware; and we have produced no "
 "fuel yet. I would rather say that plainly now than overstate it.\n\n"
 "Two questions:\n\n"
 "1. Which service or agency small business office would you point a first-time SDVOSB vendor "
 "toward for waste-to-energy and expeditionary fuel work?\n\n"
 "2. Is the Texas APEX Accelerator the right first stop for a company at our stage?\n\n"
 "Respectfully,\n\n"
 "Michael David Ward\n"
 "Founder and Chief Executive Officer, PlastiBioFuel LLC\n"
 "UEI KQAWZ54RDUM8  |  CAGE 175D6  |  SDVOSB, certified and active in SAM.gov\n"
 "michael@plastibiofuel.com  |  817-319-7383  |  plastibiofuel.com"
)

letters = [
 ("masthead", "OUTREACH LETTERS"),
 ("hero", EYE, "Three letters,\nready to send",
  "Send from michael@plastibiofuel.com. Subject lines are written to survive a crowded inbox and to say SDVOSB in the first few words."),
 ("chip", "LETTER 1  ·  DOE OFFICE OF SMALL BUSINESS PROGRAMS", "smallbusiness@hq.doe.gov"),
 ("factwide", "SUBJECT", L1_SUBJ),
 ("p", L1),
 ("chip", "LETTER 2  ·  DOE SBIR/STTR PROGRAM OFFICE", "sbir-sttr@hq.doe.gov, copy sbir-sttr@connectwerx.org"),
 ("factwide", "SUBJECT", L2_SUBJ),
 ("callout", "SEND THIS ONE AFTER THE PITCH IS IN",
  "The letter says it is not about the pending pitch, and that is true. It still reads better arriving after September 10 than during the review. If the pitch slips, send it anyway; nothing in it asks for consideration."),
 ("p", L2),
 ("chip", "LETTER 3  ·  DEPARTMENT OF WAR, OFFICE OF INDUSTRIAL BASE GROWTH", "osd.business.defense@mail.mil"),
 ("factwide", "SUBJECT", L3_SUBJ),
 ("p", L3),
 ("footer", CONTACT_L, CONTACT_R),
]

# ------------------------------------------------------- CAPABILITY PAGE
snapshot = [
 ("masthead", "CAPABILITY SNAPSHOT"),
 ("hero", "PLASTIBIOFUEL LLC  ·  HASLET, TEXAS", "Post-consumer PET\nto chemicals",
  "One page, written to be forwarded. Every number on it traces to a signed independent report."),
 ("statbar", [("122", "MICROMOL/H/MG TURNOVER, IMMOBILIZED"), ("3", "MILESTONES CLOSED EARLY"), ("1", "PROVISIONAL PATENT")]),
 ("factgrid", [
   ("ENTITY", "PlastiBioFuel LLC. UEI KQAWZ54RDUM8, CAGE 175D6. Service-disabled veteran-owned small business, certified and active in SAM.gov."),
   ("NAICS", "325199 other basic organic chemical manufacturing; 325193 ethyl alcohol manufacturing; 541715 research and development."),
   ("WHAT WE DO", "A PET hydrolase immobilized in a covalent organic framework depolymerizes post-consumer PET. A continuous spiral-flow reactor, designed in simulation, is the intended production form."),
   ("RESEARCH PARTNER", "University of North Texas, Prof. Shengqian Ma, under Sponsored Research Agreement SRA1016. Framework and immobilization chemistry."),
   ("INTELLECTUAL PROPERTY", "USPTO provisional application 63/848,456, filed July 2025. Framework immobilization, spiral-flow reactor geometry, and the integrated process."),
 ]),
 ("chip", "ESTABLISHED BY INDEPENDENT REPORT", "UNT Final Project Report, Phase I, signed 2026-08-07"),
 ("kvrows", [
   ("Depolymerization confirmed", "Free FAST-PETase breaks real post-consumer water bottle PET down to terephthalic acid, confirmed by HPLC against standards."),
   ("Immobilization confirmed", "The enzyme loads into a TAPB-BPDA-COF with no protein detectable in the supernatant at 280 nm."),
   ("Activity retained", "Immobilized turnover measured 122 micromol per hour per milligram at 24 hours, against a 246 to 348 literature range for the free enzyme."),
   ("Bottleneck identified", "The laboratory attributes that gap to mass transfer down the framework channel rather than to loss of enzyme activity. Transport is what reactor geometry decides."),
   ("Schedule", "Three milestones completed ahead of schedule."),
 ]),
 ("chip", "NOT YET ESTABLISHED, STATED PLAINLY", ""),
 ("kvrows", [
   ("No reactor built", "The spiral-flow reactor exists as a validated model. The report lists vessel shape and size as future work."),
   ("No ethanol produced", "The route from monomer to fuel-grade ethanol is the objective and has not been demonstrated."),
   ("No offtake executed", "Commercial offtake is in discussion. There is no signed letter of intent and no executed agreement."),
   ("Fuel credits unqualified", "Any renewable fuel credit eligibility remains subject to final pathway qualification."),
 ]),
 ("tint", "WHAT WE ARE LOOKING FOR", None,
  "Partners and programs in chemicals from waste feedstocks, pre-pilot reactor capacity, and downstream separations. First-time federal applicant, prepared to work as prime or subrecipient."),
 ("footer", CONTACT_L, CONTACT_R),
]

# ------------------------------------------------- TARGETS AND CHANNELS
targets = [
 ("masthead", "TARGETS AND CHANNELS"),
 ("hero", EYE, "Who, where,\nand verified when",
  "Batch 01 is sending now. The queue below runs one per loop run, oldest cursor first. No channel enters this list without being read off the office's own page."),
 ("legend", [("confirmed", "Channel read off the office's own page on the date shown"),
            ("anticipated", "Office identified, channel not yet published or not yet verified")]),
 ("chip", "BATCH 01  ·  SENDING NOW", "Three letters written"),
 ("card", "confirmed", "DOE Office of Small Business Programs", "smallbusiness@hq.doe.gov  ·  202-586-7377  ·  1000 Independence Ave SW, Room 5B-194, Washington DC 20585", "Michael Ward",
  "Verified 2026-08-25 on energy.gov. Directed by Charlie Smith. Runs the Mentor-Protege Program, the Small Business Program Managers Directory, and vendor events. Its 2025 to 2030 strategic plan names expanding the small business industrial base as a pillar, which is the opening the letter uses."),
 ("card", "confirmed", "DOE SBIR/STTR Program Office and ConnectWerx", "sbir-sttr@hq.doe.gov  ·  sbir-sttr@connectwerx.org", "Michael Ward",
  "Both addresses verified 2026-08-22 on the ConnectWerx opportunity page. On 2026-08-25 the page displayed them behind email obfuscation and they could not be re-read, so the earlier date stands as the verification date."),
 ("card", "confirmed", "Department of War, Office of Industrial Base Growth (OSBP)", "osd.business.defense@mail.mil", "Michael Ward",
  "Verified 2026-08-25 on business.defense.gov. The office was renamed from Office of Small Business Programs; OSBP continues inside it. Also the front door to APEX Accelerators and the Mentor-Protege Program."),
 ("chip", "QUEUE  ·  ONE PER RUN", "Cursor at position 1"),
 ("card", "confirmed", "1. DOE Alternative Fuels and Feedstocks Office, ASPECT", "ASPECT@doe.gov  ·  Josh Messner", "Michael Ward",
  "Verified 2026-08-25 on eere-exchange.energy.gov. Send after the ASPECT teaming-list entry is submitted so the letter can reference it. That is the whole reason it sits at position 1."),
 ("card", "anticipated", "2. EPA SBIR Program", "Web contact form only  ·  Office of Science Advisor, Policy and Engagement, 1200 Pennsylvania Ave NW, Room 8104R, Washington DC 20460", "Michael Ward",
  "Verified 2026-08-25 on epa.gov. No email address is published; the form and postal mail are the only published channels. Time this one near the June solicitation cycle."),
 ("card", "anticipated", "3. USDA NIFA SBIR/STTR program office", "Named staff, no published email", "Michael Ward",
  "Verified 2026-08-25 on nifa.usda.gov: National Program Leader Dr. David Songstad, Program Coordinator Tammi Neville (acting), Program Specialist Nurun Nahar. The page publishes names without addresses, so the channel needs a call before a letter is written. Weakest fit of the queue: USDA wants an agricultural nexus."),
 ("card", "anticipated", "4. Texas APEX Accelerator", "Channel not yet verified", "Michael Ward",
  "Named on business.defense.gov as the counseling network for first-time federal vendors. Free. Verify the Texas regional office before writing."),
 ("card", "anticipated", "5. DOE national laboratory partnering offices", "Channel not yet verified", "Michael Ward",
  "NREL, ORNL, and Argonne run small business and technology partnership programs. nrel.gov did not resolve from this environment on 2026-08-25 and needs a retry."),
 ("card", "anticipated", "6. ARPA-E", "Channel not yet verified", "Michael Ward",
  "Worth a relationship before the next IGNIITE concept-paper window, which is the spring. IGNIITE 2026 was missed because it is invitation-only off a concept paper."),
 ("card", "anticipated", "7. NASA SBIR/STTR", "Channel not yet verified", "Michael Ward",
  "The nasa.gov SBIR page has moved and returned 404 on 2026-08-25. Lowest priority of the queue on fit."),
 ("callout", "DELIBERATELY NOT ON THIS LIST: NSF",
  "NSF proposal 328095 is pending. Unsolicited outreach to program staff while a proposal is under review can muddy the record and cannot help it. NSF's own front door is the Project Pitch, which is a submission rather than an introduction. Revisit after 328095 has an outcome."),
 ("footer", CONTACT_L, CONTACT_R),
]

# --------------------------------------------------------- SEND CHECKLIST
send = [
 ("masthead", "SEND CHECKLIST"),
 ("hero", EYE, "Send, log,\nand handle replies",
  "The letters are written. What follows is the part that decides whether outreach compounds or evaporates."),
 ("step", 1, 'Send Letter 1 and Letter 3 today, from ' + B + 'michael@plastibiofuel.com</font>. They stand on their own and wait on nothing.'),
 ("step", 2, "Attach the Capability Snapshot PDF to both. It is the page that gets forwarded internally when someone decides you are worth passing along."),
 ("step", 3, "Hold Letter 2 until the DOE pitch is submitted on September 10, then send it. If the pitch slips, send it anyway."),
 ("step", 4, 'Copy ' + B + 'sbir-sttr@connectwerx.org</font> on Letter 2. ConnectWerx administers the program and answers faster than the department.'),
 ("step", 5, "Log each send in the outreach queue with the date. The next loop run reads that file and will not write the same office twice."),
 ("step", 6, "If no reply in 21 days, send one short follow-up. One. A second follow-up to a federal small business office costs more goodwill than it buys."),
 ("step", 7, "When a reply names a person, that name enters the queue as its own entry with the date and the referral source. A referral is the whole point of the exercise."),
 ("step", 8, "When a reply offers a call, take it and write down what they say about upcoming topics. Topic language is written months before a solicitation posts."),
 ("h1", "What counts as this working"),
 ("p", "Not a grant. A name, a notification list, or an invitation to a vendor session. Those are the things that turn the next application from a cold submission into one from a company somebody already recognizes. Three replies out of ten letters would be a good rate for cold federal outreach, and the ones that answer are usually the ones whose job it is to answer."),
 ("h1", "One rule that protects everything else"),
 ("p", "Never ask any of these offices about a pending proposal, and never imply that an introduction should bear on a review. Say plainly, as all three letters do, that nothing is being asked for on anything pending. Small business offices talk to program offices, and a company that appears to be working an angle is remembered for that."),
 ("footer", "PlastiBioFuel LLC  ·  michael@plastibiofuel.com  ·  SDVOSB", CONTACT_R),
]

DOCS = {
 "01_Outreach_Brief": brief,
 "02_Outreach_Letters": letters,
 "03_Capability_Snapshot": snapshot,
 "04_Targets_and_Channels": targets,
 "05_Send_Checklist": send,
}
