# -*- coding: utf-8 -*-
"""Strategic outreach, batch 02, run of 2026-08-25.

Batch 02 finishes the queue. Every remaining target is written here rather than
left for a future run to verify, including the two whose only published channel
is a web form or a telephone.

Channels were read off each office's own page on 2026-08-25 unless noted.
"""
WORD_LIMITS = {}

CONTACT_L = "PlastiBioFuel LLC  ·  12380 Iveson Drive, Haslet, TX 76052  ·  michael@plastibiofuel.com  ·  817-319-7383"
CONTACT_R = "UEI KQAWZ54RDUM8  ·  CAGE 175D6"
EYE = "STRATEGIC OUTREACH  ·  BATCH 02  ·  QUEUE COMPLETE"
B = '<font name="Helvetica-Bold">'

SIG = ("Respectfully,\n\n"
 "Michael David Ward\n"
 "Founder and Chief Executive Officer, PlastiBioFuel LLC\n"
 "UEI KQAWZ54RDUM8  |  CAGE 175D6  |  SDVOSB, certified and active in SAM.gov\n"
 "michael@plastibiofuel.com  |  817-319-7383  |  plastibiofuel.com")

# ------------------------------------------------------------------ BRIEF
brief = [
 ("masthead", "OUTREACH BRIEF"),
 ("hero", "PLASTIBIOFUEL LLC  ·  SDVOSB", "Finishing\nthe queue",
  "Five more channels, all verified today. Two of them turned out to be funding routes rather than introductions, and both are in the registry now."),
 ("stats", [("CHANNELS WRITTEN", "5", "Queue complete"),
            ("STILL UNVERIFIED", "1", "NASA, lowest fit")]),
 ("alert", "Two finds worth more than the outreach: ORNL Innovation Crossroads takes applications September 15 to October 30, and the Cross Timbers APEX conference is October 27 in Hurst, twenty minutes from Haslet."),
 ("factgrid", [
   ("ARPA-E", "Relationship before the spring IGNIITE concept-paper window. IGNIITE 2026 was invitation-only off a concept paper and was missed."),
   ("CROSS TIMBERS APEX ACCELERATOR", "At UT Arlington, covering 75 counties including Tarrant. Free counseling under a Department of War cooperative agreement. Has a veterans track."),
   ("ORNL PARTNERSHIPS", "Host of Innovation Crossroads, a DOE Lab-Embedded Entrepreneurship Program node. The outreach and the application are two different actions and both are worth taking."),
   ("EPA SBIR", "No email is published. The web form is the channel, so the text below is written to be pasted into it."),
   ("USDA NIFA", "Names published without addresses. A call script rather than a letter, because that is the only channel the agency actually offers."),
   ("NASA SBIR", "Still the one gap. The program site publishes no reachable address and the fit is the weakest on the list. Left in the queue rather than papered over."),
 ]),
 ("footer", CONTACT_L, CONTACT_R),
]

# ---------------------------------------------------------------- LETTERS
L4_SUBJ = "SDVOSB introduction ahead of the next IGNIITE cycle (UEI KQAWZ54RDUM8)"
L4 = (
 "Dear ARPA-E,\n\n"
 "PlastiBioFuel LLC is a service-disabled veteran-owned small business in Haslet, Texas. We "
 "convert post-consumer PET into chemicals using an enzyme immobilized in a covalent organic "
 "framework, with a sponsored research agreement at the University of North Texas.\n\n"
 "I am writing early rather than late. IGNIITE 2026 closed to concept papers in May and moved to "
 "invitation, so we missed the cycle by not knowing it existed. I would rather be on the list "
 "before the next one opens.\n\n"
 "Two questions:\n\n"
 "1. How do I make sure we hear about the next IGNIITE concept paper window, and about any "
 "ARPA-E program relevant to chemicals from waste feedstocks?\n\n"
 "2. Is there a teaming partner list or an open RFI where a company at our stage is useful to "
 "you rather than the other way around?\n\n"
 "Where we stand, plainly: an independent final report from UNT confirms our enzyme breaks real "
 "post-consumer bottle PET down to terephthalic acid and identifies mass transfer as the limit on "
 "rate. Our reactor is a validated model, not hardware. We have produced no fuel.\n\n" + SIG
)

L5_SUBJ = "SDVOSB in Haslet seeking government contracting counseling and the October GPC"
L5 = (
 "Dear Cross Timbers APEX Accelerator,\n\n"
 "PlastiBioFuel LLC is a service-disabled veteran-owned small business in Haslet, Texas, inside "
 "your service area. We are an R&D company converting post-consumer PET into chemicals, "
 "registered in SAM.gov with a UEI and CAGE code, and we are a first-time federal applicant with "
 "a DOE SBIR/STTR pitch going in on September 10.\n\n"
 "I would like to become a client. Specifically:\n\n"
 "1. I would like to complete the Cross Timbers application and be assessed for the right "
 "readiness track. My read is that we sit between the JV Squad and Varsity descriptions: "
 "registered and operating, but pre-revenue and research stage rather than supply chain ready.\n\n"
 "2. I would like to register for the 30th Annual Government Procurement Conference on October "
 "27 at the Hurst Conference Center, and to know whether the matchmaking sessions are useful for "
 "a research company rather than a products or services vendor.\n\n"
 "3. Your veterans track: is there anything specific to SDVOSB firms in the R&D space that I "
 "should be doing and am probably not?\n\n"
 "We are a small team and I would rather learn the process properly than guess at it.\n\n" + SIG
)

L6_SUBJ = "SDVOSB introduction: enzymatic PET conversion, and Innovation Crossroads Cohort 2027"
L6 = (
 "Dear ORNL Partnerships,\n\n"
 "PlastiBioFuel LLC is a service-disabled veteran-owned small business in Haslet, Texas, working "
 "on enzymatic conversion of post-consumer PET into chemicals. Our enzyme is immobilized in a "
 "covalent organic framework, and we hold a sponsored research agreement with Prof. Shengqian Ma "
 "at the University of North Texas.\n\n"
 "Two reasons to write.\n\n"
 "First, Innovation Crossroads. I intend to apply to Cohort 2027 when applications open on "
 "September 15, under Advanced Fuel and Feedstock technology. If there is an informational "
 "webinar scheduled, I would like to attend.\n\n"
 "Second, and separate from that application: our bottleneck is a transport problem. An "
 "independent UNT report attributes the gap between our immobilized turnover and the free-enzyme "
 "literature range to mass transfer down the framework channel. That is a question neutron "
 "science and characterization at ORNL are built to answer, and I would like to understand what "
 "collaborative mechanisms exist for a company our size, whether or not the fellowship works out.\n\n"
 "Our reactor is a validated model rather than hardware, and we have produced no fuel yet. I say "
 "that up front because it determines which of your mechanisms actually fits.\n\n" + SIG
)

letters = [
 ("masthead", "OUTREACH LETTERS"),
 ("hero", EYE, "Three more letters,\nready to send",
  "Same rules as batch 01. One small ask each, nothing about a pending proposal, and nothing claimed that the record does not carry."),
 ("chip", "LETTER 4  ·  ARPA-E", "ARPA-E-CO@hq.doe.gov"),
 ("factwide", "SUBJECT", L4_SUBJ),
 ("p", L4),
 ("chip", "LETTER 5  ·  CROSS TIMBERS APEX ACCELERATOR, UT ARLINGTON", "CrossTimbers@uta.edu  ·  817-272-5978"),
 ("factwide", "SUBJECT", L5_SUBJ),
 ("callout", "SEND THIS ONE FIRST",
  "It is free, it is local, it is the only target on either list whose entire job is to help a company in your county win federal work, and the October 27 conference is a hard date. If only one letter goes out this week, send this one."),
 ("p", L5),
 ("chip", "LETTER 6  ·  OAK RIDGE NATIONAL LABORATORY, PARTNERSHIPS", "Contact form at ornl.gov/partnerships  ·  865-241-6765"),
 ("factwide", "SUBJECT", L6_SUBJ),
 ("p", L6),
 ("footer", CONTACT_L, CONTACT_R),
]

# ------------------------------------------------- NON-EMAIL CHANNELS
EPA_FORM = (
 "PlastiBioFuel LLC is a service-disabled veteran-owned small business in Haslet, Texas "
 "(UEI KQAWZ54RDUM8, CAGE 175D6) working on enzymatic conversion of post-consumer PET plastic "
 "into chemicals, with a sponsored research agreement at the University of North Texas.\n\n"
 "Your funding opportunities page states that no EPA SBIR solicitation is currently open, and "
 "the anticipated date shown on that page appears to be out of date. Two questions:\n\n"
 "1. When is the next EPA SBIR Phase I solicitation expected to open? Recent cycles have opened "
 "in June and closed in August.\n\n"
 "2. Beyond the SBIR listserv, is there a way to hear about topic development for the next "
 "cycle? Our work sits in the circular economy and waste conversion area, which EPA has "
 "highlighted in its own SBIR success stories.\n\n"
 "We are a first-time EPA applicant and would rather understand the cycle before it opens than "
 "discover it after it closes.\n\n"
 "Michael David Ward, Founder and CEO, PlastiBioFuel LLC, michael@plastibiofuel.com, 817-319-7383"
)

USDA_SCRIPT = (
 "Ask for the SBIR/STTR program office. Named staff as published on nifa.usda.gov: Dr. David "
 "Songstad, National Program Leader; Tammi Neville, Program Coordinator (acting); Nurun Nahar, "
 "Program Specialist.\n\n"
 "Opening: \"My name is Michael Ward. I run PlastiBioFuel, a service-disabled veteran-owned small "
 "business in Haslet, Texas. We convert waste PET plastic into chemicals. I am trying to work out "
 "whether USDA SBIR is a fit for us before the next cycle opens, and I would rather ask than "
 "guess.\"\n\n"
 "The real question: USDA requires an agricultural nexus, and post-consumer plastic is not "
 "obviously agricultural. Ask directly whether agricultural plastic waste, which is a genuine "
 "on-farm disposal problem, counts under any of the ten topic areas. If the answer is no, thank "
 "them and remove USDA from the queue rather than applying into a mismatch.\n\n"
 "Also ask: when does the FY2027 solicitation open, and is the program page going to be updated, "
 "since it still shows the FY2025 notice that closed in September 2024."
)

channels = [
 ("masthead", "NON-EMAIL CHANNELS"),
 ("hero", EYE, "Two offices that\npublish no address",
  "Written anyway. An office that offers only a form or a telephone is not an office that cannot be reached."),
 ("chip", "EPA SBIR PROGRAM", "Web form at epa.gov/sbir, contact page"),
 ("callout", "HOW TO USE THIS",
  "Paste the text below into the EPA SBIR contact form. Add your email address in the form's email field so a reply is possible; the form says a response requires it. The postal alternative is Office of Science Advisor, Policy and Engagement, US EPA, 1200 Pennsylvania Avenue NW, Room 8104R, Washington DC 20460."),
 ("p", EPA_FORM),
 ("chip", "USDA NIFA SBIR/STTR", "Named staff, no published address"),
 ("callout", "WHY A SCRIPT AND NOT A LETTER",
  "NIFA publishes the names of its SBIR staff without email addresses. Rather than guess at an address format, this is a call script. If a name and address come back, they enter the outreach queue as a new entry."),
 ("p", USDA_SCRIPT),
 ("footer", CONTACT_L, CONTACT_R),
]

# ------------------------------------------------------ TWO REAL FINDS
finds = [
 ("masthead", "TWO FINDS FROM THIS BATCH"),
 ("hero", EYE, "Not outreach.\nFunding.",
  "Both surfaced while verifying contact channels. Both are in the registry, and both want action in September."),
 ("chip", "ORNL INNOVATION CROSSROADS  ·  COHORT 2027", "Applications Sep 15 to Oct 30, 2026"),
 ("statbar", [("$115,000", "PER YEAR, LIVING STIPEND"), ("2", "YEARS"), ("8", "PAGE APPLICATION")]),
 ("p", "A Lab-Embedded Entrepreneurship Program node at Oak Ridge, run under DOE's Office of "
  "Technology Commercialization. Two-year funded fellowship, R&D funding for collaboration with "
  "ORNL researchers, full access to lab facilities, health insurance stipend, and professional "
  "development allowance. Applications open 8:00 AM ET September 15 and close 8:00 PM ET October 30."),
 ("kvrows", [
   ("Fit", "Advanced Fuel and Feedstock technology is a named topic area, as is innovation in manufacturing and scale-up for energy applications. This is a direct fit, not a stretch."),
   ("Eligibility met", "Raised no more than $2M from non-government sources in the prior three years. US citizen. Willing to execute a CRADA."),
   ("Eligibility to check", "Doctoral degree or equivalent experience. Equivalent experience is the operative phrase and is worth asking about directly."),
   ("The real constraint", "Relocation to the Knoxville and Oak Ridge area for two years is required. That is a genuine decision for a Haslet company with a UNT subaward, and it is not a paperwork detail."),
   ("Timing note", "Applications open the same day as the Activate Fellowship. Activate's FAQ addresses whether an applicant may apply to both Activate and a LEEP program. Read that answer before committing to either."),
 ]),
 ("chip", "CROSS TIMBERS APEX  ·  30TH GOVERNMENT PROCUREMENT CONFERENCE", "October 27, 2026"),
 ("p", "At the Hurst Conference Center, roughly twenty minutes from Haslet. Government agencies, "
  "prime contractors, and small businesses in one room, run by the accelerator whose service area "
  "includes Tarrant County. Registration is through Cross Timbers. Their counseling is free and "
  "funded by a Department of War cooperative agreement, and they run a veterans track."),
 ("footer", CONTACT_L, CONTACT_R),
]

# --------------------------------------------------------- SEND CHECKLIST
send = [
 ("masthead", "SEND CHECKLIST"),
 ("hero", EYE, "Order of\noperations",
  "Six letters now exist across both batches. This is the order that gets the most out of them."),
 ("step", 1, B + 'Cross Timbers APEX, today.</font> Free, local, and the October 27 conference is a fixed date. Highest return per minute on either list.'),
 ("step", 2, B + 'DOE Office of Small Business Programs and Department of War, today.</font> Batch 01, letters 1 and 3. They wait on nothing.'),
 ("step", 3, B + 'ORNL Partnerships, this week.</font> Ask about the Innovation Crossroads webinar before applications open on September 15.'),
 ("step", 4, B + 'ARPA-E, this week.</font> Nothing time-critical, but it costs one send.'),
 ("step", 5, B + 'EPA form and the USDA call, when convenient.</font> Neither is urgent. The USDA call may end the USDA thread for good, which is a useful outcome.'),
 ("step", 6, B + 'DOE SBIR/STTR, after September 10.</font> Batch 01, letter 2. Held deliberately until the pitch is submitted.'),
 ("step", 7, "Log every send in Outreach/OUTREACH_QUEUE.md with the date. The loop reads that file and will not write the same office twice."),
 ("step", 8, "One follow-up at 21 days if there is no reply. One only."),
 ("h1", "September 15 is the day that matters"),
 ("p", "Three things open or land on or near it: the Activate Fellowship Cohort 2027, ORNL Innovation Crossroads Cohort 2027, and the five days before the DOE Genesis Mission pitch closes on September 10. The funding loop will build for the first two on the first run after the fifteenth. Neither needs anything from you before then except the decision about whether relocating to Oak Ridge for two years is on the table, because that determines whether one of those applications is worth writing at all."),
 ("footer", "PlastiBioFuel LLC  ·  michael@plastibiofuel.com  ·  SDVOSB", CONTACT_R),
]

DOCS = {
 "01_Outreach_Brief": brief,
 "02_Outreach_Letters": letters,
 "03_Non_Email_Channels": channels,
 "04_Two_Finds": finds,
 "05_Send_Checklist": send,
}
